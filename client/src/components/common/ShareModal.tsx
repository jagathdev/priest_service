"use client";

import { useState } from "react";
import {
  WhatsAppIcon,
  InstagramIcon,
  FacebookIcon,
  TwitterXIcon,
  TelegramIcon,
} from "@/components/ui/icons";
import { Copy, Check, X } from "lucide-react";

export interface ShareData {
  title?: string;
  description?: string;
  templeVenue?: string;
  location?: string;
  url?: string;
}

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ShareData;
}

export default function ShareModal({ isOpen, onClose, data }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentUrl =
    data.url ||
    (typeof window !== "undefined" ? window.location.href : "https://priestservices.astroved.com");
  const encodedUrl = encodeURIComponent(currentUrl);

  const pujaTitle = data.title || "Sacred Vedic Puja";
  const venuePart = data.templeVenue || data.location ? ` being performed at ${[data.templeVenue, data.location].filter(Boolean).join(", ")}.` : ".";
  const descPart = data.description ? `\n\nAbout this puja: ${data.description}` : "";

  // Dedicated WhatsApp message text matching the requested format
  const whatsappMessage = `I came across the ${pujaTitle}${venuePart}${descPart}\n\nThis puja brings peace of mind, spiritual joy and divine blessings. Don't miss this opportunity!\n\n${currentUrl}`;
  const encodedWhatsappText = encodeURIComponent(whatsappMessage);

  // General share text for other platforms
  const shareText = `I came across the ${pujaTitle}${venuePart}${descPart}\n\nThis puja brings peace of mind, spiritual joy and divine blessings. Don't miss this opportunity!`;
  const encodedShareText = encodeURIComponent(shareText);

  const handleShare = (platform: "whatsapp" | "instagram" | "facebook" | "twitter" | "telegram") => {
    let targetUrl = "";

    switch (platform) {
      case "whatsapp":
        targetUrl = `https://wa.me/?text=${encodedWhatsappText}`;
        break;
      case "instagram":
        targetUrl = `https://www.instagram.com/share?url=${encodedUrl}`;
        break;
      case "facebook":
        targetUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case "twitter":
        targetUrl = `https://twitter.com/intent/tweet?text=${encodedShareText}&url=${encodedUrl}`;
        break;
      case "telegram":
        targetUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedShareText}`;
        break;
    }

    if (targetUrl) {
      window.open(targetUrl, "_blank");
    }
  };

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(currentUrl);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = currentUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Failed to copy link", e);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[380px] rounded-3xl bg-white p-6 shadow-2xl relative animate-scale-up border border-stone-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute right-5 top-5 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <h3 className="text-xl font-bold font-serif text-stone-900 mb-6">
          Share Pooja
        </h3>

        {/* Share Buttons Grid */}
        <div className="grid grid-cols-2 gap-3.5">
          {/* WhatsApp */}
          <button
            type="button"
            onClick={() => handleShare("whatsapp")}
            className="flex flex-col items-center justify-center py-5 px-3 rounded-2xl border border-stone-200 hover:border-[#25D366] hover:bg-[#25D366]/5 transition-all group active:scale-95 shadow-2xs"
          >
            <div className="w-12 h-12 rounded-full bg-[#25D366]/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <WhatsAppIcon className="w-6 h-6 text-[#25D366]" />
            </div>
            <span className="text-sm font-semibold text-stone-700 group-hover:text-stone-900">
              WhatsApp
            </span>
          </button>

          {/* Instagram */}
          <button
            type="button"
            onClick={() => handleShare("instagram")}
            className="flex flex-col items-center justify-center py-5 px-3 rounded-2xl border border-stone-200 hover:border-pink-500 hover:bg-pink-500/5 transition-all group active:scale-95 shadow-2xs"
          >
            <div className="w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <InstagramIcon className="w-6 h-6 text-[#E1306C]" />
            </div>
            <span className="text-sm font-semibold text-stone-700 group-hover:text-stone-900">
              Instagram
            </span>
          </button>

          {/* Facebook */}
          <button
            type="button"
            onClick={() => handleShare("facebook")}
            className="flex flex-col items-center justify-center py-5 px-3 rounded-2xl border border-stone-200 hover:border-[#1877F2] hover:bg-[#1877F2]/5 transition-all group active:scale-95 shadow-2xs"
          >
            <div className="w-12 h-12 rounded-full bg-[#1877F2]/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <FacebookIcon className="w-6 h-6 text-[#1877F2]" />
            </div>
            <span className="text-sm font-semibold text-stone-700 group-hover:text-stone-900">
              Facebook
            </span>
          </button>

          {/* Twitter / X */}
          <button
            type="button"
            onClick={() => handleShare("twitter")}
            className="flex flex-col items-center justify-center py-5 px-3 rounded-2xl border border-stone-200 hover:border-black hover:bg-black/5 transition-all group active:scale-95 shadow-2xs"
          >
            <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <TwitterXIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-semibold text-stone-700 group-hover:text-stone-900">
              Twitter
            </span>
          </button>

          {/* Telegram */}
          <button
            type="button"
            onClick={() => handleShare("telegram")}
            className="flex flex-col items-center justify-center py-5 px-3 rounded-2xl border border-stone-200 hover:border-[#0088cc] hover:bg-[#0088cc]/5 transition-all group active:scale-95 shadow-2xs"
          >
            <div className="w-12 h-12 rounded-full bg-[#0088cc]/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <TelegramIcon className="w-6 h-6 text-[#0088cc]" />
            </div>
            <span className="text-sm font-semibold text-stone-700 group-hover:text-stone-900">
              Telegram
            </span>
          </button>

          {/* Copy Link */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex flex-col items-center justify-center py-5 px-3 rounded-2xl border border-stone-200 hover:border-stone-400 hover:bg-stone-50 transition-all group active:scale-95 shadow-2xs relative"
          >
            <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform text-stone-700">
              {copied ? (
                <Check className="w-5 h-5 text-success" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </div>
            <span className="text-sm font-semibold text-stone-700 group-hover:text-stone-900">
              {copied ? "Copied!" : "Copy Link"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
