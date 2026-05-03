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

  // 1. Centralized Protection Logic
  useEffect(() => {
    // Wait until we are sure about the auth state
    if (loading) return;

    const isPublicPath = publicPaths.some(
      (path) => pathname === path || pathname?.startsWith(`${path}/`)
    );

    // If no user and trying to access a private route (like /), go to /about
    if (!user && !isPublicPath) {
      router.push("/about");
    }
  }, [user, loading, pathname, router]);

  // 2. Register for push once on app start
  useEffect(() => {
    registerPush().catch((err) => {
      console.error("Failed to register push:", err);
    });
  }, []);

  // 3. Initial Auth Check (Cache vs API)
  useEffect(() => {
    const checkAuth = async () => {
      const cachedUser = localStorage.getItem("currentUser");

      if (cachedUser) {
        try {
          setUser(JSON.parse(cachedUser));
        } catch (e) {
          localStorage.removeItem("currentUser");
        }
        setLoading(false);
      } else {
        await fetchUser();
      }
    };

    checkAuth();
  }, []);

  const fetchUser = async () => {
    try {
      const currentUser = await fetchCurrentUser();
      setUser(currentUser);
      if (currentUser) {
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
      }
    } catch (error) {
      setUser(null);
      localStorage.removeItem("currentUser");
    } finally {
      setLoading(false);
    }
  };

  // 4. Silent refresh every 30 minutes
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const currentUser = await fetchCurrentUser();
        setUser(currentUser);
        if (currentUser) {
          localStorage.setItem("currentUser", JSON.stringify(currentUser));
        }
      } catch (error) {
        console.error("Silent refresh failed:", error);
      }
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const refreshUser = async () => {
    setLoading(true);
    await fetchUser();
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