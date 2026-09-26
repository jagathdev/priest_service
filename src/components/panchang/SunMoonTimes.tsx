"use client";
import React from 'react';
import { useTranslation } from '@/contexts/LanguageContext';
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';

export default function SunMoonTimes({ data }: { data: any }) {
  const { t } = useTranslation();
  const sun = data.sun || {};
  const moon = data.moon || {};

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4 pl-2 border-l-2 border-[#6869F9]">
        <h2 className="text-[15px] font-bold text-[#1f1f1f] tracking-wide">{t("panchang.sunAndMoon") || "Sunset-Sunrise"}</h2>
      </div>
      
      <div className="bg-white rounded-[20px] shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-gray-100 p-5">
        <div className="divide-y divide-gray-100">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center gap-3 text-gray-600">
              <SunIcon className="h-5 w-5 text-[#1f1f1f]" />
              <span className="text-sm font-semibold">{t("panchang.sunrise")}</span>
            </div>
            <span className="text-sm font-bold text-gray-900">{sun.rise || '-'}</span>
          </div>

          <div className="flex justify-between items-center py-3">
            <div className="flex items-center gap-3 text-gray-600">
              <SunIcon className="h-5 w-5 text-[#1f1f1f] opacity-80" />
              <span className="text-sm font-semibold">{t("panchang.sunset")}</span>
            </div>
            <span className="text-sm font-bold text-gray-900">{sun.set || '-'}</span>
          </div>

          <div className="flex justify-between items-center py-3">
            <div className="flex items-center gap-3 text-gray-600">
              <MoonIcon className="h-5 w-5 text-[#f4b400]" />
              <span className="text-sm font-semibold">{t("panchang.moonrise")}</span>
            </div>
            <span className="text-sm font-bold text-gray-900">{moon.rise || '-'}</span>
          </div>

          <div className="flex justify-between items-center py-3">
            <div className="flex items-center gap-3 text-gray-600">
              <MoonIcon className="h-5 w-5 text-[#f4b400] opacity-80" />
              <span className="text-sm font-semibold">{t("panchang.moonset")}</span>
            </div>
            <span className="text-sm font-bold text-gray-900">{moon.set || '-'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}


