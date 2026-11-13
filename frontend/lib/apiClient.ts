
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  let response: Response;

  try {
    const headers = new Headers(options.headers);

    // Don't set JSON Content-Type for file uploads.
    if (
      options.body &&
      !(options.body instanceof FormData) &&
      !headers.has("Content-Type")
    ) {
      headers.set("Content-Type", "application/json");
    }

    // Attach authentication token.
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }

    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error(
      "Unable to connect to the backend. Please check whether the server is running."
    );
  }

  let result: {
    success?: boolean;
    data?: unknown;
    message?: string;
  };

  try {
    result = await response.json();
  } catch {
    throw new Error(
      `The server returned an invalid response (HTTP ${response.status}).`
    );
  }

  if (!response.ok || result.success !== true) {
    throw new Error(
      result.message || `API request failed with status ${response.status}`
    );
  }

  return result as T;
}
