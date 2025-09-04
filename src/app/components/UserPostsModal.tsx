"use client";

import { useEffect, useRef, useState } from "react";
import { PostDto } from "../types/Post";
import PostCard from "./PostCard";
import { HiArrowLeft } from "react-icons/hi";

interface UserPostsModalProps {
  posts: PostDto[];
  initialPostId: number;
  onClose: () => void;
  onLike?: (postId: number) => void;
  onComment?: (postId: number, commentText: string) => void;
  onEdit?: (postId: number) => void;
  onDelete?: (postId: number) => void;
}

export default function UserPostsModal({
  posts,
  initialPostId,
  onClose,
  onLike,
  onComment,
  onEdit,
  onDelete,
}: UserPostsModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(
    posts.findIndex((p) => p.id === initialPostId)
  );

  // Disable body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Scroll to clicked post on mount
  useEffect(() => {
    const container = containerRef.current;
    const target = container?.children[activeIndex] as HTMLElement;
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [activeIndex]);

  return (
    <div className="">
      {/* Back button outside scrollable container */}
      <div className="px-4 py-4 flex items-center z-30">
        <button
          onClick={onClose}
          className="flex items-center text-white text-lg font-semibold"
        >
          <HiArrowLeft className="mr-2 text-2xl" />
          Back
        </button>
      </div>

      {/* Scrollable posts */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 pb-16 flex flex-col gap-4"
      >
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            isDetailView
            showActions
            large={false}
            fullWidth
            currentUsername={post.authorUsername}
            onLike={onLike}
            onComment={onComment}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
