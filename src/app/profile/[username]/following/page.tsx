"use client";

import React, { useEffect, useState } from "react";
import { LuUserRoundPlus } from "react-icons/lu";
import { useAuth } from "@/app/context/AuthContext";
import { getFollowing } from "@/app/lib/followApi";
import { User } from "@/app/types/User";
import Image from "next/image";
import getS3Url from "@/app/utils/S3Url";

const FollowingPage = () => {
  const { user, loading } = useAuth();
  const [following, setFollowing] = useState<User[]>([]);
  const [loadingFollowing, setLoadingFollowing] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchFollowing = async () => {
      setLoadingFollowing(true);
      try {
        const userFollowing = await getFollowing(user.username);
        setFollowing(userFollowing);
      } catch (err) {
        console.error("Unable to fetch following", err);
      } finally {
        setLoadingFollowing(false);
      }
    };

    fetchFollowing();
  }, [user]);

  if (loading || loadingFollowing) {
    return (
      <section className="max-w-3xl mx-auto px-4 py-6">
        <div className="text-white text-center animate-pulse">
          Loading following...
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-3xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <div className="bg-purple-700 p-2 rounded-full">
          <LuUserRoundPlus className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">
          Following ({following.length})
        </h2>
      </div>

      {/* Following List */}
      {following.length === 0 ? (
        <p className="text-gray-400 text-center">
          You are not following anyone yet.
        </p>
      ) : (
        <ul className="space-y-4">
          {following.map((f) => (
            <li
              key={f.id}
              className="flex items-center justify-between bg-zinc-900 p-3 rounded-lg hover:bg-zinc-800 transition"
            >
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden">
                  <Image
                    src={getS3Url(f.profilePictureUrl)}
                    alt={f.username}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-medium">{f.username}</span>
                  {f.fullName && (
                    <span className="text-gray-400 text-sm">{f.fullName}</span>
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

export default FollowingPage;
