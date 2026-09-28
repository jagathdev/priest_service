"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";

const qaMap: Record<string, string> = {
  "How do I book a Puja?": "To book a Puja, navigate to our 'Puja' page from the main menu, select the Puja that fits your needs, provide your Sankalpa (Name and Gotra), and proceed to booking. The Puja will be performed by our expert priests, and a video will be shared via WhatsApp.",
  "What is today's Panchang?": "You can view today's detailed Panchang, including Tithi, Nakshatra, and auspicious timings (like Abhijit Muhurat), by visiting our dedicated 'Panchang' page in the top navigation bar.",
  "How can I offer Chadhava?": "Offering Chadhava is simple! Go to the 'Chadhava' section, choose the temple and deity, and submit your request. Our priests will offer the Chadhava on your behalf and send you a video within 2-3 days.",
  "Show me famous temples in India.": "You can explore a curated list of sacred pilgrimages and divine temples across India directly on our 'Temples' page. There you can learn about their history and even offer charity.",
  "Can I book an astrologer consultation?": "Yes, absolutely! We offer personalized consultations with expert Vedic astrologers. Please visit our 'Astro Tools' section to explore your options and book an appointment.",
};

const suggestedQuestions = Object.keys(qaMap);

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{ role: "ai" | "user"; text: string }[]>([
    { role: "ai", text: "Namaste! 🙏 Welcome to AstroVed. How can I assist you on your spiritual journey today?" },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { role: "user", text }]);
    setMessage("");

    // Simulate AI typing and responding
    setTimeout(() => {
      const response = qaMap[text as keyof typeof qaMap] || "I'm still learning! For specific questions that I cannot answer yet, please feel free to explore our website or contact our support team for personal assistance.";
      setMessages((prev) => [...prev, { role: "ai", text: response }]);
    }, 600);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(220,38,38,0.3)] border border-gray-100 ${
          isOpen ? "scale-0 opacity-0 pointer-events-none" : "scale-100 opacity-100"
        }`}
        aria-label="Open AI Assistant"
      >
        <div className="relative flex h-full w-full items-center justify-center rounded-full bg-linear-to-br from-red-50 to-orange-50 overflow-hidden p-3">
          <img
            src="/images/logo.svg"
            alt="AstroVed Logo"
            className="max-h-full max-w-full object-contain"
          />
        </div>
      </button>

      {/* Chat Interface */}
      <div
        className={`fixed bottom-6 right-6 z-50 flex w-[320px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-300 md:w-[380px] border border-gray-200 origin-bottom-right ${
          isOpen
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-50 opacity-0 translate-y-8 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-linear-to-r from-[#8b2323] to-[#b33030] px-4 py-3.5 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-20 items-center justify-center rounded bg-white/20 backdrop-blur-sm p-1.5">
               <img
                 src="/images/logo.svg"
                 alt="AstroVed Logo"
                 className="max-h-full max-w-full object-contain brightness-0 invert"
               />
            </div>
            <div>
              <h3 className="font-semibold text-sm">AstroVed AI</h3>
              <p className="text-xs text-red-100">Online & ready to help</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/20 transition-colors"
            aria-label="Close chat"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Message Area */}
        <div className="flex-1 p-4 bg-gray-50/80 max-h-[450px] overflow-y-auto space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              {msg.role === "ai" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-[#8b2323] shadow-sm overflow-hidden p-1.5">
                   <img
                     src="/images/logo.svg"
                     alt="AstroVed Logo"
                     className="max-h-full max-w-full object-contain"
                   />
                </div>
              )}
              <div
                className={`p-3.5 rounded-2xl shadow-sm text-[14px] leading-relaxed max-w-[85%] ${
                  msg.role === "user"
                    ? "bg-[#8b2323] text-white rounded-tr-sm"
                    : "bg-white border border-gray-100 text-gray-700 rounded-tl-sm"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions (Always visible to allow asking again) */}
        <div className="bg-white px-4 py-2 border-t border-gray-100">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Suggested Questions</p>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(q)}
                className="shrink-0 whitespace-nowrap bg-red-50/50 border border-red-100 hover:bg-red-50 hover:border-red-200 text-[#8b2323] text-[12px] py-1.5 px-3 rounded-full transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-100 bg-white p-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(message);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask anything..."
              className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-[14px] focus:border-[#8b2323] focus:outline-none focus:ring-1 focus:ring-[#8b2323] transition-colors"
            />
            <button
              type="submit"
              disabled={!message.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#8b2323] text-white transition-all hover:bg-[#701c1c] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              <i className="fas fa-paper-plane text-sm translate-y-px -translate-x-1px"></i>
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
