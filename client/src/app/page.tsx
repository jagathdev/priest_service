import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/home/HeroSection";
import TrustStrip from "@/components/home/TrustStrip";
import HowPujaPerformed from "@/components/home/HowPujaPerformed";
import PujaListing from "@/components/home/PujaListing";
import PujaGallery from "@/components/home/PujaGallery";
import FaqSection from "@/components/home/FaqSection";

export default async function HomePage() {
  const expressBase = process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";

  let initialHeroBanners = null;
  let initialPujas = null;
  let initialHomas = null;

  try {
    const [bannersRes, pujasRes, homasRes] = await Promise.all([
      fetch(`${expressBase}/api/hero-banners`, { next: { revalidate: 60 } }),
      fetch(`${expressBase}/api/pujas`, { next: { revalidate: 60 } }),
      fetch(`${expressBase}/api/homas`, { next: { revalidate: 60 } })
    ]);

    if (bannersRes.ok) {
      const bannersData = await bannersRes.json();
      initialHeroBanners = Array.isArray(bannersData) ? bannersData : (bannersData && Array.isArray(bannersData.data) ? bannersData.data : []);
    }

    if (pujasRes.ok) {
      const pujasData = await pujasRes.json();
      const rawList = pujasData?.data && Array.isArray(pujasData.data)
        ? pujasData.data
        : Array.isArray(pujasData)
          ? pujasData
          : [];
      const activeList = rawList.filter((item: any) => !item.status || item.status === "active");
      initialPujas = activeList;
    }

    if (homasRes.ok) {
      const homasData = await homasRes.json();
      const rawHomas = homasData?.data && Array.isArray(homasData.data)
        ? homasData.data
        : Array.isArray(homasData)
          ? homasData
          : [];
      const activeHomas = rawHomas.filter((item: any) => !item.status || item.status === "active");
      initialHomas = activeHomas;
    }
  } catch (err) {
    console.error("Error prefetching data for home page:", err);
  }

  return (
    <main className="min-h-screen bg-white text-ink font-sans">
      <Navbar />
      <HeroSection initialBanners={initialHeroBanners || []} />
      <TrustStrip />
      <HowPujaPerformed />
      <PujaListing initialPujas={initialPujas || []} />
      <PujaGallery initialPujas={initialPujas || []} initialHomas={initialHomas || []} />
      <FaqSection />
    </main>
  );
}
