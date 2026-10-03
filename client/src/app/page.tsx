import DashboardPage from "./dashboard/page";

export default async function HomePage() {
  const expressBase = process.env.NEXT_PUBLIC_API_BASE_URL || "https://priest-service.onrender.com";

  let initialHeroBanners = null;
  let initialPujas = null;

  try {
    const [bannersRes, pujasRes] = await Promise.all([
      fetch(`${expressBase}/api/hero-banners`, { cache: "no-store" }),
      fetch(`${expressBase}/api/pujas`, { cache: "no-store" })
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
      initialPujas = activeList.slice(0, 6);
    }
  } catch (err) {
    console.error("Error prefetching data for home page:", err);
  }

  return (
    <DashboardPage
      initialHeroBanners={initialHeroBanners || []}
      initialPujas={initialPujas || []}
    />
  );
}
