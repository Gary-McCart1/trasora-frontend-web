"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import { loginUser } from "../lib/usersApi";
import { sendPendingTokenIfNeeded, registerPush } from "../lib/push"; // ✅ import here
import Link from "next/link";

export default function Login() {
  const { setUser } = useAuth();
  const [form, setForm] = useState({ login: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword((show) => !show);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userData = await loginUser(form.login, form.password);
      setUser(userData);

      // ✅ Now that we’re logged in, send the pending push token
      await sendPendingTokenIfNeeded();

      alert("Login was successful");
      setForm({ login: "", password: "" });
      router.push("/");
    } catch (err: unknown) {
      console.error("Login failed:", err);

      // Safely get error message
      const message =
        err instanceof Error ? err.message : "An unknown error occurred";

      if (message === "Invalid username or password") {
        alert("Invalid credentials. Please try again.");
      } else {
        alert(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-950 min-h-[60vh] flex items-center justify-center text-white px-4">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/40 via-transparent to-purple-900/40 pointer-events-none blur-3xl z-0" />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-sm space-y-5 border border-zinc-800 bg-zinc-900/90 p-6 rounded-xl shadow-lg backdrop-blur"
      >
        <h2 className="text-2xl font-semibold text-center">Login</h2>

        <input
          type="text"
          name="login"
          placeholder="Username or email"
          value={form.login}
          onChange={handleChange}
          autoCapitalize="none"
          autoCorrect="off"
          className="w-full bg-zinc-800 px-3 py-2 rounded-md border border-zinc-700 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          required
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full bg-zinc-800 px-3 py-2 rounded-md border border-zinc-700 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            required
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-3 flex items-center text-purple-400 hover:text-purple-600"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <HiOutlineEyeOff size={20} />
            ) : (
              <HiOutlineEye size={20} />
            )}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-md text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        {/* Forgot Password */}
        <p className="text-xs text-center text-zinc-500">
          Forgot your password?{" "}
          <Link
            href="/forgot-password"
            className="text-purple-400 hover:underline"
          >
            Reset it here
          </Link>
        </p>

        {/* Divider with better spacing */}
        <div className="border-t border-zinc-800 pt-4" />

        {/* Create Account */}
        <p className="text-xs text-center text-zinc-500">
          New to Trasora?{" "}
          <Link href="/signup" className="text-purple-400 hover:underline">
            Create Account
          </Link>
        </p>
      </form>
    </section>
  );
}
