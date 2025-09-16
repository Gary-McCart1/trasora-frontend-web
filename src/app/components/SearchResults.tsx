import React from "react";
import UserResultItem from "./UserResultItem";
import TrackResultItem from "./TrackResultItem";
import { SearchUser, SearchTrack } from "../types/Search";

export interface SearchResultsProps {
  users: SearchUser[];
  tracks: SearchTrack[];
}

export default function SearchResults({ users, tracks }: SearchResultsProps) {
  if (users.length === 0 && tracks.length === 0) return null;

  return (
    <ul className="absolute top-full left-0 mt-1 w-full max-h-96 overflow-y-auto rounded-md border border-zinc-700 bg-zinc-900 shadow-lg text-white text-base z-50">
      {users.length > 0 && (
        <>
          <li className="px-4 pt-4 pb-2 text-sm text-purple-400 font-semibold uppercase tracking-wider">
            Users
          </li>
          {users.map((user) => (
            <UserResultItem key={user.id} user={user} />
          ))}
        </>
      )}

      {tracks.length > 0 && (
        <>
          <li className="px-4 pt-4 pb-2 text-sm text-purple-400 font-semibold uppercase tracking-wider">
            Songs & Artists
          </li>
          {tracks.map((track) => (
            <TrackResultItem key={track.id} track={track} />
          ))}
        </>
      )}
    </ul>
  );
}
