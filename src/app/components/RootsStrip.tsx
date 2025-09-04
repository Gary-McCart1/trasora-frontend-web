"use client";

import React, { useEffect, useState } from "react";
import RootsSearchBar, { RootSongInput } from "./RootsSearchBar";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { useAuth } from "../context/AuthContext";
import {
  fetchRoots,
  addRoot as apiAddRoot,
  deleteRoot as apiDeleteRoot,
  reorderRoots as apiReorderRoots,
} from "../api/rootApi/route";
import { getUser } from "../api/userApi/route";

export interface RootSong {
  id: number;
  trackTitle: string;
  artistName: string;
  albumArtUrl: string;
  trackId: string;
  position: number;
  user: {
    username: string;
  };
}

interface RootsStripProps {
  pageUsername: string;
  onTrackPlay?: (
    track: {
      id: string;
      name: string;
      artists?: { name: string }[];
      albumArtUrl: string;
    } | null
  ) => void;
}

export default function RootsStrip({
  pageUsername,
  onTrackPlay,
}: RootsStripProps) {
  const { user, loading: authLoading } = useAuth();
  const [roots, setRoots] = useState<RootSong[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedSong, setSelectedSong] = useState<RootSongInput | null>(null);
  const [position, setPosition] = useState<number | null>(null);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [accentColor, setAccentColor] = useState("#A855F7");

  const isOwner = user && user.username === pageUsername;
  const takenPositions = roots.map((r) => r.position);

  useEffect(() => {
    if (!pageUsername) return;
    setLoading(true);
    getUser(pageUsername)
      .then((userData) => {
        if (userData.accentColor) setAccentColor(userData.accentColor);
      })
      .catch(console.error);

    fetchRoots(pageUsername)
      .then((data) => setRoots(data.sort((a, b) => a.position - b.position)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [pageUsername]);

  const addRoot = async () => {
    if (!selectedSong || !isOwner) return;

    const availablePositions = Array.from(
      { length: 10 },
      (_, i) => i + 1
    ).filter((pos) => !roots.some((r) => r.position === pos));
    const chosenPosition = position ?? availablePositions[0];
    if (!chosenPosition) return;

    try {
      const newRoot = await apiAddRoot(selectedSong, chosenPosition);
      setRoots((prev) =>
        [...prev, newRoot].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      );
      setShowModal(false);
      setSelectedSong(null);
      setPosition(null);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteRoot = async (id: number) => {
    if (!isOwner) return;
    try {
      await apiDeleteRoot(id);
      setRoots((prev) => prev.filter((r) => r.id !== id));
      if (
        playingTrackId &&
        roots.find((r) => r.id === id)?.trackId === playingTrackId
      ) {
        setPlayingTrackId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!isOwner || !result.destination) return;
    const reordered = Array.from(roots);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    const updated = reordered.map((r, i) => ({ ...r, position: i + 1 }));
    setRoots(updated);

    try {
      await apiReorderRoots(updated.map((r) => r.id));
    } catch (err) {
      console.error("Failed to reorder roots:", err);
    }
  };

  const handleTrackClick = (song: RootSong) => {
    if (!onTrackPlay) return;

    const trackObj = {
      id: song.trackId,
      name: song.trackTitle,
      artists: [{ name: song.artistName }],
      albumArtUrl: song.albumArtUrl,
    };

    onTrackPlay(trackObj);
    setPlayingTrackId(song.trackId);
  };

  const renderRootCard = (song: RootSong, index: number) => {
    return (
      <div
        className={`relative snap-center flex-shrink-0 w-52 rounded-3xl p-4 my-5 transition-transform cursor-pointer border border-transparent hover:scale-[1.08] hover:shadow-xl bg-gradient-to-br from-zinc-900 to-zinc-800`}
        onClick={() => handleTrackClick(song)}
      >
        <div className="flex items-center space-x-4">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-full text-white font-black text-lg shadow-md"
            style={{ background: accentColor }}
          >
            {index + 1}
          </div>
          <div className="relative w-16 h-16 rounded-lg overflow-hidden shadow-lg border border-zinc-700">
            <img
              src={song.albumArtUrl}
              alt={`${song.trackTitle} album art`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          </div>
        </div>
        <div className="mt-3">
          <p className="text-white font-semibold text-lg truncate">
            {song.trackTitle}
          </p>
          <p className="text-zinc-400 text-sm truncate">{song.artistName}</p>
        </div>
        {isOwner && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteRoot(song.id);
            }}
            className="absolute top-2 right-2 hover:bg-red-600 hover:p-2 rounded-full w-6 h-6 text-white text-sm flex items-center justify-center shadow-lg"
            title="Delete root"
          >
            ✕
          </button>
        )}
      </div>
    );
  };

  if (loading || authLoading)
    return <p className="text-zinc-400">Loading roots...</p>;

  return (
    <section className="relative mt-8 mb-12 px-4 rounded-lg py-10">
      <h3 className="text-xl font-extrabold mb-6 tracking-wide flex justify-between items-center">
        {isOwner ? "Your" : `${pageUsername.toUpperCase()}'s`} Top 10
        {isOwner && (
          <button
            className="px-3 py-1 rounded text-sm transition-all duration-200"
            style={{ backgroundColor: accentColor }}
            onClick={() => setShowModal(true)}
          >
            + Root
          </button>
        )}
      </h3>

      {roots.length === 0 ? (
        <p className="text-gray-400 italic text-sm mt-2 text-center px-2 py-[5rem]">
          Roots are your top 10 songs — the tracks that define you the most.
          Think of them as a musical snapshot of who you are right now.
        </p>
      ) : isOwner ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="roots" direction="horizontal">
            {(provided) => (
              <div
                className="flex space-x-6 overflow-x-auto overflow-y-visible snap-x px-2 min-h-[14rem] items-center"
                
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {roots.map((song, i) => (
                  <Draggable
                    key={song.id}
                    draggableId={String(song.id)}
                    index={i}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`${
                          snapshot.isDragging ? "scale-105 shadow-2xl z-50" : ""
                        }`}
                      >
                        {renderRootCard(song, i)}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <div className="flex space-x-6 overflow-x-auto overflow-y-visible scrollbar-thin snap-x px-2 min-h-[14rem] items-center">
          {roots.map((song, i) => (
            <div key={song.id}>{renderRootCard(song, i)}</div>
          ))}
        </div>
      )}

      {showModal && isOwner && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-slideUp">
          <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-lg space-y-4 shadow-xl">
            <h2 className="text-xl font-bold">Add to Roots</h2>
            <RootsSearchBar onSelect={(song) => setSelectedSong(song)} />
            {selectedSong && (
              <div className="flex items-center gap-4 mt-2 hover:scale-[1.03] transition-transform">
                <img
                  src={selectedSong.albumArtUrl}
                  alt={selectedSong.title}
                  className="w-12 h-12 rounded"
                />
                <div>
                  <p className="font-semibold">{selectedSong.title}</p>
                  <p className="text-sm text-zinc-400">{selectedSong.artist}</p>
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-4 flex-wrap">
              {Array.from({ length: 10 }, (_, i) => {
                const pos = i + 1;
                const isTaken = takenPositions.includes(pos);

                // Default selected is the first available position
                const defaultPosition =
                  position ??
                  Array.from({ length: 10 }, (_, j) => j + 1).find(
                    (p) => !takenPositions.includes(p)
                  );

                const isSelected = position === pos || defaultPosition === pos;

                return (
                  <div
                    key={pos}
                    onClick={() => !isTaken && setPosition(pos)}
                    className={`w-10 h-10 flex items-center justify-center rounded-full cursor-pointer font-bold transition-all duration-200 ${
                      isTaken
                        ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                        : "text-white hover:scale-105"
                    }`}
                    style={{
                      backgroundColor: isSelected
                        ? accentColor
                        : isTaken
                        ? undefined
                        : "#1f1f1f",
                      transform: isSelected ? "scale(1.1)" : undefined,
                      boxShadow: isSelected
                        ? `0 0 10px ${accentColor}`
                        : undefined,
                    }}
                  >
                    {pos}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedSong(null);
                  setPosition(null);
                }}
                className="px-4 py-2 bg-zinc-700 rounded hover:bg-zinc-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addRoot}
                className="px-4 py-2 rounded hover:brightness-110 transition-colors"
                style={{ backgroundColor: accentColor }}
                disabled={!selectedSong}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
