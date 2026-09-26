"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface BannerSlide {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  topBadge: string;
  bannerLine1: string;
  bannerLine2: string;
  bannerLine3: string;
  bannerLine4: string;
  location: string;
  image: string;
  ctaText: string;
  ctaLink: string;
}

const slides: BannerSlide[] = [
  {
    id: "shani-statue",
    badge: "SPECIAL SHANI POOJA",
    title: "Sade Sati Shani Shanti Puja & Oil Abhishekam at the 23-Foot Shani Statue",
    subtitle: "Shani Shanti Puja & Oil Abhishekam for Relief from the Harsh Effects of Sade Sati",
    topBadge: "Shani Purnima Special",
    bannerLine1: "Sade Sati",
    bannerLine2: "Shani Shanti Puja",
    bannerLine3: "Oil Abhishekam",
    bannerLine4: "at the 23-Foot\nShani Statue",
    location: "Bannanje Shri Shani Devara Kshetra",
    image: "/shani_statue_hero_banner.png",
    ctaText: "Book Puja Now",
    ctaLink: "/puja/sade-sati-shani-shanti-puja",
  },
  {
    id: "subrahmanya",
    badge: "SPECIAL TUESDAY SANKALPAM",
    title: "Subrahmanya Swamy Abhishekam at Madurai Temple for success and fulfillment of wishes.",
    subtitle: "A special Tuesday Abhishekam for devotees seeking the courage to overcome obstacles, fulfillment of efforts, and success.",
    topBadge: "Special Tuesday Sankalpam",
    bannerLine1: "Shri",
    bannerLine2: "Subrahmanya Swamy",
    bannerLine3: "Abhishekam Seva",
    bannerLine4: "for Wish Fulfillment",
    location: "Madurai Temple",
    image: "/subrahmanya_swamy_hero.png",
    ctaText: "Book Puja Now",
    ctaLink: "/puja/subrahmanya-swamy-abhishekam",
  },
  {
    id: "mahalakshmi",
    badge: "SPECIAL FRIDAY SANKALPAM",
    title: "Maha Lakshmi Kumkumarchana for Wealth, Abundance & Prosperity.",
    subtitle: "Sacred Friday Kumkumarchana ritual at Kolhapur Mahalakshmi Temple to attract wealth, business success, and joy.",
    topBadge: "Maha Lakshmi Special",
    bannerLine1: "Maha Lakshmi",
    bannerLine2: "Kumkumarchana",
    bannerLine3: "Seva",
    bannerLine4: "for Prosperity & Joy",
    location: "Mahalakshmi Temple",
    image: "/images/Lakshmi-Homam.jpg",
    ctaText: "Book Puja Now",
    ctaLink: "/puja/mahalakshmi-kumkumarchana",
  },
  {
    id: "mrityunjaya",
    badge: "SPECIAL SOMVAR SANKALPAM",
    title: "Maha Mrityunjaya Homa for Health, Healing & Long Life.",
    subtitle: "Powerful Vedic chantings and oblations to Lord Shiva for immunity, healing, protection, and overcoming health hurdles.",
    topBadge: "Maha Mrityunjaya Special",
    bannerLine1: "Maha Mrityunjaya",
    bannerLine2: "Homa Seva",
    bannerLine3: "for Healing",
    bannerLine4: "at Trimbakeshwar Temple",
    location: "Trimbakeshwar Temple",
    image: "/images/Navagraha-Shanti-Puja.jpg",
    ctaText: "Book Puja Now",
    ctaLink: "/puja/maha-mrityunjaya-homa",
  },
  {
    id: "ganesh",
    badge: "SPECIAL SANKASHTI SANKALPAM",
    title: "Sankashti Ganesh Puja for Removal of Obstacles & New Beginnings.",
    subtitle: "Special Modak and Durva offering to Bhagwan Ganesha at Ashtavinayak Temple to ensure success in all endeavors.",
    topBadge: "Sankashti Ganesha Special",
    bannerLine1: "Sankashti Ganesha",
    bannerLine2: "Abhishekam Seva",
    bannerLine3: "for Obstacle Removal",
    bannerLine4: "at Ashtavinayak Temple",
    location: "Ashtavinayak Temple",
    image: "/images/Ganesh-Chaturthi-Mahapuja.jpg",
    ctaText: "Book Puja Now",
    ctaLink: "/puja/sankashti-ganesh-puja",
  }
];

export default function HeroSection() {
  const [activeSlide, setActiveSlide] = useState(0);

  // Auto-advance slides every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const current = slides[activeSlide];

  return (
    <section className="relative w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-12 py-8 md:py-12 bg-white my-2 overflow-hidden">
      

      {/* Background Circular Mandala Watermark inside Hero */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.035] bg-center bg-no-repeat bg-contain z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 500'%3E%3Ccircle cx='250' cy='250' r='240' fill='none' stroke='%3C%238b1e10' stroke-width='1.5'/%3E%3Ccircle cx='250' cy='250' r='200' fill='none' stroke='%3C%238b1e10' stroke-width='1' stroke-dasharray='4 4'/%3E%3Ccircle cx='250' cy='250' r='160' fill='none' stroke='%3C%238b1e10' stroke-width='1.5'/%3E%3Ccircle cx='250' cy='250' r='110' fill='none' stroke='%3C%238b1e10' stroke-width='1'/%3E%3Cpath d='M250 10 L250 490 M10 250 L490 250 M80 80 L420 420 M420 80 L80 420' stroke='%3C%238b1e10' stroke-width='0.5'/%3E%3C/svg%3E")`
        }}
      />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-10 xl:gap-14">
        
        {/* ── Left Content (Text & CTA) ── Fixed starting point at top, space left above CTA button */}
        <div className="flex-1 text-left flex flex-col justify-between h-auto min-h-[380px] sm:min-h-[440px] lg:min-h-[500px] w-full max-w-[640px] pt-2 pb-1">
          
          {/* Top Block: Always starts at fixed top position */}
          <div>
            {/* Top Sub-header Badge with Custom Vector Lotus SVG */}
            <div className="flex items-center gap-2 mb-3.5">
              <svg className="w-5 h-5 text-[#8b1e10] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C12 2 10.2 5.5 10.2 8C10.2 9.8 11 11.2 12 12C13 11.2 13.8 9.8 13.8 8C13.8 5.5 12 2 12 2Z" />
                <path d="M12 12C10.2 10.8 7.5 9.8 5.5 10.8C4 11.5 3 12.8 3 14.2C3 16.5 6.5 18 12 18.5C17.5 18 21 16.5 21 14.2C21 12.8 20 11.5 18.5 10.8C16.5 9.8 13.8 10.8 12 12Z" opacity="0.8" />
                <path d="M12 18.5C7.8 18.5 4.2 17 1.5 15.2C2.8 18.8 6.8 21.5 12 21.5C17.2 21.5 21.2 18.8 22.5 15.2C19.8 17 16.2 18.5 12 18.5Z" />
              </svg>
              <span className="text-[#8b1e10] font-bold text-xs sm:text-sm tracking-widest uppercase">
                {current.badge}
              </span>
            </div>

            {/* Main Title */}
            <h1 className="text-3xl sm:text-4xl md:text-[42px] lg:text-[44px] font-serif font-bold text-[#221f20] leading-[1.22] tracking-tight mb-4 transition-all duration-300">
              {current.title}
            </h1>

            {/* Subtitle / Description */}
            <p className="text-stone-600 text-base sm:text-lg md:text-[19px] leading-relaxed max-w-[580px]">
              {current.subtitle}
            </p>
          </div>

          {/* Bottom Block: CTA Button & Social Proof Banner (Space stays above button when content is shorter) */}
          <div className="mt-auto pt-6 flex flex-col items-start">
            {/* CTA Button */}
            <div className="mb-5 sm:mb-6 w-full">
              <Link
                href={current.ctaLink}
                className="inline-flex items-center justify-between gap-6 bg-[#00b050] hover:bg-[#009b46] active:scale-95 text-white font-extrabold text-xl sm:text-2xl px-9 py-4 rounded-full shadow-xl shadow-green-600/25 transition-all duration-200 group w-full max-w-[380px] sm:max-w-[420px]"
              >
                <span>{current.ctaText}</span>
                <div className="w-10 h-10 rounded-full bg-white text-[#00b050] flex items-center justify-center shadow-md group-hover:translate-x-0.5 transition-transform shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            </div>

            {/* Social Proof / Trust Banner - Reduced Width & Height */}
            <div className="border border-stone-200/90 bg-white/95 backdrop-blur-sm rounded-xl p-2.5 sm:p-3 shadow-sm flex items-center justify-between gap-2 sm:gap-3.5 w-full max-w-[380px] sm:max-w-[400px]">
              {/* Sun Icon Section */}
              <div className="flex items-center gap-2 flex-1">
                <div className="text-stone-400 shrink-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="4" strokeWidth="1.5" />
                    <path strokeWidth="1.5" strokeLinecap="round" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" />
                  </svg>
                </div>
                <p className="text-[10px] sm:text-[11px] text-stone-900 font-bold leading-tight">
                  One of India's most<br />loved devotional<br />platforms
                </p>
              </div>

              <div className="w-[1px] h-6 bg-stone-200 shrink-0" />

              {/* Devotees Count */}
              <div className="text-center px-1 shrink-0">
                <p className="text-[#8b1e10] font-black text-base sm:text-lg leading-none">10L+</p>
                <p className="text-[9px] sm:text-[10px] text-stone-500 font-medium mt-0.5">Happy Devotees</p>
              </div>

              <div className="w-[1px] h-6 bg-stone-200 shrink-0" />

              {/* Secure Guarantee */}
              <div className="text-center px-1 shrink-0">
                <p className="text-[#8b1e10] font-black text-base sm:text-lg leading-none">100%</p>
                <p className="text-[9px] sm:text-[10px] text-stone-500 font-medium mt-0.5">Secure</p>
              </div>
            </div>
          </div>

        </div>

        {/* ── Right Content (Hero Banner Card) ── Increased width & image only ── */}
        <div className="w-full lg:w-[540px] xl:w-[650px] 2xl:w-[720px] shrink-0 flex flex-col items-center">
          
          {/* Pure Full-Bleed Banner Card (Image Only, No Wordings) */}
          <div className="w-full relative rounded-3xl overflow-hidden shadow-2xl border border-stone-200 bg-[#160802] h-[380px] sm:h-[440px] md:h-[470px] lg:h-[480px] xl:h-[500px] shrink-0 transition-all duration-500 group">
            
            {/* Full Background Image - Specific to active slide */}
            <Image
              key={current.id}
              src={current.image}
              alt={current.title}
              fill
              className="object-cover object-center"
              priority
            />

          </div>

          {/* Slider Dots Navigation inside Hero */}
          <div className="flex items-center justify-center gap-2.5 mt-5">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`transition-all duration-300 rounded-full ${
                  index === activeSlide
                    ? "w-7 h-2 bg-[#00b050]"
                    : "w-2 h-2 bg-stone-300 hover:bg-stone-400"
                }`}
              />
            ))}
          </div>

        </div>

      </div>

      {/* ── Bottom Features Trust Strip (Full Width below Hero row) ── */}
      <div className="relative z-10 mt-8 md:mt-10 border border-stone-200/90 bg-white/95 backdrop-blur-sm rounded-2xl p-3.5 sm:p-4.5 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 items-center justify-between gap-4 md:gap-2 divide-y sm:divide-y-0 lg:divide-x divide-stone-200">
          
          {/* Feature 1: Puja Video */}
          <div className="flex items-center justify-start gap-3 px-2 sm:px-4 py-1.5 sm:py-0">
            <div className="text-[#00b050] shrink-0">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
              </svg>
            </div>
            <span className="text-xs sm:text-sm font-bold text-stone-800 leading-tight">
              Puja Video Delivered Within 48 Hours
            </span>
          </div>

          {/* Feature 2: Verified Purohits */}
          <div className="flex items-center justify-start gap-3 px-2 sm:px-4 py-1.5 sm:py-0">
            <div className="text-[#0084ff] shrink-0">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
              </svg>
            </div>
            <span className="text-xs sm:text-sm font-bold text-stone-800 leading-tight">
              Verified & Experienced Purohits
            </span>
          </div>

          {/* Feature 3: Sacred Temples */}
          <div className="flex items-center justify-start gap-3 px-2 sm:px-4 py-1.5 sm:py-0">
            <div className="text-[#8b1e10] shrink-0">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2L9 6H15L12 2ZM8 7L6 11H18L16 7H8ZM5 12L3 17H21L19 12H5ZM2 18V21H22V18H2Z" />
              </svg>
            </div>
            <span className="text-xs sm:text-sm font-bold text-stone-800 leading-tight">
              Pujas Performed in Sacred Temples
            </span>
          </div>

          {/* Feature 4: Authentic Vedic Rituals */}
          <div className="flex items-center justify-start gap-3 px-2 sm:px-4 py-1.5 sm:py-0">
            <div className="text-[#d97706] shrink-0">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2c-.55 0-1 .45-1 1v1.17C8.61 4.72 7 6.67 7 9c0 2.21 1.79 4 4 4v1H8c-.55 0-1 .45-1 1v5c0 .55.45 1 1 1h8c.55 0 1-.45 1-1v-5c0-.55-.45-1-1-1h-3v-1c2.21 0 4-1.79 4-4 0-2.33-1.61-4.28-4-4.83V3c0-.55-.45-1-1-1z" />
              </svg>
            </div>
            <span className="text-xs sm:text-sm font-bold text-stone-800 leading-tight">
              100% Authentic Vedic Rituals
            </span>
          </div>

        </div>
      </div>

    </section>
  );
}
