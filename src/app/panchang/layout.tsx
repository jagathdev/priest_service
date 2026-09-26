import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Today's Panchang | Hindu Calendar, Auspicious Timings",
  description: "Check today's Panchang with detailed Hindu calendar updates. Find Tithi, Nakshatra, Yoga, Rahu Kaal, and daily auspicious timings.",
};

export default function PanchangLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {children}
    </div>
  );
}
