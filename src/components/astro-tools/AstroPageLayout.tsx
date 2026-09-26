"use client";

import { useState, ReactNode } from "react";
import Link from "next/link";

// --- Types --------------------------------------------------------------------
export interface FAQItem {
  q: string;
  a: string;
}

export interface AstroPageLayoutProps {
  /** Breadcrumb last label */
  breadcrumb: string;
  /** Hero title text */
  heroTitle: string;
  /** Page SEO subtitle shown above the hero banner */
  seoSubtitle: string;
  /** Left main content (form + results) */
  children: ReactNode;
  /** SEO paragraphs below the form  */
  seoSections: { heading: string; body: string }[];
  /** FAQ items */
  faqs: FAQItem[];
  /** href of the current calculator — excluded from Popular Calculators sidebar */
  currentHref: string;
}

// --- Sidebar data -------------------------------------------------------------
const ARTICLES = [
  { title: "Hanuman Chalisa", updated: "November 17, 2025", img: "Om", href: "/library" },
  { title: "Sharad Purnima Quotes & Wishes", updated: "May 19, 2025", img: "Moon", href: "/library" },
  { title: "Chaitra Amavasya Fast Story", updated: "April 29, 2025", img: "Pray", href: "/library" },
];

const POPULAR_CALCS = [
  { label: "Janma Rashi Finder", href: "/astro-tools/janma-rashi" },
  { label: "Nakshatra Finder", href: "/astro-tools/nakshatra" },
];

// --- FAQ Accordion ------------------------------------------------------------
function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <button
            className="w-full flex items-center justify-between px-5 py-4 text-left"
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span className="text-base font-semibold text-gray-800 pr-4">{item.q}</span>
            <span className="flex-shrink-0 w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 text-sm font-bold">
              {open === i ? "-" : "+"}
            </span>
          </button>
          {open === i && (
            <div className="px-5 pb-4 text-base text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
              {item.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// --- Sidebar ------------------------------------------------------------------
function Sidebar({ currentHref }: { currentHref: string }) {
  const filteredCalcs = POPULAR_CALCS.filter((c) => c.href !== currentHref);

  return (
    <aside className="flex flex-col gap-5 lg:sticky lg:top-20">
      {/* App promo card */}
      <div
        className="rounded-2xl overflow-hidden p-5 text-white"
        style={{ background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)" }}
      >
        <p className="text-sm font-semibold uppercase tracking-wider text-violet-100 mb-1">AstroVed App</p>
        <p className="text-xl font-extrabold leading-snug mb-4">
          One App For all your Devotional Needs
        </p>
        <a
          href="#download-app"
          className="flex items-center gap-2 bg-white text-violet-600 text-sm font-bold px-4 py-3 rounded-xl hover:bg-violet-50 active:scale-95 transition-all"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.42c1.42.07 2.4.78 3.22.8 1.22-.24 2.39-.94 3.68-.84 1.58.13 2.77.8 3.55 2.03-3.27 1.96-2.5 6.32.55 7.54-.65 1.7-1.5 3.37-3 4.33zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
          </svg>
          Download App
        </a>
      </div>

      {/* Popular articles */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-gray-900">Popular articles for you</h3>
          <Link href="/library" className="text-sm text-violet-500 font-semibold hover:underline">Read more &gt;</Link>
        </div>
        <div className="flex flex-col gap-3">
          {ARTICLES.map((a) => (
            <Link
              key={a.title}
              href={a.href}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors group"
            >
              <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center text-xs font-bold text-violet-700 flex-shrink-0">
                {a.img}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2">{a.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">Updated on {a.updated}</p>
              </div>
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0 group-hover:text-violet-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </div>

      {/* Popular calculators — excludes current page */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-gray-900">Popular Calculators</h3>
          <Link href="/astro-tools" className="text-sm text-violet-500 font-semibold hover:underline">See More &gt;</Link>
        </div>
        <div className="flex flex-col gap-2">
          {filteredCalcs.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-100 hover:border-violet-200 hover:bg-violet-50 transition-all duration-200 group"
            >
              <span className="text-sm font-medium text-gray-700 group-hover:text-violet-700">{c.label}</span>
              <svg className="w-4 h-4 text-gray-400 group-hover:text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}

// --- Main Layout --------------------------------------------------------------
export default function AstroPageLayout({
  breadcrumb,
  heroTitle,
  seoSubtitle,
  children,
  seoSections,
  faqs,
  currentHref,
}: AstroPageLayoutProps) {
  return (
    <div className="min-h-screen bg-[#f5f5f5]">

      {/* -- Breadcrumb -- */}
      <nav className="bg-[#f5f3ff] py-3.5 px-4 md:px-6 sticky top-[56px] md:top-[64px] z-30 border-b border-[#ddd6fe]">
        <div className="mx-auto max-w-7xl text-[12px] md:text-[14px] font-semibold text-gray-500 flex items-center gap-2 md:gap-2.5 overflow-x-auto no-scrollbar">
          <Link href="/" className="hover:text-gray-800 transition-colors shrink-0">Home</Link>
          <i className="fa-solid fa-chevron-right text-[10px] opacity-70 shrink-0"></i>
          <Link href="/astro-tools" className="hover:text-gray-800 transition-colors shrink-0">Astrology Calculator</Link>
          <i className="fa-solid fa-chevron-right text-[10px] opacity-70 shrink-0"></i>
          <span className="text-[#1f1f1f] truncate max-w-[200px] md:max-w-[300px] font-bold shrink-0">{breadcrumb}</span>
        </div>
      </nav>

      <div className="max-w-[1400px] mx-auto px-0 md:px-6 py-0 md:py-6">

        {/* SEO subtitle */}
        <p className="text-[13px] md:text-base text-gray-600 mb-0 md:mb-4 font-medium px-4 md:px-0 pt-4 md:pt-0 hidden md:block">{seoSubtitle}</p>

        {/* -- Hero Banner -- */}
        <div
          className="relative w-full rounded-none md:rounded-3xl overflow-hidden mb-0 md:mb-8 flex items-end min-h-[160px] md:min-h-[300px]"
          style={{
            background: "linear-gradient(135deg, #0f0c29 0%, #1a1a4e 40%, #2d1b69 100%)",
          }}
        >
          {/* Cosmic overlay image (zodiac wheel) */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `url("https://imgs.search.brave.com/acCjMCO5vYOt4Fj3wdCMtAipxx5GpIeFIJ-3Grf2FcQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90aHVt/YnMuZHJlYW1zdGlt/ZS5jb20vYi9uYWtz/aGF0cmEtdmVkaWMt/YXN0cm9sb2d5LWls/bHVzdHJhdGlvbi1y/YXNoaS1ncmFoYS1s/YWduYS1kYXNoYS1i/aGF2YS1yYWh1LW5h/a3NoYXRyYS12ZWRp/Yy1hc3Ryb2xvZ3kt/bmFrc2hhdHJhLXZl/ZGljLWFzdHJvbG9n/eS0zNzM5MzI2MDAu/anBn")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          {/* Title */}
          <div className="relative z-10 p-4 pb-12 md:p-10 md:pb-12 w-full flex items-center justify-between">
            <h1 className="text-[1.25rem] md:text-5xl font-extrabold text-white leading-tight drop-shadow-lg">
              {heroTitle}
            </h1>
            <button
              onClick={() => {
                const t = encodeURIComponent(`${heroTitle}: ${window.location.href}`);
                window.open(`https://wa.me/?text=${t}`, "_blank", "noopener,noreferrer");
              }}
              className="md:hidden flex items-center justify-center w-8 h-8 rounded-full bg-white text-green-500 shadow-sm hover:shadow-md active:scale-95 transition-all duration-200 shrink-0"
              aria-label="Share on WhatsApp"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-[16px] h-[16px] md:w-[20px] md:h-[20px]">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </button>
          </div>
        </div>

        {/* -- 70/30 Layout -- */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-7 items-start">

          {/* -- LEFT: Form + SEO content -- */}
          <div className="flex flex-col gap-7">
            {/* Form card wrapper (overlaps hero on mobile) */}
            <div className="-mt-8 md:mt-0 relative z-20 px-3 md:px-0">
              {children}
            </div>

            {/* SEO content sections — no card wrapper, plain content */}
            <div className="px-1">
              {seoSections.map((s, i) => (
                <div key={i} className={i > 0 ? "mt-7" : ""}>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{s.heading}</h2>
                  <p className="text-base text-gray-600 leading-[1.9]">{s.body}</p>
                </div>
              ))}
            </div>

            {/* FAQ section — no card wrapper, plain content with accordion items styled individually */}
            <div className="px-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">FAQs</h2>
              <FAQAccordion items={faqs} />
            </div>
          </div>

          {/* -- RIGHT: Sidebar -- */}
          <Sidebar currentHref={currentHref} />
        </div>
      </div>

    </div>
  );
}


