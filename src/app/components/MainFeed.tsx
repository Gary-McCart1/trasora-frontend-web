"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { PostDto } from "../types/Post";
import PostCard from "./PostCard";
import FloatingParticles from "./FloatingParticles";
import { useAuth } from "../context/AuthContext";
import { useApplePlayer } from "../context/ApplePlayerContext";
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
}: MainFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const postRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [manuallyPausedUrls, setManuallyPausedUrls] = useState<Set<string>>(new Set());
  const [showInitModal, setShowInitModal] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [isStoriesOpen, setIsStoriesOpen] = useState(false); // Add internal state

  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { user } = useAuth();
  const { currentUrl, isPlaying, playPreview, pausePreview, setVolume, initPlayer, isReady } =
    useApplePlayer();

  // Show init modal if not ready
  useEffect(() => {
    if (user && !isReady) {
      setShowInitModal(true);
    }
  }, [user, isReady]);

  // Reset when posts change
  useEffect(() => {
    setActiveIndex(initialIndex);
    setIsUserScrolling(false);
    setManuallyPausedUrls(new Set());
    setHasUserInteracted(false);
  }, [initialIndex, posts.length, isProfileView]);

  // Scroll detection
  useEffect(() => {
    const container = isProfileView ? containerRef.current : window;
    const onScroll = () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      setIsUserScrolling(true);
      scrollTimeoutRef.current = setTimeout(() => setIsUserScrolling(false), 200);
    };
    if (container instanceof HTMLElement) {
      container.addEventListener("scroll", onScroll, { passive: true });
    } else {
      window.addEventListener("scroll", onScroll, { passive: true });
    }
    return () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      if (container instanceof HTMLElement) {
        container.removeEventListener("scroll", onScroll);
      } else {
        window.removeEventListener("scroll", onScroll);
      }
    };
  }, [isProfileView]);

  // Handle manual pause tracking
  const handleManualPause = (url: string) => {
    console.log("Manual pause for:", url);
    setManuallyPausedUrls(prev => new Set([...prev, url]));
    setHasUserInteracted(true);
  };

  // Handle manual play (remove from paused list)
  const handleManualPlay = (url: string) => {
    console.log("Manual play for:", url);
    setManuallyPausedUrls(prev => {
      const newSet = new Set(prev);
      newSet.delete(url);
      return newSet;
    });
    setHasUserInteracted(true);
  };

  // Active post detection
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
          const index = parseInt(entry.target.getAttribute("data-index") || "0");
          const visibilityRatio = entry.intersectionRatio;

          const rect = entry.boundingClientRect;
          const containerRect =
            container?.getBoundingClientRect() || { top: 0, height: window.innerHeight };

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

          // Clear manual pause state when post goes out of view
          if (!entry.isIntersecting && visibilityRatio < 0.1) {
            const post = posts[index];
            if (post) {
              setManuallyPausedUrls(prev => {
                const newSet = new Set(prev);
                if (post.applePreviewUrl) newSet.delete(post.applePreviewUrl);
                if (post.customVideoUrl) newSet.delete(post.customVideoUrl);
                return newSet;
              });
            }
          }
        });

        if (mostVisibleIndex !== activeIndex && maxVisibility > 0.3) {
          setActiveIndex(mostVisibleIndex);
        }
      },
      { root: container, threshold: [0, 0.1, 0.25, 0.5, 0.75, 1.0] }
    );

    children.forEach((child) => child && observer.observe(child));

    return () => observer.disconnect();
  }, [activeIndex, isProfileView, isUserScrolling, posts, setManuallyPausedUrls]);

  // Pause main feed audio when stories are open
  useEffect(() => {
    if (isStoriesOpen) {
      pausePreview();
      // Also pause all videos
      postRefs.current.forEach((ref) => {
        if (!ref) return;
        const video = ref.querySelector("video");
        if (video && !video.paused) {
          video.pause();
        }
      });
    }
  }, [isStoriesOpen, pausePreview]);

  // Autoplay logic - handle both new posts and manual control state
  useEffect(() => {
    if (isUserScrolling || !isReady || isStoriesOpen) return; // Add isStoriesOpen check
    
    const activePost = posts[activeIndex];
    if (!activePost) return;

    const previewUrl = activePost.applePreviewUrl ?? null;
    const videoUrl = activePost.customVideoUrl ?? null;
    const isVideo = !!videoUrl;
    const postVolume = activePost.trackVolume ?? 0.3;

    // First, pause all other videos when switching posts
    postRefs.current.forEach((ref, idx) => {
      if (!ref || idx === activeIndex) return;
      const video = ref.querySelector("video");
      if (video && !video.paused) {
        video.pause();
      }
    });

    // Check if this specific post/media was manually paused
    const isManuallyPaused = manuallyPausedUrls.has(previewUrl || '') || 
                            manuallyPausedUrls.has(videoUrl || '');

    // If manually paused, don't autoplay but pause current audio
    if (isManuallyPaused) {
      pausePreview();
      return;
    }

    // If there's a video, play both video and audio
    if (isVideo) {
      const videoEl = postRefs.current[activeIndex]?.querySelector("video");
      
      // Start video
      if (videoEl && videoEl.paused) {
        videoEl.play().catch(() => {});
      }

      // Play preview audio on top of video
      if (previewUrl) {
        if (currentUrl !== previewUrl) {
          playPreview(previewUrl, postVolume);
        } else {
          setVolume(postVolume);
        }
      }

      return; // don't fall through to audio-only logic
    }

    // If it's audio-only post
    if (previewUrl) {
      if (currentUrl !== previewUrl) {
        playPreview(previewUrl, postVolume);
      } else {
        setVolume(postVolume);
      }
    } else {
      pausePreview();
    }
  }, [activeIndex, posts, isUserScrolling, playPreview, pausePreview, setVolume, currentUrl, manuallyPausedUrls, isReady, isStoriesOpen]);

  return (
    <div className="relative w-full min-h-screen">
      {/* Init Modal */}
      {showInitModal && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div className="bg-[#1a1a1a] rounded-2xl p-8 w-80 md:w-96 shadow-2xl flex flex-col items-center">
            <h2 className="text-white text-xl font-bold mb-4 text-center">Enable Autoplay</h2>
            <button
              onClick={() => {
                initPlayer();
                setShowInitModal(false);
              }}
              className="w-full px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold shadow-md hover:bg-purple-700"
            >
              Ok
            </button>
            <button
              onClick={() => setShowInitModal(false)}
              className="mt-4 text-gray-400 text-sm hover:text-white"
            >
              Cancel
            </button>
          </motion.div>
        </motion.div>
      )}

      <div className="sticky md:top-[5.5rem] z-40 bg-zinc-950 flex justify-center pb-2 border-b border-zinc-900">
        <StoriesBar onStoriesOpenChange={setIsStoriesOpen} />
      </div>

      <div className="absolute inset-0 z-0 pointer-events-none hidden sm:block">
        <FloatingParticles color="#8c52ff" />
      </div>

      <div
        ref={containerRef}
        className="flex flex-col items-center gap-10 pt-6 pb-20 mx-auto md:max-w-md bg-zinc-950 w-full"
      >
        {posts.map((post, index) => (
          <motion.div
            key={post.id || index}
            data-index={index}
            ref={(el) => {
              postRefs.current[index] = el;
            }}
            className="w-full relative flex justify-center"
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
              isActive={currentUrl === post.applePreviewUrl && isPlaying}
              currentTrackId={currentUrl || ""}
              profileFeed={false}
              profilePage={false}
              onManualPause={handleManualPause}
              onManualPlay={handleManualPlay}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}