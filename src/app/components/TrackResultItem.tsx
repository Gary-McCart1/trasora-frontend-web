"use client";

import Link from "next/link";
import { IoMdAddCircle } from "react-icons/io";
import { LuGitBranchPlus } from "react-icons/lu";
import { useState } from "react";
import AvailableTrunksList from "./AvailableTrunksList";
import { Trunk } from "../types/User";
import { useAuth } from "../context/AuthContext";
import DraggablePlayer from "./DraggablePlayer";
import { addTrackToTrunk, getAvailableTrunks } from "../lib/trunksApi";
import { getAuthHeaders } from "../lib/usersApi";

// SoundCloud track type
interface Track {
  id: string;
  title: string;
  user: {
    id: string;
    username: string;
    avatar_url?: string | null;
  };
  artwork_url?: string | null;
  stream_url?: string;
}

type PlayerTrack = {
  id: string;
  name: string;
  artistName: string;
  albumArtUrl?: string;
  streamUrl?: string;
  type?: string;
};

export default function TrackResultItem({ track }: { track: Track }) {
  const [loadingTrunks, setLoadingTrunks] = useState(false);
  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [availableTrunks, setAvailableTrunks] = useState<Trunk[]>([]);
  const { user } = useAuth();

  const [playingTrack, setPlayingTrack] = useState<PlayerTrack | null>(null);
  console.log(track)

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

  const handleSelectTrunk = async (
    song: { trackId: string; title: string; artist: string; albumArtUrl: string },
    trunkId: number
  ) => {
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

  const selectedSong: PlayerTrack = {
    id: track.id,
    name: track.title,
    artistName: track.user.username,
    albumArtUrl: track.artwork_url || undefined,
    streamUrl: track.stream_url,
    type: "track"
  };
  const selectedSongForTrunks = {
    trackId: selectedSong.id,
    title: selectedSong.name,
    artist: selectedSong.artistName,
    albumArtUrl: selectedSong.albumArtUrl || "",
  };

  const handleTrackClick = async () => {
    try {
      const res = await fetch(
        `https://trasora-backend-e03193d24a86.herokuapp.com/api/apple-music/to-spotify?trackName=${encodeURIComponent(track.title)}&artistName=${encodeURIComponent(track.user.username)}`,
        { 
          method: "POST",
          headers: { ...getAuthHeaders() } }
      );
  
      if (!res.ok) {
        console.warn("Spotify lookup failed", await res.text());
        return;
      }
  
      const spotifyTrack = await res.json();
  
      setPlayingTrack({
        id: spotifyTrack.id,
        name: spotifyTrack.name,
        artistName: spotifyTrack.artistName,
        albumArtUrl: spotifyTrack.albumArtUrl,
        streamUrl: spotifyTrack.previewUrl,
        type: "track"
      });
    } catch (err) {
      console.error("Error fetching Spotify track:", err);
    }
  };
  

  return (
    <>
      <li
        className="flex items-center justify-between px-4 py-2 hover:bg-zinc-800 transition cursor-pointer"
        onClick={handleTrackClick}
      >
        <div className="flex items-center gap-4 justify-between">
          <img
            src={track.artwork_url || track.user.avatar_url || "/placeholder.png"}
            alt={track.title}
            className="w-10 h-10 rounded-md object-cover"
          />
          <div>
            <p className="text-white font-medium">{track.title}</p>
            <p className="text-sm text-zinc-400">{track.user.username}</p>
          </div>
        </div>
        <div className="flex items-center">
          <button
            onClick={handleBranchClick}
            disabled={loadingTrunks}
            className="text-purple-400 hover:text-purple-500 transition-colors disabled:opacity-50"
            aria-label="Branch track"
          >
            <LuGitBranchPlus size={24} />
          </button>

          <Link
            onClick={(e) => e.stopPropagation()}
            className="pl-5 text-purple-400 hover:text-purple-500 transition-colors"
            href={`/create?${new URLSearchParams({
              id: track.id,
              name: track.title,
              artist: track.user.username,
              image: track.artwork_url || track.user.avatar_url || "",
            }).toString()}`}
            aria-label={`Add ${track.title} by ${track.user.username}`}
          >
            <IoMdAddCircle size={24} />
          </Link>
        </div>
      </li>

      {branchModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 p-6 rounded-xl max-h-[80vh] overflow-y-auto w-96">
            <h2 className="text-white text-lg font-semibold mb-4">Add to Trunk</h2>

            {loadingTrunks ? (
              <p className="text-zinc-400">Loading...</p>
            ) : (
              <AvailableTrunksList
                trunks={availableTrunks}
                selectedSong={selectedSongForTrunks}
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

      {playingTrack && (
        <DraggablePlayer
          track={playingTrack}
        
          onClose={() => setPlayingTrack(null)}
          onBranchAdded={() => setBranchModalOpen(true)}
        />
      )}
    </>
  );
}
