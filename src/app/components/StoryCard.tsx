"use client";

import { FC, useEffect, useRef, useState } from "react";
import { StoryDto } from "../types/Story";
import Image from "next/image";
import getS3Url from "../utils/S3Url";
import { useAuth } from "../context/AuthContext";
import { FiMoreVertical } from "react-icons/fi";
import { fetchSpotifyToken } from "../lib/spotifyApi/route";
import { LuAudioLines } from "react-icons/lu";
import { SpotifyPlayer } from "../types/spotify-playback";

function timeAgo(dateString: string) {
  const now = new Date();
  const then = new Date(dateString);
  const diffMs = now.getTime() - then.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffDay > 0) return `${diffDay}d ago`;
  if (diffHr > 0) return `${diffHr}h ago`;
  if (diffMin > 0) return `${diffMin}m ago`;
  return "Just now";
}

interface StoryCardProps {
  story: StoryDto;
  onDelete?: (storyId: number) => void;
  duration?: number; // ms
}

const StoryCard: FC<StoryCardProps> = ({
  story,
  onDelete,
  duration = 60000,
}) => {
  const { user } = useAuth();
  const isAuthor = user?.username === story.authorUsername;
  const isSpotifyPremium = user?.spotifyPremium && user?.spotifyConnected;

  const imageUrl = story.contentUrl || story.albumArtUrl || "/placeholder.png";

  const [menuOpen, setMenuOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true); // track play/pause state
  const [spotifyVolume, setSpotifyVolume] = useState(0.1); // default 0.1
  const playerRef = useRef<SpotifyPlayer | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null); // video ref
  const menuRef = useRef<HTMLDivElement | null>(null);

  const handleVideoClick = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      if (playerRef.current) playerRef.current.pause?.();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      if (playerRef.current) playerRef.current.resume?.();
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(e.target.value);
    setSpotifyVolume(volume);
    if (playerRef.current) playerRef.current.setVolume(volume).catch(() => {});
  };

  useEffect(() => {
    if (!isSpotifyPremium || !story.trackId) return;

    let isCancelled = false;

    const initPlayer = async () => {
      const token = await fetchSpotifyToken();
      if (!token || isCancelled) return;

      if (!window.Spotify) {
        console.error("Spotify SDK not loaded");
        return;
      }

      const player: SpotifyPlayer = new window.Spotify.Player({
        name: "Trasora Story Player",
        getOAuthToken: (cb) => cb(token),
        volume: spotifyVolume,
      });

      playerRef.current = player;

      player.addListener("ready", async (state) => {
        if (isCancelled) return;
        if (!("device_id" in state) || !state.device_id) return;

        try {
          await fetch(
            `https://api.spotify.com/v1/me/player/play?device_id=${state.device_id}`,
            {
              method: "PUT",
              body: JSON.stringify({
                uris: [`spotify:track:${story.trackId}`],
              }),
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          await player.setVolume(spotifyVolume);
        } catch (err) {
          console.error("Error playing track:", err);
        }
      });

      await player.connect();
    };

    initPlayer();

    return () => {
      isCancelled = true;
      if (playerRef.current) {
        playerRef.current.pause?.().catch(() => {});
        playerRef.current.disconnect();
        playerRef.current = null;
      }
    };
  }, [story.trackId, isSpotifyPremium, spotifyVolume]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDelete = () => {
    if (onDelete) onDelete(story.id);
  };

  return (
    <div className="relative w-[360px] h-[640px] mx-auto rounded-xl overflow-hidden shadow-lg bg-black flex flex-col items-center justify-center">
      {/* Story media */}
      {story.type === "VIDEO" ? (
        <video
          ref={videoRef}
          src={story.contentUrl}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          loop
          playsInline
          onClick={handleVideoClick}
        />
      ) : story.contentUrl ? (
        <div className="absolute inset-0">
          <Image
            src={imageUrl}
            alt="Story"
            fill
            className="object-cover"
            priority
          />
        </div>
      ) : story.albumArtUrl ? (
        <div className="flex items-center justify-center flex-1">
          <Image
            src={imageUrl}
            alt="Album Art"
            width={356}
            height={356}
            className="object-cover"
          />
        </div>
      ) : null}

      {/* Top bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          {story.authorProfilePictureUrl && (
            <div className="mt-5 w-10 h-10 p-[2px] rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500">
              <div className="w-full h-full rounded-full overflow-hidden border-2 border-black">
                <Image
                  src={getS3Url(story.authorProfilePictureUrl)}
                  alt={story.authorUsername}
                  width={40}
                  height={40}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col mt-5">
            <span className="text-white font-semibold text-sm truncate">
              {story.authorUsername}
            </span>
            <span className="text-gray-300 text-xs">
              {timeAgo(story.createdAt)}
            </span>
          </div>
        </div>

        {/* Options menu */}
        {isAuthor && onDelete && (
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              onMouseDown={(e) => e.stopPropagation()}
              className="text-white hover:text-gray-400 transition-colors hover:bg-gray-700 hover:rounded-full p-1"
              title="Options"
            >
              <FiMoreVertical size={22} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-24 bg-black rounded-lg shadow-lg border border-gray-700 z-30">
                <button
                  onClick={handleDelete}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-800 rounded-lg"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Track info overlay with inline volume slider */}
      {story.trackId && isSpotifyPremium && (
        <div className="absolute bottom-8 left-4 right-4 z-20 flex items-center gap-3 bg-black/90 px-3 py-2 rounded-md">
          <img
            src={story.albumArtUrl || "/placeholder.png"}
            alt={story.trackName}
            className="w-12 h-12 object-cover rounded-md"
          />
          <div className="flex flex-col flex-1 overflow-hidden">
            <span className="text-white font-semibold truncate">
              {story.trackName}
            </span>
            <span className="text-gray-300 text-sm truncate">
              {story.artistName || "Unknown Artist"}
            </span>
          </div>

          {/* Audio icon + inline volume slider */}
          <div className="flex items-center gap-1">
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={spotifyVolume}
              onChange={handleVolumeChange}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className="w-20 h-1 rounded-full accent-purple-500 mr-3"
            />
            <LuAudioLines className="text-purple-400 w-6 h-6" />
          </div>
        </div>
      )}

      {/* Fallback for non-premium Spotify track */}
      {story.trackId && !isSpotifyPremium && (
        <iframe
          src={`https://open.spotify.com/embed/track/${story.trackId}`}
          className="absolute bottom-8 left-4 right-4 h-20 rounded-md"
          allow="encrypted-media"
          frameBorder="0"
          title={story.trackName}
        />
      )}
    </div>
  );
};

export default StoryCard;
