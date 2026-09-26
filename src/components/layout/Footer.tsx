"use client";

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="w-full">
      {/* ==========================================
          MOBILE FOOTER STRUCTURE (< 768px / md:hidden)
          Matches exact structure of reference screenshot while retaining AstroVed theme
      ========================================== */}
      <div className="block md:hidden w-full">
        {/* Top Light Banner Block */}
        <div className="w-full bg-[#f3f4f6] text-[#1f2937] px-6 py-8 border-t border-gray-200">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2.5 mb-5">
            <img
              src="/images/logo.svg"
              alt="AstroVed Logo"
              className="h-9 w-auto object-contain"
            />

          </div>

          {/* Our Address */}
          <h3 className="text-[15px] font-bold text-[#111827] mb-2">Our Address</h3>
          <p className="text-xs leading-[1.65] text-gray-500 mb-6 font-medium">
            AstroVed.Com Pvt. Limited, Prince Info Park, Plot No: 81-B, A-Block, 4th Floor, 2nd Main Road, Ambattur Industrial Estate, Chennai 600 058
          </p>

          {/* Social Icons Row inside circular pills */}
          <div className="flex flex-wrap items-center gap-3 mb-7">
            <MobileSocialIcon platform="youtube" href="https://www.youtube.com/AstroVed" />
            <MobileSocialIcon platform="instagram" href="https://www.instagram.com/accounts/login/?next=%2FAstroVed&source=omni_redirect" />
            <MobileSocialIcon platform="linkedin" href="https://www.linkedin.com/company/AstroVed-com/" />
            <MobileSocialIcon platform="whatsapp" href="https://api.whatsapp.com/send/?phone=919677391108&text&type=phone_number&app_absent=0" />
            <MobileSocialIcon platform="x" href="https://x.com/AstroVed" />
            <MobileSocialIcon platform="facebook" href="https://www.facebook.com/AstroVed" />
          </div>

          {/* Two App Download Buttons Side by Side */}
          <div className="grid grid-cols-2 gap-3 w-full">
            <a
              href="https://play.google.com/store/search?q=astroved&c=apps"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#1f2937] rounded-xl p-2.5 flex items-center justify-center gap-2.5 border border-gray-700 text-white hover:bg-gray-700 transition-colors shadow-sm"
            >
              <i className="fa-brands fa-google-play text-xl text-green-400 shrink-0"></i>
              <div className="text-left leading-tight">
                <p className="text-[8px] uppercase font-bold tracking-wider text-gray-300">GET IT ON</p>
                <p className="text-xs font-black tracking-tight text-white">Google Play</p>
              </div>
            </a>
            <a
              href="https://apps.apple.com/us/app/AstroVed-astrology-remedies/id1406242342"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#1f2937] rounded-xl p-2.5 flex items-center justify-center gap-2.5 border border-gray-700 text-white hover:bg-gray-700 transition-colors shadow-sm"
            >
              <i className="fa-brands fa-apple text-2xl text-white shrink-0"></i>
              <div className="text-left leading-tight">
                <p className="text-[8px] uppercase font-bold tracking-wider text-gray-300">Download on the</p>
                <p className="text-xs font-black tracking-tight text-white">App Store</p>
              </div>
            </a>
          </div>
        </div>

        {/* Bottom White Section (Links, Compliance & Legal) */}
        <div className="w-full bg-[#fafafa] text-[#1f1f1f] px-6 pt-8 pb-6 border-t border-gray-200">
          {/* Two-Column Side-by-Side Links */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <h4 className="text-[15px] font-bold text-[#111827] mb-4">Company</h4>
              <ul className="space-y-3 text-xs font-medium text-gray-600">
                <li><Link href="/about" className="hover:text-black transition">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-black transition">Contact Us</Link></li>
                <li><Link href="/privacy" className="hover:text-black transition">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-black transition">Terms & Conditions</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[15px] font-bold text-[#111827] mb-4">Our Services</h4>
              <ul className="space-y-3 text-xs font-medium text-gray-600">
                <li><Link href="/puja" className="hover:text-black transition">Puja</Link></li>
                <li><Link href="/chadhava" className="hover:text-black transition">Chadhava</Link></li>
                <li><Link href="/panchang" className="hover:text-black transition">Panchang</Link></li>
                <li><Link href="/temples" className="hover:text-black transition">Temples</Link></li>
              </ul>
            </div>
          </div>

          {/* Compliance Logos & Copyright */}
          <div className="pt-6 border-t border-gray-200 text-center">
            <div className="flex flex-wrap items-center justify-center gap-4 mb-4 opacity-85">
              <img
                src="https://cdn.astroved.com/images/images-av/years-of-services.png"
                alt="25 YEARS OF ASTROVED"
                className="h-8 w-auto object-contain"
              />
              <img
                src="https://cdn.astroved.com/images/images-av/podbean-logo.png"
                alt="PODBEAN"
                className="h-8 w-auto object-contain"
              />
              <img
                src="https://cdn.astroved.com/images/images-av/iso.png"
                alt="ISO"
                className="h-8 w-auto object-contain"
              />
              <img
                src="https://cdn.astroved.com/images/images-av/sectigo_trust_seal.jpg"
                alt="trust seal"
                className="h-8 w-auto object-contain"
              />
            </div>
            <p className="text-[11px] text-gray-500 font-medium">© 2001 - 2026 AstroVed - All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* ==========================================
          DESKTOP FOOTER STRUCTURE (>= 768px / hidden md:block)
          Exact existing design untouched
      ========================================== */}
      <div className="hidden md:block w-full bg-[#f3f4f6] text-[#1f2937] border-t border-gray-200">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4 lg:gap-8">
            {/* Logo and Description */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <img
                  src="/images/logo.svg"
                  alt="AstroVed Logo"
                  className="h-10 w-auto object-contain"
                />
              </div>
              <p className="text-sm leading-relaxed text-gray-500">
                AstroVed has brought religious services to the masses in India by connecting devotees, pandits and temples. Partnering with over 100 renowned temples, we provide exclusive pujas and offerings performed by expert pandits and share videos of the completed puja rituals.
              </p>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="mb-6 text-xl font-bold text-[#111827]">Company</h4>
              <ul className="flex flex-col gap-4 text-sm font-medium text-gray-500">
                <li><Link href="/about" className="hover:text-[#1f2937] transition">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-[#1f2937] transition">Contact Us</Link></li>
              </ul>
            </div>

            {/* Services Links */}
            <div>
              <h4 className="mb-6 text-xl font-bold text-[#111827]">Our Services</h4>
              <ul className="flex flex-col gap-4 text-sm font-medium text-gray-500">
                <li><Link href="/puja" className="hover:text-[#1f2937] transition">Puja</Link></li>
                <li><Link href="/chadhava" className="hover:text-[#1f2937] transition">Chadhava</Link></li>
                <li><Link href="/panchang" className="hover:text-[#1f2937] transition">Panchang</Link></li>
                <li><Link href="/temples" className="hover:text-[#1f2937] transition">Temples</Link></li>
              </ul>
            </div>

            {/* Address and Socials */}
            <div>
              <h4 className="mb-6 text-xl font-bold text-[#111827]">Our Address</h4>
              <p className="text-sm leading-relaxed mb-6 text-gray-500">
                AstroVed.Com Pvt. Ltd.,
                Prince Info Park, Plot No: 81-B,
                A-Block, 4th Floor, 2nd Main Road,
                Ambattur Industrial Estate,
                Chennai 600 058
              </p>
              <div className="flex flex-wrap gap-3">
                <SocialIcon platform="youtube" href="https://www.youtube.com/AstroVed" />
                <SocialIcon platform="instagram" href="https://www.instagram.com/accounts/login/?next=%2FAstroVed&source=omni_redirect" />
                <SocialIcon platform="linkedin" href="https://www.linkedin.com/company/AstroVed-com/" />
                <SocialIcon platform="whatsapp" href="https://api.whatsapp.com/send/?phone=919677391108&text&type=phone_number&app_absent=0" />
                <SocialIcon platform="x" href="https://x.com/AstroVed" />
                <SocialIcon platform="facebook" href="https://www.facebook.com/AstroVed" />
              </div>
            </div>
          </div>

          {/* Bottom Part (Badges and Legal) */}
          <div className="mt-16 border-t border-gray-300 pt-8 flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-8">
            {/* Download Badges */}
            <div id="download-app" className="flex scroll-mt-28 flex-wrap justify-center gap-4 md:justify-start">
              <a href="https://play.google.com/store/search?q=astroved&c=apps" target="_blank" rel="noopener noreferrer" aria-label="Download AstroVed on Google Play" className="h-12 w-36 bg-[#1f2937] text-white rounded-lg flex items-center px-3 text-[10px] gap-3 border border-gray-700 cursor-pointer hover:bg-gray-700 transition-all">
                <i className="fa-brands fa-google-play text-xl"></i>
                <div className="leading-tight">
                  <p className="font-bold text-[15px]">Google Play</p>
                </div>
              </a>
              <a href="https://apps.apple.com/us/app/AstroVed-astrology-remedies/id1406242342" target="_blank" rel="noopener noreferrer" aria-label="Download AstroVed on the App Store" className="h-12 w-36 bg-[#1f2937] text-white rounded-lg flex items-center px-3 text-[10px] gap-3 border border-gray-700 cursor-pointer hover:bg-gray-700 transition-all">
                <i className="fa-brands fa-apple text-2xl"></i>
                <div className="leading-tight">
                  <p className="font-bold text-[15px]">App Store</p>
                </div>
              </a>
            </div>

            {/* Compliance Logos */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 opacity-90">
              <div className="flex flex-col items-center gap-1">
                <img
                  src="https://cdn.astroved.com/images/images-av/years-of-services.png"
                  alt="25 YEARS OF ASTROVED"
                  className="h-10 w-auto object-contain"
                />
              </div>
              <div className="flex flex-col items-center gap-1">
                <img
                  src="https://cdn.astroved.com/images/images-av/podbean-logo.png"
                  alt="PODBEAN"
                  className="h-10 w-auto object-contain"
                />
              </div>
              <div>
                <img
                  src="https://cdn.astroved.com/images/images-av/iso.png"
                  alt="ISO"
                  className="h-10 w-auto object-contain"
                />
              </div>
              <div className="flex flex-col items-center gap-1">
                <img
                  src="https://cdn.astroved.com/images/images-av/sectigo_trust_seal.jpg"
                  alt="trust seal"
                  className="h-10 w-auto object-contain"
                />
              </div>
            </div>

            {/* Legal and Copyright */}
            <div className="text-center sm:text-right">
              <div className="flex gap-4 text-xs font-semibold justify-center sm:justify-end mb-1 text-[#1f2937]">
                <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
                <span>•</span>
                <Link href="/terms" className="hover:underline">Terms and Conditions</Link>
              </div>
              <p className="text-[10px] text-gray-400">© 2001 - 2026 AstroVed - All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function MobileSocialIcon({ platform, href }: { platform: string; href: string }) {
  const icons: Record<string, string> = {
    youtube: "fa-brands fa-youtube text-[#ff0000]",
    instagram: "fa-brands fa-instagram text-[#e4405f]",
    linkedin: "fa-brands fa-linkedin-in text-[#0a66c2]",
    whatsapp: "fa-brands fa-whatsapp text-[#25d366]",
    x: "fa-brands fa-x-twitter text-black",
    facebook: "fa-brands fa-facebook-f text-[#1877f2]",
  };
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="h-9 w-9 bg-white rounded-full flex items-center justify-center text-base shadow-sm hover:scale-105 transition-all cursor-pointer shrink-0"
    >
      <i className={icons[platform] || "fa-solid fa-share-nodes text-gray-700"}></i>
    </a>
  );
}

function SocialIcon({ platform, href }: { platform: string; href: string }) {
  const icons: Record<string, string> = {
    youtube: "fa-brands fa-youtube",
    instagram: "fa-brands fa-instagram",
    linkedin: "fa-brands fa-linkedin-in",
    whatsapp: "fa-brands fa-whatsapp",
    x: "fa-brands fa-x-twitter",
    facebook: "fa-brands fa-facebook-f",
  };
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="h-8 w-8 bg-white rounded-full flex items-center justify-center text-[#1f1f1f] text-sm cursor-pointer hover:bg-gray-100 transition-all shadow-sm">
      <i className={icons[platform] || "fa-solid fa-share-nodes"}></i>
    </a>
  );
}
