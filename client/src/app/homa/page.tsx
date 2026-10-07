import React from "react";
import HomaClient from "./HomaClient";

export default async function HomaPageServer() {
  const expressBase = process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";
  let initialHomas = null;

  try {
    const homasRes = await fetch(`${expressBase}/api/homas`, { cache: "no-store" });

    if (homasRes.ok) {
      const homasData = await homasRes.json();
      const rawList = homasData?.data && Array.isArray(homasData.data)
        ? homasData.data
        : Array.isArray(homasData)
          ? homasData
          : [];
      const activeList = rawList.filter((item: any) => !item.status || item.status === "active");
      initialHomas = activeList;
    }
  } catch (err) {
    console.error("Error prefetching homas for Homa page:", err);
  }

  return <HomaClient initialHomas={initialHomas || []} />;
}
