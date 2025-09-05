"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import AvailableTrunksList from "./AvailableTrunksList";
import { useAuth } from "../context/AuthContext";
import { addTrackToTrunk, getAvailableTrunks } from "../lib/trunksApi";
import { incrementPostBranchCount } from "../lib/postsApi";
import { RootSongInput } from "./RootsSearchBar";
import { Trunk } from "../types/User";
import { LuGitBranchPlus } from "react-icons/lu";

export interface TrackOrAlbum {
  id: string;
  name: string;
  artists?: { name: string }[];
  postId?: number;
  albumArtUrl?: string;
}

interface DraggablePlayerProps {
  track: TrackOrAlbum;
  onClose: () => void;
  onBranchAdded?: () => void;
}

export default function DraggablePlayer({
  track,
  onClose,
  onBranchAdded,
}: DraggablePlayerProps) {
  const playerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const offset = useRef({ x: 0, y: 0 });

  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [availableTrunks, setAvailableTrunks] = useState<Trunk[]>([]);
  const [loadingTrunks, setLoadingTrunks] = useState(false);
  const [, setLoadingBranch] = useState(false);
  const { user } = useAuth();

  const artistNames =
    track.artists?.map((a) => a.name).join(", ") || "Unknown Artist";
  const albumArtUrl =
    track.albumArtUrl || `https://i.scdn.co/image/${track.id}`;

  // Initial position
  useEffect(() => {
    const width = Math.min(650, window.innerWidth * 0.9);
    const height = 220;
    setPosition({
      x: Math.max(0, (window.innerWidth - width) / 2),
      y: Math.max(0, window.innerHeight - height - 20),
    });
  }, []);

  // Drag handlers
  const startDrag = (clientX: number, clientY: number) => {
    if (!playerRef.current) return;
    setIsDragging(true);
    offset.current = { x: clientX - position.x, y: clientY - position.y };
  };
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === "IFRAME") return;
    startDrag(e.clientX, e.clientY);
  };
  const handleTouchStart = (e: React.TouchEvent) =>
    startDrag(e.touches[0].clientX, e.touches[0].clientY);
  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging || !playerRef.current) return;
    const width = playerRef.current.offsetWidth;
    const height = playerRef.current.offsetHeight;
    setPosition({
      x: Math.max(
        0,
        Math.min(window.innerWidth - width, clientX - offset.current.x)
      ),
      y: Math.max(
        0,
        Math.min(window.innerHeight - height, clientY - offset.current.y)
      ),
    });
  };
  const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
  const handleTouchMove = (e: TouchEvent) =>
    handleMove(e.touches[0].clientX, e.touches[0].clientY);
  const endDrag = () => setIsDragging(false);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", endDrag);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", endDrag);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", endDrag);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", endDrag);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", endDrag);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", endDrag);
    };
  }, [isDragging]);

  const playerWidth = Math.min(650, window.innerWidth * 0.9);

  // Branch logic
  const handleBranchClick = async () => {
    if (!user) return;
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

  const handleSelectTrunk = async (song: RootSongInput, trunkId: number) => {
    if (!user) return;
    setLoadingBranch(true);
    try {
      await addTrackToTrunk(trunkId, { ...song, albumArtUrl }, user.username);
      setBranchModalOpen(false);
      onBranchAdded?.();

      if (track.postId) {
        try {
          await incrementPostBranchCount(String(track.postId));
        } catch (err) {
          console.error("Failed to increment post branch count", err);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Failed to add track to trunk");
    } finally {
      setLoadingBranch(false);
    }
  };

  return (
    <>
      <div
        ref={playerRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        style={{ left: position.x, top: position.y, width: playerWidth }}
        className="fixed z-50 cursor-grab select-none"
      >
        <div className="relative w-full h-[220px] rounded-3xl shadow-2xl overflow-hidden bg-zinc-800 flex flex-col items-center justify-center p-5">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 hover:bg-gray-500 text-white rounded-full px-1.5 shadow-md z-10"
          >
            ✕
          </button>

          {/* Spotify iframe */}
          <iframe
            key={track.id}
            src={`https://open.spotify.com/embed/track/${track.id}`}
            width="95%"
            height="80"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            className="rounded-3xl pointer-events-auto shadow-xl"
          />

          {/* Buttons */}
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => router.push(`/create?id=${track.id}`)}
              className="flex items-center gap-2 px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-semibold rounded-full shadow-lg hover:scale-105 transition-transform duration-200 active:scale-95"
            >
              <Plus size={18} />
              Create Post
            </button>

            <button
              onClick={handleBranchClick}
              className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-full shadow-lg hover:scale-105 transition-transform duration-200 active:scale-95"
            >
              <LuGitBranchPlus size={18} />
              Branch Track
            </button>
          </div>
        </div>
      </div>

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
                selectedSong={{
                  trackId: track.id,
                  title: track.name,
                  artist: artistNames,
                  albumArtUrl,
                }}
                trunks={availableTrunks}
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
    </>
  );
}
