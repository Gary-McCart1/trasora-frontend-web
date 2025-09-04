"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FiCheckCircle, FiAlertCircle, FiMail } from "react-icons/fi";
import { resendVerificationEmail, verifyEmail } from "../api/userApi/route";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [message, setMessage] = useState("Verifying your email...");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  // Email state for resend
  const [email, setEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError(true);
      setMessage("Invalid verification link.");
      return;
    }
  
    async function verify() {
      try {
        // TypeScript knows token is string here
        await verifyEmail(token!);
        setMessage("Email verified successfully! You can now log in.");
        setError(false);
        setSuccess(true);
        setTimeout(() => router.push("/login"), 3000);
      } catch (err: unknown) {
        setError(true);
        if (err instanceof Error) setMessage(err.message);
        else setMessage("Verification failed. Please enter your email below to resend the verification email.");
      }
    }
  
    verify();
  }, [token, router]);
  
  

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
      if (err instanceof Error) setMessage(err.message);
      else setMessage("An error occurred while resending verification email.");
    } finally {
      setResendLoading(false);
    }
  }
  

  return (
    <div className="max-w-xl mx-auto mt-20 p-6 text-center border rounded bg-zinc-900 text-white shadow-lg">
      <h1 className="text-2xl font-semibold mb-6 flex items-center justify-center gap-2">
        {error && <FiAlertCircle className="text-red-500" size={28} />}
        {success && <FiCheckCircle className="text-green-500" size={28} />}
        {error && "Verification Failed"}
        {success && "Verification Successful"}
        {!error && !success && "Verifying Email..."}
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
            <FiMail className="inline mr-2 text-purple-400" />
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
