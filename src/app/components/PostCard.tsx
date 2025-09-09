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
  const [isLoading, setIsLoading] = useState(true);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const { user } = useAuth();
  const isVideo = !!post.customVideoUrl;
  const containerAspect = isVideo ? 9 / 16 : 1;
  const containerPaddingBottom = `${100 / containerAspect}%`;

  const playVideo = useCallback(async () => {
    if (!videoRef.current) return;
    try {
      await videoRef.current.play();
    } catch (error) {
      console.warn("Video play interrupted:", error);
    }
  }, []);

  const pauseVideo = useCallback(() => {
    videoRef.current?.pause();
  }, []);

  const isCurrentlyPlaying = (trackId?: string) =>
    !isManuallyPaused && currentTrackId === trackId;

  const togglePlayPause = useCallback(() => {
    const isVideoPaused = videoRef.current?.paused ?? true;

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

    if (post.trackId && user?.spotifyConnected && user?.spotifyPremium) {
      if (isCurrentlyPlaying(post.trackId)) {
        pauseTrack?.();
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

  useEffect(() => {
    if (!isVideo) return;
    if (isActive && !isManuallyPaused) playVideo();
    else pauseVideo();
  }, [isActive, isManuallyPaused, isVideo, playVideo, pauseVideo]);

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
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black bg-opacity-40 rounded-3xl">
          <Loader2 className="w-10 h-10 animate-spin text-white" />
        </div>
      )}

      <div
        className="relative w-full"
        style={{ paddingBottom: containerPaddingBottom }}
      >
        {isVideo ? (
          <div className="absolute top-0 left-0 w-full h-full">
            {/* Video thumbnail */}
            {!videoLoaded && (
              <video
                src={post.customVideoUrl}
                className={`absolute top-0 left-0 w-full h-full object-cover ${
                  !isDetailView ? "rounded-b-lg" : ""
                } opacity-60`}
                muted
                preload="metadata"
                onLoadedData={() => setVideoLoaded(true)}
              />
            )}
            <video
              ref={videoRef}
              src={post.customVideoUrl}
              className={`absolute top-0 left-0 w-full h-full object-cover ${
                !isDetailView ? "rounded-b-lg" : ""
              } ${
                videoLoaded ? "opacity-100" : "opacity-0"
              } transition-opacity duration-300`}
              loop
              playsInline
              preload="auto"
              onLoadedData={() => {
                setVideoLoaded(true);
                setIsLoading(false);
                const video = videoRef.current!;
                onMediaDimensionsChange?.({
                  width: video.videoWidth,
                  height: video.videoHeight,
                });
              }}
              onError={(e) => {
                console.error("Video load error:", e);
                setIsLoading(false);
              }}
              onClick={(e) => {
                e.stopPropagation();
                togglePlayPause();
              }}
            />
          </div>
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
            } ${
              imageLoaded ? "opacity-100" : "opacity-0"
            } transition-opacity duration-300`}
            onLoad={(e) => {
              setImageLoaded(true);
              setIsLoading(false);
              const img = e.currentTarget;
              onMediaDimensionsChange?.({
                width: img.naturalWidth,
                height: img.naturalHeight,
              });
            }}
            onError={(e) => {
              console.error("Image load error:", e);
              setIsLoading(false);
            }}
          />
        )}

        {/* Spotify Track UI */}
        {post.trackId && (
          <>
            {user?.spotifyConnected && user?.spotifyPremium ? (
              // Custom player bar
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
            ) : (
              // Fallback iframe for non-premium or not connected
              <div
                className={`mt-1 w-[101%] absolute top-[-80px] left-1/2 transform -translate-x-1/2 h-[85px] rounded-t-xl overflow-hidden shadow-md ${
                  isActive
                    ? "border-purple-600 shadow-purple-500/20"
                    : "border-zinc-800"
                }`}
              >
                <iframe
                  className="w-[101%] h-full"
                  src={`https://open.spotify.com/embed/track/${post.trackId}?utm_source=generator`}
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                  loading="lazy"
                />
              </div>
            )}
          </>
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
