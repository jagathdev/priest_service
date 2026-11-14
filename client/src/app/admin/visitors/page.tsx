"use client";

import { useEffect, useState, useCallback } from "react";
import {
  GlobeAltIcon,
  SparklesIcon,
  CalendarDaysIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  CalendarIcon,
  XMarkIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";

interface VisitorSource {
  source: string;
  count: number;
}

interface VisitorCampaign {
  source: string;
  campaign: string;
  count: number;
}

interface DailyTrendItem {
  date: string;
  count: number;
}

interface VisitorStats {
  totalVisitors: number;
  todayVisitors: number;
  filteredVisitors?: number;
  dailyTrend?: DailyTrendItem[];
  sourceBreakdown: VisitorSource[];
  campaignBreakdown: VisitorCampaign[];
}

export default function VisitorAnalyticsPage() {
  const [stats, setStats] = useState<VisitorStats>({
    totalVisitors: 0,
    todayVisitors: 0,
    dailyTrend: [],
    sourceBreakdown: [],
    campaignBreakdown: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState("");
  const [selectedSource, setSelectedSource] = useState<string>("all");

  // Date Filter States
  const [dateRangePreset, setDateRangePreset] = useState<"all" | "today" | "7days" | "30days" | "custom">("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handlePresetChange = (preset: "all" | "today" | "7days" | "30days" | "custom") => {
    setDateRangePreset(preset);
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);

    if (preset === "all") {
      setStartDate("");
      setEndDate("");
    } else if (preset === "today") {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === "7days") {
      const past7 = new Date();
      past7.setDate(today.getDate() - 6);
      setStartDate(past7.toISOString().slice(0, 10));
      setEndDate(todayStr);
    } else if (preset === "30days") {
      const past30 = new Date();
      past30.setDate(today.getDate() - 29);
      setStartDate(past30.toISOString().slice(0, 10));
      setEndDate(todayStr);
    }
  };

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.set("startDate", startDate);
      if (endDate) queryParams.set("endDate", endDate);

      const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : "";
      const res = await fetch(`${baseUrl}/api/analytics/visitor-stats${queryStr}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data && data.success && data.data) {
        setStats(data.data);
      } else {
        throw new Error(data.message || "Unable to fetch visitor statistics");
      }
    } catch (err: any) {
      console.error("Error loading analytics:", err);
      setError(err.message || "Failed to load visitor analytics");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const topSource = stats.sourceBreakdown[0]?.source || "Direct";
  const topSourceCount = stats.sourceBreakdown[0]?.count || 0;
  const currentTotal = stats.filteredVisitors ?? stats.totalVisitors;

  // Filtered campaigns by selected source and search string
  const filteredCampaigns = stats.campaignBreakdown.filter((item) => {
    const matchesSource = selectedSource === "all" || item.source.toLowerCase() === selectedSource.toLowerCase();
    const matchesSearch =
      !searchFilter ||
      item.campaign.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.source.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesSource && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* ── Modern Dashboard Header (Matching Orders Page) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">Website Visitor Analytics</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Tracking
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Track user traffic, UTM campaign attribution, and visitor sessions across your website.
          </p>
        </div>

        <button
          onClick={fetchStats}
          disabled={loading}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 flex items-center gap-2 shadow-2xs transition cursor-pointer disabled:opacity-50"
        >
          <ArrowPathIcon className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-600" : "text-gray-500"}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-xs flex items-center justify-between shadow-2xs">
          <span>{error}</span>
          <button onClick={fetchStats} className="underline font-bold ml-2">Try Again</button>
        </div>
      )}

      {/* ── KPI Overview Metrics Cards (Matching Orders Page Style) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total / Filtered Visitors */}
        <div className="p-3.5 rounded-2xl border text-left flex flex-col justify-between bg-white border-gray-200 shadow-2xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-gray-500 mb-1 w-full">
            <span className="text-[11px] font-bold text-gray-700">
              {startDate || endDate ? "Filtered Visitors" : "Total Visitors"}
            </span>
            <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <GlobeAltIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl sm:text-2xl font-black text-gray-900">{currentTotal}</span>
            <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">
              {startDate || endDate ? "Filtered" : "All Time"}
            </span>
          </div>
          <p className="text-[10px] text-gray-400 font-medium mt-1">Unique visitor sessions</p>
        </div>

        {/* Visitors Today */}
        <div className="p-3.5 rounded-2xl border text-left flex flex-col justify-between bg-white border-gray-200 shadow-2xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between text-gray-500 mb-1 w-full">
            <span className="text-[11px] font-bold text-gray-700">Visitors Today</span>
            <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <ChartBarIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl sm:text-2xl font-black text-blue-700">{stats.todayVisitors}</span>
            <span className="text-[9px] font-extrabold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md">Today</span>
          </div>
          <p className="text-[10px] text-gray-400 font-medium mt-1">Logged since 12:00 AM</p>
        </div>

        {/* Top UTM Source */}
        <div className="p-3.5 rounded-2xl border text-left flex flex-col justify-between bg-white border-gray-200 shadow-2xs hover:border-purple-300 transition-all">
          <div className="flex items-center justify-between text-gray-500 mb-1 w-full">
            <span className="text-[11px] font-bold text-gray-700">Top UTM Source</span>
            <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <SparklesIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-lg sm:text-xl font-black text-purple-700 capitalize truncate max-w-[120px]">
              {topSource}
            </span>
            <span className="text-[9px] font-extrabold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-md">
              {topSourceCount} hits
            </span>
          </div>
          <p className="text-[10px] text-gray-400 font-medium mt-1">Leading traffic origin</p>
        </div>

        {/* Active Campaigns */}
        <div className="p-3.5 rounded-2xl border text-left flex flex-col justify-between bg-white border-gray-200 shadow-2xs hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between text-gray-500 mb-1 w-full">
            <span className="text-[11px] font-bold text-gray-700">Campaigns</span>
            <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <CalendarDaysIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl sm:text-2xl font-black text-amber-700">{stats.campaignBreakdown.length}</span>
            <span className="text-[9px] font-extrabold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md">Campaigns</span>
          </div>
          <p className="text-[10px] text-gray-400 font-medium mt-1">In selected timeframe</p>
        </div>
      </div>

      {/* ── Unified Filter & Date Range Toolbar (Matching Orders Page Style) ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-3 shadow-2xs flex flex-col gap-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5 bg-gray-100/80 p-1 rounded-xl shrink-0 overflow-x-auto">
            <button
              type="button"
              onClick={() => handlePresetChange("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${dateRangePreset === "all" ? "bg-white text-gray-900 shadow-xs" : "text-gray-600 hover:text-gray-900"
                }`}
            >
              All Time
            </button>
            <button
              type="button"
              onClick={() => handlePresetChange("today")}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${dateRangePreset === "today" ? "bg-white text-gray-900 shadow-xs" : "text-gray-600 hover:text-gray-900"
                }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => handlePresetChange("7days")}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${dateRangePreset === "7days" ? "bg-white text-gray-900 shadow-xs" : "text-gray-600 hover:text-gray-900"
                }`}
            >
              Last 7 Days
            </button>
            <button
              type="button"
              onClick={() => handlePresetChange("30days")}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${dateRangePreset === "30days" ? "bg-white text-gray-900 shadow-xs" : "text-gray-600 hover:text-gray-900"
                }`}
            >
              Last 30 Days
            </button>
          </div>

          {/* Right Controls: Custom Date Pickers & Search */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Custom Date Pickers */}
            <div className="flex items-center gap-1.5 bg-gray-50/80 border border-gray-200 rounded-xl px-2.5 py-1 text-xs">
              <CalendarIcon className="w-3.5 h-3.5 text-gray-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setDateRangePreset("custom");
                }}
                className="bg-transparent outline-none text-xs font-semibold text-gray-800"
              />
              <span className="text-gray-400 font-bold">–</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setDateRangePreset("custom");
                }}
                className="bg-transparent outline-none text-xs font-semibold text-gray-800"
              />
              {(startDate || endDate) && (
                <button
                  type="button"
                  onClick={() => handlePresetChange("all")}
                  title="Clear dates"
                  className="text-gray-400 hover:text-rose-600 transition ml-1"
                >
                  <XMarkIcon className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Campaign Search Input */}
            <div className="relative flex-1 sm:flex-initial">
              <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search campaign..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full sm:w-52 pl-9 pr-3 py-1.5 bg-gray-50/70 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 placeholder-gray-400 outline-none hover:border-gray-300 focus:border-emerald-600 focus:bg-white transition-all shadow-2xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Daily Trend Flow (Modern Slim Bar Chart with Badges) ── */}
      {Array.isArray(stats.dailyTrend) && stats.dailyTrend.length > 1 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ArrowTrendingUpIcon className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-black text-gray-900 uppercase tracking-wider">Daily Visitor Flow</h2>
                <p className="text-[10px] text-gray-400 font-medium">Unique visitors per day</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              {stats.dailyTrend.length} Days Tracked
            </span>
          </div>

          {/* Chart Area with subtle grid lines */}
          <div className="relative pt-8 pb-3 px-3 h-52 flex flex-col justify-end">
            {/* Subtle background horizontal reference lines */}
            <div className="absolute inset-x-3 top-10 bottom-10 flex flex-col justify-between pointer-events-none opacity-30">
              <div className="border-b border-dashed border-gray-200 w-full" />
              <div className="border-b border-dashed border-gray-200 w-full" />
              <div className="border-b border-gray-200 w-full" />
            </div>

            {/* Bars container */}
            <div className="flex items-end justify-start sm:justify-center gap-8 sm:gap-14 overflow-x-auto relative z-10 w-full pt-4">
              {(() => {
                const maxCount = Math.max(...stats.dailyTrend.map((d) => d.count), 1);
                return stats.dailyTrend.map((d, idx) => {
                  const heightPct = Math.round((d.count / maxCount) * 100);
                  const dateObj = new Date(d.date);
                  const formattedDateLabel = !isNaN(dateObj.getTime())
                    ? dateObj.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
                    : d.date.slice(5);

                  return (
                    <div key={idx} className="w-16 shrink-0 flex flex-col items-center gap-2.5 group cursor-pointer">
                      {/* Visitor Count Pill Badge - Fully visible and never clipped */}
                      <span className="text-xs font-black text-gray-800 bg-white border border-gray-200 group-hover:border-emerald-500 group-hover:bg-emerald-50 group-hover:text-emerald-700 px-2.5 py-0.5 rounded-full shadow-xs transition-all">
                        {d.count}
                      </span>

                      {/* Slim Pill Bar Track */}
                      <div className="w-full flex justify-center items-end h-24">
                        <div className="w-4 bg-gray-100/90 rounded-full h-full flex items-end p-0.5 overflow-hidden border border-gray-200/60 group-hover:border-emerald-200 transition-colors">
                          <div
                            className="w-full bg-gradient-to-t from-emerald-600 via-emerald-500 to-teal-400 group-hover:from-emerald-500 group-hover:to-teal-300 rounded-full transition-all duration-300 shadow-xs"
                            style={{ height: `${Math.max(heightPct, 15)}%` }}
                          />
                        </div>
                      </div>

                      {/* Clean Date Label */}
                      <span className="text-[11px] font-bold text-gray-600 group-hover:text-emerald-700 transition-colors whitespace-nowrap">
                        {formattedDateLabel}
                      </span>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ── Two-Column Main Analytics Grid (UTM Sources + Campaigns Table) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: UTM Source Cards (1 Col) */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-sm font-black text-gray-900">Traffic by UTM Source</h2>
              <p className="text-[10px] text-gray-400 font-medium">Click a source to filter campaigns</p>
            </div>
            <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">Share</span>
          </div>

          <div className="space-y-2.5">
            {stats.sourceBreakdown.length === 0 ? (
              <p className="py-8 text-center text-xs text-gray-400">No visitors logged in this date range.</p>
            ) : (
              stats.sourceBreakdown.map((item, idx) => {
                const pct = currentTotal > 0 ? Math.round((item.count / currentTotal) * 100) : 0;
                const isSelected = selectedSource.toLowerCase() === item.source.toLowerCase();

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedSource(isSelected ? "all" : item.source)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${isSelected
                      ? "bg-emerald-50/60 border-emerald-500 shadow-2xs ring-1 ring-emerald-500"
                      : "bg-gray-50/60 border-gray-200 hover:bg-white hover:border-gray-300 hover:shadow-2xs"
                      }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-extrabold text-gray-800 capitalize flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${isSelected ? "bg-emerald-600" : "bg-gray-400"}`} />
                        {item.source}
                      </span>
                      <span className="font-black text-gray-900">
                        {item.count}{" "}
                        <span className="text-[10px] text-gray-400 font-medium">({pct}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200/60 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detailed Campaigns Table (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-sm font-black text-gray-900">Marketing Campaign Breakdown</h2>
              <p className="text-[10px] text-gray-400 font-medium">
                Showing visits tracked by specific campaign tags (?utm_campaign=...)
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <button
                type="button"
                onClick={() => setSelectedSource("all")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition cursor-pointer ${selectedSource === "all" ? "bg-emerald-600 text-white shadow-2xs" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
              >
                All
              </button>
              {stats.sourceBreakdown.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedSource(s.source)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold capitalize transition cursor-pointer ${selectedSource.toLowerCase() === s.source.toLowerCase()
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                  {s.source}
                </button>
              ))}
            </div>
          </div>

          {/* Table (Styling Matched to Admin Orders Table) */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50 text-gray-400 uppercase text-[10px] font-black tracking-wider">
                <tr>
                  <th className="px-4 py-3 rounded-l-xl">Campaign Name</th>
                  <th className="px-4 py-3">UTM Source</th>
                  <th className="px-4 py-3 text-right rounded-r-xl">Visitors Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredCampaigns.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-xs text-gray-400 font-medium">
                      No matching campaigns found in this period.
                    </td>
                  </tr>
                ) : (
                  filteredCampaigns.map((c, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/70 transition">
                      <td className="px-4 py-3.5 font-bold text-gray-900 truncate max-w-xs">{c.campaign}</td>
                      <td className="px-4 py-3.5 capitalize">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-extrabold text-[11px] border border-slate-200">
                          {c.source}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {c.count} visitors
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
