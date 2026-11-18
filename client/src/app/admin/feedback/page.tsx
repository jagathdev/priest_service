"use client";

import { useEffect, useState, useCallback } from "react";
import {
  StarIcon as StarSolid,
} from "@heroicons/react/24/solid";
import {
  StarIcon as StarOutline,
  MagnifyingGlassIcon,
  TrashIcon,
  EyeIcon,
  CalendarDaysIcon,
  ClockIcon,
  ShoppingBagIcon,
  PhoneIcon,
  EnvelopeIcon,
  SparklesIcon,
  FireIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import CustomDropdown from "@/components/admin/CustomDropdown";
import CustomDateRangePicker from "@/components/admin/CustomDateRangePicker";
import { formatIndianPhoneNumber } from "@/lib/phoneFormatter";

// Crisp WhatsApp SVG Icon
function WhatsAppIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

interface FeedbackItem {
  _id: string;
  order?: {
    _id: string;
    orderNumber?: string;
    devoteeName?: string;
    mobileNumber?: string;
    email?: string;
    serviceName?: string;
    serviceType?: string;
  } | null;
  orderNumber?: string;
  user?: string | null;
  devoteeName: string;
  mobileNumber?: string;
  whatsappNumber?: string;
  email?: string;
  serviceName: string;
  serviceType: "Puja" | "Homa" | string;
  rating: number;
  ratingLabel?: string;
  review: string;
  isPublic?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface StatsData {
  totalReviews: number;
  avgRating: number;
  fiveStars: number;
  fourStars: number;
  threeStars: number;
  pujaReviews: number;
  homaReviews: number;
}

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stats
  const [stats, setStats] = useState<StatsData>({
    totalReviews: 0,
    avgRating: 0,
    fiveStars: 0,
    fourStars: 0,
    threeStars: 0,
    pujaReviews: 0,
    homaReviews: 0,
  });

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("All");
  const [serviceTypeFilter, setServiceTypeFilter] = useState("All");
  const [sortBy, setSortBy] = useState("latest");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal State
  const [viewingFeedback, setViewingFeedback] = useState<FeedbackItem | null>(null);
  const [deletingFeedback, setDeletingFeedback] = useState<FeedbackItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const getAdminToken = () => {
    try {
      const match = document.cookie.match(/(?:^|;\s*)adminToken=([^;]*)/);
      if (match) return match[1];
      return "";
    } catch {
      return "";
    }
  };

  const fetchFeedbacks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";
      const token = getAdminToken();
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: "10",
        search: search.trim(),
        rating: ratingFilter,
        serviceType: serviceTypeFilter,
        sort: sortBy,
      });

      if (fromDate) params.append("fromDate", fromDate);
      if (toDate) params.append("toDate", toDate);

      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${baseUrl}/api/admin/feedbacks?${params.toString()}`, {
        headers,
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to load feedback records");
      }

      const resData = await res.json();
      if (resData.success) {
        setFeedbacks(resData.data || []);
        setTotalCount(resData.totalCount || 0);
        setTotalPages(resData.totalPages || 1);
        if (resData.stats) {
          setStats(resData.stats);
        }
      } else {
        throw new Error(resData.message || "Failed to fetch feedback records");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load feedbacks";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, ratingFilter, serviceTypeFilter, sortBy, fromDate, toDate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFeedbacks();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchFeedbacks]);

  // Handle single feedback delete
  const handleDeleteFeedback = async () => {
    if (!deletingFeedback) return;
    setIsDeleting(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";
      const token = getAdminToken();
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${baseUrl}/api/admin/feedbacks/${deletingFeedback._id}`, {
        method: "DELETE",
        headers,
        credentials: "include",
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        showToast("Feedback record deleted successfully", "success");
        setDeletingFeedback(null);
        if (viewingFeedback && viewingFeedback._id === deletingFeedback._id) {
          setViewingFeedback(null);
        }
        fetchFeedbacks();
      } else {
        throw new Error(resData.message || "Failed to delete feedback");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Deletion failed";
      showToast(msg, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return { date: "—", time: "—" };
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return { date: "—", time: "—" };
      const date = d.toLocaleDateString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      const time = d.toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).toLowerCase();
      return { date, time };
    } catch {
      return { date: "—", time: "—" };
    }
  };

  const getAvatarColor = (name: string, index: number) => {
    const colors = [
      "bg-emerald-100 text-emerald-800",
      "bg-blue-100 text-blue-800",
      "bg-purple-100 text-purple-800",
      "bg-amber-100 text-amber-800",
      "bg-rose-100 text-rose-800",
      "bg-indigo-100 text-indigo-800",
    ];
    let code = 0;
    for (let i = 0; i < (name || "").length; i++) {
      code += name.charCodeAt(i);
    }
    return colors[(code + index) % colors.length];
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          star <= rating ? (
            <StarSolid key={star} className="w-4 h-4 text-amber-400 fill-amber-400" />
          ) : (
            <StarOutline key={star} className="w-4 h-4 text-slate-200" />
          )
        ))}
      </div>
    );
  };

  const getRatingBadge = (rating: number) => {
    if (rating >= 5) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          5.0 Excellent
        </span>
      );
    }
    if (rating === 4) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
          4.0 Very Good
        </span>
      );
    }
    if (rating === 3) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
          3.0 Average
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
        {rating}.0 Attention
      </span>
    );
  };

  const ratingOptions = [
    { value: "All", label: "All Ratings" },
    { value: "5", label: "5 Stars (Excellent)" },
    { value: "4", label: "4 Stars (Good)" },
    { value: "3", label: "3 Stars (Average)" },
    { value: "2", label: "2 Stars" },
    { value: "1", label: "1 Star" },
  ];

  const serviceTypeOptions = [
    { value: "All", label: "All Services" },
    { value: "Puja", label: "Puja Rituals" },
    { value: "Homa", label: "Homa Rituals" },
  ];

  const sortOptions = [
    { value: "latest", label: "Sort by: Latest" },
    { value: "oldest", label: "Sort by: Oldest" },
    { value: "rating_desc", label: "Rating: High to Low" },
    { value: "rating_asc", label: "Rating: Low to High" },
  ];

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Toast Alert */}
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
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2.5">
            <ChatBubbleLeftRightIcon className="w-7 h-7 text-emerald-600 shrink-0" />
            Devotee Reviews & Feedback
          </h1>
          <p className="text-xs font-semibold text-gray-500 mt-1">
            Monitor verified devotee reviews, ritual satisfaction scores, and feedback for performed Pujas and Homas.
          </p>
        </div>

        {/* Action Controls & Admin Pill */}
        <div className="flex items-center gap-3">
          <CustomDateRangePicker
            startDate={fromDate}
            endDate={toDate}
            onChange={(start, end) => {
              setFromDate(start);
              setToDate(end);
              setCurrentPage(1);
            }}
          />

          {/* Admin Avatar Pill */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3.5 py-2 shadow-xs">
            <div className="w-6 h-6 rounded-full bg-[#1c2c5c] text-white flex items-center justify-center text-[11px] font-extrabold">
              A
            </div>
            <span className="text-xs font-bold text-gray-800">Admin</span>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Reviews */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ChatBubbleLeftRightIcon className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-gray-500">Total Reviews</span>
            <span className="text-2xl font-black text-gray-900 tracking-tight">
              {stats.totalReviews.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* Average Rating */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
            <StarSolid className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-gray-500">Average Rating</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-gray-900 tracking-tight">
                {stats.avgRating || "0.0"}
              </span>
              <span className="text-xs font-bold text-amber-500">/ 5.0</span>
            </div>
          </div>
        </div>

        {/* 5-Star Reviews */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircleIcon className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-gray-500">5-Star Devotee Reviews</span>
            <span className="text-2xl font-black text-emerald-600 tracking-tight">
              {stats.fiveStars.toLocaleString("en-IN")}
            </span>
          </div>
        </div>


      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        {/* Search & Filter Toolbar */}
        <div className="p-4 sm:px-6 sm:py-4 border-b border-gray-150 flex flex-wrap items-center justify-between gap-3 bg-white">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search devotee name, order ID, phone, email, or review..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition font-medium"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Custom Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            <CustomDropdown
              value={ratingFilter}
              onChange={(val) => {
                setRatingFilter(val);
                setCurrentPage(1);
              }}
              options={ratingOptions}
              placeholder="All Ratings"
            />

            <CustomDropdown
              value={serviceTypeFilter}
              onChange={(val) => {
                setServiceTypeFilter(val);
                setCurrentPage(1);
              }}
              options={serviceTypeOptions}
              placeholder="All Services"
            />

            <CustomDropdown
              value={sortBy}
              onChange={(val) => {
                setSortBy(val);
                setCurrentPage(1);
              }}
              options={sortOptions}
              placeholder="Sort by"
            />

            {(search || ratingFilter !== "All" || serviceTypeFilter !== "All" || fromDate || toDate) && (
              <button
                onClick={() => {
                  setSearch("");
                  setRatingFilter("All");
                  setServiceTypeFilter("All");
                  setSortBy("latest");
                  setFromDate("");
                  setToDate("");
                  setCurrentPage(1);
                }}
                className="px-3 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Feedback Table without Horizontal Scrollbar */}
        <div className="w-full overflow-x-hidden">
          <table className="w-full text-left table-fixed border-collapse">
            <thead>
              <tr className="border-b border-gray-150 bg-gray-50/75 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3.5 pl-5 pr-2 w-[4%] text-center">#</th>
                <th className="py-3.5 px-3 w-[15%]">Order ID</th>
                <th className="py-3.5 px-3 w-[21%]">Devotee Details</th>
                <th className="py-3.5 px-3 w-[18%]">Service Ritual</th>
                <th className="py-3.5 px-3 w-[13%]">Rating</th>
                <th className="py-3.5 px-3 w-[17%]">Feedback Review</th>
                <th className="py-3.5 px-3 w-[12%]">Date & Time</th>
                <th className="py-3.5 pr-5 pl-2 w-[8%] text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-600">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="inline-flex items-center gap-2 text-gray-500 text-sm">
                      <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      Loading devotee reviews...
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-rose-500 font-medium">
                    {error}
                  </td>
                </tr>
              ) : feedbacks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-gray-400">
                    <ChatBubbleLeftRightIcon className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                    No devotee reviews found matching your search or filters.
                  </td>
                </tr>
              ) : (
                feedbacks.map((fb, idx) => {
                  const itemIndex = (currentPage - 1) * 10 + idx + 1;
                  const effectiveOrderNumber = fb.orderNumber || fb.order?.orderNumber || "—";
                  const effectiveDevoteeName = fb.devoteeName || fb.order?.devoteeName || "Devotee";
                  const effectiveMobile = fb.mobileNumber || fb.order?.mobileNumber || "";
                  const effectiveWhatsapp = fb.whatsappNumber || effectiveMobile;
                  const effectiveEmail = fb.email || fb.order?.email || "";
                  const { date, time } = formatDateTime(fb.createdAt);
                  const isHoma = (fb.serviceType || fb.order?.serviceType || "").toLowerCase() === "homa";
                  const initial = (effectiveDevoteeName.trim()[0] || "D").toUpperCase();
                  const avatarClass = getAvatarColor(effectiveDevoteeName, idx);

                  return (
                    <tr
                      key={fb._id}
                      className="hover:bg-gray-50/70 transition-colors group cursor-pointer"
                      onClick={() => setViewingFeedback(fb)}
                    >
                      {/* # Index */}
                      <td className="py-3.5 pl-5 pr-2 text-center font-bold text-gray-400">
                        {itemIndex}
                      </td>

                      {/* Order ID - Never truncated */}
                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold font-mono bg-slate-100 text-slate-700 border border-slate-200">
                          #{effectiveOrderNumber}
                        </span>
                      </td>

                      {/* Devotee Details */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2.5 min-w-0 pr-1">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${avatarClass}`}
                          >
                            {initial}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-gray-900 text-xs truncate">
                              {effectiveDevoteeName}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5 text-[11px]">
                              {effectiveWhatsapp ? (
                                <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold truncate">
                                  <WhatsAppIcon className="w-3 h-3 text-emerald-500 shrink-0" />
                                  {formatIndianPhoneNumber(effectiveWhatsapp)}
                                </span>
                              ) : effectiveMobile ? (
                                <span className="inline-flex items-center gap-1 text-gray-500 truncate font-medium">
                                  <PhoneIcon className="w-3 h-3 text-gray-400 shrink-0" />
                                  {formatIndianPhoneNumber(effectiveMobile)}
                                </span>
                              ) : null}
                            </div>
                            {effectiveEmail && (
                              <p className="text-[10px] text-gray-400 truncate mt-0.2">
                                {effectiveEmail}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Service Ritual */}
                      <td className="py-3.5 px-3">
                        <div className="min-w-0 pr-1">
                          <p className="font-semibold text-gray-900 truncate text-xs">
                            {fb.serviceName || fb.order?.serviceName || "Ritual Service"}
                          </p>
                          <span
                            className={`inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isHoma
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-purple-50 text-purple-700 border border-purple-200"
                              }`}
                          >
                            {isHoma ? (
                              <>
                                <FireIcon className="w-3 h-3" /> Homa
                              </>
                            ) : (
                              <>
                                <SparklesIcon className="w-3 h-3" /> Puja
                              </>
                            )}
                          </span>
                        </div>
                      </td>

                      {/* Rating */}
                      <td className="py-3.5 px-3">
                        <div className="flex flex-col gap-1 items-start">
                          {renderStars(fb.rating)}
                          {getRatingBadge(fb.rating)}
                        </div>
                      </td>

                      {/* Feedback Review */}
                      <td className="py-3.5 px-3">
                        <p className="text-xs text-gray-700 italic line-clamp-2 max-w-full leading-snug">
                          &ldquo;{fb.review || "No detailed review entered."}&rdquo;
                        </p>
                      </td>

                      {/* Date & Time */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-700">
                            <CalendarDaysIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            {date}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 font-medium">
                            <ClockIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            {time}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 pr-5 pl-2 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setViewingFeedback(fb)}
                            title="View Full Feedback Details"
                            className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingFeedback(fb)}
                            title="Delete Feedback"
                            className="p-1.5 rounded-lg text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition"
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

        {/* Pagination Bar */}
        <div className="px-6 py-4 border-t border-gray-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-500 bg-gray-50/50">
          <div>
            Showing{" "}
            <span className="font-bold text-gray-800">
              {feedbacks.length > 0 ? (currentPage - 1) * 10 + 1 : 0}
            </span>{" "}
            to{" "}
            <span className="font-bold text-gray-800">
              {Math.min(currentPage * 10, totalCount)}
            </span>{" "}
            of <span className="font-bold text-gray-800">{totalCount}</span> reviews
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || loading}
              className="px-3.5 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all inline-flex items-center gap-1 shadow-2xs"
            >
              <ChevronLeftIcon className="w-3.5 h-3.5" /> Prev
            </button>
            <span className="px-3 py-1 font-bold text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || loading}
              className="px-3.5 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all inline-flex items-center gap-1 shadow-2xs"
            >
              Next <ChevronRightIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Revamped Devotee Feedback Modal */}
      {viewingFeedback && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-gray-150 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Top Header */}
            <div className="p-6 pb-4 border-b border-gray-150 flex items-center justify-between bg-gradient-to-r from-gray-50/80 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200/60 text-amber-500 flex items-center justify-center shrink-0">
                  <StarSolid className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900 tracking-tight">
                    Devotee Review Details
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] font-bold font-mono text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                      #{viewingFeedback.orderNumber || viewingFeedback.order?.orderNumber || "—"}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs font-semibold text-gray-600">
                      {viewingFeedback.devoteeName || viewingFeedback.order?.devoteeName || "Devotee"}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setViewingFeedback(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Rating Hero Banner */}
              <div className="bg-gradient-to-r from-amber-50 via-amber-50/60 to-orange-50/40 rounded-2xl p-4 border border-amber-200/70 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider block">
                    Verified Devotee Rating
                  </span>
                  <div className="flex items-center gap-2.5 mt-1">
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        star <= viewingFeedback.rating ? (
                          <StarSolid key={star} className="w-5 h-5 text-amber-400 fill-amber-400" />
                        ) : (
                          <StarOutline key={star} className="w-5 h-5 text-amber-200" />
                        )
                      ))}
                    </div>
                    <span className="text-lg font-black text-gray-900">
                      {viewingFeedback.rating}.0
                      <span className="text-xs font-bold text-gray-500"> / 5.0</span>
                    </span>
                  </div>
                </div>

                <div>
                  {getRatingBadge(viewingFeedback.rating)}
                </div>
              </div>

              {/* Devotee Contact Card with Direct Actions */}
              <div className="border border-gray-150 rounded-2xl p-4 bg-gray-50/60">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200/80">
                  <span className="text-[11px] font-black uppercase text-gray-500 tracking-wider">
                    Devotee &amp; Contact Info
                  </span>

                  {/* Direct Contact Buttons */}
                  <div className="flex items-center gap-2">
                    {(viewingFeedback.mobileNumber || viewingFeedback.whatsappNumber) && (
                      <a
                        href={`tel:${viewingFeedback.whatsappNumber || viewingFeedback.mobileNumber}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs"
                      >
                        <PhoneIcon className="w-3.5 h-3.5" />
                        <span>Call</span>
                      </a>
                    )}
                    {(viewingFeedback.whatsappNumber || viewingFeedback.mobileNumber) && (
                      <a
                        href={`https://wa.me/${(viewingFeedback.whatsappNumber || viewingFeedback.mobileNumber || "").replace(/\D/g, "")}?text=${encodeURIComponent(
                          `Namaste ${viewingFeedback.devoteeName || "Devotee"}, thank you for your feedback regarding the ${viewingFeedback.serviceName} ritual.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-xs">
                  <div>
                    <span className="text-gray-400 text-[11px] font-medium block">Devotee Name:</span>
                    <span className="font-bold text-gray-900 mt-0.5 block">
                      {viewingFeedback.devoteeName || viewingFeedback.order?.devoteeName || "Devotee"}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-400 text-[11px] font-medium block">WhatsApp:</span>
                    <span className="font-bold text-emerald-600 mt-0.5 flex items-center gap-1">
                      <WhatsAppIcon className="w-3.5 h-3.5" />
                      {viewingFeedback.whatsappNumber
                        ? formatIndianPhoneNumber(viewingFeedback.whatsappNumber)
                        : viewingFeedback.mobileNumber
                          ? formatIndianPhoneNumber(viewingFeedback.mobileNumber)
                          : "—"}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-400 text-[11px] font-medium block">Mobile Phone:</span>
                    <span className="font-medium text-gray-700 mt-0.5 flex items-center gap-1">
                      <PhoneIcon className="w-3.5 h-3.5 text-gray-400" />
                      {viewingFeedback.mobileNumber
                        ? formatIndianPhoneNumber(viewingFeedback.mobileNumber)
                        : "—"}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-400 text-[11px] font-medium block">Email Address:</span>
                    <span className="font-medium text-gray-700 mt-0.5 flex items-center gap-1 truncate">
                      <EnvelopeIcon className="w-3.5 h-3.5 text-gray-400" />
                      {viewingFeedback.email || viewingFeedback.order?.email || "Not Provided"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ritual Information */}
              <div className="border border-gray-150 rounded-2xl p-4 bg-white flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-black uppercase text-gray-500 tracking-wider block">
                    Ritual Service Performed
                  </span>
                  <p className="font-bold text-gray-900 text-sm mt-0.5">
                    {viewingFeedback.serviceName || viewingFeedback.order?.serviceName || "Ritual Service"}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold bg-gray-50 border border-gray-200 text-gray-700">
                  <ShoppingBagIcon className="w-3.5 h-3.5 text-emerald-600" />
                  {viewingFeedback.serviceType || "Puja"}
                </span>
              </div>

              {/* Devotee Testimonial Quote */}
              <div className="border border-emerald-150 bg-emerald-50/30 rounded-2xl p-5">
                <span className="text-[11px] font-black uppercase text-emerald-800 tracking-wider block mb-2">
                  Devotee&rsquo;s Review &amp; Experience
                </span>
                <p className="text-sm font-medium text-gray-800 italic leading-relaxed whitespace-pre-wrap">
                  &ldquo;{viewingFeedback.review || "No feedback text entered."}&rdquo;
                </p>
              </div>

              {/* Timestamp Banner */}
              <div className="flex items-center justify-between pt-1 text-[11px] text-gray-500 font-medium">
                <span className="inline-flex items-center gap-1">
                  <CalendarDaysIcon className="w-3.5 h-3.5 text-gray-400" />
                  Submitted: {formatDateTime(viewingFeedback.createdAt).date} at {formatDateTime(viewingFeedback.createdAt).time}
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-150 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setDeletingFeedback(viewingFeedback)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition"
              >
                Delete Review
              </button>

              <button
                type="button"
                onClick={() => setViewingFeedback(null)}
                className="px-6 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold transition shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingFeedback && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-150 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <TrashIcon className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1.5">Delete Devotee Feedback?</h3>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              Are you sure you want to delete this review from{" "}
              <span className="font-bold text-gray-800">
                {deletingFeedback.devoteeName || "Devotee"}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingFeedback(null)}
                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteFeedback}
                className="flex-1 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
