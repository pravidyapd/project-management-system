
import { apiRequest } from "@/lib/apiClient";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: AuthUser;
}

// Register
export const registerUser = (data: {
  name: string;
  email: string;
  password: string;
}) =>
  apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Login
export const loginUser = (data: {
  email: string;
  password: string;
}) =>
  apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Google Login
export const googleLogin = (idToken: string) =>
  apiRequest<AuthResponse>("/auth/google", {
    method: "POST",
    body: JSON.stringify({ idToken }),
  });
