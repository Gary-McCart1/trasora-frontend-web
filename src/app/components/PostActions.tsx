"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  FaHeart,
  FaRegCommentDots,
  FaTrash,
  FaEdit,
  FaEllipsisV,
} from "react-icons/fa";
import { LuGitBranchPlus } from "react-icons/lu";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import getS3Url from "../utils/S3Url";
import AvailableTrunksList from "./AvailableTrunksList";
import { useAuth } from "../context/AuthContext";
import {
  likePost,
  commentOnPost,
  deletePost,
  deleteComment,
} from "../lib/postsApi";
import { useRouter } from "next/navigation";
import { Trunk } from "../types/User";
import { addTrackToTrunk, getAvailableTrunks } from "../lib/trunksApi";
import { incrementPostBranchCount } from "../lib/postsApi";

interface Comment {
  id: number;
  authorUsername: string;
  authorProfilePictureUrl: string;
  commentText: string;
  createdAt: string;
}

interface RootSongInput {
  trackId: string;
  title: string;
  artist: string;
  albumArtUrl: string;
}

interface Branch {
  id: number;
  trackId: string;
  title: string;
  artist: string;
  albumArtUrl: string;
  addedByUsername: string;
}

interface PostActionsProps {
  postId: number;
  authorUsername?: string;
  authorProfilePictureUrl?: string;
  currentUsername?: string;
  likesCount: number;
  commentsCount: number;
  likedByCurrentUser: boolean;
  comments: Comment[];
  caption?: string;
  createdAt: string;
  branchCount: number;
  onEdit?: (postId: number) => void;
  onDelete?: (postId: number) => void; // <-- added
  onLike?: (postId: number) => void; // <-- added
  onComment?: (postId: number, commentText: string) => void; // <-- added
  onSongAdded?: (branch: Branch) => void;
  selectedSong: RootSongInput;
}

export default function PostActions({
  postId,
  authorUsername,
  authorProfilePictureUrl,
  currentUsername,
  likesCount: initialLikesCount,
  commentsCount: initialCommentsCount,
  likedByCurrentUser: initialLikedByCurrentUser,
  comments: initialComments,
  caption,
  createdAt,
  branchCount,
  onSongAdded,
  selectedSong,
}: PostActionsProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [commentsCount, setCommentsCount] = useState(initialCommentsCount);
  const [likedByCurrentUser, setLikedByCurrentUser] = useState(
    initialLikedByCurrentUser
  );
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [loadingLike, setLoadingLike] = useState(false);
  const [loadingComment, setLoadingComment] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingCommentDelete, setLoadingCommentDelete] = useState<
    number | null
  >(null);
  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [availableTrunks, setAvailableTrunks] = useState<Trunk[]>([]);
  const [loadingTrunks, setLoadingTrunks] = useState(false);
  const [, setLoadingBranch] = useState(false);
  const [localBranchCount, setLocalBranchCount] = useState(branchCount);

  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { user } = useAuth();
  const isAuthor = user?.username === authorUsername;

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-focus comment box
  useEffect(() => {
    if (showCommentBox && inputRef.current) inputRef.current.focus();
  }, [showCommentBox]);

  const handleLikeClick = async () => {
    if (loadingLike) return;
    setLoadingLike(true);
    try {
      await likePost(String(postId));
      setLikedByCurrentUser(!likedByCurrentUser);
      setLikesCount((count) => count + (likedByCurrentUser ? -1 : 1));
    } catch {
      alert("Failed to like post.");
    } finally {
      setLoadingLike(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (loadingComment || !commentText.trim()) return;
    setLoadingComment(true);
    try {
      await commentOnPost(String(postId), commentText.trim());
      setCommentText("");
      setShowCommentBox(false);
      setCommentsCount((c) => c + 1);
    } catch {
      alert("Failed to comment.");
    } finally {
      setLoadingComment(false);
    }
  };

  const handleDeleteClick = async () => {
    if (!isAuthor || loadingDelete) return;
    if (!confirm("Delete this post?")) return;
    setLoadingDelete(true);
    try {
      await deletePost(String(postId));
      alert("Post deleted.");

      // Remove post from UI
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Could not delete post.");
    } finally {
      setLoadingDelete(false);
    }
  };

  const handleDeleteComment = async (id: number) => {
    if (loadingCommentDelete) return;
    if (!confirm("Delete comment?")) return;
    setLoadingCommentDelete(id);
    try {
      await deleteComment(String(id));
      setComments((prev) => prev.filter((c) => c.id !== id));
      setCommentsCount((c) => c - 1);
    } catch {
      alert("Could not delete comment.");
    } finally {
      setLoadingCommentDelete(null);
    }
  };

  const handleBranchClick = async () => {
    setLoadingTrunks(true);
    try {
      const data = await getAvailableTrunks();
      setAvailableTrunks(data);
      setBranchModalOpen(true);
    } catch (err) {
      console.error(err);
      alert("Could not load trunks");
    } finally {
      setLoadingTrunks(false);
    }
  };

  const handleSelectTrunk = async (song: RootSongInput, trunkId: number) => {
    if (!user) return;
    setLoadingBranch(true);

    try {
      // Add track to trunk
      const newBranch = await addTrackToTrunk(trunkId, song, user.username);

      // Update UI with new branch
      onSongAdded?.(newBranch);
      setBranchModalOpen(false);

      // Optimistically increment local branch count
      setLocalBranchCount((prev) => prev + 1);

      // Update server branch count for the post
      try {
        await incrementPostBranchCount(String(postId));
      } catch (err) {
        console.error("Failed to increment branch count on post", err);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to add song. Try again.");
    } finally {
      setLoadingBranch(false);
    }
  };

  return (
    <div className="bg-zinc-900 rounded-b-xl overflow-hidden shadow border border-zinc-800 text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <img
            src={getS3Url(authorProfilePictureUrl) || "/default-profilepic.png"}
            alt={authorUsername}
            className="w-11 h-11 rounded-full object-cover border border-purple-500"
          />
          <div className="flex flex-col">
            <span className="font-semibold text-base">{authorUsername}</span>
            <span className="text-xs text-zinc-500">
              {createdAt &&
                formatDistanceToNow(new Date(createdAt + "Z"), {
                  addSuffix: true,
                })}
            </span>
          </div>
        </div>

        {isAuthor && (
          <div ref={menuRef} className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)}>
              <FaEllipsisV />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-zinc-800 rounded-md shadow border border-zinc-700 z-50">
                <button
                  onClick={() => router.push(`/edit/${postId}`)}
                  className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-zinc-700 w-full"
                >
                  <FaEdit size={14} /> Edit
                </button>
                <button
                  onClick={handleDeleteClick}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-600 hover:text-white w-full"
                  disabled={loadingDelete}
                >
                  <FaTrash size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Caption */}
      {caption && (
        <div className="px-5 pb-4">
          <p className="text-sm whitespace-pre-wrap text-zinc-300 text-left">
            {caption}
          </p>
        </div>
      )}

      {/* Like + Comment + Branch Bar */}
      <div className="flex items-center gap-6 px-5 py-3 border-t border-zinc-800">
        <button
          onClick={handleLikeClick}
          className={`flex items-center gap-2 text-lg transition ${
            likedByCurrentUser
              ? "text-purple-500"
              : "text-white hover:text-purple-500"
          }`}
          disabled={loadingLike}
        >
          <FaHeart />
          <span>{likesCount}</span>
        </button>

        <button
          onClick={() => setShowCommentBox((prev) => !prev)}
          className="flex items-center gap-2 text-lg hover:text-purple-500"
        >
          <FaRegCommentDots />
          <span>{commentsCount}</span>
        </button>

        <button
          onClick={handleBranchClick}
          className="flex items-center gap-2 text-lg hover:text-purple-500"
        >
          <LuGitBranchPlus />
          <span>
            {localBranchCount > branchCount ? localBranchCount : branchCount}
          </span>
        </button>
      </div>

      {/* Comment Input */}
      <AnimatePresence>
        {showCommentBox && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-5 pb-4"
          >
            <div className="flex gap-3 mt-2">
              <input
                ref={inputRef}
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-grow px-4 py-2 text-sm bg-zinc-800 text-white border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCommentSubmit();
                }}
              />
              <button
                onClick={handleCommentSubmit}
                disabled={loadingComment}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-semibold"
              >
                Post
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Branch Modal */}
      {branchModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 p-6 rounded-xl max-h-[80vh] overflow-y-auto w-96">
            <h2 className="text-white text-lg font-semibold mb-4">
              Add to Trunk
            </h2>
            {loadingTrunks ? (
              <p className="text-zinc-400">Loading...</p>
            ) : (
              <AvailableTrunksList
                selectedSong={selectedSong}
                trunks={availableTrunks}
                onSelectTrunk={handleSelectTrunk}
              />
            )}
            <button
              onClick={() => setBranchModalOpen(false)}
              className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Comments */}
      {comments.length > 0 && (
        <div className="px-5 pt-4 pb-5 space-y-4 border-t border-zinc-800">
          {comments.map((comment) => {
            const isCommentAuthor = comment.authorUsername === currentUsername;
            return (
              <div key={comment.id} className="flex gap-3 items-start">
                <img
                  src={
                    getS3Url(comment.authorProfilePictureUrl) ||
                    "/default-profilepic.png"
                  }
                  alt={comment.authorUsername}
                  className="w-9 h-9 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">
                      {comment.authorUsername}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {formatDistanceToNow(new Date(comment.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <p className="text-sm mt-1 text-zinc-300 whitespace-pre-wrap">
                    {comment.commentText.replace(/^"(.*)"$/, "$1")}
                  </p>
                </div>
                {(isCommentAuthor || isAuthor) && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-red-500 hover:text-red-600"
                    title="Delete comment"
                  >
                    <FaTrash size={14} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
