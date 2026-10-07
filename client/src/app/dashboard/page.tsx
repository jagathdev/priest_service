import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  let initialPujas = [];
  let initialHeroBanners = [];

  try {
    const expressBase = process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";

    // Fetch both simultaneously for maximum performance
    const [pujasRes, bannersRes] = await Promise.all([
      fetch(`${expressBase}/api/pujas`, { cache: 'no-store' }),
      fetch(`${expressBase}/api/hero-banners`, { cache: 'no-store' })
    ]);

    if (pujasRes.ok) {
      const result = await pujasRes.json();
      if (result?.success && result?.data) {
        initialPujas = result.data;
      }
    }

    if (bannersRes.ok) {
      const bannersData = await bannersRes.json();
      initialHeroBanners = Array.isArray(bannersData) ? bannersData : (bannersData && Array.isArray(bannersData.data) ? bannersData.data : []);
    }
  } catch (err) {
    console.error("Failed to fetch initial data for dashboard (SSR):", err);
  }

  return <DashboardClient initialPujas={initialPujas} initialHeroBanners={initialHeroBanners} />;
}
