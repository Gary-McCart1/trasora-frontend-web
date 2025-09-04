"use client";

import { useState } from "react";
import { newTrunk, Trunk } from "../types/User";
import { useAuth } from "../context/AuthContext";

interface TrunkCreatorProps {
  onTrunkCreated: (trunk: newTrunk) => void;
}

export default function TrunkCreator({ onTrunkCreated }: TrunkCreatorProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const {user} = useAuth()

  const handleSubmit = async () => {
    if (!name.trim()) return;
    if(!user) return;
    setLoading(true);

    try {
      const newTrunk: newTrunk = {
        id: Date.now(),
        username: user.username,
        name: name.trim(),
        description: description.trim(),
        isPublic,
        branches: [],
      };

      onTrunkCreated(newTrunk);

      setName("");
      setDescription("");
      setIsPublic(false);
    } catch (err) {
      console.error("Failed to create trunk:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg sm:max-w-md p-6 sm:p-4 rounded-3xl flex flex-col gap-6 sm:gap-4">
      <h3 className="text-white font-bold text-2xl sm:text-xl">
        Create a new Trunk
      </h3>

      <input
        type="text"
        placeholder="Trunk name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-4 py-3 sm:py-2 rounded-xl bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
      />

      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full px-4 py-3 sm:py-2 rounded-xl bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none transition"
        rows={4}
      />

      {/* Public/Private Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div
          className="flex items-center cursor-pointer select-none"
          onClick={() => setIsPublic(!isPublic)}
        >
          <div
            className={`w-14 h-7 flex items-center bg-purple-700 rounded-full p-1 transition-colors ${
              isPublic ? "bg-green-500" : "bg-zinc-700"
            }`}
          >
            <div
              className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                isPublic ? "translate-x-7" : "translate-x-0"
              }`}
            />
          </div>
          <span className="ml-3 text-purple-200 font-medium">
            {isPublic ? "Public" : "Private"}
          </span>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !name.trim()}
          className="px-8 py-3 sm:px-6 sm:py-2 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creating..." : "Create"}
        </button>
      </div>
    </div>
  );
}
