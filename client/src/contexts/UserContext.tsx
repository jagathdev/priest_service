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
    if (initialUser) return initialUser;
    if (typeof window !== "undefined") {
      if (document.cookie.includes("userLogin=true")) {
        const stored = localStorage.getItem("mockUser");
        if (stored) {
          try {
            return JSON.parse(stored) as User;
          } catch (e) {
            console.error(e);
            return {} as User;
          }
        }
        return {} as User;
      }
    }
    return null;
  });

  useEffect(() => {
    if (user && Object.keys(user).length > 0) {
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
