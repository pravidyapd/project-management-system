
import { apiRequest } from "@/lib/apiClient";
import type { ApiResponse } from "@/types/apiTypes";

export interface TaskAttachment {
  id: number;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  taskId: number;
  createdAt: string;
}

export const getAttachments = async (
  taskId: number
): Promise<ApiResponse<TaskAttachment[]>> => {
  return apiRequest(`/attachments/${taskId}`);
};

export const uploadAttachment = async (
  taskId: number,
  file: File
): Promise<ApiResponse<TaskAttachment>> => {
  const formData = new FormData();
  formData.append("file", file);

  return apiRequest(`/attachments/${taskId}`, {
    method: "POST",
    body: formData,
  });
};

export const deleteAttachment = async (
  taskId: number,
  attachmentId: number
): Promise<ApiResponse<null>> => {
  return apiRequest(`/attachments/${taskId}/${attachmentId}`, {
    method: "DELETE",
  });
};

export const downloadAttachment = async (
  taskId: number,
  attachmentId: number,
  fileName: string
): Promise<void> => {
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE_URL}/attachments/${taskId}/${attachmentId}/download`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Unable to download attachment.");
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
};
