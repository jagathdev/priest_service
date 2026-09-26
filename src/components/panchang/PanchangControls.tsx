"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from '@/contexts/LanguageContext';

export default function PanchangControls() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  
  const queryDate = searchParams?.get('date');
  
  // Format current date to YYYY-MM-DD
  const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const getTomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const [selectedDate, setSelectedDate] = useState(queryDate || getTodayStr());

  useEffect(() => {
    if (queryDate && queryDate !== selectedDate) {
      setSelectedDate(queryDate);
    } else if (!queryDate && selectedDate !== getTodayStr()) {
      setSelectedDate(getTodayStr());
    }
  }, [queryDate]);

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('date', newDate);
    router.push(`?${params.toString()}`);
  };

  const isToday = selectedDate === getTodayStr();
  const isTomorrow = selectedDate === getTomorrowStr();

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    handleDateChange(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    handleDateChange(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  };

  // Basic translations for today/tomorrow if not in locales
  const todayText = t("panchang.today") === "panchang.today" ? "Today" : t("panchang.today") || "Today";
  const tomorrowText = t("panchang.tomorrow") === "panchang.tomorrow" ? "Tomorrow" : t("panchang.tomorrow") || "Tomorrow";

  return (
    <div className="flex flex-col md:flex-row items-center justify-between bg-white px-4 py-3 border-b border-gray-200 mb-6 sticky top-[68px] z-40 shadow-sm gap-4">
      <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
        <button 
          onClick={() => handleDateChange(getTodayStr())}
          className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${isToday ? 'bg-[#6869F9] text-white' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          {todayText}
        </button>
        <button 
          onClick={() => handleDateChange(getTomorrowStr())}
          className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${isTomorrow ? 'bg-[#6869F9] text-white' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          {tomorrowText}
        </button>

        <div className="flex items-center gap-1 ml-2 border border-gray-200 rounded-md p-1">
          <button onClick={handlePrevDay} className="p-1 text-gray-400 hover:text-gray-700 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          
          <div className="relative">
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="pl-8 pr-2 py-1 text-sm font-medium text-gray-700 bg-transparent border-none outline-none focus:ring-0 cursor-pointer"
            />
            <svg className="w-4 h-4 text-gray-400 absolute left-2 top-1.5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>

          <button onClick={handleNextDay} className="p-1 text-gray-400 hover:text-gray-700 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      <div className="w-full md:w-auto">
        <div className="relative">
          <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <select className="appearance-none pl-9 pr-8 py-2 border border-gray-200 rounded-md text-sm font-medium text-gray-700 bg-white w-full md:w-[250px] outline-none focus:border-violet-500 cursor-pointer">
            <option value="Varanasi">Varanasi, Uttar Pradesh, India</option>
            <option value="Delhi">New Delhi, Delhi, India</option>
            <option value="Mumbai">Mumbai, Maharashtra, India</option>
          </select>
          <svg className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}


