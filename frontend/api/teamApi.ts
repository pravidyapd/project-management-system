
import { apiRequest } from "@/lib/apiClient";
import type { ApiResponse } from "@/types/apiTypes";

export interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

// Get all team members
export const getTeamMembers = () =>
  apiRequest<ApiResponse<TeamMember[]>>("/team");

// Get team member by ID
export const getTeamMemberById = (id: number) =>
  apiRequest<ApiResponse<TeamMember>>(`/team/${id}`);

// Add team member
export const createTeamMember = (data: {
  name: string;
  email: string;
  role?: string;
}) =>
  apiRequest<ApiResponse<TeamMember>>("/team", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Update team member
export const updateTeamMember = (
  id: number,
  data: Partial<TeamMember>
) =>
  apiRequest<ApiResponse<TeamMember>>(`/team/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

// Delete team member
export const deleteTeamMember = (id: number) =>
  apiRequest<ApiResponse<null>>(`/team/${id}`, {
    method: "DELETE",
  });
