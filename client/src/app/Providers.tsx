"use client";

import { UserProvider } from "@/contexts/UserContext";
import { ToastProvider } from "@/contexts/ToastContext";

export function Providers({ children, serverUser }: { children: React.ReactNode; serverUser?: any }) {
  return (
    <UserProvider initialUser={serverUser}>
      <ToastProvider>
        {children}
      </ToastProvider>
    </UserProvider>
  );
}
