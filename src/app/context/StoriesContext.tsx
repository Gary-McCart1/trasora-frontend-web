// context/StoriesContext.tsx
"use client"
import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from "react";
import { StoryDto } from "../types/Story";

interface StoriesContextType {
  stories: StoryDto[];
  setStories: Dispatch<SetStateAction<StoryDto[]>>;
  activeStoryIndex: number;
  setActiveStoryIndex: (index: number) => void;
}

const StoriesContext = createContext<StoriesContextType | undefined>(undefined);

export const StoriesProvider = ({ children }: { children: ReactNode }) => {
  const [stories, setStories] = useState<StoryDto[]>([]);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);

  return (
    <StoriesContext.Provider
      value={{ stories, setStories, activeStoryIndex, setActiveStoryIndex }}
    >
      {children}
    </StoriesContext.Provider>
  );
};

export const useStories = () => {
  const context = useContext(StoriesContext);
  if (!context) throw new Error("useStories must be used within a StoriesProvider");
  return context;
};
