"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useWindowSize } from "react-use";
import Confetti from "react-confetti";

import TrackSearch from "../components/TrackSearch";
import MediaUploader from "../components/MediaUploader";
import PostCard from "../components/PostCard";
import { Track } from "../types/spotify";
import { createPost } from "../lib/postsApi";
import { getSpotifyTrack } from "../lib/spotifyApi";
import { PostDto } from "../types/Post";
import { useSpotifyPlayer } from "../context/SpotifyContext";
import { LuAudioLines } from "react-icons/lu";

export default function CreatePostPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { width, height } = useWindowSize();
  const { player, playTrack, pauseTrack, currentTrackId, initPlayer } =
    useSpotifyPlayer();
  const [spotifyVolume, setSpotifyVolume] = useState(0.1);

  const DEFAULT_ALBUM_IMAGE = "/default-album-cover.png";

  const [mediaDimensions, setMediaDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [caption, setCaption] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>(DEFAULT_ALBUM_IMAGE);
  const [spotifyError, setSpotifyError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const mockPost: PostDto = {
    id: 0,
    title: caption || "Preview",
    text: caption || "Preview",
    customVideoUrl: isVideo ? mediaPreview || undefined : undefined,
    customImageUrl: !isVideo ? mediaPreview || imageSrc : imageSrc,
    albumArtUrl: !isVideo ? mediaPreview || imageSrc : imageSrc,
    trackId: selectedTrack?.id || "",
    trackName: selectedTrack?.name || "Select a track",
    artistName: selectedTrack?.artists[0]?.name || "Artist",
    authorUsername: user?.username || "you",
    authorProfilePictureUrl: user?.profilePictureUrl || "",
    likesCount: 42,
    likedByCurrentUser: false,
    createdAt: new Date().toISOString(),
    branchCount: 0,
    comments: [],
  };

  useEffect(() => {
    initPlayer();
  }, [initPlayer]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setSpotifyVolume(newVolume);
    if (player && isVideo) {
      player.setVolume(newVolume);
    }
  };

  useEffect(() => {
    const fetchTrack = async () => {
      const trackId = searchParams.get("id");
      if (!trackId || !user) return;

      try {
        const track = await getSpotifyTrack(trackId, user.username);
        setSelectedTrack(track);
        setSpotifyError(null);
        const albumUrl = track?.album?.images[0]?.url || DEFAULT_ALBUM_IMAGE;
        setImageSrc(albumUrl);
        setMediaPreview(albumUrl);
        setIsVideo(false);
      } catch {
        setSpotifyError(
          "Unable to fetch track. Make sure your Spotify account is connected."
        );
      }
    };
    fetchTrack();
  }, [searchParams, user]);

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
          artistName: selectedTrack.artists[0]?.name || "Unknown Artist",
          albumArtUrl: imageSrc,
          branchCount: 0,
          trackVolume: isVideo ? spotifyVolume : 1,
        },
        mediaFile || undefined
      );
      setShowConfetti(true);
      setSpotifyVolume(1);
      setTimeout(() => router.push(`/profile/${user.username}`), 3000);
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setLoading(false);
    }
  };

  const showPreview = selectedTrack;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 text-white flex flex-col items-center">
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
                onSelectTrack={(track) => {
                  setSelectedTrack(track);
                  setSpotifyError(null);
                  const albumUrl =
                    track.album?.images[0]?.url || DEFAULT_ALBUM_IMAGE;
                  setImageSrc(albumUrl);
                  setMediaPreview(albumUrl);
                  setIsVideo(false);
                }}
              />
            </div>

            {spotifyError && (
              <div className="bg-red-600/20 border border-red-500 p-4 rounded-xl text-center text-red-300">
                <p className="font-semibold">{spotifyError}</p>
                <a
                  href="/connect-spotify"
                  className="underline text-yellow-300 hover:text-yellow-400 mt-2 inline-block"
                >
                  Connect your Spotify account
                </a>
              </div>
            )}

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

            <button
              type="submit"
              disabled={!selectedTrack || !!spotifyError || loading}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-semibold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {loading ? "Posting..." : "Post Now"}
            </button>
          </form>
        </div>

        {showPreview && (
          <div className="w-full flex flex-col items-center gap-4">
            <div className="w-[3/4] flex flex-col items-center">
              <div className="min-w-[400px] w-full max-w-3xl">
                <h3 className="text-xl md:text-2xl font-bold text-white my-6 text-center">
                  Live Preview
                </h3>

                {/* Styled purple volume slider */}
                {isVideo && (
                  <div className="flex justify-center items-center gap-2 my-4">
                    <span className="text-purple-300 font-medium">
                      Track Volume
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={spotifyVolume}
                      onChange={handleVolumeChange}
                      onMouseDown={(e) => e.stopPropagation()}
                      onTouchStart={(e) => e.stopPropagation()}
                      onMouseUp={(e) => e.stopPropagation()}
                      onTouchEnd={(e) => e.stopPropagation()}
                      className="w-32 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 accent-purple-400 hover:accent-pink-400 transition"
                    />
                    <LuAudioLines className="text-purple-400 w-6 h-6" />
                  </div>
                )}

                <div className="flex justify-center">
                  <PostCard
                    post={mockPost}
                    isMock={false}
                    showActions={true}
                    isDetailView={true}
                    currentUsername={user?.username}
                    profileFeed={false}
                    large={true}
                    fullWidth={true}
                    playTrack={playTrack}
                    pauseTrack={pauseTrack}
                    currentTrackId={currentTrackId}
                    isActive={currentTrackId === mockPost.trackId}
                    onMediaDimensionsChange={(dims) => setMediaDimensions(dims)}
                  />
                </div>

                <div className="flex justify-center mt-5 text-zinc-300">
                  Media Dimensions: {mediaDimensions?.width || 370} px ×{" "}
                  {mediaDimensions?.height || 460} px
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
