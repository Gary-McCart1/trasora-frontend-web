"use client";

import Image from "next/image";
import { Trunk } from "../types/User";
import { HiPlus, HiTrash } from "react-icons/hi";
import { FaSpotify } from "react-icons/fa";
import { useState } from "react";
import { updateTrunkTitle } from "../lib/trunkApi/route";
import { sendTrunkToSpotify } from "../lib/spotifyApi/route";

interface TrunkCardProps {
  trunk: Trunk;
  isOwnProfile: boolean;
  onAddSong?: (trunkId: number) => void;
  onOpen?: (trunkId: number) => void;
  onDelete?: (trunkId: number) => void;
}

export default function TrunkCard({
  trunk,
  isOwnProfile,
  onAddSong,
  onOpen,
  onDelete,
}: TrunkCardProps) {
  const [title, setTitle] = useState(trunk.name);
  const [editing, setEditing] = useState(false);

  const saveTitle = async () => {
    try {
      const updatedTrunk = await updateTrunkTitle(trunk.id, title);
      setTitle(updatedTrunk.name);
      setEditing(false);
    } catch (err) {
      console.error("Failed to update trunk title", err);
      alert(err instanceof Error ? err.message : "Failed to update title");
    }
  };

  const handleSendToSpotify = async () => {
    try {
      const playlistUrl = await sendTrunkToSpotify(trunk.id);
      window.open(playlistUrl, "_blank");
    } catch (err) {
      console.error(err);
      alert(
        err instanceof Error
          ? err.message
          : "An error occurred while sending to Spotify."
      );
    }
  };

  return (
    <div
      className="relative rounded-2xl p-3 cursor-pointer border border-transparent hover:shadow-lg hover:border-purple-500 transition-transform bg-gradient-to-br from-zinc-900 to-zinc-800 max-w-55"
      onClick={() => onOpen?.(trunk.id)}
    >
      {/* Cover stack */}
      <div className="relative w-full h-28 rounded-xl mb-3 flex items-center justify-start">
        {trunk.branches && trunk.branches.length > 0 ? (
          <div className="relative w-full h-full">
            {trunk.branches.slice(0, 3).map((branch, index) => (
              <Image
                key={branch.id}
                src={branch.albumArtUrl}
                alt={branch.title}
                width={112}
                height={112}
                className="absolute rounded-md shadow-md border border-zinc-700 object-cover"
                style={{
                  left: `${index * 16}px`,
                  top: 0,
                  zIndex: trunk.branches.length - index,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-700 text-zinc-300 text-sm">
            No Cover
          </div>
        )}
      </div>

      {/* Editable Title */}
      {editing ? (
        <input
          autoFocus
          className="w-full text-white font-semibold text-sm bg-zinc-800 border-b border-purple-500 outline-none"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={saveTitle}
          onKeyDown={(e) => e.key === "Enter" && saveTitle()}
        />
      ) : (
        <p
          className="text-white font-semibold text-sm truncate"
          onClick={(e) => {
            e.stopPropagation();
            if (isOwnProfile) setEditing(true);
          }}
        >
          {title}
        </p>
      )}

      {trunk.description && (
        <p className="text-zinc-400 text-xs truncate">{trunk.description}</p>
      )}
      <p className="text-zinc-500 text-xs mb-2">
        Branches: {trunk.branches?.length ?? 0}
      </p>

      {/* Owner actions */}
      {isOwnProfile && (
        <div className="flex justify-between gap-2 mt-auto">
          {onAddSong && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddSong(trunk.id);
              }}
              className="p-1.5 rounded-full bg-gray-700 hover:bg-purple-700 text-white flex items-center justify-center shadow-md transition"
              title="Add Song"
            >
              <HiPlus size={14} />
              <span className="text-xs px-2">Add Song</span>
            </button>
          )}
          <div className="flex justify-between">
            {trunk.branches && trunk.branches.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSendToSpotify();
                }}
                className="p-1.5 mx-2 rounded-full bg-gray-700 hover:bg-green-700 text-white flex items-center justify-center shadow-md transition"
                title="Send to Spotify"
              >
                <FaSpotify size={16} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(trunk.id);
                }}
                className="p-1.5 rounded-full bg-gray-700 hover:bg-purple-700 text-white flex items-center justify-center shadow-md transition"
                title="Delete Trunk"
              >
                <HiTrash size={14} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
