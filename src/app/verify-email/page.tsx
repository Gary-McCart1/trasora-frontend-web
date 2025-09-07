"use client";

import { useEffect, useState, Suspense } from "react";
import { verifyEmail, resendVerificationEmail } from "../lib/usersApi";

// Mock router for sandbox or client-side navigation
const useRouter = () => ({
  push: (path: string) => {
    window.location.href = path; // navigate directly
  },
});

const CheckCircleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-green-500"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-8.6"></path>
    <path d="M22 4L12 14.01l-3-3"></path>
  </svg>
);

const AlertCircleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-red-500"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);

const MailIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="inline mr-2 text-purple-400"
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

function VerifyEmailContent() {
  const router = useRouter();
  const [message, setMessage] = useState("Verifying your email...");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [email, setEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get("token");
    setToken(tokenFromUrl);

    if (!tokenFromUrl) {
      setError(true);
      setMessage("Invalid verification link.");
      return;
    }

    async function verify() {
      try {
        if (!tokenFromUrl) return;
        await verifyEmail(tokenFromUrl);
        setMessage("Email verified successfully! You can now log in.");
        setError(false);
        setSuccess(true);
        setTimeout(() => router.push("/login"), 3000);
      } catch (err: unknown) {
        setError(true);
        if (err instanceof Error) {
          setMessage(err.message);
        } else {
          setMessage(
            "Verification failed. Please enter your email below to resend the verification email."
          );
        }
      }
    }

    verify();
  }, [router]);

  async function handleResend() {
    setResendLoading(true);
    setResendSuccess(false);
    setMessage("");

    try {
      await resendVerificationEmail(email);
      setMessage("Verification email resent. Please check your inbox.");
      setResendSuccess(true);
      setError(false);
    } catch (err: unknown) {
      setError(true);
      if (err instanceof Error) {
        setMessage(err.message);
      } else {
        setMessage("An error occurred while resending verification email.");
      }
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto mt-20 p-6 text-center border rounded bg-zinc-900 text-white shadow-lg">
      <h1 className="text-2xl font-semibold mb-6 flex items-center justify-center gap-2">
        {success ? (
          <>
            <CheckCircleIcon />
            Verification Successful
          </>
        ) : error ? (
          <>
            <AlertCircleIcon />
            Verification Failed
          </>
        ) : (
          "Verifying Email..."
        )}
      </h1>

      <div
        className={`mb-6 px-4 py-3 rounded ${
          error
            ? "bg-red-700 text-red-100"
            : success
            ? "bg-green-700 text-green-100"
            : "bg-purple-800 text-purple-200"
        }`}
      >
        {message}
      </div>

      {error && !resendSuccess && (
        <div className="mt-4 text-left">
          <label htmlFor="resend-email" className="block mb-2 font-medium">
            <MailIcon />
            Enter your email to resend verification
          </label>
          <input
            id="resend-email"
            type="email"
            placeholder="your.email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-md border border-zinc-700 bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
          />
          <button
            onClick={handleResend}
            disabled={resendLoading}
            className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-md disabled:opacity-50 transition"
          >
            {resendLoading ? "Sending..." : "Resend Verification Email"}
          </button>
        </div>
      )}

      {resendSuccess && (
        <p className="mt-4 text-green-400 font-semibold">
          ✅ Check your inbox for the verification email.
        </p>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
