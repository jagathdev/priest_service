import type { Metadata, Viewport } from "next";
import "./globals.css";
import type { ReactNode } from "react";
import GlobalChrome from "@/components/layout/GlobalChrome";
import { Providers } from "./Providers";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Priest Services | Sacred Pujas & Rituals",
  description: "Book authentic Vedic pujas, homas, and ritual services online.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const mockUserCookie = cookieStore.get("mockUser");

  let serverUser = null;
  if (mockUserCookie && mockUserCookie.value) {
    try {
      serverUser = JSON.parse(decodeURIComponent(mockUserCookie.value));
    } catch (e) {
      console.error("Failed to parse mockUser cookie on server");
    }
  }

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
        <link rel="icon" href="./icons/Fav-Icon.png" />
      </head>
      <body className="flex flex-col min-h-screen">
        <Providers serverUser={serverUser}>
          <div className="flex-1">
            {children}
          </div>
          <GlobalChrome />
        </Providers>
      </body>
    </html>
  );
}
