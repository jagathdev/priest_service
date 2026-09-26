"use client";
import React from 'react';
import Image from 'next/image';
import { useTranslation } from '@/contexts/LanguageContext';
import { getMoonPhaseFromTithi } from '@/utils/moonPhase';

export default function MainDateCard({ data }: { data: any }) {
  const { t, language } = useTranslation();
  
  const localeMap: Record<string, string> = {
    en: 'en-IN', hi: 'hi-IN', ta: 'ta-IN', te: 'te-IN', kn: 'kn-IN'
  };
  const activeLocale = localeMap[language] || 'en-IN';

  const dateObj = new Date(data.queryDate || data.date);
  const formattedDate = dateObj.toLocaleDateString(activeLocale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const weekday = dateObj.toLocaleDateString(activeLocale, { weekday: 'long' });
  const moonInfo = getMoonPhaseFromTithi(data?.tithi?.name);

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4 pl-2 border-l-2 border-[#6869F9]">
        <h2 className="text-[15px] font-bold text-[#1f1f1f] tracking-wide">{formattedDate}</h2>
      </div>
      
      <div className="bg-white rounded-[20px] shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-gray-100 p-5">
        <div className="flex gap-4 items-start pb-5 border-b border-gray-100">
          <div className="w-[88px] h-[88px] rounded-full overflow-hidden flex-shrink-0 relative">
             <Image 
               src={moonInfo.imagePath} 
               alt={moonInfo.phaseLabel} 
               fill
               className="object-cover scale-[1.4]" 
             />
          </div>
          <div className="flex-1 py-1">
            <h3 className="text-[19px] font-bold text-[#1f1f1f] leading-snug">
              {data.tithi?.name || 'Tritiyaa Krishna-Paksha'},<br/>{weekday}
            </h3>
            <p className="text-sm text-gray-500 mt-1">{data.month?.purnimanta} {t("panchang.hinduMonth")}</p>
            <p className="text-sm text-gray-500">{data.season}, {data.samvat?.vikram}</p>
          </div>
        </div>
        
        {data.festival && (
          <div className="pt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">{t("panchang.festival") || "Festival"}</p>
            <p className="text-[#6869F9] font-bold text-sm">{data.festival}</p>
          </div>
        )}
      </div>
    </div>
  );
}


