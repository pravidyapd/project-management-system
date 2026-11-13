
import { apiRequest } from "@/lib/apiClient";
import type { ApiResponse } from "@/types/apiTypes";

export interface Project {
  id: number;
  name: string;
  description?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

// Get all projects
export const getProjects = () =>
  apiRequest<ApiResponse<Project[]>>("/projects");

// Get project by ID
export const getProjectById = (id: number) =>
  apiRequest<ApiResponse<Project>>(`/projects/${id}`);

// Create project
export const createProject = (data: {
  name: string;
  description?: string;
  status?: string;
}) =>
  apiRequest<ApiResponse<Project>>("/projects", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Update project
export const updateProject = (
  id: number,
  data: Partial<Project>
) =>
  apiRequest<ApiResponse<Project>>(`/projects/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

// Delete project
export const deleteProject = (id: number) =>
  apiRequest<ApiResponse<null>>(`/projects/${id}`, {
    method: "DELETE",
  });
