"use client";

import React, { useEffect, useState } from "react";
import { LuUserPlus } from "react-icons/lu";
import { useAuth } from "@/app/context/AuthContext";
import { getFollowers } from "@/app/lib/followApi";
import { User } from "@/app/types/User";
import Image from "next/image";
import getS3Url from "@/app/utils/S3Url";
import Link from "next/link";

const FollowersPage = () => {
  const { user, loading } = useAuth();
  const [followers, setFollowers] = useState<User[]>([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchFollowers = async () => {
      setLoadingFollowers(true);
      try {
        const userFollowers = await getFollowers(user.username);
        setFollowers(userFollowers);
      } catch (err) {
        console.error("Unable to fetch followers", err);
      } finally {
        setLoadingFollowers(false);
      }
    };

    fetchFollowers();
  }, [user]);

  if (loading || loadingFollowers) {
    return (
      <section className="max-w-3xl mx-auto px-4 py-6">
        <div className="text-white text-center animate-pulse">
          Loading followers...
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-3xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <div className="bg-purple-700 p-2 rounded-full">
          <LuUserPlus className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">
          Your Followers ({followers.length})
        </h2>
      </div>

      {/* Followers List */}
      {followers.length === 0 ? (
        <p className="text-gray-400 text-center">
          You don’t have any followers yet.
        </p>
      ) : (
        <ul className="space-y-4">
          {followers.map((follower) => (
            <li
              key={follower.id}
              className="flex items-center justify-between bg-zinc-900 p-3 rounded-lg hover:bg-zinc-800 transition"
            >
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden">
                  <Image
                    src={getS3Url(follower.profilePictureUrl)}
                    alt={follower.username}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <Link href={`/profile/${follower.username}`}>
                    <span className="text-white font-medium">
                      {follower.username}
                    </span>
                  </Link>

                  {follower.fullName && (
                    <span className="text-gray-400 text-sm">
                      {follower.fullName}
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default FollowersPage;
