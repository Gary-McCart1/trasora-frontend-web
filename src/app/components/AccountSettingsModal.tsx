"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FiLogOut, FiTrash2, FiX } from "react-icons/fi";
import { deleteUser } from "../lib/userApi/route"; // import your existing function

interface AccountSettingsModalProps {
  onClose: () => void;
  onLogout: () => void;
}

export default function AccountSettingsModal({
  onClose,
  onLogout,
}: AccountSettingsModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const router = useRouter();
  const { username } = useParams() as { username: string };

  // Actual delete function — calls backend API
  async function handleDeleteAccount() {
    try {
      const res = await deleteUser(username);
      if (res.ok) {
        alert("Account deleted successfully.");
        onClose(); // close modal
        onLogout(); // log out user
        router.push("/goodbye");
      } else {
        const errorText = await res.text();
        alert("Failed to delete account: " + errorText);
      }
    } catch (error) {
      alert("An error occurred while deleting the account.");
      console.error(error);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md rounded-2xl p-8 shadow-xl border border-purple-700/40 bg-gradient-to-br from-zinc-800/90 to-zinc-900/90 backdrop-blur-md text-white"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{
            duration: 0.2,
            type: "spring",
            damping: 25,
            stiffness: 300,
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-zinc-400 hover:text-white transition"
            aria-label="Close"
          >
            <FiX size={22} />
          </button>

          <h2 className="text-3xl font-semibold mb-6 text-center">
            Account Settings
          </h2>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 transition text-white py-3 rounded-xl mb-4 text-lg font-medium shadow-md"
          >
            <FiLogOut />
            Logout
          </button>

          {/* Delete Flow */}
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 transition text-white py-3 rounded-xl text-lg font-medium shadow-md"
            >
              <FiTrash2 />
              Delete Account
            </button>
          ) : (
            <>
              <p className="mt-6 text-sm text-zinc-300 text-center">
                Type <span className="text-red-400 font-bold">delete</span> to
                confirm.
              </p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) =>
                  setDeleteConfirmText(e.target.value.trim().toLowerCase())
                }
                className="mt-3 w-full px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Type delete here"
              />
              <button
                onClick={() => {
                  if (deleteConfirmText === "delete") handleDeleteAccount();
                  else alert("Please type 'delete' to confirm.");
                }}
                disabled={deleteConfirmText !== "delete"}
                className={`mt-4 w-full text-white py-3 rounded-xl font-medium transition shadow-md ${
                  deleteConfirmText === "delete"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-red-400 cursor-not-allowed"
                }`}
              >
                Confirm Delete
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText("");
                }}
                className="mt-3 w-full bg-zinc-700 hover:bg-zinc-600 text-white py-3 rounded-xl transition shadow-inner"
              >
                Cancel
              </button>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
