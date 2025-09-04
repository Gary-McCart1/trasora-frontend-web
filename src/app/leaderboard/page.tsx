"use client";

import { useEffect, useState } from "react";
import getS3Url from "@/app/utils/S3Url";
import { FaTrophy } from "react-icons/fa";

interface ReferralLeaderboardEntry {
  username: string;
  profilePictureUrl?: string | null;
  referralCount: number;
}

export default function ReferralLeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<ReferralLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState("");

  // Countdown logic
  useEffect(() => {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7); // One week from now

    const interval = setInterval(() => {
      const now = new Date();
      const diff = endDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("The contest has ended!");
        clearInterval(interval);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Fetch leaderboard
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/auth/referral-leaderboard", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch leaderboard");
        const data: ReferralLeaderboardEntry[] = await res.json();
        setLeaderboard(data);
      } catch (err) {
        console.error(err);
        if (err instanceof Error) setError(err.message);
        else setError("An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) return <p className="text-white text-center mt-10">Loading leaderboard...</p>;
  if (error) return <p className="text-red-500 text-center mt-10">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10 p-4">
      {/* Header */}
      <h1 className="text-3xl font-bold text-center mb-2 text-white flex items-center justify-center gap-2">
        <FaTrophy className="text-purple-400" />
        Referral Leaderboard
      </h1>

      {/* Countdown */}
      <p className="text-center text-2xl text-purple-400 mb-6">
        Time left: <span className="font-semibold text-white">{timeLeft}</span>
      </p>

      {/* Leaderboard */}
      <ul className="space-y-4">
        {leaderboard.map((entry, index) => {
          const isTop5 = index < 5;
          return (
            <li
              key={entry.username}
              className={`flex items-center justify-between p-4 rounded-xl shadow-lg transition-transform ${
                isTop5
                  ? "bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 shadow-[0_0_20px_rgba(128,0,128,0.7)] scale-105"
                  : "bg-zinc-800 hover:scale-105"
              }`}
            >
              <div className="flex items-center space-x-4">
                <span className={`text-xl font-bold w-8 ${isTop5 ? "text-white" : "text-purple-300"}`}>
                  {index + 1}
                </span>
                <img
                  src={getS3Url(entry.profilePictureUrl) || "/default-profilepic.png"}
                  alt={entry.username}
                  className="w-12 h-12 rounded-full object-cover border-1 border-white"
                />
                <p className="font-semibold text-white">{entry.username}</p>
              </div>
              <p className="text-white font-bold text-lg">
                {entry.referralCount} referral{entry.referralCount !== 1 ? "s" : ""}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
