"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { X, Bell, PlusCircle, Compass } from "lucide-react";
import SearchBar from "./SearchBar";
import { useAuth } from "../context/AuthContext";
import { User } from "../types/User";
import { getUser } from "../lib/usersApi";
import { fetchUnreadNotifications } from "../lib/notificationApi";
import { IoSettingsOutline } from "react-icons/io5";
import { LuLightbulb, LuScale, LuMessageCircleQuestion, LuTrophy } from "react-icons/lu";

const getS3Url = (key?: string | null) =>
  key
    ? `https://dreamr-user-content.s3.amazonaws.com/${key}`
    : "/default-profilepic.png";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Fetch user profile
  useEffect(() => {
    if (user?.username) {
      getUser(user.username).then(setProfileUser).catch(console.error);
    }
  }, [user?.username]);

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

  // Clear badge on notifications page
  useEffect(() => {
    if (pathname === "/notifications") setUnreadCount(0);
  }, [pathname]);

  const navItems = [
    {
      name: "Explore",
      path: "/explore",
      icon: <Compass className="w-5 h-5" />,
      protected: false,
    },
    {
      name: "Notifications",
      path: "/notifications",
      icon: <Bell className="w-5 h-5" />,
      protected: true,
    },
    {
      name: "Create",
      path: "/create",
      icon: <PlusCircle className="w-5 h-5" />,
      protected: true,
    },
  ];

  const navItemsMobile = [
    {
      name: "Leaderboard",
      path: "/leaderboard",
      icon: <LuTrophy className="w-5 h-5" />,
      protected: false,
    },
    {
      name: "About",
      path: "/about",
      icon: <LuLightbulb className="w-5 h-5" />,
      protected: false,
    },
    {
      name: "Support",
      path: "/support",
      icon: <LuMessageCircleQuestion className="w-5 h-5" />,
      protected: true,
    },
    {
      name: "Terms of Service",
      path: "/terms-of-use",
      icon: <LuScale className="w-5 h-5" />,
      protected: true,
    },
  ];

  const handleProtectedRoute = (path: string) => {
    if (!user) router.push("/login");
    else router.push(path);
  };

  if (loading) {
    return (
      <nav className="bg-zinc-950 text-white px-4 py-2 ">
        <div className="flex items-center justify-between">
          <Image
            src="/trasora.png"
            width={150}
            height={200}
            alt="Logo"
            className="h-auto w-auto"
          />
          <div className="hidden md:flex items-center space-x-6">
            <div className="w-64 h-6 bg-zinc-700 rounded animate-pulse" />
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-6 bg-zinc-700 rounded animate-pulse" />
            <div className="w-20 h-6 bg-zinc-700 rounded animate-pulse" />
            <div className="w-6 h-6 bg-zinc-700 rounded-full animate-pulse" />
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-zinc-950 text-white shadow-md px-4 sticky top-0 z-50 md:pt-2 ">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex-shrink-0 z-10">
          <button onClick={() => router.push("/")}>
            <Image
              src="/trasora.png"
              width={200}
              height={200}
              alt="Dreamr Logo"
            />
          </button>
        </div>

        {/* Search Bar */}
        <div className="hidden xl:flex flex-grow px-16 mb-3">
          <SearchBar />
        </div>

        {/* Desktop Nav */}
        <div className="hidden xl:flex items-center space-x-6 z-10">
          {user &&
            navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <button
                  key={item.name}
                  onClick={() => handleProtectedRoute(item.path)}
                  className={clsx(
                    "relative group flex items-center gap-2 pb-3 focus:outline-none h-8",
                    isActive
                      ? "text-purple-400 font-semibold"
                      : "text-zinc-300 hover:text-purple-400"
                  )}
                >
                  <div className="relative">
                    {React.cloneElement(item.icon, {
                      className: "w-5 h-5 block",
                    })}
                    {item.name === "Notifications" && unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </div>
                  <span className="text-sm leading-none">{item.name}</span>
                  <span
                    className={clsx(
                      "absolute left-0 bottom-0 h-[2px] bg-purple-400 transition-all duration-200",
                      isActive ? "w-full" : "w-0 group-hover:w-full"
                    )}
                  />
                </button>
              );
            })}

          {user ? (
            // Desktop profile pic
            <Link
              href={`/profile/${user.username}`}
              className="flex items-center rounded-full overflow-hidden border border-transparent hover:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition h-8 mb-3"
              aria-label="Profile"
            >
              <div className="relative w-8 h-8 rounded-full overflow-hidden">
                <Image
                  src={getS3Url(profileUser?.profilePictureUrl)}
                  alt={`${user.username}'s profile`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </Link>
          ) : (
            <div className="flex items-center space-x-4 h-8 mb-3">
              <Link
                href="/login"
                className="text-zinc-300 hover:text-purple-400 text-sm font-medium leading-none flex items-center h-full"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="bg-purple-600 px-4 py-1 rounded text-white font-semibold hover:bg-purple-700 transition text-sm flex items-center h-full"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="xl:hidden z-20 flex flex-col justify-center items-center gap-1"
        >
          {isOpen ? (
            <X size={28} />
          ) : user ? (
            <IoSettingsOutline size={20} />
          ) : (
            <>
              <span className="block w-5 h-[2px] bg-white rounded" />
              <span className="block w-5 h-[2px] bg-white rounded" />
              <span className="block w-5 h-[2px] bg-white rounded" />
            </>
          )}
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="xl:hidden mt-4 space-y-4">
          <ul className="space-y-2">
            {user &&
              navItemsMobile.map((item) => (
                <li key={item.name}>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      item.protected
                        ? handleProtectedRoute(item.path)
                        : router.push(item.path);
                    }}
                    className="flex items-center gap-2 w-full text-left h-12 px-4 rounded hover:bg-zinc-800 transition"
                  >
                    {item.icon}
                    <span>{item.name}</span>
                    {item.name === "Notifications" && unreadCount > 0 && (
                      <span className="ml-2 bg-red-500 text-white text-xs px-1 rounded-full">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            {user ? (
              // Desktop profile pic
              <Link
                href={`/profile/${user.username}`}
                className="flex items-center h-12 px-4 hover:bg-zinc-800 rounded focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                aria-label="Profile"
                onClick={() => setIsOpen(false)}
              >
                {/* Gradient Border Avatar */}
                <div className="relative p-[2px] rounded-full bg-gradient-to-tr from-purple-500 via-purple-400 to-pink-500">
                  <div className="relative w-6 h-6 rounded-full overflow-hidden">
                    <Image
                      src={getS3Url(profileUser?.profilePictureUrl)}
                      alt={`${user.username}'s profile`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                </div>

                <span className="text-sm ml-2">{user.username}</span>
              </Link>
            ) : (
              <div className="flex items-center space-x-4 h-8 mb-3">
                <Link
                  href="/login"
                  className="text-zinc-300 hover:text-purple-400 text-sm font-medium leading-none flex items-center h-full"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="bg-purple-600 px-4 py-1 rounded text-white font-semibold hover:bg-purple-700 transition text-sm flex items-center h-full"
                >
                  Sign up
                </Link>
              </div>
            )}
          </ul>
          <div className="hidden xl:display px-4">
            <SearchBar />
          </div>
        </div>
      )}
    </nav>
  );
}
