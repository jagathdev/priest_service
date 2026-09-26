"use client";
import React from 'react';
import { useTranslation } from '@/contexts/LanguageContext';

export default function AuspiciousTimings({ data }: { data: any }) {
  const { t } = useTranslation();
  const auspicious = data.auspiciousTimings || {};
  const inauspicious = data.inauspiciousTimings || {};

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4 pl-2 border-l-2 border-[#6869F9] justify-between">
        <h2 className="text-[15px] font-bold text-[#1f1f1f] tracking-wide">{t("panchang.auspiciousTimings")} & {t("panchang.inauspiciousTimings")}</h2>
        <button className="text-gray-400 hover:text-gray-600">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {/* Auspicious */}
        <div className="bg-[#e8f5e9] rounded-xl p-4 min-h-[90px] flex flex-col justify-center">
          <div className="text-[13px] font-bold text-[#2e7d32] mb-1">{t("panchang.auspiciousTimings")}</div>
          <div className="text-[13px] text-gray-700 font-medium">
            {auspicious.abhijit?.start} - {auspicious.abhijit?.end}
          </div>
        </div>

        {/* Gulik Kaal */}
        <div className="bg-[#f9fbe7] rounded-xl p-4 min-h-[90px] flex flex-col justify-center">
          <div className="text-[13px] font-bold text-[#827717] mb-1">{t("panchang.gulikaKaal")}</div>
          <div className="text-[13px] text-gray-700 font-medium">
            {inauspicious.gulik?.start} - {inauspicious.gulik?.end}
          </div>
        </div>

        {/* Rahu Kaal */}
        <div className="bg-[#fce4ec] rounded-xl p-4 min-h-[90px] flex flex-col justify-center">
          <div className="text-[13px] font-bold text-[#c2185b] mb-1">{t("panchang.rahuKaal")}</div>
          <div className="text-[13px] text-gray-700 font-medium">
            {inauspicious.rahu?.start} - {inauspicious.rahu?.end}
          </div>
        </div>

        {/* Yamghant Kaal */}
        <div className="bg-[#ffebee] rounded-xl p-4 min-h-[90px] flex flex-col justify-center">
          <div className="text-[13px] font-bold text-[#c62828] mb-1">{t("panchang.yamaganda")}</div>
          <div className="text-[13px] text-gray-700 font-medium">
            {inauspicious.yamghant?.start} - {inauspicious.yamghant?.end}
          </div>
        </div>
      </div>
    </div>
  );
}


