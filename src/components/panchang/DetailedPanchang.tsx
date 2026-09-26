"use client";
import React from 'react';
import { useTranslation } from '@/contexts/LanguageContext';

export default function DetailedPanchang({ data }: { data: any }) {
  const { t } = useTranslation();

  return (
    <div className="mb-6 h-full">
      <div className="flex items-center gap-2 mb-4 pl-2 border-l-2 border-[#6869F9] justify-between">
        <h2 className="text-[15px] font-bold text-[#1f1f1f] tracking-wide">{t("panchang.title") || "Panchang"}</h2>
        <button className="text-[#1f1f1f] hover:text-violet-600">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
      
      <div className="bg-white rounded-[20px] shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-gray-100 p-5 h-[calc(100%-40px)]">
        <div className="grid grid-cols-2 gap-x-6 gap-y-5">
          {/* Row 1 */}
          <div className="pb-4 border-b border-gray-100">
            <div className="text-xs font-medium text-gray-500 mb-1">{t("panchang.tithi")}</div>
            <div className="text-sm font-bold text-gray-900">{data.tithi?.name || '-'}</div>
            <div className="text-xs font-semibold text-gray-500 mt-0.5">{data.tithi?.endTime || '-'}</div>
          </div>
          <div className="pb-4 border-b border-gray-100">
            <div className="text-xs font-medium text-gray-500 mb-1">{t("panchang.nakshatra")}</div>
            <div className="text-sm font-bold text-gray-900">{data.nakshatra?.name || '-'}</div>
            <div className="text-xs font-semibold text-gray-500 mt-0.5">{data.nakshatra?.endTime || '-'}</div>
          </div>

          {/* Row 2 */}
          <div className="pb-4 border-b border-gray-100">
            <div className="text-xs font-medium text-gray-500 mb-1">{t("panchang.yog")}</div>
            <div className="text-sm font-bold text-gray-900">{data.yoga?.name || '-'}</div>
            <div className="text-xs font-semibold text-gray-500 mt-0.5">{data.yoga?.endTime || '-'}</div>
          </div>
          <div className="pb-4 border-b border-gray-100">
            <div className="text-xs font-medium text-gray-500 mb-1">{t("panchang.karan")}</div>
            <div className="text-sm font-bold text-gray-900">{data.karana?.name || '-'}</div>
            <div className="text-xs font-semibold text-gray-500 mt-0.5">{data.karana?.endTime || '-'}</div>
          </div>

          {/* Row 3 */}
          <div className="pb-4 border-b border-gray-100">
            <div className="text-xs font-medium text-gray-500 mb-1">{t("panchang.hinduMonth")} {t("panchang.amanta")}</div>
            <div className="text-sm font-bold text-gray-900">{data.month?.amanta || '-'}</div>
          </div>
          <div className="pb-4 border-b border-gray-100">
            <div className="text-xs font-medium text-gray-500 mb-1">{t("panchang.hinduMonth")} {t("panchang.purnimanta")}</div>
            <div className="text-sm font-bold text-gray-900">{data.month?.purnimanta || '-'}</div>
          </div>

          {/* Row 4 */}
          <div className="pb-4 border-b border-gray-100">
            <div className="text-xs font-medium text-gray-500 mb-1">{t("panchang.vikramSamvat")}</div>
            <div className="text-sm font-bold text-gray-900">{data.samvat?.vikram || '-'}</div>
          </div>
          <div className="pb-4 border-b border-gray-100">
            <div className="text-xs font-medium text-gray-500 mb-1">{t("panchang.shakaSamvat")}</div>
            <div className="text-sm font-bold text-gray-900">{data.samvat?.shaka || '-'}</div>
          </div>

          {/* Row 5 */}
          <div className="pb-4 border-b border-gray-100">
            <div className="text-xs font-medium text-gray-500 mb-1">{t("panchang.sunSign")}</div>
            <div className="text-sm font-bold text-gray-900">{data.sun?.sign || '-'}</div>
          </div>
          <div className="pb-4 border-b border-gray-100">
            <div className="text-xs font-medium text-gray-500 mb-1">{t("panchang.moonSign")}</div>
            <div className="text-sm font-bold text-gray-900">{data.moon?.sign || '-'}</div>
          </div>

          {/* Row 6 */}
          <div className="pb-4 border-b border-gray-100 md:border-b-0">
            <div className="text-xs font-medium text-gray-500 mb-1">{t("panchang.dishaShool")}</div>
            <div className="text-sm font-bold text-gray-900">{data.dishashool || '-'}</div>
          </div>
          <div className="pb-4 border-b border-gray-100 md:border-b-0">
            <div className="text-xs font-medium text-gray-500 mb-1">Moon placement</div>
            <div className="text-sm font-bold text-gray-900">{data.moon?.placement || '-'}</div>
          </div>

          {/* Row 7 */}
          <div className="">
            <div className="text-xs font-medium text-gray-500 mb-1">{t("panchang.ritu")}</div>
            <div className="text-sm font-bold text-gray-900">{data.season || '-'}</div>
          </div>
          <div className="">
            <div className="text-xs font-medium text-gray-500 mb-1">{t("panchang.ayana")}</div>
            <div className="text-sm font-bold text-gray-900">{data.ayana || '-'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}


