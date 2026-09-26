"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/home/HeroSection";
import ReviewsSection from "@/components/common/ReviewsSection";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-white text-[#1f1f1f] font-sans">
      <Navbar />
      
      {/* ── 1. Hero Section ── */}
      <HeroSection />

      {/* ── 2. Steps Section ── "Your Journey to Divine Blessings" ── */}
      <section className="py-5 sm:py-6 md:py-7 bg-[#fdfbf7] border-y border-[#f0e4d0] relative overflow-hidden">
        {/* Background Mandala Watermarks */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.035] bg-center bg-no-repeat bg-contain z-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 500'%3E%3Ccircle cx='250' cy='250' r='240' fill='none' stroke='%3C%238b1e10' stroke-width='1.5'/%3E%3Ccircle cx='250' cy='250' r='200' fill='none' stroke='%3C%238b1e10' stroke-width='1' stroke-dasharray='4 4'/%3E%3Ccircle cx='250' cy='250' r='160' fill='none' stroke='%3C%238b1e10' stroke-width='1.5'/%3E%3C/svg%3E")`
          }}
        />

        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 relative z-10">
          
          {/* Section Header */}
          <div className="text-center mb-4 sm:mb-5">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#221f20] tracking-tight">
              Your Journey to <span className="text-[#8b1e10]">Divine Blessings</span>
            </h2>
            
            {/* Gold Lotus Filigree Divider */}
            <div className="flex items-center justify-center gap-2 my-1">
              <div className="w-12 sm:w-20 h-[1px] bg-gradient-to-r from-transparent to-[#c68a36]" />
              <svg className="w-4 h-4 text-[#c68a36] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C12 2 10.2 5.5 10.2 8C10.2 9.8 11 11.2 12 12C13 11.2 13.8 9.8 13.8 8C13.8 5.5 12 2 12 2Z" />
                <path d="M12 12C10.2 10.8 7.5 9.8 5.5 10.8C4 11.5 3 12.8 3 14.2C3 16.5 6.5 18 12 18.5C17.5 18 21 16.5 21 14.2C21 12.8 20 11.5 18.5 10.8C16.5 9.8 13.8 10.8 12 12Z" opacity="0.8" />
              </svg>
              <div className="w-12 sm:w-20 h-[1px] bg-gradient-to-l from-transparent to-[#c68a36]" />
            </div>

            <p className="text-stone-600 text-xs sm:text-sm font-medium max-w-xl mx-auto">
              From choosing your Puja to receiving its sacred moments at your doorstep.
            </p>
          </div>

          {/* Process Container */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-1.5 lg:gap-3 relative z-10">
            
            {/* Step 1 */}
            <div className="flex flex-col items-center group text-center flex-1 w-full max-w-[190px]">
              <div className="w-20 h-20 sm:w-24 sm:h-24 relative mb-1 group-hover:scale-105 transition-all">
                <Image
                  src="/images/steo_1.png"
                  alt="Choose Your Puja"
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="font-serif font-bold text-[#8b1e10] text-sm sm:text-base leading-tight">
                Choose Your Puja
              </h3>
            </div>

            {/* Arrow 1 (Desktop) */}
            <div className="hidden md:flex text-[#c68a36] shrink-0 mb-5">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center group text-center flex-1 w-full max-w-[190px]">
              <div className="w-20 h-20 sm:w-24 sm:h-24 relative mb-1 group-hover:scale-105 transition-all">
                <Image
                  src="/images/step_2.png"
                  alt="Share Your Details"
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="font-serif font-bold text-[#8b1e10] text-sm sm:text-base leading-tight">
                Share Your Details
              </h3>
            </div>

            {/* Arrow 2 (Desktop) */}
            <div className="hidden md:flex text-[#c68a36] shrink-0 mb-5">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center group text-center flex-1 w-full max-w-[190px]">
              <div className="w-20 h-20 sm:w-24 sm:h-24 relative mb-1 group-hover:scale-105 transition-all">
                <Image
                  src="/images/step_3.png"
                  alt="Puja Is Performed"
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="font-serif font-bold text-[#8b1e10] text-sm sm:text-base leading-tight">
                Puja Is Performed
              </h3>
            </div>

            {/* Arrow 3 (Desktop) */}
            <div className="hidden md:flex text-[#c68a36] shrink-0 mb-5">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center group text-center flex-1 w-full max-w-[190px]">
              <div className="w-20 h-20 sm:w-24 sm:h-24 relative mb-1 group-hover:scale-105 transition-all">
                <Image
                  src="/images/step_4.png"
                  alt="Receive Divine Blessings"
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="font-serif font-bold text-[#8b1e10] text-sm sm:text-base leading-tight">
                Receive Divine Blessings
              </h3>
            </div>

          </div>

        </div>
      </section>

      {/* ── 3. Our Pujas Section ── */}
      <section className="py-12 bg-white">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-12">
          
          {/* Header Row & Category Filters */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#221f20] font-serif">
              Our Pujas
            </h2>
            
            {/* Filter Pills */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button className="bg-[#00b050] text-white font-bold px-5 py-2 rounded-full text-xs sm:text-sm shadow-sm hover:bg-[#009b46] transition-colors">
                All
              </button>
              
              <button className="bg-white border border-stone-200 text-stone-700 hover:border-stone-400 font-semibold px-4.5 py-2 rounded-full text-xs sm:text-sm transition-colors">
                Diety
              </button>

              <button className="bg-white border border-stone-200 text-stone-700 hover:border-stone-400 font-semibold px-4.5 py-2 rounded-full text-xs sm:text-sm transition-colors">
                Dosha
              </button>

              <button className="bg-white border border-stone-200 text-stone-700 hover:border-stone-400 font-semibold px-4.5 py-2 rounded-full text-xs sm:text-sm transition-colors">
                Benefit
              </button>
            </div>
          </div>
          
          {/* 3 Puja Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            
            {/* Card 1 */}
            <PujaCard 
              imageSrc="/subrahmanya_swamy_hero.png"
              topTag="SPECIAL TUESDAY SANKALPAM" 
              title="Subrahmanya Swamy Abhishekam at Madurai..."
              subtitle="A special Tuesday Abhishekam for devotees seeking the courage to overcome obstacles, fulfillment of efforts, and success"
              location="Aadi Meenakshi Sameta Sundareshwarar Temple"
              date="Saturday, 26 September"
              price="₹516"
              slug="subrahmanya-swamy-abhishekam"
            />

            {/* Card 2 */}
            <PujaCard 
              imageSrc="/shani_statue_hero_banner.png"
              topTag="SPEICAL SHANI POOJA" 
              title="Sade Sati Shanti Puja & Oil Abhishekam ..."
              subtitle="Shani Shanti Puja & Oil Abhishekam for Relief from the Harsh Effects of Sade Sati"
              location="Bannanje Shani kshetram"
              date="Saturday, 26 September"
              price="₹816"
              slug="sade-sati-shani-shanti-puja"
            />

            {/* Card 3 */}
            <PujaCard 
              imageSrc="/images/Navagraha-Shanti-Puja.jpg"
              topTag="SHANI PURNIMA SPECIAL" 
              title="Shani Shanti Puja for Prosperity, Career..."
              subtitle="Perform Shani Shanti Puja for relief from hardships, prosperity, career growth, peace and lasting stability."
              location="Mangala Shaneeshwara Devalayam"
              date="Saturday, 26 September"
              price="₹816"
              slug="shani-shanti-puja-prosperity"
            />

          </div>
          
          <div className="text-center mt-10">
            <button className="text-[#00b050] font-extrabold px-8 py-3 rounded-full border-2 border-[#00b050] hover:bg-green-50 active:scale-95 transition-all text-base shadow-sm">
              View All Pujas
            </button>
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

      {/* ── 5. Trust Badges Strip ── */}
      <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 bg-[#f0f8f1] px-6 sm:px-10 lg:px-12 py-8 border-y border-green-100">
        <Badge icon="🎥" text="Puja Video Delivered Within 48 hours" />
        <Badge icon="✓" text="Verified & Experienced Pandits" />
        <Badge icon="🏛" text="Puja Performed in Sacred Temples" />
        <Badge icon="📜" text="100% Authentic Vedic Rituals" />
      </div>

      {/* ── 6. FAQ Section ── */}
      <section className="py-16 bg-white">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-12 flex flex-col md:flex-row gap-12">
          {/* Left: Doubts */}
          <div className="md:w-1/3">
            <h3 className="text-red-500 font-bold text-sm tracking-wider uppercase mb-2">— FAQ</h3>
            <h2 className="text-4xl md:text-5xl font-bold text-[#4a2e21] font-serif mb-4 leading-tight">Doubts?<br/>We're Here.</h2>
            <p className="text-gray-600 mb-8 text-sm max-w-[250px]">
              Our devotee care team is available in 11 languages, 12 hours a day. Reach them on WhatsApp, phone, or email.
            </p>
            <button className="bg-[#009e5b] text-white px-8 py-3 rounded-full font-bold shadow-md hover:bg-[#008c51] transition-colors">
              Speak to Devotee Care
            </button>
          </div>
          
          {/* Right: Accordion */}
          <div className="md:w-2/3 flex flex-col gap-3">
            <AccordionItem question="What is an online puja and how does it work?" active />
            <AccordionItem question="Do I need to be present during the puja?" />
            <AccordionItem question="What details do I need to provide when booking?" />
            <AccordionItem question="Can I book a puja for my family members?" />
            <AccordionItem question="Can I book a puja for someone living abroad / non-NRIs too?" />
            <AccordionItem question="What happens after I complete my booking?" />
            <AccordionItem question="When will I receive my puja video?" />
            <AccordionItem question="Where will the video come on?" />
            <AccordionItem question="What payment methods do you accept?" />
            <AccordionItem question="Can I cancel or reschedule my booking?" />
          </div>
        </div>
      </section>

      {/* ── 7. Footer ── */}
      <footer className="bg-[#1f0e08] text-[#d4c5b9] pt-16 pb-8">
        <div className="max-w-[1200px] mx-auto px-4 text-center border-b border-white/10 pb-12 mb-8">
          <h2 className="text-2xl md:text-3xl font-serif text-white mb-6">A Sacred Path to Divine Blessings Book Your<br/>Sacred Puja</h2>
          <p className="text-sm mb-8">Connect with divine blessings through authentic Vedic rituals.</p>
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="text-white font-bold text-lg mr-2">Follow us -</span>
            <SocialIcon bg="bg-blue-600" text="f" />
            <SocialIcon bg="bg-pink-600" text="ig" />
            <SocialIcon bg="bg-black" border="border border-white/20" text="x" />
            <SocialIcon bg="bg-red-600" text="yt" />
          </div>
          <button className="bg-white text-[#009e5b] font-bold px-6 py-2 rounded-full text-sm hover:bg-gray-100 transition-colors inline-flex items-center gap-2 shadow-lg">
            Find the Right Puja <div className="bg-[#009e5b] text-white rounded-full w-5 h-5 flex items-center justify-center"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"/></svg></div>
          </button>
        </div>
        
        <div className="max-w-[1200px] mx-auto px-4 flex flex-col md:flex-row justify-between gap-8 mb-12">
          {/* Logo Col */}
          <div className="md:w-1/3">
            <div className="flex items-center gap-2 mb-4">
              <div className="text-white font-serif text-2xl font-bold flex items-center gap-2">
                <span className="text-[#d97706] text-3xl">🔥</span> Vedamandir
              </div>
            </div>
            <p className="text-xs text-white/60 max-w-xs leading-relaxed">
              Vedamandir is a spiritual platform that enables devotees to book authentic Vedic pujas at sacred temples across India.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-4">Quick Links</h4>
            <ul className="flex flex-col gap-2 text-xs text-white/60">
              <li><Link href="/puja" className="hover:text-white transition-colors">Puja</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Our Brands</Link></li>
            </ul>
          </div>
          
          {/* Legal */}
          <div>
            <h4 className="text-white font-bold mb-4">Legal</h4>
            <ul className="flex flex-col gap-2 text-xs text-white/60">
              <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Account Deletion</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h4 className="text-white font-bold mb-4">Contact</h4>
            <ul className="flex flex-col gap-3 text-xs text-white/60 max-w-[200px]">
              <li className="flex gap-2"><span>✉</span> support@vedamandir.com</li>
              <li className="flex gap-2"><span>📞</span> +91 72072 02029</li>
              <li className="flex gap-2 leading-relaxed"><span>📍</span> 1st Floor, H.No. 4-4-490, Plot No. 490, Road No. 22, LAXMI NGR, Hyderabad, Telangana 500035</li>
            </ul>
          </div>
        </div>
        
        <div className="text-center text-[10px] text-white/40">
          © 2024 Vedamandir. All rights reserved.
        </div>
      </footer>
    </main>
  );
}

// --- Helper Data & Components ---

const galleryImages = [
  {
    src: "/images/Service images/Mangal Dosha Nivaran Puja/Mangal-Dosha-Nivaran-Puja.jpg",
    alt: "Deity Flower Garland Ritual",
    aspect: "w-[160px] sm:w-[190px] h-[270px] sm:h-[310px]", // Tall
  },
  {
    src: "/images/Service images/Satyanarayan Katha Puja/Satyanarayan-Katha-Puja.jpg",
    alt: "Temple Pandits Homam",
    aspect: "w-[210px] sm:w-[250px] h-[160px] sm:h-[180px]", // Small
  },
  {
    src: "/images/Service images/Maha Ganapati Homam/Maha-Ganapati-Homam.jpg",
    alt: "Pandit Lamp Offering",
    aspect: "w-[200px] sm:w-[240px] h-[170px] sm:h-[190px]", // Medium-small
  },
  {
    src: "/images/Service images/Mahalakshmi Kubera Homam/Mahalakshmi-Kubera-Homam1.jpg",
    alt: "Sacred Fire Ceremony",
    aspect: "w-[210px] sm:w-[250px] h-[150px] sm:h-[165px]", // Small
  },
  {
    src: "/images/Service images/rudrabhishekam-puja/rudrabhishekam-puja.jpg",
    alt: "Purohit Sacred Thread Ritual",
    aspect: "w-[160px] sm:w-[190px] h-[310px] sm:h-[350px]", // Very Tall
  },
  {
    src: "/images/Service images/rudrabhishekam-puja/rudrabhishekam-puja2.jpg",
    alt: "Sacred Homam Fire",
    aspect: "w-[210px] sm:w-[250px] h-[160px] sm:h-[180px]", // Medium-small
  },
  {
    src: "/images/Service images/Mahalakshmi Kubera Homam/Mahalakshmi-Kubera-Homam.jpg",
    alt: "Vedic Priest at Kolam Altar",
    aspect: "w-[160px] sm:w-[190px] h-[310px] sm:h-[350px]", // Very Tall
  },
  {
    src: "/images/Service images/rudrabhishekam-puja/rudrabhishekam-puja1.jpg",
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
        {title}<br/><span className="text-[#4a2e21] font-bold">{subtitle}</span>
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

function PujaCard({ imageSrc, topTag, title, subtitle, location, date, price, slug }: any) {
  return (
    <div className="bg-white rounded-3xl border border-stone-200/80 p-2.5 sm:p-3 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group text-left">
      
      {/* Top Banner Image Container with Subtle Space */}
      <div className="relative w-full h-[220px] sm:h-[235px] rounded-2xl overflow-hidden mb-2.5 bg-stone-100 shrink-0">
        <Image
          src={imageSrc}
          alt={title}
          fill
          className="object-cover object-center"
          priority
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
        <div className="flex items-center justify-center gap-2 mb-2.5">
          <div className="w-8 h-[1px] bg-[#8b1e10]/40" />
          <span className="text-[#8b1e10] font-serif font-extrabold text-xs sm:text-[13px] tracking-wider uppercase flex items-center gap-1.5 text-center">
            <span className="text-[10px]">♦</span> {topTag} <span className="text-[10px]">♦</span>
          </span>
          <div className="w-8 h-[1px] bg-[#8b1e10]/40" />
        </div>

        {/* Card Title */}
        <h3 className="font-serif font-bold text-[#1f1a17] text-xl sm:text-2xl leading-snug tracking-tight mb-2.5 line-clamp-2 min-h-[56px]">
          {title}
        </h3>

        {/* Subtitle / Description */}
        <p className="text-stone-600 text-xs sm:text-sm font-medium leading-relaxed mb-4 line-clamp-2 min-h-[40px]">
          {subtitle}
        </p>

        {/* Location & Date Details Box with Vector SVG Icons */}
        <div className="bg-stone-50 border border-stone-200/90 rounded-2xl p-3 sm:p-3.5 mb-4.5 space-y-2.5 text-xs sm:text-[13px] font-bold text-stone-800 mt-auto">
          {/* Location */}
          <div className="flex items-start gap-2.5">
            <svg className="w-4.5 h-4.5 text-[#8b1e10] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L9 6H15L12 2ZM8 7L6 11H18L16 7H8ZM5 12L3 17H21L19 12H5ZM2 18V21H22V18H2Z" />
            </svg>
            <span className="leading-snug">{location}</span>
          </div>

          <div className="w-full h-[1px] bg-stone-200/70" />

          {/* Date */}
          <div className="flex items-center gap-2.5">
            <svg className="w-4.5 h-4.5 text-[#8b1e10] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>{date}</span>
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
            href={slug ? `/puja/${slug}` : "/puja/subrahmanya-swamy-abhishekam"}
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

function AccordionItem({ question, active }: { question: string; active?: boolean }) {
  return (
    <div className={`border rounded-xl px-5 py-4 transition-colors ${active ? 'border-green-500 shadow-sm bg-white' : 'border-gray-200 bg-[#faf9f6] hover:bg-white cursor-pointer'}`}>
      <div className="flex justify-between items-center">
        <h4 className={`text-sm font-bold ${active ? 'text-[#009e5b]' : 'text-gray-700'}`}>{question}</h4>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ml-4 ${active ? 'bg-[#009e5b] text-white' : 'bg-gray-200 text-gray-500'}`}>
          {active ? '-' : '+'}
        </div>
      </div>
      {active && (
        <div className="mt-3 text-xs text-gray-500 leading-relaxed pr-8 border-t border-gray-100 pt-3">
          An online puja is performed on your behalf by our experienced pandits at sacred temples. You will receive a personalized video of your sankalpa via WhatsApp.
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


