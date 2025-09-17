"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { PostDto } from "../types/Post";
import { motion } from "framer-motion";
import PostActions from "./PostActions";
import { Play, Pause } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useApplePlayer } from "../context/ApplePlayerContext";

const PREVIEW_DURATION = 30; // preview length in seconds

interface PostCardProps {
  post: PostDto;
  trackVolume?: number;
  isDetailView?: boolean;
  currentUsername?: string;
  onEdit?: (postId: number) => void;
  onDelete?: (postId: number) => void;
  onLike?: (postId: number) => void;
  onComment?: (postId: number, commentText: string) => void;
  onClick?: () => void;
  showActions?: boolean;
  large?: boolean;
  fullWidth?: boolean;
  isMock?: boolean;
  profileFeed: boolean;
  onMediaDimensionsChange?: (dimensions: { width: number; height: number }) => void;
  currentTrackId?: string;
  isActive?: boolean;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  profilePage?: boolean;
  onManualPause?: (url: string) => void;
}

export default function PostCard({
  post,
  trackVolume,
  isDetailView = false,
  currentUsername,
  onEdit,
  onDelete,
  onLike,
  onComment,
  onClick,
  showActions = true,
  large = false,
  fullWidth,
  isMock,
  profileFeed = false,
  isActive,
  onMediaDimensionsChange,
  videoRef,
  onManualPause,
}: PostCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const elapsedRef = useRef(0); // track elapsed seconds
  const internalVideoRef = useRef<HTMLVideoElement>(null);

  const { user } = useAuth();
  const { currentUrl, isPlaying: contextIsPlaying, playPreview, pausePreview } =
    useApplePlayer();

  const isVideo = !!post.customVideoUrl;
  const activeVideoRef = videoRef || internalVideoRef;

  useEffect(() => {
    if (!post.applePreviewUrl) return;
  
    if (currentUrl !== post.applePreviewUrl) {
      // Another post started playing
      elapsedRef.current = 0;
      setProgress(0);
      setIsPlaying(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  }, [currentUrl, post.applePreviewUrl]);

  // Sync local isPlaying state with context and props
  useEffect(() => {
    if (!isVideo && post.applePreviewUrl) {
      setIsPlaying(currentUrl === post.applePreviewUrl && contextIsPlaying);
    } else if (isVideo && activeVideoRef.current) {
      setIsPlaying(!activeVideoRef.current.paused);
    }
  }, [currentUrl, contextIsPlaying, isVideo, post.applePreviewUrl, activeVideoRef]);

  // Animate circular progress for 30s preview
  useEffect(() => {
    if (!isPlaying || !post.applePreviewUrl) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = window.setInterval(() => {
      elapsedRef.current += 0.05; // increment by interval
      const nextProgress = Math.min(elapsedRef.current / PREVIEW_DURATION, 1);
      setProgress(nextProgress);

      if (nextProgress >= 1) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsPlaying(false);
        setProgress(0);
        elapsedRef.current = 0;
      }
    }, 50);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, post.applePreviewUrl]);

  // Apply volume for audio previews without autoplay
  useEffect(() => {
    if (!isVideo && trackVolume !== undefined && post.applePreviewUrl) {
      playPreview(post.applePreviewUrl, trackVolume);
      pausePreview();
    }
  }, [trackVolume, isVideo, post.applePreviewUrl, playPreview, pausePreview]);

  // Auto-play if active
  useEffect(() => {
    if (!isVideo && isActive && post.applePreviewUrl) {
      playPreview(post.applePreviewUrl, trackVolume ?? 0.3);
      setIsPlaying(true);
    }
  }, [isActive, isVideo, post.applePreviewUrl, playPreview, trackVolume]);

  // Toggle play/pause
  const togglePlayPause = useCallback(() => {
    if (isVideo) {
      if (!activeVideoRef.current) return;
      if (activeVideoRef.current.paused) {
        activeVideoRef.current.play().catch(() => {});
        setIsPlaying(true);
        onManualPause?.("");
      } else {
        activeVideoRef.current.pause();
        setIsPlaying(false);
        onManualPause?.("");
      }
    } else if (post.applePreviewUrl) {
      if (currentUrl === post.applePreviewUrl && contextIsPlaying) {
        pausePreview();
        setIsPlaying(false);
      } else {
        playPreview(post.applePreviewUrl, trackVolume ?? 0.3);
        setIsPlaying(true);
      }
    }
  }, [
    isVideo,
    activeVideoRef,
    post.applePreviewUrl,
    currentUrl,
    contextIsPlaying,
    playPreview,
    pausePreview,
    trackVolume,
    onManualPause,
  ]);

  // Pause video on tab hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isVideo) {
        activeVideoRef.current?.pause();
        setIsPlaying(false);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [activeVideoRef, isVideo]);

  // Progress circle parameters
  const radius = 28;
  const stroke = 4;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`sm:w-[100%] rounded-3xl shadow-lg relative cursor-pointer bg-opacity-10 backdrop-blur-sm ${
        fullWidth
          ? "w-[75%]"
          : large
          ? "max-w-lg"
          : isMock
          ? "max-w-xs"
          : "max-w-md"
      } sm:ml-0`}
      onClick={onClick}
    >
      {/* Track Info Bar */}
      <div
        className={`absolute top-0 left-1/2 transform -translate-x-1/2 w-[100.5%] h-[90px] rounded-t-xl flex items-center px-4 gap-4 z-10 ${
          isActive ? "bg-purple-600" : "bg-zinc-900"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={post.albumArtUrl || "/default-album-cover.png"}
          alt={post.trackName || "Track"}
          className="w-14 h-14 rounded-md object-cover"
        />
        <div className="flex flex-col overflow-hidden flex-1">
          <span className="font-semibold truncate text-white">{post.trackName}</span>
          <span className="text-sm truncate text-gray-200">
            {post.artistName || "Unknown Artist"}
          </span>
        </div>

        {/* Play/Pause with circular progress */}
        {(post.applePreviewUrl || isVideo) && (
          <div
            className="cursor-pointer rounded-full relative flex items-center justify-center p-2 bg-purple-700"
            onClick={togglePlayPause}
            style={{ width: 44, height: 44 }}
          >
            <svg
              height={radius * 2}
              width={radius * 2}
              className="absolute top-[-1] left-[-1] transform -rotate-90"
            >
              <circle
                stroke="#ffffff0"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
              <circle
                stroke="#fff"
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                style={{ transition: "stroke-dashoffset 0.05s linear" }}
              />
            </svg>
            {isPlaying ? <Pause className="text-white w-6 h-6" /> : <Play className="text-white w-6 h-6" />}
          </div>
        )}
      </div>

      {/* Post Media */}
      <div className="relative w-full mt-[90px]">
        {isVideo ? (
          <div className="relative w-full" style={{ paddingBottom: "177.78%" }}>
            <video
              ref={activeVideoRef}
              src={post.customVideoUrl}
              className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-full object-cover rounded-md"
              loop
              playsInline
              onClick={(e) => {
                e.stopPropagation();
                togglePlayPause();
              }}
            />
          </div>
        ) : (
          <div className="relative w-full" style={{ paddingBottom: "100%" }}>
            <img
              src={post.customImageUrl || post.albumArtUrl || "/default-album-cover.png"}
              alt={post.trackName || "Track"}
              className={`${!isDetailView ? "rounded-b-lg" : ""} absolute top-0 left-0 w-full h-full object-cover ${
                imageLoaded ? "opacity-100" : "opacity-0"
              } transition-opacity duration-300`}
              onLoad={(e) => {
                setImageLoaded(true);
                const img = e.currentTarget;
                onMediaDimensionsChange?.({
                  width: img.naturalWidth,
                  height: img.naturalHeight,
                });
              }}
            />
          </div>
        )}
      </div>

      {(isDetailView || isMock) && showActions && (
        <PostActions
          postId={post.id ?? 0}
          authorUsername={post.authorUsername ?? "unknown"}
          authorProfilePictureUrl={post.authorProfilePictureUrl ?? ""}
          currentUsername={currentUsername}
          likesCount={post.likesCount ?? 0}
          commentsCount={post.comments?.length ?? 0}
          likedByCurrentUser={post.likedByCurrentUser ?? false}
          comments={post.comments ?? []}
          onEdit={onEdit}
          onDelete={onDelete}
          onLike={onLike}
          onComment={onComment}
          caption={post.text ?? ""}
          createdAt={post.createdAt ?? ""}
          branchCount={post.branchCount ?? 0}
          selectedSong={{
            trackId: post.trackId ?? "",
            title: post.trackName ?? "",
            artist: post.artistName ?? "Unknown Artist",
            albumArtUrl: post.albumArtUrl ?? "",
          }}
        />
      )}
    </motion.div>
  );
}
