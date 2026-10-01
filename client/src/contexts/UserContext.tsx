"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface User {
  id?: string;
  _id?: string;
  name?: string;
  mobileNumber?: string;
  phone?: string;
  email?: string;
  whatsapp?: string;
  customerId?: string;
  addresses?: any[];
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== "undefined") {
      if (document.cookie.includes("userLogin=true")) {
        const stored = localStorage.getItem("mockUser");
        if (stored) {
          try {
            return JSON.parse(stored) as User;
          } catch (e) {
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
    } else if (user === null) {
      localStorage.removeItem("mockUser");
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
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
