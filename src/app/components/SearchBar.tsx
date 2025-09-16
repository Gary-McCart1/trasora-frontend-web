"use client";

import { useState, useEffect, useRef } from "react";
import SearchInput from "./SearchInput";
import SearchResults from "./SearchResults";
import { useAuth } from "../context/AuthContext";
import { getAuthHeaders } from "../lib/usersApi";
import { SearchUser, SearchTrack } from "../types/Search";

interface AppleMusicTrackAttributes {
  name: string;
  artistName: string;
  artwork?: { url: string };
  previews?: { url: string }[];
}

interface AppleMusicTrack {
  id: string;
  attributes: AppleMusicTrackAttributes;
}

interface AppleMusicResponse {
  results?: {
    songs?: { data?: AppleMusicTrack[] };
  };
}

interface UserApiResponse {
  users?: {
    id: number;
    username: string;
    profilePictureUrl?: string | null;
  }[];
}

export default function SearchBar() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [tracks, setTracks] = useState<SearchTrack[]>([]);
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setTracks([]);
      setUsers([]);
      return;
    }

    try {
      if (!user) return;

      const headers = { ...getAuthHeaders(), Username: user.username };

      const [appleRes, userRes] = await Promise.all([
        fetch(
          `https://trasora-backend-e03193d24a86.herokuapp.com/api/apple-music/search?q=${encodeURIComponent(
            searchTerm
          )}`,
          { headers }
        ),
        fetch(
          `https://trasora-backend-e03193d24a86.herokuapp.com/api/auth/search-bar?q=${encodeURIComponent(
            searchTerm
          )}`,
          { headers }
        ),
      ]);

      if (!appleRes.ok) throw new Error(`Apple Music API error: ${appleRes.status}`);
      if (!userRes.ok) throw new Error(`User API error: ${userRes.status}`);

      const appleData: AppleMusicResponse = await appleRes.json();
      const userData: UserApiResponse = await userRes.json();

      const appleTracks: SearchTrack[] = (appleData.results?.songs?.data || [])
        .slice(0, 5)
        .map((t) => ({
          id: t.id,
          title: t.attributes.name,
          user: {
            id: t.id,
            username: t.attributes.artistName,
            avatar_url: t.attributes.artwork?.url
              ?.replace("{w}", "100")
              ?.replace("{h}", "100") || null,
          },
          artwork_url: t.attributes.artwork?.url
            ?.replace("{w}", "100")
            ?.replace("{h}", "100") || null,
          stream_url: t.attributes.previews?.[0]?.url || undefined,
        }));
        console.log(appleTracks)

      const mappedUsers: SearchUser[] = (userData.users || [])
        .slice(0, 5)
        .map((u) => ({
          id: u.id,
          username: u.username,
          profilePictureUrl: u.profilePictureUrl ?? null,
        }));

      setTracks(appleTracks);
      setUsers(mappedUsers);
      setError(null);
    } catch (err) {
      console.error("Search error:", err);
      setError(
        err instanceof Error && err.message.toLowerCase().startsWith("apple music")
          ? "Could not fetch songs from Apple Music."
          : "Something went wrong. Please try again."
      );
      setTracks([]);
      setUsers([]);
    }
  };

  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => fetchResults(query), 300);
  
    // Cleanup
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [query]);
  

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && event.target instanceof Node && !containerRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div ref={containerRef} className="relative w-full">
      <SearchInput query={query} setQuery={setQuery} onFocus={() => setIsFocused(true)} />
      {isFocused && (
        <>
          {error ? (
            <div className="absolute top-full mt-2 w-full bg-red-900/70 text-red-200 text-sm p-3 rounded-lg shadow-lg">
              {error}
            </div>
          ) : (
            <SearchResults users={users} tracks={tracks} />
          )}
        </>
      )}
    </div>
  );
}
