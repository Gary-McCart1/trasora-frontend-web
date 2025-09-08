"use client";

import { useState, useEffect, useRef } from "react";
import SearchInput from "./SearchInput";
import SearchResults from "./SearchResults";
import { useAuth } from "../context/AuthContext";
import { getAuthHeaders } from "../lib/usersApi";

export default function SearchBar() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [tracks, setTracks] = useState([]);
  const [artists, setArtists] = useState([]);
  const [users, setUsers] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setTracks([]);
      setArtists([]);
      setUsers([]);
      return;
    }
  
    try {
      if(!user) return;
      const headers = {
        ...getAuthHeaders(),
        "Username": user?.username, // ✅ add current user's username
      };
  
      const [spotRes, userRes] = await Promise.all([
        fetch(
          `https://trasora-backend-e03193d24a86.herokuapp.com/api/spotify/search?q=${encodeURIComponent(
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
  
      if (!spotRes.ok) throw new Error(`Spotify API error: ${spotRes.status}`);
      if (!userRes.ok) throw new Error(`User API error: ${userRes.status}`);
  
      const data = await spotRes.json();
      const userData = await userRes.json();
  
      setTracks(data.tracks?.items.slice(0, 5) || []);
      setArtists(data.artists?.items.slice(0, 5) || []);
      setUsers(userData.users?.slice(0, 5) || []);
      setError(null);
    } catch (err) {
      console.error("Search error:", err);
  
      if (err instanceof Error && err.message.toLowerCase().startsWith("spotify")) {
        setError("Connect to Spotify to search for tracks and users.");
      } else {
        setError("Something went wrong. Please try again.");
      }
  
      setTracks([]);
      setArtists([]);
      setUsers([]);
    }
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
        event.target instanceof Node &&
        !containerRef.current.contains(event.target)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Fixed: Return a single element, or null if no user
  if (!user) return null;

  return (
    <div ref={containerRef} className="relative w-full">
      <SearchInput
        query={query}
        setQuery={setQuery}
        onFocus={() => setIsFocused(true)}
      />
      {isFocused && (
        <>
          {error ? (
            <div className="absolute top-full mt-2 w-full bg-red-900/70 text-red-200 text-sm p-3 rounded-lg shadow-lg">
              {error}
            </div>
          ) : (
            <SearchResults users={users} tracks={tracks} artists={artists} />
          )}
        </>
      )}
    </div>
  );
}
