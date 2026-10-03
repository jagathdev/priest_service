"use client";

import { UserProvider } from "@/contexts/UserContext";

export function Providers({ children, serverUser }: { children: React.ReactNode; serverUser?: any }) {
  return (
    <UserProvider initialUser={serverUser}>
      {children}
    </UserProvider>
  );
}
