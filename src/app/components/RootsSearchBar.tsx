"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { searchSpotify } from "../lib/spotifyApi";

export interface RootSongInput {
  title: string;
  artist: string;
  albumArtUrl: string;
  trackId: string;
}
interface SpotifyApiTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { images: { url: string }[] };
}

interface OutputTrack {
  trackTitle: string;
  artistName: string;
  albumArtUrl: string;
  trackId: string;
}

interface RootsSearchBarProps {
  onSelect: (song: RootSongInput) => void;
}

export default function RootsSearchBar({ onSelect }: RootsSearchBarProps) {
  const [query, setQuery] = useState("");
  const [tracks, setTracks] = useState<RootSongInput[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { user } = useAuth();

  const fetchTracks = async (searchTerm: string) => {
    if (!user) return;
    setLoading(true);

    const results = await searchSpotify(searchTerm, user.username);
    setTracks(results);
    setLoading(false);
  };

  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => fetchTracks(query), 300);

    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [query]); // Only depends on the user's query now

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        event.target instanceof Node &&
        !containerRef.current.contains(event.target)
      ) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full ">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        placeholder="Search for a song..."
        className="w-full bg-zinc-800 text-white p-2 rounded-lg border border-zinc-700 focus:outline-none focus:border-purple-600"
      />

      {loading && <p className="text-white text-center mt-2">Searching...</p>}

      {isFocused && tracks.length > 0 && !loading && (
        <ul className="absolute top-full mt-1 w-full bg-zinc-900 rounded shadow-lg max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-zinc-800 z-50">
          {tracks.map((track) => (
            <li
              key={track.trackId}
              onClick={() => {
                onSelect(track);
                setQuery("");
                setIsFocused(false);
              }}
              className="flex items-center gap-3 px-3 py-2 hover:bg-purple-700 cursor-pointer"
            >
              <img
                src={track.albumArtUrl}
                alt={track.title}
                className="w-10 h-10 rounded object-cover"
              />
              <div className="truncate">
                <p className="text-white font-semibold truncate">
                  {track.title}
                </p>
                <p className="text-zinc-400 text-sm truncate">{track.artist}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
