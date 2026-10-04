"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import WishlistButton from "@/components/common/WishlistButton";

// Imported assets
import step1Img from "@/assets/images/common/steo_1.png";
import step2Img from "@/assets/images/common/step_2.png";
import step3Img from "@/assets/images/common/step_3.png";
import step4Img from "@/assets/images/common/step_4.png";
import navagrahaImg from "@/assets/images/puja/Navagraha-Shanti-Puja.jpg";
import ganeshImg from "@/assets/images/puja/Ganesh-Chaturthi-Mahapuja.jpg";
import maaKaliImg from "@/assets/images/puja/maa-kali.jpg";
import maaSaraswathiImg from "@/assets/images/puja/Maa-saraswathi.jpg";
import lakshmiHomamImg from "@/assets/images/homa/Lakshmi-Homam.jpg";
import HeroSection from "@/components/home/HeroSection";
import ReviewsSection from "@/components/common/ReviewsSection";

export default function DashboardClient({ initialHeroBanners, initialPujas }: { initialHeroBanners?: any[], initialPujas?: any[] }) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [pujas, setPujas] = useState<any[]>(initialPujas || []);
  const [fetchedPujas, setFetchedPujas] = useState(true);

  return (
    <main className="min-h-screen bg-white text-[#1f1f1f] font-sans">
      <Navbar />

      {/* ── 1. Hero Section ── */}
      <HeroSection initialBanners={initialHeroBanners} />

      {/* ── 2. Steps Section ── "Your Journey to Divine Blessings" ── */}
      <section className="py-12 sm:py-16 md:py-20 bg-[#fdfbf7] border-y border-[#f0e4d0] relative overflow-hidden">
        {/* Background Mandala Watermarks */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.035] bg-center bg-no-repeat bg-contain z-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 500'%3E%3Ccircle cx='250' cy='250' r='240' fill='none' stroke='%3C%238b1e10' stroke-width='1.5'/%3E%3Ccircle cx='250' cy='250' r='200' fill='none' stroke='%3C%238b1e10' stroke-width='1' stroke-dasharray='4 4'/%3E%3Ccircle cx='250' cy='250' r='160' fill='none' stroke='%3C%238b1e10' stroke-width='1.5'/%3E%3C/svg%3E")`
          }}
        />

        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 relative z-10">

          {/* Section Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#221f20] tracking-tight">
              Your Journey to <span className="text-[#F47820]">Divine Blessings</span>
            </h2>

          </div>

          {/* Process Container */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-3 lg:gap-5 relative z-10">

            {/* Step 1 */}
            <div className="flex flex-col items-center group text-center flex-1 w-full max-w-[210px]">
              <div className="w-24 h-24 sm:w-28 sm:h-28 relative mb-3 group-hover:scale-105 transition-all">
                <Image
                  src={step1Img}
                  alt="Choose Your Puja"
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="font-serif font-bold text-[#F47820] text-sm sm:text-base leading-tight">
                Choose Your Puja
              </h3>
            </div>

            {/* Arrow 1 (Desktop) */}
            <div className="hidden md:flex text-[#c68a36] shrink-0 mb-6">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center group text-center flex-1 w-full max-w-[210px]">
              <div className="w-24 h-24 sm:w-28 sm:h-28 relative mb-3 group-hover:scale-105 transition-all">
                <Image
                  src={step2Img}
                  alt="Share Your Details"
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="font-serif font-bold text-[#F47820] text-sm sm:text-base leading-tight">
                Share Your Details
              </h3>
            </div>

            {/* Arrow 2 (Desktop) */}
            <div className="hidden md:flex text-[#c68a36] shrink-0 mb-6">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center group text-center flex-1 w-full max-w-[210px]">
              <div className="w-24 h-24 sm:w-28 sm:h-28 relative mb-3 group-hover:scale-105 transition-all">
                <Image
                  src={step3Img}
                  alt="Puja Is Performed"
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="font-serif font-bold text-[#F47820] text-sm sm:text-base leading-tight">
                Puja Is Performed
              </h3>
            </div>

            {/* Arrow 3 (Desktop) */}
            <div className="hidden md:flex text-[#c68a36] shrink-0 mb-6">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center group text-center flex-1 w-full max-w-[210px]">
              <div className="w-24 h-24 sm:w-28 sm:h-28 relative mb-3 group-hover:scale-105 transition-all">
                <Image
                  src={step4Img}
                  alt="Receive Divine Blessings"
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="font-serif font-bold text-[#F47820] text-sm sm:text-base leading-tight">
                Receive Divine Blessings
              </h3>
            </div>

          </div>

        </div>
      </section>

      {/* ── 3. Our Pujas Section ── */}
      <section className="py-12 bg-white">
        <div className="max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-10">

          {/* Header Row & Category Filters */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#221f20] font-serif">
              Our <span className="text-[#F47820]">Pujas</span>
            </h2>

            {/* Filter Pills */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <Link href="/puja" className="bg-[#00b050] text-white font-bold px-5 py-2 rounded-full text-xs sm:text-sm shadow-sm hover:bg-[#009b46] transition-colors">
                All
              </Link>

              <Link href="/puja" className="bg-white border border-stone-200 text-stone-700 hover:border-stone-400 font-semibold px-4 py-2 rounded-full text-xs sm:text-sm transition-colors">
                Diety
              </Link>

              <Link href="/puja" className="bg-white border border-stone-200 text-stone-700 hover:border-stone-400 font-semibold px-4 py-2 rounded-full text-xs sm:text-sm transition-colors">
                Dosha
              </Link>

              <Link href="/puja" className="bg-white border border-stone-200 text-stone-700 hover:border-stone-400 font-semibold px-4 py-2 rounded-full text-xs sm:text-sm transition-colors">
                Benefit
              </Link>
            </div>
          </div>

          {/* Puja Cards Grid (Maximum 6 active Pujas loaded from Express API) */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8 w-full max-w-full xl:max-w-none mx-auto">
            {!fetchedPujas ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={`skeleton-${i}`} className="bg-white rounded-3xl h-[450px] animate-pulse border border-stone-200 p-3 shadow-sm flex flex-col">
                  <div className="w-full h-[235px] bg-stone-100 rounded-2xl mb-4 flex items-center justify-center">
                    <svg className="w-8 h-8 text-stone-300 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                  <div className="w-1/3 h-3 bg-stone-200 rounded-full mx-auto mb-4" />
                  <div className="w-3/4 h-5 bg-stone-200 rounded-full mb-3" />
                  <div className="w-1/2 h-4 bg-stone-100 rounded-full mb-auto" />
                  <div className="flex justify-between items-end mt-4">
                    <div className="w-20 h-6 bg-stone-200 rounded-full" />
                    <div className="w-32 h-10 bg-[#00b050]/20 rounded-full" />
                  </div>
                </div>
              ))
            ) : pujas.length === 0 ? (
              <div className="col-span-full py-12 text-center text-stone-400 font-medium">No active Pujas found.</div>
            ) : (
              pujas.map((p) => {
                const priceVal = p.price
                  ? `₹${p.price}`
                  : p.packages?.[0]?.priceINR
                    ? `₹${p.packages[0].priceINR}`
                    : p.packages?.[0]?.price
                      ? `₹${p.packages[0].price}`
                      : "₹516";
                const slugVal = p.slug || (p.title ? p.title.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-") : "");
                const topTagVal = p.badge || p.shortTitle || p.subtitle;
                const descriptionVal = p.description || p.subtitle;
                return (
                  <PujaCard
                    key={p._id}
                    id={p._id}
                    imageSrc={p.imageUrl ? (p.imageUrl.startsWith("http") || p.imageUrl.startsWith("/") ? p.imageUrl : `/${p.imageUrl}`) : ""}
                    topTag={topTagVal}
                    title={p.title}
                    subtitle={descriptionVal}
                    location={p.location || p.filterLocation || p.templeVenue}
                    date={p.date}
                    price={priceVal}
                    slug={slugVal}
                  />
                );
              })
            )}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/puja"
              className="inline-block text-[#00b050] font-extrabold px-8 py-3 rounded-full border-2 border-[#00b050] hover:bg-green-50 active:scale-95 transition-all text-base shadow-sm"
            >
              View All Pujas
            </Link>
          </div>
        </div>
      </section>

      {/* ── 4. Puja Gallery Section ── */}
      <section className="pt-10 pb-8 sm:pt-14 sm:pb-12 bg-white relative overflow-hidden">
        {/* Background Typography at Top */}
        <h2 className="text-[75px] sm:text-[115px] md:text-[150px] lg:text-[185px] font-bold text-stone-200/90 font-serif tracking-tight text-center select-none pointer-events-none whitespace-nowrap absolute top-1 left-1/2 -translate-x-1/2 z-0 leading-none">
          Puja Gallery
        </h2>

        {/* Marquee Row Container anchored at Bottom of Font */}
        <div className="relative z-10 overflow-hidden w-full pt-16 sm:pt-24 pb-2 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-16 sm:before:w-28 before:bg-gradient-to-r before:from-white before:to-transparent before:z-20 after:absolute after:right-0 after:top-0 after:bottom-0 after:w-16 sm:after:w-28 after:bg-gradient-to-l after:from-white after:to-transparent after:z-20">
          <div className="flex animate-marquee gap-4 sm:gap-6 items-end">
            {/* Repeat list twice for continuous infinite marquee */}
            {[...galleryImages, ...galleryImages].map((img, idx) => (
              <div
                key={idx}
                className={`relative shrink-0 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm border border-stone-200/80 group cursor-pointer transition-transform duration-300 hover:scale-[1.02] ${img.aspect}`}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Trust Badges Strip (Marquee on 1024px and Tablet screens) ── */}
      <div className="w-full bg-[#f0f8f1] border-y border-green-100 py-6 sm:py-8 overflow-hidden">
        {/* Continuous Marquee on 1024px and Tablet screens (< xl) */}
        <div className="xl:hidden overflow-hidden w-full relative">
          <div className="flex animate-marquee gap-8 sm:gap-12 items-center">
            {[
              { icon: "🎥", text: "Puja Video Delivered Within 48 hours" },
              { icon: "✓", text: "Verified & Experienced Pandits" },
              { icon: "🏛", text: "Puja Performed in Sacred Temples" },
              { icon: "📜", text: "100% Authentic Vedic Rituals" },
              { icon: "🎥", text: "Puja Video Delivered Within 48 hours" },
              { icon: "✓", text: "Verified & Experienced Pandits" },
              { icon: "🏛", text: "Puja Performed in Sacred Temples" },
              { icon: "📜", text: "100% Authentic Vedic Rituals" }
            ].map((b, idx) => (
              <div key={idx} className="shrink-0">
                <Badge icon={b.icon} text={b.text} />
              </div>
            ))}
          </div>
        </div>

        {/* Standard flex layout on XL desktop screens (>= 1280px) */}
        <div className="hidden xl:flex max-w-[1350px] mx-auto items-center justify-center gap-12 px-10">
          <Badge icon="🎥" text="Puja Video Delivered Within 48 hours" />
          <Badge icon="✓" text="Verified & Experienced Pandits" />
          <Badge icon="🏛" text="Puja Performed in Sacred Temples" />
          <Badge icon="📜" text="100% Authentic Vedic Rituals" />
        </div>
      </div>

      {/* ── 6. FAQ Section ── */}
      <section id="faq-section" className="py-16 bg-white">
        <div className="max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-10 flex flex-col md:flex-row gap-12">
          {/* Left: Doubts */}
          <div className="md:w-1/3">

            <h2 className="text-4xl md:text-5xl font-bold text-[#4a2e21] font-serif mb-4 leading-tight">Doubts?<br />We re Here.</h2>
            <p className="text-gray-600 mb-8 text-sm max-w-[250px]">
              Our devotee care team is available in 11 languages, 12 hours a day. Reach them on WhatsApp, phone, or email.
            </p>
            <button className="bg-[#F47820] text-white px-8 py-3 rounded-full font-bold shadow-md hover:bg-[#008c51] transition-colors">
              Speak to Devotee Care
            </button>
          </div>

          {/* Right: Accordion */}
          <div className="md:w-2/3 flex flex-col gap-3">
            {faqList.map((faq, idx) => (
              <AccordionItem
                key={idx}
                question={faq.question}
                answer={faq.answer}
                isOpen={openFaqIndex === idx}
                onToggle={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. Footer ── */}
      <footer className="bg-[#fdfbf7] text-stone-700 pt-16 pb-12 sm:pb-16 border-t border-[#f0e4d0] relative">
        <div className="max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-10 text-center border-b border-stone-200/80 pb-12 mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#1f1a17] mb-4 leading-tight">
            A Sacred Path to Divine Blessings Book Your<br className="hidden sm:inline" /> Sacred Puja
          </h2>
          <p className="text-stone-600 text-sm sm:text-base mb-8 font-medium">Connect with divine blessings through authentic Vedic rituals.</p>
          <div className="flex items-center justify-center mb-8 flex-wrap">
            <span className="text-[#1f1a17] font-extrabold text-base sm:text-lg mr-4">Follow us —</span>
            <ul className="flex items-center justify-center gap-3">
              <li>
                <a href="https://www.facebook.com/astroved" aria-label="Facebook" rel="nofollow" target="_blank" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm border border-stone-200 text-[#1877F2] transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:border-[#1877F2] hover:shadow-lg hover:shadow-[#1877F2]/20">
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                </a>
              </li>
              <li>
                <a href="https://twitter.com/astroved" aria-label="X (formerly Twitter)" rel="nofollow" target="_blank" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm border border-stone-200 text-black transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:border-black hover:shadow-lg hover:shadow-black/10">
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                </a>
              </li>
              <li>
                <a href="https://www.youtube.com/channel/UCLzw8opUlMnSA2TQfj34K9w" aria-label="YouTube" rel="nofollow" target="_blank" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm border border-stone-200 text-[#FF0000] transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:border-[#FF0000] hover:shadow-lg hover:shadow-[#FF0000]/20">
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.015 3.015 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.376.55 9.376.55s7.505 0 9.377-.55a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                </a>
              </li>
              <li>
                <a href="https://www.instagram.com/astroved/" aria-label="Instagram" rel="nofollow" target="_blank" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm border border-stone-200 text-[#E1306C] transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:border-[#E1306C] hover:shadow-lg hover:shadow-[#E1306C]/20">
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                </a>
              </li>
              <li>
                <a href="https://www.linkedin.com/company/astroved-com" aria-label="LinkedIn" rel="nofollow" target="_blank" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm border border-stone-200 text-[#0A66C2] transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:border-[#0A66C2] hover:shadow-lg hover:shadow-[#0A66C2]/20">
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                </a>
              </li>
              <li>
                <a href="https://whatsapp.com/channel/0029VaAG971AInPbquhYnI3u" aria-label="WhatsApp Channel" rel="nofollow" target="_blank" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm border border-stone-200 text-[#25D366] transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:border-[#25D366] hover:shadow-lg hover:shadow-[#25D366]/20">
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                </a>
              </li>
            </ul>
          </div>
          <Link href="/puja" className="bg-[#00b050] hover:bg-[#009644] active:scale-95 text-white font-extrabold px-8 py-3.5 rounded-full text-sm sm:text-base transition-all inline-flex items-center gap-2.5 shadow-md shadow-green-600/20">
            Find the Right Puja <div className="bg-white text-[#00b050] rounded-full w-5 h-5 flex items-center justify-center shadow-sm"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg></div>
          </Link>
        </div>

        <div className="max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-10 flex flex-col lg:flex-row justify-between gap-12 lg:gap-8 mb-10">
          {/* Logo Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="https://cdn.astroved.com/images/priestservice/priest-services.jpg" alt="AstroVed Priest Service" className="h-10 sm:h-12 w-auto object-contain grayscale-0" />
            </div>
            <p className="text-xs sm:text-sm text-stone-600 max-w-xs leading-relaxed font-medium">
              Priest Service is a spiritual platform that enables devotees to book authentic Vedic pujas at sacred temples across India.
            </p>
          </div>

          {/* EXPLORE */}
          <div>
            <h4 className="text-[#1f1a17] font-bold text-sm tracking-[0.15em] uppercase mb-6">Explore</h4>
            <ul className="flex flex-col gap-4 text-sm text-stone-600 font-medium">
              <li><Link href="/" className="hover:text-[#00b050] transition-colors">Home</Link></li>
              <li><Link href="/puja" className="hover:text-[#00b050] transition-colors">Puja</Link></li>
              <li><Link href="/profile" className="hover:text-[#00b050] transition-colors">Account</Link></li>
            </ul>
          </div>

          {/* SUPPORT */}
          <div>
            <h4 className="text-[#1f1a17] font-bold text-sm tracking-[0.15em] uppercase mb-6">Support</h4>
            <ul className="flex flex-col gap-4 text-sm text-stone-600 font-medium">
              <li><Link href="mailto:support@astroved.com" className="hover:text-[#00b050] transition-colors">support@astroved.com</Link></li>
              <li><Link href="/profile?tab=support" className="hover:text-[#00b050] transition-colors">Contact Us</Link></li>
              <li><Link href="https://wa.me/919677391109" target="_blank" rel="noopener noreferrer" className="hover:text-[#00b050] transition-colors">WhatsApp: +91 9677391109</Link></li>
            </ul>
          </div>

          {/* CONNECT */}
          <div>
            <h4 className="text-[#1f1a17] font-bold text-sm tracking-[0.15em] uppercase mb-6">Connect</h4>
            <ul className="flex flex-col gap-6 text-sm text-stone-600 font-medium">
              <li>
                <strong className="block text-[#1f1a17] mb-1 font-semibold">Customer Care</strong>
                +91 9677391108<br />+91 44 43419898
              </li>
              <li>
                <strong className="block text-[#1f1a17] mb-1 font-semibold">Toll Free</strong>
                1800 102 9098
              </li>

            </ul>
          </div>

          {/* CORPORATE OFFICE */}
          <div>
            <h4 className="text-[#1f1a17] font-bold text-sm tracking-[0.15em] uppercase mb-6">Corporate Office</h4>
            <div className="text-sm text-stone-600 font-medium leading-loose">
              4th Floor, A-Block, Prince Info Park,<br />
              Plot No. 81-B, 2nd Main Road,<br />
              Ambattur Industrial Estate, Chennai 600058.<br /><br />
              Phone: +91-44-43419898
            </div>
          </div>
        </div>

        <div className="border-t border-stone-200/80 pt-8 text-center text-xs text-stone-500 font-medium">
          © 2026 Astroved PriestService. All rights reserved.
        </div>
      </footer>
    </main>
  );
}

// --- Helper Data & Components ---

const galleryImages = [
  {
    src: ganeshImg,
    alt: "Ganesh Chaturthi Mahapuja",
    aspect: "w-[160px] sm:w-[190px] h-[270px] sm:h-[310px]", // Tall
  },
  {
    src: navagrahaImg,
    alt: "Navagraha Shanti Puja",
    aspect: "w-[210px] sm:w-[250px] h-[160px] sm:h-[180px]", // Small
  },
  {
    src: maaKaliImg,
    alt: "Maa Kali Puja",
    aspect: "w-[200px] sm:w-[240px] h-[170px] sm:h-[190px]", // Medium-small
  },
  {
    src: lakshmiHomamImg,
    alt: "Lakshmi Homam",
    aspect: "w-[210px] sm:w-[250px] h-[150px] sm:h-[165px]", // Small
  },
  {
    src: maaSaraswathiImg,
    alt: "Maa Saraswathi Puja",
    aspect: "w-[160px] sm:w-[190px] h-[310px] sm:h-[350px]", // Very Tall
  },
  {
    src: ganeshImg,
    alt: "Sacred Homam Fire",
    aspect: "w-[210px] sm:w-[250px] h-[160px] sm:h-[180px]", // Medium-small
  },
  {
    src: lakshmiHomamImg,
    alt: "Vedic Priest at Kolam Altar",
    aspect: "w-[160px] sm:w-[190px] h-[310px] sm:h-[350px]", // Very Tall
  },
  {
    src: navagrahaImg,
    alt: "Shiva Lingam Abhishekam",
    aspect: "w-[160px] sm:w-[190px] h-[310px] sm:h-[350px]", // Very Tall
  },
];

function Badge({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-2 text-xs md:text-sm font-bold text-[#009e5b]">
      <span className="bg-green-100 rounded-full w-6 h-6 flex items-center justify-center text-sm">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function Step({ icon, title, subtitle, active }: { icon: string; title: string; subtitle: string; active?: boolean }) {
  return (
    <div className="flex flex-col items-center bg-[#faf9f6] z-10 p-2">
      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-md border-4 mb-3 transition-colors ${active ? 'bg-[#009e5b] text-white border-green-200 shadow-green-200' : 'bg-white text-gray-400 border-white shadow-gray-200'}`}>
        {icon}
      </div>
      <p className="text-[10px] md:text-xs text-gray-500 text-center font-medium leading-tight">
        {title}<br /><span className="text-[#4a2e21] font-bold">{subtitle}</span>
      </p>
    </div>
  );
}

function FilterBtn({ text, active }: { text: string; active?: boolean }) {
  return (
    <button className={`px-5 py-1.5 rounded-full text-sm font-bold transition-colors shadow-sm ${active ? 'bg-[#009e5b] text-white' : 'bg-white text-gray-500 hover:text-gray-800'}`}>
      {text}
    </button>
  );
}

interface PujaCardProps {
  id?: string;
  imageSrc: string | { src: string };
  topTag: string;
  title: string;
  subtitle: string;
  location: string;
  date: string;
  price: string | number;
  slug?: string;
}

function PujaCard({ id, imageSrc, topTag, title, subtitle, location, date, price, slug }: PujaCardProps) {
  const cardUrl = slug ? `/puja/${slug}` : "/puja";

  return (
    <div className="bg-white rounded-3xl border border-stone-200/80 p-2.5 sm:p-3 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group text-left relative">
      <Link href={cardUrl} className="flex flex-col flex-1 cursor-pointer block">
        {/* Top Banner Image Container with Subtle Space */}
        <div className="relative w-full h-[260px] sm:h-[340px] md:h-[400px] lg:h-[450px] xl:h-[235px] rounded-2xl overflow-hidden mb-2 sm:mb-2.5 bg-stone-100 shrink-0">
          <img
            src={typeof imageSrc === "string" ? imageSrc : (imageSrc as any)?.src}
            alt={title}
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Card Body Container */}
        <div className="p-1 sm:px-1.5 flex flex-col flex-1">
          {/* Sub-header Tag with Filigree Accents */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-8 h-[1px] bg-[#F47820]/40" />
            <span className="text-[#F47820] font-serif font-extrabold text-xs sm:text-[13px] tracking-wider uppercase flex items-center gap-1.5 text-center">
              <span className="text-[10px]">♦</span> {topTag} <span className="text-[10px]">♦</span>
            </span>
            <div className="w-8 h-[1px] bg-[#F47820]/40" />
          </div>

          {/* Card Title */}
          <h3 className="font-serif font-bold text-[#1f1a17] text-lg sm:text-xl lg:text-2xl leading-tight sm:leading-snug tracking-tight mb-2 line-clamp-2">
            {title}
          </h3>

          {/* Subtitle / Description */}
          <p className="text-stone-600 text-xs sm:text-sm font-medium leading-relaxed mb-4 line-clamp-2">
            {subtitle}
          </p>

          {/* Location & Date Details Box with Vector SVG Icons */}
          <div className="bg-stone-50 border border-stone-200/90 rounded-2xl p-3 sm:p-3.5 mb-4 space-y-2.5 text-xs sm:text-[13px] font-bold text-stone-800 mt-auto">
            {/* Location */}
            <div className="flex items-start gap-2.5">
              <svg className="w-5 h-5 text-[#F47820] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L9 6H15L12 2ZM8 7L6 11H18L16 7H8ZM5 12L3 17H21L19 12H5ZM2 18V21H22V18H2Z" />
              </svg>
              <span className="leading-snug line-clamp-1">{location}</span>
            </div>

            <div className="w-full h-[1px] bg-stone-200/70" />

            {/* Date */}
            <div className="flex items-center gap-2.5">
              <svg className="w-5 h-5 text-[#F47820] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span className="line-clamp-1">{date}</span>
            </div>
          </div>

          {/* Bottom Footer Row: Price + Participate Button */}
          <div className="flex items-center justify-between pt-0.5">
            {/* Price */}
            <div>
              <span className="font-extrabold text-2xl sm:text-3xl text-[#1f1a17] leading-none block">{price}</span>
              <span className="text-xs text-stone-500 font-semibold mt-0.5 block">Per Booking</span>
            </div>

            {/* CTA Button */}
            <div className="inline-flex items-center gap-2 bg-[#00b050] hover:bg-[#009644] active:scale-95 text-white font-extrabold text-xs sm:text-sm px-5 py-2.5 sm:py-3 rounded-full shadow-md shadow-green-600/20 transition-all duration-200 group/btn">
              <span>Participate Now</span>
              <div className="w-5 h-5 rounded-full bg-white text-[#00b050] flex items-center justify-center shrink-0">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Top Right Floating Action Buttons (Wishlist & Share) */}
      <div className="absolute top-5 right-5 flex flex-col gap-2 z-10">
        {/* Wishlist Heart Button */}
        {id && <WishlistButton itemId={id} />}

        {/* Share Button */}
        <button
          aria-label="Share puja"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (navigator.share) {
              navigator.share({ title, url: window.location.origin + cardUrl });
            } else {
              navigator.clipboard?.writeText(window.location.origin + cardUrl);
            }
          }}
          className="w-8 h-8 rounded-full bg-white/95 text-stone-700 hover:text-[#00b050] flex items-center justify-center shadow-md backdrop-blur-sm transition-transform active:scale-95"
        >
          <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// --- Helper Data & Components ---

const faqList = [
  {
    question: "What is an online puja and how does it work?",
    answer: "An online puja is performed on your behalf by our experienced pandits at sacred temples. You will receive a personalized video of your sankalpa via WhatsApp."
  },
  {
    question: "Do I need to be present during the puja?",
    answer: "No, your physical presence is not required. The pandits take your name, gotra, and sankalpa before performing the sacred rituals on your behalf."
  },
  {
    question: "What details do I need to provide when booking?",
    answer: "You will need to provide your full name, WhatsApp mobile number, date of birth, and optional gotra or zodiac details for the sankalpa."
  },
  {
    question: "Can I book a puja for my family members?",
    answer: "Yes! You can add names and gotra details of your family members during the booking so they are included in the sankalpa."
  },
  {
    question: "Can I book a puja for someone living abroad / non-NRIs too?",
    answer: "Yes, we welcome devotees worldwide! We accept international payments and deliver video updates via WhatsApp globally."
  },
  {
    question: "What happens after I complete my booking?",
    answer: "Once booked, you will receive an instant confirmation on WhatsApp. On the puja date, our pandits perform your sankalpa and share video proof within 48 hours."
  }
];

function AccordionItem({
  question,
  answer,
  isOpen,
  onToggle
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      onClick={onToggle}
      className={`border rounded-xl px-5 py-4 transition-all duration-300 cursor-pointer select-none ${isOpen ? 'border-[#F47820] shadow-sm bg-white' : 'border-gray-200 bg-[#faf9f6] hover:bg-white'
        }`}
    >
      <div className="flex justify-between items-center">
        <h4 className={`text-sm sm:text-base font-bold transition-colors ${isOpen ? 'text-[#F47820]' : 'text-gray-800'}`}>
          {question}
        </h4>
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ml-4 transition-all ${isOpen ? 'bg-[#F47820] text-white' : 'bg-gray-200 text-gray-600'
            }`}
        >
          {isOpen ? '−' : '+'}
        </div>
      </div>
      {isOpen && (
        <div className="mt-3 text-xs sm:text-sm text-gray-600 leading-relaxed pr-6 border-t border-gray-100 pt-3 animate-fade-in-up">
          {answer}
        </div>
      )}
    </div>
  );
}

function SocialIcon({ bg, border, text }: { bg: string; border?: string; text: string }) {
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold uppercase cursor-pointer hover:scale-110 transition-transform ${bg} ${border || ''}`}>
      {text}
    </div>
  );
}


