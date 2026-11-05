"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  CalendarDaysIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowDownTrayIcon,
  SparklesIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";

// WhatsApp SVG Icon
function WhatsAppIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

interface ServiceOption {
  id: string;
  name: string;
  type: string;
}

interface OrderItem {
  _id: string;
  orderNumber: string;
  pooja?: string;
  itemName?: string;
  customerName?: string;
  mobileNumber?: string;
  whatsappNumber: string;
  participants: Array<{ name: string; gotra?: string; doesNotKnowGotra?: boolean }>;
  gotra?: string;
  doesNotKnowGotra?: boolean;
  wish?: string;
  offerings?: Array<{ name: string }>;
  scheduledDate?: string;
  bookingDate?: string;
  orderStatus: string;
  createdAt: string;
}

export default function AdminServiceDispatchPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [serviceOptions, setServiceOptions] = useState<ServiceOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [selectedService, setSelectedService] = useState<string>("All");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Dropdown states
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);
  const serviceDropdownRef = useRef<HTMLDivElement>(null);

  // Toast
  const [toast, setToast] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (serviceDropdownRef.current && !serviceDropdownRef.current.contains(e.target as Node)) {
        setServiceDropdownOpen(false);
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

  const fetchDispatchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";
      const token = getAdminToken();
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: "50",
        serviceName: selectedService,
        serviceType: selectedType,
        status: selectedStatus,
      });

      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);

      const res = await fetch(`${baseUrl}/api/admin/service-dispatch?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        setOrders(resData.data.orders || []);
        setTotalCount(resData.data.totalCount || 0);
        setTotalPages(resData.data.totalPages || 1);
        if (resData.data.serviceOptions) {
          setServiceOptions(resData.data.serviceOptions);
        }
      } else {
        setError(resData.message || "Failed to load service dispatch list");
      }
    } catch (err: any) {
      console.error("Fetch dispatch error:", err);
      setError("Network error loading service dispatch data.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedService, selectedType, selectedStatus, startDate, endDate]);

  useEffect(() => {
    fetchDispatchData();
  }, [fetchDispatchData]);

  // One-Click Download Excel Workbook (.xlsx)
  const handleDownloadExcel = async () => {
    setExporting(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";
      const token = getAdminToken();
      const params = new URLSearchParams({
        serviceName: selectedService,
        serviceType: selectedType,
        status: selectedStatus,
      });

      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);

      const res = await fetch(`${baseUrl}/api/admin/service-dispatch/export?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to generate Excel file");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const cleanName = selectedService !== "All" ? selectedService.replace(/[^a-zA-Z0-9]/g, "_") : "All_Rituals";
      a.download = `Priest_Dispatch_${cleanName}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast("Priest Excel Sheet downloaded successfully!");
    } catch (err: any) {
      console.error("Export Excel error:", err);
      showToast("Failed to download Excel file. Please try again.", "error");
    } finally {
      setExporting(false);
    }
  };

  // WhatsApp Summary message to Service Coordinator
  const composeWhatsAppSummary = () => {
    const serviceTitle = selectedService !== "All" ? selectedService : "All Booked Rituals";
    const dateLabel = startDate || endDate ? ` (Dates: ${startDate || "Earliest"} - ${endDate || "Latest"})` : "";
    const msg = `Namaste Priest Service Team,\n\nHere is the devotee booking dispatch list for *${serviceTitle}*${dateLabel}.\n\n*Total Confirmed Devotees:* ${totalCount}\n\nPlease check the exported Excel file for full Sankalpam, Gotras, family member names, and prayer wishes.\n\nBlessings,\nPriest Services Admin`;
    return `https://wa.me/?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-xs font-bold transition-all animate-in fade-in slide-in-from-bottom-2 ${toast.type === "success"
            ? "bg-emerald-900 text-white border border-emerald-700"
            : "bg-red-900 text-white border border-red-700"
            }`}
        >
          {toast.type === "success" ? (
            <CheckCircleIcon className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <ExclamationCircleIcon className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight font-serif">
              Service Team Dispatch
            </h1>
            <span className="px-3 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
              {totalCount} Devotees
            </span>
          </div>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Filter by specific Puja or Homa, preview devotee sankalpam details, and export bulk priest data to Excel.
          </p>
        </div>

        {/* Action Buttons: Export Excel & WhatsApp Coordinator */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* WhatsApp Coordinator */}
          <a
            href={composeWhatsAppSummary()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-xs font-extrabold transition shadow-2xs cursor-pointer"
          >
            <WhatsAppIcon className="w-4 h-4 text-emerald-600" />
            <span>Notify Priest Team</span>
          </a>

          {/* Export to Excel */}
          <button
            type="button"
            onClick={handleDownloadExcel}
            disabled={exporting || totalCount === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-extrabold transition shadow-xs cursor-pointer disabled:cursor-not-allowed"
          >
            <ArrowDownTrayIcon className="w-4 h-4 stroke-[2.5]" />
            <span>{exporting ? "Generating Excel..." : "Download Priest Excel (.xlsx)"}</span>
          </button>
        </div>
      </div>

      {/* Filter Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row gap-3.5 lg:items-center lg:justify-between">
          {/* Left: Service Searchable Dropdown */}
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            {/* Service Type (All, Puja, Homa) */}
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-gray-50 border border-gray-200 text-xs font-bold rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="Puja">Pujas Only</option>
              <option value="Homa">Homas Only</option>
            </select>

            {/* Select Specific Ritual Name */}
            <div className="relative min-w-[240px] flex-1 max-w-md" ref={serviceDropdownRef}>
              <button
                type="button"
                onClick={() => setServiceDropdownOpen(!serviceDropdownOpen)}
                className="w-full flex items-center justify-between gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-bold text-gray-800 hover:border-gray-300 transition text-left cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate">
                  <SparklesIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">
                    {selectedService === "All" ? "Select Specific Puja or Homa" : selectedService}
                  </span>
                </div>
                <ChevronDownIcon className="w-4 h-4 text-gray-400 shrink-0" />
              </button>

              {serviceDropdownOpen && (
                <div className="absolute left-0 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl py-1.5 z-30 max-h-64 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedService("All");
                      setServiceDropdownOpen(false);
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs font-bold hover:bg-gray-50 ${selectedService === "All" ? "text-emerald-700 bg-emerald-50/50" : "text-gray-700"
                      }`}
                  >
                    All Rituals & Pujas
                  </button>
                  {serviceOptions
                    .filter((opt) => selectedType === "All" || opt.type.toLowerCase() === selectedType.toLowerCase())
                    .map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setSelectedService(opt.name);
                          setServiceDropdownOpen(false);
                          setCurrentPage(1);
                        }}
                        className={`w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-gray-50 flex items-center justify-between ${selectedService === opt.name ? "text-emerald-700 bg-emerald-50/50 font-bold" : "text-gray-700"
                          }`}
                      >
                        <span className="truncate">{opt.name}</span>
                        <span className="text-[10px] uppercase font-bold text-gray-400 px-1.5 py-0.5 rounded bg-gray-100 shrink-0 ml-2">
                          {opt.type}
                        </span>
                      </button>
                    ))}
                </div>
              )}
            </div>

            {/* Clear Service Filter button */}
            {selectedService !== "All" && (
              <button
                type="button"
                onClick={() => {
                  setSelectedService("All");
                  setCurrentPage(1);
                }}
                className="text-gray-400 hover:text-gray-600 p-1"
                title="Reset Service Filter"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Right: Date Range & Status Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-gray-50 border border-gray-200 text-xs font-bold rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="All">All Paid / Confirmed</option>
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="performed">Performed</option>
              <option value="completed">Completed</option>
            </select>

            {/* Date Range */}
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs">
              <CalendarDaysIcon className="w-4 h-4 text-emerald-600 shrink-0" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs font-bold text-gray-800 focus:outline-none cursor-pointer"
                title="Start Date"
              />
              <span className="text-gray-400">-</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs font-bold text-gray-800 focus:outline-none cursor-pointer"
                title="End Date"
              />
              {(startDate || endDate) && (
                <button
                  type="button"
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                    setCurrentPage(1);
                  }}
                  className="text-gray-400 hover:text-gray-600 ml-1"
                >
                  <XMarkIcon className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Devotees Table Card */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="w-full overflow-x-hidden">
          <table className="w-full text-left border-collapse text-xs table-fixed">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3.5 px-3 w-10 text-center">#</th>
                <th className="py-3.5 px-3 w-[14%]">ORDER ID</th>
                <th className="py-3.5 px-3 w-[20%]">RITUAL / SERVICE</th>
                <th className="py-3.5 px-3 w-[26%]">DEVOTEES (FOR SANKALPAM)</th>
                <th className="py-3.5 px-3 w-[16%]">GOTRA &amp; PRAYER</th>
                <th className="py-3.5 px-3 w-[14%]">DATE &amp; STATUS</th>
                <th className="py-3.5 pr-4 pl-2 w-[10%] text-center">CONTACT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150 text-xs font-medium text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-gray-400">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      <span>Loading service dispatch devotee list...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-red-500 font-bold">
                    {error}
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-gray-400">
                    No devotees found for the selected ritual and date filters.
                  </td>
                </tr>
              ) : (
                orders.map((ord, idx) => {
                  const rowNumber = (currentPage - 1) * 50 + idx + 1;
                  const cleanPhone = (ord.whatsappNumber || ord.mobileNumber || "").replace(/\D/g, "");

                  return (
                    <tr key={ord._id} className="hover:bg-gray-50/80 transition-colors">
                      {/* # */}
                      <td className="py-3 px-3 text-center text-gray-400 font-bold align-middle">
                        {rowNumber}
                      </td>

                      {/* Order ID */}
                      <td className="py-3 px-3 align-middle font-mono font-bold text-gray-900 truncate">
                        <span className="bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-md text-[11px]">
                          {ord.orderNumber}
                        </span>
                      </td>

                      {/* Service / Puja */}
                      <td className="py-3 px-3 align-middle overflow-hidden">
                        <span className="font-extrabold text-gray-900 block truncate" title={ord.pooja || ord.itemName}>
                          {ord.pooja || ord.itemName || "Sacred Ritual"}
                        </span>
                        {ord.itemName?.includes("Package") && (
                          <span className="text-[10px] text-emerald-700 font-bold block truncate">
                            {ord.itemName}
                          </span>
                        )}
                      </td>

                      {/* Devotees List for Sankalpam */}
                      <td className="py-3 px-3 align-middle overflow-hidden">
                        <div className="space-y-1">
                          {Array.isArray(ord.participants) && ord.participants.length > 0 ? (
                            ord.participants.map((p, pIdx) => (
                              <div key={pIdx} className="flex items-center gap-1.5 text-xs text-gray-900 font-bold truncate">
                                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 text-[10px] flex items-center justify-center shrink-0">
                                  {pIdx + 1}
                                </span>
                                <span className="truncate">{p.name}</span>
                                {p.gotra && (
                                  <span className="text-[10px] font-normal text-gray-500">
                                    ({p.gotra})
                                  </span>
                                )}
                              </div>
                            ))
                          ) : (
                            <span className="font-bold text-gray-900">{ord.customerName}</span>
                          )}
                        </div>
                      </td>

                      {/* Gotra & Wish */}
                      <td className="py-3 px-3 align-middle overflow-hidden">
                        <div className="space-y-0.5">
                          <span className="inline-block px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-bold text-[10px] border border-amber-200 truncate max-w-full">
                            Gotra: {ord.gotra || (ord.doesNotKnowGotra ? "Not Provided" : "Kashyapa")}
                          </span>
                          {ord.wish && (
                            <p className="text-[11px] text-gray-600 line-clamp-1 italic" title={ord.wish}>
                              &ldquo;{ord.wish}&rdquo;
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Scheduled Date & Status */}
                      <td className="py-3 px-3 align-middle overflow-hidden">
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold text-gray-800 block truncate">
                            {ord.scheduledDate
                              ? new Date(ord.scheduledDate).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                              : ord.bookingDate
                                ? new Date(ord.bookingDate).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                                : "Date Pending"}
                          </span>
                          <span className="inline-block px-2 py-0.2 rounded-full text-[9px] font-extrabold uppercase border bg-blue-50 text-blue-700 border-blue-200">
                            {ord.orderStatus}
                          </span>
                        </div>
                      </td>

                      {/* Contact / WhatsApp */}
                      <td className="py-3 pr-4 pl-2 text-center align-middle">
                        {cleanPhone ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <a
                              href={`tel:+91${cleanPhone}`}
                              title={`Call Devotee (+91 ${cleanPhone})`}
                              className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
                            >
                              <PhoneIcon className="w-3.5 h-3.5" />
                            </a>
                            <a
                              href={`https://wa.me/91${cleanPhone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={`Chat with Devotee on WhatsApp`}
                              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                            >
                              <WhatsAppIcon className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalCount > 0 && (
          <div className="px-5 py-3 border-t border-gray-150 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-gray-500 font-medium">
              Showing{" "}
              <span className="font-bold text-gray-800">
                {(currentPage - 1) * 50 + 1}
              </span>{" "}
              to{" "}
              <span className="font-bold text-gray-800">
                {Math.min(currentPage * 50, totalCount)}
              </span>{" "}
              of <span className="font-bold text-gray-800">{totalCount}</span> devotees
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
        )}
      </div>
    </div>
  );
}

