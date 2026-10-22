"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen flex-col md:flex-row bg-[#f3f0ff] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#f3f0ff]">
          {children}
        </main>
      </div>
    </div>
  );
}
