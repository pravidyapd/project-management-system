
import { apiRequest } from "@/lib/apiClient";
import type { ApiResponse } from "@/types/apiTypes";

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: string;
  dueDate?: string;
  projectId: number;
  createdAt?: string;
  updatedAt?: string;
}

// Get all tasks
export const getTasks = () =>
  apiRequest<ApiResponse<Task[]>>("/tasks");

// Get task by ID
export const getTaskById = (id: number) =>
  apiRequest<ApiResponse<Task>>(`/tasks/${id}`);

// Create task
export const createTask = (data: {
  title: string;
  description?: string;
  status?: string;
  dueDate?: string;
  projectId: number;
}) =>
  apiRequest<ApiResponse<Task>>("/tasks", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Update task
export const updateTask = (
  id: number,
  data: Partial<Task>
) =>
  apiRequest<ApiResponse<Task>>(`/tasks/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

// Delete task
export const deleteTask = (id: number) =>
  apiRequest<ApiResponse<null>>(`/tasks/${id}`, {
    method: "DELETE",
  });
