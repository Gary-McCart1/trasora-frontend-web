import { NotificationDto } from "@/app/types/NotificationDto";

const BASE_URL = "https://trasora-backend-e03193d24a86.herokuapp.com";

// Fetch unread notifications
export async function fetchUnreadNotifications(): Promise<NotificationDto[]> {
  const res = await fetch(`${BASE_URL}/api/notifications/unread`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch unread notifications");
  return res.json();
}

// Fetch all notifications
export async function fetchAllNotifications(): Promise<NotificationDto[]> {
  const res = await fetch(`${BASE_URL}/api/notifications`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json();
}

// Mark a single notification as read
export async function markNotificationAsRead(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/notifications/${id}/read`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to mark notification as read");
}

// Mark all notifications as read
export async function markAllNotificationsAsRead(): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/notifications/read-all`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to mark all notifications as read");
}

// Mark all except follow requests as read
export async function markAllExceptFollowRequestsAsRead(): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/notifications/read-all-except-follow`, {
    method: "POST",
    credentials: "include",
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
  const res = await fetch(`${BASE_URL}/api/follow/${followId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action }),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to handle follow notification");
}
