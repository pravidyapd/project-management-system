
import { apiRequest } from "@/lib/apiClient";
import type { ApiResponse } from "@/types/apiTypes";

export type TaskPriority = "Low" | "Medium" | "High";

export interface TaskAssignee {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority: TaskPriority;
  dueDate?: string;
  projectId: number;
  assigneeId?: number | null;
  assignee?: TaskAssignee | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskInput {
  title: string;
  description?: string;
  status?: string;
  priority?: TaskPriority;
  dueDate?: string;
  projectId: number;
  assigneeId?: number | null;
}

// Get all tasks
export const getTasks = () =>
  apiRequest<ApiResponse<Task[]>>("/tasks");

// Get task by ID
export const getTaskById = (id: number) =>
  apiRequest<ApiResponse<Task>>(`/tasks/${id}`);

// Create task
export const createTask = (data: TaskInput) =>
  apiRequest<ApiResponse<Task>>("/tasks", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Update task
export const updateTask = (
  id: number,
  data: Partial<TaskInput>
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
