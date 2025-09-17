"use client";

import { FC, useEffect, useRef, useState } from "react";
import { StoryDto } from "../types/Story";
import Image from "next/image";
import getS3Url from "../utils/S3Url";
import { useAuth } from "../context/AuthContext";
import { FiMoreVertical } from "react-icons/fi";
import { useApplePlayer } from "../context/ApplePlayerContext";

function timeAgo(dateString: string) {
  const now = new Date();
  const then = new Date(dateString);
  const diffSec = Math.floor((now.getTime() - then.getTime()) / 1000);
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

const StoryCard: FC<StoryCardProps> = ({ story, onDelete, duration = 60000 }) => {
  console.log(story)
  const { user } = useAuth();
  const isAuthor = user?.username === story.authorUsername;

  const imageUrl = story.contentUrl || story.albumArtUrl || "/placeholder.png";

  const [menuOpen, setMenuOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [trackVolume, setTrackVolume] = useState(0.3);
  const videoRef = useRef<HTMLVideoElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const { currentUrl, isPlaying: contextIsPlaying, playPreview, pausePreview } = useApplePlayer();

  const isVideo = story.type === "VIDEO";

  // Auto-play Apple Music preview if available
  useEffect(() => {
    if (!isVideo && story.applePreviewUrl) {
      playPreview(story.applePreviewUrl, trackVolume);
      setIsPlaying(true);
    }
  }, [story.applePreviewUrl, isVideo, playPreview, trackVolume]);

  // Sync volume live
  useEffect(() => {
    if (!isVideo && story.applePreviewUrl) {
      playPreview(story.applePreviewUrl, trackVolume);
    }
  }, [trackVolume, story.applePreviewUrl, isVideo, playPreview]);

  // Handle play/pause for video or Apple Music
  const togglePlayPause = () => {
    if (isVideo && videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    } else if (story.applePreviewUrl) {
      if (currentUrl === story.applePreviewUrl && contextIsPlaying) {
        pausePreview();
        setIsPlaying(false);
      } else {
        playPreview(story.applePreviewUrl, trackVolume);
        setIsPlaying(true);
      }
    }
  };

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = () => {
    if (onDelete) onDelete(story.id);
  };

  return (
    <div className="relative w-[360px] h-[640px] mx-auto rounded-xl overflow-hidden shadow-lg bg-black flex flex-col items-center justify-center">
      {/* Story media */}
      {isVideo ? (
        <video
          ref={videoRef}
          src={story.contentUrl}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          loop
          playsInline
          onClick={togglePlayPause}
        />
      ) : story.contentUrl ? (
        <div className="absolute inset-0">
          <Image src={imageUrl} alt="Story" fill className="object-cover" priority />
        </div>
      ) : story.albumArtUrl ? (
        <div className="flex items-center justify-center flex-1">
          <Image src={imageUrl} alt="Album Art" width={356} height={356} className="object-cover" />
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
            <span className="text-white font-semibold text-sm truncate">{story.authorUsername}</span>
            <span className="text-gray-300 text-xs">{timeAgo(story.createdAt)}</span>
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
                  onTouchStart={(e) => e.stopPropagation()}
                  className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-800 rounded-lg"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Track info overlay with volume slider */}
      {story.applePreviewUrl && (
        <div className="absolute bottom-8 left-4 right-4 z-20 flex items-center gap-3 bg-black/90 px-3 py-2 rounded-md">
          <img
            src={story.albumArtUrl || "/placeholder.png"}
            alt={story.trackName}
            className="w-12 h-12 object-cover rounded-md"
          />
          <div className="flex flex-col flex-1 overflow-hidden">
            <span className="text-white font-semibold truncate">{story.trackName}</span>
            <span className="text-gray-300 text-sm truncate">{story.artistName || "Unknown Artist"}</span>
          </div>

          
        </div>
      )}
    </div>
  );
};

export default StoryCard;
