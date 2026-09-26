"use client";

import React from "react";
import { useTranslation } from "@/contexts/LanguageContext";
import MainDateCard from "./MainDateCard";
import AuspiciousTimings from "./AuspiciousTimings";
import SunMoonTimes from "./SunMoonTimes";
import DetailedPanchang from "./DetailedPanchang";
import UpcomingFestivals from "./UpcomingFestivals";
import PanchangPromotions from "./PanchangPromotions";

export default function PanchangClientSection({ data, monthlyFestivals, selectedDate, festivalsLoading }: { data: any, monthlyFestivals?: any[], selectedDate?: string, festivalsLoading?: boolean }) {
  const { t } = useTranslation();

  if (!data) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-semibold text-gray-700">
          {t("panchang.noData") || "Unable to load Panchang data"}
        </h2>
        <p className="text-gray-500 mt-2">
          {t("panchang.tryLater") || "Please try again later."}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-[30%_40%_30%] xl:grid-cols-[1.5fr_2fr_1.5fr] gap-6 xl:gap-8 items-start">
        {/* Column 1 */}
        <div className="flex flex-col">
          <MainDateCard data={data} />
          <AuspiciousTimings data={data} />
          <SunMoonTimes data={data} />
        </div>

        {/* Column 2 */}
        <div className="flex flex-col h-full">
          <DetailedPanchang data={data} />
        </div>

        {/* Column 3 */}
        <div className="flex flex-col h-[700px]">
          <UpcomingFestivals festivals={monthlyFestivals} selectedDate={selectedDate} loading={festivalsLoading} />
        </div>
      </div>

      <div className="mt-16">
        <PanchangPromotions />
      </div>
    </>
  );
}
