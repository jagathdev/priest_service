"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import Navbar from "@/components/layout/Navbar";

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

export default function DashboardPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [pujas, setPujas] = useState<any[]>([]);
  const [fetchedPujas, setFetchedPujas] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/api/pujas")
      .then((r) => (r.ok ? r.json() : null))
      .then((resData) => {
        const rawList = resData?.data && Array.isArray(resData.data)
          ? resData.data
          : Array.isArray(resData)
          ? resData
          : [];
        const activeList = rawList.filter((item: { status?: string }) => !item.status || item.status === "active");
        setPujas(activeList.slice(0, 6));
      })
      .catch((err) => {
        console.error("Error fetching home pujas:", err);
        setPujas([]);
      })
      .finally(() => setFetchedPujas(true));
  }, []);

  return (
    <main className="min-h-screen bg-white text-[#1f1f1f] font-sans">
      <Navbar />

      {/* ── 1. Hero Section ── */}
      <HeroSection />

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
                <div key={`skeleton-${i}`} className="bg-gray-100/80 rounded-[32px] h-[450px] animate-pulse border border-stone-100"></div>
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
                const topTagVal = p.badge || p.shortTitle || p.subtitle || "SPECIAL PUJA";
                const descriptionVal = p.description || p.subtitle || "Join us for this sacred ritual to seek divine blessings and fulfillment.";
                return (
                  <PujaCard
                    key={p._id}
                    imageSrc={p.imageUrl || ganeshImg}
                    topTag={topTagVal}
                    title={p.title}
                    subtitle={descriptionVal}
                    location={p.location || p.filterLocation || p.templeVenue || "Sacred Temple, India"}
                    date={p.date || "Available Daily"}
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
      <section className="py-16 bg-white">
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
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className="text-[#1f1a17] font-extrabold text-base sm:text-lg mr-1">Follow us —</span>
            <SocialIcon bg="bg-blue-600 text-white" text="f" />
            <SocialIcon bg="bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white" text="ig" />
            <SocialIcon bg="bg-stone-900 text-white" text="x" />
            <SocialIcon bg="bg-red-600 text-white" text="yt" />
          </div>
          <button className="bg-[#00b050] hover:bg-[#009644] active:scale-95 text-white font-extrabold px-8 py-3.5 rounded-full text-sm sm:text-base transition-all inline-flex items-center gap-2.5 shadow-md shadow-green-600/20">
            Find the Right Puja <div className="bg-white text-[#00b050] rounded-full w-5 h-5 flex items-center justify-center shadow-sm"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg></div>
          </button>
        </div>

        <div className="max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-10 flex flex-col md:flex-row justify-between gap-8 mb-10">
          {/* Logo Col */}
          <div className="md:w-1/3">
            <div className="flex items-center gap-2 mb-4">
              <div className="font-serif text-2xl font-bold text-[#1f1a17] flex items-center gap-2">
                <span className="text-[#F47820] text-3xl">🔥</span> Priest Service
              </div>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 max-w-xs leading-relaxed font-medium">
              Priest Service is a spiritual platform that enables devotees to book authentic Vedic pujas at sacred temples across India.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[#1f1a17] font-bold font-serif text-sm sm:text-base mb-4 tracking-wider uppercase">Quick Links</h4>
            <ul className="flex flex-col gap-2.5 text-xs sm:text-sm text-stone-600 font-medium">
              <li><Link href="/puja" className="hover:text-[#F47820] transition-colors">Puja</Link></li>
              <li><Link href="#" className="hover:text-[#F47820] transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-[#F47820] transition-colors">Our Brands</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-[#1f1a17] font-bold font-serif text-sm sm:text-base mb-4 tracking-wider uppercase">Legal</h4>
            <ul className="flex flex-col gap-2.5 text-xs sm:text-sm text-stone-600 font-medium">
              <li><Link href="/privacy" className="hover:text-[#F47820] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-[#F47820] transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-[#F47820] transition-colors">Account Deletion</Link></li>
              <li><Link href="#" className="hover:text-[#F47820] transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[#1f1a17] font-bold font-serif text-sm sm:text-base mb-4 tracking-wider uppercase">Contact</h4>
            <ul className="flex flex-col gap-3 text-xs sm:text-sm text-stone-600 font-medium max-w-[220px]">
              <li className="flex gap-2"><span>✉</span> support@priestservice.com</li>
              <li className="flex gap-2"><span>📞</span> +91 72072 02029</li>
              <li className="flex gap-2 leading-relaxed"><span>📍</span> 1st Floor, H.No. 4-4-490, Plot No. 490, Road No. 22, LAXMI NGR, Hyderabad, Telangana 500035</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-200/80 pt-8 text-center text-xs text-stone-500 font-medium">
          © 2024 PriestService. All rights reserved.
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
  imageSrc: string | { src: string };
  topTag: string;
  title: string;
  subtitle: string;
  location: string;
  date: string;
  price: string | number;
  slug?: string;
}

function PujaCard({ imageSrc, topTag, title, subtitle, location, date, price, slug }: PujaCardProps) {
  return (
    <div className="bg-white rounded-3xl border border-stone-200/80 p-2.5 sm:p-3 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group text-left">

      {/* Top Banner Image Container with Subtle Space */}
      <div className="relative w-full h-[260px] sm:h-[340px] md:h-[400px] lg:h-[450px] xl:h-[235px] rounded-2xl overflow-hidden mb-2 sm:mb-2.5 bg-stone-100 shrink-0">
        <img
          src={typeof imageSrc === "string" ? imageSrc : imageSrc?.src}
          alt={title}
          className="w-full h-full object-cover object-center"
        />

        {/* Top Right Floating Action Buttons (Wishlist & Share) */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
          {/* Wishlist Heart Button */}
          <button
            aria-label="Add to wishlist"
            className="w-8 h-8 rounded-full bg-white/95 text-stone-700 hover:text-red-500 flex items-center justify-center shadow-md backdrop-blur-sm transition-transform active:scale-95"
          >
            <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </button>

          {/* Share Button */}
          <button
            aria-label="Share puja"
            onClick={(e) => {
              e.preventDefault();
              if (navigator.share) {
                navigator.share({ title, url: window.location.origin + `/puja/${slug}` });
              } else {
                navigator.clipboard?.writeText(window.location.origin + `/puja/${slug}`);
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
          <Link
            href={slug ? `/puja/${slug}` : "/puja"}
            className="inline-flex items-center gap-2 bg-[#00b050] hover:bg-[#009644] active:scale-95 text-white font-extrabold text-xs sm:text-sm px-5 py-2.5 sm:py-3 rounded-full shadow-md shadow-green-600/20 transition-all duration-200 group/btn"
          >
            <span>Participate Now</span>
            <div className="w-5 h-5 rounded-full bg-white text-[#00b050] flex items-center justify-center shrink-0">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>
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


