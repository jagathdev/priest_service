"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";

export default function GlobalChrome() {
  const pathname = usePathname();

  // Hide floating chat + site footer on auth pages and the admin panel,
  // so the login/registration screens look clean.
  const shouldHideOnAuth = pathname?.startsWith("/auth") ?? false;
  const shouldHideOnAdminPanel = pathname?.startsWith("/admin") ?? false;
  const shouldHideOnCheckout = pathname?.startsWith("/sankalp") || pathname?.startsWith("/payment") || false;
  const shouldHide = shouldHideOnAuth || shouldHideOnAdminPanel || shouldHideOnCheckout;

  return (
    <>
      {!shouldHide && <MobileBottomNav />}
      {!shouldHide && <Footer />}
    </>
  );
}
