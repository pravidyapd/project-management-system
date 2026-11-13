
import { apiRequest } from "@/lib/apiClient";
import type { ApiResponse } from "@/types/apiTypes";

export interface Notification {
  id: number;
  title: string;
  description: string;
  type: "task" | "project" | "reminder" | "system";
  read: boolean;
  createdAt: string;
}

// Get all notifications
export const getNotifications = () =>
  apiRequest<ApiResponse<Notification[]>>("/notifications");

// Create notification
export const createNotification = (data: {
  title: string;
  description: string;
  type?: Notification["type"];
}) =>
  apiRequest<ApiResponse<Notification>>("/notifications", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Mark notification as read
export const markNotificationAsRead = (id: number) =>
  apiRequest<ApiResponse<Notification>>(`/notifications/${id}/read`, {
    method: "PUT",
  });

// Delete notification
export const deleteNotification = (id: number) =>
  apiRequest<ApiResponse<null>>(`/notifications/${id}`, {
    method: "DELETE",
  });
