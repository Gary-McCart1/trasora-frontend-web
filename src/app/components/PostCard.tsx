"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { PostDto } from "../types/Post";
import { motion } from "framer-motion";
import PostActions from "./PostActions";
import { Loader2, Play, Pause } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface PostCardProps {
  post: PostDto;
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
  isActive?: boolean;
  playTrack?: (
    trackId: string,
    options?: { position_ms?: number; volume?: number }
  ) => Promise<void>;
  pauseTrack?: () => void;
  resumeTrack?: () => void;
  currentTrackId?: string | null;
  onMediaDimensionsChange?: (dimensions: {
    width: number;
    height: number;
  }) => void;
  profilePage?: boolean;
}

export default function PostCard({
  post,
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
  isActive = false,
  playTrack,
  pauseTrack,
  resumeTrack,
  currentTrackId,
  onMediaDimensionsChange,
  profilePage = false,
}: PostCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  const { user } = useAuth();
  const isVideo = !!post.customVideoUrl;
  const containerAspect = isVideo ? 9 / 16 : 1;
  const containerPaddingBottom = `${100 / containerAspect}%`;
  const showLoader = (isVideo && !videoLoaded) || (!isVideo && !imageLoaded);

  /** 🔹 Play video safely */
  const playVideo = useCallback(async () => {
    if (!videoRef.current) return;
    try {
      await videoRef.current.play();
    } catch (error) {
      console.warn("Video play interrupted:", error);
    }
  }, []);

  /** 🔹 Pause video safely */
  const pauseVideo = useCallback(() => {
    videoRef.current?.pause();
  }, []);

  const isCurrentlyPlaying = (trackId?: string) => {
    return !isManuallyPaused && currentTrackId === trackId;
  };

  /** 🔹 Toggle play/pause manually */
  const togglePlayPause = useCallback(() => {
    const isVideoPaused = videoRef.current?.paused ?? true;

    // Toggle video
    if (isVideo) {
      if (isVideoPaused) {
        videoRef.current!.muted = false;
        videoRef.current!.volume = 0.3;
        videoRef
          .current!.play()
          .catch((err) => console.warn("Video play prevented:", err));
        setIsManuallyPaused(false);
      } else {
        pauseVideo();
        setIsManuallyPaused(true);
      }
    }

    // Toggle Spotify track
    if (post.trackId && user?.spotifyConnected && user?.spotifyPremium) {
      if (isCurrentlyPlaying(post.trackId)) {
        pauseTrack?.(); // ✅ Ensures pause is called
        setIsManuallyPaused(true);
      } else {
        if (currentTrackId === post.trackId) resumeTrack?.();
        else playTrack?.(post.trackId, { volume: post.trackVolume ?? 1 });
        setIsManuallyPaused(false);
      }
    }
  }, [
    post.trackId,
    post.trackVolume,
    playTrack,
    pauseTrack,
    resumeTrack,
    currentTrackId,
    isVideo,
    user,
    isCurrentlyPlaying,
    pauseVideo,
  ]);

  /** 🔹 Helper to check if this track is playing */

  /** 🔹 Sync video to feed state */
  useEffect(() => {
    if (!isVideo) return;
    if (isActive && !isManuallyPaused) playVideo();
    else pauseVideo();
  }, [isActive, isManuallyPaused, isVideo, playVideo, pauseVideo]);

  /** 🔹 Sync video play state for UI */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onPlay = () => setIsVideoPlaying(true);
    const onPause = () => setIsVideoPlaying(false);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
    };
  }, []);

  /** 🔹 Page hide/unload safety */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        videoRef.current?.pause();
        pauseTrack?.();
      }
    };
    const handleBeforeUnload = () => {
      videoRef.current?.pause();
      pauseTrack?.();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [pauseTrack]);

  const isPlaying = isVideo
    ? isVideoPlaying && !isManuallyPaused
    : isCurrentlyPlaying(post.trackId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`rounded-3xl shadow-lg relative mt-12 cursor-pointer bg-opacity-10 backdrop-blur-sm ${
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
      {showLoader && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black bg-opacity-40 rounded-3xl">
          <Loader2 className="w-10 h-10 animate-spin text-white" />
        </div>
      )}

      <div
        className="relative w-full"
        style={{ paddingBottom: containerPaddingBottom }}
      >
        {isVideo ? (
          <>
            {!videoLoaded && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black bg-opacity-40 rounded-3xl">
                <Loader2 className="w-10 h-10 animate-spin text-white" />
              </div>
            )}
            <video
              ref={videoRef}
              src={post.customVideoUrl}
              className={`absolute top-0 left-0 w-full h-full object-cover object-center ${
                !isDetailView ? "rounded-b-lg" : ""
              } ${videoLoaded ? "opacity-100" : "opacity-0"}`}
              loop
              playsInline
              muted={false}
              preload="metadata"
              onLoadedMetadata={(e) => {
                setVideoLoaded(true);
                const video = e.currentTarget;
                onMediaDimensionsChange?.({
                  width: video.videoWidth,
                  height: video.videoHeight,
                });
              }}
              onError={(e) => console.error("Video load error:", e)}
              onClick={(e) => {
                e.stopPropagation();
                if (profilePage) onClick?.();
                else togglePlayPause();
              }}
            />
          </>
        ) : (
          <img
            src={
              post.customImageUrl ||
              post.albumArtUrl ||
              "/default-album-cover.png"
            }
            alt={post.trackName ?? "Track"}
            className={`absolute top-0 left-0 w-full h-full object-cover ${
              profileFeed ? "rounded-b-lg" : ""
            }`}
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

        {post.trackId &&
          (!user || !user.spotifyConnected || !user.spotifyPremium ? (
            <div className="absolute top-[-60px] left-1/2 transform -translate-x-1/2 w-full h-[85px] rounded-t-xl overflow-hidden">
              <iframe
                title={post.trackName ?? "Track"}
                src={`https://open.spotify.com/embed/track/${post.trackId}`}
                width="100%"
                height="85"
                frameBorder="0"
                allow="encrypted-media"
                className="w-full h-full rounded-t-xl"
              />
            </div>
          ) : (
            <div
              className={`absolute top-[-60px] left-1/2 transform -translate-x-1/2 w-full h-[85px] rounded-t-xl backdrop-blur-md border flex items-center px-4 gap-4 transition-all duration-300 ${
                isActive
                  ? "bg-purple-800 border-purple-600 shadow-lg shadow-purple-500/20"
                  : "bg-zinc-800 border-zinc-800"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={post.albumArtUrl || "/default-album-cover.png"}
                alt={post.trackName ?? "Track"}
                className={`w-14 h-14 rounded-md object-cover transition-all duration-300 ${
                  isActive ? "shadow-md animate-pulse" : ""
                }`}
              />
              <div className="flex flex-col overflow-hidden flex-1">
                <span
                  className={`font-semibold truncate ${
                    isActive ? "text-purple-100" : "text-white"
                  }`}
                >
                  {post.trackName}
                </span>
                <span
                  className={`text-sm truncate ${
                    isActive ? "text-purple-200" : "text-gray-400"
                  }`}
                >
                  {post.artistName ?? "Unknown Artist"}
                </span>
              </div>

              <div
                className={`ml-auto cursor-pointer p-2 rounded-full transition-all duration-300 hover:scale-110 ${
                  isActive
                    ? "bg-purple-600 hover:bg-purple-500"
                    : "bg-zinc-700 hover:bg-zinc-600"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlayPause();
                }}
              >
                {isPlaying ? (
                  <Pause className="text-white w-6 h-6" />
                ) : (
                  <Play className="text-white w-6 h-6 ml-0.5" />
                )}
              </div>
            </div>
          ))}
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
