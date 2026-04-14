"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { User } from "../types/User";
import { getCurrentUser as fetchCurrentUser } from "../lib/usersApi";
import { registerPush } from "../lib/push";

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const publicPaths = [
    "/demo",
    "/about",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/terms-of-use",
    "/leaderboard",
  ];

  // 🚀 Register for push once on app start
  useEffect(() => {
    registerPush().catch((err) => {
      console.error("Failed to register push:", err);
    });
  }, []);

  // Fetch user from localStorage or API
  useEffect(() => {
    const cachedUser = localStorage.getItem("currentUser");

    if (cachedUser) {
      setUser(JSON.parse(cachedUser)); // Use cached user if available
      setLoading(false); // Skip loading state
    } else {
      fetchUser(); // Otherwise, fetch the user from API
    }
  }, []);

  // Fetch user on mount (if not cached)
  const fetchUser = async () => {
    try {
      const currentUser = await fetchCurrentUser();
      setUser(currentUser);
      localStorage.setItem("currentUser", JSON.stringify(currentUser)); // Cache user in localStorage
    } catch (error) {
      setUser(null);
      // Redirect to login if not on public paths
      if (!publicPaths.some((path) => pathname?.startsWith(path))) {
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  // Silent refresh every 30 minutes
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const currentUser = await fetchCurrentUser();
        setUser(currentUser);
        localStorage.setItem("currentUser", JSON.stringify(currentUser)); // Update cached user
      } catch (error) {
        console.error("Silent refresh failed:", error);
      }
    }, 30 * 60 * 1000); // Refresh every 30 minutes

    return () => clearInterval(interval);
  }, []);

  const refreshUser = async () => {
    setLoading(true);
    try {
      const currentUser = await fetchCurrentUser();
      setUser(currentUser);
      localStorage.setItem("currentUser", JSON.stringify(currentUser)); // Update cached user
    } catch (error) {
      console.error("Error refreshing user:", error);
      setUser(null);

      if (!publicPaths.some((path) => pathname?.startsWith(path))) {
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};