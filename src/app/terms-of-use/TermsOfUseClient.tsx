"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { signupUser } from "../lib/usersApi";

export default function TermsOfUseClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  // Retrieve signup data passed through query params
  const fullName = searchParams.get("fullName") ?? "";
  const email = searchParams.get("email") ?? "";
  const username = searchParams.get("username") ?? "";
  const password = searchParams.get("password") ?? "";

  const handleAccept = async () => {
    setLoading(true);
    setError("");
    try {
      await signupUser({ email, username, password });
      setInfoMessage(
        "Account created! Please check your email to confirm your email address before logging in."
      );
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message);
        setError(err.message || "Something went wrong. Please try again.");
      } else {
        console.error("Unknown error:", err);
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-950 min-h-[60vh] flex items-center justify-center text-white px-4">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/40 via-transparent to-purple-900/40 pointer-events-none blur-3xl z-0"></div>

      <div className="relative z-10 w-full max-w-3xl space-y-4 border border-zinc-800 bg-zinc-900/90 p-8 rounded-xl shadow-lg backdrop-blur my-10">
        <h1 className="text-2xl font-semibold mb-4 text-center">
          Terms of Use
        </h1>

        <div className="overflow-y-auto max-h-[50vh] text-sm leading-relaxed text-zinc-300 mb-6">
          <p>
            Welcome to Trasora. This app allows users to create and share
            content. To maintain a safe community, we have a strict
            ZERO-TOLERANCE policy for any objectionable or abusive content or
            behavior.
          </p>

          <p className="mt-4 font-semibold">Prohibited Content & Behavior:</p>
          <ul className="list-disc list-inside mt-2 space-y-2">
            <li>Harassing, hateful, or discriminatory content</li>
            <li>Violence, threats, or bullying</li>
            <li>Pornographic or sexually explicit material</li>
            <li>Illegal activities or promotion of self-harm</li>
            <li>Spam, scams, or misleading content</li>
          </ul>

          <p className="mt-4">
            Users are fully responsible for the content they post or share. We
            reserve the right to review, hide, remove, or permanently delete any
            content that violates these terms. We may suspend or ban any user
            who engages in abusive or harmful behavior at our sole discretion.
          </p>

          <p className="mt-4">
            Users can report content or other users directly in the app. All
            reports are reviewed, and objectionable content will be removed or
            action will be taken (such as banning or blocking) promptly upon
            review.
          </p>

          <p className="mt-4">
            By clicking &quot;I Agree&quot; you confirm that you are at least 16 years
            old, have read and understood these Terms of Use, and agree to
            follow them. If you do not agree, please decline and do not use the
            app.
          </p>
        </div>

        {error && <p className="text-red-400 text-center mb-4">{error}</p>}
        {infoMessage && (
          <p className="text-green-400 text-center mb-4">{infoMessage}</p>
        )}

        <div className="flex justify-center gap-4">
          <button
            onClick={() => router.push("/signup")}
            className="px-4 py-2 rounded-md bg-zinc-700 hover:bg-zinc-600 transition"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            disabled={loading || !!infoMessage}
            className="px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "I Agree"}
          </button>
        </div>
      </div>
    </section>
  );
}
