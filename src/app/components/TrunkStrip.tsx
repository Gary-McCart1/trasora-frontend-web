"use client";

import React, { useState } from "react";
import TrunkCard from "./TrunkCard";
import TrunkModal from "./TrunkModal";
import { Trunk } from "../types/User";
import { useAuth } from "../context/AuthContext";

interface TrunkStripProps {
  visibleTrunks: Trunk[];
  isOwnProfile: boolean;
  onCreateTrunk?: () => void;
  onAddSong?: (id: number) => void;
  onDelete?: (id: number) => void; // delete trunk
}

export default function TrunkStrip({
  visibleTrunks,
  isOwnProfile,
  onCreateTrunk,
  onAddSong,
  onDelete,
}: TrunkStripProps) {
  const [selectedTrunk, setSelectedTrunk] = useState<Trunk | null>(null);
  const { user } = useAuth();

  // fallback to purple if user has no accentColor
  const accentColor = user?.accentColor || "#7c3aed"; // default Tailwind purple-600

  return (
    <div className="mt-4 px-3">
      {/* Create Trunk Button */}
      <div className="text-xl font-extrabold mb-6 tracking-wide flex justify-between items-center">
        <h2>Trunks - (Collections)</h2>
        {isOwnProfile && onCreateTrunk && (
          <button
            onClick={onCreateTrunk}
            style={{ backgroundColor: accentColor }}
            className="px-3 py-1 rounded text-white font-semibold text-sm transition hover:opacity-90"
          >
            + Trunk
          </button>
        )}
      </div>

      {/* Trunk Cards */}
      {visibleTrunks.length ? (
        <div
          className="flex space-x-4 overflow-x-auto scrollbar-thin scrollbar-track-zinc-900 snap-x p-4"
          style={{
            scrollbarColor: `${accentColor} #18181b`, // accent + zinc-900
          }}
        >
          {visibleTrunks.map((trunk) => (
            <div key={trunk.id} className="flex-shrink-0 snap-center w-[14rem]">
              <TrunkCard
                trunk={trunk}
                isOwnProfile={isOwnProfile}
                onOpen={() =>
                  setSelectedTrunk(
                    visibleTrunks.find((t) => t.id === trunk.id) ?? null
                  )
                }
                onAddSong={onAddSong}
                onDelete={onDelete} // delete trunk
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-400 italic text-sm mt-2 text-center px-2 py-[5rem]">
          {isOwnProfile
            ? "Add a trunk to create a collection of songs you can share or turn into a playlist for yourself at the click of a button."
            : "No trunks to display."}
        </div>
      )}

      {/* Trunk Modal */}
      {selectedTrunk && (
        <TrunkModal
          trunk={selectedTrunk}
          isOwnProfile={isOwnProfile}
          onClose={() => setSelectedTrunk(null)}
        />
      )}
    </div>
  );
}
