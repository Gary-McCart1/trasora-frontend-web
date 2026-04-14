"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

const STATIC_PROFILES = [
  {
    id: 1,
    src: "/profile-pictures/1760554669748-IMG_3253.jpeg",
    alt: "User 1",
  },
  { id: 2, src: "/profile-pictures/1.png", alt: "User 2" },
  { id: 3, src: "/profile-pictures/2.png", alt: "User 3" },
  { id: 4, src: "/profile-pictures/3.png", alt: "User 4" },
  { id: 5, src: "/profile-pictures/4.png", alt: "User 5" },
  { id: 6, src: "/profile-pictures/5.png", alt: "User 6" },
];

export default function Hero() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);

  return (
    <section className="relative min-h-[75vh] flex flex-col justify-center items-center px-6 py-3 text-center overflow-hidden bg-zinc-950">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-purple-500/20 via-zinc-900 to-zinc-950" />

      {/* Background glows */}
      <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-purple-600/20 rounded-full animate-pulse-slow opacity-50" />
      <div className="absolute bottom-[5%] right-[-5%] w-[25%] h-[25%] bg-blue-600/20 rounded-full animate-pulse-slow opacity-50" />

      <div className="relative z-10 max-w-4xl">
        {/* Profile images */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="flex -space-x-3 overflow-hidden p-1">
            {STATIC_PROFILES.map((profile, index) => (
              <div
                key={profile.id}
                className="relative animate-slide-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <Image
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-zinc-800/50 shadow-xl"
                  src={profile.src}
                  alt={profile.alt}
                  width={50}
                  height={50}
                  quality={40}
                  sizes="50px"
                  loading="lazy"
                />
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center gap-1">
            <div className="flex text-purple-400 text-[10px] tracking-widest">
              {"★★★★★".split("").map((star, i) => (
                <span key={i}>{star}</span>
              ))}
            </div>
            <p className="text-zinc-300 text-[12px] font-semibold uppercase tracking-tighter">
              Trusted by music lovers
            </p>
          </div>
        </div>

        {/* Hero text */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight mb-6">
          Share music.
          <br />
          Discover new tracks.
          <br />
          <span className="text-purple-400">Connect through sound.</span>
        </h1>

        <p className="max-w-xl mx-auto text-lg md:text-xl text-zinc-400 mb-10 leading-relaxed">
          Trasora is a social music platform designed for sharing songs,
          discovering new artists, and building playlists with your friends.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {/* App Store Button (always visible) */}
          <a
            href="https://apps.apple.com/us/app/trasora/id6753359214"
            target="_blank"
            rel="noopener noreferrer"
            className={`w-full sm:w-auto px-10 py-4 font-semibold rounded-xl flex items-center justify-center gap-3 transition-all
      ${
        isMobile
          ? "bg-black text-white hover:bg-zinc-800"
          : "bg-zinc-900 text-zinc-300 border border-purple-800 hover:bg-zinc-800 hover:text-white"
      }`}
          >
            {/* Apple Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M16.365 1.43c0 1.14-.464 2.222-1.288 3.046-.854.854-2.23 1.512-3.446 1.412-.154-1.14.464-2.345 1.258-3.139.854-.854 2.345-1.482 3.476-1.319zm3.225 16.873c-.62 1.43-1.38 2.844-2.59 2.874-1.2.03-1.586-.72-2.96-.72-1.374 0-1.8.69-2.96.75-1.18.06-2.08-1.5-2.7-2.93-1.35-3.06-2.38-8.63.99-10.9 1.67-1.14 3.5-.93 4.6-.36 1.15.57 2.2.54 3.7 0 1.42-.57 3.06-.41 4.3.33-3.77 2.29-3.16 7.73.56 10.95z" />
            </svg>
            Download App
          </a>

          {/* Web CTA */}
          <Link
            href="/signup"
            className="w-full sm:w-auto px-10 py-4 bg-purple-600 text-white font-semibold rounded-xl transition-all duration-200 hover:bg-purple-500 hover:shadow-lg hover:shadow-purple-500/20 active:scale-95"
          >
            Continue on Web
          </Link>

          {/* Demo */}
        </div>
        <div className="mt-6">
          <Link
            href="/demo"
            className="inline-flex items-center gap-3 px-6 py-3 text-zinc-300 font-semibold rounded-full border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm transition-all hover:bg-zinc-800 hover:text-white hover:border-zinc-700"
          >
            {/* Play Icon */}
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 ml-[2px]" // slight nudge for visual centering
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
            See how it works
          </Link>
        </div>
        {/* Footer text */}
        <div className="mt-12 flex items-center justify-center gap-3">
          <p className="text-xs uppercase tracking-widest text-zinc-500 font-medium">
            Join the community today
          </p>
          <span className="text-zinc-500 font-bold">·</span>
          <p className="text-xs uppercase tracking-widest text-zinc-500 font-medium">
            Free
          </p>
        </div>
      </div>
    </section>
  );
}
