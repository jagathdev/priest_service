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
  const isImagesPage = pathname === "/admin/images" || pathname?.startsWith("/admin/images");

  if (isLoginPage || isImagesPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen flex-col md:flex-row bg-[#f3f0ff] overflow-hidden print:h-auto print:overflow-visible print:bg-white">
      <div className="print:hidden">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden print:h-auto print:overflow-visible">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#f3f0ff] p-4 sm:p-6 lg:p-8 print:h-auto print:overflow-visible print:bg-white print:p-0">
          {children}
        </main>
      </div>
    </div>
  );
}
