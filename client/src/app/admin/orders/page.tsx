"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ChevronDownIcon,
  CheckIcon,
  SparklesIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; dot: string; border: string }
> = {
  created: {
    label: "Created",
    bg: "bg-slate-50",
    text: "text-slate-700",
    dot: "bg-slate-400",
    border: "border-slate-200",
  },
  confirmed: {
    label: "Confirmed",
    bg: "bg-sky-50",
    text: "text-sky-700",
    dot: "bg-sky-500",
    border: "border-sky-200",
  },
  scheduled: {
    label: "Scheduled",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
    border: "border-amber-200",
  },
  performed: {
    label: "Performed",
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    dot: "bg-indigo-500",
    border: "border-indigo-200",
  },
  completed: {
    label: "Completed",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    border: "border-emerald-200",
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-rose-50",
    text: "text-rose-700",
    dot: "bg-rose-500",
    border: "border-rose-200",
  },
  refunded: {
    label: "Refunded",
    bg: "bg-purple-50",
    text: "text-purple-700",
    dot: "bg-purple-500",
    border: "border-purple-200",
  },
};

const STATUS_ACTION_OPTIONS = [
  { id: "scheduled", label: "Scheduled", color: "text-amber-700 bg-amber-50 hover:bg-amber-100" },
  { id: "performed", label: "Performed", color: "text-indigo-700 bg-indigo-50 hover:bg-indigo-100" },
  { id: "completed", label: "Completed", color: "text-emerald-700 bg-emerald-50 hover:bg-emerald-100" },
  { id: "confirmed", label: "Confirmed", color: "text-sky-700 bg-sky-50 hover:bg-sky-100" },
  { id: "cancelled", label: "Cancelled", color: "text-rose-700 bg-rose-50 hover:bg-rose-100" },
];

function StatusDropdown({
  currentStatus,
  onChange,
}: {
  currentStatus: string;
  onChange: (status: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const normalized = (currentStatus || "created").toLowerCase();
  const current = STATUS_CONFIG[normalized] || STATUS_CONFIG.created;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const options = Object.keys(STATUS_CONFIG);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${current.bg} ${current.text} ${current.border} hover:brightness-95 transition-all shadow-2xs`}
      >
        <span className={`w-2 h-2 rounded-full ${current.dot}`} />
        <span>{current.label}</span>
        <ChevronDownIcon className="w-3.5 h-3.5 opacity-60 ml-0.5" />
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-1.5 w-44 rounded-xl bg-white shadow-xl border border-gray-150 py-1.5 focus:outline-none animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 mb-1">
            Update Status
          </div>
          {options.map((opt) => {
            const conf = STATUS_CONFIG[opt];
            const isSelected = opt === normalized;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-gray-50 transition ${
                  isSelected ? "font-bold text-gray-900 bg-gray-50" : "text-gray-600"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${conf.dot}`} />
                  <span>{conf.label}</span>
                </div>
                {isSelected && <CheckIcon className="w-4 h-4 text-emerald-600" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface OrderData {
  _id: string;
  orderNumber: string;
  serviceName?: string;
  serviceType?: string;
  devoteeName?: string;
  customerName?: string;
  mobileNumber?: string;
  whatsappNumber?: string;
  gotra?: string;
  orderStatus: string;
  paymentStatus: string;
  scheduledDate?: string;
  performedDate?: string;
  videoLink?: string;
  pricing?: {
    total?: number;
  };
}

export default function AdminOrdersPage() {
  const [data, setData] = useState<{
    orders: OrderData[];
    totalOrders: number;
    totalPages: number;
    limit: number;
    services: string[];
    statuses: string[];
  }>({
    orders: [],
    totalOrders: 0,
    totalPages: 1,
    limit: 10,
    services: ["All"],
    statuses: ["All"],
  });

  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedService, setSelectedService] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Checkbox multi-selection for bulk status updates
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [bulkStatusDropdownOpen, setBulkStatusDropdownOpen] = useState(false);
  const bulkDropdownRef = useRef<HTMLDivElement>(null);

  // Status Prompt Modal state (for Scheduled Date, Performed Date, Video Link)
  const [statusPromptModal, setStatusPromptModal] = useState<{
    open: boolean;
    status: "scheduled" | "performed" | "completed";
    mode: "single" | "bulk";
    targetOrderId?: string;
    dateValue: string;
    videoLinkValue: string;
  }>({
    open: false,
    status: "scheduled",
    mode: "single",
    dateValue: new Date().toISOString().split("T")[0],
    videoLinkValue: "",
  });

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const getAdminAuthHeaders = (): Record<string, string> => {
    try {
      const match = document.cookie.match(/(?:^|;\s*)adminToken=([^;]*)/);
      const token = match ? match[1] : localStorage.getItem("adminToken");
      if (token) return { Authorization: `Bearer ${token}` };
    } catch {}
    return {};
  };

  const fetchOrders = useCallback(async (page: number, service: string, status: string, query: string) => {
    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });
      if (service !== "All") params.append("service", service);
      if (status !== "All") params.append("status", status);
      if (query.trim()) params.append("search", query.trim());

      const headers = getAdminAuthHeaders();
      const res = await fetch(`${baseUrl}/api/admin/orders?${params.toString()}`, {
        credentials: "include",
        headers,
      });
      if (res.ok) {
        const result = await res.json();
        if (result.success && Array.isArray(result.data)) {
          setData({
            orders: result.data,
            totalOrders: result.totalOrders || result.data.length,
            totalPages: result.totalPages || 1,
            limit: result.limit || 10,
            services: result.services || ["All"],
            statuses: result.statuses || ["All"],
          });
        }
      }
    } catch (err) {
      console.error("Error fetching admin orders:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchOrders(currentPage, selectedService, selectedStatus, searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [currentPage, selectedService, selectedStatus, searchQuery, fetchOrders]);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedOrderIds([]);
  }, [selectedService, selectedStatus, searchQuery]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (bulkDropdownRef.current && !bulkDropdownRef.current.contains(e.target as Node)) {
        setBulkStatusDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Multi-select handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedOrderIds(data.orders.map((o) => o._id));
    } else {
      setSelectedOrderIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const isAllSelected = data.orders.length > 0 && selectedOrderIds.length === data.orders.length;
  const isPartiallySelected = selectedOrderIds.length > 0 && selectedOrderIds.length < data.orders.length;

  // Intercept status changes to ask for date or video link when needed
  const requestStatusChange = (orderId: string, newStatus: string) => {
    if (newStatus === "scheduled") {
      const existing = data.orders.find((o) => o._id === orderId);
      setStatusPromptModal({
        open: true,
        status: "scheduled",
        mode: "single",
        targetOrderId: orderId,
        dateValue: existing?.scheduledDate ? new Date(existing.scheduledDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        videoLinkValue: "",
      });
      return;
    }
    if (newStatus === "performed") {
      const existing = data.orders.find((o) => o._id === orderId);
      setStatusPromptModal({
        open: true,
        status: "performed",
        mode: "single",
        targetOrderId: orderId,
        dateValue: existing?.performedDate ? new Date(existing.performedDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        videoLinkValue: "",
      });
      return;
    }
    if (newStatus === "completed") {
      const existing = data.orders.find((o) => o._id === orderId);
      setStatusPromptModal({
        open: true,
        status: "completed",
        mode: "single",
        targetOrderId: orderId,
        dateValue: "",
        videoLinkValue: existing?.videoLink || "",
      });
      return;
    }
    executeStatusChange(orderId, newStatus);
  };

  const requestBulkStatusChange = (newStatus: string) => {
    if (selectedOrderIds.length === 0 && selectedService === "All") {
      showToast("Please select orders or choose a specific service to bulk update", "error");
      return;
    }
    if (newStatus === "scheduled") {
      setStatusPromptModal({
        open: true,
        status: "scheduled",
        mode: "bulk",
        dateValue: new Date().toISOString().split("T")[0],
        videoLinkValue: "",
      });
      return;
    }
    if (newStatus === "performed") {
      setStatusPromptModal({
        open: true,
        status: "performed",
        mode: "bulk",
        dateValue: new Date().toISOString().split("T")[0],
        videoLinkValue: "",
      });
      return;
    }
    if (newStatus === "completed") {
      setStatusPromptModal({
        open: true,
        status: "completed",
        mode: "bulk",
        dateValue: "",
        videoLinkValue: "",
      });
      return;
    }
    executeBulkStatusChange(newStatus);
  };

  const handleModalSubmit = async () => {
    const { status, mode, targetOrderId, dateValue, videoLinkValue } = statusPromptModal;
    setStatusPromptModal((prev) => ({ ...prev, open: false }));

    const payload: any = { orderStatus: status };
    if (status === "scheduled") {
      payload.scheduledDate = dateValue ? new Date(dateValue).toISOString() : new Date().toISOString();
    } else if (status === "performed") {
      payload.performedDate = dateValue ? new Date(dateValue).toISOString() : new Date().toISOString();
    } else if (status === "completed") {
      payload.videoLink = videoLinkValue.trim();
    }

    if (mode === "single" && targetOrderId) {
      await executeStatusChange(targetOrderId, status, payload);
    } else if (mode === "bulk") {
      await executeBulkStatusChange(status, payload);
    }
  };

  // Single status change execution
  const executeStatusChange = async (orderId: string, newStatus: string, extraPayload: any = {}) => {
    // Optimistic UI update
    setData((prev) => ({
      ...prev,
      orders: prev.orders.map((ord) => {
        if (ord._id === orderId) {
          return { ...ord, orderStatus: newStatus, ...extraPayload };
        }
        return ord;
      }),
    }));

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";
      const res = await fetch(`${baseUrl}/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAdminAuthHeaders(),
        },
        credentials: "include",
        body: JSON.stringify({
          orderStatus: newStatus,
          ...extraPayload,
        }),
      });
      if (res.ok) {
        showToast(`Order status updated to ${newStatus}`);
      } else {
        fetchOrders(currentPage, selectedService, selectedStatus, searchQuery);
      }
    } catch (err) {
      console.error("Failed to update order status:", err);
      fetchOrders(currentPage, selectedService, selectedStatus, searchQuery);
    }
  };

  // Bulk status update execution
  const executeBulkStatusChange = async (newStatus: string, extraPayload: any = {}) => {
    if (selectedOrderIds.length === 0 && selectedService === "All") {
      showToast("Please select orders or choose a specific service to bulk update", "error");
      return;
    }

    setBulkActionLoading(true);
    setBulkStatusDropdownOpen(false);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";
      const payload: any = {
        orderStatus: newStatus,
        ...extraPayload,
      };

      if (selectedOrderIds.length > 0) {
        payload.orderIds = selectedOrderIds;
      } else if (selectedService !== "All") {
        payload.service = selectedService;
      }

      const res = await fetch(`${baseUrl}/api/admin/orders/bulk-status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAdminAuthHeaders(),
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        showToast(resData.message || `Status updated to ${newStatus}`);
        setSelectedOrderIds([]);
        fetchOrders(currentPage, selectedService, selectedStatus, searchQuery);
      } else {
        showToast(resData.message || "Failed to bulk update status", "error");
      }
    } catch (err) {
      console.error("Bulk status change error:", err);
      showToast("Error updating status in bulk", "error");
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleScheduleChange = async (orderId: string, dateStr: string) => {
    if (!dateStr) return;

    const selectedDate = new Date(dateStr);
    const newStatus = "scheduled";

    setData((prev) => ({
      ...prev,
      orders: prev.orders.map((ord) => {
        if (ord._id === orderId) {
          return { ...ord, orderStatus: newStatus, scheduledDate: selectedDate.toISOString() };
        }
        return ord;
      }),
    }));

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";
      const res = await fetch(`${baseUrl}/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAdminAuthHeaders(),
        },
        credentials: "include",
        body: JSON.stringify({
          orderStatus: newStatus,
          scheduledDate: selectedDate.toISOString(),
        }),
      });
      if (!res.ok) {
        fetchOrders(currentPage, selectedService, selectedStatus, searchQuery);
      }
    } catch (err) {
      console.error("Failed to update schedule:", err);
      fetchOrders(currentPage, selectedService, selectedStatus, searchQuery);
    }
  };

  const handleBulkSchedule = async (dateStr: string) => {
    if (!dateStr || selectedService === "All") return;

    if (!confirm(`Are you sure you want to schedule ALL orders for "${selectedService}" to ${dateStr}?`)) {
      return;
    }

    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";
      const res = await fetch(`${baseUrl}/api/admin/orders/bulk-schedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAdminAuthHeaders(),
        },
        credentials: "include",
        body: JSON.stringify({
          service: selectedService,
          scheduledDate: new Date(dateStr).toISOString(),
        }),
      });

      if (res.ok) {
        showToast(`All "${selectedService}" orders scheduled to ${dateStr}`);
        fetchOrders(currentPage, selectedService, selectedStatus, searchQuery);
      } else {
        showToast("Failed to bulk schedule", "error");
      }
    } catch (err) {
      console.error("Bulk schedule error:", err);
      showToast("Error occurred while bulk scheduling", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-xs font-bold text-white transition-all transform animate-in slide-in-from-bottom-5 ${
            toast.type === "success" ? "bg-emerald-600" : "bg-red-600"
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

      {/* Header Bar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Orders &amp; Bookings</h1>
            <span className="text-xs font-bold bg-[#e8f5e9] text-success px-2.5 py-0.5 rounded-full whitespace-nowrap">
              {data.totalOrders} Bookings
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Manage ritual bookings, update single or bulk statuses (Scheduled, Performed, Completed), and schedule dates.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search devotee or order ID..."
              className="bg-white border border-gray-300 text-gray-900 text-xs rounded-xl focus:ring-success focus:border-success block w-[230px] pl-3 pr-8 py-2.5 outline-none transition shadow-2xs font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <MagnifyingGlassIcon className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          {/* Service Filter */}
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="bg-white border border-gray-300 text-gray-900 text-xs font-bold rounded-xl focus:ring-success focus:border-success block px-3 py-2.5 outline-none shadow-2xs cursor-pointer"
          >
            {data.services.map((service) => (
              <option key={service} value={service}>
                {service === "All" ? "All Services" : service}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-white border border-gray-300 text-gray-900 text-xs font-bold rounded-xl focus:ring-success focus:border-success block px-3 py-2.5 outline-none shadow-2xs cursor-pointer"
          >
            {data.statuses.map((st) => (
              <option key={st} value={st}>
                {st === "All" ? "All Statuses" : st.toUpperCase()}
              </option>
            ))}
          </select>

          {/* Bulk Schedule when a specific service is chosen */}
          {selectedService !== "All" && (
            <div className="flex items-center bg-blue-50 border border-blue-200 rounded-xl shadow-2xs overflow-hidden">
              <span className="px-2.5 py-1.5 text-[11px] font-bold text-blue-700 border-r border-blue-200 bg-blue-100/60">
                Bulk Date:
              </span>
              <input
                type="date"
                title={`Schedule all ${selectedService} orders`}
                className="bg-transparent text-blue-900 text-xs font-semibold px-2 py-1 outline-none cursor-pointer hover:bg-blue-100 transition"
                onChange={(e) => {
                  handleBulkSchedule(e.target.value);
                  e.target.value = "";
                }}
              />
            </div>
          )}

          {/* One-Click Bulk Status Update for Selected Puja/Homa */}
          {selectedService !== "All" && selectedOrderIds.length === 0 && (
            <div className="flex items-center gap-1.5 bg-emerald-50/70 p-1 rounded-xl border border-emerald-200">
              <span className="text-[10px] font-extrabold uppercase text-emerald-800 px-1.5">
                Bulk Status:
              </span>
              {["scheduled", "performed", "completed"].map((st) => (
                <button
                  key={st}
                  type="button"
                  disabled={bulkActionLoading}
                  onClick={() => requestBulkStatusChange(st)}
                  className="px-2 py-1 rounded-lg text-[11px] font-bold bg-white text-emerald-800 hover:bg-emerald-600 hover:text-white border border-emerald-200 shadow-2xs transition active:scale-95 disabled:opacity-50"
                >
                  {st.charAt(0).toUpperCase() + st.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        {/* Bulk Action Toolbar when orders are selected via checkboxes */}
        {selectedOrderIds.length > 0 && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black">
                {selectedOrderIds.length}
              </span>
              <span className="text-xs font-bold text-emerald-900">
                {selectedOrderIds.length === 1 ? "1 order selected" : `${selectedOrderIds.length} orders selected`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedOrderIds([])}
                className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-xs font-bold transition"
              >
                Clear
              </button>

              {/* 1-Click Fast Bulk Status Buttons */}
              <div className="flex items-center gap-1.5">
                {STATUS_ACTION_OPTIONS.slice(0, 3).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={bulkActionLoading}
                    onClick={() => requestBulkStatusChange(opt.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-xs border border-transparent disabled:opacity-50 ${opt.color}`}
                  >
                    Mark {opt.label}
                  </button>
                ))}

                {/* More Status Options dropdown */}
                <div className="relative" ref={bulkDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setBulkStatusDropdownOpen(!bulkStatusDropdownOpen)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold transition shadow-xs"
                  >
                    <span>More Status</span>
                    <ChevronDownIcon className="w-3.5 h-3.5" />
                  </button>

                  {bulkStatusDropdownOpen && (
                    <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-xl py-1.5 z-30">
                      {STATUS_ACTION_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => requestBulkStatusChange(opt.id)}
                          className="w-full text-left px-3.5 py-1.5 text-xs font-bold hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                        >
                          <span className={`w-2 h-2 rounded-full ${STATUS_CONFIG[opt.id]?.dot || "bg-gray-400"}`} />
                          <span>Mark as {opt.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile View */}
        <div className="md:hidden flex flex-col divide-y divide-gray-100">
          {data.orders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No orders found.</div>
          ) : (
            data.orders.map((ord) => {
              const serviceName = ord.serviceName || "Sacred Ritual";
              const devoteeName = ord.devoteeName || "Devotee";
              const statusText = ord.orderStatus || ord.paymentStatus || "pending";
              const isChecked = selectedOrderIds.includes(ord._id);

              return (
                <div key={ord._id} className={`p-4 space-y-4 ${isChecked ? "bg-emerald-50/40" : ""}`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleSelectOne(ord._id)}
                        className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <Link
                        href={`/admin/orders/${ord._id}`}
                        className="font-mono font-bold text-emerald-700 hover:underline text-xs"
                      >
                        {ord.orderNumber}
                      </Link>
                    </div>
                    <StatusDropdown
                      currentStatus={statusText}
                      onChange={(newStatus) => requestStatusChange(ord._id, newStatus)}
                    />
                  </div>
                  <Link href={`/admin/orders/${ord._id}`} className="block group">
                    <span className="font-bold text-gray-900 block text-sm group-hover:text-emerald-700 transition-colors">
                      {serviceName}
                    </span>
                  </Link>

                  <div className="text-xs space-y-1">
                    <span className="font-bold text-gray-900 block">{devoteeName}</span>
                    <span className="text-gray-500 block">{ord.mobileNumber}</span>
                  </div>

                  <div className="border-t border-gray-100 pt-3 mt-2 flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Schedule Puja</span>
                    <input
                      type="date"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-xs font-bold rounded-lg focus:ring-success focus:border-success block w-full p-2 outline-none cursor-pointer"
                      value={ord.scheduledDate ? new Date(ord.scheduledDate).toISOString().split("T")[0] : ""}
                      onChange={(e) => handleScheduleChange(ord._id, e.target.value)}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop View Table */}
        <div className="hidden md:block overflow-x-auto min-h-[350px]">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 uppercase text-[11px] font-bold tracking-wider">
              <tr>
                {/* Checkbox Header */}
                <th className="pl-6 pr-2 py-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isPartiallySelected;
                    }}
                    onChange={handleSelectAll}
                    disabled={data.orders.length === 0}
                    className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer disabled:cursor-not-allowed"
                  />
                </th>
                <th className="px-4 py-3.5 w-36">Order ID</th>
                <th className="px-4 py-3.5">Service</th>
                <th className="px-4 py-3.5">Devotee Details</th>
                <th className="px-4 py-3.5 w-24">Amount</th>
                <th className="px-4 py-3.5 w-36">Status</th>
                <th className="px-4 py-3.5 w-36 text-center">Schedule Puja</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    Loading orders...
                  </td>
                </tr>
              ) : data.orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                    No orders found.
                  </td>
                </tr>
              ) : (
                data.orders.map((ord) => {
                  const serviceName = ord.serviceName || "Sacred Ritual";
                  const devoteeName = ord.devoteeName || "Devotee";
                  const isChecked = selectedOrderIds.includes(ord._id);

                  return (
                    <tr
                      key={ord._id}
                      className={`hover:bg-gray-50/80 transition ${isChecked ? "bg-emerald-50/40" : ""}`}
                    >
                      {/* Checkbox Cell */}
                      <td className="pl-6 pr-2 py-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleSelectOne(ord._id)}
                          className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                      </td>

                      {/* 1. Order ID */}
                      <td className="px-4 py-3.5 font-mono font-bold text-gray-900">
                        <Link
                          href={`/admin/orders/${ord._id}`}
                          className="text-emerald-700 hover:text-emerald-900 hover:underline flex items-center gap-1"
                        >
                          {ord.orderNumber}
                        </Link>
                      </td>

                      {/* 2. Service Column */}
                      <td className="px-4 py-3.5">
                        <Link href={`/admin/orders/${ord._id}`} className="group block max-w-[200px]">
                          <span className="font-bold text-gray-900 block group-hover:text-emerald-700 transition-colors truncate">
                            {serviceName}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-emerald-600 block mt-0.5">
                            {ord.serviceType?.toUpperCase() || "PUJA"}
                          </span>
                        </Link>
                      </td>

                      {/* 3. Devotee Details Column */}
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-gray-900 block">{devoteeName}</span>
                        {(() => {
                          const mob = ord.mobileNumber || "";
                          const wa = ord.whatsappNumber || "";
                          const cleanMob = mob.replace(/\D/g, "");
                          const cleanWa = wa.replace(/\D/g, "");
                          const isSame =
                            cleanMob &&
                            cleanWa &&
                            (cleanMob === cleanWa || cleanMob.endsWith(cleanWa) || cleanWa.endsWith(cleanMob));

                          const fmtMob = mob ? (mob.startsWith("+") ? mob : "+91 " + mob) : "";
                          const fmtWa = wa
                            ? wa.startsWith("+")
                              ? wa
                              : wa.startsWith("91") && wa.length === 12
                              ? "+" + wa
                              : "+91 " + wa
                            : "";

                          return (
                            <div className="text-xs space-y-0.5 mt-0.5">
                              {fmtMob && <div className="text-gray-600 font-medium">{fmtMob}</div>}
                              {!isSame && fmtWa && (
                                <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
                                  <span className="text-[9px] bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                                    WA
                                  </span>
                                  <span>{fmtWa}</span>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                        <span className="text-[11px] text-gray-400 block mt-0.5">
                          Gotra: {ord.gotra || "Not Provided"}
                        </span>
                      </td>

                      {/* 4. Amount */}
                      <td className="px-4 py-3.5 font-extrabold text-gray-900">
                        ₹{ord.pricing?.total || 0}
                      </td>

                      {/* 5. Status Dropdown (Single Update) */}
                      <td className="px-4 py-3.5">
                        <StatusDropdown
                          currentStatus={ord.orderStatus}
                          onChange={(newStatus) => requestStatusChange(ord._id, newStatus)}
                        />
                      </td>

                      {/* 6. Schedule Puja Date Input */}
                      <td className="px-4 py-3.5 text-center">
                        <input
                          type="date"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-xs font-bold rounded-lg focus:ring-success focus:border-success block w-full p-2 outline-none cursor-pointer"
                          value={ord.scheduledDate ? new Date(ord.scheduledDate).toISOString().split("T")[0] : ""}
                          onChange={(e) => handleScheduleChange(ord._id, e.target.value)}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {data.totalOrders > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="text-xs text-gray-500 text-center sm:text-left">
              Showing{" "}
              <span className="font-bold text-gray-900">
                {data.totalOrders === 0 ? 0 : (currentPage - 1) * data.limit + 1}
              </span>{" "}
              to{" "}
              <span className="font-bold text-gray-900">
                {Math.min(currentPage * data.limit, data.totalOrders)}
              </span>{" "}
              of <span className="font-bold text-gray-900">{data.totalOrders}</span> Entries
            </div>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-md text-xs font-bold border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition shadow-sm"
              >
                Previous
              </button>
              <span className="text-xs font-bold text-gray-700 px-2">
                {currentPage} / {data.totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, data.totalPages))}
                disabled={currentPage === data.totalPages}
                className="px-3 py-1.5 rounded-md text-xs font-bold border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition shadow-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    
      {/* Status Prompt Modal (Scheduled Date / Performed Date / Video Link) */}
      {statusPromptModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden transform transition-all">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold capitalize">
                  {statusPromptModal.status === "scheduled" && "📅 Schedule Puja Date"}
                  {statusPromptModal.status === "performed" && "🔥 Puja Performed Date"}
                  {statusPromptModal.status === "completed" && "🎥 Puja Video Link & Complete"}
                </h3>
                <p className="text-xs text-emerald-100 mt-0.5">
                  {statusPromptModal.mode === "bulk"
                    ? (selectedOrderIds.length > 0 ? "Updating " + selectedOrderIds.length + " selected orders" : "Updating all orders for " + selectedService)
                    : "Update order status & details"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStatusPromptModal((prev) => ({ ...prev, open: false }))}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {statusPromptModal.status === "scheduled" && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Select Scheduled Muhurat Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={statusPromptModal.dateValue}
                    onChange={(e) => setStatusPromptModal((prev) => ({ ...prev, dateValue: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-semibold text-gray-900 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none transition cursor-pointer"
                  />
                  <p className="text-[11px] text-gray-500 mt-1.5">
                    This date will be displayed in the devotee&apos;s <strong>Puja Journey (Step 3: Puja Scheduled)</strong> in their Priest Services account.
                  </p>
                </div>
              )}

              {statusPromptModal.status === "performed" && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Puja Performed Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={statusPromptModal.dateValue}
                    onChange={(e) => setStatusPromptModal((prev) => ({ ...prev, dateValue: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-semibold text-gray-900 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none transition cursor-pointer"
                  />
                  <p className="text-[11px] text-gray-500 mt-1.5">
                    Advances the journey to <strong>Step 4: Puja Performed</strong> for the devotee.
                  </p>
                </div>
              )}

              {statusPromptModal.status === "completed" && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Puja Video Link (YouTube / Vimeo / Cloud link)
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                    value={statusPromptModal.videoLinkValue}
                    onChange={(e) => setStatusPromptModal((prev) => ({ ...prev, videoLinkValue: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-medium text-gray-900 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                  />
                  <p className="text-[11px] text-gray-500 mt-1.5">
                    The devotee will see a <strong>Watch Puja Video</strong> button and embedded video player in their Priest Services account.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setStatusPromptModal((prev) => ({ ...prev, open: false }))}
                className="px-4 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleModalSubmit}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm transition active:scale-95"
              >
                Confirm &amp; Update
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
