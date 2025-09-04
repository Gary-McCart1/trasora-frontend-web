"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { HiArrowLeft } from "react-icons/hi";
import { PostDto } from "../types/Post";
import PostCard from "./PostCard";
import FloatingParticles from "./FloatingParticles";
import { useAuth } from "../context/AuthContext";
import { useSpotifyPlayer } from "../context/SpotifyContext";

interface ProfileFeedProps {
  posts: PostDto[];
  initialIndex?: number;
  onLike?: (postId: number) => void;
  onComment?: (postId: number, commentText: string) => void;
  onEdit?: (postId: number) => void;
  onDelete?: (postId: number) => void;
  onClose: () => void;
}

export default function ProfileFeed({
  posts,
  initialIndex = 0,
  onLike,
  onComment,
  onEdit,
  onDelete,
  onClose,
}: ProfileFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const postRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const { user } = useAuth();
  const {
    currentTrackId,
    playTrack,
    pauseTrack,
    isReady,
    initPlayer,
    setVolume,
  } = useSpotifyPlayer();

  // Intersection observer for active post
  useEffect(() => {
    const children = postRefs.current.filter(Boolean);
    const container = containerRef.current;
    if (!children.length || !container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isUserScrolling) return;

        let maxVisibility = 0;
        let mostVisibleIndex = 0;

        entries.forEach((entry) => {
          const index = parseInt(
            entry.target.getAttribute("data-index") || "0"
          );

          if (entry.isIntersecting && entry.intersectionRatio > maxVisibility) {
            maxVisibility = entry.intersectionRatio;
            mostVisibleIndex = index;
          }
        });

        if (mostVisibleIndex !== activeIndex && maxVisibility > 0.5) {
          setActiveIndex(mostVisibleIndex);
        }
      },
      {
        root: container,
        threshold: [0, 0.25, 0.5, 0.75, 1.0],
        rootMargin: "-20% 0px -20% 0px",
      }
    );

    children.forEach((child) => {
      if (child) observer.observe(child);
    });

    return () => observer.disconnect();
  }, [activeIndex, isUserScrolling]);

  // Scroll detection
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onScroll = () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      setIsUserScrolling(true);
      scrollTimeoutRef.current = setTimeout(
        () => setIsUserScrolling(false),
        150
      );
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      container.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Track autoplay with volume
  useEffect(() => {
    if (!isReady || isUserScrolling) return;

    const activePost = posts[activeIndex];
    const newTrackId = activePost?.trackId;
    const postVolume = activePost?.trackVolume ?? 0.5; // default volume

    if (!newTrackId) {
      if (currentTrackId) pauseTrack();
      return;
    }

    if (currentTrackId === newTrackId) {
      setVolume(postVolume); // reset volume if same track
      return;
    }

    const timeout = setTimeout(async () => {
      if (currentTrackId && currentTrackId !== newTrackId) pauseTrack();
      await playTrack(newTrackId, { volume: postVolume });
    }, 200);

    return () => clearTimeout(timeout);
  }, [
    activeIndex,
    isReady,
    currentTrackId,
    playTrack,
    pauseTrack,
    isUserScrolling,
    setVolume,
    posts,
  ]);

  // Initialize active post and auto-scroll to it
  useEffect(() => {
    setActiveIndex(initialIndex);
    const container = containerRef.current;
    const targetPost = postRefs.current[initialIndex];
    if (container && targetPost) {
      targetPost.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [initialIndex]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black z-50 overflow-y-auto"
    >
      <button
        onClick={onClose}
        className="fixed top-40 left-2 md:top-40 md:left-6 flex items-center justify-center w-12 h-12 text-white text-lg z-50 bg-zinc-800 rounded-full shadow-lg hover:cursor-pointer"
      >
        <HiArrowLeft className="text-2xl" />
      </button>

      {!isReady && user?.spotifyPremium && (
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

      <div className="w-full flex-col items-center mx-auto max-w-xl mt-[15rem]">
        {posts.map((post, index) => (
          <motion.div
            key={post.id || index}
            data-index={index}
            ref={(el) => {
              postRefs.current[index] = el;
            }}
            className="w-full relative my-16 flex items-center justify-center"
            style={{ direction: "ltr" }}
          >
            {index === activeIndex && (
              <div className="absolute inset-0 z-0 pointer-events-none">
                <FloatingParticles color="#8c52ff" />
              </div>
            )}

            <PostCard
              post={post}
              isDetailView
              currentUsername={post.authorUsername}
              onLike={onLike}
              onComment={onComment}
              onEdit={onEdit}
              onDelete={onDelete}
              showActions
              large={false}
              fullWidth
              isActive={currentTrackId === post.trackId}
              playTrack={(trackId, options) =>
                playTrack(trackId, { ...options, volume: post.trackVolume ?? 0.3 })
              }
              pauseTrack={pauseTrack}
              currentTrackId={currentTrackId}
              profileFeed={true}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
