"use client";

import React, { useState } from "react";
import { ShareIcon, HeartIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid, CheckCircleIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';

interface Props {
  initialPuja?: {
    title?: string;
    description?: string;
    imageUrl?: string;
    date?: string;
    details?: {
      heroTitle?: string;
      heroSubtitle?: string;
      templeLocation?: string;
    };
    packages?: unknown[];
    [key: string]: unknown;
  } | null;
  recommendations?: unknown[];
}

export default function NewPujaDetailClient({ initialPuja, recommendations }: Props) {
  const [selectedPackage, setSelectedPackage] = useState(initialPuja?.packages?.[0] || null);
  const puja = initialPuja as NonNullable<Props['initialPuja']>;

  return (
    <div className="min-h-screen bg-[#fafafa] pb-20 font-sans">

      {/* Top Banner & Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {/* Breadcrumb / Top Bar */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-gray-900">Home</Link>
          <span>/</span>
          <Link href="/puja" className="hover:text-gray-900">Puja</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{puja?.title || "Pitru Dosha Shanti Mahapuja"}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 relative">

          {/* LEFT COLUMN: Details */}
          <div className="w-full lg:w-2/3">

            {/* Main Image Card */}
            <div className="relative rounded-2xl overflow-hidden shadow-sm border border-orange-100">
              <img
                src={puja?.imageUrl || "https://images.unsplash.com/photo-1542382156909-9ae37b3f56fd?auto=format&fit=crop&q=80"}
                alt={puja?.title || "Puja Image"}
                className="w-full h-[450px] object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className="bg-red-600 text-white px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md shadow-sm">
                  {puja?.details?.heroTitle || "Mahapuja Tirth Yatra Special"}
                </span>
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                <h1 className="text-3xl font-bold text-white drop-shadow-lg max-w-lg">
                  {puja?.title || "Kashi Pitru Dosh Shanti Mahapuja & Ganga Aarti"}
                </h1>
                <span className="bg-white/90 px-3 py-1.5 text-sm font-medium rounded-md shadow-lg flex items-center gap-2 text-gray-800">
                  <CheckCircleIcon className="w-4 h-4 text-green-600" />
                  {puja?.details?.templeLocation || "Kashi Ghat, Kashi"}
                </span>
              </div>
            </div>

            {/* Stats & Actions Row */}
            <div className="flex flex-wrap justify-between items-center mt-6 py-4 border-b border-gray-200 gap-4">
              <div className="flex gap-8">
                <div>
                  <p className="text-xl font-bold text-gray-900">4.16L+</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Bookings</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">23.76L+</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Devotees</p>
                </div>
                <div>
                  <p className="flex items-center text-xl font-bold text-gray-900">
                    4.9/5 <StarIconSolid className="w-5 h-5 text-yellow-400 ml-1" />
                  </p>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Average Rating</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-5 py-2 border border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50 text-gray-700 bg-white shadow-sm">
                  <HeartIcon className="w-4 h-4" /> Wishlist
                </button>
                <button className="flex items-center gap-2 px-5 py-2 border border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50 text-gray-700 bg-white shadow-sm">
                  <ShareIcon className="w-4 h-4" /> Share
                </button>
              </div>
            </div>

            {/* About Section */}
            <div className="mt-12">
              <h2 className="text-2xl font-serif text-gray-900 mb-6 flex items-center gap-2">
                About pooja
              </h2>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                <h3 className="font-semibold text-gray-900 mb-3 text-lg">{puja?.title || "Symptoms of Pitru Dosha"}</h3>
                <p className="text-gray-600 text-[15px] leading-relaxed mb-4">
                  {(puja?.description as string) || "As water, sunlight, food, and earth are the five sacred elements, all life on our earth receives blessings from the divine. Every human inherits the debt from their ancestors. By performing proper ancestral offerings (tarpan), we liberate ourselves..."}
                </p>
                <button className="text-green-600 font-medium text-sm flex items-center justify-center w-full mt-4 hover:text-green-700">
                  Read More
                </button>
              </div>
            </div>

            {/* Pooja Benefits Section */}
            <div className="mt-12">
              <h2 className="text-2xl font-serif text-gray-900 mb-6">Pooja Benefits</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Benefit Item */}
                <div className="flex gap-4 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                    <StarIconSolid className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Pitru Dosha Shanti</h4>
                    <p className="text-sm text-gray-500 mt-1">Clears negative effects of Pitru Dosha and brings peace.</p>
                  </div>
                </div>
                {/* Benefit Item 2 */}
                <div className="flex gap-4 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                    <HeartIcon className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Health & Family Harmony</h4>
                    <p className="text-sm text-gray-500 mt-1">Restores family harmony, health and brings peace.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Process Section */}
            <div className="mt-12">
              <h2 className="text-2xl font-serif text-gray-900 mb-6">Pooja Procedure</h2>
              <div className="space-y-4">
                {[
                  { step: "01", title: "Nama Gotra Sankalp", desc: "A formal ritual vow taken by priests using your name and Gotra." },
                  { step: "02", title: "Purification", desc: "Purification of the ritual site and sacred offerings." },
                  { step: "03", title: "Ancestral Invocation", desc: "Invoking ancestors to accept offerings and grant blessings." },
                  { step: "04", title: "Tarpan", desc: "Performing ritual water and sesame offerings." }
                ].map((proc) => (
                  <div key={proc.step} className="flex gap-4 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
                    <div className="w-12 h-12 rounded-full border-2 border-red-200 text-red-600 font-bold flex items-center justify-center flex-shrink-0">
                      {proc.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{proc.title}</h4>
                      <p className="text-sm text-gray-500 mt-1">{proc.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Temple Details Section */}
            <div className="mt-12">
              <h2 className="text-2xl font-serif text-gray-900 mb-6">Temple Details</h2>
              <div className="flex flex-col md:flex-row gap-6 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
                <img src="https://images.unsplash.com/photo-1620025732283-500f4058d844?auto=format&fit=crop&q=80&w=400" alt="Temple" className="w-full md:w-1/3 h-48 object-cover rounded-xl" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">Pishach Mochan Kund</h3>
                  <p className="text-sm text-red-500 flex items-center gap-1 mt-1 font-medium"><span className="text-base">📍</span> Kashi</p>
                  <p className="text-sm text-gray-600 mt-3 leading-relaxed">
                    Located in the sacred city of Kashi, Pishach Mochan Kund holds a special place among the ancient pilgrimage sites associated with Pitru Shanti. According to religious traditions, devotees perform rituals such as Shraddha, Tarpan, and Pind Daan here, praying for the peace and spiritual welfare of their ancestors.
                  </p>
                  <button className="text-green-600 font-medium text-sm mt-3 hover:text-green-700">Read More ⌄</button>
                </div>
              </div>
            </div>

            {/* What You Will Receive */}
            <div className="mt-12">
              <h2 className="text-2xl font-serif text-gray-900 mb-6">What You Will Receive</h2>
              <div className="flex gap-4 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                  <span className="text-red-600 text-xl">▶</span>
                </div>
                <div>
                  <p className="text-sm text-gray-700 leading-relaxed font-medium">
                    A complete video recording of the Pitru Dosh Shanti Puja and Maha Ganga Aarti performed at Pishach Mochan Kund will be sent to your WhatsApp within 48 hours.
                  </p>
                </div>
              </div>
            </div>

            {/* FAQs */}
            <div className="mt-12">
              <h2 className="text-2xl font-serif text-gray-900 mb-6">Frequently Asked Questions (FAQs)</h2>
              <div className="space-y-3">
                {[
                  "Who should perform this Pitru Dosha Shanti Puja?",
                  "Is this puja exclusively for Pitru Dosh?",
                  "Is physical presence in Kashi mandatory?",
                  "What is the significance of the Ganga Aarti in this puja?"
                ].map((faq, i) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-white border border-gray-100 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                    <span className="text-sm text-gray-800 font-medium">{faq}</span>
                    <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0">
                      <span className="text-xs">▼</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Puja Gallery */}
            <div className="mt-12 mb-10">
              <h2 className="text-2xl font-serif text-gray-900 mb-6">Puja Gallery</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <img key={i} src={`https://images.unsplash.com/photo-1517482276527-31317f2a1a12?auto=format&fit=crop&q=80&w=200`} alt="Gallery" className="w-full h-32 object-cover rounded-xl shadow-sm" />
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Sticky Booking Card */}
          <div className="w-full lg:w-1/3">
            <div className="sticky top-24 bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8">

              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <div className="h-px w-8 bg-red-200"></div>
                  <h4 className="text-[11px] font-bold text-red-600 uppercase tracking-widest">
                    {puja?.title?.substring(0, 25) || "Pitru Dosha Shanti Mahapuja"}
                  </h4>
                  <div className="h-px w-8 bg-red-200"></div>
                </div>
                <h1 className="text-2xl font-serif text-gray-900 leading-snug mb-3">
                  {puja?.title || "Pitru Dosha Shanti Mahapuja at Sacred Kashi Pishach Mochan Kund And Kashi Ganga Aarti"}
                </h1>
                <p className="text-sm text-gray-500">
                  {puja?.details?.heroSubtitle || "Clear ancestral flaws, pacify trapped ancestral souls, and protect your family's health with sacred tarpan"}
                </p>
              </div>

              {/* Date & Location */}
              <div className="space-y-2.5 mb-8">
                <div className="flex items-center gap-3 p-3.5 bg-[#f8f9fa] rounded-xl border border-gray-100">
                  <div className="text-gray-600 font-medium text-sm flex items-center gap-2">
                    <span className="text-lg">📍</span> {puja?.details?.templeLocation || "Pishach Mochan Kund, Kashi"}
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3.5 bg-[#f8f9fa] rounded-xl border border-gray-100">
                  <div className="text-gray-600 font-medium text-sm flex items-center gap-2">
                    <span className="text-lg">📅</span> {puja?.date || "Tuesday, 6 October"} <span className="text-green-600 text-xs bg-green-50 px-2 py-0.5 rounded-md ml-1">Auspicious Muhurat</span>
                  </div>
                </div>
              </div>

              {/* Packages */}
              <div className="mb-8">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <h4 className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Muhurat Ends In:</h4>
                    <h4 className="font-semibold text-sm text-gray-900 uppercase tracking-wider">Reserve your sankalp</h4>
                  </div>
                  <div className="flex gap-1 text-center text-red-600">
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-bold bg-red-50 px-2 py-1 rounded">07</span>
                      <span className="text-[9px] text-gray-400 mt-1 uppercase">Days</span>
                    </div>
                    <span className="font-bold text-gray-300 self-start mt-1">:</span>
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-bold bg-red-50 px-2 py-1 rounded">02</span>
                      <span className="text-[9px] text-gray-400 mt-1 uppercase">Hours</span>
                    </div>
                    <span className="font-bold text-gray-300 self-start mt-1">:</span>
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-bold bg-red-50 px-2 py-1 rounded">21</span>
                      <span className="text-[9px] text-gray-400 mt-1 uppercase">Mins</span>
                    </div>
                    <span className="font-bold text-gray-300 self-start mt-1">:</span>
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-bold bg-red-50 px-2 py-1 rounded">08</span>
                      <span className="text-[9px] text-gray-400 mt-1 uppercase">Secs</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {/* Package Option 1 */}
                  <div className="border border-gray-200 bg-white rounded-2xl p-3 text-center cursor-pointer hover:border-gray-300 transition-colors flex flex-col items-center justify-between">
                    <div className="w-8 h-8 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-1 text-sm">
                      👤
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-800 leading-tight">Individual</p>
                      <p className="text-[9px] text-gray-500 mb-1">1 Person</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900">₹851</p>
                  </div>

                  {/* Package Option 2 */}
                  <div className="border-2 border-green-500 bg-green-50/50 rounded-2xl p-3 text-center cursor-pointer relative shadow-sm flex flex-col items-center justify-between">
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-sm">
                      Recommended
                    </div>
                    <div className="w-8 h-8 mx-auto bg-white rounded-full flex items-center justify-center shadow-sm mb-1 text-sm">
                      💑
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-800 leading-tight">Couple Puja</p>
                      <p className="text-[9px] text-gray-500 mb-1">2 Persons</p>
                    </div>
                    <p className="text-sm font-bold text-green-700">₹1,251</p>
                  </div>

                  {/* Package Option 3 */}
                  <div className="border border-gray-200 bg-white rounded-2xl p-3 text-center cursor-pointer hover:border-gray-300 transition-colors flex flex-col items-center justify-between">
                    <div className="w-8 h-8 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-1 text-sm">
                      👨‍👩‍👧‍👦
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-800 leading-tight">Family Puja</p>
                      <p className="text-[9px] text-gray-500 mb-1">4 Persons</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900">₹2,251</p>
                  </div>
                </div>
              </div>

              {/* Book Now Button */}
              <button className="w-full bg-[#00b268] hover:bg-[#009e5c] text-white font-bold py-4 rounded-xl shadow-lg shadow-green-200 transition-all text-lg flex justify-center items-center gap-2 group">
                <span>₹1,251</span>
                <span className="w-px h-5 bg-white/30"></span>
                <span>Book Now</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>

              {/* Secondary Actions */}
              <div className="flex gap-3 mt-4">
                <button className="flex-1 py-2.5 border border-green-200 text-green-700 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-green-50 transition-colors">
                  <span className="text-green-600 text-lg">💬</span> WhatsApp
                </button>
                <button className="flex-1 py-2.5 border border-blue-200 text-blue-700 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors">
                  <span className="text-blue-600 text-lg">📞</span> Call Us
                </button>
              </div>

              <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-400 font-medium">
                <span className="flex items-center gap-1">🔒 100% Secure</span>
                <span className="flex items-center gap-1">✅ Verified Pandits</span>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Footer Section */}
      <footer className="mt-20 bg-[#2d110f] text-white pt-16 pb-8 px-4 sm:px-6 lg:px-8 border-t-[8px] border-[#d87d4a]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif mb-4">A Sacred Path to Divine Blessings Book Your<br />Sacred Puja</h2>
            <p className="text-[#d87d4a] text-sm mb-8">Connect with divine blessings through authentic Vedic rituals.</p>
            <div className="flex justify-center items-center gap-4 mb-6">
              <span className="text-xl font-serif">Follow us -</span>
              <div className="flex gap-2">
                <span className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">f</span>
                <span className="w-8 h-8 rounded-full bg-pink-600 flex items-center justify-center">ig</span>
                <span className="w-8 h-8 rounded-full bg-black flex items-center justify-center">X</span>
                <span className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">▶</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-sm border-t border-white/10 pt-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl text-[#d87d4a]">🔥</span>
                <span className="text-xl font-bold">astroved</span>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">
                astroved is a spiritual platform that enables devotees to book authentic Vedic pujas at sacred temples across India.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-[#d87d4a]">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/puja">Puja</Link></li>
                <li><Link href="/about">About Us</Link></li>
                <li>Our Brands</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-[#d87d4a]">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Account Deletion</li>
                <li>Contact Us</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-[#d87d4a]">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>📧 support@astroved.com</li>
                <li>📞 +91 73373 53123</li>
              </ul>
            </div>
          </div>
          <div className="text-center text-xs text-gray-500 mt-12 pt-8 border-t border-white/10">
            © 2024 astroved. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
