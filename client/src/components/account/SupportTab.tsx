"use client";

import React, { useState } from "react";
import { HelpCircle, Phone, Mail, ChevronDown, Check, X } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

export default function SupportTab() {
  const { user } = useUser();
  const [openFaq, setOpenFaq] = useState<number | null>(1);
  const [helpFormData, setHelpFormData] = useState({
    name: "",
    mobileNumber: "",
    email: "",
    bookingId: "",
    subject: "",
    message: "",
    consent: true,
  });
  const [subjectDropdownOpen, setSubjectDropdownOpen] = useState(false);
  const subjectOptions = [
    { value: "Booking Issue", label: "Booking Issue", desc: "Problems with dates, priests, or booking details" },
    { value: "Puja Video Query", label: "Puja Video Query", desc: "Live streaming links or video recording status" },
    { value: "Refund/Cancellation", label: "Refund/Cancellation", desc: "Rescheduling, cancellation or refund requests" },
    { value: "Other", label: "Other", desc: "General spiritual inquiries and custom pujas" },
  ];
  const [isSubmittingHelp, setIsSubmittingHelp] = useState(false);
  const [helpFeedbackModal, setHelpFeedbackModal] = useState<{
    isOpen: boolean;
    type: "success" | "error";
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });

  const handleHelpSubmit = async () => {
    if (!helpFormData.name.trim()) {
      setHelpFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Name is required",
        message: "Please enter your full name before submitting your request.",
      });
      return;
    }
    if (!helpFormData.mobileNumber.trim() || helpFormData.mobileNumber.replace(/\D/g, "").length < 10) {
      setHelpFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Valid mobile number is required",
        message: "Please enter a valid 10-digit mobile number so our support team can reach you.",
      });
      return;
    }
    if (!helpFormData.subject.trim()) {
      setHelpFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Subject is required",
        message: "Please select a subject category for your inquiry.",
      });
      return;
    }
    if (!helpFormData.message.trim()) {
      setHelpFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Message is required",
        message: "Please describe your query or question so we can assist you effectively.",
      });
      return;
    }

    setIsSubmittingHelp(true);
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        (typeof window !== "undefined" && window.location.origin.includes("localhost")
          ? "http://localhost:8564"
          : "https://priestservices.astroved.com");

      const res = await fetch(`${baseUrl}/api/customerQueries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...helpFormData,
          consent: true,
          userId: user?.id || user?._id || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setHelpFeedbackModal({
          isOpen: true,
          type: "success",
          title: "Request Submitted Successfully! 🙏",
          message:
            "Thank you! Your query has been logged and our support team has received an instant email notification. We will get back to you shortly.",
        });
        setHelpFormData({
          name: "",
          mobileNumber: "",
          email: "",
          bookingId: "",
          subject: "",
          message: "",
          consent: true,
        });
      } else {
        setHelpFeedbackModal({
          isOpen: true,
          type: "error",
          title: "Submission Failed",
          message: data.message || "We could not submit your request. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error submitting help request:", error);
      setHelpFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Connection Error",
        message: "Unable to connect to support server. Please check your network and try again.",
      });
    } finally {
      setIsSubmittingHelp(false);
    }
  };

  return (
    <div className="animate-fade-in w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-[10px] bg-danger text-white flex items-center justify-center shrink-0 shadow-sm">
          <HelpCircle className="w-5 h-5" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold font-serif text-[#333]">
          Help &amp; Support
        </h1>
      </div>

      {/* Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {/* WhatsApp */}
        <a
          href="https://wa.me/919677391109?text=Hello%2C%20I%20need%20assistance%20with%20Priest%20Services"
          target="_blank"
          rel="noopener noreferrer"
          className="group bg-white border border-gray-150 rounded-2xl p-5 shadow-sm hover:shadow-md transition block"
        >
          <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
            <i className="fa-brands fa-whatsapp text-2xl text-white"></i>
          </div>
          <h4 className="text-[14px] font-bold text-gray-900 mb-1">WhatsApp Support</h4>
          <p className="text-[11px] text-gray-500 mb-4">Reply within minutes</p>
          <span className="text-primary text-[12px] font-bold flex items-center gap-1 group-hover:text-[#0f2d4a]">
            +91 9677391109 <span>&rarr;</span>
          </span>
        </a>

        {/* Call Support */}
        <a
          href="tel:+919677391108"
          className="group bg-white border border-gray-150 rounded-2xl p-5 shadow-sm hover:shadow-md transition block"
        >
          <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
            <Phone className="w-5 h-5" />
          </div>
          <h4 className="text-[14px] font-bold text-gray-900 mb-1">Call Support</h4>
          <p className="text-[11px] text-gray-500 mb-4">10 AM - 7 PM, all days</p>
          <span className="text-primary text-[12px] font-bold flex items-center gap-1 group-hover:text-[#0f2d4a]">
            +91 9677391108 <span>&rarr;</span>
          </span>
        </a>

        {/* Email Support */}
        <a
          href="mailto:support@astroved.com"
          className="group bg-white border border-gray-150 rounded-2xl p-5 shadow-sm hover:shadow-md transition block"
        >
          <div className="w-10 h-10 rounded-xl bg-[#d49a46] text-white flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
            <Mail className="w-5 h-5" />
          </div>
          <h4 className="text-[14px] font-bold text-gray-900 mb-1">Email Support</h4>
          <p className="text-[11px] text-gray-500 mb-4">Response within 24 hours</p>
          <span className="text-primary text-[12px] font-bold flex items-center gap-1 group-hover:text-[#0f2d4a]">
            support@astroved.com <span>&rarr;</span>
          </span>
        </a>
      </div>

      {/* Frequently Asked */}
      <h3 className="text-lg font-serif font-bold text-gray-800 mb-4">Frequently Asked</h3>
      <div className="space-y-3 mb-8">
        {/* FAQ 1 */}
        <div className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-sm">
          <button
            onClick={() => setOpenFaq(openFaq === 1 ? null : 1)}
            className="w-full flex items-center justify-between p-5 text-left transition hover:bg-gray-50 cursor-pointer"
          >
            <span className="text-[14px] font-bold text-gray-900">How do I book a puja?</span>
            <span className="text-primary font-bold text-xl leading-none">
              {openFaq === 1 ? "×" : "+"}
            </span>
          </button>
          {openFaq === 1 && (
            <div className="px-5 pb-5 text-[12px] text-gray-600 leading-relaxed border-t border-gray-50 pt-4">
              Browse pujas from the Puja menu, choose your package and temple, add devotee and sankalpam details, and complete the payment. You&apos;ll receive a confirmation instantly.
            </div>
          )}
        </div>

        {/* FAQ 2 */}
        <div className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-sm">
          <button
            onClick={() => setOpenFaq(openFaq === 2 ? null : 2)}
            className="w-full flex items-center justify-between p-5 text-left transition hover:bg-gray-50 cursor-pointer"
          >
            <span className="text-[14px] font-bold text-gray-900">When will I receive my puja video?</span>
            <span className="text-primary font-bold text-xl leading-none">
              {openFaq === 2 ? "×" : "+"}
            </span>
          </button>
          {openFaq === 2 && (
            <div className="px-5 pb-5 text-[12px] text-gray-600 leading-relaxed border-t border-gray-50 pt-4">
              You will receive your personalized puja video within 48 hours of the puja completion on your registered WhatsApp number.
            </div>
          )}
        </div>

        {/* FAQ 3 */}
        <div className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-sm">
          <button
            onClick={() => setOpenFaq(openFaq === 3 ? null : 3)}
            className="w-full flex items-center justify-between p-5 text-left transition hover:bg-gray-50 cursor-pointer"
          >
            <span className="text-[14px] font-bold text-gray-900">Can I edit my devotee details after booking?</span>
            <span className="text-primary font-bold text-xl leading-none">
              {openFaq === 3 ? "×" : "+"}
            </span>
          </button>
          {openFaq === 3 && (
            <div className="px-5 pb-5 text-[12px] text-gray-600 leading-relaxed border-t border-gray-50 pt-4">
              Yes, you can edit your details from the &quot;My Bookings&quot; section up to 24 hours before the scheduled puja time.
            </div>
          )}
        </div>
      </div>

      {/* Still need help? Form */}
      <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm mb-8">
        <h3 className="text-lg font-serif font-bold text-gray-800 mb-2">Still need help?</h3>
        <p className="text-[12px] text-gray-500 mb-6">
          Send us a message and our support team will get back to you within 24 hours.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-[12px] font-bold text-gray-800 block mb-1.5">
              Your Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={helpFormData.name}
              onChange={(e) => setHelpFormData({ ...helpFormData, name: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-[12px] font-bold text-gray-800 block mb-1.5">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <div className="flex border border-gray-200 rounded-xl overflow-hidden focus-within:border-primary">
              <span className="bg-gray-50 border-r border-gray-200 px-4 py-2.5 text-[13px] text-gray-700 font-medium">
                +91
              </span>
              <input
                type="text"
                placeholder="10-digit mobile number"
                value={helpFormData.mobileNumber}
                onChange={(e) =>
                  setHelpFormData({ ...helpFormData, mobileNumber: e.target.value.replace(/\D/g, "") })
                }
                maxLength={10}
                className="w-full px-3 py-2.5 text-[13px] text-gray-800 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-[12px] font-bold text-gray-800 block mb-1.5">
              Email <span className="text-gray-400 font-medium">(optional)</span>
            </label>
            <input
              type="email"
              placeholder="your.email@example.com"
              value={helpFormData.email}
              onChange={(e) => setHelpFormData({ ...helpFormData, email: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-[12px] font-bold text-gray-800 block mb-1.5">
              Booking ID <span className="text-gray-400 font-medium">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. VM123456789"
              value={helpFormData.bookingId}
              onChange={(e) => setHelpFormData({ ...helpFormData, bookingId: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="mb-4 relative">
          <label className="text-[12px] font-bold text-gray-800 block mb-1.5">
            Subject <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={() => setSubjectDropdownOpen(!subjectDropdownOpen)}
            className={`w-full flex items-center justify-between border rounded-xl px-4 py-2.5 text-[13px] bg-white transition cursor-pointer text-left ${
              subjectDropdownOpen
                ? "border-primary ring-2 ring-primary/10 shadow-xs"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <span className={helpFormData.subject ? "text-gray-900 font-semibold" : "text-gray-400"}>
              {helpFormData.subject || "Select a subject"}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${
                subjectDropdownOpen ? "rotate-180 text-primary" : ""
              }`}
            />
          </button>

          {subjectDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setSubjectDropdownOpen(false)}
              />
              <div className="absolute left-0 top-full mt-1.5 w-full bg-white border border-gray-200 rounded-2xl shadow-xl z-40 p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-150">
                {subjectOptions.map((opt) => {
                  const isSelected = helpFormData.subject === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setHelpFormData((prev) => ({ ...prev, subject: opt.value }));
                        setSubjectDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition cursor-pointer ${
                        isSelected
                          ? "bg-emerald-50 text-emerald-900 font-bold"
                          : "text-gray-700 hover:bg-gray-50 font-medium"
                      }`}
                    >
                      <div>
                        <div className="text-[13px] leading-tight">{opt.label}</div>
                        <div className="text-[11px] text-gray-400 font-normal mt-0.5">{opt.desc}</div>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-primary shrink-0 ml-2 stroke-[2.5]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className="mb-4">
          <label className="text-[12px] font-bold text-gray-800 block mb-1.5">
            Message <span className="text-red-500">*</span>
          </label>
          <textarea
            placeholder="Describe your issue..."
            rows={4}
            value={helpFormData.message}
            onChange={(e) => setHelpFormData({ ...helpFormData, message: e.target.value })}
            maxLength={1000}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:border-primary resize-none"
          ></textarea>
          <div className="text-right text-[10px] text-gray-400 mt-1">
            {helpFormData.message.length} / 1000
          </div>
        </div>

        <button
          onClick={handleHelpSubmit}
          disabled={isSubmittingHelp}
          className={`bg-primary text-white text-[13px] font-bold px-6 py-2.5 rounded-full flex items-center gap-1.5 transition w-max cursor-pointer ${
            isSubmittingHelp ? "opacity-70 cursor-not-allowed" : "hover:bg-[#008F4C]"
          }`}
        >
          {isSubmittingHelp ? "Submitting..." : "Submit Request"} {!isSubmittingHelp && <span>&rarr;</span>}
        </button>
      </div>

      {/* Feedback Modal */}
      {helpFeedbackModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden p-6 text-center border border-gray-100 animate-in zoom-in-95 duration-150">
            <div className="flex justify-end mb-1">
              <button
                type="button"
                onClick={() => setHelpFeedbackModal({ ...helpFeedbackModal, isOpen: false })}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div
              className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-4 ${
                helpFeedbackModal.type === "success"
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {helpFeedbackModal.type === "success" ? (
                <Check className="w-8 h-8 stroke-[2.5]" />
              ) : (
                <X className="w-8 h-8 stroke-[2.5]" />
              )}
            </div>
            <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">
              {helpFeedbackModal.title}
            </h3>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              {helpFeedbackModal.message}
            </p>
            <button
              type="button"
              onClick={() => setHelpFeedbackModal({ ...helpFeedbackModal, isOpen: false })}
              className={`w-full py-3 rounded-full text-xs font-bold text-white transition shadow-sm cursor-pointer ${
                helpFeedbackModal.type === "success"
                  ? "bg-[#00B05F] hover:bg-[#009651]"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              Okay, Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
