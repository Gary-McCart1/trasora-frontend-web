"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useWindowSize } from "react-use";
import Confetti from "react-confetti";

import TrackSearch from "../components/TrackSearch";
import MediaUploader from "../components/MediaUploader";
import PostCard from "../components/PostCard";
import { createPost } from "../lib/postsApi";
import { PostDto } from "../types/Post";
import { LuAudioLines } from "react-icons/lu";
import { useApplePlayer } from "../context/ApplePlayerContext"; // ✅ import context

export interface AppleMusicTrack {
  id: string;
  name: string;
  artistName: string;
  albumArtUrl?: string;
  previewUrl?: string;
}

export default function CreatePostPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const router = useRouter();
  const { user } = useAuth();
  const { width, height } = useWindowSize();
  const { setVolume: setSongVolume } = useApplePlayer(); // ✅ hook into ApplePlayer

  const [selectedTrack, setSelectedTrack] = useState<AppleMusicTrack | null>(
    null
  );
  const [caption, setCaption] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>("/default-album-cover.png");
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [trackVolume, setTrackVolume] = useState(0.3);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const DEFAULT_ALBUM_IMAGE = "/default-album-cover.png";

  // Mock post for preview
  const mockPost: PostDto = {
    id: 0,
    title: caption || "Preview",
    text: caption || "Preview",
    customVideoUrl: isVideo ? mediaPreview || undefined : undefined,
    customImageUrl: !isVideo ? mediaPreview || imageSrc : imageSrc,
    albumArtUrl: selectedTrack?.albumArtUrl || imageSrc,
    trackId: selectedTrack?.id || "",
    trackName: selectedTrack?.name || "Select a track",
    artistName: selectedTrack?.artistName || "Artist",
    applePreviewUrl: selectedTrack?.previewUrl,
    authorUsername: user?.username || "you",
    authorProfilePictureUrl: user?.profilePictureUrl || "",
    likesCount: 42,
    likedByCurrentUser: false,
    createdAt: new Date().toISOString(),
    branchCount: 0,
    comments: [],
  };

  // Update media preview when mediaFile changes
  useEffect(() => {
    if (!mediaFile) {
      setMediaPreview(imageSrc);
      setIsVideo(false);
      return;
    }
    const url = URL.createObjectURL(mediaFile);
    setMediaPreview(url);
    setIsVideo(mediaFile.type.startsWith("video"));
    return () => URL.revokeObjectURL(url);
  }, [mediaFile, imageSrc]);

  // ✅ Control Apple song audio volume when video is uploaded
  useEffect(() => {
    if (isVideo) {
      setSongVolume(trackVolume);
    }
  }, [trackVolume, isVideo, setSongVolume]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrack || !user) return;

    setLoading(true);
    try {
      await createPost(
        {
          title: caption,
          text: caption,
          trackId: selectedTrack.id,
          trackName: selectedTrack.name,
          artistName: selectedTrack.artistName,
          albumArtUrl: selectedTrack.albumArtUrl || imageSrc,
          branchCount: 0,
          trackVolume: isVideo ? trackVolume : 1,
          applePreviewUrl: selectedTrack.previewUrl,
        },
        mediaFile || undefined
      );
      setShowConfetti(true);
      setTimeout(() => router.push(`/profile/${user.username}`), 3000);
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setLoading(false);
    }
  };

  const showPreview = selectedTrack;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 text-white flex flex-col items-center pt-[5rem]">
      <h1 className="text-5xl md:text-6xl font-extrabold mb-12 text-center bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-500 bg-clip-text text-transparent">
        Create a Post
      </h1>

      <div
        className={`flex flex-col xl:flex-row w-full ${
          !showPreview ? "items-center justify-center" : ""
        }`}
      >
        <div className="w-full max-w-2xl">
          <form
            onSubmit={handleSubmit}
            className="space-y-6 bg-gradient-to-b from-zinc-900 to-zinc-800 p-8 rounded-3xl shadow-xl border border-zinc-700"
          >
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Track
              </label>
              <TrackSearch
                onSelectTrack={(track: AppleMusicTrack) => {
                  setSelectedTrack(track);
                  const albumUrl = track.albumArtUrl || DEFAULT_ALBUM_IMAGE;
                  setImageSrc(albumUrl);
                  setMediaPreview(albumUrl);
                  setIsVideo(false);
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Caption
              </label>
              <textarea
                rows={3}
                maxLength={300}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write something about this song..."
                className="w-full p-3 bg-zinc-800 text-white border border-zinc-700 rounded-xl focus:ring-2 focus:ring-purple-500 placeholder:text-zinc-500 resize-none"
              />
              <p className="text-xs text-zinc-500 mt-1">{caption.length}/300</p>
            </div>

            <MediaUploader
              preview={mediaPreview}
              setPreview={setMediaPreview}
              setFile={setMediaFile}
              file={mediaFile}
              albumArt={imageSrc}
            />

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
                  // target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 underline"
                >
                  Terms of Use
                </a>
                , and I will not post objectionable content.
              </label>
            </div>

            <button
              type="submit"
              disabled={!selectedTrack || loading || !agreedToTerms}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-semibold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {loading ? "Posting..." : "Post Now"}
            </button>
          </form>
        </div>

        {showPreview && (
          <div className="w-full flex flex-col items-center gap-4 mt-6 xl:mt-0">
            <div className="w-[3/4] flex flex-col items-center">
              <div className="min-w-[400px] w-full max-w-3xl">
                <h3 className="text-xl md:text-2xl font-bold text-white my-6 text-center">
                  Live Preview
                </h3>

                <div className="flex flex-col w-full items-center gap-4">
                  {isVideo && ( // ✅ slider only when video uploaded
                    <div className="flex items-center gap-3 w-80">
                      <span className="text-sm text-zinc-100 text-nowrap">
                        Song Volume
                      </span>
                      <LuAudioLines className="w-6 h-6 text-purple-400" />
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={trackVolume}
                        onChange={(e) =>
                          setTrackVolume(parseFloat(e.target.value))
                        }
                        className="w-full accent-purple-500 h-2 rounded-lg cursor-pointer"
                      />
                      <span className="text-sm text-purple-300">
                        {Math.round(trackVolume * 100)}%
                      </span>
                    </div>
                  )}
                  <PostCard
                    post={mockPost}
                    trackVolume={trackVolume}
                    isMock={false}
                    showActions={true}
                    isDetailView={true}
                    currentUsername={user?.username}
                    profileFeed={false}
                    large={true}
                    fullWidth={true}
                    currentTrackId={mockPost.trackId}
                    isActive={true}
                    onMediaDimensionsChange={() => {}}
                    videoRef={videoRef}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          numberOfPieces={150}
          recycle={false}
          gravity={0.3}
        />
      )}
    </div>
  );
}
