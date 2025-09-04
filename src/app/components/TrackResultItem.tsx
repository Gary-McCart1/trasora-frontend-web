"use client";

import Link from "next/link";
import { IoMdAddCircle } from "react-icons/io";
import { LuGitBranchPlus } from "react-icons/lu";
import { useState } from "react";
import AvailableTrunksList from "./AvailableTrunksList";
import { Branch, Trunk } from "../types/User";
import { RootSongInput } from "./RootsSearchBar";
import { useAuth } from "../context/AuthContext";
import DraggablePlayer from "./DraggablePlayer";
import { addTrackToTrunk, getAvailableTrunks } from "../api/trunkApi/route";

interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { images: { url: string }[] };
}

type PlayerTrack = {
  id: string;
  name: string;
  artists?: { name: string }[];
  albumArtUrl: string;
};

export default function TrackResultItem({ track }: { track: Track }) {
  const [loadingTrunks, setLoadingTrunks] = useState(false);
  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [availableTrunks, setAvailableTrunks] = useState<Trunk[]>([]);
  const { user } = useAuth();

  // 🎵 Player state
  const [playingTrack, setPlayingTrack] = useState<PlayerTrack | null>(null);

  // Open branch modal
  const handleBranchClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoadingTrunks(true);
    try {
      const data = await getAvailableTrunks();
      setAvailableTrunks(data);
      setBranchModalOpen(true);
    } catch (err) {
      console.error(err);
      alert("Could not load trunks");
    } finally {
      setLoadingTrunks(false);
    }
  };

  // Add track to trunk from modal
  const handleSelectTrunk = async (song: RootSongInput, trunkId: number) => {
    if (!user) return;
    try {
      await addTrackToTrunk(trunkId, song, user.username);
      alert("Song successfully added to branch!");
      setBranchModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to add song. Try again.");
    }
  };

  // Add track to trunk from draggable player
  const handleBranchFromPlayer = async (
    track: PlayerTrack,
    trunkId: number
  ) => {
    if (!user) return;

    try {
      await addTrackToTrunk(
        trunkId,
        {
          trackId: track.id,
          title: track.name,
          artist: track.artists?.[0]?.name || "",
          albumArtUrl: track.albumArtUrl,
        },
        user.username
      );
      alert("Song successfully added to branch!");
    } catch (err) {
      console.error(err);
      alert("Failed to add track. Try again.");
    }
  };

  const selectedSong = {
    trackId: track.id,
    title: track.name,
    artist: track.artists[0]?.name || "",
    albumArtUrl: track.album.images[0]?.url || "",
  };

  // Open draggable player
  const handleTrackClick = () => {
    setPlayingTrack({
      id: track.id,
      name: track.name,
      artists: track.artists,
      albumArtUrl: track.album.images[0]?.url || "",
    });
  };

  return (
    <>
      <li
        className="flex items-center justify-between px-4 py-2 hover:bg-zinc-800 transition cursor-pointer"
        key={track.id}
        onClick={handleTrackClick}
      >
        <div className="flex items-center gap-4 justify-between">
          <img
            src={track.album.images[0]?.url}
            alt={track.name}
            className="w-10 h-10 rounded-md object-cover"
          />
          <div>
            <p className="text-white font-medium">{track.name}</p>
            <p className="text-sm text-zinc-400">{track.artists[0]?.name}</p>
          </div>
        </div>
        <div className="flex items-center">
          {/* Branch Button */}
          <button
            onClick={handleBranchClick}
            disabled={loadingTrunks}
            className="text-purple-400 hover:text-purple-500 transition-colors disabled:opacity-50"
            aria-label="Branch track"
          >
            <LuGitBranchPlus size={24} />
          </button>

          {/* Add Button */}
          <Link
            onClick={(e) => e.stopPropagation()}
            className="pl-5 text-purple-400 hover:text-purple-500 transition-colors"
            href={`/create?${new URLSearchParams({
              id: track.id,
              name: track.name,
              artist: track.artists[0]?.name || "",
              image: track.album.images[0]?.url || "",
            }).toString()}`}
            aria-label={`Add ${track.name} by ${track.artists[0]?.name}`}
          >
            <IoMdAddCircle size={24} />
          </Link>
        </div>
      </li>

      {/* Branch Modal */}
      {branchModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 p-6 rounded-xl max-h-[80vh] overflow-y-auto w-96">
            <h2 className="text-white text-lg font-semibold mb-4">
              Add to Trunk
            </h2>

            {loadingTrunks ? (
              <p className="text-zinc-400">Loading...</p>
            ) : (
              <AvailableTrunksList
                trunks={availableTrunks}
                selectedSong={selectedSong}
                onSelectTrunk={handleSelectTrunk}
              />
            )}

            <button
              onClick={() => setBranchModalOpen(false)}
              className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* 🎵 Draggable Player */}
      {playingTrack && (
        <DraggablePlayer
          track={playingTrack}
          onClose={() => setPlayingTrack(null)}
          onBranchAdded={() => {
            if (!playingTrack) return;

            // Open the branch modal so the user can pick a trunk
            setBranchModalOpen(true);
            
            // Pre-fill the selected song for modal
            const song = {
              trackId: playingTrack.id,
              title: playingTrack.name,
              artist: playingTrack.artists?.[0]?.name || "",
              albumArtUrl: playingTrack.albumArtUrl,
            };
            setBranchModalOpen(false);
            window.location.reload();
            setAvailableTrunks((prev) => prev); // just to ensure modal has trunks loaded
            // pass this song to AvailableTrunksList via selectedSong
          }}
        />
      )}
    </>
  );
}
