"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FiCheckCircle, FiAlertCircle, FiLock } from "react-icons/fi";
import { resetPassword } from "../lib/userApi/route"; // import the API function

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("Please enter your new password.");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError(true);
      setMessage("Invalid or missing password reset token.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError(true);
      setMessage("Passwords do not match.");
      return;
    }

    if (!token) {
      setError(true);
      setMessage("Missing reset token.");
      return;
    }

    setLoading(true);
    setError(false);
    setMessage("");

    try {
      await resetPassword(token, password);
      setSuccess(true);
      setMessage("Password reset successfully! Redirecting to login...");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: unknown) {
      setError(true);

      if (err instanceof Error) {
        setMessage(err.message);
      } else {
        setMessage("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-zinc-900 via-zinc-800 min-h-[60vh] to-zinc-950 py-20 flex items-center justify-center text-white px-4">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/40 via-transparent to-purple-900/40 pointer-events-none blur-3xl z-0"></div>

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-sm space-y-4 border border-zinc-800 bg-zinc-900/90 p-6 rounded-xl shadow-lg backdrop-blur"
      >
        <h2 className="text-xl font-semibold text-center flex items-center justify-center gap-2">
          <FiLock className="text-purple-500" />
          Reset Password
        </h2>

        {message && (
          <div
            className={`flex items-center gap-2 px-4 py-3 rounded ${
              error
                ? "bg-red-700 text-red-100"
                : success
                ? "bg-green-700 text-green-100"
                : "bg-purple-800 text-purple-200"
            }`}
          >
            {error && <FiAlertCircle size={20} />}
            {success && <FiCheckCircle size={20} />}
            <p className="text-sm flex-1">{message}</p>
          </div>
        )}

        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-zinc-800 text-sm text-white px-3 py-2 rounded-md border border-zinc-700 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          required
          minLength={6}
        />

        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full bg-zinc-800 text-sm text-white px-3 py-2 rounded-md border border-zinc-700 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          required
          minLength={6}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 text-sm rounded-md transition disabled:opacity-50"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </section>
  );
}
