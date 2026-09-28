"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type CurrencyType = "INR" | "USD" | "MYR";

interface CurrencyContextType {
  currency: CurrencyType;
  currencySymbol: string;
  loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "INR",
  currencySymbol: "₹",
  loading: true,
});

export const useCurrency = () => useContext(CurrencyContext);

const getSymbol = (curr: CurrencyType) => {
  if (curr === "USD") return "$";
  if (curr === "MYR") return "RM";
  return "₹";
};

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<CurrencyType>("INR");
  const [currencySymbol, setCurrencySymbol] = useState<string>("₹");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrency = async () => {
      try {
        let customSymbols: Record<CurrencyType, string> = {
          INR: "₹",
          USD: "$",
          MYR: "RM",
        };

        // 1. Fetch customized symbols from backend settings
        try {
          const res = await fetch("/api/admin/content?type=currency");
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              const settings = data[0];
              customSymbols = {
                INR: settings.inrSymbol || "₹",
                USD: settings.usdSymbol || "$",
                MYR: settings.myrSymbol || "RM",
              };
            }
          }
        } catch (err) {
          console.error("Error fetching custom currency symbols:", err);
        }

        // 2. Check cookies first
        let detectedCurrency: CurrencyType = "INR";
        let foundCookie = false;
        const match = document.cookie.match(new RegExp('(^| )userCurrency=([^;]+)'));
        if (match && match[2]) {
          const savedCurr = match[2] as CurrencyType;
          if (["INR", "USD", "MYR"].includes(savedCurr)) {
            detectedCurrency = savedCurr;
            foundCookie = true;
          }
        }

        // 3. Fetch IP Geolocation if cookie not found
        if (!foundCookie) {
          try {
            // Uses internal /api/geo route — server-side, no rate limits, no external API key needed
            const res = await fetch("/api/geo");
            if (res.ok) {
              const data = await res.json();
              if (data.currency && ["INR", "USD", "MYR"].includes(data.currency)) {
                detectedCurrency = data.currency as CurrencyType;
              }
            }
          } catch (geoError) {
            console.error("Error with IP Geolocation detection:", geoError);
          }
        }

        setCurrency(detectedCurrency);
        setCurrencySymbol(customSymbols[detectedCurrency] || getSymbol(detectedCurrency));
        
        // Save to cookie for 30 days
        document.cookie = `userCurrency=${detectedCurrency}; path=/; max-age=${30 * 24 * 60 * 60}`;
      } catch (error) {
        console.error("Error detecting currency:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrency();
  }, []);

  return (
    <CurrencyContext.Provider value={{ currency, currencySymbol, loading }}>
      {children}
    </CurrencyContext.Provider>
  );
};

