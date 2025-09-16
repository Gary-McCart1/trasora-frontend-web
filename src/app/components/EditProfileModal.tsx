"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { User } from "../types/User";
import { darkenColor } from "../utils/generateGradient";
import {
  updateUserProfile,
  disconnectSpotify,
  searchUsers,
} from "../lib/usersApi";
import { useAuth } from "../context/AuthContext";
import getS3Url from "../utils/S3Url";

interface EditProfileModalProps {
  currentBio: string;
  currentProfilePic: string;
  currentAccentColor: string;
  currentProfilePublic: boolean;
  username: string;
  onClose: () => void;
  onSave: (updatedUser: User) => void;
  onProfileVisibilityChange: (newValue: boolean) => void;
}

export default function EditProfileModal({
  currentBio,
  currentProfilePic,
  currentAccentColor,
  currentProfilePublic,
  username,
  onClose,
  onSave,
  onProfileVisibilityChange,
}: EditProfileModalProps) {
  const [mounted, setMounted] = useState(false);
  const [bio, setBio] = useState(currentBio);
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(currentProfilePic);
  const [accentColor, setAccentColor] = useState(
    currentAccentColor || "#7C3AED"
  );
  const [profilePublic, setProfilePublic] = useState(
    currentProfilePublic ?? true
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [disconnecting, setDisconnecting] = useState(false);
  const { user } = useAuth();
  const spotifyConnected = user?.spotifyConnected;

  // Referred By state
  const [referrerSearch, setReferrerSearch] = useState("");
  const [referrerResults, setReferrerResults] = useState<User[]>([]);
  console.log(user?.referredBy)
  const [selectedReferrer, setSelectedReferrer] = useState<User | null>(
    user?.referredBy ? { username: user.referredBy } as User : null
  );
  
  console.log(user)

  useEffect(() => {
    setSelectedReferrer(
      user?.referredBy ? { username: user.referredBy } as User : null
    );
  }, [user?.referredBy]);

  const gradientEnd = darkenColor(accentColor, 40);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 🔎 search for users
  useEffect(() => {
    let active = true;
    const fetchUsers = async () => {
      if (referrerSearch.trim().length < 2) {
        setReferrerResults([]);
        return;
      }
      try {
        const results = await searchUsers(referrerSearch);
        if (active) setReferrerResults(results);
      } catch (err) {
        console.error("User search failed:", err);
      }
    };
    fetchUsers();
    return () => {
      active = false;
    };
  }, [referrerSearch]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setProfilePicFile(e.target.files[0]);
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
  
    try {
      const updates: Partial<User> & {
        profilePic?: File;
        referredBy?: string;
        profilePublic?: boolean;
      } = {
        bio,
        accentColor,
        profilePublic,
        ...(profilePicFile ? { profilePic: profilePicFile } : {}),
        referredBy: selectedReferrer?.username || undefined,
      };
  
      const updatedUser = await updateUserProfile(updates);
  
      onSave(updatedUser);
      onProfileVisibilityChange(profilePublic);
      onClose();
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };
  
  
  const handleDisconnectSpotify = async () => {
    setDisconnecting(true);
    setError("");

    try {
      await disconnectSpotify(username);
      onSave({ ...user, spotifyConnected: false } as User);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("An unknown error occurred while disconnecting Spotify");
    } finally {
      setDisconnecting(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="modal"
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm my-5 min-h-[100vh]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.form
          onSubmit={handleSave}
          onClick={(e) => e.stopPropagation()}
          className="bg-zinc-900 text-white rounded-2xl p-6 shadow-2xl border border-zinc-700 w-full max-w-md mx-4 sm:mx-0 sm:p-8 overflow-y-auto max-h-[90vh]"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 28 }}
        >
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-6 text-center tracking-wide">
            Edit Profile
          </h2>

          {/* Profile Picture */}
          <div className="flex flex-col items-center mb-6">
            <div
              className="relative w-24 h-24 sm:w-32 sm:h-32 mb-3 rounded-full overflow-hidden shadow-lg"
              style={{ border: `5px solid ${accentColor}` }}
            >
              <Image
                src={preview || "/default-profilepic.png"}
                alt="Profile"
                fill
                className="object-cover"
              />
            </div>
            <label
              htmlFor="profilePicInput"
              className="cursor-pointer text-sm sm:text-base font-semibold transition"
              style={{ color: accentColor }}
              title="Click to change profile picture"
            >
              {profilePicFile ? profilePicFile.name : "Change profile picture"}
            </label>
            <input
              id="profilePicInput"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Bio */}
          <label
            htmlFor="bioInput"
            className="block text-sm sm:text-base font-semibold mb-2 tracking-wide"
          >
            Bio
          </label>
          <textarea
            id="bioInput"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={5}
            className="w-full bg-zinc-800 text-white p-3 sm:p-4 rounded-xl resize-none placeholder-zinc-500 focus:outline-none focus:ring-4 transition"
            placeholder="Tell us about yourself..."
            maxLength={300}
            style={{ boxShadow: `0 0 0 0.25rem ${accentColor}44` }}
          />

          {/* Accent Color Picker */}
          <label
            htmlFor="accentColorInput"
            className="block text-sm sm:text-base font-semibold mb-2 tracking-wide mt-4"
          >
            Accent Color
          </label>
          <div
            className="w-full h-10 rounded-xl overflow-hidden border border-zinc-700 cursor-pointer"
            style={{
              background: `linear-gradient(90deg, ${accentColor} 0%, ${darkenColor(
                accentColor,
                20
              )} 100%)`,
            }}
          >
            <input
              id="accentColorInput"
              type="color"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className="w-full h-full opacity-0 cursor-pointer"
              title="Choose your accent color"
            />
          </div>

          {/* Private/Public Toggle */}
          <div className="flex items-center justify-between bg-zinc-800 rounded-xl p-4 mt-6">
            <div>
              <p className="text-purple-100 font-semibold">
                Profile Visibility
              </p>
              <p className="text-purple-300 text-sm">
                {profilePublic
                  ? "Your profile is public"
                  : "Your profile is private"}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={profilePublic}
                onChange={(e) => setProfilePublic(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`
                  w-16 h-8 rounded-full transition-colors duration-300
                  border-2 border-zinc-700
                  ${profilePublic ? accentColor : "bg-purple-600"}
                  hover:brightness-110
                `}
              ></div>
              <div
                className={`
                  absolute left-1 top-1 w-6 h-6 bg-white rounded-full shadow-md
                  transform transition-transform duration-300
                  ${profilePublic ? "translate-x-8" : ""}
                `}
              ></div>
            </label>
          </div>
          
          {/* Referred By */}
          {!user?.referredBy && (
            <div className="mt-6">
              <label
                htmlFor="referredByInput"
                className="block text-sm sm:text-base font-semibold mb-2 tracking-wide"
              >
                Referred By
              </label>
              {selectedReferrer ? (
                <div className="flex items-center space-x-3 bg-zinc-800 rounded-xl p-3">
                  <img
                    src={
                      getS3Url(selectedReferrer?.profilePictureUrl) ||
                      "/default-profilepic.png"
                    }
                    alt="Referrer"
                    width={32}
                    height={32}
                    className="rounded-full object-cover w-8 h-8 sm:w-10 sm:h-10"
                  />
                  <span className="font-semibold text-purple-200">
                    {selectedReferrer.username}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedReferrer(null);
                      setReferrerSearch("");
                    }}
                    className="text-red-400 hover:text-red-500 text-sm"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    id="referredByInput"
                    type="text"
                    value={referrerSearch}
                    onChange={(e) => setReferrerSearch(e.target.value)}
                    placeholder="Search for a user..."
                    className="w-full bg-zinc-800 text-white p-3 rounded-xl placeholder-zinc-500 focus:outline-none focus:ring-4 transition"
                    style={{ boxShadow: `0 0 0 0.25rem ${accentColor}44` }}
                  />
                  {referrerResults.length > 0 && (
                    <ul className="absolute z-20 bg-zinc-900 border border-zinc-700 rounded-xl mt-2 w-full max-h-48 overflow-y-auto">
                      {referrerResults.map((u) => (
                        <li
                          key={u.id}
                          className="flex items-center space-x-3 p-3 hover:bg-zinc-800 cursor-pointer"
                          onClick={() => {
                            setSelectedReferrer(u);
                            setReferrerSearch("");
                            setReferrerResults([]);
                          }}
                        >
                          <img
                            src={
                              getS3Url(u?.profilePictureUrl) ||
                              "/default-profilepic.png"
                            }
                            alt="Referrer"
                            width={32}
                            height={32}
                            className="rounded-full object-cover w-8 h-8 sm:w-10 sm:h-10"
                          />
                          <span className="text-white font-medium">
                            {u.username}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-red-500 text-sm mt-3 mb-5 font-medium animate-pulse select-none">
              {error}
            </p>
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-4 sm:space-y-0 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-2xl shadow-lg transition disabled:opacity-50 font-semibold"
              style={{
                background: `linear-gradient(to right, ${accentColor}, ${gradientEnd})`,
              }}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 rounded-2xl bg-zinc-700 hover:bg-zinc-600 transition disabled:opacity-50 font-semibold"
            >
              Cancel
            </button>
          </div>
        </motion.form>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}