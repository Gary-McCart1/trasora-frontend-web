"use client";

import { FC, useState, useEffect } from "react";
import { HiX } from "react-icons/hi";
import Confetti from "react-confetti";
import { StoryDto } from "../types/Story";
import { uploadStory } from "../api/storyApi/route";
import TrackSearch from "../components/TrackSearch";
import { Track } from "../types/spotify";
import StoryPreview from "./StoryPreview";
import { useAuth } from "../context/AuthContext";
import MediaUploader from "../components/MediaUploader";

interface AddStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoryAdded: (newStory: StoryDto) => void;
}

const AddStoryModal: FC<AddStoryModalProps> = ({
  isOpen,
  onClose,
  onStoryAdded,
}) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewStory, setPreviewStory] = useState<StoryDto | null>(null);
  const [isVideo, setIsVideo] = useState(false);

  // Update preview whenever track/media changes
  useEffect(() => {
    if (!mediaFile && !selectedTrack) {
      setPreviewStory(null);
      return;
    }

    const videoFlag = mediaFile?.type.startsWith("video") || false;
    setIsVideo(videoFlag);

    const preview: StoryDto = {
      id: 0,
      authorId: user?.id || 0,
      authorUsername: user?.username || "You",
      authorProfilePictureUrl: user?.profilePictureUrl || "",
      contentUrl: mediaFile
        ? URL.createObjectURL(mediaFile)
        : selectedTrack?.album?.images[0]?.url || "",
      s3Key: "",
      type: mediaFile ? (videoFlag ? "VIDEO" : "IMAGE") : "TRACK",
      trackId: selectedTrack?.id,
      trackName: selectedTrack?.name,
      artistName: selectedTrack?.artists[0]?.name,
      albumArtUrl: selectedTrack?.album?.images[0]?.url,
      createdAt: new Date().toISOString(),
      expiresAt: new Date().toISOString(),
      viewers: [],
    };

    setPreviewStory(preview);
  }, [mediaFile, selectedTrack, user]);

  if (!isOpen) return null;

  const handleUpload = async () => {
    if (!selectedTrack || !user) {
      alert("Please select a track first!");
      return;
    }

    setUploading(true);

    try {
      const newStory = await uploadStory(
        user.id,
        user.username,
        user.profilePictureUrl || "",
        selectedTrack,
        mediaFile ?? undefined,
        "" // optional caption
      );

      const storyWithAuthor: StoryDto = {
        ...newStory,
        authorId: newStory.authorId || user.id,
        authorProfilePictureUrl:
          newStory.authorProfilePictureUrl || user.profilePictureUrl || "",
      };

      onStoryAdded(storyWithAuthor);

      // Show confetti
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        onClose();
      }, 3000);
    } catch (err) {
      console.error("Failed to upload story:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <div className="fixed top-20 inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
        <div className="bg-zinc-900 rounded-3xl p-6 w-full max-w-sm relative shadow-xl flex flex-col space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Close button */}
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
            onClick={onClose}
          >
            <HiX size={24} />
          </button>

          <h2 className="text-2xl font-bold text-white text-center">
            Add New Story
          </h2>

          {/* Track Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-300">
              Track
            </label>
            <TrackSearch onSelectTrack={(track) => setSelectedTrack(track)} />
            {selectedTrack && previewStory?.trackId && (
              <div className="mt-2">
                <iframe
                  src={`https://open.spotify.com/embed/track/${previewStory.trackId}`}
                  width="100%"
                  height="80"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  className="rounded-lg shadow-inner"
                ></iframe>
              </div>
            )}
          </div>

          {/* MediaUploader */}
          <MediaUploader
            preview={previewUrl}
            setPreview={setPreviewUrl}
            setFile={setMediaFile}
            file={mediaFile}
            albumArt={selectedTrack?.album?.images[0]?.url}
          />

          {/* Preview Story */}
          {previewStory && (
            <div className="mt-2">
              <StoryPreview story={previewStory} />
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={uploading || !selectedTrack}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-semibold text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? "Uploading..." : "Upload Story"}
          </button>
        </div>
      </div>

      {/* Confetti */}
      {showConfetti && (
        <Confetti numberOfPieces={150} gravity={0.3} recycle={false} />
      )}
    </>
  );
};

export default AddStoryModal;
