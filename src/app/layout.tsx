import type { Metadata, Viewport } from "next";
import "./globals.css";
import type { ReactNode } from "react";
import GlobalChrome from "@/components/layout/GlobalChrome";
import { Providers } from "./Providers";

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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
        <link rel="icon" href="./icons/Fav-Icon.png" />
      </head>
      <body className="flex flex-col min-h-screen">
        <Providers>
          <div className="flex-1">
            {children}
          </div>
          <GlobalChrome />
        </Providers>
      </body>
    </html>
  );
}
