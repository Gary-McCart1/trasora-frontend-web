import { NotificationDto } from "@/app/types/NotificationDto";
import { getAuthHeaders } from "./usersApi";

const BASE_URL = "https://trasora-backend-e03193d24a86.herokuapp.com";

// Fetch unread notifications
export async function fetchUnreadNotifications(): Promise<NotificationDto[]> {
  const res = await fetch(`${BASE_URL}/api/notifications/unread`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch unread notifications");
  return res.json();
}

// Fetch all notifications
export async function fetchAllNotifications(): Promise<NotificationDto[]> {
  const res = await fetch(`${BASE_URL}/api/notifications`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json();
}

// Mark a single notification as read
export async function markNotificationAsRead(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/notifications/${id}/read`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to mark notification as read");
}

// Mark all notifications as read
export async function markAllNotificationsAsRead(): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/notifications/read-all`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to mark all notifications as read");
}

// Mark all except follow requests as read
export async function markAllExceptFollowRequestsAsRead(): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/notifications/read-all-except-follow`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok)
    throw new Error(
      "Failed to mark notifications as read except follow requests"
    );
}

// Handle follow notification (accept/reject)
export async function handleFollowNotification(
    followId: number,
    action: "accept" | "reject"
  ): Promise<void> {
    const url = `${BASE_URL}/api/follow/${followId}/${action}`; // append action to path
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    });
    if (!res.ok) throw new Error("Failed to handle follow notification");
  }
  