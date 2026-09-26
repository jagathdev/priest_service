"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import { OfferingCard } from "@/components/chadhava/OfferingCard";
import { HighlightOffering } from "@/components/chadhava/HighlightOffering";
import { FAQAccordion } from "@/components/chadhava/FAQAccordion";
import { PencilSquareIcon, SparklesIcon, TagIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useCurrency } from "@/contexts/CurrencyContext";
import LoginModal from "@/components/auth/LoginModal";

interface Offering {
  id: string;
  name: string;
  price: number;
  priceINR?: number;
  priceUSD?: number;
  priceMYR?: number;
  description: string;
  imageUrl?: string;
}

interface Faq {
  question: string;
  answer: string;
}

interface ChadhavaRecord {
  _id: string;
  title: string;
  subtitle?: string;
  description?: string;
  heroTitle?: string;
  content?: string;
  imageUrl?: string;
  location?: string;
  slug: string;
  offerings: Offering[];
  faqs: Faq[];
}

export default function ChadhavaDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [data, setData] = useState<ChadhavaRecord | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { currency, currencySymbol } = useCurrency();
  const getOfferingPrice = (off: any) => {
    return off[`price${currency}`] ?? off.price ?? 0;
  };

  // Cart State
  const [cart, setCart] = useState<Record<string, number>>({});
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1); // 1: Details, 2: Review, 3: Completed
  const [userInfo, setUserInfo] = useState({ whatsapp: "", name: "" });

  // UI State
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/chadhava?slug=${slug}`)
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  const toggleOffering = (off: Offering) => {
    setCart((prev) => {
      const current = prev[off.id] || 0;
      if (current > 0) {
        const next = { ...prev };
        delete next[off.id];
        return next;
      }
      return { ...prev, [off.id]: 1 };
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) => {
      const current = prev[id] || 0;
      const next = current + delta;
      if (next <= 0) {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      }
      return { ...prev, [id]: next };
    });
  };

  const selectedCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const selectedTotal = data?.offerings
    ? Object.entries(cart).reduce((total, [id, qty]) => {
        const off = data.offerings.find((o) => o.id === id);
        return total + (off ? getOfferingPrice(off) : 0) * qty;
      }, 0)
    : 0;

  const carouselImages = data?.imageUrl ? [
    data.imageUrl,
    "https://images.unsplash.com/photo-1604085572504-a392ddf0d86a?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1601024445121-e5b82f020549?auto=format&fit=crop&w=1200&q=80"
  ] : ["https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80"];

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
  };
  
  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? carouselImages.length - 1 : prev - 1));
  };
  
  const handleDotClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center py-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6869F9]"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="text-center py-40">
          <h2 className="text-2xl font-bold text-gray-800">Chadhava offering not found</h2>
          <Link href="/chadhava" className="text-[#1f1f1f] font-bold mt-4 inline-block underline">Back to Chadhava</Link>
        </div>
      </div>
    );
  }

  // Final Review Booking UI
  if (step === 2) {
    const selectedItems = data.offerings.filter(o => cart[o.id]);
    const unselectedItems = data.offerings.filter(o => !cart[o.id]);

    return (
      <div className="min-h-screen bg-[#f8f9fa]">
        <Navbar />
        {/* Review Breadcrumbs */}
        <div className="bg-white border-b border-gray-100 py-3 px-4">
           <div className="mx-auto max-w-7xl flex items-center justify-between">
              <div className="flex items-center gap-2 text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-[#1f1f1f] overflow-x-auto no-scrollbar">
                 <div className="flex items-center gap-1.5 shrink-0">
                   <div className="h-5 w-5 rounded-full bg-[#6869F9] text-white flex items-center justify-center text-[8px] shrink-0">
                     <svg viewBox="0 0 12 12" fill="none" className="h-2.5 w-2.5"><path d="M2 6.5 4.8 9 10 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                   </div>
                   Add Details
                 </div>
                 <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3 shrink-0 text-gray-300"><path d="M5 3l6 5-6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                 <div className="flex items-center gap-1.5 shrink-0">
                   <div className="h-5 w-5 rounded-full bg-[#6869F9] text-white flex items-center justify-center text-[8px] shrink-0">
                     <svg viewBox="0 0 12 12" fill="none" className="h-2.5 w-2.5"><path d="M2 6.5 4.8 9 10 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                   </div>
                   Review Booking
                 </div>
                 <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3 shrink-0 text-gray-300"><path d="M5 3l6 5-6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                 <div className="flex items-center gap-1.5 shrink-0 opacity-40">
                   <div className="h-5 w-5 rounded-full bg-gray-300 text-white flex items-center justify-center text-[8px] shrink-0">3</div>
                   Fill Name, Gotra &amp; Address
                 </div>
                 <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3 shrink-0 text-gray-300"><path d="M5 3l6 5-6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                 <div className="flex items-center gap-1.5 shrink-0 opacity-40">
                   <div className="h-5 w-5 rounded-full bg-gray-300 text-white flex items-center justify-center text-[8px] shrink-0">4</div>
                   Make Payment
                 </div>
              </div>
           </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
           {/* Left Column: Review Items */}
           <div className="lg:col-span-2 space-y-6">
              <button 
                onClick={() => setStep(1)}
                className="flex items-center gap-2 text-sm font-bold text-[#1f1f1f] hover:text-[#1f1f1f] transition-colors mb-6"
              >
                <i className="fa-solid fa-arrow-left"></i> Review Booking
              </button>

              <div className="space-y-4">
                 {selectedItems.map(item => (
                   <div key={item.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative">
                      <div className="flex justify-between items-start mb-4">
                         <div>
                            <h3 className="font-bold text-[#1f1f1f]">{item.name}</h3>
                            <p className="text-gray-900 font-bold mt-1 text-sm">{currencySymbol} {getOfferingPrice(item)}</p>
                         </div>
                         <div className="flex items-center gap-4 bg-[#6869F9] text-white px-3 py-1.5 rounded-lg text-sm font-bold">
                            <button onClick={() => updateQuantity(item.id, -1)} className="hover:scale-125">-</button>
                            <span className="min-w-[12px] text-center">{cart[item.id]}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="hover:scale-125">+</button>
                         </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                         <div className="flex items-center gap-2 text-[#1f1f1f] text-[10px] font-bold">
                            <i className="fa-brands fa-whatsapp text-sm"></i>
                            <span>+{userInfo.whatsapp} (Your WhatsApp Number)</span>
                         </div>
                         <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-400 italic hover:text-[#1f1f1f]">
                            <PencilSquareIcon className="h-3.5 w-3.5" /> Edit
                         </button>
                      </div>
                   </div>
                 ))}
                 
                 <div className="bg-violet-50/50 rounded-2xl p-6 flex justify-between items-center cursor-pointer hover:bg-violet-50 transition-colors">
                    <div className="flex items-center gap-3">
                       <TagIcon className="h-6 w-6 text-[#1f1f1f]" />
                       <span className="font-bold text-sm text-[#1f1f1f]">Apply Coupon</span>
                    </div>
                    <i className="fa-solid fa-chevron-right text-gray-400 text-xs"></i>
                 </div>

                 <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-[#1f1f1f] mb-6">Bill details</h3>
                    <div className="space-y-4 text-sm font-medium text-gray-500">
                       {selectedItems.map(item => (
                         <div key={item.id} className="flex justify-between">
                            <span>{item.name}</span>
                            <span>{currencySymbol} {(getOfferingPrice(item) * cart[item.id]).toFixed(2)}</span>
                         </div>
                       ))}
                       <div className="pt-4 border-t border-gray-100 flex justify-between text-lg font-extrabold text-[#1f1f1f]">
                          <span>Total Amount</span>
                          <span>{currencySymbol} {selectedTotal.toFixed(2)}</span>
                       </div>
                    </div>
                 </div>

                 <div className="mt-6">
                   <div className="flex items-center justify-between bg-[#6869F9] text-white p-4 rounded-2xl shadow-xl shadow-[#6869F9]/20">
                      <div className="flex items-center gap-4 text-sm font-bold">
                         <span>{selectedCount} Offerings</span>
                         <span className="opacity-50">•</span>
                         <span>{currencySymbol} {selectedTotal}</span>
                      </div>
                      <button 
                        onClick={async () => {
                           setLoading(true);
                           try {
                              const res = await fetch("/api/auth/me");
                              const authData = await res.json();

                              if (!authData.authenticated) {
                                 setPendingUrl(`/sankalp?amount=${selectedTotal}&type=chadhava&title=${encodeURIComponent(data.title)}&wa=${userInfo.whatsapp}&name=${encodeURIComponent(userInfo.name)}`);
                                 setShowLoginModal(true);
                                 return;
                              }

                              // Proceed to payment
                              window.location.href = `/sankalp?amount=${selectedTotal}&type=chadhava&title=${encodeURIComponent(data.title)}&wa=${userInfo.whatsapp}&name=${encodeURIComponent(userInfo.name)}`;
                           } catch (err) {
                              console.error(err);
                              alert("Authentication error. Please try again.");
                           } finally {
                              setLoading(false);
                           }
                        }}
                        className="flex items-center gap-2 font-bold hover:gap-4 transition-all uppercase tracking-widest text-sm"
                      >
                         {loading ? "Checking Session..." : "Proceed to Payment"} <i className="fa-solid fa-arrow-right"></i>
                      </button>
                   </div>
                 </div>
              </div>
           </div>

           {/* Right Column: Upsell Items */}
           <div>
              <h3 className="font-bold text-[#1f1f1f] mb-6">Add more offering items</h3>
              <div className="space-y-4">
                 {unselectedItems.map(item => (
                   <div key={item.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-4 group">
                      <div className="h-16 w-20 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                         <img src={item.imageUrl || "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=200&q=80"} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                         <h4 className="font-bold text-[13px] text-[#1f1f1f] truncate w-32">{item.name}</h4>
                         <p className="text-gray-400 text-[10px] mt-0.5">{item.description.slice(0, 30)}...</p>
                         <p className="text-[#1f1f1f] font-bold text-[13px] mt-1">{currencySymbol} {getOfferingPrice(item)}</p>
                      </div>
                      <button 
                        onClick={() => toggleOffering(item)}
                        className="bg-white text-[#1f1f1f] border border-[#6869F9] h-8 px-4 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-[#6869F9] hover:text-white transition-all active:scale-95"
                      >
                         + Add
                      </button>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Login Modal for booking flow */}
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSuccess={() => {
            setShowLoginModal(false);
            if (pendingUrl) window.location.href = pendingUrl;
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f3ff] pb-32">
      <Navbar />

      {/* Breadcrumbs */}
      <nav className="bg-[#f5f3ff] py-3.5 px-6 sticky top-[64px] z-30 border-b border-[#ddd6fe]">
        <div className="mx-auto max-w-7xl text-[14px] font-semibold text-gray-500 flex items-center gap-2 md:gap-2.5 overflow-x-auto no-scrollbar">
          <Link href="/" className="hover:text-gray-800 transition-colors shrink-0 whitespace-nowrap">Home</Link>
          <i className="fa-solid fa-chevron-right text-[10px] opacity-70 shrink-0"></i>
          <Link href="/chadhava" className="hover:text-gray-800 transition-colors shrink-0 whitespace-nowrap">AstroVed Chadhava Seva</Link>
          <i className="fa-solid fa-chevron-right text-[10px] opacity-70 shrink-0"></i>
          <span className="text-[#1f1f1f] truncate font-bold shrink-0">{data.title}</span>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-white py-4 md:py-10 lg:py-16">
        <div className="mx-auto max-w-[1200px] px-4 md:px-6 grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-10">
          <div className="relative group">
            <div className="rounded-[16px] md:rounded-2xl overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.08)] md:shadow-sm relative">
               <img 
                 src={carouselImages[currentImageIndex]} 
                 alt={data.title} 
                 className="w-full aspect-[16/10] object-cover transition-opacity duration-300"
               />
               {carouselImages.length > 1 && (
                 <>
                   <button 
                     onClick={handlePrevImage}
                     className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all text-gray-700 hover:scale-110 active:scale-95"
                   >
                      <i className="fa-solid fa-chevron-left text-[12px]"></i>
                   </button>
                   <button 
                     onClick={handleNextImage}
                     className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all text-gray-700 hover:scale-110 active:scale-95"
                   >
                      <i className="fa-solid fa-chevron-right text-[12px]"></i>
                   </button>
                 </>
               )}
             </div>
             {/* Dots */}
             {carouselImages.length > 1 && (
               <div className="flex items-center gap-2 mt-5">
                  {carouselImages.map((_, idx) => (
                    <button 
                      key={idx}
                      onClick={() => handleDotClick(idx)}
                      className={`h-2 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'w-6 bg-[#6869F9]' : 'w-2 bg-gray-300 hover:bg-gray-400'}`}
                    />
                  ))}
               </div>
             )}
           </div>
           <div className="lg:pl-4 mt-2 md:mt-0">
            <h1 className="text-[19px] md:text-3xl lg:text-[34px] font-bold text-[#687383] leading-[1.3] mb-3 md:mb-6">
              {data.heroTitle || data.title}
            </h1>
            <div className="text-[13px] md:text-[15px] text-[#555] leading-[1.6] md:leading-[1.7] mb-5 md:mb-6 italic md:not-italic">
              <p className="hidden md:flex items-center gap-2">
                <SparklesIcon className="h-5 w-5 shrink-0 text-[#1f1f1f]" />
                <strong>What happens when the offering is made?</strong>
              </p>
              <div className={`mt-0 md:mt-2 transition-all ${!isExpanded ? 'line-clamp-4' : ''}`}>
                 {data.content ? data.content : data.description}
              </div>
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-gray-800 font-bold mt-1.5 underline decoration-gray-400 underline-offset-2 text-[12px] md:text-[14px] hover:text-[#1f1f1f] transition-colors not-italic"
              >
                {isExpanded ? 'Read less' : 'Read more'}
              </button>
            </div>
            
            <div className="flex items-center gap-4 mt-5 md:mt-8">
                <div className="flex -space-x-2">
                   <div className="h-7 w-7 md:h-9 md:w-9 rounded-full border-2 border-white bg-gray-200 overflow-hidden"><img src="https://i.pravatar.cc/32?u=1" alt="user" /></div>
                   <div className="h-7 w-7 md:h-9 md:w-9 rounded-full border-2 border-white bg-gray-200 overflow-hidden"><img src="https://i.pravatar.cc/32?u=2" alt="user" /></div>
                   <div className="h-7 w-7 md:h-9 md:w-9 rounded-full border-2 border-white bg-gray-200 overflow-hidden"><img src="https://i.pravatar.cc/32?u=3" alt="user" /></div>
                   <div className="h-7 w-7 md:h-9 md:w-9 rounded-full border-2 border-white bg-gray-200 overflow-hidden"><img src="https://i.pravatar.cc/32?u=4" alt="user" /></div>
                   <div className="h-7 w-7 md:h-9 md:w-9 rounded-full border-2 border-white bg-gray-200 overflow-hidden"><img src="https://i.pravatar.cc/32?u=5" alt="user" /></div>
                </div>
            </div>
            <p className="text-[11px] md:text-[15px] text-[#555] leading-[1.5] md:leading-relaxed mt-2 md:mt-4">
               Till now <span className="text-[#1f1f1f] font-bold">1,50,000+ Devotees</span> have participated in Chadava conducted by Sri Mandir Chadava Seva.
            </p>
          </div>
        </div>
      </section>

      {/* Offerings Selector */}
      <section className="py-6 md:py-10 lg:py-16 bg-white md:bg-[#f8f8f8]">
        <div className="mx-auto max-w-[1000px] px-4 md:px-6">
          <h2 className="text-[16px] md:text-[28px] font-bold text-[#111] mb-4 md:mb-8">Choose an offering</h2>
          
          <div className="flex flex-col border-t border-[#ececec]">
            {data.offerings.map((off, index) => {
              const qty = cart[off.id] || 0;
              const isHighlight = index === data.offerings.length - 1 && data.offerings.length > 1; // Highlight the last offering if there are multiple
              
              if (isHighlight) {
                return (
                  <HighlightOffering 
                    key={off.id}
                    offering={off}
                    qty={qty}
                    onToggle={toggleOffering as any}
                    onUpdateQty={updateQuantity}
                  />
                );
              }
              
              return (
                <OfferingCard
                  key={off.id}
                  offering={off}
                  qty={qty}
                  onToggle={toggleOffering as any}
                  onUpdateQty={updateQuantity}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-8 md:py-16 bg-white md:border-t md:border-[#ececec]">
        <div className="mx-auto max-w-[1000px] px-4 md:px-6">
           <h2 className="text-[18px] md:text-[28px] font-bold text-[#111827] mb-5 md:mb-8 hidden md:block">Frequently asked Questions</h2>
           <div className="flex flex-col border-t border-[#ececec]">
              {data.faqs.map((faq, i) => (
                <FAQAccordion
                  key={i}
                  question={faq.question}
                  answer={faq.answer}
                />
              ))}
           </div>
        </div>
      </section>

      {/* Cart Bar */}
      {selectedCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 p-3 md:p-4 lg:p-6 z-50 animate-in slide-in-from-bottom duration-500">
           <div className="mx-auto max-w-7xl flex items-center justify-between bg-[#6869F9] text-white p-3 md:p-4 lg:p-5 rounded-[20px] md:rounded-[24px] shadow-2xl shadow-[#6869F9]/30">
              <div className="flex items-center gap-2 md:gap-4 text-[13px] md:text-sm lg:text-base font-bold pl-2 md:pl-4">
                 <span>{selectedCount} Offerings</span>
                 <span className="opacity-40">•</span>
                 <span>{currencySymbol} {selectedTotal}</span>
              </div>
              <button 
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 md:gap-3 bg-white/10 hover:bg-white/20 px-6 md:px-8 py-2 md:py-3 rounded-[10px] md:rounded-xl font-bold uppercase tracking-wider text-[12px] md:text-sm transition-all active:scale-95 group"
              >
                 Next <i className="fa-solid fa-arrow-right transition-transform group-hover:translate-x-1"></i>
              </button>
           </div>
        </div>
      )}

      {/* Details Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-100 flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 shadow-2xl">
              <div className="p-8 pb-4 flex items-center gap-4">
                 <button onClick={() => setShowModal(false)} className="h-10 w-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors">
                    <i className="fa-solid fa-arrow-left"></i>
                 </button>
                 <h3 className="text-xl font-bold text-[#1f1f1f]">Add Details</h3>
              </div>
              
              <div className="p-8 pt-4 space-y-8">
                 <div>
                    <label className="block text-gray-900 font-bold text-sm mb-4">Enter Your Whatsapp Mobile Number</label>
                    <p className="text-xs text-gray-400 mb-4">All your order details will be sent on WhatsApp on below number.</p>
                    <div className="relative">
                       <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-2 text-[#1f1f1f] font-bold">
                          <i className="fa-brands fa-whatsapp text-lg"></i>
                          <span>+91</span>
                       </div>
                       <input 
                         type="tel" 
                         maxLength={16}
                         value={userInfo.whatsapp}
                         onChange={(e) => {
                           let digits = e.target.value.replace(/\D/g, '');
                           if ((digits.startsWith('91') && digits.length > 10) || digits.length === 12) {
                             digits = digits.slice(2);
                           }
                           setUserInfo(prev => ({ ...prev, whatsapp: digits.slice(0, 10) }));
                         }}
                         className="w-full bg-gray-50 border-2 border-transparent focus:border-[#6869F9] outline-none rounded-2xl py-4 pl-24 pr-12 font-bold text-gray-900 transition-all"
                         placeholder="8727121883"
                       />
                       {userInfo.whatsapp && (
                         <button onClick={() => setUserInfo(p => ({...p, whatsapp: ''}))} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 hover:text-red-500">
                           <XMarkIcon className="h-5 w-5" />
                         </button>
                       )}
                    </div>
                 </div>

                 <div>
                    <label className="block text-gray-900 font-bold text-sm mb-4">Enter your complete name for the offering</label>
                    <div className="relative">
                       <input 
                         type="text" 
                         value={userInfo.name}
                         onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
                         className="w-full bg-gray-50 border-2 border-transparent focus:border-[#6869F9] outline-none rounded-2xl py-4 px-6 text-gray-900 transition-all placeholder:text-gray-300"
                         placeholder="e.g. Rahul Sharma"
                       />
                       <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-300 uppercase">{userInfo.name.length}/64</div>
                    </div>
                 </div>

                 <button 
                   onClick={() => {
                     if (userInfo.name && userInfo.whatsapp) {
                       setShowModal(false);
                       setStep(2);
                       window.scrollTo({ top: 0, behavior: 'smooth' });
                     }
                   }}
                   disabled={!userInfo.name || !userInfo.whatsapp}
                   className="w-full bg-[#6869F9] text-white py-5 rounded-2xl font-extrabold uppercase tracking-widest text-sm shadow-xl shadow-[#6869F9]/20 hover:bg-[#6869F9] transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
                 >
                    Next
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

