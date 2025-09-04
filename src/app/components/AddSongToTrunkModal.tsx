"use client";

import { useState } from "react";
import RootsSearchBar, { RootSongInput } from "./RootsSearchBar";
import { Branch } from "../types/User";
import { useAuth } from "../context/AuthContext";
import { addTrackToTrunk } from "../lib/trunkApi/route";

interface AddSongToTrunkModalProps {
  trunkId: number;
  onClose: () => void;
  onSongAdded: (newBranch: Branch) => void;
}

export default function AddSongToTrunkModal({
  trunkId,
  onClose,
  onSongAdded,
}: AddSongToTrunkModalProps) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const handleTrackSelect = async (song: RootSongInput) => {
    if (!user) return;
    setLoading(true);
    try {
      const newBranch = await addTrackToTrunk(trunkId, song, user.username);
      onSongAdded(newBranch);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to add song. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md p-6 rounded-3xl bg-zinc-900 shadow-2xl flex flex-col gap-4 z-20">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white text-2xl font-bold hover:text-purple-400"
        >
          ✕
        </button>
        <div className="m-5">
          <RootsSearchBar onSelect={handleTrackSelect} />
        </div>
        {loading && <p className="text-white text-sm mt-2">Adding track...</p>}
      </div>
    </div>
  );
}
