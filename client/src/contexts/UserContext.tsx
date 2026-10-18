"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

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
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children, initialUser }: { children: ReactNode; initialUser?: User | null }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("mockUser");
        let token = localStorage.getItem("token");
        if (!token && typeof document !== "undefined") {
          const match = document.cookie.match(/(?:^|;\s*)(?:token|adminToken)=([^;]+)/);
          if (match && match[1]) token = decodeURIComponent(match[1]);
        }

        const isValidToken = token && token !== "undefined" && token !== "null" && token.trim() !== "";

        if (!isValidToken) {
          localStorage.removeItem("mockUser");
          localStorage.removeItem("token");
          document.cookie = "mockUser=; path=/; max-age=0;";
          document.cookie = "token=; path=/; max-age=0;";
          document.cookie = "userLogin=false; path=/; max-age=0;";
          return null;
        }

        if (initialUser && (initialUser.id || initialUser._id)) {
          return initialUser;
        }

        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === "object" && (parsed.id || parsed._id || parsed.mobileNumber || parsed.email)) {
            return parsed as User;
          }
        }
      } catch (e) {
        console.error("Error reading stored user:", e);
      }
      return null;
    }
    return initialUser || null;
  });


  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
    };
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []);

  useEffect(() => {
    if (user && Object.keys(user).length > 0 && (user.id || user._id || user.mobileNumber || user.email)) {
      localStorage.setItem("mockUser", JSON.stringify(user));
      document.cookie = "mockUser=" + encodeURIComponent(JSON.stringify(user)) + "; path=/; max-age=604800;";
      document.cookie = "userLogin=true; path=/; max-age=604800;";
    } else if (user === null) {
      localStorage.removeItem("mockUser");
      localStorage.removeItem("token");
      document.cookie = "mockUser=; path=/; max-age=0;";
      document.cookie = "token=; path=/; max-age=0;";
      document.cookie = "userLogin=false; path=/; max-age=0;";
    }
  }, [user]);


  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  return (
    <UserContext.Provider value={{ user, setUser, isLoginModalOpen, openLoginModal, closeLoginModal }}>
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
