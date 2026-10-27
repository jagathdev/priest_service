import DashboardPage from "./dashboard/DashboardClient";

export default async function HomePage() {
  const expressBase = process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";

  let initialHeroBanners = null;
  let initialPujas = null;
  let initialHomas = null;

  try {
    const [bannersRes, pujasRes, homasRes] = await Promise.all([
      fetch(`${expressBase}/api/hero-banners`, { cache: "no-store" }),
      fetch(`${expressBase}/api/pujas`, { cache: "no-store" }),
      fetch(`${expressBase}/api/homas`, { cache: "no-store" })
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
    <DashboardPage
      initialHeroBanners={initialHeroBanners || []}
      initialPujas={initialPujas || []}
      initialHomas={initialHomas || []}
    />
  );
}
