import React from "react";
import PujaClient from "./PujaClient";

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
      const activeList = rawList.filter((item: any) => !item.status || item.status === "active");
      initialPujas = activeList;
    }
  } catch (err) {
    console.error("Error prefetching pujas for Puja page:", err);
  }

  return <PujaClient initialPujas={initialPujas || []} />;
}
