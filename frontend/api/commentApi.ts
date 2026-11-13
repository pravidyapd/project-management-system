
import { apiRequest } from "@/lib/apiClient";
import type { ApiResponse } from "@/types/apiTypes";

export interface Comment {
  id: number;
  content: string;
  taskId: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    name: string;
  };
}

export const getComments = async (
  taskId: number
): Promise<ApiResponse<Comment[]>> => {
  return apiRequest(`/comments/${taskId}`);
};

export const createComment = async (
  taskId: number,
  content: string
): Promise<ApiResponse<Comment>> => {
  return apiRequest(`/comments/${taskId}`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
};

export const deleteComment = async (
  taskId: number,
  commentId: number
): Promise<ApiResponse<null>> => {
  return apiRequest(`/comments/${taskId}/${commentId}`, {
    method: "DELETE",
  });
};
