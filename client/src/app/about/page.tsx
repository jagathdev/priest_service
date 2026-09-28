"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";

const features = [
  "Offer puja, deepam, flowers, and sacred prayers from your phone.",
  "Listen to mantras and aartis.",
  "Read Hanuman Chalisa, spiritual stories, and Hindu literature.",
  "Share auspicious wishes and daily blessings with loved ones.",
  "Check Panchang, muhurat, and astrology insights in one place.",
  "Explore Vedic remedies, temple services, and community rituals.",
];

const stats = [
  { target: 25, suffix: "+", label: "Years of Vedic expertise" },
  { target: 10, suffix: "M+", label: "Homas, Poojas & Remedies Performed" },
  { target: 60, suffix: "M+", label: "Lives touched through remedies" },
];

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const elementRef = React.useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isIntersecting) return;

    let startTime: number | null = null;
    // Adapt duration to target size: smaller numbers run faster so they don't look laggy
    const duration = target < 50 ? 1000 : 1500;

    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const rate = Math.min(progress / duration, 1);

      // easeOutCubic for a snappy start and soft, smooth slowdown
      const easeOut = 1 - Math.pow(1 - rate, 3);

      setCount(Math.floor(easeOut * target));

      if (progress < duration) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [target, isIntersecting]);

  return <span ref={elementRef}>{count}{suffix}</span>;
}



export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white text-[#241a46]">
        <section className="border-b border-gray-100 bg-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6 py-16 lg:flex-row lg:items-start lg:justify-between lg:px-8 lg:py-20">
            <div className="max-w-3xl">
              <div className="mb-7 flex h-20 w-20 items-center justify-center rounded-full bg-[#fff3eb] text-3xl text-[#6869F9] shadow-sm">
                <i className="fa-solid fa-hands-praying" aria-hidden="true"></i>
              </div>
              <h1 className="text-4xl font-black leading-tight text-[#16111f] md:text-6xl">
                One spiritual companion for astrology, remedies, and devotion.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-700">
                AstroVed helps people connect with Vedic wisdom in a simple digital experience. From astrology tools and Panchang to pujas, devotional content, temple offerings, and remedies, the platform brings trusted spiritual services closer to every home.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href="https://play.google.com/store/search?q=astroved&c=apps"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 rounded-xl bg-[#6869F9] px-7 py-4 text-sm font-extrabold uppercase tracking-wide text-white shadow-lg shadow-indigo-100 transition-all hover:bg-[#8283fa] active:scale-95"
                >
                  <i className="fa-brands fa-google-play text-base" aria-hidden="true"></i>
                  Android App
                </a>
                <a
                  href="https://apps.apple.com/us/app/AstroVed-astrology-remedies/id1406242342"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 rounded-xl bg-[#6869F9] px-7 py-4 text-sm font-extrabold uppercase tracking-wide text-white shadow-lg shadow-indigo-100 transition-all hover:bg-[#8283fa] active:scale-95"
                >
                  <i className="fa-brands fa-apple text-base" aria-hidden="true"></i>
                  iOS App
                </a>
              </div>
            </div>

            <div className="w-full max-w-sm rounded-2xl border border-[#ffe3cf] bg-[#fff8f0] p-6 shadow-[0_18px_50px_rgba(244,120,32,0.12)]">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#933913]">What you can do</p>
              <ul className="mt-5 space-y-4">
                {features.map((feature) => (
                  <li key={feature} className="flex gap-3 text-[15px] leading-6 text-[#4b2f24]">
                    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#6869F9] text-[10px] text-white">
                      <i className="fa-solid fa-check" aria-hidden="true"></i>
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-[#fafafa] px-6 py-14 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
            {stats.map((item) => (
              <div key={item.label} className="rounded-2xl border border-gray-100 bg-white p-7 text-center shadow-sm">
                <p className="text-4xl font-black text-[#1f1f1f]">
                  <AnimatedCounter target={item.target} suffix={item.suffix} />
                </p>
                <p className="mt-2 text-sm font-semibold text-gray-600">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-6 py-16 lg:px-8">
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="text-3xl font-black text-[#16111f]">Built for everyday spiritual practice</h2>
            <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-gray-700">
              Our goal is to make sacred rituals, astrology guidance, and devotional learning accessible without losing the warmth and discipline of tradition. Every service is designed to help devotees participate with clarity, trust, and convenience.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
