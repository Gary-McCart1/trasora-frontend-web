"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllUsers } from "../lib/usersApi";

const Footer = () => {
  const [userCount, setUserCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAllUsers();
        setUserCount(data.length);
      } catch (err) {
        console.error(err);
        setUserCount(null);
      }
    };
    fetchUsers();
  }, []);

  return (
    <footer
      className="bg-zinc-950 text-zinc-400 py-8 mt-20"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="max-w-6xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Brand & Year */}
        <div className="text-center md:text-left space-y-1">
          <p className="text-sm font-semibold text-purple-400 tracking-wide">
            Trasora
          </p>
          <p className="text-xs md:text-sm">
            {" "}
            {new Date().getFullYear()} Made by Gary McCart
          </p>
        </div>

        {/* User Count */}
        {userCount !== null && (
          <div className="text-center md:text-left">
            <p className="text-sm">
              Users:{" "}
              <span className="font-semibold text-purple-400">
                {userCount.toLocaleString()}
              </span>
            </p>
          </div>
        )}

        {/* Quick Links */}
        <nav className="flex space-x-6 text-sm md:text-base">
          <Link
            href="/"
            className="hover:text-purple-400 transition"
            aria-label="Home"
          >
            Home
          </Link>
          <Link
            href="/explore"
            className="hover:text-purple-400 transition"
            aria-label="Explore"
          >
            Explore
          </Link>
          <Link
            href="/create"
            className="hover:text-purple-400 transition"
            aria-label="Create Post"
          >
            Create
          </Link>
          <Link
            href="/about"
            className="hover:text-purple-400 transition"
            aria-label="About"
          >
            About
          </Link>
          <Link
            href="/leaderboard"
            className="hover:text-purple-400 transition"
            aria-label="About"
          >
            Leaderboard
          </Link>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
