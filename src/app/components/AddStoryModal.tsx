"use client";

import { FC, useState, useEffect } from "react";
import { HiX } from "react-icons/hi";
import Confetti from "react-confetti";
import { StoryDto } from "../types/Story";
import { uploadStory } from "../lib/storiesApi";
import TrackSearch from "../components/TrackSearch";
import StoryPreview from "./StoryPreview";
import { useAuth } from "../context/AuthContext";
import MediaUploader from "../components/MediaUploader";
import { AppleMusicTrack } from "../create/CreatePostPage";

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
  const [selectedTrack, setSelectedTrack] = useState<AppleMusicTrack | null>(
    null
  );
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewStory, setPreviewStory] = useState<StoryDto | null>(null);
  const [, setIsVideo] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

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
        : selectedTrack?.albumArtUrl || "",
      s3Key: "",
      type: mediaFile ? (videoFlag ? "VIDEO" : "IMAGE") : "TRACK",
      trackId: selectedTrack?.id,
      trackName: selectedTrack?.name,
      artistName: selectedTrack?.artistName,
      albumArtUrl: selectedTrack?.albumArtUrl,
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
      const storyPayload: StoryDto = {
        id: 0, // temporary or backend-generated
        authorId: user.id,
        authorUsername: user.username,
        authorProfilePictureUrl: user.profilePictureUrl || "",
        contentUrl: "", // backend will fill after upload
        type: "TRACK",
        trackId: selectedTrack.id,
        trackName: selectedTrack.name,
        artistName: selectedTrack.artistName,
        albumArtUrl: selectedTrack.albumArtUrl || "/default-album-cover.png",
        applePreviewUrl: selectedTrack.previewUrl,
        caption: "", // optional
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h expiry
        viewers: [],
      };

      const newStory = await uploadStory(storyPayload, mediaFile ?? undefined);
      onStoryAdded(newStory);

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
                {/* Apple Music preview (if available) */}
                {selectedTrack.previewUrl ? (
                  <audio
                    src={selectedTrack.previewUrl}
                    controls
                    className="w-full mt-2"
                  />
                ) : (
                  <p className="text-xs text-zinc-400">
                    No preview available for this track.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* MediaUploader */}
          <MediaUploader
            preview={previewUrl}
            setPreview={setPreviewUrl}
            setFile={setMediaFile}
            file={mediaFile}
            albumArt={selectedTrack?.albumArtUrl}
          />

          {/* Preview Story */}
          {previewStory && (
            <div className="mt-2">
              <StoryPreview story={previewStory} />
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="terms"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 accent-purple-500 w-4 h-4 cursor-pointer"
              required
            />
            <label
              htmlFor="terms"
              className="text-sm text-zinc-300 leading-tight pt-1"
            >
              I agree that my post follows the{" "}
              <a
                href="/terms-of-use"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 underline"
              >
                Terms of Use
              </a>
              , and I will not post objectionable content.
            </label>
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={uploading || !selectedTrack || !agreedToTerms}
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
