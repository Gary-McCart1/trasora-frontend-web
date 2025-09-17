"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useWindowSize } from "react-use";
import Confetti from "react-confetti";

import TrackSearch from "../../components/TrackSearch";
import MediaUploader from "../../components/MediaUploader";
import PostCard from "../../components/PostCard";

import { getPostById, editPost } from "../../lib/postsApi";
import { PostDto } from "../../types/Post";
import { LuAudioLines } from "react-icons/lu";

export interface AppleMusicTrack {
  id: string;
  name: string;
  artistName?: string;
  albumArtUrl?: string;
  previewUrl?: string;
}

export default function EditPostPage() {
  const router = useRouter();
  const { id } = useParams();
  const { user } = useAuth();
  const { width, height } = useWindowSize();

  const [post, setPost] = useState<PostDto | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<AppleMusicTrack | null>(null);
  const [caption, setCaption] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const [trackVolume, setTrackVolume] = useState(0.3);
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const DEFAULT_ALBUM_IMAGE = "/default-album-cover.png";

  // Load the post
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
          artistName: fetchedPost.artistName || undefined,
          albumArtUrl: fetchedPost.albumArtUrl ?? DEFAULT_ALBUM_IMAGE,
          previewUrl: fetchedPost.applePreviewUrl ?? undefined,
        });

        if (fetchedPost.customVideoUrl) {
          setMediaPreview(fetchedPost.customVideoUrl);
          setIsVideo(true);
        } else {
          setMediaPreview(
            fetchedPost.customImageUrl ?? fetchedPost.albumArtUrl ?? DEFAULT_ALBUM_IMAGE
          );
          setIsVideo(false);
        }

        if (fetchedPost.trackVolume !== undefined) {
          setTrackVolume(fetchedPost.trackVolume);
        }
      } catch (err) {
        console.error("Failed to fetch post:", err);
      }
    }

    fetchPost();
  }, [id]);

  // Update media preview when new file is chosen
  useEffect(() => {
    if (!mediaFile) return;
    const url = URL.createObjectURL(mediaFile);
    setMediaPreview(url);
    setIsVideo(mediaFile.type.startsWith("video"));
    return () => URL.revokeObjectURL(url);
  }, [mediaFile]);

  // Sync video volume
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = trackVolume;
    }
  }, [trackVolume]);

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
          artistName: selectedTrack.artistName ?? "",
          albumArtUrl: selectedTrack.albumArtUrl || DEFAULT_ALBUM_IMAGE,
          trackVolume: isVideo ? trackVolume : 1,
          applePreviewUrl: selectedTrack.previewUrl,
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
    ...post,
    title: caption,
    text: caption,
    customVideoUrl: isVideo ? mediaPreview || undefined : undefined,
    customImageUrl: !isVideo ? mediaPreview || selectedTrack?.albumArtUrl : undefined,
    albumArtUrl: selectedTrack?.albumArtUrl || DEFAULT_ALBUM_IMAGE,
    trackId: selectedTrack?.id || "",
    trackName: selectedTrack?.name || "Select a track",
    artistName: selectedTrack?.artistName || "Artist",
    applePreviewUrl: selectedTrack?.previewUrl,
    authorUsername: user?.username || "you",
    authorProfilePictureUrl: user?.profilePictureUrl || "",
  };

  const showPreview = selectedTrack;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 text-white flex flex-col items-center">
      <h1 className="text-5xl md:text-6xl font-extrabold mb-12 text-center bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-500 bg-clip-text text-transparent">
        Edit Your Post
      </h1>

      <div className={`flex flex-col xl:flex-row w-full ${!showPreview ? "items-center justify-center" : ""}`}>
        <div className="w-full max-w-2xl">
          <form
            onSubmit={handleSubmit}
            className="space-y-6 bg-gradient-to-b from-zinc-900 to-zinc-800 p-8 rounded-3xl shadow-xl border border-zinc-700"
          >
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Track</label>
              <TrackSearch
                onSelectTrack={(track: AppleMusicTrack) => {
                  setSelectedTrack(track);
                  const albumUrl = track.albumArtUrl || DEFAULT_ALBUM_IMAGE;
                  setMediaPreview(albumUrl);
                  setIsVideo(false);
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Caption</label>
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
              albumArt={selectedTrack?.albumArtUrl}
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
          <div className="w-full flex flex-col items-center gap-4 mt-6 xl:mt-0">
            <div className="w-[3/4] flex flex-col items-center">
              <div className="min-w-[400px] w-full max-w-3xl">
                <h3 className="text-xl md:text-2xl font-bold text-white my-6 text-center">
                  Live Preview
                </h3>

                <div className="flex flex-col w-full items-center gap-4">
                  {(isVideo || selectedTrack?.previewUrl) && (
                    <div className="flex items-center gap-3 w-80">
                      <span className="text-sm text-zinc-100 text-nowrap">Song Volume</span>
                      <LuAudioLines className="w-6 h-6 text-purple-400" />
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={trackVolume}
                        onChange={(e) => setTrackVolume(parseFloat(e.target.value))}
                        className="w-full accent-purple-500 h-2 rounded-lg cursor-pointer"
                      />
                      <span className="text-sm text-purple-300">{Math.round(trackVolume * 100)}%</span>
                    </div>
                  )}
                  <PostCard
                    post={mockPost}
                    trackVolume={trackVolume} // pass volume directly
                    isMock={false}
                    showActions={true}
                    isDetailView={true}
                    currentUsername={user?.username}
                    profileFeed={false}
                    large={true}
                    fullWidth={true}
                    currentTrackId={mockPost.trackId}
                    isActive={true} // active track in preview
                    onMediaDimensionsChange={() => {}}
                    videoRef={videoRef} // pass video ref for volume control
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
          numberOfPieces={160}
          colors={["#7c3aed", "#6d28d9", "#4c1d95", "#8b5cf6"]}
        />
      )}
    </div>
  );
}
