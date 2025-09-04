"use client";

import { motion } from "framer-motion";

export default function PostSkeleton({ large = false }: { large?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`rounded-3xl shadow-lg relative mt-12 bg-opacity-10 backdrop-blur-sm
        ${large ? "max-w-lg" : "max-w-md"} w-full animate-pulse`}
    >
      {/* Image / Album Art */}
      <div
        className="relative w-full h-[450px] bg-zinc-800 rounded-b-lg mt-4"
        style={{
          paddingBottom: large ? "calc(100% + 100px)" : "calc(100% + 90px)",
        }}
      />

      {/* Music Player Header (fake Spotify bar) */}
      <div
        className="absolute top-[-60px] left-1/2 transform -translate-x-1/2 w-full h-[85px] 
          rounded-t-xl backdrop-blur-md border flex items-center px-4 gap-4 bg-zinc-800 border-zinc-700"
      >
        {/* Album art placeholder */}
        <div className="w-14 h-14 bg-zinc-700 rounded-md" />

        {/* Track text */}
        <div className="flex flex-col flex-1 gap-2 overflow-hidden">
          <div className="h-3 w-2/3 bg-zinc-700 rounded" />
          <div className="h-3 w-1/3 bg-zinc-700 rounded" />
        </div>

        {/* Play button placeholder */}
        <div className="ml-auto h-10 w-10 bg-zinc-700 rounded-full" />
      </div>

      {/* Post actions placeholder */}
      <div className="p-4 flex flex-col gap-4">
        {/* Caption lines */}
        <div className="h-3 bg-zinc-700 rounded w-full" />
        <div className="h-3 bg-zinc-700 rounded w-5/6" />

        {/* Buttons row */}
        <div className="flex space-x-4 pt-2">
          <div className="h-6 w-12 bg-zinc-700 rounded" />
          <div className="h-6 w-12 bg-zinc-700 rounded" />
        </div>
      </div>
    </motion.div>
  );
}
