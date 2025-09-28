"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import { loginUser } from "../lib/usersApi";
import { registerPush } from "../lib/push";

export default function Login() {
  const { setUser } = useAuth();
  const [form, setForm] = useState({ login: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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
      // 1️⃣ Log in the user
      const userData = await loginUser(form.login, form.password);
      setUser(userData);

      // 2️⃣ Wait for push registration to complete
      await registerPush();

      // 3️⃣ Success
      alert("Login was successful");
      setForm({ login: "", password: "" });
      router.push("/");
    } catch (error) {
      if (error instanceof Error) {
        console.error("Login failed:", error.message);

        if (error.message.includes("Please verify your email")) {
          alert("Please verify your email!");
        } else {
          alert("Login failed: Your username or password was incorrect.");
        }
      } else {
        console.error("Login failed:", error);
        alert("Login failed: Your username or password was incorrect.");
      }
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
        <h2 className="text-2xl font-semibold mb-2 text-center">Login</h2>

        <input
          type="text"
          name="login"
          placeholder="Username or email"
          value={form.login}
          onChange={handleChange}
          autoCapitalize="none"
          autoCorrect="off"
          className="w-full bg-zinc-800 text-white px-3 py-2 rounded-md border border-zinc-700 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-purple-500 text-base"
          required
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full bg-zinc-800 text-base text-white px-3 py-2 rounded-md border border-zinc-700 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            required
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-3 flex items-center text-purple-400 hover:text-purple-600"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <HiOutlineEyeOff size={20} /> : <HiOutlineEye size={20} />}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 text-sm rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <p className="text-xs text-center text-zinc-500">
          Forgot your password?{" "}
          <a href="/forgot-password" className="text-purple-400 hover:underline">
            Reset it here
          </a>
        </p>
      </form>
    </section>
  );
}
