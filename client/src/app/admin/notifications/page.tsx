"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  EnvelopeIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  XMarkIcon,
  ServerStackIcon,
  UserGroupIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  CheckIcon,
  ChatBubbleLeftRightIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";

interface Recipient {
  _id: string;
  name: string;
  email: string;
  role: string;
  alertTypes?: ("ORDERS" | "CUSTOMER_QUERIES")[];
  isActive: boolean;
  notes?: string;
  createdAt?: string;
}

interface SmtpStatus {
  connected: boolean;
  user?: string;
  host?: string;
  message?: string;
}

type TabType = "all" | "orders" | "queries";

export default function NotificationsAdminPage() {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [smtpStatus, setSmtpStatus] = useState<SmtpStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("orders");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Modal State for Add / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Admin",
    alertTypes: ["ORDERS"] as ("ORDERS" | "CUSTOMER_QUERIES")[],
    isActive: true,
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const roleOptions = [
    { value: "Admin", label: "Admin", desc: "Full administrative alerts", badge: "bg-purple-100 text-purple-700" },
    { value: "Customer Support", label: "Customer Support", desc: "Devotee queries & communications", badge: "bg-blue-100 text-blue-700" },
    { value: "Support Lead", label: "Support Lead", desc: "Devotee escalations & tickets", badge: "bg-indigo-100 text-indigo-700" },
    { value: "Priest / Pandit", label: "Priest / Pandit", desc: "Ritual & Sankalpam details", badge: "bg-amber-100 text-amber-700" },
    { value: "Temple Coordinator", label: "Temple Coordinator", desc: "Temple schedule coordination", badge: "bg-orange-100 text-orange-700" },
    { value: "Management", label: "Management", desc: "Revenue & booking summary alerts", badge: "bg-emerald-100 text-emerald-700" },
  ];

  // Test Mail State
  const [testMailModalOpen, setTestMailModalOpen] = useState(false);
  const [testTargetEmail, setTestTargetEmail] = useState("");
  const [testAlertType, setTestAlertType] = useState<"ORDERS" | "CUSTOMER_QUERIES">("ORDERS");
  const [sendingTest, setSendingTest] = useState(false);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const getAdminAuthHeaders = (): Record<string, string> => {
    let token = "";
    if (typeof window !== "undefined") {
      token = localStorage.getItem("adminToken") || "";
    }
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchRecipients = useCallback(async () => {
    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";
      const res = await fetch(`${baseUrl}/api/admin/notifications/recipients`, {
        headers: {
          "Content-Type": "application/json",
          ...getAdminAuthHeaders(),
        },
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRecipients(data.data || []);
        setSmtpStatus(data.smtpStatus || null);
      } else {
        showToast(data.message || "Failed to load recipients", "error");
      }
    } catch (err: any) {
      console.error("Error fetching recipients:", err);
      showToast("Error connecting to server", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecipients();
  }, [fetchRecipients]);

  // Derived counts
  const orderCount = useMemo(() => {
    return recipients.filter((r) => {
      if (!r.isActive) return false;
      return !r.alertTypes || r.alertTypes.length === 0 || r.alertTypes.includes("ORDERS");
    }).length;
  }, [recipients]);

  const queryCount = useMemo(() => {
    return recipients.filter((r) => {
      if (!r.isActive) return false;
      return r.alertTypes && r.alertTypes.includes("CUSTOMER_QUERIES");
    }).length;
  }, [recipients]);

  const filteredRecipients = useMemo(() => {
    if (activeTab === "all") return recipients;
    if (activeTab === "orders") {
      return recipients.filter((r) => !r.alertTypes || r.alertTypes.length === 0 || r.alertTypes.includes("ORDERS"));
    }
    if (activeTab === "queries") {
      return recipients.filter((r) => r.alertTypes && r.alertTypes.includes("CUSTOMER_QUERIES"));
    }
    return recipients;
  }, [recipients, activeTab]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: "",
      email: "",
      role: activeTab === "queries" ? "Customer Support" : "Admin",
      alertTypes: activeTab === "queries" ? ["CUSTOMER_QUERIES"] : ["ORDERS"],
      isActive: true,
      notes: "",
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (rec: Recipient) => {
    setEditingId(rec._id);
    const types = rec.alertTypes && rec.alertTypes.length > 0 ? rec.alertTypes : ["ORDERS"];
    setFormData({
      name: rec.name,
      email: rec.email,
      role: rec.role || "Admin",
      alertTypes: types as ("ORDERS" | "CUSTOMER_QUERIES")[],
      isActive: rec.isActive,
      notes: rec.notes || "",
    });
    setModalOpen(true);
  };

  const toggleAlertTypeInForm = (type: "ORDERS" | "CUSTOMER_QUERIES") => {
    setFormData((prev) => {
      const exists = prev.alertTypes.includes(type);
      if (exists) {
        if (prev.alertTypes.length === 1) {
          showToast("A recipient must subscribe to at least one alert type", "error");
          return prev;
        }
        return { ...prev, alertTypes: prev.alertTypes.filter((t) => t !== type) };
      }
      return { ...prev, alertTypes: [...prev.alertTypes, type] };
    });
  };

  const handleSaveRecipient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      showToast("Name and Email are required", "error");
      return;
    }
    if (formData.alertTypes.length === 0) {
      showToast("Please select at least one alert subscription", "error");
      return;
    }

    setSubmitting(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";
      const url = editingId
        ? `${baseUrl}/api/admin/notifications/recipients/${editingId}`
        : `${baseUrl}/api/admin/notifications/recipients`;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...getAdminAuthHeaders(),
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        showToast(editingId ? "Recipient updated successfully" : "Recipient added successfully");
        setModalOpen(false);
        fetchRecipients();
      } else {
        showToast(resData.message || "Failed to save recipient", "error");
      }
    } catch (err: any) {
      console.error("Save error:", err);
      showToast("Failed to connect to server", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (rec: Recipient) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";
      const res = await fetch(`${baseUrl}/api/admin/notifications/recipients/${rec._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAdminAuthHeaders(),
        },
        credentials: "include",
        body: JSON.stringify({ isActive: !rec.isActive }),
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        showToast(`${rec.email} marked as ${!rec.isActive ? "Active" : "Inactive"}`);
        setRecipients((prev) =>
          prev.map((item) => (item._id === rec._id ? { ...item, isActive: !item.isActive } : item))
        );
      } else {
        showToast(resData.message || "Failed to update status", "error");
      }
    } catch (err: any) {
      showToast("Failed to update status", err.message);
    }
  };

  const handleDelete = async (id: string, email: string) => {
    if (!window.confirm(`Are you sure you want to remove ${email} from email notifications?`)) {
      return;
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";
      const res = await fetch(`${baseUrl}/api/admin/notifications/recipients/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...getAdminAuthHeaders(),
        },
        credentials: "include",
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        showToast(`Removed ${email}`);
        setRecipients((prev) => prev.filter((r) => r._id !== id));
      } else {
        showToast(resData.message || "Failed to remove recipient", "error");
      }
    } catch (err: any) {
      showToast("Failed to delete recipient", err.message);
    }
  };

  const handleSendTestMail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingTest(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";
      const res = await fetch(`${baseUrl}/api/admin/notifications/test-mail`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAdminAuthHeaders(),
        },
        credentials: "include",
        body: JSON.stringify({
          email: testTargetEmail ? testTargetEmail.trim() : null,
          alertType: testAlertType,
        }),
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        showToast(resData.message || "Test email sent successfully!");
        setTestMailModalOpen(false);
        setTestTargetEmail("");
      } else {
        showToast(resData.message || "Failed to send test email", "error");
      }
    } catch (err: any) {
      console.error("Test mail error:", err);
      showToast(err.message || "Failed to trigger test email", "error");
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl border text-xs font-bold transition-all animate-in fade-in ${toast.type === "success"
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

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Email Alerts &amp; Notifications
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-purple-50 text-purple-700 border border-purple-200">
              {recipients.filter((r) => r.isActive).length} Active Configured
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Manage email dispatches for confirmed order bookings and live devotee customer support inquiries.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              setTestAlertType(activeTab === "queries" ? "CUSTOMER_QUERIES" : "ORDERS");
              setTestMailModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
          >
            <PaperAirplaneIcon className="w-4 h-4 text-purple-600" />
            <span>Send Test Mail</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00B05F] hover:bg-[#008F4C] text-white text-xs font-bold transition shadow-md shadow-[#00B05F]/20 cursor-pointer active:scale-95"
          >
            <PlusIcon className="w-4 h-4" strokeWidth={2.5} />
            <span>Add Recipient</span>
          </button>
        </div>
      </div>

      {/* SMTP Server Health Status Banner */}
      <div
        className={`rounded-2xl border p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${smtpStatus?.connected
          ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
          : "bg-amber-50/70 border-amber-200 text-amber-900"
          }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${smtpStatus?.connected ? "bg-emerald-600 text-white" : "bg-amber-600 text-white"
              }`}
          >
            <ServerStackIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider">
                SMTP Status: {smtpStatus?.connected ? "Ready & Authenticated" : "Configuration Warning"}
              </span>
              <span
                className={`w-2 h-2 rounded-full ${smtpStatus?.connected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                  }`}
              />
            </div>
            <p className="text-xs mt-0.5 opacity-90 font-medium">
              {smtpStatus?.message || "Checking mail connection..."}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchRecipients}
          className="text-xs font-bold underline hover:opacity-80 flex items-center gap-1 shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <ArrowPathIcon className="w-3.5 h-3.5" />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Tabs Switcher: Order Notifications vs Customer Query Alerts */}
      <div className="flex items-center gap-2 p-1.5 bg-gray-100/90 rounded-2xl w-fit border border-gray-200/80">


        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === "all"
            ? "bg-white text-gray-900 shadow-sm border border-gray-200"
            : "text-gray-600 hover:text-gray-900"
            }`}
        >
          <UserGroupIcon className="w-4 h-4 text-gray-500" />
          <span>All Recipients</span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${activeTab === "all" ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-700"
              }`}
          >
            {recipients.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("orders")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === "orders"
            ? "bg-white text-purple-900 shadow-sm border border-purple-100"
            : "text-gray-600 hover:text-gray-900"
            }`}
        >
          <ShoppingBagIcon className="w-4 h-4 text-purple-600" />
          <span>Order Notifications</span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${activeTab === "orders" ? "bg-purple-100 text-purple-700" : "bg-gray-200 text-gray-700"
              }`}
          >
            {orderCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("queries")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === "queries"
            ? "bg-white text-blue-900 shadow-sm border border-blue-100"
            : "text-gray-600 hover:text-gray-900"
            }`}
        >
          <ChatBubbleLeftRightIcon className="w-4 h-4 text-blue-600" />
          <span>Customer Query Alerts</span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${activeTab === "queries" ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-700"
              }`}
          >
            {queryCount}
          </span>
        </button>

      </div>

      {/* Info Callouts based on active tab */}
      {activeTab === "orders" ? (
        <div className="bg-white border border-purple-200/80 rounded-2xl p-4 flex items-start gap-3 text-xs text-stone-600 shadow-2xs">
          <InformationCircleIcon className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-stone-900 block mb-0.5">Automated Real-Time Order Dispatch</span>
            When a devotee completes payment, an email containing the <strong>Order ID, Puja Title, Package, Devotee names, Gotra, WhatsApp number, Total Price, Transaction ID, and exact Booking Date &amp; Time</strong> is sent automatically to every Active recipient configured for Orders.
          </div>
        </div>
      ) : activeTab === "queries" ? (
        <div className="bg-white border border-blue-200/80 rounded-2xl p-4 flex items-start gap-3 text-xs text-stone-600 shadow-2xs">
          <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-stone-900 block mb-0.5">Real-Time Customer Query / Support Alerts</span>
            Whenever a customer submits a question via the <strong>&quot;Still need help?&quot; support form</strong>, an instant alert email with the devotee&apos;s name, phone, WhatsApp direct-chat link, booking reference, and question message is delivered directly to this support team list.
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-stone-600 shadow-2xs">
          <UserGroupIcon className="w-5 h-5 text-gray-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-stone-900 block mb-0.5">Complete Alert Subscriptions Overview</span>
            Viewing all configured email accounts across Orders and Customer Queries. Each recipient can subscribe to Orders, Queries, or both.
          </div>
        </div>
      )}

      {/* Recipients Table Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserGroupIcon className="w-5 h-5 text-gray-500" />
            <h2 className="text-sm font-extrabold text-gray-900">
              {activeTab === "orders"
                ? `Order Notification Recipients (${filteredRecipients.length})`
                : activeTab === "queries"
                  ? `Customer Query Support Recipients (${filteredRecipients.length})`
                  : `All Email Alert Recipients (${filteredRecipients.length})`}
            </h2>
          </div>
          <span className="text-xs text-gray-400 font-medium hidden sm:inline">
            Active recipients receive instant alerts
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/70 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-3.5">RECIPIENT</th>
                <th className="px-4 py-3.5">EMAIL ADDRESS</th>
                <th className="px-4 py-3.5">ROLE / DEPT</th>
                <th className="px-4 py-3.5">ALERT SUBSCRIPTIONS</th>
                <th className="px-4 py-3.5 text-center">STATUS</th>
                <th className="px-4 py-3.5">NOTES</th>
                <th className="px-6 py-3.5 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-7 h-7 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
                      <span className="font-semibold text-xs text-gray-600">Loading recipients...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredRecipients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 mb-2">
                        {activeTab === "queries" ? (
                          <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-600" />
                        ) : (
                          <EnvelopeIcon className="w-6 h-6" />
                        )}
                      </div>
                      <span className="font-bold text-sm text-gray-800">
                        {activeTab === "queries"
                          ? "No Customer Query Alert Recipients Yet"
                          : "No Email Recipients Configured Yet"}
                      </span>
                      <p className="text-xs text-gray-400 mt-1 max-w-sm">
                        {activeTab === "queries"
                          ? "Add support team members or admins to receive instant email notifications whenever a devotee submits a support query."
                          : "Add email addresses to start receiving instant booking confirmation alerts."}
                      </p>
                      <button
                        type="button"
                        onClick={handleOpenAdd}
                        className="mt-4 px-4 py-2 rounded-xl bg-[#00B05F] text-white text-xs font-bold shadow-xs hover:bg-[#008F4C] transition cursor-pointer"
                      >
                        + Add First Recipient
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecipients.map((rec) => {
                  const alertTypes = rec.alertTypes && rec.alertTypes.length > 0 ? rec.alertTypes : ["ORDERS"];
                  return (
                    <tr key={rec._id} className="hover:bg-gray-50/70 transition">
                      {/* Name */}
                      <td className="px-6 py-4 font-bold text-gray-900">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-extrabold flex items-center justify-center text-xs shrink-0">
                            {rec.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="block font-bold text-gray-900">{rec.name}</span>
                            <span className="text-[10px] text-gray-400 font-normal">
                              Added {rec.createdAt ? new Date(rec.createdAt).toLocaleDateString("en-IN") : "Recently"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-4 font-mono font-semibold text-purple-700">
                        <a href={`mailto:${rec.email}`} className="hover:underline flex items-center gap-1.5">
                          <EnvelopeIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>{rec.email}</span>
                        </a>
                      </td>

                      {/* Role / Dept */}
                      <td className="px-4 py-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-gray-100 text-gray-700 border border-gray-200">
                          {rec.role || "Admin"}
                        </span>
                      </td>

                      {/* Alert Subscriptions Badges */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {alertTypes.includes("ORDERS") && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                              <ShoppingBagIcon className="w-3 h-3 text-purple-600" />
                              Orders
                            </span>
                          )}
                          {alertTypes.includes("CUSTOMER_QUERIES") && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              <ChatBubbleLeftRightIcon className="w-3 h-3 text-blue-600" />
                              Queries
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Active Toggle Switch */}
                      <td className="px-4 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(rec)}
                          title={rec.isActive ? "Click to set Inactive" : "Click to set Active"}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold transition cursor-pointer border ${rec.isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200"
                            }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${rec.isActive ? "bg-emerald-500" : "bg-gray-400"}`} />
                          <span>{rec.isActive ? "Active" : "Inactive"}</span>
                        </button>
                      </td>

                      {/* Notes */}
                      <td className="px-4 py-4 text-gray-500 max-w-[180px] truncate">
                        {rec.notes || <span className="text-gray-300">–</span>}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setTestTargetEmail(rec.email);
                              setTestAlertType(
                                alertTypes.includes("CUSTOMER_QUERIES") && !alertTypes.includes("ORDERS")
                                  ? "CUSTOMER_QUERIES"
                                  : "ORDERS"
                              );
                              setTestMailModalOpen(true);
                            }}
                            title={`Send test email to ${rec.email}`}
                            className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 transition cursor-pointer"
                          >
                            <PaperAirplaneIcon className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(rec)}
                            title="Edit recipient"
                            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition cursor-pointer"
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(rec._id, rec.email)}
                            title="Delete recipient"
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition cursor-pointer"
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
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 animate-in zoom-in-95 duration-150 pb-8">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <EnvelopeIcon className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-base text-gray-900">
                  {editingId ? "Edit Email Recipient" : "Add Notification Recipient"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 rounded-lg p-1 hover:bg-gray-100 transition cursor-pointer"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRecipient} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Recipient Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Support Desk Lead / Operations Admin"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-xs text-gray-900"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="support@priestservices.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-xs text-gray-900 font-mono"
                />
              </div>

              {/* Alert Subscriptions Checkboxes */}
              <div>
                <label className="block font-bold text-gray-700 mb-1.5">
                  Alert Subscriptions <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <label
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition cursor-pointer ${formData.alertTypes.includes("ORDERS")
                      ? "bg-purple-50/70 border-purple-300 text-purple-900"
                      : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.alertTypes.includes("ORDERS")}
                      onChange={() => toggleAlertTypeInForm("ORDERS")}
                      className="w-4 h-4 mt-0.5 rounded text-purple-600 focus:ring-purple-500"
                    />
                    <div>
                      <span className="font-bold text-xs block">Order Bookings</span>
                      <span className="text-[10px] text-gray-500">Confirmed puja &amp; homas</span>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition cursor-pointer ${formData.alertTypes.includes("CUSTOMER_QUERIES")
                      ? "bg-blue-50/70 border-blue-300 text-blue-900"
                      : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.alertTypes.includes("CUSTOMER_QUERIES")}
                      onChange={() => toggleAlertTypeInForm("CUSTOMER_QUERIES")}
                      className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="font-bold text-xs block">Customer Queries</span>
                      <span className="text-[10px] text-gray-500">Devotee support questions</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <label className="block font-bold text-gray-700 mb-1">Role / Department</label>
                  <button
                    type="button"
                    onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white hover:border-purple-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none text-xs text-gray-900 transition shadow-2xs cursor-pointer text-left"
                  >
                    <span className="font-semibold text-gray-800 truncate">{formData.role}</span>
                    <ChevronDownIcon
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ml-1.5 ${roleDropdownOpen ? "rotate-180 text-purple-600" : ""
                        }`}
                    />
                  </button>

                  {/* Custom Styled Dropdown Menu */}
                  {roleDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setRoleDropdownOpen(false)}
                      />
                      <div className="absolute left-0 top-full mt-1.5 w-full min-w-[210px] max-h-52 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-2xl z-50 p-1 divide-y divide-gray-50 animate-in fade-in zoom-in-95 duration-150">
                        <div className="space-y-0.5">
                          {roleOptions.map((opt) => {
                            const isSelected = formData.role === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                  setFormData({ ...formData, role: opt.value });
                                  setRoleDropdownOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition cursor-pointer ${isSelected
                                  ? "bg-purple-50 text-purple-900 font-bold"
                                  : "text-gray-700 hover:bg-gray-50 font-medium"
                                  }`}
                              >
                                <div className="truncate">
                                  <div className="text-xs">{opt.label}</div>
                                  <div className="text-[10px] text-gray-400 font-normal">{opt.desc}</div>
                                </div>
                                {isSelected && (
                                  <CheckIcon className="w-4 h-4 text-purple-600 shrink-0 ml-2" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Status</label>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                    />
                    <label htmlFor="isActive" className="font-bold text-xs text-gray-700 cursor-pointer">
                      Active (Receive emails)
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Notes / Description (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Handles devotee query tickets & callbacks"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:border-purple-500 outline-none text-xs text-gray-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#00B05F] hover:bg-[#008F4C] text-white font-bold transition shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Saving..." : editingId ? "Save Changes" : "Add Recipient"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Test Mail Trigger Modal */}
      {testMailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <PaperAirplaneIcon className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-base text-gray-900">Send Test Email Notification</h3>
              </div>
              <button
                type="button"
                onClick={() => setTestMailModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 rounded-lg p-1 hover:bg-gray-100 transition cursor-pointer"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendTestMail} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1.5">Choose Alert Type to Test</label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setTestAlertType("ORDERS")}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${testAlertType === "ORDERS"
                      ? "bg-purple-50 border-purple-300 text-purple-950 ring-2 ring-purple-200"
                      : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    <span className="font-extrabold text-xs block mb-0.5">📦 Order Booking</span>
                    <span className="text-[10px] text-gray-500">Test order receipt preview</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTestAlertType("CUSTOMER_QUERIES")}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${testAlertType === "CUSTOMER_QUERIES"
                      ? "bg-blue-50 border-blue-300 text-blue-950 ring-2 ring-blue-200"
                      : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    <span className="font-extrabold text-xs block mb-0.5">💬 Customer Query</span>
                    <span className="text-[10px] text-gray-500">Support question alert preview</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Send Test To: (Leave empty to dispatch to active list)
                </label>
                <input
                  type="email"
                  placeholder="e.g. your.email@example.com"
                  value={testTargetEmail}
                  onChange={(e) => setTestTargetEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-purple-500 outline-none text-xs text-gray-900 font-mono"
                />
                <span className="text-[11px] text-gray-400 mt-1 block">
                  {testTargetEmail
                    ? `Test mail will be delivered only to: ${testTargetEmail}`
                    : `Will send to all active recipients subscribed to ${testAlertType === "CUSTOMER_QUERIES" ? "Customer Queries" : "Orders"
                    }`}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setTestMailModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingTest}
                  className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-white font-bold transition shadow-xs disabled:opacity-50 cursor-pointer ${testAlertType === "CUSTOMER_QUERIES"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-purple-600 hover:bg-purple-700"
                    }`}
                >
                  <PaperAirplaneIcon className="w-3.5 h-3.5" />
                  <span>{sendingTest ? "Sending Email..." : "Send Test Now"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
