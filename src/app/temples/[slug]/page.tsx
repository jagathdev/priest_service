"use client";
import { use, useEffect, useRef, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { SparklesIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function TempleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [temple, setTemple] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [openTravel, setOpenTravel] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const isManualScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<any>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const overviewRef = useRef<HTMLDivElement>(null);
  const timingsRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/temple/detail?slug=${encodeURIComponent(slug)}`);
        if (!res.ok) {
          setTemple(null);
          return;
        }
        const data = await res.json();
        if (data?.error) {
          setTemple(null);
        } else {
          setTemple(data);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, [slug]);


  useEffect(() => {
    const handler = () => {
      if (isManualScrollingRef.current) return;

      // Check if we are at the bottom of the page
      const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50;
      if (isAtBottom) {
        if (locationRef.current) {
          setActiveTab("location");
          return;
        }
      }

      const offset = window.scrollY + 140; // offset (must be greater than scroll-mt-32 / 128px)
      if (locationRef.current && offset >= locationRef.current.offsetTop) setActiveTab("location");
      else if (timingsRef.current && offset >= timingsRef.current.offsetTop) setActiveTab("timings");
      else setActiveTab("overview");
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>, tab: string) => {
    isManualScrollingRef.current = true;
    setActiveTab(tab);
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      isManualScrollingRef.current = false;
    }, 800);
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (loading) return <div className="min-h-screen bg-white flex justify-center items-center"><Navbar /><div className="animate-spin h-9 w-9 border-4 border-[#6869F9] border-t-transparent rounded-full mt-20" /></div>;
  if (!temple) return <div className="min-h-screen bg-white"><Navbar /><p className="text-center py-32 text-gray-500">Temple not found.</p></div>;

  const fallbacks = [
    "https://images.unsplash.com/photo-1519280459341-33758079543e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1620766165457-a80fe560c888?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1599839619722-39751411ea63?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1582510003544-4d00b7f7415e?auto=format&fit=crop&w=400&q=80",
  ];
  const gallery = temple.gallery?.filter(Boolean).length >= 5 ? temple.gallery.filter(Boolean) : [temple.heroImage || fallbacks[0], ...fallbacks.slice(1)];

  const Tab = ({ id, label, ref: tabRef }: { id: string; label: string; ref: React.RefObject<HTMLDivElement | null> }) => (
    <button onClick={() => scrollTo(tabRef, id)}
      className={`px-6 py-4 text-[17px] font-semibold border-b-2 transition-all ${activeTab === id ? "border-[#6869F9] text-[#1f1f1f]" : "border-transparent text-gray-500 hover:text-gray-800"}`}>
      {label}
    </button>
  );

  const Sec = ({ title, children, sRef }: { title: string; children: React.ReactNode; sRef?: React.RefObject<HTMLDivElement | null> }) => (
    <div ref={sRef} className="scroll-mt-32 md:border-t md:border-gray-200 md:pt-7 md:pb-7">
      <div className="h-3 bg-[#f3f4f6] -mx-5 md:hidden" />
      <div className="py-5 md:py-0">
        <h2 className="text-[19px] md:text-[23px] font-bold text-[#111] mb-2 md:mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );

  const Body = ({ text }: { text: string }) => <p className="text-[14px] md:text-[17px] text-[#555] leading-[1.6] md:leading-[1.75]">{text}</p>;

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-[980px] mx-auto pb-20">

        {/* Gallery Lightbox Modal */}
        {showGallery && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center" onClick={() => setShowGallery(false)}>
            <button className="absolute top-5 right-6 text-white z-50" onClick={() => setShowGallery(false)}><XMarkIcon className="h-8 w-8" /></button>
            <button className="absolute left-4 text-white text-4xl px-4 z-50" onClick={e => { e.stopPropagation(); setGalleryIndex(i => Math.max(0, i - 1)); }}>‹</button>
            <img src={gallery[galleryIndex]} className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl" alt="" onClick={e => e.stopPropagation()} />
            <button className="absolute right-4 text-white text-4xl px-4 z-50" onClick={e => { e.stopPropagation(); setGalleryIndex(i => Math.min(gallery.length - 1, i + 1)); }}>›</button>
            <div className="absolute bottom-6 flex gap-2">
              {gallery.map((_: string, i: number) => (
                <button key={i} onClick={e => { e.stopPropagation(); setGalleryIndex(i); }}
                  className={`w-2 h-2 rounded-full transition-all ${i === galleryIndex ? "bg-white scale-125" : "bg-white/40"}`} />
              ))}
            </div>
          </div>
        )}

        {/* Gallery — overflow-hidden clips images strictly to h-[320px] */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[3px] h-[320px] overflow-hidden relative">
          <div className="overflow-hidden h-full relative cursor-pointer" onClick={() => { setGalleryIndex(0); setShowGallery(true); }}>
            <img src={gallery[0]} className="w-full h-full object-cover" alt={temple.name} />
            <div className="absolute bottom-4 right-4 bg-black/60 text-white text-[13px] px-2 py-0.5 rounded md:hidden font-medium">1/{gallery.length}</div>
            <button className="absolute top-4 right-4 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center md:hidden shadow-md text-[#1f1f1f]"
              onClick={(e) => {
                e.stopPropagation();
                const text = encodeURIComponent(`Visit ${temple.name} in ${temple.city}, ${temple.state}!\n${window.location.href}`);
                window.open(`https://wa.me/?text=${text}`, '_blank');
              }}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#25D366]" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </button>
          </div>
          <div className="hidden md:grid grid-cols-2 grid-rows-2 gap-[3px] h-full overflow-hidden">
            {[1,2,3].map((i: number) => (
              <div key={i} className="overflow-hidden cursor-pointer" onClick={() => { setGalleryIndex(i); setShowGallery(true); }}>
                <img src={gallery[i]} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" alt="" />
              </div>
            ))}
            <div className="relative overflow-hidden cursor-pointer" onClick={() => { setGalleryIndex(4); setShowGallery(true); }}>
              <img src={gallery[4]} className="w-full h-full object-cover" alt="" />
              <div className="absolute inset-0 bg-black/45 flex items-end justify-end p-2.5 hover:bg-black/60 transition-colors">
                <span className="text-white text-[11px] font-bold flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 16 16"><path d="M1 1h4v4H1zm6 0h4v4H7zm-6 6h4v4H1zm6 0h4v4H7z"/></svg>
                  Show All Photos
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Temple Name + Location — BELOW gallery, centered like SriMandir */}
        <div className="bg-white px-5 pt-6 pb-5 border-b border-gray-100 text-center">
          <h1 className="text-[26px] font-bold text-[#111] leading-tight mb-2">{temple.name}</h1>
          <p className="text-[15px] text-[#888] flex items-center justify-center gap-2 flex-wrap">
            {(temple.shortDescription || temple.tagline) && (
              <span>{temple.shortDescription || temple.tagline}</span>
            )}
            {(temple.shortDescription || temple.tagline) && <span className="text-gray-400">•</span>}
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 text-[#1f1f1f] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
              {temple.city}, {temple.state}{temple.country ? `, ${temple.country}` : ""}
            </span>
          </p>
        </div>

        <div className="px-5">
          {/* Action Buttons */}
          <div className="flex justify-center gap-10 md:gap-14 py-4 md:py-6 border-b border-gray-200">
            <a href="/puja" className="flex flex-col items-center gap-1.5 md:gap-2 hover:opacity-85 active:scale-95 transition-all cursor-pointer">
              <div className="w-[42px] h-[42px] md:w-14 md:h-14 rounded-xl md:rounded-[14px] bg-[#f97316] md:bg-gradient-to-br md:from-[#1f1f1f] md:to-[#F47820] flex items-center justify-center shadow-sm md:shadow-md">
                <svg className="h-5 w-5 text-white md:hidden" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.25 2.25c-.2.7-.42 1.41-.65 2.12-.46 1.42-1.01 2.92-1.55 4.38-.85 2.3-1.8 4.74-1.8 7.25 0 2.62 2.13 4.75 4.75 4.75s4.75-2.13 4.75-4.75c0-2.51-.95-4.95-1.8-7.25-.54-1.46-1.09-2.96-1.55-4.38-.23-.71-.45-1.42-.65-2.12-.13-.42-.77-.42-.9 0zm.75 16c-1.38 0-2.5-1.12-2.5-2.5 0-1.44.82-3.1 1.63-5.11.26-.64.51-1.28.75-1.92.24.64.49 1.28.75 1.92.81 2.01 1.63 3.67 1.63 5.11 0 1.38-1.12 2.5-2.5 2.5z"/>
                </svg>
                <SparklesIcon className="hidden md:block h-8 w-8 text-white" />
              </div>
              <span className="text-[11px] md:text-[13px] font-semibold text-[#333] text-center leading-tight">Book your<br/>Pooja</span>
            </a>
            <button
              onClick={() => {
                const text = encodeURIComponent(`Visit ${temple.name} in ${temple.city}, ${temple.state}!\n${window.location.href}`);
                window.open(`https://wa.me/?text=${text}`, '_blank');
              }}
              className="flex flex-col items-center gap-1.5 md:gap-2 hover:opacity-85 active:scale-95 transition-all cursor-pointer">
              <div className="w-[42px] h-[42px] md:w-14 md:h-14 rounded-xl md:rounded-[14px] bg-[#3d4854] flex items-center justify-center shadow-sm md:shadow-md">
                <svg className="w-5 h-5 md:w-8 md:h-8 text-[#25D366] md:text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <span className="text-[11px] md:text-[13px] font-semibold text-[#333] text-center leading-tight">Share with<br/>friends</span>
            </button>
          </div>

          {/* Section Nav — sticky below action buttons */}
          <div className="hidden md:block sticky top-[64px] z-40 bg-white border-b border-gray-200 shadow-sm -mx-5 px-8 mt-0">
            <div className="flex justify-between">
              <Tab id="overview" label="Overview" ref={overviewRef} />
              <Tab id="timings" label="Timings" ref={timingsRef} />
              <Tab id="location" label="Location" ref={locationRef} />
            </div>
          </div>

          {/* Overview anchor */}
          <div ref={overviewRef} className="scroll-mt-32" />

          {/* Description */}
          {(temple.overview || temple.shortDescription) && (
            <div className="pt-4 pb-4"><Body text={temple.overview || temple.shortDescription} /></div>
          )}

          {temple.history && <Sec title="History of the temple"><Body text={temple.history} /></Sec>}
          {temple.significance && <Sec title="Significance of the temple"><Body text={temple.significance} /></Sec>}
          {temple.architecture && <Sec title="Architecture of the temple"><Body text={temple.architecture} /></Sec>}

          {/* Timings */}
          {temple.timings && Object.values(temple.timings).some(v => v) && (
            <Sec title="Temple Timings" sRef={timingsRef}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {temple.timings.morningOpen && temple.timings.morningClose && (
                  <TimingCard icon="calendar" label="Temple morning timings" time={`${temple.timings.morningOpen} - ${temple.timings.morningClose}`} />
                )}
                {temple.timings.aartiTiming && (
                  <TimingCard icon="bell" label="Mangala Aarti timings" time={temple.timings.aartiTiming} />
                )}
                {temple.timings.eveningOpen && temple.timings.eveningClose && (
                  <TimingCard icon="calendar" label="Temple evening timings" time={`${temple.timings.eveningOpen} - ${temple.timings.eveningClose}`} />
                )}
              </div>
            </Sec>
          )}

          {/* Offerings */}
          {temple.offerings?.length > 0 && (
            <Sec title="Offerings of the temple">
              <Body text={`${temple.name} is offered ${temple.offerings.map((o: any) => o.name).join(", ")} as prasad. Devotees offer these to show their reverence.`} />
            </Sec>
          )}

          {/* Festivals */}
          {temple.festivals?.filter(Boolean).length > 0 && (
            <Sec title="Festivals">
              <ul className="space-y-2">
                {temple.festivals.filter(Boolean).map((f: string, i: number) => (
                  <li key={i} className="text-[15px] text-[#555] flex items-start gap-2">
                    <span className="text-[#1f1f1f] font-bold mt-0.5">•</span>{f}
                  </li>
                ))}
              </ul>
            </Sec>
          )}

          {/* Travel Details — Location section */}
          {temple.howToReach && Object.values(temple.howToReach).some(v => v) && (
            <Sec title="Travel Details" sRef={locationRef}>
              <p className="text-[16px] text-[#555] mb-4">The below are the travel details for the temple.</p>
              {temple.coordinates?.latitude && (
                <div className="rounded-lg overflow-hidden mb-5 h-[420px]">
                  <iframe className="w-full h-full border-0" loading="lazy"
                    src={`https://maps.google.com/maps?q=${temple.coordinates.latitude},${temple.coordinates.longitude}&z=14&output=embed`} />
                </div>
              )}
              <div className="space-y-2">
                {[
                  { key: "air", label: "Airplane", val: temple.howToReach.byAir, icon: (
                    <svg className="w-5 h-5 text-[#1f1f1f]" fill="currentColor" viewBox="0 0 24 24"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>
                  )},
                  { key: "train", label: "Train", val: temple.howToReach.byTrain, icon: (
                    <svg className="w-5 h-5 text-[#1f1f1f]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h2l2-2h4l2 2h2v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-4-4-8-4zm0 2c3.51 0 5.44.49 5.93 1H6.07C6.56 4.49 8.49 4 12 4zM6 7h5v3H6V7zm11 0v3h-5V7h5zm-1 9H8c-.55 0-1-.45-1-1s.45-1 1-1h8c.55 0 1 .45 1 1s-.45 1-1 1z"/></svg>
                  )},
                  { key: "road", label: "Road", val: temple.howToReach.byRoad, icon: (
                    <svg className="w-5 h-5 text-[#1f1f1f]" fill="currentColor" viewBox="0 0 24 24"><path d="M17.66 11.2c-.23-.3-.51-.56-.77-.82-.67-.6-1.43-1.03-2.07-1.66C13.33 7.26 13 4.85 13.95 3c-.95.23-1.78.75-2.49 1.32-2.59 2.08-3.61 5.75-2.39 8.9.04.1.08.2.08.33 0 .22-.15.42-.35.5-.23.1-.47.04-.66-.12a.58.58 0 01-.14-.17c-1.13-1.43-1.31-3.48-.55-5.12C5.78 10 4.87 12.3 5 14.47c.06.5.12 1 .29 1.5.14.6.41 1.2.71 1.73 1.08 1.73 2.95 2.97 4.96 3.22 2.14.27 4.43-.12 6.07-1.6 1.83-1.66 2.47-4.32 1.53-6.6l-.13-.21-.67-.71zM11.71 19c-1.78-.01-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.19 2.75-.28 4-.48 1.23-1.4 2.31-2.52 2.96-.51.28-1.32.88-1.41.88z"/></svg>
                  )},
                ].filter(t => t.val).map(t => (
                  <div key={t.key} className="border border-gray-200 rounded-lg overflow-hidden">
                    <button onClick={() => setOpenTravel(openTravel === t.key ? null : t.key)}
                      className="w-full text-left px-4 py-3.5 flex justify-between items-center bg-white hover:bg-gray-50 transition-colors">
                      <span className="flex items-center gap-3 text-[16px] font-semibold text-[#111]">
                        {t.icon}{t.label}
                      </span>
                      <svg className={`w-4 h-4 text-gray-400 transition-transform ${openTravel === t.key ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {openTravel === t.key && <p className="px-4 py-3 text-[16px] text-[#555] leading-[1.7] border-t border-gray-100">{t.val}</p>}
                  </div>
                ))}
              </div>
            </Sec>
          )}

          {/* FAQ — after Travel Details */}
          {temple.faq?.length > 0 && (
            <Sec title="Frequently Asked Questions">
              <div className="space-y-2">
                {temple.faq.map((faq: any, idx: number) => (
                  <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                    <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className="w-full text-left px-4 py-3.5 flex justify-between items-center bg-gray-50 text-[16px] font-semibold text-[#111]">
                      {faq.question}
                      <svg className={`w-4 h-4 text-gray-400 ml-2 transition-transform flex-shrink-0 ${openFaq === idx ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {openFaq === idx && <p className="px-4 py-4 text-[16px] text-[#555] leading-[1.7]">{faq.answer}</p>}
                  </div>
                ))}
              </div>
            </Sec>
          )}

          {/* Social Media */}
          <div className="border-t border-gray-200 pt-6 pb-8">
            <h2 className="text-[21px] font-bold text-[#111] mb-1">Social Media</h2>
            <p className="text-[14px] text-[#888] mb-5">Social media associated with the temple</p>
            <div className="flex items-center gap-7">
              {/* YouTube */}
              <a href="#" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#FF0000"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                <span className="text-[14px] font-semibold text-[#333]">YouTube</span>
              </a>
              {/* Instagram */}
              <a href="#" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="url(#ig)">
                  <defs>
                    <linearGradient id="ig" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f09433"/>
                      <stop offset="25%" stopColor="#e6683c"/>
                      <stop offset="50%" stopColor="#d95f13"/>
                      <stop offset="75%" stopColor="#d95f13"/>
                      <stop offset="100%" stopColor="#F47820"/>
                    </linearGradient>
                  </defs>
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span className="text-[14px] font-semibold" style={{fontStyle:"italic",background:"linear-gradient(45deg,#f09433,#d95f13,#F47820)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Instagram</span>
              </a>
              {/* Facebook */}
              <a href="#" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                <span className="text-[14px] font-semibold text-[#1877F2]">facebook</span>
              </a>
            </div>
          </div>

          {/* Orange footer bar */}
          <div className="h-2 bg-[#6869F9] -mx-5 rounded-b" />
        </div>
      </div>
    </main>
  );
}

function TimingCard({ icon, label, time }: { icon: "calendar" | "bell"; label: string; time: string }) {
  return (
    <div className="bg-[#fcfcfc] md:bg-[#f7f7f7] rounded-xl p-3 md:p-4 flex items-start gap-3 border border-gray-50 md:border-none shadow-[0_1px_2px_rgba(0,0,0,0.02)] md:shadow-none mb-1 md:mb-0">
      <div className="w-10 h-10 md:bg-[#6869F9] bg-[#fff0e6] rounded-full md:rounded-lg flex items-center justify-center flex-shrink-0">
        {icon === "calendar"
          ? <svg className="w-5 h-5 md:text-white text-[#f97316]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
          : <svg className="w-5 h-5 md:text-white text-[#f97316]" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/></svg>
        }
      </div>
      <div>
        <p className="text-[14px] md:text-[15px] font-bold text-[#111] leading-tight mt-0.5">{label}</p>
        <p className="text-[13px] md:text-[14px] text-[#888] mt-1 uppercase tracking-wide">{time}</p>
      </div>
    </div>
  );
}

