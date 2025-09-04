"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import { signupUser } from "../api/userApi/route";

export default function Signup() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [infoMessage, setInfoMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword((show) => !show);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      await signupUser(form);
      setInfoMessage(
        "Registration successful! Please verify your email before logging in."
      );
      setForm({ fullName: "", email: "", username: "", password: "" });
      setTimeout(() => {
        router.push("/login");
      }, 5000);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error during registration:", error.message);
        alert(error.message || "Registration failed!");
      } else {
        console.error("Unknown error during registration:", error);
        alert("Registration failed!");
      }
    }
  };
  

  return (
    <section className="relative bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-950 min-h-[60vh] flex items-center justify-center text-white px-4">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/40 via-transparent to-purple-900/40 pointer-events-none blur-3xl z-0"></div>

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-sm space-y-4 border border-zinc-800 bg-zinc-900/90 p-6 rounded-xl shadow-lg backdrop-blur"
      >
        <h2 className="text-xl font-semibold mb-2 text-center">Sign up</h2>

        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={form.fullName}
          onChange={handleChange}
          className="w-full bg-zinc-800 text-sm text-white px-3 py-2 rounded-md border border-zinc-700 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full bg-zinc-800 text-sm text-white px-3 py-2 rounded-md border border-zinc-700 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          required
        />

        <input
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          className="w-full bg-zinc-800 text-sm text-white px-3 py-2 rounded-md border border-zinc-700 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          required
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full bg-zinc-800 text-sm text-white px-3 py-2 rounded-md border border-zinc-700 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
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
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 text-sm rounded-md transition"
        >
          Create Account
        </button>

        {infoMessage && (
          <p className="text-center text-green-400 mt-4">{infoMessage}</p>
        )}

        <p className="text-xs text-center text-zinc-500">
          Already have an account?{" "}
          <a href="/login" className="text-purple-400 hover:underline">
            Log in
          </a>
        </p>
      </form>
    </section>
  );
}
