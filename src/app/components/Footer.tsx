"use client";

import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-zinc-950 text-zinc-400 md:py-8 mt-10 pb-[5rem]">
      <div className="max-w-6xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Brand & Year */}
        <div className="flex items-center text-center md:text-left space-y-1 gap-5">
          <div className= " flex items-center gap-3 text-sm font-semibold text-purple-400 tracking-wide">
            <p>Trasora </p>
            <span> · </span>
            <p>{new Date().getFullYear()}</p>
          </div>
        </div>

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
