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
  const [trunkBranches, setTrunkBranches] = useState<Record<number, Branch[]>>({});
  const [loadedImages, setLoadedImages] = useState<Record<number, Record<number, boolean>>>({});
  const [clickDisabled, setClickDisabled] = useState<Record<number, boolean>>({});

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
        
        // Enable clicks after a short delay to ensure layout is stable
        setTimeout(() => {
          setClickDisabled((prev) => ({ ...prev, [trunkId]: false }));
        }, 100);
      } catch (err) {
        console.error(err);
        setTrunkBranches((prev) => ({ ...prev, [trunkId]: [] }));
        setClickDisabled((prev) => ({ ...prev, [trunkId]: false }));
      }
    }

    trunks.forEach((trunk) => {
      if (!trunkBranches[trunk.id]) {
        setClickDisabled((prev) => ({ ...prev, [trunk.id]: true }));
        fetchBranches(trunk.id);
      }
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

  const handleTrunkClick = (trunkId: number) => {
    // Prevent clicks if still loading or if click is disabled
    if (clickDisabled[trunkId]) return;
    
    // Add a small delay to prevent accidental double-clicks on mobile
    setClickDisabled((prev) => ({ ...prev, [trunkId]: true }));
    onSelectTrunk(selectedSong, trunkId);
    
    setTimeout(() => {
      setClickDisabled((prev) => ({ ...prev, [trunkId]: false }));
    }, 300);
  };

  const TrunkItem = ({ trunk }: { trunk: Trunk }) => {
    const [hovered, setHovered] = useState(false);
    const branches = trunkBranches[trunk.id] || [];
    const isClickDisabled = clickDisabled[trunk.id];

    // Check if all visible images are loaded
    const visibleBranches = branches.slice(0, 3);
    const allImagesLoaded = visibleBranches.length === 0 || 
      visibleBranches.every(branch => loadedImages[trunk.id]?.[branch.id]);

    return (
      <li
        key={trunk.id}
        className={`flex items-center justify-between p-2 bg-zinc-800 rounded transition-colors ${
          isClickDisabled 
            ? 'opacity-70 cursor-wait' 
            : 'hover:bg-purple-700 cursor-pointer'
        }`}
        onClick={() => handleTrunkClick(trunk.id)}
        onMouseEnter={() => !isClickDisabled && setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          // Prevent layout shift by setting a fixed height
          minHeight: `${coverSize + 16}px`,
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
            {branches.length > 0 ? (
              <>
                {/* Render placeholder backgrounds first to prevent layout shift */}
                {visibleBranches.map((branch, index) => (
                  <div
                    key={`placeholder-${branch.id}`}
                    className="absolute bg-zinc-700 rounded-md animate-pulse"
                    style={{
                      left: `${
                        hovered && windowWidth >= 640
                          ? index * hoverOffset
                          : index * offset
                      }px`,
                      top: 0,
                      width: coverSize,
                      height: coverSize,
                      zIndex: branches.length - index,
                    }}
                  />
                ))}
                
                {/* Render actual images on top */}
                {visibleBranches.map((branch, index) => {
                  const isLoaded = loadedImages[trunk.id]?.[branch.id] || false;
                  
                  return (
                    <div
                      key={`image-${branch.id}`}
                      className="absolute"
                      style={{
                        left: `${
                          hovered && windowWidth >= 640
                            ? index * hoverOffset
                            : index * offset
                        }px`,
                        top: 0,
                        width: coverSize,
                        height: coverSize,
                        zIndex: (branches.length - index) + 10,
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
                        onError={() => {
                          // Handle failed image loads
                          setLoadedImages((prev) => ({
                            ...prev,
                            [trunk.id]: { ...(prev[trunk.id] || {}), [branch.id]: true },
                          }));
                        }}
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
  };

  return (
    <ul className="space-y-2">
      {trunks.map((trunk) => (
        <TrunkItem key={trunk.id} trunk={trunk} />
      ))}
    </ul>
  );
}