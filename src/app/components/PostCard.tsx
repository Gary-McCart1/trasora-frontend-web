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
  onManualPlay?: (url: string) => void;
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
  onManualPlay, // Added this to destructuring
}: PostCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef(0);
  const internalVideoRef = useRef<HTMLVideoElement>(null);

  const { user } = useAuth();
  const { currentUrl, isPlaying: contextIsPlaying, playPreview, pausePreview } =
    useApplePlayer();


  const isVideo = !!post.customVideoUrl;
  const activeVideoRef = videoRef || internalVideoRef;

  console.log(isVideo)
  // Reset state when another preview starts
  useEffect(() => {
    if (!post.applePreviewUrl) return;
    if (currentUrl !== post.applePreviewUrl) {
      elapsedRef.current = 0;
      setProgress(0);
      setIsPlaying(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  }, [currentUrl, post.applePreviewUrl]);

  // Sync isPlaying with context
  useEffect(() => {
    if (!isVideo && post.applePreviewUrl) {
      setIsPlaying(currentUrl === post.applePreviewUrl && contextIsPlaying);
    } else if (isVideo && activeVideoRef.current) {
      setIsPlaying(!activeVideoRef.current.paused);
    }
  }, [currentUrl, contextIsPlaying, isVideo, post.applePreviewUrl, activeVideoRef]);

  // Add video event listeners for sync
  useEffect(() => {
    if (!isVideo || !activeVideoRef.current) return;

    const video = activeVideoRef.current;

    const handlePlay = () => {
      setIsPlaying(true);
      // Start audio when video starts playing
      if (post.applePreviewUrl) {
        playPreview(post.applePreviewUrl, trackVolume ?? 0.3);
        // Only reset progress if switching to a different song
        if (currentUrl !== post.applePreviewUrl) {
          elapsedRef.current = 0;
          setProgress(0);
        }
      }
    };

    const handlePause = () => {
      setIsPlaying(false);
      // Pause audio when video pauses
      if (post.applePreviewUrl) {
        pausePreview();
      }
      if (onManualPause && post.customVideoUrl) {
        onManualPause(post.customVideoUrl);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (post.applePreviewUrl) {
        pausePreview();
      }
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, [isVideo, activeVideoRef, post.applePreviewUrl, post.customVideoUrl, playPreview, pausePreview, trackVolume, onManualPause, currentUrl]);

  // Animate progress circle
  useEffect(() => {
    if (!isPlaying || !post.applePreviewUrl) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      elapsedRef.current += 0.05;
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

  // Apply volume updates
  useEffect(() => {
    if (!isVideo && trackVolume !== undefined && post.applePreviewUrl) {
      if (currentUrl === post.applePreviewUrl) {
        playPreview(post.applePreviewUrl, trackVolume);
        pausePreview();
      }
    }
  }, [trackVolume, isVideo, post.applePreviewUrl, playPreview, pausePreview, currentUrl]);

  // Autoplay audio preview if active
  useEffect(() => {
    if (!isVideo && isActive && post.applePreviewUrl) {
      playPreview(post.applePreviewUrl, trackVolume ?? 0.3);
      setIsPlaying(true);
    }
  }, [isActive, isVideo, post.applePreviewUrl, playPreview, trackVolume]);

  // Improved toggle play/pause function
  const togglePlayPause = useCallback(() => {
    if (isVideo) {
      if (!activeVideoRef.current) {
        console.warn("Video ref not available");
        return;
      }

      const video = activeVideoRef.current;
      
      if (video.paused) {
        // ▶️ PLAY: Start both video and audio
        console.log("Playing video and audio");
        
        // Start video
        video.play().catch((error) => {
          console.error("Failed to play video:", error);
        });
        
        setIsPlaying(true);

        // Start Apple preview audio if available
        if (post.applePreviewUrl) {
          playPreview(post.applePreviewUrl, trackVolume ?? 0.3);
          // Only reset progress if switching to a different song
          if (currentUrl !== post.applePreviewUrl) {
            elapsedRef.current = 0;
            setProgress(0);
          }
          // Notify parent that user manually played
          onManualPlay?.(post.applePreviewUrl);
        }

        // Also notify for video URL if it exists
        if (post.customVideoUrl && onManualPlay) {
          onManualPlay(post.customVideoUrl);
        }
      } else {
        // ⏸️ PAUSE: Stop both video and audio
        console.log("Pausing video and audio");
        
        // Pause video
        video.pause();
        setIsPlaying(false);

        // Pause Apple preview audio
        if (post.applePreviewUrl) {
          pausePreview();
          // Notify parent that user manually paused
          onManualPause?.(post.applePreviewUrl);
        }

        // Also notify for video URL if it exists
        if (post.customVideoUrl && onManualPause) {
          onManualPause(post.customVideoUrl);
        }
      }
    } else if (post.applePreviewUrl) {
      // Audio-only posts
      const isCurrentlyPlaying = currentUrl === post.applePreviewUrl && contextIsPlaying;
      
      if (isCurrentlyPlaying) {
        // ⏸️ PAUSE: Stop audio
        console.log("Pausing audio");
        pausePreview();
        setIsPlaying(false);
        // Notify parent that user manually paused
        onManualPause?.(post.applePreviewUrl);
      } else {
        // ▶️ PLAY: Start audio
        console.log("Playing audio");
        playPreview(post.applePreviewUrl, trackVolume ?? 0.3);
        setIsPlaying(true);
        // Only reset progress if switching to a different song
        if (currentUrl !== post.applePreviewUrl) {
          elapsedRef.current = 0;
          setProgress(0);
        }
        // Notify parent that user manually played
        onManualPlay?.(post.applePreviewUrl);
      }
    }
  }, [
    isVideo,
    activeVideoRef,
    post.applePreviewUrl,
    post.customVideoUrl,
    currentUrl,
    contextIsPlaying,
    playPreview,
    pausePreview,
    trackVolume,
    onManualPause,
    onManualPlay,
  ]);

  // Pause video if tab hidden
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

  // Progress circle setup
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
      className={`overflow-x-hidden w-full sm:rounded-2xl shadow-lg relative cursor-pointer bg-opacity-10 backdrop-blur-sm ${
        fullWidth
          ? "sm:w-[75%] w-full"
          : large
          ? "sm:max-w-lg w-full"
          : isMock
          ? "sm:max-w-xs w-full"
          : "sm:max-w-md w-full"
      } sm:ml-0`}
      onClick={onClick}
    >
      {/* Track Info */}
      {(isDetailView || isVideo) && <div
        className={`absolute top-0 left-1/2 transform -translate-x-1/2 ${!isDetailView ? "w-[100%] rounded-t-xl": "w-full"} h-[90px] flex items-center px-4 gap-4 z-10 ${
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
          <span className="font-semibold truncate text-white">
            {post.trackName || "Unknown Track"}
          </span>
          <span className="text-sm truncate text-gray-200">
            {post.artistName || "Unknown Artist"}
          </span>
        </div>
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
            {isPlaying ? (
              <Pause className="text-white w-6 h-6" />
            ) : (
              <Play className="text-white w-6 h-6" />
            )}
          </div>
        )}
      </div>
        }
      {/* Media */}
      <div className={`relative w-full ${!isDetailView ? "mt-0" : "mt-[90px]"}`}>
        {isVideo ? (
          <video
            ref={activeVideoRef}
            src={post.customVideoUrl ?? ""}
            className={`w-full min-w-[400px] h-[450px] object-cover rouned-t-xl`}
            autoPlay={!profileFeed}
            loop
            playsInline
            muted={false}
            onClick={(e) => {
              e.stopPropagation();
              if(!profileFeed) togglePlayPause();
              
            }}
          />
        ) : (
          <img
            src={
              post.customImageUrl || post.albumArtUrl || "/default-album-cover.png"
            }
            alt={post.trackName || "Track"}
            className={`${
              !isDetailView ? "rounded-b-lg" : ""
            } w-full ${!isDetailView ? "h-[250px]" : "h-[350px"} object-cover ${
              imageLoaded ? "opacity-100" : "opacity-0"
            } transition-opacity duration-300 ${!isDetailView ? "rounded-t-2xl" : ""}`}
            onLoad={(e) => {
              setImageLoaded(true);
              const img = e.currentTarget;
              onMediaDimensionsChange?.({
                width: img.naturalWidth,
                height: img.naturalHeight,
              });
            }}
          />
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
            title: post.trackName ?? "Unknown Track",
            artist: post.artistName ?? "Unknown Artist",
            albumArtUrl: post.albumArtUrl ?? "",
          }}
        />
      )}
    </motion.div>
  );
}