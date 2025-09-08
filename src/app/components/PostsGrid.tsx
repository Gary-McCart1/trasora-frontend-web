"use client";

import { useState, useEffect } from "react";
import PostCard from "./PostCard";
import { PostDto } from "../types/Post";
import ProfileFeed from "./ProfileFeed";
import { useSpotifyPlayer } from "../context/SpotifyContext";

interface PostsGridProps {
  posts: PostDto[];
  isProfileView?: boolean;
  isOwner?: boolean; // Add this if you want owner-specific messages
}

export default function PostsGrid({
  posts,
  isProfileView = false,
  isOwner,
}: PostsGridProps) {
  console.log(posts)
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const { playTrack, pauseTrack, currentTrackId, isPlaying } = useSpotifyPlayer();

  const selectedPost =
    selectedPostId !== null ? posts.find((p) => p.id === selectedPostId) : null;

  // Disable body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = selectedPost ? "hidden" : "auto";
  }, [selectedPost]);

  if (posts.length === 0) {
    return (
      <div className="text-gray-400 italic text-sm mt-2 text-center px-2 py-[5rem]">
        {isOwner ? (
          <p>No posts yet of this type. Visit the create page to share what you&apos;ve been listening to.</p>
        ) : (
          <p>This user currently does not have any posts.</p>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 relative z-10">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            profileFeed={true}
            isDetailView={false}
            currentUsername={post.authorUsername}
            showActions
            large={!isProfileView}
            fullWidth={false}
            isActive={currentTrackId === post.trackId && isPlaying}
            playTrack={() => post.trackId ? playTrack(post.trackId, { volume: post.trackVolume ?? 1 }) : Promise.resolve()}

            pauseTrack={pauseTrack}
            currentTrackId={currentTrackId}
            onClick={() => post.id && setSelectedPostId(post.id)}
            profilePage={true}
          />
        ))}
      </div>

      {selectedPost && (
        <ProfileFeed
          posts={posts}
          initialIndex={posts.findIndex((p) => p.id === selectedPost.id)}
          onClose={() => setSelectedPostId(null)}
        />
      )}
    </>
  );
}
