"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { Branch, newTrunk, Trunk, User } from "../../types/User";
import ProfileHeader from "../../components/ProfileHeader";
import PostsGrid from "../../components/PostsGrid";
import ProfileModals from "../../components/ProfileModals";
import LoadingSpinner from "../../components/LoadingSpinner";
import { PostDto } from "../../types/Post";
import RootsStrip from "../../components/RootsStrip";
import { ImEyeBlocked } from "react-icons/im";
import TrunkCreator from "../../components/TrunkCreator";
import TrunkStrip from "@/app/components/TrunkStrip";
import AddSongToTrunkModal from "@/app/components/AddSongToTrunkModal";
import DraggablePlayer from "../../components/DraggablePlayer";
import { useSpotifyPlayer } from "../../context/SpotifyContext";
import { motion } from "framer-motion";

// --- API imports ---
import {
  getUser,
  logoutUser,
  deleteUser,
  updateProfileVisibility,
} from "../../lib/usersApi";
import {
  getFollowStatus,
  followUser,
  unfollowUser,
} from "../../lib/followApi";
import { getTrunks, createTrunk, deleteTrunk, getBranchesForTrunk } from "../../lib/trunksApi";
import { getUserPosts } from "@/app/lib/postsApi";
import { FaImages } from "react-icons/fa";
import { BiSolidVideos } from "react-icons/bi";

export default function ProfilePage() {
  const [postType, setPostType] = useState("images");
  const { user: loggedInUser, setUser } = useAuth();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<PostDto[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteConfirmText] = useState("");
  const [followStatus, setFollowStatus] = useState<
    "not-following" | "requested" | "following" | null
  >(null);
  const [profilePublic, setProfilePublic] = useState<boolean>(true);
  const [showTrunkCreator, setShowTrunkCreator] = useState(false);
  const [addSongTrunkId, setAddSongTrunkId] = useState<number | null>(null);

  // --- Draggable Player State ---
  const [playingTrack, setPlayingTrack] = useState<{
    id: string;
    name: string;
    artists?: { name: string }[];
    albumArtUrl: string;
  } | null>(null);
  const [showDraggablePlayer, setShowDraggablePlayer] = useState(false);

  const { isReady, initPlayer } = useSpotifyPlayer();

  const router = useRouter();
  const { username } = useParams();

  const pageUsername = useMemo(
    () => username?.toString() || loggedInUser?.username,
    [username, loggedInUser]
  );
  const isOwnProfile = pageUsername === loggedInUser?.username;

  // --- Fetch profile + trunks/branches + follow status ---
  const fetchAllData = useCallback(async () => {
    if (!pageUsername) return;

    try {
      const userData = await getUser(pageUsername);
      setProfileUser(userData);
      setProfilePublic(userData.profilePublic ?? true);

      if (userData.id && !isOwnProfile) {
        try {
          const followData = await getFollowStatus(userData.id);
          setFollowStatus(followData.status);
          setProfileUser((prev) =>
              prev ? { ...prev, ...followData } : prev
          );
        } catch {
          setFollowStatus(null);
        }
      } else {
        setFollowStatus(null);
      }

      const trunksData = await getTrunks(pageUsername);

      // --- Fetch branches using new Next.js API route ---
      const trunksWithBranches = await Promise.all(
        trunksData.map(async (trunk: Trunk) => {
          try {
            const branches = await getBranchesForTrunk(trunk.id);
            return { ...trunk, branches };
          } catch (err) {
            console.error(err);
            return { ...trunk, branches: [] };
          }
        })
      );

      setProfileUser((prev) =>
          prev ? { ...prev, trunks: trunksWithBranches } : prev
      );
    } catch (err) {
      console.error(err);
    }
  }, [pageUsername, isOwnProfile]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // --- Fetch posts (depends on follow/visibility) ---
  const fetchUserPostsCb = useCallback(async () => {
    if (!profileUser) return;
    if (isOwnProfile || profilePublic || followStatus === "following") {
      try {
        const data = await getUserPosts(profileUser.username);
        setPosts(data);
      } catch {
        setPosts([]);
      }
    } else {
      setPosts([]);
    }
  }, [profileUser, profilePublic, isOwnProfile, followStatus]);

  useEffect(() => {
    fetchUserPostsCb();
  }, [fetchUserPostsCb]);

  // --- Filter posts client-side based on postType ---
  const filteredPosts = useMemo(() => {
    if (postType === "images") {
      return posts.filter((p) => !p.customVideoUrl); // adjust to your real key
    }
    if (postType === "videos") {
      return posts.filter((p) => !!p.customVideoUrl); // adjust to your real key
    }
    return posts;
  }, [posts, postType]);

  // --- Follow / Unfollow ---
  const handleFollow = async () => {
    if (!profileUser) return;
    try {
      const data = await followUser(profileUser.username);
      setFollowStatus(data.status);
      setProfileUser((prev) => (prev ? { ...prev, ...data } : prev));
      return data.status;
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnfollow = async (): Promise<"not-following"> => {
    if (!profileUser) return "not-following";

    try {
      await unfollowUser(profileUser.username);
      setFollowStatus("not-following");
      return "not-following";
    } catch (err) {
      console.error(err);
      return "not-following";
    }
  };

  // --- Spotify connect ---
  const onConnectToSpotify = () => {
    if (!loggedInUser?.username) return alert("You must be logged in!");
    window.location.href = `https://trasora-backend-e03193d24a86.herokuapp.com/auth/spotify/login?state=${encodeURIComponent(
      loggedInUser.username
    )}`;
  };

  // --- Edit Profile Save ---
  const handleEditSave = (updatedUser: User) => {
    if (!profileUser) return;
    setProfileUser({ ...profileUser, ...updatedUser });
    if (isOwnProfile) setUser(updatedUser);
  };

  // --- Trunk Creation ---
  const handleTrunkCreated = async (newTrunk: newTrunk) => {
    if (!profileUser) return;
    try {
      const createdTrunk = await createTrunk(newTrunk, profileUser.username);
      setProfileUser((prev) =>
          prev
            ? { ...prev, trunks: [...(prev.trunks || []), createdTrunk] }
            : prev
      );
      setShowTrunkCreator(false);
    } catch (err) {
      console.error(err);
      alert("Failed to create trunk. Please try again.");
    }
  };

  // --- Trunk Deletion ---
  const handleTrunkDelete = async (trunkId: number) => {
    if (!profileUser) return;
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this trunk?"
    );
    if (!confirmDelete) return;
    try {
      await deleteTrunk(trunkId);
      setProfileUser((prev) =>
          prev
            ? { ...prev, trunks: prev.trunks?.filter((t) => t.id !== trunkId) }
            : prev
      );
    } catch (err) {
      console.error(err);
      alert("Failed to delete trunk. Please try again.");
    }
  };

  const handleAddSongToTrunk = (trunkId: number) => {
    setAddSongTrunkId(trunkId);
  };

  const handleSongAdded = () => {
    fetchAllData();
    setAddSongTrunkId(null);
  };

  if (!profileUser) return <LoadingSpinner />;

  const visibleTrunks = (profileUser.trunks || []).filter(
    (t) => t.publicFlag || isOwnProfile
  );

  return (
    <main className="relative xl:max-w-4xl 2xl:max-w-6xl 3xl:max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-8">
      <section className="mx-auto max-w-5xl space-y-6 relative z-10">
        <ProfileHeader
          profileUser={profileUser}
          isOwnProfile={!!isOwnProfile}
          followStatus={followStatus}
          onFollow={handleFollow}
          onUnfollow={handleUnfollow}
          onEditClick={() => setIsEditOpen(true)}
          onSettingsClick={() => setIsModalOpen(true)}
          onConnectSpotify={onConnectToSpotify}
        />

        {!isReady &&
          loggedInUser?.spotifyPremium &&
          loggedInUser?.spotifyConnected && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-[#1a1a1a] rounded-2xl p-8 w-80 md:w-96 shadow-2xl flex flex-col items-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                <h2 className="text-white text-xl font-bold mb-4 text-center">
                  Enable Spotify Player
                </h2>
                <p className="text-gray-300 text-sm mb-6 text-center">
                  Connect your Spotify account to play music directly in
                  Trasora.
                </p>
                <button
                  onClick={initPlayer}
                  className="w-full px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold shadow-md hover:bg-purple-700 transition-colors"
                >
                  Enable Player
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="mt-4 text-gray-400 text-sm hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </motion.div>
            </motion.div>
          )}

        {pageUsername &&
          (followStatus === "following" || profilePublic || isOwnProfile) && (
            <RootsStrip
              pageUsername={pageUsername}
              onTrackPlay={(track) => {
                setPlayingTrack(track);
                setShowDraggablePlayer(!!track);
              }}
            />
          )}

        {pageUsername &&
          (followStatus === "following" || profilePublic || isOwnProfile) && (
            <TrunkStrip
              visibleTrunks={visibleTrunks}
              isOwnProfile={isOwnProfile}
              onCreateTrunk={() => setShowTrunkCreator(true)}
              onAddSong={handleAddSongToTrunk}
              onDelete={handleTrunkDelete}
            />
          )}

        <section className="mt-6">
          {followStatus === "following" || profilePublic || isOwnProfile ? (
            <>
              <div className="flex items-center mb-6 space-x-3">
                <div className="flex justify-between w-full itmes-center">
                  <div className="flex items-center space-x-3">
                    <h2 className="text-2xl font-bold text-white">Posts</h2>
                    <span
                      className="text-white text-lg font-semibold px-3 py-1 rounded-full"
                      style={{
                        backgroundColor: profileUser.accentColor ?? "#7C3AED",
                      }}
                    >
                      <div className="flex justify-center">{posts.length}</div>
                    </span>
                  </div>
                  <div className="flex items-center space-x-5 text-xl">
                    <div
                      className={`${
                        postType === "images" && "bg-zinc-800"
                      } px-5 py-5 rounded-full hover:bg-zinc-900`}
                      onClick={() => setPostType("images")}
                    >
                      <FaImages />
                    </div>
                    <div
                      className={`${
                        postType === "videos" && "bg-zinc-800"
                      } px-5 py-5 rounded-full hover:bg-zinc-900`}
                      onClick={() => setPostType("videos")}
                    >
                      <BiSolidVideos />
                    </div>
                  </div>
                </div>
              </div>
              <PostsGrid
                posts={filteredPosts}
                isProfileView={true}
                isOwner={isOwnProfile}
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-gray-900 border border-gray-700 text-center space-y-3">
              <ImEyeBlocked />
              <h2 className="text-lg font-semibold text-white">
                Follow this user to view posts and roots
              </h2>
              <p className="text-gray-400 text-sm">
                You&apos;re currently not following this user. Once you follow,
                their content will appear here.
              </p>
            </div>
          )}
        </section>

        <ProfileModals
          isOwnProfile={!!isOwnProfile}
          isEditOpen={isEditOpen}
          isModalOpen={isModalOpen}
          onCloseEdit={() => setIsEditOpen(false)}
          onCloseSettings={() => setIsModalOpen(false)}
          onSave={handleEditSave}
          onLogout={async () => {
            try {
              await logoutUser();
              setUser(null);
              router.push("/");
            } catch (err) {
              console.error(err);
            }
          }}
          onDeleteAccount={async () => {
            if (!profileUser?.username || deleteConfirmText !== "delete")
              return;
            try {
              await deleteUser(profileUser.username);
              alert("Account deleted");
              setUser(null);
              router.push("/");
            } catch (err) {
              console.error(err);
            }
          }}
          currentBio={profileUser.bio || ""}
          currentProfilePic={
            profileUser.profilePictureUrl
              ? `https://dreamr-user-content.s3.amazonaws.com/${profileUser.profilePictureUrl}`
              : "/default-profilepic.png"
          }
          currentAccentColor={profileUser.accentColor || "#7C3AED"}
          currentProfilePublic={profilePublic}
          onProfileVisibilityChange={async (newValue: boolean) => {
            if (!profileUser) return;
            try {
              const updatedUser = await updateProfileVisibility(
                profileUser.username,
                newValue
              );
              setProfileUser(updatedUser);
              setProfilePublic(updatedUser.profilePublic ?? newValue);
            } catch (err) {
              console.error(err);
            }
          }}
          username={profileUser.username}
        />
      </section>

      {showTrunkCreator && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowTrunkCreator(false)}
          />
          <div className="relative w-full max-w-md p-6 rounded-3xl bg-zinc-900 shadow-2xl flex flex-col gap-6 sm:mx-auto animate-slideDown z-20">
            <button
              onClick={() => setShowTrunkCreator(false)}
              className="absolute top-3 right-3 text-white text-2xl font-bold hover:text-purple-400"
            >
              ✕
            </button>
            <TrunkCreator onTrunkCreated={handleTrunkCreated} />
          </div>
        </div>
      )}

      {addSongTrunkId && (
        <AddSongToTrunkModal
          trunkId={addSongTrunkId}
          onClose={() => setAddSongTrunkId(null)}
          onSongAdded={handleSongAdded}
        />
      )}

      {/* Draggable Player */}
      {showDraggablePlayer && playingTrack && (
        <DraggablePlayer
          track={playingTrack}
          onClose={() => setShowDraggablePlayer(false)}
        />
      )}
    </main>
  );
}