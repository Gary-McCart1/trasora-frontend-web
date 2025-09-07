"use client";

import { useState } from "react";
import { forgotPassword } from "../lib/usersApi";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      console.log(email)
      await forgotPassword(email);
      setMessage(
        "If an account exists for this email, you'll receive a reset link shortly."
      );
    } catch (err) {
      setMessage(
        err instanceof Error
          ? "Error: " + err.message
          : "Something went wrong. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-950 min-h-[60vh] flex items-center justify-center text-white px-4">
      {/* Purple glow overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/40 via-transparent to-purple-900/40 pointer-events-none blur-3xl z-0"></div>

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-sm space-y-4 border border-zinc-800 bg-zinc-900/90 p-6 rounded-xl shadow-lg backdrop-blur"
      >
        <h2 className="text-xl font-semibold mb-2 text-center">
          Reset Password
        </h2>
        <p className="text-xs text-zinc-400 text-left mb-4">
          Enter the email linked to your account and we’ll send you a password
          reset link.
        </p>

        <input
          type="email"
          placeholder="Your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full bg-zinc-800 text-sm text-white px-3 py-2 rounded-md border border-zinc-700 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full text-white py-2 text-sm rounded-md transition ${
            loading
              ? "bg-purple-400 cursor-not-allowed"
              : "bg-purple-600 hover:bg-purple-700"
          }`}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        {message && (
          <p
            className={`text-sm text-center mt-2 ${
              message.startsWith("Error") ? "text-red-400" : "text-green-400"
            }`}
          >
            {message}
          </p>
        )}
      </form>
    </section>
  );
}
