"use client";

import React, { useState, useEffect } from "react";
import { Trunk, Branch } from "../types/User";
import TrunkItem from "./TrunkItem"; // <-- new file
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

  return (
    <ul className="space-y-2">
      {trunks.map((trunk) => (
        <TrunkItem
          key={trunk.id}
          trunk={trunk}
          branches={trunkBranches[trunk.id] || []}
          selectedSong={selectedSong}
          loadedImages={loadedImages}
          clickDisabled={clickDisabled}
          windowWidth={windowWidth}
          coverSize={coverSize}
          offset={offset}
          hoverOffset={hoverOffset}
          onSelectTrunk={onSelectTrunk}
          handleImageLoad={handleImageLoad}
          setLoadedImages={setLoadedImages}
        />
      ))}
    </ul>
  );
}
