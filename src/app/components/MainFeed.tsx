"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { PostDto } from "../types/Post";
import PostCard from "./PostCard";
import FloatingParticles from "./FloatingParticles";
import { useAuth } from "../context/AuthContext";
import { useSpotifyPlayer } from "../context/SpotifyContext";
import StoriesBar from "./StoriesBar";

interface MainFeedProps {
  posts: PostDto[];
  initialIndex?: number;
  onLike?: (postId: number) => void;
  onComment?: (postId: number, commentText: string) => void;
  onEdit?: (postId: number) => void;
  onDelete?: (postId: number) => void;
  isProfileView?: boolean;
  onClose?: () => void;
}

export default function MainFeed({
  posts,
  initialIndex = 0,
  onLike,
  onComment,
  onEdit,
  onDelete,
  isProfileView,
  onClose,
}: MainFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const postRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [pendingTrackChange, setPendingTrackChange] = useState<string | null>();
  const [trackPositions, setTrackPositions] = useState<Record<string, number>>(
    {}
  );

  const scrollTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const trackChangeTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const { user } = useAuth();
  const {
    currentTrackId,
    playTrack,
    pauseTrack,
    isReady,
    initPlayer,
    player,
    setVolume,
  } = useSpotifyPlayer();

  // Reset active index on initial load / posts change
  useEffect(() => {
    setActiveIndex(initialIndex);
    setIsUserScrolling(false);
    setPendingTrackChange(null);
  }, [initialIndex, posts.length, isProfileView]);

  // Scroll detection
  useEffect(() => {
    const container = isProfileView ? containerRef.current : window;

    const onScroll = () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      setIsUserScrolling(true);
      scrollTimeoutRef.current = setTimeout(
        () => setIsUserScrolling(false),
        200
      );
    };

    if (container instanceof HTMLElement)
      container.addEventListener("scroll", onScroll, { passive: true });
    else window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      if (container instanceof HTMLElement)
        container.removeEventListener("scroll", onScroll);
      else window.removeEventListener("scroll", onScroll);
    };
  }, [isProfileView]);

  // IntersectionObserver for active post
  useEffect(() => {
    const children = postRefs.current.filter(Boolean);
    if (!children.length) return;

    const container = isProfileView ? containerRef.current : null;
    const observer = new IntersectionObserver(
      (entries) => {
        if (isUserScrolling) return;

        let maxVisibility = 0;
        let mostVisibleIndex = 0;

        entries.forEach((entry) => {
          const index = parseInt(
            entry.target.getAttribute("data-index") || "0"
          );
          const visibilityRatio = entry.intersectionRatio;
          const rect = entry.boundingClientRect;
          const containerRect = container?.getBoundingClientRect() || {
            top: 0,
            height: window.innerHeight,
          };
          const elementCenter = rect.top + rect.height / 2;
          const viewportCenter = containerRect.top + containerRect.height / 2;
          const distanceFromCenter = Math.abs(elementCenter - viewportCenter);
          const maxDistance = containerRect.height / 2;
          const centerScore = 1 - distanceFromCenter / maxDistance;
          const score = visibilityRatio * 0.7 + centerScore * 0.3;

          if (score > maxVisibility && entry.isIntersecting) {
            maxVisibility = score;
            mostVisibleIndex = index;
          }
        });

        if (mostVisibleIndex !== activeIndex && maxVisibility > 0.3) {
          setActiveIndex(mostVisibleIndex);
        }
      },
      {
        root: container,
        rootMargin: "0px",
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1.0],
      }
    );

    children.forEach((child) => child && observer.observe(child));
    return () => observer.disconnect();
  }, [activeIndex, isProfileView, isUserScrolling, posts.length]);

  // Track management with volume reset
  useEffect(() => {
    if (!isReady || isUserScrolling) return;

    const activePost = posts[activeIndex];
    const newTrackId = activePost?.trackId;
    const postVolume = activePost?.trackVolume ?? 0.3; // default volume

    if (!newTrackId) {
      if (currentTrackId) pauseTrack();
      return;
    }

    if (currentTrackId === newTrackId) {
      setVolume(postVolume); // reset volume even if same track
      return;
    }

    setPendingTrackChange(newTrackId);
    if (trackChangeTimeoutRef.current)
      clearTimeout(trackChangeTimeoutRef.current);

    trackChangeTimeoutRef.current = setTimeout(async () => {
      const currentActivePost = posts[activeIndex];
      if (
        currentActivePost?.trackId === newTrackId &&
        pendingTrackChange === newTrackId
      ) {
        if (currentTrackId && currentTrackId !== newTrackId && player) {
          const state = await player.getCurrentState();
          const currentTrackIdFromState =
            state?.track_window?.current_track?.id;
          const pos = state?.position || 0;
          if (currentTrackIdFromState) {
            setTrackPositions((prev) => ({
              ...prev,
              [currentTrackIdFromState]: pos,
            }));
          }
          pauseTrack();
        }

        const startPosition = trackPositions[newTrackId] || 0;
        await playTrack(newTrackId, {
          position_ms: startPosition,
          volume: postVolume,
        });
        setPendingTrackChange(null);
      } else {
        setPendingTrackChange(null);
      }
    }, 200);

    return () => {
      if (trackChangeTimeoutRef.current)
        clearTimeout(trackChangeTimeoutRef.current);
    };
  }, [
    activeIndex,
    posts,
    isReady,
    currentTrackId,
    playTrack,
    pauseTrack,
    isUserScrolling,
    pendingTrackChange,
    player,
    trackPositions,
    setVolume,
  ]);

  return (
    <div className="relative w-full min-h-screen">
      <div className="sticky md:top-[6.2rem] 4xl:top-[7.8rem] z-40 bg-zinc-950 flex justify-center pb-2 border-b border-zinc-900">
        <StoriesBar />
      </div>
      {/* Floating particles always on */}
      <div className="absolute inset-0 z-0 pointer-events-none hidden sm:block">
        <FloatingParticles color="#8c52ff" />
      </div>

      {!isReady && user?.spotifyPremium && user?.spotifyConnected && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-[#1a1a1a] rounded-2xl p-8 w-80 md:w-96 shadow-2xl flex flex-col items-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <h2 className="text-white text-xl font-bold mb-4 text-center">
              Enable Spotify Player
            </h2>
            <p className="text-gray-300 text-sm mb-6 text-center">
              Connect your Spotify account to play music directly in Trasora.
            </p>
            <button
              onClick={initPlayer}
              className="w-full px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold shadow-md hover:bg-purple-700 transition-colors"
            >
              Enable Player
            </button>
            <button
              onClick={onClose}
              className="mt-4 text-gray-400 text-sm hover:text-white transition-colors"
            >
              Cancel
            </button>
          </motion.div>
        </motion.div>
      )}

      <div
        ref={containerRef}
        className="flex flex-col items-center gap-10 pt-6 pb-20 mx-auto max-w-lg scroll-smooth bg-zinc-950"
      >
        {posts.map((post, index) => (
          <motion.div
            key={post.id || index}
            data-index={index}
            ref={(el) => {
              postRefs.current[index] = el;
            }}
            className="w-full relative gap-5 flex justify-center"
            style={{ scrollSnapAlign: "start" }}
          >
            <PostCard
              post={post}
              isDetailView
              currentUsername={post.authorUsername}
              onLike={onLike}
              onComment={onComment}
              onEdit={onEdit}
              onDelete={onDelete}
              showActions
              large={!isProfileView}
              fullWidth
              isActive={
                currentTrackId === post.trackId ||
                pendingTrackChange === post.trackId
              }
              playTrack={() =>
                post.trackId
                  ? playTrack(post.trackId, {
                      position_ms: trackPositions[post.trackId] || 0,
                      volume: post.trackVolume ?? 0.5,
                    })
                  : Promise.resolve()
              }
              pauseTrack={async () => {
                if (player && post.trackId) {
                  const state = await player.getCurrentState();
                  const currentTrackIdFromState =
                    state?.track_window?.current_track?.id;
                  const pos = state?.position || 0;
                  if (currentTrackIdFromState) {
                    setTrackPositions((prev) => ({
                      ...prev,
                      [currentTrackIdFromState]: pos,
                    }));
                  }
                }
                pauseTrack();
              }}
              
              currentTrackId={currentTrackId || ""}
              profileFeed={false}
              profilePage={false}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
