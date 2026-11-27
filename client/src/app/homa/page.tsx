import ServiceListingPage from "@/components/common/ServiceListingPage";

export default async function HomaPageServer() {
  const expressBase = process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";
  let initialHomas = null;

  try {
    const homasRes = await fetch(`${expressBase}/api/homas`, { next: { revalidate: 60 } });

    if (homasRes.ok) {
      const homasData = await homasRes.json();
      const rawList = homasData?.data && Array.isArray(homasData.data)
        ? homasData.data
        : Array.isArray(homasData)
          ? homasData
          : [];
      initialHomas = rawList.filter((item: any) => !item.status || item.status === "active");
    }
  } catch (err) {
    console.error("Error prefetching homas for Homa page:", err);
  }

  return (
    <ServiceListingPage
      serviceType="homa"
      initialItems={initialHomas || []}
      heroTitle={{
        heading: "Book Powerful",
        highlight: "Sacred Homas",
        trailing: "Online",
      }}
      heroSubtitle="Invoking divine energies through Vedic fire rituals performed by experienced Vedic Priests. Experience transformative spiritual blessings, health, prosperity, and obstacle removal."
      searchPlaceholder="What homa are you looking for?"
      sectionTitle="Upcoming Online Homas"
      defaultButtonText="Book My Homa"
      apiEndpoint="/api/homas"
    />
  );
}
