"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { AiFillHome } from "react-icons/ai";
import { LuCircleUser } from "react-icons/lu";
import { useAuth } from "../context/AuthContext";
import { FiPlus } from "react-icons/fi";
import { IoNotificationsOutline } from "react-icons/io5";
import { FaRegCompass } from "react-icons/fa";
import { fetchUnreadNotifications } from "../lib/notificationApi";

const FooterNav = () => {
  const { user, loading } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Fetch unread notifications & poll
  useEffect(() => {
    if (!user) return;

    const fetchCount = async () => {
      try {
        const notifications = await fetchUnreadNotifications();
        setUnreadCount(notifications.length);
      } catch (err) {
        console.error("Failed to fetch unread notifications:", err);
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const baseIcon =
    "flex flex-col items-center justify-center w-12 h-12 text-2xl transition-all";

  // ✅ Loading State (pulse placeholders)
  if (loading) {
    return (
      <div className="bg-zinc-950 bottom-0 sticky h-[5rem] z-[50] xl:hidden shadow-[0_-4px_10px_rgba(0,0,0,0.5)]">
        <ul className="flex justify-around items-center h-full text-white">
          <div className="w-12 h-12 bg-zinc-700 rounded-lg animate-pulse" />
          <div className="w-12 h-12 bg-zinc-700 rounded-lg animate-pulse" />
          <div className="w-16 h-16 bg-zinc-700 rounded-full animate-pulse -mt-6" />
          <div className="w-12 h-12 bg-zinc-700 rounded-lg animate-pulse" />
          <div className="w-12 h-12 bg-zinc-700 rounded-lg animate-pulse" />
        </ul>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 bottom-0 sticky h-[5rem] z-[50] xl:hidden shadow-[0_-4px_10px_rgba(0,0,0,0.5)]">
      <ul className="flex justify-around items-center h-full text-white">
        <Link href="/" className={`${baseIcon} hover:text-purple-500`}>
          <AiFillHome />
        </Link>

        <Link href="/explore" className={`${baseIcon} hover:text-purple-500`}>
          <FaRegCompass />
        </Link>

        <Link
          href="/create"
          className="
            flex justify-center items-center
            h-16 w-16
            rounded-full
            bg-gradient-to-r from-purple-700 to-pink-700
            text-white
            text-3xl
            shadow-lg shadow-purple-500/50
            -mt-10
            transition-all
            hover:scale-110 hover:shadow-xl
          "
        >
          <FiPlus />
        </Link>

        <Link href="/notifications" className={`${baseIcon} relative hover:text-purple-500`}>
          <IoNotificationsOutline />
          {unreadCount > 0 && (
            <span
              className="
                absolute top-2 right-3
                w-3 h-3
                bg-red-500
                rounded-full
                border-2 border-zinc-950
              "
            ></span>
          )}
        </Link>

        <Link href={`/profile/${user?.username}`} className={`${baseIcon} hover:text-purple-500`}>
          <LuCircleUser />
        </Link>
      </ul>
    </div>
  );
};

export default FooterNav;
