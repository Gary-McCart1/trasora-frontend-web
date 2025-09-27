"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Trunk, Branch } from "../types/User";
import { HiOutlineCollection } from "react-icons/hi";

interface TrunkItemProps {
  trunk: Trunk;
  branches: Branch[];
  selectedSong: {
    trackId: string;
    title: string;
    artist: string;
    albumArtUrl: string;
  };
  loadedImages: Record<number, Record<number, boolean>>;
  clickDisabled: Record<number, boolean>;
  windowWidth: number;
  coverSize: number;
  offset: number;
  hoverOffset: number;
  onSelectTrunk: (song: TrunkItemProps["selectedSong"], trunkId: number) => void;
  handleImageLoad: (trunkId: number, branchId: number) => void;
  setLoadedImages: React.Dispatch<React.SetStateAction<Record<number, Record<number, boolean>>>>;
}

export default function TrunkItem({
  trunk,
  branches,
  selectedSong,
  loadedImages,
  clickDisabled,
  windowWidth,
  coverSize,
  offset,
  hoverOffset,
  onSelectTrunk,
  handleImageLoad,
  setLoadedImages,
}: TrunkItemProps) {
  const [hovered, setHovered] = useState(false);
  const [touchStartPos, setTouchStartPos] = useState<{ x: number; y: number } | null>(null);
  const isClickDisabled = clickDisabled[trunk.id];
  const visibleBranches = branches.slice(0, 3);

  // Handle touch start for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isClickDisabled) return;
    const touch = e.touches[0];
    setTouchStartPos({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isClickDisabled || !touchStartPos) return;

    const touch = e.changedTouches[0];
    const deltaX = Math.abs(touch.clientX - touchStartPos.x);
    const deltaY = Math.abs(touch.clientY - touchStartPos.y);

    if (deltaX < 10 && deltaY < 10) {
      e.preventDefault();
      e.stopPropagation();
      onSelectTrunk(selectedSong, trunk.id);
    }

    setTouchStartPos(null);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isClickDisabled) return;
    if (e.detail === 0) return; // Ignore converted touch events
    onSelectTrunk(selectedSong, trunk.id);
  };

  return (
    <li
      className={`flex items-center justify-between p-2 bg-zinc-800 rounded transition-colors ${
        isClickDisabled
          ? "opacity-70 cursor-wait"
          : "hover:bg-purple-700 cursor-pointer"
      }`}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => !isClickDisabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        minHeight: `${coverSize + 16}px`,
        touchAction: "manipulation",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="relative flex-shrink-0"
          style={{
            width: coverSize + offset * 2 + 10,
            height: coverSize,
          }}
        >
          {visibleBranches.length > 0 ? (
            <>
              {/* Placeholder for loading */}
              {visibleBranches.map((branch, index) => (
                <div
                  key={`placeholder-${branch.id}`}
                  className="absolute bg-zinc-700 rounded-md animate-pulse"
                  style={{
                    left: `${hovered && windowWidth >= 640 ? index * hoverOffset : index * offset}px`,
                    top: 0,
                    width: coverSize,
                    height: coverSize,
                    zIndex: branches.length - index,
                  }}
                />
              ))}

              {/* Actual images */}
              {visibleBranches.map((branch, index) => {
                const isLoaded = loadedImages[trunk.id]?.[branch.id] || false;
                return (
                  <div
                    key={`image-${branch.id}`}
                    className="absolute"
                    style={{
                      left: `${hovered && windowWidth >= 640 ? index * hoverOffset : index * offset}px`,
                      top: 0,
                      width: coverSize,
                      height: coverSize,
                      zIndex: branches.length - index + 10,
                    }}
                  >
                    <Image
                      src={branch.albumArtUrl}
                      alt={branch.title}
                      width={coverSize}
                      height={coverSize}
                      unoptimized
                      className={`rounded-md shadow-md border border-zinc-700 object-cover transition-opacity duration-300 ${
                        isLoaded ? "opacity-100" : "opacity-0"
                      }`}
                      onLoad={() => handleImageLoad(trunk.id, branch.id)}
                      onError={() =>
                        setLoadedImages((prev) => ({
                          ...prev,
                          [trunk.id]: { ...(prev[trunk.id] || {}), [branch.id]: true },
                        }))
                      }
                    />
                  </div>
                );
              })}
            </>
          ) : (
            <div className="text-purple-700 flex items-center justify-center w-full h-full bg-zinc-700 rounded-md">
              <HiOutlineCollection size={coverSize * 0.6} />
            </div>
          )}
        </div>

        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-white font-medium truncate">{trunk.name}</span>
          <span className="text-zinc-400 text-sm truncate">Owner: {trunk.username}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-zinc-400 text-sm">{branches.length} songs</span>
        {isClickDisabled && (
          <div className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
        )}
      </div>
    </li>
  );
}
