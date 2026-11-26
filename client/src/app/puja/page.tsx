import React from "react";
import ServiceListingPage from "@/components/common/ServiceListingPage";

export default async function PujaPageServer() {
  const expressBase = process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";
  let initialPujas = null;

  try {
    const pujasRes = await fetch(`${expressBase}/api/pujas`, { next: { revalidate: 60 } });

    if (pujasRes.ok) {
      const pujasData = await pujasRes.json();
      const rawList = pujasData?.data && Array.isArray(pujasData.data)
        ? pujasData.data
        : Array.isArray(pujasData)
          ? pujasData
          : [];
      initialPujas = rawList.filter((item: any) => !item.status || item.status === "active");
    }
  } catch (err) {
    console.error("Error prefetching pujas for Puja page:", err);
  }

  return (
    <ServiceListingPage
      serviceType="puja"
      initialItems={initialPujas || []}
      heroTitle={{
        heading: "Book Authentic",
        highlight: "Divine Pujas",
        trailing: "Online",
      }}
      heroSubtitle="Performed by certified Vedic Pandits in ancient temples across India. Receive live video streaming, personalized sankalpam, and sacred prasadam."
      searchPlaceholder="What puja are you looking for?"
      sectionTitle="Upcoming Online Pujas"
      defaultButtonText="Book My Puja"
      apiEndpoint="/api/pujas"
    />
  );
}
