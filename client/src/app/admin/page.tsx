"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

// Dynamic Section imports to keep initial bundle fast and scoped
const DashboardSection = dynamic(() => import("@/components/admin/sections/DashboardSection"), {
  loading: () => <SectionLoadingSpinner title="Dashboard" />,
});
const UsersSection = dynamic(() => import("@/components/admin/sections/UsersSection"), {
  loading: () => <SectionLoadingSpinner title="Users" />,
});
const VisitorsSection = dynamic(() => import("@/components/admin/sections/VisitorsSection"), {
  loading: () => <SectionLoadingSpinner title="Visitor Analytics" />,
});

function SectionLoadingSpinner({ title }: { title: string }) {
  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[350px] space-y-3">
      <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-bold text-gray-500">Loading {title}...</span>
    </div>
  );
}

function AdminPageContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "dashboard";

  switch (tab) {
    case "users":
      return <UsersSection />;
    case "visitors":
      return <VisitorsSection />;
    case "dashboard":
    default:
      return <DashboardSection />;
  }
}

export default function AdminPage() {
  return (
    <Suspense fallback={<SectionLoadingSpinner title="Admin Control Center" />}>
      <AdminPageContent />
    </Suspense>
  );
}
