"use client";

import { useEffect, useState } from "react";
import getS3Url from "@/app/utils/S3Url";
import { FaTrophy } from "react-icons/fa";
import {
  getReferralLeaderboard,
  ReferralDto,
  getUser,
} from "@/app/lib/usersApi";

interface ReferralLeaderboardEntry extends ReferralDto {
  profilePictureUrl?: string | null;
  rank?: number;
  prize?: number;
  tieCount?: number;
}

export default function ReferralLeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<ReferralLeaderboardEntry[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState("");

  const EXEMPT_USERS = ["gary", "garymccart"];

  const PRIZES: Record<number, number> = {
    1: 250,
    2: 125,
    3: 75,
    4: 30,
    5: 20,
  };

  const TOP_COLORS: Record<number, string> = {
    1: "from-yellow-500 via-yellow-500 to-yellow-700", // very soft gold
    2: "from-sky-500 via-sky-500 to-sky-700", // soft light blue
    3: "from-emerald-500 via-emerald-500 to-emerald-700", // muted soft green
    4: "from-pink-500 via-pink-500 to-pink-700", // very light pink
    5: "from-purple-500 via-purple-500 to-purple-700", // subtle lavender
  };

  useEffect(() => {
    const endDate = new Date("2025-10-25T00:00:00");
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

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await getReferralLeaderboard();
        const filtered = data.filter(
          (entry) => !EXEMPT_USERS.includes(entry.username.toLowerCase())
        );

        const enrichedData: ReferralLeaderboardEntry[] = await Promise.all(
          filtered.map(async (entry) => {
            try {
              const user = await getUser(entry.username);
              return {
                ...entry,
                profilePictureUrl: user.profilePictureUrl || null,
              };
            } catch {
              return { ...entry, profilePictureUrl: null };
            }
          })
        );

        enrichedData.sort((a, b) => b.referralCount - a.referralCount);

        // Compute ranks and tie counts only for top 5
        for (let i = 0; i < enrichedData.length; i++) {
          const entry = enrichedData[i];
          if (i === 0) {
            entry.rank = 1;
            entry.tieCount = 1;
          } else {
            const prev = enrichedData[i - 1];
            if (entry.referralCount === prev.referralCount) {
              entry.rank = prev.rank;
              entry.tieCount = (prev.tieCount || 1) + 1;
              for (let j = i - entry.tieCount + 1; j <= i; j++) {
                enrichedData[j].tieCount = entry.tieCount;
              }
            } else {
              entry.rank = i + 1;
              entry.tieCount = 1;
            }
          }
        }

        // Compute prizes for top 5 only

        let i = 0;
        while (i < enrichedData.length && (enrichedData[i].rank ?? 99) <= 5) {
          const entry = enrichedData[i];
          const tieCount = entry.tieCount || 1;
          let totalPrize = 0;
          if (entry.rank) {
            for (let r = entry.rank; r < entry.rank + tieCount; r++) {
              if (PRIZES[r]) totalPrize += PRIZES[r];
            }
            const prizePerPerson = Math.ceil(totalPrize / tieCount);
            for (let j = i; j < i + tieCount; j++) {
              enrichedData[j].prize = prizePerPerson;
            }
            i += tieCount;
          }
        }

        setLeaderboard(enrichedData);
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

  if (loading)
    return (
      <p className="text-white text-center mt-10">Loading leaderboard...</p>
    );
  if (error) return <p className="text-red-500 text-center mt-10">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10 p-4">
      <h1 className="text-3xl font-bold text-center mb-2 text-white flex items-center justify-center gap-2">
        <FaTrophy className="text-purple-400" />
        Referral Leaderboard
      </h1>

      <p className="text-center text-2xl text-purple-400 mb-6">
        Time left: <span className="font-semibold text-white">{timeLeft}</span>
      </p>

      <ul className="space-y-4">
        {leaderboard.map((entry) => {
          const isTop5 = (entry.rank ?? 99) <= 5;
          const colorClass =
            entry.rank && TOP_COLORS[entry.rank]
              ? TOP_COLORS[entry.rank]
              : "bg-zinc-800";

          return (
            <li
              key={entry.username}
              className={`flex items-center justify-between p-4 rounded-xl transition-transform ${
                isTop5 ? `bg-gradient-to-r ${colorClass}` : "bg-zinc-800"
              }`}
            >
              {/* Left side */}
              <div className="flex items-center space-x-2">
                {isTop5 && (
                  <span className="text-xl font-bold w-4 text-white">
                    {entry.rank}
                  </span>
                )}
                <img
                  src={
                    getS3Url(entry.profilePictureUrl) ||
                    "/default-profilepic.png"
                  }
                  alt={entry.username}
                  className="w-12 h-12 rounded-full object-cover border-1 border-white"
                />
                <p className="font-semibold text-white">{entry.username}</p>
              </div>

              {/* Right side */}
              <div className="text-right">
                <p className="text-white font-bold text-lg">
                  {entry.referralCount} referral
                  {entry.referralCount !== 1 ? "s" : ""}
                </p>
                {isTop5 && entry.prize && (
                  <p className="text-yellow-300 font-semibold">
                    🎉 ${entry.prize}
                    {entry.tieCount && entry.tieCount > 1
                      ? ` (tie for ${entry.rank}${
                          entry.rank === 1
                            ? "st"
                            : entry.rank === 2
                            ? "nd"
                            : entry.rank === 3
                            ? "rd"
                            : "th"
                        })`
                      : ""}{" "}
                    prize
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
