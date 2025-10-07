"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  FaHeart,
  FaRegCommentDots,
  FaTrash,
  FaEdit,
  FaEllipsisV,
  FaRegFlag,
} from "react-icons/fa";
import { LuGitBranchPlus } from "react-icons/lu";
import { motion, AnimatePresence } from "framer-motion";
import { differenceInSeconds, formatDistanceToNow } from "date-fns";
import getS3Url from "../utils/S3Url";
import AvailableTrunksList from "./AvailableTrunksList";
import { useAuth } from "../context/AuthContext";
import {
  likePost,
  commentOnPost,
  deletePost,
  deleteComment,
  flagComment,
  flagPost,
  incrementPostBranchCount,
} from "../lib/postsApi";
import { useRouter } from "next/navigation";
import { Trunk } from "../types/User";
import { addTrackToTrunk, getAvailableTrunks } from "../lib/trunksApi";
import { createPortal } from "react-dom";
import Link from "next/link";

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
  onDelete?: (postId: number) => void;
  onLike?: (postId: number) => void;
  onComment?: (postId: number, commentText: string) => void;
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
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [flagCommentModalOpen, setFlagCommentModalOpen] = useState(false);
  const [flagReason, setFlagReason] = useState("");
  const [flagLoading, setFlagLoading] = useState(false);
  const [currentFlagCommentId, setCurrentFlagCommentId] = useState<number>();


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

  // Like a post
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

  // Comment on a post
  const handleCommentSubmit = async () => {
    if (loadingComment || !commentText.trim()) return;
    setLoadingComment(true);
    try {
      const newComment = await commentOnPost(
        String(postId),
        commentText.trim()
      );
      const newCommentWithUser = {
        ...newComment,
        authorUsername: user?.username || "",
        authorProfilePictureUrl: user?.profilePictureUrl || "",
      };
      setCommentText("");
      setShowCommentBox(false);
      setComments((prev) => [newCommentWithUser, ...prev]);
      setCommentsCount((c) => c + 1);
    } catch (err) {
      console.error(err);
      alert("Failed to comment.");
    } finally {
      setLoadingComment(false);
    }
  };

  // Delete post
  const handleDeleteClick = async () => {
    if (!isAuthor || loadingDelete) return;
    if (!confirm("Delete this post?")) return;
    setLoadingDelete(true);
    try {
      await deletePost(String(postId));
      alert("Post deleted.");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Could not delete post.");
    } finally {
      setLoadingDelete(false);
    }
  };

  // Delete comment
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

  // Branch functionality
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
      const newBranch = await addTrackToTrunk(trunkId, song, user.username);
      onSongAdded?.(newBranch);
      setBranchModalOpen(false);
      setLocalBranchCount((prev) => prev + 1);
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

  // Flag post
  const handleFlagSubmit = async () => {
    if (!flagReason.trim() || !user) return;
    setFlagLoading(true);
    try {
      await flagPost(postId, user.id, flagReason.trim());
      alert("Post flagged successfully.");
      setFlagModalOpen(false);
      setFlagReason("");
    } catch (err) {
      console.error(err);
      alert("Failed to flag post.");
    } finally {
      setFlagLoading(false);
    }
  };

  // Flag comment
  const handleFlagCommentSubmit = async () => {
    if (!flagReason.trim() || !user) return;
    setFlagLoading(true);
    if(!currentFlagCommentId) return;
    try {
      await flagComment(currentFlagCommentId, user.id, flagReason.trim());
      alert("Comment flagged successfully.");
      setFlagCommentModalOpen(false);
      setFlagReason("");
    } catch (err) {
      console.error(err);
      alert("Failed to flag comment.");
    } finally {
      setFlagLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900 sm:rounded-b-2xl overflow-hidden shadow border border-zinc-800 text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <img
            src={getS3Url(authorProfilePictureUrl) || "/default-profilepic.png"}
            alt={authorUsername}
            className="w-11 h-11 rounded-full object-cover border border-purple-500"
          />
          <div className="flex flex-col">
            <Link
              href={`/profile/${authorUsername}`}
              className="font-semibold text-base hover:text-purple-400"
            >
              {authorUsername}
            </Link>
            <span className="text-xs text-zinc-500">
              {createdAt
                ? (() => {
                    try {
                      const date = new Date(
                        createdAt.endsWith("Z") ? createdAt : createdAt + "Z"
                      );
                      return isNaN(date.getTime())
                        ? "Just now"
                        : formatDistanceToNow(date, { addSuffix: true });
                    } catch {
                      return "Just now";
                    }
                  })()
                : "Just now"}
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
      <div className="flex justify-between border-t border-zinc-800">
        <div className="flex items-center gap-6 px-5 py-3">
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

        <div className="flex items-center gap-6 px-5 py-3 ">
          <button
            onClick={() => setFlagModalOpen(true)}
            className="flex items-center gap-2 text-lg hover:text-purple-500"
          >
            <FaRegFlag />
          </button>
        </div>
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
                className="flex-grow px-4 py-2 text-base bg-zinc-800 text-white border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
      {branchModalOpen &&
        createPortal(
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-zinc-900 p-6 rounded-xl max-h-[80vh] overflow-y-auto w-96">
              <h2 className="text-white text-lg font-semibold mb-4">
                Add to Trunk
              </h2>

              {loadingTrunks ? (
                <p className="text-zinc-400">Loading...</p>
              ) : availableTrunks.length === 0 ? (
                <p className="text-zinc-400">No trunks available</p>
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
          </div>,
          document.body
        )}

      {/* Comments List */}
      {comments.length > 0 && (
        <div className="px-5 pt-4 pb-5 space-y-4 border-t border-zinc-800">
          {comments.map((comment) => {
            const isCommentAuthor = comment.authorUsername === user?.username;
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
                    <div className="flex justify-start gap-3 items-center">
                      <span className="font-semibold">
                        {comment.authorUsername}
                      </span>
                      <span className="text-zinc-500 text-[12px]">
                        {comment.createdAt
                          ? (() => {
                              try {
                                const date = new Date(
                                  comment.createdAt.endsWith("Z")
                                    ? comment.createdAt
                                    : comment.createdAt + "Z"
                                );
                                const secondsDiff = differenceInSeconds(
                                  new Date(),
                                  date
                                );
                                if (secondsDiff < 60) return "Just now";
                                return formatDistanceToNow(date, {
                                  addSuffix: true,
                                });
                              } catch {
                                return "Just now";
                              }
                            })()
                          : "Just now"}
                      </span>
                      <span className="hover:text-purple-500">
                        <FaRegFlag
                          onClick={() => {
                            setCurrentFlagCommentId(comment.id);
                            setFlagCommentModalOpen(true);
                          }}
                          size={14}
                        />
                      </span>
                    </div>
                  </div>
                  <p className="text-sm mt-1 text-zinc-300 whitespace-pre-wrap">
                    {comment.commentText.replace(/^"(.*)"$/, "$1")}
                  </p>
                </div>
                {(isCommentAuthor || isAuthor) && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-white-300 hover:text-red-600 text-[8px] pt-1"
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

      {/* Flag Modals */}
      {flagModalOpen &&
        createPortal(
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-zinc-900 p-6 rounded-xl w-96">
              <h2 className="text-white text-lg font-semibold mb-4">
                Flag Post
              </h2>
              <textarea
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                placeholder="Reason for flagging (e.g., Spam, Hate Speech)"
                className="w-full p-2 rounded bg-zinc-800 text-white border border-zinc-700 focus:outline-none"
                rows={4}
              />
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleFlagSubmit}
                  disabled={flagLoading}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded"
                >
                  {flagLoading ? "Submitting..." : "Submit"}
                </button>
                <button
                  onClick={() => setFlagModalOpen(false)}
                  className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {flagCommentModalOpen &&
        createPortal(
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-zinc-900 p-6 rounded-xl w-96">
              <h2 className="text-white text-lg font-semibold mb-4">
                Flag Comment
              </h2>
              <textarea
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                placeholder="Reason for flagging (e.g., Spam, Hate Speech)"
                className="w-full p-2 rounded bg-zinc-800 text-white border border-zinc-700 focus:outline-none"
                rows={4}
              />
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleFlagCommentSubmit}
                  disabled={flagLoading}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded"
                >
                  {flagLoading ? "Submitting..." : "Submit"}
                </button>
                <button
                  onClick={() => setFlagCommentModalOpen(false)}
                  className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
