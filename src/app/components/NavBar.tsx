"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Menu, X, Bell, PlusCircle, Compass } from "lucide-react";
import SearchBar from "./SearchBar";
import { useAuth } from "../context/AuthContext";
import { User } from "../types/User";
import { getUser } from "../lib/usersApi";
import { fetchUnreadNotifications } from "../lib/notificationApi";

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

  const handleProtectedRoute = (path: string) => {
    if (!user) router.push("/login");
    else router.push(path);
  };

  if (loading) {
    return (
      <nav className="bg-zinc-950 text-white  px-4 py-2">
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
    <nav className="bg-zinc-950 text-white shadow-md px-4 py-5 md:py-2 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex-shrink-0 z-10">
          <button onClick={() => router.push("/")}>
            <Image
              src="/trasora.png"
              width={150}
              height={200}
              alt="Dreamr Logo"
              className="h-auto w-auto"
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

        {/* Mobile Hamburger */}
        <button onClick={() => setIsOpen(!isOpen)} className="xl:hidden z-20">
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="xl:hidden mt-4 space-y-4">
          <ul className="space-y-2">
            {user &&
              navItems.map((item) => (
                <li key={item.name}>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      item.protected
                        ? handleProtectedRoute(item.path)
                        : router.push(item.path);
                    }}
                    className="flex items-center gap-2 w-full text-left py-2 px-4 rounded hover:bg-zinc-800 transition"
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
                className="flex items-center hover:bg-zinc-800 rounded  focus:outline-none focus:ring-2 focus:ring-purple-400 transition h-8 mb-3"
                aria-label="Profile"
                onClick={() => setIsOpen(false)}
              >
                <div className="relative w-6 h-6 rounded-full overflow-hidden ml-4">
                  <Image
                    src={getS3Url(profileUser?.profilePictureUrl)}
                    alt={`${user.username}'s profile`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
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
          <div className="px-4">
            <SearchBar />
          </div>
        </div>
      )}
    </nav>
  );
}
