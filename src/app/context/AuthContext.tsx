"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { User } from "../types/User";
import { getCurrentUser as fetchCurrentUser } from "../lib/usersApi";

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
  const pathname = usePathname()

  // Fetch user on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await fetchCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);
  
        const publicPaths = [
          "/login",
          "/signup",
          "/forgot-password",
          "/reset-password",
          "/verify-email",
        ];
  
        if (!publicPaths.some((path) => pathname?.startsWith(path))) {
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    };
  
    fetchUser();
  }, [router, pathname]);

  // Helper to refresh user state manually
  const refreshUser = async () => {
    setLoading(true);
    try {
      const currentUser = await fetchCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error("Error refreshing user:", error);
      setUser(null);
      router.push("/login");
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