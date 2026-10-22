"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Module-level in-memory token fallback so non-React helpers (like apiClient) can read it directly
let inMemoryUserToken: string | null = null;

export const getInMemoryUserToken = (): string | null => inMemoryUserToken;
export const setInMemoryUserToken = (token: string | null) => {
  inMemoryUserToken = token;
};

export interface User {
  id?: string;
  _id?: string;
  name?: string;
  mobileNumber?: string;
  whatsappNumber?: string;
  phone?: string;
  email?: string;
  whatsapp?: string;
  customerId?: string;
  addresses?: any[];
}

interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  token: string | null;
  setToken: (token: string | null) => void;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  isHydrated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children, initialUser }: { children: ReactNode; initialUser?: User | null }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [user, setUser] = useState<User | null>(initialUser || null);
  const [token, setTokenState] = useState<string | null>(null);

  const setToken = (newToken: string | null) => {
    setTokenState(newToken);
    setInMemoryUserToken(newToken);
  };

  // Initialize user from localStorage / cookies on client mount
  useEffect(() => {
    try {
      let token = localStorage.getItem("token") || localStorage.getItem("adminToken");
      if (!token && typeof document !== "undefined") {
        const match = document.cookie.match(/(?:^|;\s*)(?:token|adminToken)=([^;]+)/);
        if (match && match[1]) token = decodeURIComponent(match[1]);
      }

      const isValidToken = typeof token === "string" && token.trim() !== "" && token !== "undefined" && token !== "null";
      if (isValidToken && typeof token === "string") {
        setToken(token.trim());
      }
      const stored = localStorage.getItem("mockUser");

      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === "object" && (parsed.id || parsed._id || parsed.mobileNumber || parsed.email)) {
            setUser(parsed as User);
            setIsHydrated(true);
            return;
          }
        } catch (e) {
          console.error("Error parsing stored mockUser:", e);
        }
      }

      if (!isValidToken && !initialUser) {
        setUser(null);
      } else if (initialUser && (initialUser.id || initialUser._id)) {
        setUser(initialUser);
      }
    } catch (e) {
      console.error("Error reading stored user on mount:", e);
    } finally {
      setIsHydrated(true);
    }
  }, [initialUser]);

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
    };
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []);

  // Sync state changes back to storage and cookies only after hydration
  useEffect(() => {
    if (!isHydrated) return;

    if (user && Object.keys(user).length > 0 && (user.id || user._id || user.mobileNumber || user.email)) {
      localStorage.setItem("mockUser", JSON.stringify(user));
      document.cookie = "mockUser=" + encodeURIComponent(JSON.stringify(user)) + "; path=/; max-age=604800; SameSite=Lax";
      document.cookie = "userLogin=true; path=/; max-age=604800; SameSite=Lax";
    } else if (user === null) {
      localStorage.removeItem("mockUser");
      localStorage.removeItem("token");
      document.cookie = "mockUser=; path=/; max-age=0; SameSite=Lax";
      document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
      document.cookie = "userLogin=false; path=/; max-age=0; SameSite=Lax";
    }
  }, [user, isHydrated]);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  return (
    <UserContext.Provider value={{ user, setUser, token, setToken, isLoginModalOpen, openLoginModal, closeLoginModal, isHydrated }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
