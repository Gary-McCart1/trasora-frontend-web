"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { PostDto } from "../types/Post";
import { motion } from "framer-motion";
import PostActions from "./PostActions";
import { Play, Pause } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useApplePlayer } from "../context/ApplePlayerContext";

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
  onMediaDimensionsChange?: (dimensions: {
    width: number;
    height: number;
  }) => void;
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
  const internalVideoRef = useRef<HTMLVideoElement>(null);
  const { user } = useAuth();
  const {
    currentUrl,
    isPlaying: contextIsPlaying,
    playPreview,
    pausePreview,
  } = useApplePlayer();

  const isVideo = !!post.customVideoUrl;
  const activeVideoRef = videoRef || internalVideoRef;

  // Sync local isPlaying state with context and props
  useEffect(() => {
    if (!isVideo && post.applePreviewUrl) {
      setIsPlaying(currentUrl === post.applePreviewUrl && contextIsPlaying);
    } else if (isVideo && activeVideoRef.current) {
      setIsPlaying(!activeVideoRef.current.paused);
    }
  }, [
    currentUrl,
    contextIsPlaying,
    isVideo,
    post.applePreviewUrl,
    activeVideoRef,
  ]);

  // Apply volume for audio previews
  useEffect(() => {
    if (!isVideo && trackVolume !== undefined && post.applePreviewUrl) {
      playPreview(post.applePreviewUrl, trackVolume);
      pausePreview(); // Ensure we only set volume without autoplaying
    }
  }, [trackVolume, isVideo, post.applePreviewUrl, playPreview, pausePreview]);

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
        onManualPause?.(post.applePreviewUrl);
      } else {
        playPreview(post.applePreviewUrl, trackVolume ?? 0.3);
        setIsPlaying(true);
        onManualPause?.("");
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
        className={`absolute top-0 left-1/2 transform -translate-x-1/2 w-[100.5%] h-[90px] rounded-t-xl flex items-center px-4 gap-4 z-10
          ${isActive ? "bg-purple-600" : "bg-zinc-900"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={post.albumArtUrl || "/default-album-cover.png"}
          alt={post.trackName || "Track"}
          className="w-14 h-14 rounded-md object-cover"
        />
        <div className="flex flex-col overflow-hidden flex-1">
          <span className="font-semibold truncate text-white">
            {post.trackName}
          </span>
          <span className="text-sm truncate text-gray-200">
            {post.artistName || "Unknown Artist"}
          </span>
        </div>
        {(post.applePreviewUrl || isVideo) && (
          <div
            className="cursor-pointer p-2 rounded-full bg-purple-700"
            onClick={togglePlayPause}
          >
            {isPlaying ? (
              <Pause className="text-white w-6 h-6" />
            ) : (
              <Play className="text-white w-6 h-6" />
            )}
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
              src={
                post.customImageUrl ||
                post.albumArtUrl ||
                "/default-album-cover.png"
              }
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
