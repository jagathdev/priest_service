"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  UserGroupIcon,
  SparklesIcon,
  FireIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  PhoneIcon,
  ChatBubbleBottomCenterTextIcon,
  ShoppingBagIcon,
  UserCircleIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";

interface ParticipantItem {
  name: string;
  gotra?: string;
  doesNotKnowGotra?: boolean;
}

interface PreOrderLeadItem {
  _id: string;
  userName: string;
  mobileNumber: string;
  whatsappNumber: string;
  email: string;
  serviceType: string;
  serviceId?: string;
  serviceName: string;
  packageName: string;
  packagePrice: number;
  totalAmount: number;
  preferredDate: string;
  participants: ParticipantItem[];
  gotra: string;
  doesNotKnowGotra: boolean;
  wish: string;
  offerings: Array<{
    name: string;
    priceINR: number;
    description?: string;
  }>;
  createdAt: string;
}

interface StatsData {
  totalLeads: number;
  pujaLeads: number;
  homaLeads: number;
}

export default function AdminPreOrdersPage() {
  const [leads, setLeads] = useState<PreOrderLeadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selection
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);

  // Stats
  const [stats, setStats] = useState<StatsData>({
    totalLeads: 0,
    pujaLeads: 0,
    homaLeads: 0,
  });

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [serviceTypeFilter, setServiceTypeFilter] = useState("All");
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);
  const [sortBy, setSortBy] = useState("latest");
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [dateFilterOpen, setDateFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // View Details Modal
  const [viewingLead, setViewingLead] = useState<PreOrderLeadItem | null>(null);

  // Delete Confirm Modal
  const [deletingLead, setDeletingLead] = useState<PreOrderLeadItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const serviceDropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const dateDropdownRef = useRef<HTMLDivElement>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (serviceDropdownRef.current && !serviceDropdownRef.current.contains(e.target as Node)) {
        setServiceDropdownOpen(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target as Node)) {
        setSortDropdownOpen(false);
      }
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(e.target as Node)) {
        setDateFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getAdminToken = () => {
    try {
      const match = document.cookie.match(/(?:^|;\s*)adminToken=([^;]*)/);
      if (match) return match[1];
      return localStorage.getItem("adminToken") || "";
    } catch {
      return "";
    }
  };

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";
      const token = getAdminToken();
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: "10",
        search: search.trim(),
        sort: sortBy,
      });

      if (serviceTypeFilter !== "All") {
        params.append("serviceType", serviceTypeFilter);
      }
      if (fromDate) {
        params.append("fromDate", fromDate);
      }
      if (toDate) {
        params.append("toDate", toDate);
      }

      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${baseUrl}/api/admin/pre-orders?${params.toString()}`, {
        headers,
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to load pre-orders list");
      }

      const resData = await res.json();
      if (resData.success && resData.data) {
        setLeads(resData.data.leads || []);
        setTotalCount(resData.data.pagination?.total || 0);
        setTotalPages(resData.data.pagination?.totalPages || 1);
        if (resData.data.stats) {
          setStats(resData.data.stats);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to load pre-orders");
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, serviceTypeFilter, sortBy, fromDate, toDate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLeads();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchLeads]);

  // Multiple selection
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedLeadIds(leads.map((l) => l._id));
    } else {
      setSelectedLeadIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const isAllSelected = leads.length > 0 && selectedLeadIds.length === leads.length;
  const isPartiallySelected = selectedLeadIds.length > 0 && selectedLeadIds.length < leads.length;

  // Single Delete
  const handleDeleteConfirm = async () => {
    if (!deletingLead) return;
    setIsDeleting(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";
      const token = getAdminToken();
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${baseUrl}/api/admin/pre-orders/${deletingLead._id}`, {
        method: "DELETE",
        headers,
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to delete lead");

      showToast("Pre-order record removed successfully", "success");
      setDeletingLead(null);
      setSelectedLeadIds((prev) => prev.filter((id) => id !== deletingLead._id));
      fetchLeads();
    } catch (err: any) {
      showToast(err.message || "Delete failed", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Bulk Delete
  const handleBulkDeleteConfirm = async () => {
    if (selectedLeadIds.length === 0) return;
    setIsBulkDeleting(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";
      const token = getAdminToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${baseUrl}/api/admin/pre-orders/bulk-delete`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ leadIds: selectedLeadIds }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to bulk delete leads");

      showToast(`${selectedLeadIds.length} pre-order record(s) removed`, "success");
      setShowBulkDeleteConfirm(false);
      setSelectedLeadIds([]);
      fetchLeads();
    } catch (err: any) {
      showToast(err.message || "Bulk delete failed", "error");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "N/A";
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return "";
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getAvatarBg = (name: string, index: number) => {
    const colors = [
      "bg-purple-100 text-purple-700",
      "bg-pink-100 text-pink-700",
      "bg-blue-100 text-blue-700",
      "bg-emerald-100 text-emerald-700",
      "bg-amber-100 text-amber-700",
      "bg-cyan-100 text-cyan-700",
      "bg-indigo-100 text-indigo-700",
    ];
    let code = 0;
    for (let i = 0; i < (name || "").length; i++) {
      code += name.charCodeAt(i);
    }
    return colors[(code + index) % colors.length];
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-xs font-bold text-white transition-all transform animate-in slide-in-from-bottom-5 ${toast.type === "success" ? "bg-emerald-600" : "bg-red-600"
            }`}
        >
          {toast.type === "success" ? (
            <CheckCircleIcon className="w-5 h-5 shrink-0" />
          ) : (
            <ExclamationCircleIcon className="w-5 h-5 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header & Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Pre-Orders / Interest
          </h1>
          <p className="text-xs font-semibold text-gray-500 mt-0.5">
            View devotees who clicked &ldquo;Continue with Payment&rdquo; but haven&rsquo;t completed checkout yet.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Date Filter Dropdown */}
          <div className="relative" ref={dateDropdownRef}>
            <button
              type="button"
              onClick={() => setDateFilterOpen(!dateFilterOpen)}
              className={`flex items-center gap-2 bg-white border rounded-xl px-3.5 py-2 text-xs font-bold transition shadow-xs ${fromDate || toDate
                ? "border-emerald-500 text-emerald-700 bg-emerald-50/40"
                : "border-gray-200 text-gray-700 hover:border-gray-300"
                }`}
            >
              <CalendarDaysIcon className="w-4 h-4 text-gray-500" />
              <span>
                {fromDate && toDate
                  ? `${fromDate} to ${toDate}`
                  : fromDate
                    ? `From ${fromDate}`
                    : toDate
                      ? `Until ${toDate}`
                      : "Date Range"}
              </span>
              <ChevronDownIcon className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {dateFilterOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-2xl shadow-2xl p-4 z-30">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-100">
                  <span className="text-xs font-bold text-gray-800">Filter by Date</span>
                  {(fromDate || toDate) && (
                    <button
                      type="button"
                      onClick={() => {
                        setFromDate("");
                        setToDate("");
                        setCurrentPage(1);
                      }}
                      className="text-[11px] font-bold text-red-500 hover:text-red-700 transition"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">From Date</label>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => {
                        setFromDate(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-800 font-medium outline-none focus:border-emerald-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">To Date</label>
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => {
                        setToDate(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-800 font-medium outline-none focus:border-emerald-500 bg-white"
                    />
                  </div>
                </div>

                <div className="mt-4 pt-2 border-t border-gray-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      const today = new Date().toISOString().split("T")[0];
                      setFromDate(today);
                      setToDate(today);
                      setCurrentPage(1);
                      setDateFilterOpen(false);
                    }}
                    className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => setDateFilterOpen(false)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Admin Avatar Pill */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3.5 py-2 shadow-xs">
            <div className="w-6 h-6 rounded-full bg-[#1c2c5c] text-white flex items-center justify-center text-[11px] font-extrabold">
              A
            </div>
            <span className="text-xs font-bold text-gray-800">Admin</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Incomplete Pre-Orders */}
        <div className="bg-white rounded-2xl border border-gray-150 p-5 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <UserGroupIcon className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-gray-500">Incomplete Pre-Orders</span>
            <span className="text-2xl font-black text-gray-900 tracking-tight">
              {stats.totalLeads.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* Interested in Pujas */}
        <div className="bg-white rounded-2xl border border-gray-150 p-5 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <SparklesIcon className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-gray-500">Interested in Pujas</span>
            <span className="text-2xl font-black text-gray-900 tracking-tight">
              {stats.pujaLeads.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* Interested in Homas */}
        <div className="bg-white rounded-2xl border border-gray-150 p-5 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <FireIcon className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-gray-500">Interested in Homas</span>
            <span className="text-2xl font-black text-gray-900 tracking-tight">
              {stats.homaLeads.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        {/* Search & Filter Toolbar */}
        <div className="p-4 sm:px-6 sm:py-4 border-b border-gray-150 flex flex-wrap items-center justify-between gap-3 bg-white">
          {/* Search bar inside Card */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name, mobile, service, or gotra..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition font-medium"
            />
          </div>

          {/* Right Filters: Service Type & Sort */}
          <div className="flex items-center gap-3">
            {/* Service Type Dropdown */}
            <div className="relative" ref={serviceDropdownRef}>
              <button
                type="button"
                onClick={() => setServiceDropdownOpen(!serviceDropdownOpen)}
                className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-bold text-gray-700 hover:border-gray-300 transition shadow-2xs"
              >
                <span>{serviceTypeFilter === "All" ? "All Services" : `${serviceTypeFilter}s`}</span>
                <ChevronDownIcon className="w-3.5 h-3.5 text-gray-400" />
              </button>
              {serviceDropdownOpen && (
                <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-xl shadow-xl py-1.5 z-20">
                  {["All", "Puja", "Homa"].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setServiceTypeFilter(opt);
                        setServiceDropdownOpen(false);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-3.5 py-1.5 text-xs font-semibold hover:bg-gray-50 ${serviceTypeFilter === opt ? "text-emerald-600 bg-emerald-50/50" : "text-gray-700"
                        }`}
                    >
                      {opt === "All" ? "All Services" : `${opt}s`}
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
                className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-bold text-gray-700 hover:border-gray-300 transition shadow-2xs"
              >
                <span>
                  Sort by:{" "}
                  {sortBy === "latest"
                    ? "Latest"
                    : sortBy === "oldest"
                      ? "Oldest"
                      : sortBy === "name_asc"
                        ? "Name (A-Z)"
                        : "Amount (High-Low)"}
                </span>
                <ChevronDownIcon className="w-3.5 h-3.5 text-gray-400" />
              </button>
              {sortDropdownOpen && (
                <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-xl py-1.5 z-20">
                  {[
                    { id: "latest", label: "Latest" },
                    { id: "oldest", label: "Oldest" },
                    { id: "name_asc", label: "Name (A-Z)" },
                    { id: "amount_desc", label: "Amount (High to Low)" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setSortBy(s.id);
                        setSortDropdownOpen(false);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-3.5 py-1.5 text-xs font-semibold hover:bg-gray-50 ${sortBy === s.id ? "text-emerald-600 bg-emerald-50/50" : "text-gray-700"
                        }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bulk Action Bar */}
        {selectedLeadIds.length > 0 && (
          <div className="bg-red-50/80 border-b border-red-200/80 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-black">
                {selectedLeadIds.length}
              </span>
              <span className="text-xs font-bold text-red-900">
                {selectedLeadIds.length === 1 ? "1 lead selected" : `${selectedLeadIds.length} leads selected`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedLeadIds([])}
                className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-xs font-bold transition"
              >
                Clear Selection
              </button>

              <button
                type="button"
                onClick={() => setShowBulkDeleteConfirm(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-xs"
              >
                <TrashIcon className="w-3.5 h-3.5" />
                <span>Delete Selected ({selectedLeadIds.length})</span>
              </button>
            </div>
          </div>
        )}

        {/* Pre-Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3.5 pl-6 pr-2 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isPartiallySelected;
                    }}
                    onChange={handleSelectAll}
                    disabled={leads.length === 0}
                    className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer disabled:cursor-not-allowed"
                  />
                </th>
                <th className="py-3.5 px-2 w-10 text-center">#</th>
                <th className="py-3.5 px-4">User Details</th>
                <th className="py-3.5 px-4">Service Interested</th>
                <th className="py-3.5 px-4">Preferred Date</th>
                <th className="py-3.5 px-4">Additional Info</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 pr-6 pl-4 text-center w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150 text-xs font-medium text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      <span>Loading incomplete pre-orders...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    No incomplete pre-orders found. Devotees who click &ldquo;Continue with Payment&rdquo; without completing checkout will appear here.
                  </td>
                </tr>
              ) : (
                leads.map((lead, idx) => {
                  const initial = (lead.userName || "D").charAt(0).toUpperCase();
                  const avatarColor = getAvatarBg(lead.userName, idx);
                  const rowNumber = (currentPage - 1) * 10 + idx + 1;
                  const isChecked = selectedLeadIds.includes(lead._id);

                  return (
                    <tr
                      key={lead._id}
                      className={`hover:bg-gray-50/80 transition-colors duration-150 ${isChecked ? "bg-emerald-50/40" : ""
                        }`}
                    >
                      {/* Checkbox */}
                      <td className="py-4 pl-6 pr-2 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleSelectOne(lead._id)}
                          className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                      </td>

                      {/* Row # */}
                      <td className="py-4 px-2 text-center text-gray-400 font-bold text-xs">
                        {rowNumber}
                      </td>

                      {/* User Details */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 ${avatarColor}`}
                          >
                            {initial}
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block truncate max-w-[170px]">
                              {lead.userName}
                            </span>
                            <span className="text-[11px] font-semibold text-gray-500 block">
                              {lead.whatsappNumber || lead.mobileNumber}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Service Interested */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold ${lead.serviceType?.toLowerCase().includes("homa")
                              ? "bg-amber-100 text-amber-800"
                              : "bg-purple-100 text-purple-800"
                              }`}
                          >
                            {lead.serviceType?.toLowerCase().includes("homa") ? "HOMA" : "PUJA"}
                          </span>
                          <span className="font-bold text-gray-900 truncate max-w-[190px]">
                            {lead.serviceName}
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-500 block mt-0.5">
                          {lead.packageName}
                        </span>
                      </td>

                      {/* Preferred Date */}
                      <td className="py-4 px-4 font-semibold text-gray-800 whitespace-nowrap">
                        {lead.preferredDate ? formatDate(lead.preferredDate) : formatDate(lead.createdAt)}
                      </td>

                      {/* Additional Info */}
                      <td className="py-4 px-4 max-w-[220px]">
                        {lead.wish ? (
                          <span className="text-gray-700 italic line-clamp-1">&ldquo;{lead.wish}&rdquo;</span>
                        ) : lead.gotra ? (
                          <span className="text-gray-700">Gotra: {lead.gotra}</span>
                        ) : (
                          <span className="text-gray-400">Devotee details provided</span>
                        )}
                        {lead.participants.length > 1 && (
                          <span className="text-[10px] font-bold text-emerald-600 block mt-0.5">
                            +{lead.participants.length - 1} more devotee(s)
                          </span>
                        )}
                      </td>

                      {/* Total Amount */}
                      <td className="py-4 px-4 font-black text-gray-900 whitespace-nowrap">
                        ₹ {lead.totalAmount.toLocaleString("en-IN")}
                      </td>

                      {/* Actions */}
                      <td className="py-4 pr-6 pl-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          {/* View Button */}
                          <button
                            type="button"
                            onClick={() => setViewingLead(lead)}
                            title="View devotee details"
                            className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1 transition-colors active:scale-95"
                          >
                            <EyeIcon className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => setDeletingLead(lead)}
                            title="Remove lead"
                            className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-colors active:scale-95"
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

        {/* Pagination Footer */}
        <div className="p-4 sm:px-6 border-t border-gray-150 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
          <div className="text-xs text-gray-500 font-medium">
            Showing {leads.length > 0 ? (currentPage - 1) * 10 + 1 : 0} to{" "}
            {Math.min(currentPage * 10, totalCount)} of {totalCount} incomplete bookings
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-8 h-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => {
                  if (totalPages <= 7) return true;
                  if (p === 1 || p === totalPages) return true;
                  if (Math.abs(p - currentPage) <= 1) return true;
                  return false;
                })
                .map((p, pIdx, arr) => {
                  const prevVal = arr[pIdx - 1];
                  const showEllipsis = prevVal && p - prevVal > 1;

                  return (
                    <div key={p} className="flex items-center">
                      {showEllipsis && <span className="px-1 text-gray-400 text-xs">...</span>}
                      <button
                        type="button"
                        onClick={() => setCurrentPage(p)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition ${currentPage === p
                          ? "bg-emerald-600 text-white"
                          : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                          }`}
                      >
                        {p}
                      </button>
                    </div>
                  );
                })}

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="w-8 h-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* View Devotee Details Modal (Clean Design) */}
      {viewingLead && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white flex items-center justify-between border-b border-emerald-800/20">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white shrink-0">
                  <UserCircleIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight text-white leading-snug drop-shadow-sm">
                    Devotee Booking Lead
                  </h3>
                  <p className="text-xs font-semibold text-emerald-100 mt-0.5">
                    Order checkout initiated on {formatDate(viewingLead.createdAt)} at {formatTime(viewingLead.createdAt)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingLead(null)}
                className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors shrink-0"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 space-y-5 max-h-[72vh] overflow-y-auto">
              {/* Devotee Profile & Contact Banner */}
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-gray-900">{viewingLead.userName}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800">
                      Payment Pending
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-gray-600 font-medium">
                    <span>📞 {viewingLead.whatsappNumber || viewingLead.mobileNumber}</span>
                    {viewingLead.email && <span>• {viewingLead.email}</span>}
                  </div>
                </div>

                {/* Direct Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`tel:${viewingLead.whatsappNumber || viewingLead.mobileNumber}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs"
                  >
                    <PhoneIcon className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>
                  <a
                    href={`https://wa.me/${(viewingLead.whatsappNumber || viewingLead.mobileNumber).replace(/\D/g, "")}?text=${encodeURIComponent(
                      `Namaste ${viewingLead.userName}, we noticed you were booking the ${viewingLead.serviceName}. May we assist you in completing your ritual booking?`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                  >
                    <ChatBubbleBottomCenterTextIcon className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Service & Package Card */}
              <div className="border border-gray-150 rounded-2xl p-4 bg-gray-50/60">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <ShoppingBagIcon className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-black uppercase text-gray-500 tracking-wider">
                      Ritual &amp; Package Selected
                    </span>
                  </div>
                  <span className="text-sm font-black text-gray-900">
                    ₹ {viewingLead.totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Ritual Service:</span>
                    <span className="font-bold text-gray-900">{viewingLead.serviceName} ({viewingLead.serviceType})</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Selected Package:</span>
                    <span className="font-bold text-gray-900">{viewingLead.packageName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Preferred Date:</span>
                    <span className="font-bold text-gray-900">
                      {viewingLead.preferredDate ? formatDate(viewingLead.preferredDate) : formatDate(viewingLead.createdAt)}
                    </span>
                  </div>

                  {/* Offerings breakdown if any */}
                  {viewingLead.offerings && viewingLead.offerings.length > 0 && (
                    <div className="pt-2.5 mt-2 border-t border-gray-200/80">
                      <span className="text-[11px] font-bold text-gray-500 block mb-1">
                        Prasadam &amp; Sacred Offerings:
                      </span>
                      <div className="space-y-1">
                        {viewingLead.offerings.map((off, oIdx) => (
                          <div key={oIdx} className="flex justify-between text-xs text-gray-700">
                            <span>• {off.name}</span>
                            <span className="font-bold text-gray-900">₹ {off.priceINR}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sankalp Prayer & Wish */}
              {viewingLead.wish && (
                <div className="border border-amber-200/70 bg-amber-50/40 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-1.5 text-amber-800">
                    <HeartIcon className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-black uppercase tracking-wider">
                      Devotee&rsquo;s Sankalp Wish / Prayer
                    </span>
                  </div>
                  <p className="text-xs text-amber-950 italic leading-relaxed">
                    &ldquo;{viewingLead.wish}&rdquo;
                  </p>
                </div>
              )}

              {/* Devotee Participants List */}
              <div className="border border-gray-150 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <UserGroupIcon className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-black uppercase text-gray-500 tracking-wider">
                      Participants Registered ({viewingLead.participants?.length || 1})
                    </span>
                  </div>
                  {viewingLead.gotra && (
                    <span className="text-xs font-semibold text-gray-600">
                      Primary Gotra: <strong className="text-gray-900">{viewingLead.gotra}</strong>
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  {viewingLead.participants && viewingLead.participants.length > 0 ? (
                    viewingLead.participants.map((p, pIdx) => (
                      <div
                        key={pIdx}
                        className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-xl text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-white border border-gray-200 text-gray-600 font-bold flex items-center justify-center text-[10px]">
                            {pIdx + 1}
                          </span>
                          <span className="font-bold text-gray-900">{p.name || `Devotee ${pIdx + 1}`}</span>
                        </div>
                        <span className="text-gray-500 text-[11px] font-medium">
                          {p.doesNotKnowGotra ? "Gotra: Unknown" : p.gotra ? `Gotra: ${p.gotra}` : "Gotra: N/A"}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-gray-500">
                      {viewingLead.userName} {viewingLead.gotra ? `(${viewingLead.gotra})` : ""}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-150 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setViewingLead(null)}
                className="px-6 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold transition shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Single Lead Modal */}
      {deletingLead && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-150 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
              <TrashIcon className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1.5">Delete Pre-Order Lead?</h3>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              Are you sure you want to delete the pre-order record for <span className="font-bold text-gray-800">{deletingLead.userName}</span>?
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingLead(null)}
                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-sm disabled:opacity-60"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-150 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
              <TrashIcon className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1.5">
              Delete {selectedLeadIds.length} Pre-Orders?
            </h3>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              Are you sure you want to delete the selected {selectedLeadIds.length} incomplete pre-orders?
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={isBulkDeleting}
                onClick={() => setShowBulkDeleteConfirm(false)}
                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isBulkDeleting}
                onClick={handleBulkDeleteConfirm}
                className="flex-1 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-sm disabled:opacity-60"
              >
                {isBulkDeleting ? "Deleting..." : "Delete Selected"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
