"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import { useTranslation } from "@/contexts/LanguageContext";
import HowItWorksCarousel from "@/components/common/HowItWorksCarousel";

interface Chadhava {
  _id: string;
  title: string;
  location: string;
  description: string;
  imageUrl: string;
  price: number;
  slug: string;
  subtitle?: string;
  buttonText?: string;
}

export default function ChadhavaPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<Chadhava[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/chadhava")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setItems(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const howItWorksSteps = [
    {
      title: t.chadhava.step1Title,
      description: t.chadhava.step1Desc,
      imageSrc: "/images/app-banner1.jpg",
      imageAlt: "Choose a chadhava offering",
      tag: "Chadhava Seva",
      cta: t.chadhava.performSeva,
    },
    {
      title: t.chadhava.step2Title,
      description: t.chadhava.step2Desc,
      imageSrc: "/images/app-banner2.jpg",
      imageAlt: "Fill devotee information for chadhava",
      tag: "Devotee Details",
      cta: t.chadhava.performSeva,
    },
    {
      title: t.chadhava.step3Title,
      description: t.chadhava.step3Desc,
      imageSrc: "/images/app-banner3.jpg",
      imageAlt: "Receive chadhava video on WhatsApp",
      tag: "Seva Video",
      cta: t.chadhava.performSeva,
    },
    {
      title: t.chadhava.step4Title,
      description: t.chadhava.step4Desc,
      imageSrc: "/images/app-banner1.jpg",
      imageAlt: "Receive aashirwad box at the registered address",
      tag: "Aashirwad Box",
      cta: t.chadhava.performSeva,
    },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#f5f3ff]">
        {/* New Hero Section */}
        <section className="bg-linear-to-r from-[#f5f3ff] to-[#ffffff] py-8 sm:py-12 md:py-16 mb-12 overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 flex flex-col-reverse lg:flex-row items-center gap-8 lg:gap-12">
            {/* Left Content (Bottom on mobile, Left on desktop) */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1f1f1f] leading-tight mb-6 sm:mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                {t.chadhava.heroTitle}
              </h1>
              
              <ul className="space-y-3.5 sm:space-y-4 mb-8 sm:mb-10 inline-block text-left animate-fade-in-up" style={{ animationDelay: '250ms' }}>
                {[
                  t.chadhava.feature1,
                  t.chadhava.feature2,
                  t.chadhava.feature3,
                  t.chadhava.feature4
                ].map((text, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-gray-700 font-medium text-sm sm:text-base">
                    <div className="h-5 w-5 rounded-full bg-[#6869F9] flex items-center justify-center shrink-0 shadow-sm">
                       <i className="fa-solid fa-check text-[10px] text-white"></i>
                    </div>
                    {text}
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap justify-center lg:justify-start gap-3 sm:gap-4 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                <a href="#upcoming" className="inline-block bg-[#6869F9] text-white px-8 sm:px-10 py-3.5 rounded-xl font-bold text-sm sm:text-base hover:bg-[#5657e8] transition-all shadow-lg shadow-[#6869F9]/20 active:scale-95 text-center">
                  {t.chadhava.viewNow}
                </a>
                <a href="#how-it-works" className="inline-block bg-white text-gray-700 border border-gray-200 px-8 sm:px-10 py-3.5 rounded-xl font-bold text-sm sm:text-base hover:bg-gray-50 transition-all active:scale-95 text-center">
                  {t.chadhava.howItWorks}
                </a>
              </div>
            </div>

            {/* Right Image (Top on mobile, Right on desktop) */}
            <div className="flex-1 relative w-full max-w-xl lg:max-w-2xl shrink-0">
              <img 
                src="https://www.srimandir.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fimg_chadhava_web_banner.3fc5e49e.webp&w=1200&q=75" 
                alt="Chadhava Banner" 
                className="w-full h-auto object-contain transition-transform duration-700 hover:scale-105"
              />
            </div>
          </div>
        </section>

        <div id="upcoming" className="mx-auto max-w-7xl px-6 pb-20">
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-[#1f1f1f] mb-3">{t.chadhava.upcomingTitle}</h2>
            <p className="text-gray-600 max-w-3xl">
              {t.chadhava.upcomingDesc}
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6869F9]"></div>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[32px] border border-dashed border-gray-200">
              <p className="text-gray-500">{t.chadhava.noOfferings}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 lg:gap-10 md:grid-cols-2 lg:grid-cols-3">
              {items.map((item, index) => (
                <div
                  key={item._id || item.slug || index}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col p-5"
                >
                  {/* Image Section */}
                  <div className="relative h-[220px] w-full rounded-xl overflow-hidden shrink-0">
                    <img
                      src={item.imageUrl || "https://images.unsplash.com/photo-1601024445121-e5b82f020549?auto=format&fit=crop&w=800&q=80"}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Content Section */}
                  <div className="pt-5 pb-1 px-1 flex flex-col flex-1 text-left">
                    <h3 className="text-[18px] font-bold text-[#1f1f1f] mb-3 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-gray-500 text-[14px] leading-relaxed line-clamp-3 mb-6 flex-1">
                      {item.description}
                    </p>

                    <Link href={`/chadhava/${item.slug || String(item.title || '').toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')}`} className="w-full bg-[#6869F9] text-white text-[15px] font-bold tracking-wide py-3.5 rounded-lg hover:bg-[#5657e8] transition-colors flex items-center justify-center gap-1.5 mt-auto">
                      {item.buttonText || t.chadhava.performSeva}
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* -- Stats Section -- */}
          <section className="mt-20 border-t border-gray-100 pt-16">
            <h2 className="mb-2 text-2xl font-bold text-[#1f1f1f] md:text-3xl">
              {t.chadhava.sacredJourney}
            </h2>
            <p className="mb-8 text-sm text-gray-600">{t.chadhava.whyBook}</p>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl bg-gradient-to-br from-[#eff6ff] to-[#dbeafe] p-8 text-center shadow-sm border border-[#bfdbfe]/50">
                <h3 className="text-2xl font-black text-[#2563eb]">10,00,000 +</h3>
                <p className="mt-1 text-sm font-semibold text-[#3b82f6]">{t.chadhava.chadhavaDone}</p>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-[#f5f3ff] to-[#ede8ff] p-8 text-center shadow-sm border border-[#e0d9ff]/50">
                <h3 className="text-2xl font-black text-[#7c3aed]">300,000 +</h3>
                <p className="mt-1 text-sm font-semibold text-[#8b5cf6]">{t.chadhava.happyDevotees}</p>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-[#fdf2f8] to-[#fce7f3] p-8 text-center shadow-sm border border-[#fbcfe8]/50">
                <h3 className="text-2xl font-black text-[#db2777]">100 +</h3>
                <p className="mt-1 text-sm font-semibold text-[#ec4899]">{t.chadhava.famousTemples}</p>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-[#fff7ed] to-[#ffedd5] p-8 text-center shadow-sm border border-[#fed7aa]/50">
                <h3 className="text-2xl font-black text-[#d97706]">{t.chadhava.sankalp}</h3>
                <p className="mt-1 text-sm font-semibold text-[#f59e0b]">{t.chadhava.sankalpDesc}</p>
              </div>
            </div>
          </section>
        
          <HowItWorksCarousel title={t.chadhava.howItWorksTitle} steps={howItWorksSteps} />
        </div>
      </main>
    </>
  );
}


