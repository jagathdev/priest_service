"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  GlobeAltIcon,
  SparklesIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ShareIcon,
  TagIcon,
  ArrowUpRightIcon,
  CheckCircleIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import CustomDateRangePicker from "@/components/admin/CustomDateRangePicker";
import MetricGraphCard from "@/features/dashboard/MetricGraphCard";
import { fetchDashboardMetrics } from "@/features/dashboard/dashboardApi";
import { DashboardStatsResponse } from "@/features/dashboard/types";

// Helper for authentic brand styling & icons for traffic channels
const getChannelMeta = (sourceName: string) => {
  const norm = sourceName.toLowerCase().trim();
  if (norm.includes("direct")) {
    return {
      label: "Direct Traffic",
      tag: "Direct",
      bgClass: "bg-emerald-50 hover:bg-emerald-100/60",
      borderClass: "border-emerald-200/80",
      accentBg: "bg-emerald-600",
      badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
      barColor: "bg-emerald-500",
      hexColor: "#10b981",
      iconSvg: (
        <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
    };
  }
  if (norm.includes("instagram")) {
    return {
      label: "Instagram",
      tag: "Social",
      bgClass: "bg-pink-50/60 hover:bg-pink-100/60",
      borderClass: "border-pink-200/80",
      accentBg: "bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600",
      badgeClass: "bg-pink-100 text-pink-800 border-pink-200",
      barColor: "bg-pink-500",
      hexColor: "#e1306c",
      iconSvg: (
        <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
    };
  }
  if (norm.includes("facebook")) {
    return {
      label: "Facebook / Meta",
      tag: "Social",
      bgClass: "bg-blue-50/60 hover:bg-blue-100/60",
      borderClass: "border-blue-200/80",
      accentBg: "bg-[#1877f2]",
      badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
      barColor: "bg-blue-600",
      hexColor: "#1877f2",
      iconSvg: (
        <svg className="w-5 h-5 text-[#1877f2]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
    };
  }
  if (norm.includes("google")) {
    return {
      label: "Google Search / Ads",
      tag: "Search",
      bgClass: "bg-amber-50/60 hover:bg-amber-100/60",
      borderClass: "border-amber-200/80",
      accentBg: "bg-amber-500",
      badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
      barColor: "bg-amber-500",
      hexColor: "#ea4335",
      iconSvg: (
        <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
        </svg>
      ),
    };
  }
  if (norm.includes("whatsapp")) {
    return {
      label: "WhatsApp Share",
      tag: "Messenger",
      bgClass: "bg-emerald-50/60 hover:bg-emerald-100/60",
      borderClass: "border-emerald-200/80",
      accentBg: "bg-[#25d366]",
      badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
      barColor: "bg-emerald-500",
      hexColor: "#25d366",
      iconSvg: (
        <svg className="w-5 h-5 text-[#25d366]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.031 0C5.396 0 .029 5.367.029 11.987c0 2.079.529 4.117 1.544 5.934L0 24l6.235-1.574c1.77 1.011 3.779 1.544 5.796 1.544 6.635 0 12.002-5.367 12.002-11.987C24.033 5.367 18.666 0 12.031 0zm0 21.944c-1.815 0-3.58-.485-5.115-1.401l-.367-.218-3.799.96 1.01-3.693-.238-.38a9.88 9.88 0 01-1.517-5.225c0-5.467 4.453-9.92 9.926-9.92 2.651 0 5.143 1.033 7.016 2.907a9.873 9.873 0 012.91 7.013c0 5.467-4.453 9.92-9.926 9.92z"/>
        </svg>
      ),
    };
  }
  return {
    label: sourceName,
    tag: "Referral",
    bgClass: "bg-gray-50/70 hover:bg-gray-100/60",
    borderClass: "border-gray-200",
    accentBg: "bg-gray-700",
    badgeClass: "bg-gray-100 text-gray-700 border-gray-200",
    barColor: "bg-indigo-500",
    hexColor: "#6366f1",
    iconSvg: <GlobeAltIcon className="w-5 h-5 text-gray-500" />,
  };
};

export default function VisitorAnalyticsPage() {
  const [data, setData] = useState<DashboardStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Date Filter States
  const [dateRangePreset, setDateRangePreset] = useState<"today" | "7days" | "30days" | "custom" | "all">("7days");
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10));

  // Attribution table search/filter states
  const [searchFilter, setSearchFilter] = useState("");
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [copiedCampaign, setCopiedCampaign] = useState<string | null>(null);

  const handlePresetChange = (preset: "today" | "7days" | "30days" | "custom" | "all") => {
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

  const handleCustomDateChange = (start: string, end: string) => {
    setDateRangePreset("custom");
    setStartDate(start);
    setEndDate(end);
  };

  const loadMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchDashboardMetrics({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setData(res);
    } catch (err: any) {
      console.error("[VisitorAnalyticsPage] Error loading dashboard metrics:", err);
      setError(err.message || "Failed to load dashboard metrics");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  // Fallback default graphs if data is loading or empty
  const defaultGraphs = {
    websiteViews: {
      title: "Website Views",
      prefix: "01",
      count: data?.totalVisitors || 0,
      todayCount: data?.todayVisitors || 0,
      subtitle: "Total visitors",
      trend: [],
      color: "blue" as const,
    },
    otpGenerated: {
      title: "OTP Generated",
      prefix: "02",
      count: 0,
      todayCount: 0,
      subtitle: "OTP generation events",
      trend: [],
      color: "purple" as const,
    },
    purchaseInterest: {
      title: "Purchase Interest",
      prefix: "03",
      count: 0,
      todayCount: 0,
      subtitle: "Preorder requests",
      trend: [],
      color: "orange" as const,
    },
    completedOrders: {
      title: "Completed Orders",
      prefix: "04",
      count: 0,
      todayCount: 0,
      subtitle: "Successfully completed",
      trend: [],
      color: "green" as const,
    },
  };

  const graphs = data?.graphs || defaultGraphs;

  // Normalization for traffic sources to prevent duplicates (e.g. facebook & Facebook)
  const normalizedSources = useMemo(() => {
    if (!data?.sourceBreakdown) return [];
    const map = new Map<string, number>();
    for (const item of data.sourceBreakdown) {
      const raw = item.source || "Direct";
      // Capitalize first letter or title-case
      const formatted = raw.toLowerCase() === "direct"
        ? "Direct"
        : raw.charAt(0).toUpperCase() + raw.slice(1);
      map.set(formatted, (map.get(formatted) || 0) + item.count);
    }
    return Array.from(map.entries())
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count);
  }, [data?.sourceBreakdown]);

  // Filtered campaigns for attribution table
  const filteredCampaigns = useMemo(() => {
    return (data?.campaignBreakdown || []).filter((item) => {
      const matchesSource =
        selectedSource === "all" ||
        item.source.toLowerCase() === selectedSource.toLowerCase();
      const matchesSearch =
        !searchFilter ||
        item.campaign.toLowerCase().includes(searchFilter.toLowerCase()) ||
        item.source.toLowerCase().includes(searchFilter.toLowerCase());
      return matchesSource && matchesSearch;
    });
  }, [data?.campaignBreakdown, selectedSource, searchFilter]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedCampaign(text);
    setTimeout(() => setCopiedCampaign(null), 2000);
  };

  return (
    <div className="space-y-7 max-w-[1550px] mx-auto min-h-screen pb-16">
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Visitor Analytics &amp; Conversion Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Real-Time
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Real-time performance across website visits, OTP generation, devotee purchase interest, and completed orders.
          </p>
        </div>

        {/* Global Refresh Button */}
        <button
          onClick={loadMetrics}
          disabled={loading}
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 flex items-center gap-2 shadow-2xs transition cursor-pointer disabled:opacity-50"
          title="Refresh dashboard data"
        >
          <ArrowPathIcon className={`w-4 h-4 ${loading ? "animate-spin text-emerald-600" : "text-gray-500"}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* ── Global Date Filter Toolbar ── */}
      <div className="bg-white rounded-2xl border border-gray-150 p-3 sm:p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2 flex items-center gap-1">
            <FunnelIcon className="w-3.5 h-3.5" />
            Date Range:
          </span>

          <button
            type="button"
            onClick={() => handlePresetChange("today")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              dateRangePreset === "today"
                ? "bg-gray-900 text-white shadow-2xs"
                : "bg-gray-100/80 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Today
          </button>

          <button
            type="button"
            onClick={() => handlePresetChange("7days")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              dateRangePreset === "7days"
                ? "bg-gray-900 text-white shadow-2xs"
                : "bg-gray-100/80 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Last 7 Days
          </button>

          <button
            type="button"
            onClick={() => handlePresetChange("30days")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              dateRangePreset === "30days"
                ? "bg-gray-900 text-white shadow-2xs"
                : "bg-gray-100/80 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Last 30 Days
          </button>

          <button
            type="button"
            onClick={() => handlePresetChange("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              dateRangePreset === "all"
                ? "bg-gray-900 text-white shadow-2xs"
                : "bg-gray-100/80 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All Time
          </button>
        </div>

        {/* Custom Date Range Picker */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <CustomDateRangePicker
            startDate={startDate}
            endDate={endDate}
            onChange={handleCustomDateChange}
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-xs flex items-center justify-between shadow-2xs">
          <span>{error}</span>
          <button onClick={loadMetrics} className="underline font-bold ml-2 cursor-pointer">
            Try Again
          </button>
        </div>
      )}

      {/* ── 4-Card 2x2 Grid Dashboard (Big & Spacious) ── */}
      {/* 2 by 2 rows on desktop & tablet (lg:grid-cols-2), 1 column on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Graph 1: Website Views (Blue) */}
        <MetricGraphCard data={graphs.websiteViews} loading={loading} />

        {/* Graph 2: OTP Generated (Purple) */}
        <MetricGraphCard data={graphs.otpGenerated} loading={loading} />

        {/* Graph 3: Purchase Interest (Orange) */}
        <MetricGraphCard data={graphs.purchaseInterest} loading={loading} />

        {/* Graph 4: Completed Orders (Green) */}
        <MetricGraphCard data={graphs.completedOrders} loading={loading} />
      </div>

      {/* ── High-Design Traffic Channel & Campaign Attribution Section ── */}
      {data && (
        <div className="space-y-6 pt-2">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200/80 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-2xs">
                  <GlobeAltIcon className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-black text-gray-900 tracking-tight">
                  Traffic Sources &amp; Campaign Attribution
                </h2>
              </div>
              <p className="text-xs text-gray-500 mt-1 pl-10">
                Granular breakdown of visitor entry channels, direct vs campaign referrals, and UTM conversion sources.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 pl-10 sm:pl-0">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Total Tracked Visitors: </span>
              <span className="font-extrabold text-gray-900">
                {(data.filteredVisitors || data.totalVisitors || 0).toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* 1. Visual Segmented Distribution Strip */}
          {normalizedSources.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-150 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-700 uppercase tracking-wider text-[11px]">
                  Channel Share Distribution
                </span>
                <span className="text-[11px] text-gray-400 font-medium">
                  {normalizedSources.length} Active Channels
                </span>
              </div>

              {/* Multi-segment progress bar */}
              <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden flex shadow-inner">
                {normalizedSources.map((s) => {
                  const total = data.filteredVisitors || 1;
                  const pct = Math.max(1, Math.round((s.count / total) * 100));
                  const meta = getChannelMeta(s.source);
                  return (
                    <div
                      key={`strip-${s.source}`}
                      className={`${meta.barColor} transition-all duration-500 relative group`}
                      style={{ width: `${pct}%` }}
                      title={`${meta.label}: ${s.count} (${pct}%)`}
                    />
                  );
                })}
              </div>

              {/* Legend row */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 pt-1 text-xs">
                {normalizedSources.map((s) => {
                  const total = data.filteredVisitors || 1;
                  const pct = Math.round((s.count / total) * 100);
                  const meta = getChannelMeta(s.source);
                  return (
                    <div key={`legend-${s.source}`} className="flex items-center gap-1.5 text-xs text-gray-600">
                      <span className={`w-2.5 h-2.5 rounded-full ${meta.barColor}`} />
                      <span className="font-bold text-gray-800">{meta.label}</span>
                      <span className="text-gray-400 font-medium">({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. Interactive Channels Grid & Campaign Attribution Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Premium Channel Cards (5 Columns) */}
            <div className="lg:col-span-5 space-y-3.5">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ShareIcon className="w-4 h-4 text-emerald-600" />
                  Traffic Channels
                </h3>
                <span className="text-[11px] font-bold text-gray-400">
                  {normalizedSources.length} Channels
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {normalizedSources.length > 0 ? (
                  normalizedSources.map((item, idx) => {
                    const totalV = data.filteredVisitors || 1;
                    const pct = Math.round((item.count / totalV) * 100);
                    const meta = getChannelMeta(item.source);

                    return (
                      <div
                        key={item.source}
                        className={`rounded-2xl p-4 border transition-all duration-200 bg-white shadow-xs hover:shadow-md ${meta.borderClass}`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center p-2 shadow-2xs ${meta.bgClass}`}>
                              {meta.iconSvg}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-sm text-gray-900 tracking-tight">
                                  {meta.label}
                                </h4>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${meta.badgeClass}`}>
                                  {meta.tag}
                                </span>
                              </div>
                              <p className="text-[11px] text-gray-400 mt-0.5">
                                Rank #{idx + 1} Acquisition Source
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-base font-black text-gray-900">
                              {item.count.toLocaleString("en-IN")}
                            </div>
                            <span className="text-[11px] font-bold text-gray-500 font-mono">
                              {pct}% share
                            </span>
                          </div>
                        </div>

                        {/* Visual Progress Bar */}
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${meta.barColor}`}
                            style={{ width: `${Math.max(4, pct)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="bg-white rounded-2xl border border-gray-150 p-8 text-center text-xs text-gray-400 italic">
                    No traffic channels recorded for the chosen date range.
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Modern Campaign Intelligence Deck (7 Columns) */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-150 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <TagIcon className="w-4 h-4 text-emerald-600" />
                    UTM Campaign Performance ({filteredCampaigns.length})
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Specific marketing promotions, ad links, and social post campaigns.
                  </p>
                </div>

                {/* Search & Filter Controls */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative">
                    <MagnifyingGlassIcon className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      placeholder="Filter campaign..."
                      className="pl-8 pr-3 py-1.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-emerald-500 w-36 sm:w-44 transition"
                    />
                  </div>

                  <select
                    value={selectedSource}
                    onChange={(e) => setSelectedSource(e.target.value)}
                    className="py-1.5 px-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="all">All Sources</option>
                    {normalizedSources.map((s) => (
                      <option key={s.source} value={s.source}>
                        {s.source}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Campaign Cards List */}
              {filteredCampaigns.length > 0 ? (
                <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                  {filteredCampaigns.map((c, i) => {
                    const meta = getChannelMeta(c.source);
                    const isCopied = copiedCampaign === c.campaign;

                    return (
                      <div
                        key={`${c.source}-${c.campaign}-${i}`}
                        className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-gray-150 bg-gray-50/40 hover:bg-white hover:border-gray-200 hover:shadow-xs transition-all"
                      >
                        <div className="flex items-start sm:items-center gap-3 min-w-0">
                          {/* Rank badge */}
                          <div className="w-7 h-7 rounded-lg bg-gray-200/70 text-gray-600 font-extrabold text-[11px] flex items-center justify-center shrink-0">
                            #{i + 1}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold border ${meta.badgeClass}`}>
                                {c.source}
                              </span>
                              <span className="font-extrabold text-xs text-gray-900 tracking-tight break-all font-mono">
                                {c.campaign || "Unassigned Campaign"}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-1">
                              <span>UTM Tagged Session</span>
                              <button
                                onClick={() => copyToClipboard(c.campaign)}
                                className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 cursor-pointer transition"
                                title="Copy campaign name"
                              >
                                {isCopied ? (
                                  <>
                                    <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Copied!</span>
                                  </>
                                ) : (
                                  <span>Copy tag</span>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Visitors count pill */}
                        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 bg-white px-3.5 py-1.5 rounded-xl border border-gray-200/80 shadow-2xs">
                          <EyeIcon className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-xs font-black text-gray-900">
                            {c.count.toLocaleString("en-IN")}
                          </span>
                          <span className="text-[10px] text-gray-400 font-semibold">visitors</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 px-4 space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center mx-auto border border-gray-150">
                    <TagIcon className="w-6 h-6 text-gray-300" />
                  </div>
                  <h4 className="text-xs font-bold text-gray-700">No matching campaigns found</h4>
                  <p className="text-[11px] text-gray-400 max-w-sm mx-auto">
                    Try adjusting your search query or selecting &quot;All Sources&quot; to see all campaign activity.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}