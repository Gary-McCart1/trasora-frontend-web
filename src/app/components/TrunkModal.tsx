"use client";

import { useState } from "react";
import { Branch, Trunk } from "../types/User";
import { HiTrash } from "react-icons/hi";
import { updateTrunkVisibility } from "../lib/trunksApi";

interface TrunkModalProps {
  trunk: Trunk;
  isOwnProfile: boolean;
  onClose: () => void;
}

export default function TrunkModal({
  trunk,
  isOwnProfile,
  onClose,
}: TrunkModalProps) {
  const [branches, setBranches] = useState<Branch[]>(trunk.branches);
  const [publicFlag, setPublicFlag] = useState(trunk.publicFlag);
  const [toggling, setToggling] = useState(false);

  const handleDelete = async (branchId: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this song?"
    );
    if (!confirmDelete) return;

    const oldBranches = [...branches];
    setBranches(branches.filter((b) => b.id !== branchId));

    try {
      const res = await fetch(`/api/branches?branchId=${branchId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to delete branch");
      }

      // Optionally, no need to reload the page anymore
      // window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to delete song. Reverting...");
      setBranches(oldBranches);
    }
  };

  const togglePublic = async () => {
    if (toggling) return;
    setToggling(true);

    try {
      const updatedTrunk = await updateTrunkVisibility(trunk.id, !publicFlag);
      setPublicFlag(updatedTrunk.publicFlag);
    } catch (err) {
      console.error(err);
      alert("Failed to update trunk visibility");
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-lg p-6 rounded-3xl bg-zinc-900 shadow-2xl flex flex-col gap-4 z-20">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white text-2xl font-bold hover:text-purple-400"
        >
          ✕
        </button>

        {/* Name with inline toggle */}
        <div className="flex items-center gap-3">
          <h2 className="text-white text-lg font-semibold">{trunk.name}</h2>
          {isOwnProfile && (
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={publicFlag}
                onChange={togglePublic}
                className="sr-only"
                disabled={toggling}
              />
              <div
                className={`w-10 h-5 rounded-full transition-all duration-200 ${
                  publicFlag ? "bg-purple-500" : "bg-gray-600"
                }`}
              />

              <div
                className={`dot absolute left-0 top-0.5 w-4 h-4 bg-white rounded-full shadow-md transform transition-all duration-200 ${
                  publicFlag ? "translate-x-5" : ""
                }`}
              />
              <span className="text-xs text-gray-400 px-2">
                {publicFlag ? "Public" : "Private"}
              </span>
            </label>
          )}
        </div>

        {/* Branch list */}
        <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-5">
          {branches.length > 0 ? (
            branches.map((branch) => (
              <div
                key={branch.id}
                className="flex items-center justify-between bg-zinc-800 p-2 rounded-xl shadow-md"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={branch.albumArtUrl}
                    alt={branch.title}
                    className="w-12 h-12 object-cover rounded-md"
                  />
                  <div className="flex flex-col">
                    <span className="text-white font-medium">
                      {branch.title}
                    </span>
                    <span className="text-zinc-400 text-xs">
                      {branch.artist} • added by{" "}
                      {branch.addedByUsername ?? "Unknown"}
                    </span>
                  </div>
                </div>
                {isOwnProfile && (
                  <button
                    onClick={() => handleDelete(branch.id)}
                    className="p-1.5 rounded-full bg-gray-700 hover:bg-purple-700 text-white flex items-center justify-center shadow-md transition"
                    title="Delete Song"
                  >
                    <HiTrash size={16} />
                  </button>
                )}
              </div>
            ))
          ) : (
            <p className="text-zinc-400 text-sm">No songs added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
