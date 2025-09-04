"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export interface TrackOrAlbum {
  id: string;
  name: string;
  artists?: { name: string }[];
  album?: {
    images?: { url: string }[];
    release_date?: string;
    total_tracks?: number;
    artists?: { name: string }[];
  };
  images?: { url: string }[];
  release_date?: string;
  total_tracks?: number;
}

interface TrackCardGridProps {
  title: string;
  items: TrackOrAlbum[];
  onClick: (track: TrackOrAlbum) => void;
  initiallyOpen?: boolean;
  loading?: boolean;
}

export default function TrackCardGrid({
  title,
  items,
  onClick,
  initiallyOpen = true,
  loading = false,
}: TrackCardGridProps) {
  const [isOpen, setIsOpen] = useState(initiallyOpen);

  const cardStyle =
    "relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-transform duration-300 transform hover:scale-105 cursor-pointer bg-gradient-to-br from-zinc-900 to-zinc-800";

  const overlayStyle =
    "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 sm:p-4 text-white";

  const SkeletonCard = () => (
    <div className={cardStyle + " animate-pulse"}>
      <div className="w-full h-40 sm:h-64 bg-zinc-700 rounded-t-2xl"></div>
      <div className="p-3 space-y-2">
        <div className="h-4 bg-zinc-600 rounded w-3/4"></div>
        <div className="h-3 bg-zinc-600 rounded w-1/2"></div>
      </div>
    </div>
  );

  return (
    <section className="mb-12 sm:mb-16">
      <div
        className="flex justify-between items-center cursor-pointer mb-4 sm:mb-6"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <h2 className="text-xl sm:text-3xl font-bold text-purple-400 drop-shadow-md">
          {title}
        </h2>
        {isOpen ? (
          <ChevronUp className="text-purple-400" />
        ) : (
          <ChevronDown className="text-purple-400" />
        )}
      </div>

      {isOpen && (
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : items.length > 0
            ? items.map((item, idx) => {
                const image =
                  item.images?.[0]?.url ||
                  item.album?.images?.[0]?.url ||
                  "/default-album-cover.png";

                const artistNames =
                  item.artists?.map((a) => a.name).join(", ") ||
                  item.album?.artists?.map((a) => a.name).join(", ") ||
                  "Unknown Artist";

                const release =
                  item.release_date || item.album?.release_date || "";

                // Make key unique
                const uniqueKey = `${item.id}-${item.album ? "album" : "track"}-${idx}`;

                return (
                  <div
                    key={uniqueKey}
                    className={cardStyle}
                    onClick={() => onClick(item)}
                  >
                    <Image
                      src={image}
                      alt={item.name}
                      width={400}
                      height={400}
                      className="w-full h-40 sm:h-64 object-cover"
                    />
                    <div className={overlayStyle}>
                      <p className="font-bold text-sm sm:text-lg truncate">
                        {item.name}
                      </p>
                      <p className="text-xs sm:text-sm opacity-80 truncate">
                        {artistNames}
                      </p>
                      {/* Hide release date on mobile */}
                      <p className="hidden sm:block text-sm opacity-80 mt-1">
                        Released: {release}
                      </p>
                    </div>
                  </div>
                );
              })
            : (
              <p className="text-center text-purple-200 text-sm sm:text-lg col-span-full">
                No items available.
              </p>
            )}
        </div>
      )}
    </section>
  );
}
