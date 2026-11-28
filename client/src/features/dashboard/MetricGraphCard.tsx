"use client";

import React, { useState } from "react";
import {
  EyeIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { DashboardMetricGraph } from "./types";

interface MetricGraphCardProps {
  data: DashboardMetricGraph;
  loading?: boolean;
}

const COLOR_MAP = {
  blue: {
    text: "text-blue-700",
    bgCard: "bg-white",
    borderCard: "border-blue-150 hover:border-blue-300 shadow-sm hover:shadow-md",
    iconBg: "bg-blue-50 text-blue-600 border border-blue-200/80 shadow-2xs",
    tagBg: "bg-blue-50/80 text-blue-700 border border-blue-200",
    barFill: "#bfdbfe",
    barHover: "#93c5fd",
    lineStroke: "#2563eb",
    dotFill: "#2563eb",
    gridColor: "#f1f5f9",
    tooltipBg: "bg-white",
    tooltipBorder: "border-blue-200",
    tooltipShadow: "shadow-[0_12px_28px_rgba(37,99,235,0.18)]",
    tooltipBadgeBg: "bg-blue-50 text-blue-700 border-blue-200",
    tooltipCountColor: "text-blue-600",
    caretBorder: "border-r border-b border-blue-200 bg-white",
  },
  purple: {
    text: "text-purple-700",
    bgCard: "bg-white",
    borderCard: "border-purple-150 hover:border-purple-300 shadow-sm hover:shadow-md",
    iconBg: "bg-purple-50 text-purple-600 border border-purple-200/80 shadow-2xs",
    tagBg: "bg-purple-50/80 text-purple-700 border border-purple-200",
    barFill: "#e9d5ff",
    barHover: "#d8b4fe",
    lineStroke: "#9333ea",
    dotFill: "#9333ea",
    gridColor: "#f1f5f9",
    tooltipBg: "bg-white",
    tooltipBorder: "border-purple-200",
    tooltipShadow: "shadow-[0_12px_28px_rgba(147,51,234,0.18)]",
    tooltipBadgeBg: "bg-purple-50 text-purple-700 border-purple-200",
    tooltipCountColor: "text-purple-600",
    caretBorder: "border-r border-b border-purple-200 bg-white",
  },
  orange: {
    text: "text-amber-800",
    bgCard: "bg-white",
    borderCard: "border-amber-150 hover:border-amber-300 shadow-sm hover:shadow-md",
    iconBg: "bg-amber-50 text-amber-700 border border-amber-200/80 shadow-2xs",
    tagBg: "bg-amber-50/80 text-amber-800 border border-amber-200",
    barFill: "#fed7aa",
    barHover: "#fdba74",
    lineStroke: "#ea580c",
    dotFill: "#ea580c",
    gridColor: "#f1f5f9",
    tooltipBg: "bg-white",
    tooltipBorder: "border-orange-200",
    tooltipShadow: "shadow-[0_12px_28px_rgba(234,88,12,0.18)]",
    tooltipBadgeBg: "bg-orange-50 text-orange-700 border-orange-200",
    tooltipCountColor: "text-orange-600",
    caretBorder: "border-r border-b border-orange-200 bg-white",
  },
  green: {
    text: "text-emerald-800",
    bgCard: "bg-white",
    borderCard: "border-emerald-150 hover:border-emerald-300 shadow-sm hover:shadow-md",
    iconBg: "bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs",
    tagBg: "bg-emerald-50/80 text-emerald-800 border border-emerald-200",
    barFill: "#a7f3d0",
    barHover: "#6ee7b7",
    lineStroke: "#059669",
    dotFill: "#059669",
    gridColor: "#f1f5f9",
    tooltipBg: "bg-white",
    tooltipBorder: "border-emerald-200",
    tooltipShadow: "shadow-[0_12px_28px_rgba(5,150,105,0.18)]",
    tooltipBadgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    tooltipCountColor: "text-emerald-600",
    caretBorder: "border-r border-b border-emerald-200 bg-white",
  },
};

export default function MetricGraphCard({ data, loading }: MetricGraphCardProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const colors = COLOR_MAP[data.color] || COLOR_MAP.blue;
  const trend = data.trend && data.trend.length > 0 ? data.trend : [];

  // Icon selector based on metric color/type
  const renderIcon = () => {
    switch (data.color) {
      case "blue":
        return <EyeIcon className="w-6 h-6 text-blue-600" />;
      case "purple":
        return <ShieldCheckIcon className="w-6 h-6 text-purple-600" />;
      case "orange":
        return <ShoppingBagIcon className="w-6 h-6 text-amber-700" />;
      case "green":
        return <CheckCircleIcon className="w-6 h-6 text-emerald-600" />;
    }
  };

  // Big, spacious SVG Chart Geometry for 2x2 layout
  const svgWidth = 640;
  const svgHeight = 250;
  const marginLeft = 45;
  const marginRight = 22;
  const marginTop = 24;
  const marginBottom = 36;

  const chartWidth = svgWidth - marginLeft - marginRight;
  const chartHeight = svgHeight - marginTop - marginBottom;

  // Maximum value for scaling (at least 5 for empty or small data)
  const maxDataVal = Math.max(...trend.map((t) => t.count), 0);
  const yMax = maxDataVal === 0 ? 5 : Math.ceil(maxDataVal * 1.25);
  const yMid = Math.round(yMax / 2);

  // Compute points and bar layout
  const n = trend.length;
  const step = n > 1 ? chartWidth / n : chartWidth;
  const barWidth = Math.max(14, Math.min(36, step * 0.58));

  const points = trend.map((t, idx) => {
    const x = marginLeft + (idx + 0.5) * step;
    const yRatio = t.count / yMax;
    const y = marginTop + chartHeight - yRatio * chartHeight;
    return { ...t, x, y, barHeight: Math.max(6, yRatio * chartHeight) };
  });

  // Smooth SVG Path generator (Catmull-Rom or Monotone curve)
  const getSmoothPath = (pts: { x: number; y: number }[]): string => {
    if (pts.length === 0) return "";
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
    if (pts.length === 2) return `M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y}`;

    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(i - 1, 0)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(i + 2, pts.length - 1)];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  };

  const linePath = getSmoothPath(points);

  // Determine which X-axis labels to display so they never overlap
  const getLabelInterval = (count: number) => {
    if (count <= 7) return 1;
    if (count <= 14) return 2;
    if (count <= 21) return 3;
    return 5;
  };
  const labelInterval = getLabelInterval(n);

  return (
    <div
      className={`rounded-3xl border ${colors.bgCard} ${colors.borderCard} p-6 sm:p-8 transition-all duration-200 flex flex-col justify-between relative group text-left`}
    >
      {/* ── Top Header Row ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-xs sm:text-sm font-black tracking-wider uppercase px-3 py-1 rounded-xl ${colors.tagBg}`}>
            {data.prefix} · {data.title}
          </span>
        </div>
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${colors.iconBg}`}>
          {renderIcon()}
        </div>
      </div>

      {/* ── Metric Count & Optional Revenue Pill ── */}
      <div className="mt-5 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          {loading ? (
            <div className="h-12 w-36 bg-gray-100 rounded-xl animate-pulse" />
          ) : (
            <div className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight leading-none">
              {data.count.toLocaleString("en-IN")}
            </div>
          )}
          <div className="text-xs sm:text-sm text-gray-500 font-semibold mt-1.5">{data.subtitle}</div>
        </div>

        {/* Revenue Display Box for Completed Orders */}
        {data.revenue !== undefined && (
          <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-2xl px-4 py-2.5 text-right shadow-2xs">
            <span className="text-[10.5px] font-bold text-emerald-800 uppercase tracking-wider block">
              Total Revenue
            </span>
            <div className="text-xl sm:text-2xl font-black text-emerald-700 tracking-tight leading-tight mt-0.5 font-mono">
              ₹{data.revenue.toLocaleString("en-IN")}
            </div>
          </div>
        )}
      </div>

      {/* ── Big Graph Section with Bar + Line Combination ── */}
      <div className="mt-6 relative w-full select-none">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-60 sm:h-64 lg:h-72 overflow-visible"
        >
          {/* Y-Axis Horizontal Gridlines */}
          <line
            x1={marginLeft}
            y1={marginTop}
            x2={svgWidth - marginRight}
            y2={marginTop}
            stroke="#f1f5f9"
            strokeDasharray="4 4"
            strokeWidth="1.2"
          />
          <text
            x={marginLeft - 10}
            y={marginTop + 4}
            textAnchor="end"
            className="text-[11px] font-mono fill-gray-400 font-bold"
          >
            {yMax}
          </text>

          <line
            x1={marginLeft}
            y1={marginTop + chartHeight / 2}
            x2={svgWidth - marginRight}
            y2={marginTop + chartHeight / 2}
            stroke="#f1f5f9"
            strokeDasharray="4 4"
            strokeWidth="1.2"
          />
          <text
            x={marginLeft - 10}
            y={marginTop + chartHeight / 2 + 4}
            textAnchor="end"
            className="text-[11px] font-mono fill-gray-400 font-bold"
          >
            {yMid}
          </text>

          <line
            x1={marginLeft}
            y1={marginTop + chartHeight}
            x2={svgWidth - marginRight}
            y2={marginTop + chartHeight}
            stroke="#e2e8f0"
            strokeWidth="1.5"
          />
          <text
            x={marginLeft - 10}
            y={marginTop + chartHeight + 4}
            textAnchor="end"
            className="text-[11px] font-mono fill-gray-400 font-bold"
          >
            0
          </text>

          {/* Vertical Bars */}
          {points.map((pt, idx) => {
            const isHovered = hoveredIndex === idx;
            const barY = marginTop + chartHeight - pt.barHeight;
            return (
              <g key={`bar-${pt.date}-${idx}`}>
                <rect
                  x={pt.x - barWidth / 2}
                  y={barY}
                  width={barWidth}
                  height={pt.barHeight}
                  rx="6"
                  ry="6"
                  fill={isHovered ? colors.barHover : colors.barFill}
                  className="transition-colors duration-150"
                />

                {/* X-Axis Date Labels */}
                {(idx % labelInterval === 0 || idx === points.length - 1) && (
                  <text
                    x={pt.x}
                    y={svgHeight - 8}
                    textAnchor="middle"
                    className="text-[10.5px] font-semibold fill-gray-400"
                  >
                    {pt.label}
                  </text>
                )}

                {/* Transparent Hover Hit Area */}
                <rect
                  x={marginLeft + idx * step}
                  y={marginTop}
                  width={step}
                  height={chartHeight + marginBottom}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              </g>
            );
          })}

          {/* Smooth Overlay Line Graph (Thick & Vibrant) */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke={colors.lineStroke}
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pointer-events-none drop-shadow-xs"
            />
          )}

          {/* Interactive Highlight Dot */}
          {hoveredIndex !== null && points[hoveredIndex] && (
            <g className="pointer-events-none">
              <circle
                cx={points[hoveredIndex].x}
                cy={points[hoveredIndex].y}
                r="6"
                fill={colors.dotFill}
                stroke="#ffffff"
                strokeWidth="3"
                className="animate-in fade-in zoom-in-75 duration-150 drop-shadow-sm"
              />
            </g>
          )}
        </svg>

        {/* ── Interactive Floating Tooltip (Refined Glass Pill Design) ── */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <div
            className={`absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-full ${colors.tooltipBg} ${colors.tooltipShadow} px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2.5 whitespace-nowrap border ${colors.tooltipBorder} transition-all duration-100 ease-out`}
            style={{
              left: `${(points[hoveredIndex].x / svgWidth) * 100}%`,
              top: `${Math.max(10, (points[hoveredIndex].y / svgHeight) * 100 - 8)}%`,
            }}
          >
            {/* Little downward arrow caret matching border & background */}
            <div
              className={`absolute left-1/2 -bottom-1 -translate-x-1/2 w-2.5 h-2.5 ${colors.caretBorder} rotate-45`}
            />

            {/* Date Tag */}
            <span className="text-gray-500 font-semibold tracking-tight">
              {points[hoveredIndex].label}
            </span>

            {/* Subtle separator */}
            <span className="w-1 h-1 rounded-full bg-gray-300" />

            {/* Metric Count with Card's Theme Accent */}
            <span className={`text-base font-black ${colors.tooltipCountColor} tracking-tight leading-none`}>
              {points[hoveredIndex].count.toLocaleString("en-IN")}
            </span>

            {/* Metric Badge */}
            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${colors.tooltipBadgeBg}`}>
              {data.title}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
