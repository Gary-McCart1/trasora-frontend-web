"use client";

import { FC, useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { StoryDto } from "../types/Story";
import StoryCard from "./StoryCard";
import { useApplePlayer } from "../context/ApplePlayerContext";
import { truncate } from "node:fs";

interface StoryViewerModalProps {
  stories: StoryDto[];
  startIndex: number;
  onClose: () => void;
  onDelete: (storyId: number) => void;

}

const STORY_DURATION = 20000; // 20 seconds

const StoryViewerModal: FC<StoryViewerModalProps> = ({
  stories,
  startIndex,
  onClose,
  onDelete,
}) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [dotProgress, setDotProgress] = useState(0);
  const { initPlayer, pausePreview } = useApplePlayer();

  const currentStory = stories[currentIndex];

  useEffect(() => {
    initPlayer();
    return () => {
      pausePreview(); // cleanup on close
    };
  }, [initPlayer, pausePreview]);

  // Auto-advance logic
  useEffect(() => {
    setDotProgress(0);
    const start = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min((elapsed / STORY_DURATION) * 100, 100);
      setDotProgress(progress);

      if (progress >= 100) {
        if (currentIndex < stories.length - 1) {
          setCurrentIndex((i) => i + 1);
        } else {
          setTimeout(onClose, 0);
        }
      }
    }, 50);

    return () => clearInterval(interval);
  }, [currentIndex, stories.length, onClose]);

  // Handle changes in stories
  useEffect(() => {
    if (stories.length === 0) {
      setTimeout(onClose, 0);
    } else if (currentIndex >= stories.length) {
      setCurrentIndex(stories.length - 1);
    }
  }, [stories, currentIndex, onClose]);

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
    setDotProgress(0);
  };

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setTimeout(onClose, 0);
    }
    setDotProgress(0);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const { clientX, currentTarget } = e;
    const { left, width } = currentTarget.getBoundingClientRect();
    const x = clientX - left;

    if (x < width / 2) handlePrev();
    else handleNext();
  };

  if (!currentStory) return null;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4"
      onClick={() => setTimeout(onClose, 0)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onMouseDown={handleClick}
        className="w-full max-w-sm relative cursor-pointer"
      >
        {/* Story progress dots */}
        <div className="absolute top-4 left-0 right-0 px-4 flex gap-2 justify-between z-20">
          {stories.map((_, idx) => (
            <div
              key={idx}
              className="flex-1 h-1 bg-white/30 rounded overflow-hidden"
            >
              {idx === currentIndex && (
                <div
                  className="h-1 bg-white transition-all"
                  style={{ width: `${dotProgress}%` }}
                />
              )}
              {idx < currentIndex && <div className="h-1 bg-white w-full" />}
            </div>
          ))}
        </div>

        <StoryCard story={currentStory} onDelete={onDelete} isStoryModal={true} />
      </div>
    </div>,
    document.body // 👈 renders outside main app container
  );
};

export default StoryViewerModal;
