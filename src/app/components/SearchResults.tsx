import React from "react";
import UserResultItem from "./UserResultItem";
import TrackResultItem from "./TrackResultItem";
import ArtistResultItem from "./ArtistResultItem";

// Keep these in sync with your API route return types
export interface Artist {
  id: string;
  name: string;
  images: { url: string }[];
}

export interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { images: { url: string }[] };
}

export interface User {
  id: number; // Ensure this comes from API
  username: string;
  profilePictureUrl: string | null;
}

export interface SearchResultsProps {
  users: User[];
  tracks: Track[];
  artists: Artist[];
}

export default function SearchResults({ users, tracks, artists }: SearchResultsProps) {
  if (users.length === 0 && tracks.length === 0 && artists.length === 0) return null;

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

      {(tracks.length > 0 || artists.length > 0) && (
        <>
          <li className="px-4 pt-4 pb-2 text-sm text-purple-400 font-semibold uppercase tracking-wider">
            Songs & Artists
          </li>

          {tracks.map((track) => (
            <TrackResultItem key={track.id} track={track} />
          ))}

          {artists.map((artist) => (
            <ArtistResultItem key={artist.id} artist={artist} />
          ))}
        </>
      )}
    </ul>
  );
}
