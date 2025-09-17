"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { HiArrowLeft } from "react-icons/hi";
import { PostDto } from "../types/Post";
import PostCard from "./PostCard";
import FloatingParticles from "./FloatingParticles";
import { useAuth } from "../context/AuthContext";
import { useApplePlayer } from "../context/ApplePlayerContext";

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
  const [manuallyPausedUrl, setManuallyPausedUrl] = useState<string | null>(null);
  const [showInitModal, setShowInitModal] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const { user } = useAuth();
  const { currentUrl, isPlaying, playPreview, pausePreview, setVolume, initPlayer, isReady } = useApplePlayer();

  // Show init modal if player isn't ready
  useEffect(() => {
    if (user && !isReady) {
      setShowInitModal(true);
    }
  }, [user, isReady]);

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
          const index = parseInt(entry.target.getAttribute("data-index") || "0");
          const rect = entry.boundingClientRect;
          const containerRect = container.getBoundingClientRect();
          const elementCenter = rect.top + rect.height / 2;
          const viewportCenter = containerRect.top + containerRect.height / 2;
          const distanceFromCenter = Math.abs(elementCenter - viewportCenter);
          const maxDistance = containerRect.height / 2;
          const centerScore = 1 - distanceFromCenter / maxDistance;
          const score = entry.intersectionRatio * 0.7 + centerScore * 0.3;

          if (score > maxVisibility && entry.isIntersecting) {
            maxVisibility = score;
            mostVisibleIndex = index;
          }
        });

        if (mostVisibleIndex !== activeIndex && maxVisibility > 0.3) {
          setActiveIndex(mostVisibleIndex);
        }
      },
      { root: container, rootMargin: "0px", threshold: [0, 0.1, 0.25, 0.5, 0.75, 1.0] }
    );

    children.forEach((child) => child && observer.observe(child));
    return () => observer.disconnect();
  }, [activeIndex, isUserScrolling, posts.length]);

  // Scroll detection
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onScroll = () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      setIsUserScrolling(true);
      scrollTimeoutRef.current = setTimeout(() => setIsUserScrolling(false), 150);
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      container.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Autoplay Apple previews for active post
  useEffect(() => {
    if (!isReady || isUserScrolling) return;

    const activePost = posts[activeIndex];
    const previewUrl = activePost?.applePreviewUrl;
    const postVolume = activePost?.trackVolume ?? 0.5;

    if (!previewUrl) {
      pausePreview();
      setManuallyPausedUrl(null);
      return;
    }

    if (manuallyPausedUrl === previewUrl) return;

    if (currentUrl !== previewUrl) {
      playPreview(previewUrl, postVolume);
    } else {
      setVolume(postVolume);
    }
  }, [activeIndex, posts, isReady, isUserScrolling, currentUrl, manuallyPausedUrl, playPreview, pausePreview, setVolume]);

  // Initialize active post and scroll to it
  useEffect(() => {
    setActiveIndex(initialIndex);
    const container = containerRef.current;
    const targetPost = postRefs.current[initialIndex];
    if (container && targetPost) {
      targetPost.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [initialIndex]);

  return (
    <div ref={containerRef} className="fixed inset-0 bg-black z-50 overflow-y-auto">
      <button
        onClick={onClose}
        className="fixed top-40 left-2 md:top-40 md:left-6 flex items-center justify-center w-12 h-12 text-white text-lg z-50 bg-zinc-800 rounded-full shadow-lg hover:cursor-pointer"
      >
        <HiArrowLeft className="text-2xl" />
      </button>

      {/* Apple Player Init Modal */}
      {showInitModal && (
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
              Enable Apple Music Player
            </h2>
            <button
              onClick={() => {
                initPlayer();
                setShowInitModal(false);
              }}
              className="w-full px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold shadow-md hover:bg-purple-700 transition-colors"
            >
              Ok
            </button>
            <button
              onClick={() => setShowInitModal(false)}
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
              isActive={currentUrl === post.applePreviewUrl && isPlaying}
              currentTrackId={currentUrl || ""}
              profileFeed={true}
              onManualPause={(url) => setManuallyPausedUrl(url)}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
