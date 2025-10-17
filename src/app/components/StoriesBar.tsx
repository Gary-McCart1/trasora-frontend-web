"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { HiPlus } from "react-icons/hi";
import getS3Url from "../utils/S3Url";
import { useEffect, useState, useCallback } from "react";
import { useStories } from "../context/StoriesContext";
import { StoryDto } from "../types/Story";
import { deleteStory, fetchActiveStories } from "../lib/storiesApi";
import AddStoryModal from "./AddStoryModal";
import StoryViewerModal from "./StoryViewerModal";
import { getSuggestedFollows } from "../lib/followApi";
import { SuggestedUser } from "../types/User";
import Link from "next/link";

interface StoriesBarProps {
  onStoriesOpenChange?: (isOpen: boolean) => void;
}

export default function StoriesBar({ onStoriesOpenChange }: StoriesBarProps) {
  const { user } = useAuth();
  const { stories, setStories } = useStories();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [selectedAuthorStories, setSelectedAuthorStories] = useState<
    StoryDto[]
  >([]);
  const [suggestedFollows, setSuggestedFollows] = useState<SuggestedUser[]>([]);

  const isStoriesOpen =
    activeStoryIndex !== null && selectedAuthorStories.length > 0;

  useEffect(() => {
    onStoriesOpenChange?.(isStoriesOpen);
  }, [isStoriesOpen, onStoriesOpenChange]);

  const handleCloseModal = useCallback(() => {
    setActiveStoryIndex(null);
    setSelectedAuthorStories([]);
  }, []);

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

  useEffect(() => {
    if (!user) return;
    const loadSuggestedFollows = async () => {
      try {
        const suggestions = await getSuggestedFollows(user.username);
        setSuggestedFollows(suggestions);
      } catch (err) {
        console.error("Failed to load suggested follows:", err);
      }
    };
    loadSuggestedFollows();
  }, [user]);

  if (!user) return null;

  const handleDelete = async (storyId: number) => {
    try {
      await deleteStory(storyId);
      alert("Story has been successfully deleted.");
      setStories((prev) => prev.filter((s) => s.id !== storyId));
      setSelectedAuthorStories((prev) => prev.filter((s) => s.id !== storyId));
    } catch (err: unknown) {
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
    user.username,
    ...Array.from(authorMap.keys()).filter(
      (author) => author !== user.username
    ),
  ];

  return (
    <div className="z-40 relative w-full isolation-isolate">
    {/* Scrollable Stories + Suggested Follows */}
    <div className="!overflow-x-auto py-2 scrollbar-hide w-full">
        <div className="flex gap-6 min-w-max px-4 justify-center">
          {/* Stories Column */}
          <div className="flex flex-col gap-1 flex-shrink-0">
            <div className="text-white text-xs uppercase font-semibold mb-1 ml-1">
              Stories
            </div>
            <div className="flex gap-4">
              {allAuthors.map((author) => {
                const authorStories = authorMap.get(author) || [];
                const isCurrentUser = author === user.username;
                const hasStories = authorStories.length > 0;

                return (
                  <motion.div
                    key={author}
                    whileTap={{ scale: hasStories ? 0.9 : 1 }}
                    className="flex flex-col items-center flex-shrink-0"
                    onClick={() => {
                      if (!hasStories) return;
                      setSelectedAuthorStories(authorStories);
                      setActiveStoryIndex(0);
                    }}
                  >
                    {/* Avatar */}
                    <div className="p-[2px] rounded-full bg-gradient-to-tr from-purple-500 via-purple-400 to-pink-500 shadow-md relative">
                      <div className="w-16 h-16 rounded-full overflow-hidden relative">
                        <Image
                          src={
                            hasStories
                              ? getS3Url(
                                  authorStories[0].authorProfilePictureUrl
                                )
                              : getS3Url(user.profilePictureUrl || "")
                          }
                          alt={author}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {isCurrentUser && (
                        <button
                          className="absolute bottom-0 right-0 w-6 h-6 flex items-center justify-center bg-purple-600 rounded-full border-2 border-black shadow-md hover:bg-purple-700 transition-colors"
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
                      {isCurrentUser ? "My Story" : author}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="w-px bg-white flex-shrink-0 my-8"></div>

          {/* Suggested Follows Column */}
          {suggestedFollows.length > 0 && (
            <div className="flex flex-col gap-2 flex-shrink-0">
              <div className="text-white text-xs uppercase font-semibold mb-2 pr-2">
                Suggested Friends
              </div>
              <div className="flex gap-4">
                {suggestedFollows.map((user, index) => (
                  <Link href={`/profile/${user.username}`} key={user.id}>
                    {index < 5 && <motion.div className="flex flex-col items-center flex-shrink-0 cursor-pointer">
                      <div className="w-16 h-16 rounded-full overflow-hidden">
                        <img
                          src={
                            user.profilePictureUrl
                              ? getS3Url(user.profilePictureUrl)
                              : "/default-profilepic.png"
                          }
                          alt={user.username}
                          
                          className="object-cover w-full h-full"
                          
                        />
                      </div>
                      <p className="text-xs mt-1 truncate w-16 text-center text-gray-200">
                        {user.username}
                      </p>
                    </motion.div>}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
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
          stories={selectedAuthorStories}
        />
      )}
    </div>
  );
}
