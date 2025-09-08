"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Heart,
  MessageCircle,
  UserPlus,
  UserCheck,
  UserX,
  Bell,
  GitBranch,
  Music,
} from "lucide-react";
import { NotificationDto } from "../types/NotificationDto";
import getS3Url from "../utils/S3Url";
import {
  fetchUnreadNotifications,
  handleFollowNotification,
  markAllExceptFollowRequestsAsRead,
} from "../lib/notificationApi";
import { getUser } from "../lib/usersApi";

type UserProfileMap = Record<string, string | null>;

export default function NotificationsList() {
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [userProfiles, setUserProfiles] = useState<UserProfileMap>({});

  useEffect(() => {
    fetchUnreadNotifications().then(setNotifications);
  }, []);

  // Fetch profile pictures for all unique senders
  useEffect(() => {
    const usernames = Array.from(new Set(notifications.map((n) => n.senderUsername)));
    usernames.forEach(async (username) => {
      if (!userProfiles[username]) {
        try {
          const user = await getUser(username);
          setUserProfiles((prev) => ({
            ...prev,
            [username]: user.profilePictureUrl || null,
          }));
        } catch (err) {
          console.error(`Failed to fetch user ${username}`, err);
        }
      }
    });
  }, [notifications, userProfiles]);

  useEffect(() => {
    const handleLeave = async () => {
      try {
        await markAllExceptFollowRequestsAsRead();
      } catch (err) {
        console.error("Failed to mark notifications as read", err);
      }
    };

    // Listen for page unload or visibility change
    window.addEventListener("beforeunload", handleLeave);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") handleLeave();
    });

    return () => {
      window.removeEventListener("beforeunload", handleLeave);
      document.removeEventListener("visibilitychange", handleLeave);
    };
  }, []);

  const handleFollowAction = async (
    followId: number,
    action: "accept" | "reject",
    notificationId: number
  ) => {
    try {
      await handleFollowNotification(followId, action);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch {
      // error already logged
    }
  };

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "like": return <Heart className="w-4 h-4 text-pink-500" />;
      case "comment": return <MessageCircle className="w-4 h-4 text-blue-400" />;
      case "follow": return <UserPlus className="w-4 h-4 text-green-400" />;
      case "follow_request": return <UserPlus className="w-4 h-4 text-yellow-400" />;
      case "follow_accepted": return <UserCheck className="w-4 h-4 text-green-400" />;
      case "branch_added": return <GitBranch className="w-4 h-4 text-emerald-400" />;
      default: return null;
    }
  };

  const timeAgo = (dateStr: string) => {
    const now = new Date();
    const then = new Date(dateStr);
  
    // prevent negative times
    let seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
    if (seconds < 0) seconds = 0;
  
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
  
    // for anything older than a week, show full date
    return then.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };
  

  const getDateGroup = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return "Earlier";
  };

  const groupedNotifications = notifications.reduce(
    (groups: Record<string, NotificationDto[]>, notif) => {
      const group = getDateGroup(notif.createdAt);
      if (!groups[group]) groups[group] = [];
      groups[group].push(notif);
      return groups;
    },
    {}
  );

  return (
    <section className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-center gap-2 mb-6">
        <div className="bg-purple-700 p-2 rounded-full">
          <Bell className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-2xl font-bold">Your Notifications</h2>
      </div>

      {notifications.length === 0 ? (
        <p className="text-gray-400 text-center mt-8 text-sm">
          No unread notifications
        </p>
      ) : (
        <div className="space-y-6 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600">
          {Object.entries(groupedNotifications).map(([group, items]) => (
            <div key={group}>
              <h3 className="text-sm font-semibold text-gray-400 mb-2">{group}</h3>
              <ul className="space-y-3">
                {items.map((n) => {
                  const isBranch = n.type.toLowerCase() === "branch_added";
                  const profilePicUrl =
                    getS3Url(userProfiles[n.senderUsername]) || n.albumArtUrl || "/default-avatar.png";

                  return (
                    <li
                      key={n.id}
                      className={`flex items-center justify-between p-4 rounded-lg border transition ${
                        isBranch
                          ? "bg-emerald-950 border-emerald-700 hover:border-emerald-500"
                          : "bg-gray-900 border-gray-700 hover:border-indigo-500"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Link href={`/profile/${n.senderUsername}`}>
                          <img
                            src={profilePicUrl}
                            alt={`${n.senderUsername} avatar`}
                            className={`w-10 h-10 min-w-[40px] rounded-full object-cover border transition ${
                              isBranch
                                ? "border-emerald-600 hover:border-emerald-400"
                                : "border-gray-700 hover:border-indigo-500"
                            }`}
                          />
                        </Link>

                        <div className="flex flex-col min-w-0">
                          <p
                            className={`text-sm flex items-center gap-1 truncate ${
                              isBranch ? "text-emerald-300" : ""
                            }`}
                          >
                            {getIcon(n.type)}
                            <Link
                              href={`/profile/${n.senderUsername}`}
                              className="font-semibold hover:underline"
                            >
                              {n.senderUsername}
                            </Link>

                            {n.type.toLowerCase() === "like" &&
                              " liked your post"}
                            {n.type.toLowerCase() === "comment" &&
                              " commented on your post"}
                            {n.type.toLowerCase() === "follow" &&
                              " started following you"}
                            {n.type.toLowerCase() === "follow_request" &&
                              " wants to follow you"}
                            {n.type.toLowerCase() === "follow_accepted" &&
                              " accepted your follow request"}

                            {isBranch && (
                              <>
                                {" added a branch to your "}
                                <span className="font-semibold">{n.trunkName}</span>
                                {" trunk "}
                                <Link
                                  href={`/profile/${n.recipientUsername}`}
                                  className="text-emerald-400 hover:underline px-5"
                                >
                                  View
                                </Link>
                              </>
                            )}
                          </p>

                          {isBranch && (n.songTitle || n.songArtist) && (
                            <div className="mt-1 text-xs text-gray-400 flex items-center gap-2">
                              <div className="flex flex-col truncate">
                                <span className="flex items-center gap-1 truncate">
                                  <Music className="w-3 h-3 text-emerald-400" />
                                  <span className="truncate">
                                    {n.songTitle}{" "}
                                    {n.songArtist && `— ${n.songArtist}`}
                                  </span>
                                </span>
                              </div>
                            </div>
                          )}

                          {n.type === "FOLLOW_REQUEST" && n.followId && (
                            <div className="mt-1 flex gap-2">
                              <button
                                onClick={() =>
                                  handleFollowAction(n.followId!, "accept", n.id)
                                }
                                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-full text-xs flex items-center gap-1"
                              >
                                <UserCheck className="w-3 h-3" /> Accept
                              </button>
                              <button
                                onClick={() =>
                                  handleFollowAction(n.followId!, "reject", n.id)
                                }
                                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs flex items-center gap-1"
                              >
                                <UserX className="w-3 h-3" /> Decline
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <span className="ml-4 text-xs text-gray-500 select-none">
                        {timeAgo(n.createdAt)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
