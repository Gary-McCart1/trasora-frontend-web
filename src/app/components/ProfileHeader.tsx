"use client";

import Image from "next/image";
import {
  HiOutlineDotsVertical,
  HiLockClosed,
  HiLockOpen,
} from "react-icons/hi";
import { User } from "../types/User";
import { generateGradient } from "../utils/generateGradient";
import getS3Url from "../utils/S3Url";
import { useState, useEffect } from "react";
import { FaMedal } from "react-icons/fa";
import { blockUser, unblockUser, getBlockStatus } from "../lib/usersApi";
import { HiUserAdd, HiUserRemove } from "react-icons/hi";
import Link from "next/link";

interface ProfileHeaderProps {
  profileUser: User;
  isOwnProfile: boolean;
  followStatus: "not-following" | "requested" | "following" | null;
  onFollow: () => Promise<"following" | "requested">;
  onUnfollow: () => Promise<"not-following">;
  onEditClick: (updatedUser?: User) => void;
  onSettingsClick: () => void;
  onConnectSpotify: () => void;
}

export default function ProfileHeader({
  profileUser,
  isOwnProfile,
  followStatus,
  onFollow,
  onUnfollow,
  onEditClick,
  onSettingsClick,
  onConnectSpotify,
}: ProfileHeaderProps) {
  const [followersCount, setFollowersCount] = useState(
    profileUser.followersCount ?? 0
  );
  const [followingCount] = useState(profileUser.followingCount ?? 0);
  const [localFollowStatus, setLocalFollowStatus] = useState(followStatus);
  const [isBlocked, setIsBlocked] = useState<boolean | null>(null);

  const accentColor = profileUser.accentColor || "#7C3AED";
  const gradient = generateGradient(accentColor);

  // Sync follow status
  useEffect(() => {
    setLocalFollowStatus(followStatus);
  }, [followStatus]);

  // Fetch current block status for this profile
  useEffect(() => {
    if (!isOwnProfile) {
      async function fetchBlock() {
        try {
          const blocked = await getBlockStatus(profileUser.username);
          setIsBlocked(blocked);
        } catch (err) {
          console.error("Failed to fetch block status:", err);
        }
      }
      fetchBlock();
    }
  }, [profileUser.username, isOwnProfile]);

  // Follow / unfollow
  const followButtonHandler = async () => {
    try {
      if (
        localFollowStatus === "following" ||
        localFollowStatus === "requested"
      ) {
        const status = await onUnfollow();
        setLocalFollowStatus(status);
        setFollowersCount((prev) => Math.max(prev - 1, 0));
      } else if (localFollowStatus === "not-following") {
        const status = await onFollow();
        setLocalFollowStatus(status);
        if (status === "following") setFollowersCount((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Follow action failed:", err);
    }
  };

  // Toggle block/unblock
  const toggleBlockHandler = async () => {
    try {
      if (isBlocked) {
        await unblockUser(profileUser.username);
        setIsBlocked(false);
      } else {
        await blockUser(profileUser.username);
        setIsBlocked(true);
      }
    } catch (err) {
      console.error("Failed to toggle block:", err);
    }
  };

  const followButtonText = () => {
    switch (localFollowStatus) {
      case "following":
        return "Following";
      case "requested":
        return "Requested";
      case "not-following":
      default:
        return "Follow";
    }
  };

  const followButtonClasses = () => {
    switch (localFollowStatus) {
      case "following":
        return "border-2 border-white text-white hover:bg-black";
      case "requested":
        return "bg-gray-500 text-white hover:bg-gray-700 cursor-pointer relative";
      case "not-following":
      default:
        return "bg-purple-600 text-white hover:bg-purple-700";
    }
  };

  // Determine medal
  const getMedal = () => {
    if (!profileUser.branchCount || profileUser.branchCount < 10) return null;

    let medalColor = "bg-yellow-700"; // bronze
    let label = "Bronze Brancher";

    if (profileUser.branchCount >= 500) {
      medalColor = "bg-gray-400"; // platinum
      label = "Platinum Brancher";
    } else if (profileUser.branchCount >= 100) {
      medalColor = "bg-yellow-400"; // gold
      label = "Gold Brancher";
    } else if (profileUser.branchCount >= 50) {
      medalColor = "bg-gray-300"; // silver
      label = "Silver Brancher";
    }

    return (
      <div
        className={`flex items-center space-x-2 ${medalColor} text-white px-3 py-1 rounded-full shadow-md`}
      >
        <FaMedal />
        <span className="text-xs md:text-sm font-semibold">{label}</span>
      </div>
    );
  };

  return (
    <section
      className="relative rounded-3xl shadow-2xl border border-zinc-800 p-6 md:p-12 flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-8 z-5"
      style={{ backgroundImage: gradient }}
    >
      {/* Lock/Unlock */}
      <div className="absolute top-4 left-4">
        {profileUser.profilePublic ? (
          <HiLockOpen className="text-white w-6 h-6" />
        ) : (
          <HiLockClosed className="text-white w-6 h-6" />
        )}
      </div>

      {/* Desktop Buttons */}
      <div className="absolute top-6 right-6 hidden md:flex items-center gap-2 z-10">
        {isOwnProfile ? (
          <button
            onClick={() => onEditClick()}
            className="px-6 py-2 rounded-full text-white font-semibold shadow-md transition bg-zinc-900 hover:bg-zinc-800 min-w-[140px] text-center"
          >
            Edit Profile
          </button>
        ) : (
          <>
            <button
              onClick={followButtonHandler}
              disabled={isBlocked || isBlocked === null}
              className={`px-6 py-2 rounded-full font-semibold transition min-w-[140px] text-center ${
                isBlocked
                  ? "bg-gray-700 text-gray-300 cursor-not-allowed"
                  : followButtonClasses()
              }`}
            >
              {isBlocked ? "Blocked" : followButtonText()}
            </button>
            <button
              onClick={toggleBlockHandler}
              className={`px-4 py-2 rounded-full border-2 font-semibold text-white transition flex items-center justify-center ${
                isBlocked
                  ? "border-red-500 bg-red-600 hover:bg-red-700"
                  : "border-white hover:bg-white/10"
              }`}
            >
              {isBlocked ? (
                <HiUserRemove className="w-5 h-5" />
              ) : (
                <HiUserAdd className="w-5 h-5" />
              )}
            </button>
          </>
        )}
      </div>

      {/* Profile Image */}
      <div className="flex flex-col items-center md:items-start">
        <div
          className="relative w-24 h-24 md:w-36 md:h-36 rounded-full overflow-hidden shadow-lg flex-shrink-0"
          style={{ border: `5px solid ${accentColor}` }}
        >
          <Image
            src={getS3Url(profileUser.profilePictureUrl)}
            alt={`${profileUser.username}'s profile picture`}
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* User Info */}
      <div className="flex-1 w-full max-w-xl flex flex-col items-center md:items-start gap-3 md:gap-2 relative">
        <div className="flex items-center space-x-2 w-full justify-center md:justify-start">
          <h1 className="text-white font-extrabold tracking-tight break-words max-w-full text-3xl md:text-4xl leading-tight">
            {profileUser.username}
          </h1>
          {isOwnProfile && (
            <button
              onClick={onSettingsClick}
              className="p-2 rounded-full hover:bg-white/10 text-white text-3xl transition"
            >
              <HiOutlineDotsVertical />
            </button>
          )}
        </div>

        {/* Bio & Medal */}
        <div className="flex items-center space-x-10 justify-center md:justify-start flex-wrap md:flex-nowrap mb-3">
          <p className="text-base md:text-lg text-purple-100 max-w-full whitespace-pre-line">
            {profileUser.bio ? (
              <span className="text-purple-300">{profileUser.bio}</span>
            ) : (
              <span className="italic text-purple-300">No bio yet</span>
            )}
          </p>
          {getMedal()}
        </div>

        {/* Mobile Buttons */}
        {isOwnProfile && (
          <button
            onClick={() => onEditClick()}
            className="md:hidden px-6 py-2 rounded-full text-white font-semibold shadow-md transition w-full text-center bg-zinc-900 hover:bg-zinc-800"
          >
            Edit Profile
          </button>
        )}
        {!isOwnProfile && (
          <div className="w-full flex flex-col items-center md:hidden space-y-2">
            <button
              onClick={followButtonHandler}
              disabled={isBlocked || isBlocked === null}
              className={`px-6 py-2 rounded-full font-semibold transition w-full text-center ${
                isBlocked
                  ? "bg-gray-700 text-gray-300 cursor-not-allowed"
                  : followButtonClasses()
              }`}
              style={{ minWidth: "140px" }}
            >
              {isBlocked ? "Blocked" : followButtonText()}
            </button>
            <button
              onClick={toggleBlockHandler}
              className={`px-6 py-2 rounded-full border-2 font-semibold text-white transition w-full ${
                isBlocked
                  ? "border-red-500 bg-red-600 hover:bg-red-700"
                  : "border-white hover:bg-white/10"
              }`}
            >
              {isBlocked ? "Unblock" : "Block"}
            </button>
          </div>
        )}

        {/* Followers / Following / Branches */}
        <div className="flex justify-center md:justify-start space-x-8 text-purple-200 w-full mt-4 md:mt-12">
          <Link href={`/profile/${profileUser.username}/followers`}>
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-white">
                {followersCount}
              </span>
              <span className="uppercase text-xs tracking-wider">
                Followers
              </span>
            </div>
          </Link>
          <Link href={`/profile/${profileUser.username}/following`}>
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-white">
                {followingCount}
              </span>
              <span className="uppercase text-xs tracking-wider">
                Following
              </span>
            </div>
          </Link>
          <div className="flex flex-col items-center">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {profileUser.branchCount ?? 0}
            </span>
            <span className="uppercase text-xs tracking-wider">Branches</span>
          </div>
        </div>
      </div>
    </section>
  );
}
