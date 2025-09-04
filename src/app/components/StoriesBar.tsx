"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { HiPlus } from "react-icons/hi";
import getS3Url from "../utils/S3Url";
import { useEffect, useState, useCallback } from "react";
import { useStories } from "../context/StoriesContext";
import { StoryDto } from "../types/Story";
import { fetchActiveStories } from "../api/storyApi/route";
import AddStoryModal from "./AddStoryModal";
import StoryViewerModal from "./StoryViewerModal";

const BASE_URL = "http://localhost:8080";

export default function StoriesBar() {
  const { user } = useAuth();
  const { stories, setStories } = useStories();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [selectedAuthorStories, setSelectedAuthorStories] = useState<StoryDto[]>([]);

  const handleCloseModal = useCallback(() => {
    setActiveStoryIndex(null);
    setSelectedAuthorStories([]);
  }, []);

  // Fetch active stories
  useEffect(() => {
    if (!user) return;
    const loadStories = async () => {
      try {
        const fetchedStories = await fetchActiveStories();
        setStories(fetchedStories);
      } catch (err) {
        console.error("Failed to load stories:", err);
      }
    };
    loadStories();
  }, [user, setStories]);

  if (!user) return null;

  const handleDelete = async (storyId: number) => {
    console.log("Deleting storyId:", storyId);
  
    try {
      const res = await fetch(`${BASE_URL}/api/stories/${storyId}`, {
        method: "DELETE",
        credentials: "include",
      });
  
      if (res.status === 404) {
        console.warn(`Story ${storyId} not found. It may have already been deleted.`);
        // Optionally remove from state anyway to prevent UI inconsistencies
        setStories((prev) => prev.filter((s) => s.id !== storyId));
        setSelectedAuthorStories((prev) => prev.filter((s) => s.id !== storyId));
        return;
      }
  
      if (res.status === 403) {
        console.error(`You do not have permission to delete story ${storyId}`);
        return;
      }
  
      if (!res.ok) {
        throw new Error(`Failed to delete story: ${res.status}`);
      }
  
      alert("Story has been successfully deleted.")
      // Success
      setStories((prev) => prev.filter((s) => s.id !== storyId));
      setSelectedAuthorStories((prev) => prev.filter((s) => s.id !== storyId));
      window.location.reload()
    } catch (err) {
      console.error("Error deleting story:", err);
    }
  };
  

  // Group stories by author
  const authorMap = new Map<string, StoryDto[]>();
  stories.forEach((story) => {
    const arr = authorMap.get(story.authorUsername) || [];
    arr.push(story);
    authorMap.set(story.authorUsername, arr);
  });

  // Ensure current user is first
  const allAuthors = [
    user.username, // always first
    ...Array.from(authorMap.keys()).filter((author) => author !== user.username),
  ];

  return (
    <div className="z-40">
      <div className="flex gap-4 overflow-x-auto scrollbar-hide px-4 items-center">
        {allAuthors.map((author) => {
          const authorStories = authorMap.get(author) || [];
          const isCurrentUser = author === user.username;
          const hasStories = authorStories.length > 0;

          return (
            <motion.div
              key={author}
              whileTap={{ scale: hasStories ? 0.9 : 1 }}
              className="flex flex-col items-center relative"
              onClick={() => {
                if (!hasStories) return;
                setSelectedAuthorStories(authorStories);
                setActiveStoryIndex(0);
              }}
              title={!hasStories && isCurrentUser ? "No stories yet" : ""}
            >
              <div className="p-[2px] rounded-full bg-gradient-to-tr from-purple-500 via-purple-400 to-pink-500 shadow-md relative">
                <div className="w-16 h-16 rounded-full overflow-hidden relative">
                  <Image
                    src={
                      hasStories
                        ? getS3Url(authorStories[0].authorProfilePictureUrl)
                        : getS3Url(user.profilePictureUrl || "")
                    }
                    alt={author}
                    fill
                    className="object-cover"
                  />
                </div>

                {isCurrentUser && (
                  <button
                    className="absolute bottom-0 right-0 w-6 h-6 flex items-center justify-center 
                               bg-purple-600 rounded-full border-2 border-black shadow-md
                               hover:bg-purple-700 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAddModalOpen(true);
                    }}
                  >
                    <HiPlus className="text-white text-sm" />
                  </button>
                )}
              </div>

              <p className="text-xs mt-2 truncate w-16 text-center text-gray-200">
                {isCurrentUser ? "Your Story" : author}
              </p>
            </motion.div>
          );
        })}
      </div>

      {isAddModalOpen && (
        <AddStoryModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onStoryAdded={(newStory) => setStories((prev) => [newStory, ...prev])}
        />
      )}

      {activeStoryIndex !== null && selectedAuthorStories.length > 0 && (
        <StoryViewerModal
          startIndex={activeStoryIndex}
          onClose={handleCloseModal}
          onDelete={handleDelete}
          stories={selectedAuthorStories} // pass only this user's stories
        />
      )}
    </div>
  );
}
