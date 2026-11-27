"use client";

import React from "react";
import { Info, Landmark, Video, BookOpen, ShieldCheck, Tag, Star, Check } from "lucide-react";

export default function AboutTab() {
  return (
    <div className="animate-fade-in w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-[10px] bg-danger text-white flex items-center justify-center shrink-0 shadow-sm">
          <Info className="w-5 h-5" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold font-serif text-[#333]">
          About astroved
        </h1>
      </div>

      {/* Top Banner */}
      <div className="bg-[#fcf5f3] rounded-2xl p-8 mb-8 text-center border border-[#faebe8]">
        <div className="mb-4 flex justify-center">
          <div className="flex items-center gap-1.5 text-danger">
            <Landmark className="w-5 h-5" />
            <span className="font-serif font-bold text-sm tracking-wide">astroved</span>
          </div>
        </div>
        <h2 className="text-2xl font-serif font-bold text-[#333] mb-4">A Sacred Bridge Between Devotees and Temples</h2>
        <p className="text-[13px] text-gray-600 leading-relaxed max-w-2xl mx-auto">
          astroved is a spiritual platform that enables devotees to book authentic Vedic pujas from sacred temples across India. We connect you with verified, experienced Pandits who perform rituals in your name and family&apos;s name &mdash; and deliver the complete puja video, prasadam, and divine blessings right to your home.
        </p>
      </div>

      {/* What We Offer */}
      <h3 className="text-lg font-serif font-bold text-gray-800 mb-4">What We Offer</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-danger text-white flex items-center justify-center mb-4">
            <Landmark className="w-5 h-5" />
          </div>
          <h4 className="text-[14px] font-bold text-gray-900 mb-2">Authentic Temple Pujas</h4>
          <p className="text-[12px] text-gray-500 leading-relaxed">
            Rituals performed in sacred temples following traditional Pancharatra and Vedic Agama practices.
          </p>
        </div>

        <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-danger text-white flex items-center justify-center mb-4">
            <Video className="w-5 h-5" />
          </div>
          <h4 className="text-[14px] font-bold text-gray-900 mb-2">Puja Video Delivered</h4>
          <p className="text-[12px] text-gray-500 leading-relaxed">
            Receive your full puja video on WhatsApp within 48 hours, including your personalized sankalpam.
          </p>
        </div>

        <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-danger text-white flex items-center justify-center mb-4">
            <BookOpen className="w-5 h-5" />
          </div>
          <h4 className="text-[14px] font-bold text-gray-900 mb-2">Authentic Puja Journey</h4>
          <p className="text-[12px] text-gray-500 leading-relaxed">
            Experience a seamless puja journey from booking to divine blessings.
          </p>
        </div>

        <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-danger text-white flex items-center justify-center mb-4">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="text-[14px] font-bold text-gray-900 mb-2">Verified Pandits</h4>
          <p className="text-[12px] text-gray-500 leading-relaxed">
            Every ritual is conducted by experienced, verified Vedic acharyas you can trust.
          </p>
        </div>

        <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm md:col-span-2">
          <div className="w-10 h-10 rounded-xl bg-danger text-white flex items-center justify-center mb-4">
            <Tag className="w-5 h-5" />
          </div>
          <h4 className="text-[14px] font-bold text-gray-900 mb-2">Our Brands</h4>
          <p className="text-[12px] text-gray-500 leading-relaxed">
            Organisations we work with to serve devotees better divyakshetram, nithyasamrithi, kailasamandir, poojamandhir, Vedalayam, devotsav, daivasankalpam, jyotirvedam, manebhakti, aalayaseva, vishwappoje, pujasankalpam, kovilseva
          </p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-gradient-to-r from-danger to-[#a32230] rounded-2xl p-6 text-white grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 text-center shadow-md">
        <div>
          <div className="text-2xl font-bold font-serif mb-1">35,000+</div>
          <div className="text-[10px] font-bold tracking-wider uppercase text-red-100">Pujas Conducted</div>
        </div>
        <div>
          <div className="text-2xl font-bold font-serif mb-1">18,900+</div>
          <div className="text-[10px] font-bold tracking-wider uppercase text-red-100">Happy Devotees</div>
        </div>
        <div>
          <div className="text-2xl font-bold font-serif mb-1">120+</div>
          <div className="text-[10px] font-bold tracking-wider uppercase text-red-100">Partner Temples</div>
        </div>
        <div>
          <div className="text-2xl font-bold font-serif mb-1 flex items-center justify-center gap-1">
            4.9
            <Star className="w-5 h-5 text-[#fad06a] fill-current" />
          </div>
          <div className="text-[10px] font-bold tracking-wider uppercase text-red-100">Devotee Rating</div>
        </div>
      </div>

      {/* Our Mission */}
      <h3 className="text-lg font-serif font-bold text-gray-800 mb-4">Our Mission</h3>
      <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm mb-8">
        <p className="text-[13px] text-gray-600 leading-relaxed">
          Our mission is to make authentic Vedic worship accessible to every devotee, wherever they are. Distance, time, and busy lives should never stand between a devotee and divine blessings. Through technology and tradition together, astroved brings the sanctity of the temple to your home.
        </p>
      </div>

      {/* Company Information */}
      <h3 className="text-lg font-serif font-bold text-gray-800 mb-4">Company Information</h3>
      <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm mb-8">
        <p className="text-[13px] text-gray-600 leading-relaxed mb-4">
          Corporate Office:
        </p>
        <p className="text-[13px] text-gray-600 leading-relaxed mb-3">
          6th Floor, B-Block, Prince Info Park,<br />
          2nd Main Road,<br />
          Ambattur Industrial Estate, Chennai 600058.
        </p>
        <p className="text-[13px] text-gray-700 font-semibold leading-relaxed">
          Phone: <a href="tel:+914443419898" className="text-primary hover:underline">+91-44-43419898</a>
        </p>
      </div>

      {/* Bottom Banner */}
      <div className="bg-[#F1F5F9] text-primary text-[12px] font-bold px-4 py-3 rounded-xl flex items-center gap-2">
        <Check className="w-4 h-4 shrink-0" strokeWidth={3} />
        100% Secure &amp; Verified bookings &mdash; trusted by devotees across India.
      </div>
    </div>
  );
}
