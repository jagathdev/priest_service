"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  ChatBubbleBottomCenterTextIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  InboxStackIcon,
  TagIcon,
  ChatBubbleLeftEllipsisIcon,
} from "@heroicons/react/24/outline";

// Crisp WhatsApp SVG Icon
function WhatsAppIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

interface CustomerQueryItem {
  _id: string;
  userId?: string | null;
  name: string;
  mobileNumber: string;
  email?: string;
  bookingId?: string;
  subject: "Booking Issue" | "Puja Video Query" | "Refund/Cancellation" | "Other";
  message: string;
  consent: boolean;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  adminReply?: string;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface StatsData {
  totalQueries: number;
  openQueries: number;
  inProgressQueries: number;
  resolvedQueries: number;
}

export default function AdminCustomerQueriesPage() {
  const [queries, setQueries] = useState<CustomerQueryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stats
  const [stats, setStats] = useState<StatsData>({
    totalQueries: 0,
    openQueries: 0,
    inProgressQueries: 0,
    resolvedQueries: 0,
  });

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortBy, setSortBy] = useState<string>("latest");

  // Dropdown states
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [subjectDropdownOpen, setSubjectDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  // Selection states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Detail Modal & Action states
  const [viewQuery, setViewQuery] = useState<CustomerQueryItem | null>(null);
  const [replyText, setReplyText] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // Toast / feedback message
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const subjectDropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(e.target as Node)
      ) {
        setStatusDropdownOpen(false);
      }
      if (
        subjectDropdownRef.current &&
        !subjectDropdownRef.current.contains(e.target as Node)
      ) {
        setSubjectDropdownOpen(false);
      }
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(e.target as Node)
      ) {
        setSortDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const getAdminToken = () => {
    try {
      const match = document.cookie.match(/(?:^|;\s*)adminToken=([^;]+)/);
      if (match) return match[1];
      return localStorage.getItem("adminToken") || "";
    } catch {
      return "";
    }
  };

  const fetchQueries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        (typeof window !== "undefined" && window.location.origin.includes("localhost")
          ? "http://localhost:8564"
          : "https://priestservices.astroved.com");
      const token = getAdminToken();
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: "10",
        search: search.trim(),
        sort: sortBy,
      });

      if (statusFilter !== "All") params.append("status", statusFilter);
      if (subjectFilter !== "All") params.append("subject", subjectFilter);
      if (fromDate) params.append("fromDate", fromDate);
      if (toDate) params.append("toDate", toDate);

      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(
        `${baseUrl}/api/admin/customer-queries?${params.toString()}`,
        {
          headers,
          credentials: "include",
        }
      );

      if (!res.ok) {
        throw new Error(`Failed to load customer queries (${res.status})`);
      }

      const data = await res.json();
      if (data.success) {
        setQueries(data.queries || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalCount(data.pagination?.totalQueries || 0);
        if (data.stats) {
          setStats(data.stats);
        }
      } else {
        throw new Error(data.message || "Failed to load queries");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to fetch customer queries");
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, statusFilter, subjectFilter, fromDate, toDate, sortBy]);

  useEffect(() => {
    fetchQueries();
  }, [fetchQueries]);

  // Selection handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(queries.map((q) => q._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isAllSelected =
    queries.length > 0 && selectedIds.length === queries.length;
  const isPartiallySelected =
    selectedIds.length > 0 && selectedIds.length < queries.length;

  // Single delete
  const handleDeleteSingle = async (id: string) => {
    if (!confirm("Are you sure you want to delete this customer query?")) return;
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        (typeof window !== "undefined" && window.location.origin.includes("localhost")
          ? "http://localhost:8564"
          : "https://priestservices.astroved.com");
      const token = getAdminToken();
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${baseUrl}/api/admin/customer-queries/${id}`, {
        method: "DELETE",
        headers,
        credentials: "include",
      });

      const data = await res.json();
      if (data.success) {
        showToast("Customer query deleted successfully");
        setSelectedIds((prev) => prev.filter((i) => i !== id));
        if (viewQuery?._id === id) setViewQuery(null);
        fetchQueries();
      } else {
        showToast(data.message || "Failed to delete query", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Network error while deleting", "error");
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsDeleting(true);
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        (typeof window !== "undefined" && window.location.origin.includes("localhost")
          ? "http://localhost:8564"
          : "https://priestservices.astroved.com");
      const token = getAdminToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(
        `${baseUrl}/api/admin/customer-queries/bulk-delete`,
        {
          method: "POST",
          headers,
          credentials: "include",
          body: JSON.stringify({ ids: selectedIds }),
        }
      );

      const data = await res.json();
      if (data.success) {
        showToast(
          `Successfully deleted ${selectedIds.length} customer queries`
        );
        setSelectedIds([]);
        setShowBulkDeleteConfirm(false);
        fetchQueries();
      } else {
        showToast(data.message || "Failed to delete selected queries", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Network error while deleting", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Update Status / Reply
  const handleUpdateQueryStatus = async (
    id: string,
    newStatus: string,
    reply?: string
  ) => {
    setUpdatingStatus(id);
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        (typeof window !== "undefined" && window.location.origin.includes("localhost")
          ? "http://localhost:8564"
          : "https://priestservices.astroved.com");
      const token = getAdminToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const bodyPayload: any = { status: newStatus };
      if (reply !== undefined) bodyPayload.adminReply = reply;

      const res = await fetch(`${baseUrl}/api/admin/customer-queries/${id}`, {
        method: "PUT",
        headers,
        credentials: "include",
        body: JSON.stringify(bodyPayload),
      });

      const data = await res.json();
      if (data.success) {
        showToast(`Query marked as ${newStatus}`);
        setQueries((prev) =>
          prev.map((q) => (q._id === id ? data.query : q))
        );
        if (viewQuery?._id === id) {
          setViewQuery(data.query);
        }
        fetchQueries();
      } else {
        showToast(data.message || "Failed to update query status", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Network error updating query", "error");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "RESOLVED":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "CLOSED":
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getSubjectBadge = (subject: string) => {
    switch (subject) {
      case "Booking Issue":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "Puja Video Query":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Refund/Cancellation":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  // Avatar backgrounds
  const avatarColors = [
    "bg-emerald-600 text-white",
    "bg-blue-600 text-white",
    "bg-indigo-600 text-white",
    "bg-amber-600 text-white",
    "bg-purple-600 text-white",
    "bg-rose-600 text-white",
  ];
  const getAvatarBg = (name: string, index: number) => {
    if (!name) return avatarColors[index % avatarColors.length];
    const code = name.charCodeAt(0) || index;
    return avatarColors[code % avatarColors.length];
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-xs font-bold transition-all transform animate-in fade-in slide-in-from-bottom-2 ${toastMessage.type === "success"
            ? "bg-emerald-900 text-white border border-emerald-700"
            : "bg-red-900 text-white border border-red-700"
            }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircleIcon className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <ExclamationCircleIcon className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 font-serif tracking-tight">
              Customer Queries &amp; Support Desk
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
              {stats.totalQueries} Total Queries
            </span>
          </div>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Real-time inquiries and support requests submitted by devotees through &quot;Still need help?&quot;
          </p>
        </div>

        {/* Quick Refresh */}
        <button
          type="button"
          onClick={fetchQueries}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition shadow-2xs self-start sm:self-auto cursor-pointer active:scale-95"
        >
          <InboxStackIcon className={`w-4 h-4 text-emerald-600 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Queries</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Total Queries */}
        <div className="bg-white border border-gray-200/90 rounded-2xl p-4 shadow-2xs hover:shadow-sm transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
              Total Queries
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ChatBubbleBottomCenterTextIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900 font-sans">
            {stats.totalQueries}
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Submitted help requests</p>
        </div>

        {/* Open Queries */}
        <div className="bg-white border border-amber-200/90 rounded-2xl p-4 shadow-2xs hover:shadow-sm transition bg-amber-50/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
              Open / Pending
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <ClockIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-900 font-sans">
            {stats.openQueries}
          </div>
          <p className="text-[10px] text-amber-600 mt-1">Awaiting admin callback/response</p>
        </div>

        {/* In Progress */}
        <div className="bg-white border border-blue-200/90 rounded-2xl p-4 shadow-2xs hover:shadow-sm transition bg-blue-50/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
              In Progress
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <ChatBubbleLeftEllipsisIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-900 font-sans">
            {stats.inProgressQueries}
          </div>
          <p className="text-[10px] text-blue-600 mt-1">Currently being handled</p>
        </div>

        {/* Resolved */}
        <div className="bg-white border border-emerald-200/90 rounded-2xl p-4 shadow-2xs hover:shadow-sm transition bg-emerald-50/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              Resolved
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircleIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-900 font-sans">
            {stats.resolvedQueries}
          </div>
          <p className="text-[10px] text-emerald-600 mt-1">Successfully addressed</p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Filters & Search Toolbar */}
        <div className="p-4 sm:p-5 border-b border-gray-150 flex flex-col lg:flex-row gap-3.5 lg:items-center lg:justify-between">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by customer name, mobile, email, booking ID, or query..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-8 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right Toolbar Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Filter Dropdown */}
            <div className="relative" ref={statusDropdownRef}>
              <button
                type="button"
                onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-bold text-gray-700 hover:border-gray-300 transition shadow-2xs cursor-pointer"
              >
                <span>Status: {statusFilter}</span>
                <ChevronDownIcon className="w-3.5 h-3.5 text-gray-400" />
              </button>
              {statusDropdownOpen && (
                <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-xl shadow-xl py-1.5 z-20">
                  {["All", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map(
                    (opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          setStatusFilter(opt);
                          setStatusDropdownOpen(false);
                          setCurrentPage(1);
                        }}
                        className={`w-full text-left px-3.5 py-1.5 text-xs font-semibold hover:bg-gray-50 ${statusFilter === opt
                          ? "text-emerald-600 bg-emerald-50/50"
                          : "text-gray-700"
                          }`}
                      >
                        {opt === "All" ? "All Statuses" : opt.replace("_", " ")}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Subject Filter Dropdown */}
            <div className="relative" ref={subjectDropdownRef}>
              <button
                type="button"
                onClick={() => setSubjectDropdownOpen(!subjectDropdownOpen)}
                className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-bold text-gray-700 hover:border-gray-300 transition shadow-2xs cursor-pointer"
              >
                <span>Subject: {subjectFilter}</span>
                <ChevronDownIcon className="w-3.5 h-3.5 text-gray-400" />
              </button>
              {subjectDropdownOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-xl py-1.5 z-20">
                  {[
                    "All",
                    "Booking Issue",
                    "Puja Video Query",
                    "Refund/Cancellation",
                    "Other",
                  ].map((sub) => (
                    <button
                      key={sub}
                      onClick={() => {
                        setSubjectFilter(sub);
                        setSubjectDropdownOpen(false);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-3.5 py-1.5 text-xs font-semibold hover:bg-gray-50 ${subjectFilter === sub
                        ? "text-emerald-600 bg-emerald-50/50"
                        : "text-gray-700"
                        }`}
                    >
                      {sub === "All" ? "All Subjects" : sub}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative" ref={sortDropdownRef}>
              <button
                type="button"
                onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-bold text-gray-700 hover:border-gray-300 transition shadow-2xs cursor-pointer"
              >
                <span>
                  Sort:{" "}
                  {sortBy === "latest"
                    ? "Latest"
                    : sortBy === "oldest"
                      ? "Oldest"
                      : "Name (A-Z)"}
                </span>
                <ChevronDownIcon className="w-3.5 h-3.5 text-gray-400" />
              </button>
              {sortDropdownOpen && (
                <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-xl shadow-xl py-1.5 z-20">
                  {[
                    { id: "latest", label: "Latest" },
                    { id: "oldest", label: "Oldest" },
                    { id: "name_asc", label: "Name (A-Z)" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setSortBy(s.id);
                        setSortDropdownOpen(false);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-3.5 py-1.5 text-xs font-semibold hover:bg-gray-50 ${sortBy === s.id
                        ? "text-emerald-600 bg-emerald-50/50"
                        : "text-gray-700"
                        }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Date Range Filters */}
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs">
              <CalendarDaysIcon className="w-3.5 h-3.5 text-gray-400" />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-[11px] font-semibold text-gray-700 focus:outline-none"
              />
              <span className="text-gray-300">-</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-[11px] font-semibold text-gray-700 focus:outline-none"
              />
              {(fromDate || toDate) && (
                <button
                  type="button"
                  onClick={() => {
                    setFromDate("");
                    setToDate("");
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bulk Actions Banner */}
        {selectedIds.length > 0 && (
          <div className="bg-red-50/90 border-b border-red-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-black">
                {selectedIds.length}
              </span>
              <span className="text-xs font-bold text-red-900">
                {selectedIds.length === 1
                  ? "1 query selected"
                  : `${selectedIds.length} queries selected`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-xs font-bold transition cursor-pointer"
              >
                Clear Selection
              </button>

              <button
                type="button"
                onClick={() => setShowBulkDeleteConfirm(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <TrashIcon className="w-3.5 h-3.5" />
                <span>Delete Selected ({selectedIds.length})</span>
              </button>
            </div>
          </div>
        )}

        {/* Table Content - Auto/Fit layout without horizontal scroll */}
        <div className="w-full overflow-x-hidden">
          <table className="w-full text-left border-collapse text-xs table-fixed">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3.5 pl-4 pr-1 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isPartiallySelected;
                    }}
                    onChange={handleSelectAll}
                    disabled={queries.length === 0}
                    className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer disabled:cursor-not-allowed"
                  />
                </th>
                <th className="py-3.5 px-2 w-8 text-center">#</th>
                <th className="py-3.5 px-3 w-[26%]">CUSTOMER DETAILS</th>
                <th className="py-3.5 px-3 w-[17%]">SUBJECT &amp; BOOKING ID</th>
                <th className="py-3.5 px-3 w-[22%]">MESSAGE / QUERY</th>
                <th className="py-3.5 px-2.5 w-[14%]">STATUS</th>
                <th className="py-3.5 px-3 w-[15%]">SUBMITTED AT</th>
                <th className="py-3.5 pr-4 pl-2 text-center w-16">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150 text-xs font-medium text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      <span>Loading customer queries...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : queries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    No customer queries found matching your filters.
                  </td>
                </tr>
              ) : (
                queries.map((q, idx) => {
                  const initial = (q.name || "C").charAt(0).toUpperCase();
                  const avatarColor = getAvatarBg(q.name, idx);
                  const rowNumber = (currentPage - 1) * 10 + idx + 1;
                  const isChecked = selectedIds.includes(q._id);

                  // Call links
                  const cleanPhone = q.mobileNumber.replace(/[^\d]/g, "");
                  const telUrl = `tel:+91${cleanPhone}`;

                  // WhatsApp Click-to-chat URL
                  const whatsappMsg = `Namaste ${q.name}, we received your query regarding "${q.subject}" on Priest Services. How can we assist you today?`;
                  const whatsappUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(whatsappMsg)}`;

                  // Email links: Gmail compose
                  const gmailComposeUrl = q.email
                    ? `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
                      q.email
                    )}&su=${encodeURIComponent(
                      `Regarding your Priest Services Query: ${q.subject}`
                    )}&body=${encodeURIComponent(
                      `Dear ${q.name},\n\nRegarding your query:\n"${q.message}"\n\n`
                    )}`
                    : null;

                  return (
                    <tr
                      key={q._id}
                      className={`hover:bg-gray-50/80 transition-colors duration-150 ${isChecked ? "bg-emerald-50/40" : ""
                        }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 pl-4 pr-1 text-center align-middle">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleSelectOne(q._id)}
                          className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                      </td>

                      {/* Row # */}
                      <td className="py-3 px-2 text-center text-gray-400 font-bold text-xs align-middle">
                        {rowNumber}
                      </td>

                      {/* Customer Details: Avatar + Name + Call + WhatsApp + Email */}
                      <td className="py-3 px-3 align-middle overflow-hidden">
                        <div className="flex items-start gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 mt-0.5 ${avatarColor}`}
                          >
                            {initial}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="font-extrabold text-xs text-gray-900 block truncate" title={q.name}>
                              {q.name}
                            </span>

                            {/* Phone & WhatsApp links */}
                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                              <a
                                href={telUrl}
                                title={`Click to call ${q.name} (+91 ${cleanPhone})`}
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-1.5 py-0.5 rounded border border-blue-200 transition shrink-0"
                              >
                                <PhoneIcon className="w-2.5 h-2.5 text-blue-600" />
                                <span>+91 {cleanPhone}</span>
                              </a>

                              <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={`Chat with ${q.name} on WhatsApp`}
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300 transition shrink-0"
                              >
                                <WhatsAppIcon className="w-2.5 h-2.5 text-emerald-600" />
                                <span>WhatsApp</span>
                              </a>
                            </div>

                            {/* Email link */}
                            {q.email && (
                              <a
                                href={gmailComposeUrl || `mailto:${q.email}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={`Click to compose Gmail to ${q.email}`}
                                className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-500 hover:text-emerald-700 hover:underline truncate mt-1 max-w-full block"
                              >
                                <EnvelopeIcon className="w-2.5 h-2.5 text-gray-400 shrink-0 inline" />
                                <span className="truncate">{q.email}</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Subject & Booking ID */}
                      <td className="py-3 px-3 align-middle overflow-hidden">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold border truncate max-w-full ${getSubjectBadge(
                            q.subject
                          )}`}
                          title={q.subject}
                        >
                          {q.subject}
                        </span>
                        {q.bookingId && (
                          <div className="text-[10px] font-bold text-gray-600 flex items-center gap-1 mt-1 truncate" title={`ID: ${q.bookingId}`}>
                            <TagIcon className="w-3 h-3 text-gray-400 shrink-0" />
                            <span className="truncate">ID: {q.bookingId}</span>
                          </div>
                        )}
                      </td>

                      {/* Query Message (Click to view full modal) */}
                      <td className="py-3 px-3 align-middle overflow-hidden">
                        <p
                          onClick={() => {
                            setViewQuery(q);
                            setReplyText(q.adminReply || "");
                          }}
                          className="text-gray-800 line-clamp-2 cursor-pointer hover:text-emerald-700 transition leading-snug text-xs break-words"
                          title="Click to view full message & reply"
                        >
                          &ldquo;{q.message}&rdquo;
                        </p>
                        {q.adminReply && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 mt-1">
                            ✓ Replied
                          </span>
                        )}
                      </td>

                      {/* Status Selector */}
                      <td className="py-3 px-2.5 align-middle">
                        <select
                          value={q.status}
                          disabled={updatingStatus === q._id}
                          onChange={(e) =>
                            handleUpdateQueryStatus(q._id, e.target.value)
                          }
                          className={`text-[10px] font-bold px-2 py-1 rounded-md border focus:outline-none transition cursor-pointer max-w-full truncate ${getStatusBadge(
                            q.status
                          )}`}
                        >
                          <option value="OPEN">OPEN</option>
                          <option value="IN_PROGRESS">IN PROGRESS</option>
                          <option value="RESOLVED">RESOLVED</option>
                          <option value="CLOSED">CLOSED</option>
                        </select>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-3 text-gray-500 font-semibold text-[11px] align-middle">
                        <div className="leading-tight">
                          {formatDate(q.createdAt)}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 pr-4 pl-2 text-center align-middle">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setViewQuery(q);
                              setReplyText(q.adminReply || "");
                            }}
                            title="View Query Details"
                            className="p-1 rounded-md text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                          >
                            <EyeIcon className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteSingle(q._id)}
                            title="Delete Query"
                            className="p-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {
          totalCount > 0 && (
            <div className="px-5 py-3 border-t border-gray-150 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-gray-500 font-medium">
                Showing{" "}
                <span className="font-bold text-gray-800">
                  {(currentPage - 1) * 10 + 1}
                </span>{" "}
                to{" "}
                <span className="font-bold text-gray-800">
                  {Math.min(currentPage * 10, totalCount)}
                </span>{" "}
                of <span className="font-bold text-gray-800">{totalCount}</span> queries
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                </button>

                <span className="px-3 py-1 font-bold text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          )
        }
      </div >

      {/* Query Detail Modal - Fixed Sizing and Clean Spacing */}
      {
        viewQuery && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-gray-200 relative my-auto">
              {/* Header */}
              <div className="flex items-center justify-between pb-5 border-b border-gray-150">
                <div>
                  <h3 className="text-xl font-black text-gray-900 font-serif">
                    Customer Query Details
                  </h3>
                  <span className="text-xs text-gray-500 font-medium mt-0.5 block">
                    Submitted on {formatDate(viewQuery.createdAt)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setViewQuery(null)}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition cursor-pointer"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Content info */}
              <div className="py-5 space-y-5 text-xs">
                {/* Customer Info Card */}
                <div className="bg-gray-50/90 rounded-2xl p-4 sm:p-5 border border-gray-200/80 space-y-3.5">
                  {/* Name */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      Customer Name
                    </span>
                    <span className="text-sm font-extrabold text-gray-900">
                      {viewQuery.name}
                    </span>
                  </div>

                  {/* Mobile, Call & WhatsApp Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-3 border-t border-gray-200/60">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      Phone & WhatsApp
                    </span>
                    <div className="flex items-center gap-2">
                      {/* Call Button */}
                      <a
                        href={`tel:+91${viewQuery.mobileNumber.replace(/[^\d]/g, "")}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                      >
                        <PhoneIcon className="w-3.5 h-3.5" />
                        <span>Call +91 {viewQuery.mobileNumber}</span>
                      </a>

                      {/* WhatsApp Button */}
                      <a
                        href={`https://wa.me/91${viewQuery.mobileNumber.replace(
                          /[^\d]/g,
                          ""
                        )}?text=${encodeURIComponent(
                          `Namaste ${viewQuery.name}, we received your query regarding "${viewQuery.subject}" on Priest Services. How can we assist you today?`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>

                  {/* Email Gmail CTA */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-3 border-t border-gray-200/60">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      Email Address
                    </span>
                    {viewQuery.email ? (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-700 font-medium text-xs">
                          {viewQuery.email}
                        </span>
                        <a
                          href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
                            viewQuery.email
                          )}&su=${encodeURIComponent(
                            `Regarding your Priest Services Query: ${viewQuery.subject}`
                          )}&body=${encodeURIComponent(
                            `Dear ${viewQuery.name},\n\nRegarding your query:\n"${viewQuery.message}"\n\n`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                        >
                          <EnvelopeIcon className="w-3.5 h-3.5" />
                          <span>Open in Gmail</span>
                        </a>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">Not provided</span>
                    )}
                  </div>

                  {/* Booking ID if present */}
                  {viewQuery.bookingId && (
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200/60">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                        Booking ID
                      </span>
                      <span className="font-mono font-bold text-gray-900 bg-white border border-gray-200 px-2 py-0.5 rounded-md">
                        {viewQuery.bookingId}
                      </span>
                    </div>
                  )}
                </div>

                {/* Subject */}
                <div>
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                    Subject Category
                  </span>
                  <span
                    className={`inline-block px-3.5 py-1 rounded-xl text-xs font-bold border ${getSubjectBadge(
                      viewQuery.subject
                    )}`}
                  >
                    {viewQuery.subject}
                  </span>
                </div>

                {/* Message */}
                <div>
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                    Message / Issue Description
                  </span>
                  <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 text-gray-800 leading-relaxed whitespace-pre-wrap font-sans text-xs">
                    {viewQuery.message}
                  </div>
                </div>

                {/* Status Update & Admin Notes */}
                <div>
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">
                    Update Query Status
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const).map(
                      (st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() =>
                            handleUpdateQueryStatus(viewQuery._id, st, replyText)
                          }
                          className={`py-2 px-2 text-center rounded-xl text-[11px] font-bold transition border cursor-pointer ${viewQuery.status === st
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                            }`}
                        >
                          {st.replace("_", " ")}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Admin Internal Reply / Notes */}
                <div>
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                    Admin Resolution Note
                  </span>
                  <textarea
                    rows={3}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Add resolution notes, customer call notes, or follow-up status..."
                    className="w-full border border-gray-200 rounded-xl p-3 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="pt-5 border-t border-gray-150 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleDeleteSingle(viewQuery._id)}
                  className="text-red-600 hover:text-red-800 font-bold text-xs transition cursor-pointer"
                >
                  Delete Query
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setViewQuery(null)}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50 transition cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleUpdateQueryStatus(
                        viewQuery._id,
                        viewQuery.status,
                        replyText
                      )
                    }
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                  >
                    Save Note
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Bulk Delete Confirm Modal */}
      {
        showBulkDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <TrashIcon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-gray-900">
                  Delete {selectedIds.length} Queries?
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  Are you sure you want to permanently delete these customer queries? This action cannot be undone.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBulkDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  disabled={isDeleting}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                >
                  {isDeleting ? "Deleting..." : "Confirm Delete"}
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}
