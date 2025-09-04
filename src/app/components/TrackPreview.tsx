"use client";

import { Track } from "../types/spotify";

interface TrackPreviewProps {
  track: Track;
  imagePreview: string | null;
}

export default function TrackPreview({ track, imagePreview }: TrackPreviewProps) {
  return (
    <div className="p-4 bg-zinc-900 border border-zinc-700 rounded-md space-y-4">
      <div className="flex items-center gap-4">
        <img
          src={imagePreview || track.album.images[0]?.url}
          alt="Selected"
          className="w-16 h-16 rounded object-cover"
        />
        <div>
          <p className="text-white font-semibold">{track.name}</p>
          <p className="text-sm text-zinc-400">{track.artists[0]?.name}</p>
        </div>
      </div>

      <div>
        <p className="text-xs text-zinc-400 mb-1">
          Preview with Spotify player. You must be logged into Spotify and click play.
        </p>
        <iframe
          title="Spotify Embed Player"
          src={`https://open.spotify.com/embed/track/${track.id}`}
          width="100%"
          height="80"
          allow="encrypted-media"
          style={{ borderRadius: 8, border: "none" }}
        />
        <a
          href={`https://open.spotify.com/track/${track.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-purple-400 hover:underline mt-1 block"
        >
          Open in Spotify
        </a>
      </div>
    </div>
  );
}