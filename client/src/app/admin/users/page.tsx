"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  UserGroupIcon,
  CheckBadgeIcon,
  SparklesIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

interface DevoteeUser {
  _id: string;
  name: string;
  email: string;
  mobileNumber: string;
  whatsappNumber?: string;
  totalAmountSpent: number;
  status: "Active" | "Inactive";
  isVerified: boolean;
  createdAt: string;
}

interface StatsData {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<DevoteeUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stats
  const [stats, setStats] = useState<StatsData>({
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
  });

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [sortBy, setSortBy] = useState("latest");
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [dateFilterOpen, setDateFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Edit Modal State
  const [editingUser, setEditingUser] = useState<DevoteeUser | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    whatsappNumber: "",
    status: "Active",
  });
  const [savingUser, setSavingUser] = useState(false);
  const [modalError, setModalError] = useState("");

  // Delete Dialog State
  const [deletingUser, setDeletingUser] = useState<DevoteeUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const dateDropdownRef = useRef<HTMLDivElement>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target as Node)) {
        setStatusDropdownOpen(false);
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

  const fetchUsers = useCallback(async () => {
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
      if (statusFilter !== "All") {
        params.append("status", statusFilter);
      }
      if (fromDate) {
        params.append("fromDate", fromDate);
      }
      if (toDate) {
        params.append("toDate", toDate);
      }

      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${baseUrl}/api/admin/users?${params.toString()}`, {
        headers,
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to load users list");
      }

      const resData = await res.json();
      if (resData.success && resData.data) {
        setUsers(resData.data.users || []);
        setTotalCount(resData.data.pagination?.total || 0);
        setTotalPages(resData.data.pagination?.totalPages || 1);
        if (resData.data.stats) {
          setStats(resData.data.stats);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, statusFilter, sortBy, fromDate, toDate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  // Open Edit Modal
  const handleOpenEdit = (user: DevoteeUser) => {
    setEditingUser(user);
    setEditFormData({
      name: user.name || "",
      email: user.email === "N/A" ? "" : user.email,
      mobileNumber: user.mobileNumber === "N/A" ? "" : user.mobileNumber,
      whatsappNumber: user.whatsappNumber || "",
      status: user.status || "Active",
    });
    setModalError("");
  };

  // Submit Edit
  const handleSaveEdit = async () => {
    if (!editingUser) return;
    if (!editFormData.name.trim()) {
      setModalError("User name is required");
      return;
    }
    if (!editFormData.mobileNumber.trim()) {
      setModalError("Mobile number is required");
      return;
    }

    setSavingUser(true);
    setModalError("");
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";
      const token = getAdminToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${baseUrl}/api/admin/users/${editingUser._id}`, {
        method: "PUT",
        headers,
        credentials: "include",
        body: JSON.stringify({
          name: editFormData.name.trim(),
          email: editFormData.email.trim(),
          mobileNumber: editFormData.mobileNumber.trim(),
          whatsappNumber: editFormData.whatsappNumber.trim(),
          isVerified: editFormData.status === "Active",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update user");
      }

      showToast("User details updated successfully", "success");
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      setModalError(err.message || "Error updating user");
    } finally {
      setSavingUser(false);
    }
  };

  // Submit Delete
  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    setIsDeleting(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";
      const token = getAdminToken();
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${baseUrl}/api/admin/users/${deletingUser._id}`, {
        method: "DELETE",
        headers,
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete user");
      }

      showToast("User deleted successfully", "success");
      setDeletingUser(null);
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || "Failed to delete user", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const getAvatarBg = (name: string, idx: number) => {
    const colors = [
      "bg-purple-100 text-purple-700",
      "bg-pink-100 text-pink-700",
      "bg-blue-100 text-blue-700",
      "bg-emerald-100 text-emerald-700",
      "bg-amber-100 text-amber-700",
      "bg-indigo-100 text-indigo-700",
      "bg-teal-100 text-teal-700",
    ];
    return colors[idx % colors.length];
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "N/A";
    const day = d.getDate();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const todayFormatted = (() => {
    const d = new Date();
    const day = d.getDate();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
  })();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto min-h-screen">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs font-bold transition-all ${toast.type === "success"
            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
            : "bg-red-50 text-red-800 border-red-200"
            }`}
        >
          {toast.type === "success" ? (
            <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
          ) : (
            <ExclamationCircleIcon className="w-4 h-4 text-red-600" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserGroupIcon className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Users</h1>
          </div>
          <p className="text-xs text-gray-500 mt-1 pl-11">
            View and manage all registered users on the platform.
          </p>
        </div>

        {/* Top Controls: Search, Date & Admin Pill */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name, email or mobile number..."
              className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-gray-800 placeholder-gray-400 outline-none focus:border-emerald-500 transition shadow-2xs"
            />
          </div>

          {/* Date Range Picker Dropdown */}
          <div className="relative" ref={dateDropdownRef}>
            <button
              type="button"
              onClick={() => setDateFilterOpen(!dateFilterOpen)}
              className={`flex items-center gap-2 border rounded-xl px-3.5 py-2 text-xs font-semibold shadow-2xs transition ${fromDate || toDate
                ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                }`}
            >
              <CalendarDaysIcon className={`w-3.5 h-3.5 ${fromDate || toDate ? "text-emerald-600" : "text-gray-500"}`} />
              <span>
                {fromDate && toDate
                  ? `${formatDate(fromDate)} – ${formatDate(toDate)}`
                  : fromDate
                    ? `From ${formatDate(fromDate)}`
                    : toDate
                      ? `Until ${formatDate(toDate)}`
                      : todayFormatted}
              </span>
              <ChevronDownIcon className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {dateFilterOpen && (
              <div className="absolute right-0 mt-1.5 w-72 bg-white border border-gray-200 rounded-2xl shadow-xl p-4 z-30 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-100">
                  <span className="text-xs font-bold text-gray-800">Filter by Joined Date</span>
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
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Admin Avatar Pill */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-2xs">
            <div className="w-6 h-6 rounded-full bg-[#1c2c5c] text-white flex items-center justify-center text-[11px] font-bold">
              A
            </div>
            <span className="text-xs font-bold text-gray-800">Admin</span>
          </div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Users */}
        <div className="bg-white rounded-2xl border border-gray-150 p-5 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <UserGroupIcon className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-gray-500">Total Users</span>
            <span className="text-2xl font-black text-gray-900 tracking-tight">
              {stats.totalUsers.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-white rounded-2xl border border-gray-150 p-5 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckBadgeIcon className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-gray-500">Active Users</span>
            <span className="text-2xl font-black text-gray-900 tracking-tight">
              {stats.activeUsers.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-2xl border border-gray-150 p-5 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <SparklesIcon className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-gray-500">Total Revenue (All Users)</span>
            <span className="text-2xl font-black text-gray-900 tracking-tight">
              ₹ {stats.totalRevenue.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-gray-150 shadow-xs overflow-hidden">
        {/* Filters Top Bar inside Card */}
        <div className="p-4 sm:px-6 sm:py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 bg-white">
          <div className="text-xs font-bold text-gray-500">
            Showing {users.length > 0 ? (currentPage - 1) * 10 + 1 : 0} to{" "}
            {Math.min(currentPage * 10, totalCount)} of {totalCount} users
          </div>

          <div className="flex items-center gap-3">
            {/* Filter by Status */}
            <div className="relative" ref={statusDropdownRef}>
              <button
                type="button"
                onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3.5 py-1.5 text-xs font-bold text-gray-700 hover:border-gray-300 transition"
              >
                <span>{statusFilter === "All" ? "All Users" : `${statusFilter} Users`}</span>
                <ChevronDownIcon className="w-3.5 h-3.5 text-gray-400" />
              </button>
              {statusDropdownOpen && (
                <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 z-20">
                  {["All", "Active", "Inactive"].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setStatusFilter(opt);
                        setStatusDropdownOpen(false);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-3.5 py-1.5 text-xs font-semibold hover:bg-gray-50 ${statusFilter === opt ? "text-emerald-600 bg-emerald-50/50" : "text-gray-700"
                        }`}
                    >
                      {opt === "All" ? "All Users" : opt}
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
                className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3.5 py-1.5 text-xs font-bold text-gray-700 hover:border-gray-300 transition"
              >
                <span>
                  Sort by:{" "}
                  {sortBy === "latest"
                    ? "Latest"
                    : sortBy === "oldest"
                      ? "Oldest"
                      : sortBy === "name_asc"
                        ? "Name (A-Z)"
                        : "Name (Z-A)"}
                </span>
                <ChevronDownIcon className="w-3.5 h-3.5 text-gray-400" />
              </button>
              {sortDropdownOpen && (
                <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 z-20">
                  {[
                    { id: "latest", label: "Latest" },
                    { id: "oldest", label: "Oldest" },
                    { id: "name_asc", label: "Name (A-Z)" },
                    { id: "name_desc", label: "Name (Z-A)" },
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

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-150 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3.5 pl-6 pr-3 w-12 text-center">#</th>
                <th className="py-3.5 px-4">User Name</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Mobile Number</th>
                <th className="py-3.5 px-4">Total Amount Spent</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Joined On</th>
                <th className="py-3.5 pr-6 pl-4 text-center w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      <span>Loading registered users...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    No users found matching the criteria.
                  </td>
                </tr>
              ) : (
                users.map((u, idx) => {
                  const initial = (u.name || "D").charAt(0).toUpperCase();
                  const avatarColor = getAvatarBg(u.name, idx);
                  const rowNumber = (currentPage - 1) * 10 + idx + 1;

                  return (
                    <tr
                      key={u._id}
                      className="hover:bg-gray-50/80 transition-colors duration-150"
                    >
                      {/* Row # */}
                      <td className="py-4 pl-6 pr-3 text-center text-gray-400 font-bold text-xs">
                        {rowNumber}
                      </td>

                      {/* Name with Avatar */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 ${avatarColor}`}
                          >
                            {initial}
                          </div>
                          <span className="font-bold text-gray-900 truncate max-w-[170px]">
                            {u.name}
                          </span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-4 px-4 text-gray-600">{u.email}</td>

                      {/* Mobile */}
                      <td className="py-4 px-4 font-semibold text-gray-800">
                        {u.mobileNumber.startsWith("+")
                          ? u.mobileNumber
                          : `+91 ${u.mobileNumber}`}
                      </td>

                      {/* Total Amount Spent */}
                      <td className="py-4 px-4 font-extrabold text-gray-900">
                        ₹ {u.totalAmountSpent.toLocaleString("en-IN")}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${u.status === "Active"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-600"
                            }`}
                        >
                          {u.status}
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td className="py-4 px-4 text-gray-500 font-medium">
                        {formatDate(u.createdAt)}
                      </td>

                      {/* Actions: Edit & Delete */}
                      <td className="py-4 pr-6 pl-4 text-center">
                        <div className="inline-flex items-center gap-2">
                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(u)}
                            title="Edit user"
                            className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-colors active:scale-95"
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => setDeletingUser(u)}
                            title="Delete user"
                            className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-colors active:scale-95"
                          >
                            <TrashIcon className="w-4 h-4" />
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
            Showing {users.length > 0 ? (currentPage - 1) * 10 + 1 : 0} to{" "}
            {Math.min(currentPage * 10, totalCount)} of {totalCount} users
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              {/* Previous */}
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-8 h-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>

              {/* Page numbers */}
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
                      {showEllipsis && (
                        <span className="px-1 text-gray-400 text-xs">...</span>
                      )}
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

              {/* Next */}
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

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-150 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-150">
              <h3 className="text-base font-bold text-gray-900">Edit User Details</h3>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {modalError}
              </div>
            )}

            <div className="mt-4 space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  User Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-medium text-gray-900 outline-none focus:border-emerald-500"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-medium text-gray-900 outline-none focus:border-emerald-500"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={editFormData.mobileNumber}
                  onChange={(e) => setEditFormData({ ...editFormData, mobileNumber: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-medium text-gray-900 outline-none focus:border-emerald-500"
                  placeholder="10-digit mobile number"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Status
                </label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-medium text-gray-900 outline-none focus:border-emerald-500 bg-white"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-gray-150">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingUser}
                onClick={handleSaveEdit}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm disabled:opacity-60"
              >
                {savingUser ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-150 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
              <TrashIcon className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1.5">Delete User?</h3>
            <p className="text-xs text-gray-500 mb-6">
              Are you sure you want to delete <span className="font-bold text-gray-800">{deletingUser.name}</span>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-sm disabled:opacity-60"
              >
                {isDeleting ? "Deleting..." : "Delete User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
