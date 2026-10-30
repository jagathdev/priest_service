"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ChevronDownIcon,
  CheckIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
  VideoCameraIcon,
  EyeIcon,
  PencilSquareIcon,
  XMarkIcon,
  ArrowPathIcon,
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
  refund: {
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


const getEmbedVideoUrl = (rawUrl?: string): string | null => {
  if (!rawUrl) return null;
  const str = rawUrl.trim();
  if (!str) return null;
  const ytMatch = str.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  );
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`;
  }
  const vimeoMatch = str.match(/(?:vimeo\.com\/)(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
  }
  return str;
};

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
  createdAt?: string;
  bookingDate?: string;
  pricing?: {
    total?: number;
  };
}

interface StatsData {
  total: number;
  scheduled: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  refunded: number;
}

export default function AdminOrdersPage() {
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");

  const [data, setData] = useState<{
    orders: OrderData[];
    totalOrders: number;
    totalPages: number;
    limit: number;
    services: string[];
    statuses: string[];
    stats?: StatsData;
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

  // Date range filter between 2 dates
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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

  // Dedicated Video Preview Modal for Admin
  const [activeVideoModal, setActiveVideoModal] = useState<{
    open: boolean;
    url: string;
    title: string;
  }>({
    open: false,
    url: "",
    title: "",
  });

  // Edit Order Modal State
  const [editingOrder, setEditingOrder] = useState<any | null>(null);
  const [editFormData, setEditFormData] = useState<{
    orderStatus: string;
    scheduledDate: string;
    performedDate: string;
    videoLink: string;
  }>({
    orderStatus: "confirmed",
    scheduledDate: "",
    performedDate: "",
    videoLink: "",
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

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
    } catch { }
    return {};
  };

  const fetchOrders = useCallback(
    async (
      page: number,
      service: string,
      status: string,
      query: string,
      tab: "active" | "completed",
      sDate: string,
      eDate: string
    ) => {
      setLoading(true);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "10",
          tab: tab,
        });
        if (service !== "All") params.append("service", service);
        if (status !== "All") params.append("status", status);
        if (query.trim()) params.append("search", query.trim());
        if (sDate) params.append("startDate", sDate);
        if (eDate) params.append("endDate", eDate);

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
              totalOrders: result.totalOrders ?? result.data.length,
              totalPages: result.totalPages || 1,
              limit: result.limit || 10,
              services: result.services || ["All"],
              statuses: result.statuses || ["All"],
              stats: result.stats,
            });
          }
        }
      } catch (err) {
        console.error("Error fetching admin orders:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchOrders(currentPage, selectedService, selectedStatus, searchQuery, activeTab, startDate, endDate);
    }, 300);
    return () => clearTimeout(handler);
  }, [currentPage, selectedService, selectedStatus, searchQuery, activeTab, startDate, endDate, fetchOrders]);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedOrderIds([]);
  }, [selectedService, selectedStatus, searchQuery, activeTab, startDate, endDate]);

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

  // Intercept status changes to ask for date or video link when needed
  
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
    // If completing an order on the active tab, it will move to the Completed tab
    setData((prev) => ({
      ...prev,
      orders: prev.orders
        .map((ord) => {
          if (ord._id === orderId) {
            return { ...ord, orderStatus: newStatus, ...extraPayload };
          }
          return ord;
        })
        .filter((ord) => (activeTab === "active" ? ord.orderStatus !== "completed" : true)),
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
        showToast(
          newStatus === "completed"
            ? "Puja completed! Moved to 'Completed Rituals' tab"
            : `Order status updated to ${newStatus}`
        );
        fetchOrders(currentPage, selectedService, selectedStatus, searchQuery, activeTab, startDate, endDate);
      } else {
        fetchOrders(currentPage, selectedService, selectedStatus, searchQuery, activeTab, startDate, endDate);
      }
    } catch (err) {
      console.error("Failed to update order status:", err);
      fetchOrders(currentPage, selectedService, selectedStatus, searchQuery, activeTab, startDate, endDate);
    }
  };

  // Open Order Edit Modal
  const handleOpenEditModal = (ord: any) => {
    setEditingOrder(ord);
    setEditFormData({
      orderStatus: (ord.orderStatus || "confirmed").toLowerCase(),
      scheduledDate: ord.scheduledDate
        ? new Date(ord.scheduledDate).toISOString().split("T")[0]
        : "",
      performedDate: ord.performedDate
        ? new Date(ord.performedDate).toISOString().split("T")[0]
        : "",
      videoLink: ord.videoLink || "",
    });
  };

  const handleSaveOrderEdit = async () => {
    if (!editingOrder) return;
    setIsSavingEdit(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";
      const payload: any = {
        orderStatus: editFormData.orderStatus,
        videoLink: editFormData.videoLink.trim(),
      };
      if (editFormData.scheduledDate) {
        payload.scheduledDate = new Date(editFormData.scheduledDate).toISOString();
      }
      if (editFormData.performedDate) {
        payload.performedDate = new Date(editFormData.performedDate).toISOString();
      }

      const res = await fetch(`${baseUrl}/api/admin/orders/${editingOrder._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAdminAuthHeaders(),
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast("Order status & details updated successfully!");
        setEditingOrder(null);
        fetchOrders(currentPage, selectedService, selectedStatus, searchQuery, activeTab, startDate, endDate);
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.message || "Failed to save order updates", "error");
      }
    } catch (err: any) {
      console.error("Save edit order error:", err);
      showToast(err.message || "Error updating order", "error");
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Bulk status update execution
  const executeBulkStatusChange = async (newStatus: string, extraPayload: any = {}) => {
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
        fetchOrders(currentPage, selectedService, selectedStatus, searchQuery, activeTab, startDate, endDate);
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

  const formatBookingTimestamp = (rawDate?: string) => {
    if (!rawDate) return "–";
    const d = new Date(rawDate);
    if (isNaN(d.getTime())) return "–";
    const datePart = d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const timePart = d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return { datePart, timePart };
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-xs font-bold transition-all ${toast.type === "success"
            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
            : "bg-red-50 text-red-800 border-red-200"
            }`}
        >
          {toast.type === "success" ? (
            <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
          ) : (
            <ExclamationCircleIcon className="w-5 h-5 text-red-600" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Modern Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Orders &amp; Bookings</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {data.totalOrders} {activeTab === "active" ? "Active" : "Completed"}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Manage ritual bookings, update single or bulk statuses (Scheduled, Performed, Completed), and schedule dates.
          </p>
        </div>

        {/* Top-Right Quick Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Service Dropdown */}
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="bg-white border border-gray-200 text-gray-800 text-xs font-bold rounded-xl px-3 py-2 outline-none hover:border-gray-300 focus:border-emerald-600 shadow-2xs cursor-pointer"
          >
            {data.services.map((service) => (
              <option key={service} value={service}>
                {service === "All" ? "All Services" : service}
              </option>
            ))}
          </select>

          {/* Status Dropdown */}
          {activeTab === "active" && (
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-white border border-gray-200 text-gray-800 text-xs font-bold rounded-xl px-3 py-2 outline-none hover:border-gray-300 focus:border-emerald-600 shadow-2xs cursor-pointer"
            >
              {data.statuses
                .filter((st) => st.toLowerCase() !== "completed")
                .map((st) => (
                  <option key={st} value={st}>
                    {st === "All" ? "All Active Statuses" : st.toUpperCase()}
                  </option>
                ))}
            </select>
          )}

          {/* Search Box */}
          <div className="relative">
            <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search devotee, ID, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-800 placeholder-gray-400 outline-none hover:border-gray-300 focus:border-emerald-600 w-52 shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* KPI Overview Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Bookings */}
        <button
          type="button"
          onClick={() => {
            setActiveTab("active");
            setSelectedStatus("All");
          }}
          className={`p-3.5 rounded-2xl border text-left transition-all duration-150 flex flex-col justify-between cursor-pointer ${activeTab === "active" && (selectedStatus === "All" || !selectedStatus)
            ? "bg-blue-50/60 border-blue-400 shadow-sm ring-2 ring-blue-400/40"
            : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-2xs shadow-2xs"
            }`}
        >
          <div className="flex items-center justify-between text-gray-500 mb-1 w-full">
            <span className="text-[11px] font-bold text-gray-700">Total Bookings</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <CalendarDaysIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-gray-900">{data.stats?.total ?? data.totalOrders}</span>
            <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded">All time</span>
          </div>
        </button>

        {/* Scheduled */}
        <button
          type="button"
          onClick={() => {
            setActiveTab("active");
            setSelectedStatus("scheduled");
          }}
          className={`p-3.5 rounded-2xl border text-left transition-all duration-150 flex flex-col justify-between cursor-pointer ${activeTab === "active" && selectedStatus.toLowerCase() === "scheduled"
            ? "bg-amber-50/70 border-amber-500 shadow-sm ring-2 ring-amber-400/50"
            : "bg-white border-gray-200 hover:border-amber-300 hover:shadow-2xs shadow-2xs"
            }`}
        >
          <div className="flex items-center justify-between text-gray-500 mb-1 w-full">
            <span className="text-[11px] font-bold text-gray-700">Scheduled</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <ClockIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-amber-700">{data.stats?.scheduled ?? 0}</span>
            <span className="text-[10px] font-semibold text-gray-400">Rituals</span>
          </div>
        </button>

        {/* Confirmed */}
        <button
          type="button"
          onClick={() => {
            setActiveTab("active");
            setSelectedStatus("confirmed");
          }}
          className={`p-3.5 rounded-2xl border text-left transition-all duration-150 flex flex-col justify-between cursor-pointer ${activeTab === "active" && selectedStatus.toLowerCase() === "confirmed"
            ? "bg-sky-50/70 border-sky-500 shadow-sm ring-2 ring-sky-400/50"
            : "bg-white border-gray-200 hover:border-sky-300 hover:shadow-2xs shadow-2xs"
            }`}
        >
          <div className="flex items-center justify-between text-gray-500 mb-1 w-full">
            <span className="text-[11px] font-bold text-gray-700">Confirmed</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <CheckCircleIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-sky-700">{data.stats?.confirmed ?? 0}</span>
            <span className="text-[10px] font-semibold text-gray-400">Ready</span>
          </div>
        </button>

        {/* Cancelled */}
        <button
          type="button"
          onClick={() => {
            setActiveTab("active");
            setSelectedStatus("cancelled");
          }}
          className={`p-3.5 rounded-2xl border text-left transition-all duration-150 flex flex-col justify-between cursor-pointer ${activeTab === "active" && selectedStatus.toLowerCase() === "cancelled"
            ? "bg-rose-50/70 border-rose-500 shadow-sm ring-2 ring-rose-400/50"
            : "bg-white border-gray-200 hover:border-rose-300 hover:shadow-2xs shadow-2xs"
            }`}
        >
          <div className="flex items-center justify-between text-gray-500 mb-1 w-full">
            <span className="text-[11px] font-bold text-gray-700">Cancelled</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <XMarkIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-rose-700">{data.stats?.cancelled ?? 0}</span>
            <span className="text-[10px] font-semibold text-gray-400">Voided</span>
          </div>
        </button>

        {/* Refunded */}
        <button
          type="button"
          onClick={() => {
            setActiveTab("active");
            setSelectedStatus("refunded");
          }}
          className={`p-3.5 rounded-2xl border text-left transition-all duration-150 flex flex-col justify-between cursor-pointer ${activeTab === "active" && selectedStatus.toLowerCase() === "refunded"
            ? "bg-purple-50/70 border-purple-500 shadow-sm ring-2 ring-purple-400/50"
            : "bg-white border-gray-200 hover:border-purple-300 hover:shadow-2xs shadow-2xs"
            }`}
        >
          <div className="flex items-center justify-between text-gray-500 mb-1 w-full">
            <span className="text-[11px] font-bold text-gray-700">Refunded</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <ArrowPathIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-purple-700">{data.stats?.refunded ?? 0}</span>
            <span className="text-[10px] font-semibold text-gray-400">Reversed</span>
          </div>
        </button>

        {/* Completed */}
        <button
          type="button"
          onClick={() => {
            setActiveTab("completed");
            setSelectedStatus("All");
          }}
          className={`p-3.5 rounded-2xl border text-left transition-all duration-150 flex flex-col justify-between cursor-pointer ${activeTab === "completed"
            ? "bg-emerald-50/70 border-emerald-500 shadow-sm ring-2 ring-emerald-400/50"
            : "bg-white border-gray-200 hover:border-emerald-300 hover:shadow-2xs shadow-2xs"
            }`}
        >
          <div className="flex items-center justify-between text-gray-500 mb-1 w-full">
            <span className="text-[11px] font-bold text-gray-700">Completed</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckIcon className="w-4 h-4 stroke-[3]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-emerald-700">{data.stats?.completed ?? 0}</span>
            <span className="text-[10px] font-semibold text-gray-400">Delivered</span>
          </div>
        </button>
      </div>

      {/* Tabs & Date Range Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-3 shadow-2xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Active vs Completed Tabs */}
        <div className="flex items-center gap-1.5 bg-gray-100/80 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab("active")}
            className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${activeTab === "active"
              ? "bg-white text-gray-900 shadow-xs"
              : "text-gray-600 hover:text-gray-900"
              }`}
          >
            <span>Active Bookings</span>
            <span
              className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${activeTab === "active" ? "bg-emerald-100 text-emerald-800" : "bg-gray-200 text-gray-700"
                }`}
            >
              {(data.stats?.total || 0) - (data.stats?.completed || 0)}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("completed")}
            className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${activeTab === "completed"
              ? "bg-white text-emerald-800 shadow-xs"
              : "text-gray-600 hover:text-gray-900"
              }`}
          >
            <CheckIcon className="w-3.5 h-3.5 stroke-[3] text-emerald-600" />
            <span>Completed Rituals</span>
            <span
              className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${activeTab === "completed" ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-700"
                }`}
            >
              {data.stats?.completed || 0}
            </span>
          </button>
        </div>

        {/* Date Range Filter: Between 2 Dates */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl text-xs font-medium text-gray-700">
            <CalendarDaysIcon className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-[11px] font-bold text-gray-500 mr-1">Between:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-gray-900 text-xs font-bold outline-none cursor-pointer"
              title="Start Date"
            />
            <span className="text-gray-400 font-bold px-1">→</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-gray-900 text-xs font-bold outline-none cursor-pointer"
              title="End Date"
            />
            {(startDate || endDate) && (
              <button
                type="button"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
                className="text-gray-400 hover:text-gray-700 text-xs font-bold ml-1.5 cursor-pointer"
                title="Clear date filter"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Date Range Clear or Indicator */}
          {(startDate || endDate) && (
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              Filtered: {data.totalOrders} {data.totalOrders === 1 ? "Order" : "Orders"}
            </span>
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
                className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-xs font-bold transition cursor-pointer"
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
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-xs border border-transparent disabled:opacity-50 cursor-pointer ${opt.color}`}
                  >
                    Mark {opt.label}
                  </button>
                ))}

                {/* More Status Options dropdown */}
                <div className="relative" ref={bulkDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setBulkStatusDropdownOpen(!bulkStatusDropdownOpen)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
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
                          className="w-full text-left px-3.5 py-1.5 text-xs font-bold hover:bg-gray-50 flex items-center gap-2 text-gray-700 cursor-pointer"
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

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/70 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="pl-6 pr-2 py-3.5 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3.5">ORDER ID</th>
                <th className="px-4 py-3.5">SERVICE</th>
                <th className="px-4 py-3.5">DEVOTEE DETAILS</th>
                <th className="px-4 py-3.5">BOOKED AT (DATE &amp; TIME)</th>
                <th className="px-4 py-3.5">AMOUNT</th>
                <th className="px-4 py-3.5">STATUS</th>
                <th className="px-4 py-3.5 text-right pr-6">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-7 h-7 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                      <span className="font-semibold text-xs text-gray-600">Loading {activeTab} bookings...</span>
                    </div>
                  </td>
                </tr>
              ) : data.orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-2">
                        <CalendarDaysIcon className="w-6 h-6" />
                      </div>
                      <p className="font-bold text-sm text-gray-700">No {activeTab} bookings found</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {startDate || endDate
                          ? "Try clearing the date filter to view more bookings."
                          : "Orders will appear here as devotees make bookings."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.orders.map((ord) => {
                  const serviceName = ord.serviceName || "Sacred Ritual";
                  const devoteeName = ord.devoteeName || "Devotee";
                  const isChecked = selectedOrderIds.includes(ord._id);
                  const bookingTimeInfo = formatBookingTimestamp(ord.createdAt || ord.bookingDate);

                  return (
                    <tr
                      key={ord._id}
                      className={`hover:bg-gray-50/80 transition ${isChecked ? "bg-emerald-50/40" : ""}`}
                    >
                      {/* Checkbox */}
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

                      {/* 3. Devotee Details */}
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

                      {/* 4. Booked At (Timestamp: Date + Time) */}
                      <td className="px-4 py-3.5">
                        {typeof bookingTimeInfo === "object" ? (
                          <div className="space-y-0.5">
                            <div className="font-bold text-gray-900 flex items-center gap-1">
                              <CalendarDaysIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span>{bookingTimeInfo.datePart}</span>
                            </div>
                            <div className="text-[11px] font-semibold text-gray-500 flex items-center gap-1">
                              <ClockIcon className="w-3 h-3 text-gray-400 shrink-0" />
                              <span>{bookingTimeInfo.timePart}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">–</span>
                        )}
                      </td>

                      {/* 5. Amount */}
                      <td className="px-4 py-3.5 font-extrabold text-gray-900">
                        ₹{ord.pricing?.total || 0}
                      </td>

                      {/* 6. Status Display (Read-Only Pill; Editable via Edit Action) */}
                      <td className="px-4 py-3.5">
                        {(() => {
                          const norm = (ord.orderStatus || "created").toLowerCase();
                          const conf = STATUS_CONFIG[norm] || STATUS_CONFIG.created;
                          return (
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${conf.bg} ${conf.text} ${conf.border}`}
                            >
                              <span className={`w-2 h-2 rounded-full ${conf.dot}`} />
                              <span>{conf.label}</span>
                            </span>
                          );
                        })()}
                      </td>

                      {/* 7. Quick Actions (View, Edit Modal) */}
                      <td className="px-4 py-3.5 text-right pr-6">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/orders/${ord._id}`}
                            className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                            title="View order details"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(ord)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                            title="Edit order status & schedule"
                          >
                            <PencilSquareIcon className="w-4 h-4" />
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
              of <span className="font-bold text-gray-900">{data.totalOrders}</span> entries
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1 || loading}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 text-xs font-bold hover:bg-gray-100 disabled:opacity-40 transition cursor-pointer"
              >
                Previous
              </button>
              <span className="text-xs font-bold text-gray-700 px-2">
                {currentPage} / {data.totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= data.totalPages || loading}
                onClick={() => setCurrentPage((p) => Math.min(data.totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 disabled:opacity-40 transition cursor-pointer shadow-2xs"
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
                    ? (selectedOrderIds.length > 0
                      ? `Updating ${selectedOrderIds.length} selected orders`
                      : `Updating all orders for ${selectedService}`)
                    : "Update order status & details"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStatusPromptModal((prev) => ({ ...prev, open: false }))}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
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
                    onChange={(e) =>
                      setStatusPromptModal((prev) => ({ ...prev, dateValue: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-semibold text-gray-900 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none transition cursor-pointer"
                  />
                  <p className="text-[11px] text-gray-500 mt-1.5">
                    This date will be displayed in the devotee&apos;s{" "}
                    <strong>Puja Journey (Step 3: Puja Scheduled)</strong> in their Priest Services account.
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
                    onChange={(e) =>
                      setStatusPromptModal((prev) => ({ ...prev, dateValue: e.target.value }))
                    }
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
                    onChange={(e) =>
                      setStatusPromptModal((prev) => ({ ...prev, videoLinkValue: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-medium text-gray-900 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                  />
                  <p className="text-[11px] text-gray-500 mt-1.5">
                    The devotee will see a <strong>Watch Puja Video</strong> button and embedded video modal in their Priest Services account. Completed bookings move to the <strong>Completed Rituals</strong> tab!
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setStatusPromptModal((prev) => ({ ...prev, open: false }))}
                className="px-4 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleModalSubmit}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm transition active:scale-95 cursor-pointer"
              >
                Confirm &amp; Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Modal (Allows editing status, scheduled date, performed date, and video link) */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden transform transition-all">
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-800 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold flex items-center gap-2">
                  <PencilSquareIcon className="w-5 h-5" />
                  <span>Edit Order &amp; Status</span>
                </h3>
                <p className="text-xs text-emerald-100 mt-0.5 font-mono">
                  Order ID: {editingOrder.orderNumber} • {editingOrder.serviceName || "Puja"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingOrder(null)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* Order Status */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Order Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={editFormData.orderStatus}
                  onChange={(e) => setEditFormData({ ...editFormData, orderStatus: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none transition cursor-pointer"
                >
                  <option value="created">Created</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="performed">Performed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>
                <p className="text-[11px] text-gray-400 mt-1">
                  Status is only updated when you modify it here and save changes.
                </p>
              </div>

              {/* Scheduled Puja Date */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Scheduled Muhurat Date
                </label>
                <input
                  type="date"
                  value={editFormData.scheduledDate}
                  onChange={(e) => setEditFormData({ ...editFormData, scheduledDate: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 focus:bg-white focus:border-emerald-600 outline-none transition cursor-pointer"
                />
              </div>

              {/* Performed Date */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Puja Performed Date
                </label>
                <input
                  type="date"
                  value={editFormData.performedDate}
                  onChange={(e) => setEditFormData({ ...editFormData, performedDate: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 focus:bg-white focus:border-emerald-600 outline-none transition cursor-pointer"
                />
              </div>

              {/* Video Link */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <VideoCameraIcon className="w-4 h-4 text-purple-600" />
                  <span>Puja Video Recording Link</span>
                </label>
                <input
                  type="url"
                  placeholder="https://youtu.be/... or https://youtube.com/watch?v=..."
                  value={editFormData.videoLink}
                  onChange={(e) => setEditFormData({ ...editFormData, videoLink: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-medium text-gray-900 focus:bg-white focus:border-emerald-600 outline-none transition"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Devotee can watch the recorded puja video directly in their account.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-150 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setEditingOrder(null)}
                className="px-4 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSavingEdit}
                onClick={handleSaveOrderEdit}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm transition active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isSavingEdit ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Video Player Modal */}
      {activeVideoModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setActiveVideoModal({ open: false, url: "", title: "" })}
        >
          <div
            className="bg-stone-900 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl border border-stone-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 bg-stone-950 flex items-center justify-between border-b border-stone-800 text-white">
              <div className="flex items-center gap-2 truncate pr-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h4 className="font-bold text-xs sm:text-sm truncate">
                  {activeVideoModal.title} — Puja Video Player
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setActiveVideoModal({ open: false, url: "", title: "" })}
                className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="relative aspect-video w-full bg-black">
              {getEmbedVideoUrl(activeVideoModal.url) ? (
                <iframe
                  src={getEmbedVideoUrl(activeVideoModal.url) || ""}
                  title={activeVideoModal.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-stone-400 p-6 text-center">
                  <p className="text-sm mb-3">Recording Link:</p>
                  <a
                    href={activeVideoModal.url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700"
                  >
                    Open Video in New Tab
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
