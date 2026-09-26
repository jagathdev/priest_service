"use client";

import Link from "next/link";

export interface CalculatorCardProps {
  id: string;
  title: string;
  description: string;
  /** hex color for title + button bg */
  accentHex: string;
  imageUrl: string;
  href: string | null;
  live: boolean;
}

export default function CalculatorCard({
  title,
  description,
  accentHex,
  imageUrl,
  href,
  live,
}: CalculatorCardProps) {
  const card = (
    <div
      className={[
        "relative bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col justify-between md:block h-full md:h-auto md:min-h-[300px]",
        live ? "cursor-pointer" : "cursor-default",
      ].join(" ")}
    >
      <div className="absolute inset-0 z-0 pointer-events-none md:hidden"></div>
      {/* ── Text & button (left column) ── */}
      <div className="relative z-10 flex flex-col gap-1.5 md:gap-3 p-3 pb-3 md:p-7 md:pb-8 w-[58%] md:w-auto md:max-w-[55%]">
        <h2 className="text-[13px] md:text-xl font-bold leading-tight md:leading-snug" style={{ color: accentHex }}>
          {title}
        </h2>
        <p className="text-[11px] md:text-[13.5px] text-gray-500 leading-snug md:leading-relaxed">{description}</p>

        {/* Wide pill arrow button — only on live cards */}
        {live && (
          <div className="mt-1 md:mt-2">
            <span
              className="inline-flex items-center justify-center gap-1 px-3 md:px-5 h-6 md:h-10 rounded-full text-white font-semibold shadow select-none"
              style={{ backgroundColor: accentHex }}
            >
              <svg
                className="w-3 h-3 md:w-5 md:h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </div>
        )}
      </div>

      {/* ── Zodiac image — large, bottom-right, partially cropped ── */}
      <div
        className="absolute bottom-0 right-0 pointer-events-none select-none w-[75px] h-[75px] md:w-[220px] md:h-[260px]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt=""
          role="presentation"
          className="w-full h-full object-cover object-left-top rounded-tl-[40px] md:rounded-tl-[0px]"
          style={{
            filter: live ? "none" : "grayscale(100%) brightness(0.55)",
          }}
        />
      </div>
    </div>
  );

  if (live && href) {
    return (
      <Link href={href} className="block">
        {card}
      </Link>
    );
  }
  return <div>{card}</div>;
}
