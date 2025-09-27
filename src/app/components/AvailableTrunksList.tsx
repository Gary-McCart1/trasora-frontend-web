"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Trunk, Branch } from "../types/User";
import { HiOutlineCollection } from "react-icons/hi";
import { getBranchesForTrunk } from "../lib/trunksApi";

interface AvailableTrunksListProps {
  trunks: Trunk[];
  selectedSong: {
    trackId: string;
    title: string;
    artist: string;
    albumArtUrl: string;
  };
  onSelectTrunk: (
    song: AvailableTrunksListProps["selectedSong"],
    trunkId: number
  ) => void;
}

export default function AvailableTrunksList({
  trunks,
  selectedSong,
  onSelectTrunk,
}: AvailableTrunksListProps) {
  const [mounted, setMounted] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  const [trunkBranches, setTrunkBranches] = useState<Record<number, Branch[]>>(
    {}
  );
  const [loadedImages, setLoadedImages] = useState<Record<number, Record<number, boolean>>>({});

  useEffect(() => {
    setMounted(true);
    setWindowWidth(window.innerWidth);

    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    async function fetchBranches(trunkId: number) {
      try {
        const data = await getBranchesForTrunk(trunkId);
        setTrunkBranches((prev) => ({ ...prev, [trunkId]: data }));
      } catch (err) {
        console.error(err);
        setTrunkBranches((prev) => ({ ...prev, [trunkId]: [] }));
      }
    }

    trunks.forEach((trunk) => {
      if (!trunkBranches[trunk.id]) fetchBranches(trunk.id);
    });
  }, [trunks, trunkBranches]);

  if (!mounted) return null;

  if (!trunks || trunks.length === 0) {
    return <p className="text-zinc-400">No trunks available</p>;
  }

  const coverSize = windowWidth < 640 ? 30 : windowWidth < 1024 ? 35 : 40;
  const offset = windowWidth < 640 ? 8 : windowWidth < 1024 ? 10 : 12;
  const hoverOffset = windowWidth < 640 ? 12 : windowWidth < 1024 ? 16 : 20;

  const handleImageLoad = (trunkId: number, branchId: number) => {
    setLoadedImages((prev) => ({
      ...prev,
      [trunkId]: { ...(prev[trunkId] || {}), [branchId]: true },
    }));
  };

  const TrunkItem = ({ trunk }: { trunk: Trunk }) => {
    const [hovered, setHovered] = useState(false);
    const branches = trunkBranches[trunk.id] || [];

    return (
      <li
        key={trunk.id}
        className="flex items-center justify-between p-2 bg-zinc-800 rounded hover:bg-purple-700 cursor-pointer transition-colors"
        onClick={() => onSelectTrunk(selectedSong, trunk.id)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="flex items-center gap-3">
          <div
            className="relative flex-shrink-0"
            style={{
              width: coverSize + offset * 2 + 10,
              height: coverSize,
            }}
          >
            {branches.length > 0 ? (
              branches.slice(0, 3).map((branch, index) => {
                const isLoaded = loadedImages[trunk.id]?.[branch.id] || false;

                return (
                  <div
                    key={branch.id}
                    style={{
                      left: `${
                        hovered && windowWidth >= 640
                          ? index * hoverOffset
                          : index * offset
                      }px`,
                      top: 0,
                      width: coverSize,
                      height: coverSize,
                      position: "absolute",
                      zIndex: branches.length - index,
                    }}
                  >
                    {!isLoaded && (
                      <div className="bg-zinc-700 rounded-md w-full h-full animate-pulse" />
                    )}
                    <Image
                      src={branch.albumArtUrl}
                      alt={branch.title}
                      width={coverSize}
                      height={coverSize}
                      unoptimized
                      className={`absolute rounded-md shadow-md border border-zinc-700 object-cover transition-all duration-300 ${
                        isLoaded ? "opacity-100" : "opacity-0"
                      }`}
                      onLoad={() => handleImageLoad(trunk.id, branch.id)}
                    />
                  </div>
                );
              })
            ) : (
              <div className="text-purple-700 flex items-center justify-center w-full h-full bg-zinc-700 rounded-md">
                <HiOutlineCollection size={coverSize * 0.6} />
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-white font-medium">{trunk.name}</span>
            <span className="text-zinc-400 text-sm">Owner: {trunk.username}</span>
          </div>
        </div>
        <span className="text-zinc-400 text-sm">{branches.length} songs</span>
      </li>
    );
  };

  return (
    <ul className="space-y-2">
      {trunks.map((trunk) => (
        <TrunkItem key={trunk.id} trunk={trunk} />
      ))}
    </ul>
  );
}
