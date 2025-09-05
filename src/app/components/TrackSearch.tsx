"use client";

import { useEffect, useRef, useState } from "react";
import { Track } from "../types/spotify";
import { useAuth } from "../context/AuthContext";
import { searchSpotify } from "../lib/spotifyApi";

interface TrackSearchProps {
  onSelectTrack: (track: Track) => void;
  initialTrack?: Track | null;
}

export default function TrackSearch({ onSelectTrack }: TrackSearchProps) {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchResults = async (searchTerm: string) => {
    if (!searchTerm.trim() || !user?.username) return setTracks([]);
  
    const results = await searchSpotify(searchTerm, user.username); // RootSongInput[]
    
    const mappedTracks: Track[] = results.map((r) => ({
      id: r.trackId, // required for Track
      name: r.title,
      artists: [{ name: r.artist }],
      album: { images: [{ url: r.albumArtUrl }] },
    }));
  
    setTracks(mappedTracks);
  };
  

  const handleSelectTrack = (track: Track) => {
    onSelectTrack(track);
    setIsFocused(false);
    setQuery(""); // clear input after selecting
  };

  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      fetchResults(query);
    }, 300);

    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef}>
      <input
        type="text"
        placeholder="Search for a song"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        className="w-full p-3 bg-zinc-900 text-white border border-zinc-700 rounded-md focus:ring-2 focus:ring-purple-600"
      />
      {isFocused && tracks.length > 0 && (
        <ul className="mt-2 max-h-96 overflow-y-auto rounded-md border border-zinc-700 bg-zinc-900 shadow-lg z-50">
          <li className="px-4 pt-3 pb-2 text-sm text-purple-500 font-semibold tracking-wide">
            Results
          </li>
          {tracks.map((track) => (
            <li
              key={track.id}
              onClick={() => handleSelectTrack(track)}
              className="flex items-center gap-4 px-4 py-3 hover:bg-zinc-800 cursor-pointer"
            >
              <img
                src={track.album.images[0]?.url}
                alt={track.name}
                className="w-12 h-12 rounded object-cover"
              />
              <div>
                <p className="font-semibold text-white">{track.name}</p>
                <p className="text-sm text-zinc-400">
                  {track.artists[0]?.name}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
