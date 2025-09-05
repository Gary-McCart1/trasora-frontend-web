"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useWindowSize } from "react-use";
import Confetti from "react-confetti";

import TrackSearch from "../../components/TrackSearch";
import MediaUploader from "../../components/MediaUploader";
import PostCard from "../../components/PostCard";

import { getPostById, editPost } from "../../lib/postsApi"
import { PostDto } from "../../types/Post";
import { Track } from "../../types/spotify";
import { LuAudioLines } from "react-icons/lu";
import { useSpotifyPlayer } from "../../context/SpotifyContext";

export default function EditPostPage() {
  const router = useRouter();
  const { id } = useParams();
  const { user } = useAuth();
  const { width, height } = useWindowSize();
  const { player, playTrack, pauseTrack, currentTrackId, initPlayer } =
    useSpotifyPlayer();

  const [post, setPost] = useState<PostDto | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [caption, setCaption] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const [spotifyVolume, setSpotifyVolume] = useState(0.1);
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [mediaDimensions, setMediaDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    initPlayer();
  }, [initPlayer]);

  useEffect(() => {
    async function fetchPost() {
      if (!id) return;
  
      const postId = Array.isArray(id) ? id[0] : id;
  
      try {
        const fetchedPost = await getPostById(postId);
        setPost(fetchedPost);
        setCaption(fetchedPost.text);
  
        setSelectedTrack({
          id: fetchedPost.trackId,
          name: fetchedPost.trackName,
          artists: [{ name: fetchedPost.artistName ?? "Unknown Artist" }],
          album: {
            images: [
              { url: fetchedPost.albumArtUrl ?? "/default-album-cover.png" },
            ],
          },
        });
  
        if (fetchedPost.customVideoUrl) {
          setMediaPreview(fetchedPost.customVideoUrl);
          setIsVideo(true);
        } else {
          setMediaPreview(
            fetchedPost.customImageUrl ?? fetchedPost.albumArtUrl ?? null
          );
          setIsVideo(false);
        }
  
        if (fetchedPost.trackVolume !== undefined) {
          setSpotifyVolume(fetchedPost.trackVolume ?? 0.1);
        }
      } catch (err) {
        console.error("Failed to fetch post:", err);
      }
    }
  
    fetchPost();
  }, [id]);
  

  useEffect(() => {
    if (!mediaFile) return;
    const url = URL.createObjectURL(mediaFile);
    setMediaPreview(url);
    setIsVideo(mediaFile.type.startsWith("video"));
    return () => URL.revokeObjectURL(url);
  }, [mediaFile]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setSpotifyVolume(newVolume);
    if (player && isVideo) {
      player.setVolume(newVolume);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrack || !user || !post) return;

    setLoading(true);

    try {
      await editPost(
        String(post.id),
        {
          title: caption,
          text: caption,
          trackId: selectedTrack.id,
          trackName: selectedTrack.name,
          artistName: selectedTrack.artists[0]?.name || "Unknown Artist",
          albumArtUrl: selectedTrack.album.images[0]?.url || "",
          trackVolume: isVideo ? spotifyVolume : 1,
        },
        mediaFile || undefined
      );

      setShowConfetti(true);
      setTimeout(() => router.push(`/profile/${user.username}`), 3000);
    } catch (err) {
      console.error("Update failed", err);
    } finally {
      setLoading(false);
    }
  };

  if (!post) {
    return <div className="text-white text-center py-20">Loading post...</div>;
  }

  const mockPost: PostDto = {
    id: post.id!,
    title: caption,
    text: caption,
    customVideoUrl: isVideo ? mediaPreview || undefined : undefined,
    customImageUrl: !isVideo ? mediaPreview || undefined : undefined,
    albumArtUrl: selectedTrack?.album.images[0]?.url || "",
    trackId: selectedTrack?.id || "",
    trackName: selectedTrack?.name || "",
    artistName: selectedTrack?.artists[0]?.name || "",
    authorUsername: user?.username || "you",
    authorProfilePictureUrl: user?.profilePictureUrl || "",
    likesCount: post.likesCount || 0,
    likedByCurrentUser: post.likedByCurrentUser || false,
    createdAt: post.createdAt || new Date().toISOString(),
    branchCount: post.branchCount,
    comments: post.comments || [],
  };

  const showPreview = selectedTrack && user;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 text-white flex flex-col items-center">
      <h1 className="text-5xl md:text-6xl font-extrabold mb-12 text-center bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-500 bg-clip-text text-transparent">
        Edit Your Post
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
                onSelectTrack={setSelectedTrack}
                initialTrack={selectedTrack}
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
                placeholder="Update your caption..."
                className="w-full p-3 bg-zinc-800 text-white border border-zinc-700 rounded-xl focus:ring-2 focus:ring-purple-500 placeholder:text-zinc-500 resize-none"
              />
              <p className="text-xs text-zinc-500 mt-1">{caption.length}/300</p>
            </div>

            <MediaUploader
              preview={mediaPreview}
              setPreview={setMediaPreview}
              setFile={setMediaFile}
              file={mediaFile}
              albumArt={selectedTrack?.album.images[0]?.url}
            />

            <button
              type="submit"
              disabled={!selectedTrack || loading}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-semibold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {loading ? "Saving..." : "Save Changes"}
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

                {isVideo && (
                  <div className="flex justify-center items-center gap-3 my-4 w-full">
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
          numberOfPieces={160}
          colors={["#7c3aed", "#6d28d9", "#4c1d95", "#8b5cf6"]}
        />
      )}
    </div>
  );
}
