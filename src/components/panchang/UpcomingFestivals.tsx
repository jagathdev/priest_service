"use client";
import React from 'react';
import { useTranslation } from '@/contexts/LanguageContext';

export default function UpcomingFestivals({ festivals = [], selectedDate, loading }: { festivals?: any[], selectedDate?: string, loading?: boolean }) {
  const { t } = useTranslation();

  const title = selectedDate 
    ? `Festivals in ${new Date(selectedDate + "T12:00:00").toLocaleDateString('en-US', { month: 'long' })}`
    : (t("panchang.upcomingFestivals") || "Upcoming festivals");

  return (
    <div className="mb-6 h-full">
      <div className="flex items-center gap-2 mb-4 pl-2 border-l-2 border-[#6869F9]">
        <h2 className="text-[15px] font-bold text-[#1f1f1f] tracking-wide">{title}</h2>
      </div>
      
      <div className="bg-white rounded-[20px] shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-gray-100 h-[calc(100%-40px)] flex flex-col">
        <div className="p-1 flex-1 overflow-y-auto custom-scrollbar max-h-[800px]">
          {loading ? (
            <div className="flex items-center justify-center h-full text-sm text-gray-500 py-10">Loading festivals...</div>
          ) : (!festivals || festivals.length === 0) ? (
            <div className="flex items-center justify-center h-full text-sm text-gray-500 py-10">No festivals found for this month.</div>
          ) : (
            festivals.map((festival, index) => (
              <div key={index} className="flex items-center justify-between py-4 px-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <span className="text-[13px] font-medium text-gray-500">{festival.date}</span>
                <span className="text-[14px] font-bold text-gray-900 text-right max-w-[60%]">{festival.name}</span>
              </div>
            ))
          )}
        </div>
        <div className="h-6 w-full flex justify-between px-4 items-center text-gray-400">
           <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
           <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
        </div>
      </div>
    </div>
  );
}


