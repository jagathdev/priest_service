"use client";

import React, { useState, useEffect, useCallback } from "react";
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
} from "@heroicons/react/24/outline";

interface Recipient {
  _id: string;
  name: string;
  email: string;
  role: string;
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

export default function NotificationsAdminPage() {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [smtpStatus, setSmtpStatus] = useState<SmtpStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Modal State for Add / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Admin",
    isActive: true,
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const roleOptions = [
    { value: "Admin", label: "Admin", desc: "Full administrative alerts", badge: "bg-purple-100 text-purple-700" },
    { value: "Priest / Pandit", label: "Priest / Pandit", desc: "Ritual & Sankalpam details", badge: "bg-amber-100 text-amber-700" },
    { value: "Temple Coordinator", label: "Temple Coordinator", desc: "Temple schedule coordination", badge: "bg-orange-100 text-orange-700" },
    { value: "Customer Support", label: "Customer Support", desc: "Devotee queries & communications", badge: "bg-blue-100 text-blue-700" },
    { value: "Management", label: "Management", desc: "Revenue & booking summary alerts", badge: "bg-emerald-100 text-emerald-700" },
  ];

  // Test Mail State
  const [testMailModalOpen, setTestMailModalOpen] = useState(false);
  const [testTargetEmail, setTestTargetEmail] = useState("");
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

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: "",
      email: "",
      role: "Admin",
      isActive: true,
      notes: "",
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (rec: Recipient) => {
    setEditingId(rec._id);
    setFormData({
      name: rec.name,
      email: rec.email,
      role: rec.role || "Admin",
      isActive: rec.isActive,
      notes: rec.notes || "",
    });
    setModalOpen(true);
  };

  const handleSaveRecipient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      showToast("Name and Email are required", "error");
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
    if (!window.confirm(`Are you sure you want to remove ${email} from order notifications?`)) {
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
        body: JSON.stringify({ email: testTargetEmail ? testTargetEmail.trim() : null }),
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

  const activeCount = recipients.filter((r) => r.isActive).length;

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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Order Email Notifications
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-purple-50 text-purple-700 border border-purple-200">
              {activeCount} Active {activeCount === 1 ? "Recipient" : "Recipients"}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Whenever any puja or homa booking is confirmed, complete order details &amp; booking timestamps are immediately emailed to these recipients.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setTestMailModalOpen(true)}
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

      {/* Info Callout */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-4 flex items-start gap-3 text-xs text-stone-600 shadow-2xs">
        <InformationCircleIcon className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-stone-900 block mb-0.5">Automated Real-Time Order Dispatch</span>
          When a devotee completes payment, an email containing the <strong>Order ID, Puja Title, Package, Devotee names, Gotra, WhatsApp number, Total Price, Transaction ID, and exact Booking Date &amp; Time</strong> is sent automatically to every Active recipient listed below.
        </div>
      </div>

      {/* Recipients Table Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserGroupIcon className="w-5 h-5 text-gray-500" />
            <h2 className="text-sm font-extrabold text-gray-900">Configured Email Recipients ({recipients.length})</h2>
          </div>
          <span className="text-xs text-gray-400 font-medium hidden sm:inline">
            Active recipients receive instant alerts upon booking
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/70 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-3.5">RECIPIENT</th>
                <th className="px-4 py-3.5">EMAIL ADDRESS</th>
                <th className="px-4 py-3.5">ROLE / DEPT</th>
                <th className="px-4 py-3.5 text-center">STATUS</th>
                <th className="px-4 py-3.5">NOTES</th>
                <th className="px-6 py-3.5 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-7 h-7 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
                      <span className="font-semibold text-xs text-gray-600">Loading recipients...</span>
                    </div>
                  </td>
                </tr>
              ) : recipients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 mb-2">
                        <EnvelopeIcon className="w-6 h-6" />
                      </div>
                      <span className="font-bold text-sm text-gray-800">No Email Recipients Configured Yet</span>
                      <p className="text-xs text-gray-400 mt-1 max-w-sm">
                        Add email addresses (admins, priests, operations) to start receiving instant booking confirmation alerts.
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
                recipients.map((rec) => (
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
                    <td className="px-4 py-4 text-gray-500 max-w-[200px] truncate">
                      {rec.notes || <span className="text-gray-300">–</span>}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setTestTargetEmail(rec.email);
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
                ))
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
                  placeholder="e.g. Temple Priest Lead / Operations Admin"
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
                  placeholder="priest.coordinator@astroved.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-xs text-gray-900 font-mono"
                />
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
                  placeholder="e.g. Handles Rameshwaram and Varanasi bookings"
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
              <p className="text-gray-600">
                This will dispatch a sample confirmed order alert formatted exactly as real bookings appear, allowing you to verify inbox arrival, styling, and spam filters.
              </p>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Send Test To: (Leave empty to send to all active recipients)
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
                    : `Will send to all ${activeCount} active configured recipient(s)`}
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
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition shadow-xs disabled:opacity-50 cursor-pointer"
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
