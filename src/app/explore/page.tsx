// app/pages/explore.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import DraggablePlayer from "../components/DraggablePlayer";
import TrackCardGrid, { TrackOrAlbum } from "../components/TrackCardGrid";
import { getSpotifyExplore, getSpotifyRecommendations } from "../lib/spotifyApi";

// Define the shape of the track sent to the draggable player
type PlayerTrack = {
  id: string;
  name: string;
  artists?: { name: string }[];
  albumArtUrl: string;
  type?: string;
};

export default function ExplorePage() {
  const { user } = useAuth();
  const [featuredTracks, setFeaturedTracks] = useState<TrackOrAlbum[]>([]);
  const [newReleases, setNewReleases] = useState<TrackOrAlbum[]>([]);
  const [recommendations, setRecommendations] = useState<TrackOrAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecs, setLoadingRecs] = useState(true);
  const [error, setError] = useState<string | null>(null);
  console.log(newReleases)
  // Draggable player state
  const [playingTrack, setPlayingTrack] = useState<PlayerTrack | null>(null);
  console.log(playingTrack)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      setLoading(true);
      setError(null);
      try {
        const { featuredTracks, newReleases } = await getSpotifyExplore(
          user.username
        );
        setFeaturedTracks(featuredTracks);
        setNewReleases(newReleases);

        const recs = await getSpotifyRecommendations();
        setRecommendations(recs);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
        setLoadingRecs(false);
      }
    };

    fetchData();
  }, [user]);

  // Convert a TrackOrAlbum into the format expected by DraggablePlayer
  const handleTrackClick = (track: TrackOrAlbum) => {
    console.log(track.type)
    const playerTrack: PlayerTrack = {
      id: track.id,
      name: track.name,
      artists: track.artists,
      albumArtUrl:
    track.images?.[0]?.url ||
    track.album?.images?.[0]?.url ||
    "/default-album-cover.png",
    type: track.type
    };
    setPlayingTrack(playerTrack);
  };

  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12">
      <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 text-center text-white drop-shadow-lg leading-tight">
        Explore Your Next Favorite Track
      </h1>
      <p
        className="text-center mb-8 text-lg sm:text-xl font-medium bg-clip-text text-transparent 
          bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-500 
          animate-gradient-x drop-shadow-sm"
      >
        Handpicked just for you — dive in and discover something new!
      </p>

      <TrackCardGrid
        title="Recommended for You"
        items={recommendations}
        onClick={handleTrackClick}
        loading={loadingRecs}
      />

      <TrackCardGrid
        title="Trending Songs"
        items={featuredTracks}
        onClick={handleTrackClick}
        loading={loading}
      />

      <TrackCardGrid
        title="Featured"
        items={newReleases}
        onClick={handleTrackClick}
        loading={loading}
      />

      {/* Draggable Player */}
      {playingTrack && (
        <DraggablePlayer
          track={playingTrack}
          onClose={() => setPlayingTrack(null)}
        />
      )}
    </div>
  );
}
