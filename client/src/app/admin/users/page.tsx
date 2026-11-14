"use client";

import { useEffect, useState, useCallback } from "react";
import {
  UserGroupIcon,
  CheckBadgeIcon,
  SparklesIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  ClockIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowUturnLeftIcon,
} from "@heroicons/react/24/outline";
import { formatIndianPhoneNumber } from "@/lib/phoneFormatter";

interface DevoteeUser {
  _id: string;
  name: string;
  email: string;
  mobileNumber: string;
  whatsappNumber?: string;
  totalAmountSpent: number;
  status: "Active" | "Inactive";
  isVerified: boolean;
  utmSource?: string;
  utmCampaign?: string;
  createdAt: string;
  deletedAt?: string | null;
  isDeleted?: boolean;
}

interface StatsData {
  totalUsers: number;
  activeUsers: number;
  trashUsers?: number;
  totalRevenue: number;
}

export default function AdminUsersPage() {
  // Core Data State (Simplified from 18 states down to essential data)
  const [users, setUsers] = useState<DevoteeUser[]>([]);
  const [stats, setStats] = useState<StatsData>({
    totalUsers: 0,
    activeUsers: 0,
    trashUsers: 0,
    totalRevenue: 0,
  });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter State
  const [activeTab, setActiveTab] = useState<"active" | "trash">("active");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("latest");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // UI Dropdowns
  const [dateFilterOpen, setDateFilterOpen] = useState(false);

  // Selection for bulk actions
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Modals & Notifications
  const [editingUser, setEditingUser] = useState<DevoteeUser | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    whatsappNumber: "",
    status: "Active",
  });
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    description: string;
    actionLabel: string;
    actionType: "soft-delete" | "bulk-soft-delete" | "restore" | "bulk-restore" | "permanent-delete" | "bulk-permanent-delete";
    targetUser?: DevoteeUser;
  }>({
    open: false,
    title: "",
    description: "",
    actionLabel: "",
    actionType: "soft-delete",
  });
  const [modalLoading, setModalLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Helper to get Auth Headers (credentials: "include" sends the HttpOnly cookie automatically)
  const getHeaders = useCallback((): Record<string, string> => {
    return { "Content-Type": "application/json" };
  }, []);

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";
      const params = new URLSearchParams({
        page: String(pagination.page),
        limit: "10",
        search: search.trim(),
        sort: sortBy,
        trash: activeTab === "trash" ? "true" : "false",
      });
      if (statusFilter !== "All") params.append("status", statusFilter);
      if (fromDate) params.append("fromDate", fromDate);
      if (toDate) params.append("toDate", toDate);

      const res = await fetch(`${baseUrl}/api/admin/users?${params.toString()}`, {
        headers: getHeaders(),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to load users list");

      const resData = await res.json();
      if (resData.success && resData.data) {
        setUsers(resData.data.users || []);
        if (resData.data.pagination) {
          setPagination((prev) => ({
            ...prev,
            total: resData.data.pagination.total ?? 0,
            totalPages: resData.data.pagination.totalPages ?? 1,
          }));
        }
        if (resData.data.stats) {
          setStats(resData.data.stats);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, search, statusFilter, sortBy, fromDate, toDate, activeTab, getHeaders]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  // Reset page & selection on tab change
  const handleTabChange = (tab: "active" | "trash") => {
    setActiveTab(tab);
    setSelectedUserIds([]);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Selection handlers
  const isAllSelected = users.length > 0 && selectedUserIds.length === users.length;
  const isPartiallySelected = selectedUserIds.length > 0 && selectedUserIds.length < users.length;

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedUserIds(e.target.checked ? users.map((u) => u._id) : []);
  };

  const handleSelectOne = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Edit user handlers
  const handleOpenEdit = (user: DevoteeUser) => {
    setEditingUser(user);
    setEditFormData({
      name: user.name || "",
      email: user.email === "N/A" ? "" : user.email || "",
      mobileNumber: user.mobileNumber || "",
      whatsappNumber: user.whatsappNumber || "",
      status: user.status || "Active",
    });
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    if (!editFormData.name.trim() || !editFormData.mobileNumber.trim()) {
      showToast("Name and Mobile Number are required", "error");
      return;
    }

    setModalLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";
      const res = await fetch(`${baseUrl}/api/admin/users/${editingUser._id}`, {
        method: "PUT",
        headers: getHeaders(),
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
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to update user");

      showToast("User updated successfully", "success");
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || "Error updating user", "error");
    } finally {
      setModalLoading(false);
    }
  };

  // Confirmation action handler
  const handleExecuteModalAction = async () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";
    setModalLoading(true);
    try {
      let endpoint = "";
      let method = "POST";
      let body: any = null;

      const { actionType, targetUser } = confirmModal;

      if (actionType === "soft-delete" && targetUser) {
        endpoint = `${baseUrl}/api/admin/users/${targetUser._id}`;
        method = "DELETE";
      } else if (actionType === "bulk-soft-delete") {
        endpoint = `${baseUrl}/api/admin/users/bulk-delete`;
        body = JSON.stringify({ userIds: selectedUserIds });
      } else if (actionType === "restore" && targetUser) {
        endpoint = `${baseUrl}/api/admin/users/${targetUser._id}/restore`;
        method = "PUT";
      } else if (actionType === "bulk-restore") {
        endpoint = `${baseUrl}/api/admin/users/bulk-restore`;
        body = JSON.stringify({ userIds: selectedUserIds });
      } else if (actionType === "permanent-delete" && targetUser) {
        endpoint = `${baseUrl}/api/admin/users/${targetUser._id}/permanent`;
        method = "DELETE";
      } else if (actionType === "bulk-permanent-delete") {
        endpoint = `${baseUrl}/api/admin/users/bulk-permanent-delete`;
        body = JSON.stringify({ userIds: selectedUserIds });
      }

      const res = await fetch(endpoint, {
        method,
        headers: getHeaders(),
        credentials: "include",
        body,
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Action failed");

      showToast("Action completed successfully", "success");
      setConfirmModal((prev) => ({ ...prev, open: false }));
      setSelectedUserIds([]);
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || "Failed to perform action", "error");
    } finally {
      setModalLoading(false);
    }
  };

  // Format Date helper
  const formatDate = (isoStr?: string | null) => {
    if (!isoStr) return { datePart: "-", timePart: "" };
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return { datePart: "-", timePart: "" };
      return {
        datePart: d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        timePart: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }).toLowerCase(),
      };
    } catch {
      return { datePart: "-", timePart: "" };
    }
  };

  // Avatar bg
  const getAvatarBg = (name: string, index: number) => {
    const colors = [
      "bg-purple-100 text-purple-700",
      "bg-blue-100 text-blue-700",
      "bg-emerald-100 text-emerald-700",
      "bg-amber-100 text-amber-700",
      "bg-cyan-100 text-cyan-700",
      "bg-indigo-100 text-indigo-700",
    ];
    let code = 0;
    for (let i = 0; i < (name || "").length; i++) code += name.charCodeAt(i);
    return colors[(code + index) % colors.length];
  };

  return (
    <div className="space-y-6 pb-12">
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

      {/* Top Header & Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            placeholder="Search by name, email, or mobile..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-emerald-500 shadow-2xs font-medium"
          />
        </div>

        {/* Action Controls & Tab Pills */}
        <div className="flex flex-wrap items-center gap-3 justify-end">
          {/* Active vs Trash Tab Toggle */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 shadow-2xs">
            <button
              type="button"
              onClick={() => handleTabChange("active")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === "active" ? "bg-white text-gray-900 shadow-xs" : "text-gray-600 hover:text-gray-900"
                }`}
            >
              All Users ({stats.totalUsers})
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("trash")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === "trash" ? "bg-red-50 text-red-700 shadow-xs" : "text-gray-600 hover:text-red-600"
                }`}
            >
              <TrashIcon className="w-3.5 h-3.5" />
              <span>Trash ({stats.trashUsers || 0})</span>
            </button>
          </div>

          {/* Date Range Filter Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setDateFilterOpen(!dateFilterOpen)}
              className={`flex items-center gap-2 bg-white border rounded-xl px-3 py-1.5 text-xs font-bold transition shadow-2xs ${fromDate || toDate
                  ? "border-emerald-500 text-emerald-700 bg-emerald-50/30"
                  : "border-gray-200 text-gray-700 hover:border-gray-300"
                }`}
            >
              <CalendarDaysIcon className="w-4 h-4 text-gray-400" />
              <span>
                {fromDate && toDate
                  ? `${fromDate} to ${toDate}`
                  : fromDate
                    ? `From ${fromDate}`
                    : toDate
                      ? `Until ${toDate}`
                      : "Filter by Date"}
              </span>
              <ChevronDownIcon className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {dateFilterOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-2xl shadow-xl p-4 z-30">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-100">
                  <span className="text-xs font-bold text-gray-800">
                    {activeTab === "trash" ? "Deleted Date Range" : "Registration Date Range"}
                  </span>
                  {(fromDate || toDate) && (
                    <button
                      type="button"
                      onClick={() => {
                        setFromDate("");
                        setToDate("");
                        setPagination((p) => ({ ...p, page: 1 }));
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
                        setPagination((p) => ({ ...p, page: 1 }));
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
                        setPagination((p) => ({ ...p, page: 1 }));
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
                      setPagination((p) => ({ ...p, page: 1 }));
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
            <span className="block text-xs font-semibold text-gray-500">Active Users</span>
            <span className="text-2xl font-black text-gray-900 tracking-tight">
              {stats.totalUsers.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* Active Verified Users */}
        <div className="bg-white rounded-2xl border border-gray-150 p-5 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckBadgeIcon className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-gray-500">Verified Devotees</span>
            <span className="text-2xl font-black text-gray-900 tracking-tight">
              {stats.activeUsers.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-2xl border border-gray-150 p-5 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <SparklesIcon className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-gray-500">Total Devotee Offerings</span>
            <span className="text-2xl font-black text-gray-900 tracking-tight">
              ₹ {stats.totalRevenue.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-gray-150 shadow-xs overflow-hidden">
        {/* Subheader: Filter Dropdowns */}
        <div className="p-4 sm:px-6 border-b border-gray-150 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-gray-800">
            {activeTab === "trash" ? "Deleted Users (Trash)" : "Devotee Directory"}
          </h2>

          <div className="flex items-center gap-2.5">
            {/* Status Select */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className="bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-700 outline-none hover:border-gray-300 transition cursor-pointer"
            >
              <option value="All">All Users</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            {/* Sort Select */}
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className="bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-700 outline-none hover:border-gray-300 transition cursor-pointer"
            >
              <option value="latest">Sort by: Latest</option>
              <option value="oldest">Sort by: Oldest</option>
              <option value="name_asc">Name (A-Z)</option>
              <option value="name_desc">Name (Z-A)</option>
            </select>
          </div>
        </div>

        {/* Bulk Action Banner */}
        {selectedUserIds.length > 0 && (
          <div className="bg-emerald-50/80 border-b border-emerald-200/80 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black">
                {selectedUserIds.length}
              </span>
              <span className="text-xs font-bold text-emerald-900">
                {selectedUserIds.length === 1 ? "1 user selected" : `${selectedUserIds.length} users selected`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedUserIds([])}
                className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-xs font-bold transition"
              >
                Clear
              </button>

              {activeTab === "active" ? (
                <button
                  type="button"
                  onClick={() =>
                    setConfirmModal({
                      open: true,
                      title: `Move ${selectedUserIds.length} User(s) to Trash?`,
                      description: `Are you sure you want to move the selected ${selectedUserIds.length} user(s) to Trash?`,
                      actionLabel: "Move to Trash",
                      actionType: "bulk-soft-delete",
                    })
                  }
                  className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                  <span>Move to Trash</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setConfirmModal({
                        open: true,
                        title: `Restore ${selectedUserIds.length} User(s)?`,
                        description: `Restore selected ${selectedUserIds.length} user(s) back to active users?`,
                        actionLabel: "Restore Users",
                        actionType: "bulk-restore",
                      })
                    }
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                  >
                    <ArrowUturnLeftIcon className="w-3.5 h-3.5" />
                    <span>Restore</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setConfirmModal({
                        open: true,
                        title: `Permanently Delete ${selectedUserIds.length} User(s)?`,
                        description: `WARNING: This will permanently delete ${selectedUserIds.length} user(s). This cannot be undone.`,
                        actionLabel: "Delete Permanently",
                        actionType: "bulk-permanent-delete",
                      })
                    }
                    className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                    <span>Delete Permanently</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-150 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3.5 pl-6 pr-2 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isPartiallySelected;
                    }}
                    onChange={handleSelectAll}
                    disabled={users.length === 0}
                    className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer disabled:cursor-not-allowed"
                  />
                </th>
                <th className="py-3.5 px-2 w-10 text-center">#</th>
                <th className="py-3.5 px-4">User Name</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[140px]">Mobile Number</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Source / Campaign</th>
                <th className="py-3.5 px-4">Total Amount Spent</th>
                <th className="py-3.5 px-4">
                  {activeTab === "trash" ? "Deleted On (Date & Time)" : "Joined On (Date & Time)"}
                </th>
                <th className="py-3.5 pr-6 pl-4 text-center w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-gray-400">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      <span>Loading registered users...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-gray-400">
                    {activeTab === "trash" ? "Trash is empty. No deleted users found." : "No users found."}
                  </td>
                </tr>
              ) : (
                users.map((u, idx) => {
                  const initial = (u.name || "D").charAt(0).toUpperCase();
                  const avatarColor = getAvatarBg(u.name, idx);
                  const rowNumber = (pagination.page - 1) * 10 + idx + 1;
                  const isChecked = selectedUserIds.includes(u._id);

                  return (
                    <tr
                      key={u._id}
                      className={`hover:bg-gray-50/80 transition-colors duration-150 ${isChecked ? "bg-emerald-50/40" : ""
                        }`}
                    >
                      {/* Checkbox */}
                      <td className="py-4 pl-6 pr-2 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleSelectOne(u._id)}
                          className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                      </td>

                      {/* Row # */}
                      <td className="py-4 px-2 text-center text-gray-400 font-bold text-xs">{rowNumber}</td>

                      {/* Name */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 ${avatarColor}`}
                          >
                            {initial}
                          </div>
                          <span className="font-bold text-gray-900 truncate max-w-[170px]">
                            {u.name || "Devotee"}
                          </span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-4 px-4 text-gray-600">
                        {u.email && u.email !== "N/A" ? u.email : <span className="text-gray-400 italic">Not Provided</span>}
                      </td>

                      {/* Mobile */}
                      <td className="py-4 px-4 whitespace-nowrap min-w-[140px]">
                        <div className="font-semibold text-gray-800">
                          {u.mobileNumber && u.mobileNumber !== "N/A"
                            ? formatIndianPhoneNumber(u.mobileNumber)
                            : <span className="text-gray-400 italic">Not Provided</span>}
                        </div>
                      </td>

                      {/* Source */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10.5px] font-bold border bg-gray-100 text-gray-700 border-gray-200">
                          {u.utmSource || "Direct"}
                        </span>
                      </td>

                      {/* Spent */}
                      <td className="py-4 px-4 font-extrabold text-gray-900">
                        ₹ {Number(u.totalAmountSpent || 0).toLocaleString("en-IN")}
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 text-gray-500 font-medium">
                        {(() => {
                          const timeInfo = formatDate(activeTab === "trash" ? u.deletedAt || u.createdAt : u.createdAt);
                          return (
                            <div className="space-y-0.5">
                              <div className="font-bold text-gray-900 flex items-center gap-1">
                                <CalendarDaysIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                <span>{timeInfo.datePart}</span>
                              </div>
                              {timeInfo.timePart && (
                                <div className="text-[11px] font-semibold text-gray-500 flex items-center gap-1">
                                  <ClockIcon className="w-3 h-3 text-gray-400 shrink-0" />
                                  <span>{timeInfo.timePart}</span>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </td>

                      {/* Actions */}
                      <td className="py-4 pr-6 pl-4 text-center">
                        {activeTab === "active" ? (
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(u)}
                              title="Edit user"
                              className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-colors"
                            >
                              <PencilSquareIcon className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setConfirmModal({
                                  open: true,
                                  title: "Move User to Trash?",
                                  description: `Are you sure you want to move ${u.name} to Trash?`,
                                  actionLabel: "Move to Trash",
                                  actionType: "soft-delete",
                                  targetUser: u,
                                })
                              }
                              title="Move to trash"
                              className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-colors"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setConfirmModal({
                                  open: true,
                                  title: "Restore User?",
                                  description: `Restore devotee account for ${u.name}?`,
                                  actionLabel: "Restore User",
                                  actionType: "restore",
                                  targetUser: u,
                                })
                              }
                              title="Restore user"
                              className="w-8 h-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 flex items-center justify-center transition-colors"
                            >
                              <ArrowUturnLeftIcon className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setConfirmModal({
                                  open: true,
                                  title: "Permanently Delete User?",
                                  description: `WARNING: Are you sure you want to permanently delete ${u.name}? This cannot be undone.`,
                                  actionLabel: "Delete Permanently",
                                  actionType: "permanent-delete",
                                  targetUser: u,
                                })
                              }
                              title="Delete permanently"
                              className="w-8 h-8 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 flex items-center justify-center transition-colors"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        )}
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
            Showing {users.length > 0 ? (pagination.page - 1) * 10 + 1 : 0} to{" "}
            {Math.min(pagination.page * 10, pagination.total)} of {pagination.total}{" "}
            {activeTab === "trash" ? "trash users" : "users"}
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => setPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
                className="w-8 h-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPagination((prev) => ({ ...prev, page: p }))}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition ${pagination.page === p
                      ? "bg-emerald-600 text-white"
                      : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  {p}
                </button>
              ))}

              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPagination((p) => ({ ...p, page: Math.min(p.totalPages, p.page + 1) }))}
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
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Email Address</label>
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
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Status</label>
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
                disabled={modalLoading}
                onClick={handleSaveEdit}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm disabled:opacity-60"
              >
                {modalLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.open && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-150 text-center animate-in fade-in zoom-in-95 duration-200">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${confirmModal.actionType.includes("restore") ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                }`}
            >
              {confirmModal.actionType.includes("restore") ? (
                <ArrowUturnLeftIcon className="w-6 h-6" />
              ) : (
                <TrashIcon className="w-6 h-6" />
              )}
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1.5">{confirmModal.title}</h3>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">{confirmModal.description}</p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={modalLoading}
                onClick={() => setConfirmModal({ ...confirmModal, open: false })}
                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={modalLoading}
                onClick={handleExecuteModalAction}
                className={`flex-1 px-4 py-2 rounded-xl text-white text-xs font-bold transition shadow-sm disabled:opacity-60 ${confirmModal.actionType.includes("restore")
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-red-600 hover:bg-red-700"
                  }`}
              >
                {modalLoading ? "Processing..." : confirmModal.actionLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
