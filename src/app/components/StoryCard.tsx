"use client";

import { FC, useEffect, useRef, useState } from "react";
import { StoryDto } from "../types/Story";
import Image from "next/image";
import getS3Url from "../utils/S3Url";
import { useAuth } from "../context/AuthContext";
import { FiMoreVertical } from "react-icons/fi";
import { useApplePlayer } from "../context/ApplePlayerContext";
import { flagStory } from "../lib/storiesApi";
import { FaRegFlag } from "react-icons/fa";
import { createPortal } from "react-dom";

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
  duration?: number;
  isStoryModal?: boolean;
}

const StoryCard: FC<StoryCardProps> = ({
  story,
  onDelete,
  duration = 60000,
  isStoryModal,
}) => {
  const { user } = useAuth();
  const isAuthor = user?.username === story.authorUsername;

  const imageUrl = story.contentUrl || story.albumArtUrl || "/placeholder.png";

  const [menuOpen, setMenuOpen] = useState(false);
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [flagReason, setFlagReason] = useState("");
  const [flagLoading, setFlagLoading] = useState(false);
  const [trackVolume, setTrackVolume] = useState(0.3);

  const videoRef = useRef<HTMLVideoElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const {
    playPreview,
    pausePreview,
    initPlayer,
    isReady,
    currentUrl,
    isPlaying,
  } = useApplePlayer();

  const isVideo = story.type === "VIDEO";

  useEffect(() => {
    if (!isReady) initPlayer();
  }, [initPlayer, isReady]);

  const togglePlayPause = () => {
    if (isVideo && videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        story.applePreviewUrl &&
          (pausePreview(),
          setTimeout(
            () => playPreview(story.applePreviewUrl!, trackVolume),
            50
          ));
      } else {
        videoRef.current.pause();
        story.applePreviewUrl && pausePreview();
      }
    } else if (story.applePreviewUrl) {
      if (currentUrl === story.applePreviewUrl && isPlaying) pausePreview();
      else
        pausePreview(),
          setTimeout(
            () => playPreview(story.applePreviewUrl!, trackVolume),
            50
          );
    }
  };

  useEffect(() => {
    if (!isVideo && story.applePreviewUrl && isStoryModal && isReady) {
      const timer = setTimeout(
        () => playPreview(story.applePreviewUrl!, trackVolume).catch(() => {}),
        100
      );
      return () => clearTimeout(timer);
    }
    if (!isStoryModal && story.applePreviewUrl) pausePreview();
  }, [
    isStoryModal,
    story.applePreviewUrl,
    isVideo,
    trackVolume,
    playPreview,
    pausePreview,
    isReady,
  ]);

  useEffect(() => {
    if (
      !isVideo &&
      story.applePreviewUrl &&
      isStoryModal &&
      currentUrl === story.applePreviewUrl &&
      isPlaying
    ) {
      playPreview(story.applePreviewUrl, trackVolume);
    }
  }, [
    trackVolume,
    story.applePreviewUrl,
    isVideo,
    playPreview,
    currentUrl,
    isPlaying,
    isStoryModal,
  ]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = () => {
    onDelete && onDelete(story.id);
  };

  const handleFlagSubmit = async () => {
    if (!flagReason.trim() || !user) return;
    setFlagLoading(true);
    try {
      await flagStory(story.id, user.id, flagReason.trim());
      alert("Story flagged successfully.");
      setFlagModalOpen(false);
      setFlagReason("");
      setMenuOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to flag story.");
    } finally {
      setFlagLoading(false);
    }
  };

  return (
    <div className="relative w-[360px] h-[640px] mx-auto rounded-xl overflow-hidden shadow-2xl bg-zinc-900 flex flex-col items-center justify-center">
      {/* Story media */}
      {!story.contentUrl && (
        <div className="absolute inset-0 cursor-pointer">
          <Image src={imageUrl} alt="Story" fill className="object-contain" />
        </div>
      )}

      {story.contentUrl && (
        <div className="absolute inset-0 cursor-pointer">
          <Image src={imageUrl} alt="Story" fill className="object-cover" />
        </div>
      )}

      {/* Top bar */}
      <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-3 bg-black backdrop-blur-md rounded-xl px-2 py-2">
          <div className="w-10 h-10 p-[2px] rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500">
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
          <div className="flex flex-col">
            <span className="text-white font-semibold text-sm truncate">
              {story.authorUsername}
            </span>
            <span className="text-gray-300 text-xs">
              {timeAgo(story.createdAt)}
            </span>
          </div>
        </div>

        {/* Options menu */}
        <div ref={menuRef} className="relative z-30">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((prev) => !prev);
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            className="text-white hover:text-gray-400 transition-colors hover:bg-gray-700 hover:rounded-full p-2"
            title="Options"
          >
            <FiMoreVertical size={24} />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 mt-2 w-44 bg-black/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-700 pointer-events-auto overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {/* Flag Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFlagModalOpen(true);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-yellow-400 hover:bg-yellow-500/10 transition-colors"
              >
                <FaRegFlag className="w-4 h-4" />
                Flag Story
              </button>

              {/* Divider */}
              {isAuthor && onDelete && (
                <div className="border-t border-gray-700"></div>
              )}

              {/* Delete Button */}
              {isAuthor && onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-600/10 transition-colors"
                >
                  <span className="w-4 h-4 bg-red-500 rounded-full"></span>
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {story.applePreviewUrl && (
        <div className="absolute bottom-6 left-4 right-4 z-20 flex items-center gap-3 bg-black/70 backdrop-blur-md px-3 py-2 rounded-2xl">
          <img
            src={story.albumArtUrl || "/placeholder.png"}
            alt={story.trackName}
            className="w-14 h-14 object-cover rounded-lg"
          />
          <div className="flex flex-col flex-1 overflow-hidden">
            <span className="text-white font-semibold truncate">
              {story.trackName}
            </span>
            <span className="text-gray-300 text-sm truncate">
              {story.artistName || "Unknown Artist"}
            </span>
          </div>
        </div>
      )}
      {/* Flag Modal */}
      {flagModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 p-6 rounded-xl w-96">
            <h2 className="text-white text-lg font-semibold mb-4">
              Flag Story
            </h2>
            <textarea
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
              placeholder="Reason for flagging (e.g., Spam, Hate Speech)"
              className="w-full p-2 rounded bg-zinc-800 text-white border border-zinc-700 focus:outline-none"
              rows={4}
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleFlagSubmit}
                disabled={flagLoading}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded"
              >
                {flagLoading ? "Submitting..." : "Submit"}
              </button>
              <button
                onClick={() => setFlagModalOpen(false)}
                className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryCard;
