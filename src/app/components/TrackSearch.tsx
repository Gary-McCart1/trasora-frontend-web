"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getAuthHeaders } from "../lib/usersApi";

interface AppleMusicTrack {
  id: string;
  name: string;
  artistName: string;
  albumArtUrl?: string;
  previewUrl?: string;
}

interface AppleMusicApiSong {
  id: string;
  attributes: {
    name: string;
    artistName: string;
    artwork?: { url: string };
    previews?: { url: string }[];
  };
}


interface TrackSearchProps {
  onSelectTrack: (track: AppleMusicTrack) => void;
}

export default function TrackSearch({ onSelectTrack }: TrackSearchProps) {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [tracks, setTracks] = useState<AppleMusicTrack[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchResults = async (searchTerm: string) => {
    if (!searchTerm.trim() || !user?.username) {
      setTracks([]);
      return;
    }

    try {
      const res = await fetch(`https://trasora-backend-e03193d24a86.herokuapp.com/api/apple-music/search?q=${encodeURIComponent(searchTerm)}`,{
        headers: {
          ...getAuthHeaders()
        }
      });
      const data = await res.json();

      const songs: AppleMusicApiSong[] = data?.results?.songs?.data || [];

      const mapped: AppleMusicTrack[] = songs.map((song) => {
        const attrs = song.attributes;
        return {
          id: song.id,
          name: attrs.name,
          artistName: attrs.artistName,
          albumArtUrl: attrs.artwork?.url
            ? attrs.artwork.url.replace("{w}", "200").replace("{h}", "200")
            : undefined,
          previewUrl:
            attrs.previews && attrs.previews.length > 0
              ? attrs.previews[0].url
              : undefined,
        };
      });

      setTracks(mapped);
    } catch (err) {
      console.error("Apple Music search failed:", err);
      setTracks([]);
    }
  };

  const handleSelectTrack = (track: AppleMusicTrack) => {
    onSelectTrack(track);
    setIsFocused(false);
    setQuery(""); // clear input after selecting
  };

  // Debounced search
  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      fetchResults(query);
    }, 300);

    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [query]);

  // Close dropdown when clicking outside
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
                src={track.albumArtUrl || "/placeholder.png"}
                alt={track.name}
                className="w-12 h-12 rounded object-cover"
              />
              <div>
                <p className="font-semibold text-white">{track.name}</p>
                <p className="text-sm text-zinc-400">{track.artistName}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
