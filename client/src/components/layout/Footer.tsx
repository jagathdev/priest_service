"use client";

import Image from "next/image";
import Link from "next/link";
import priestservicesLogo from "../../../public/images/priest-services-logo.webp";

export default function Footer() {
  return (
    <footer className="bg-[#fdfbf7] text-stone-700 pt-16 pb-12 sm:pb-16 border-t border-[#f0e4d0] relative">
      <div className="max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-10 text-center border-b border-stone-200/80 pb-12 mb-10">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#1f1a17] mb-4 leading-tight">
          A Sacred Path to Divine Blessings Book Your<br className="hidden sm:inline" /> Sacred Puja
        </h2>
        <p className="text-stone-600 text-sm sm:text-base mb-8 font-medium">
          Connect with divine blessings through authentic Vedic rituals.
        </p>
        <div className="flex items-center justify-center mb-8 flex-wrap">
          <span className="text-[#1f1a17] font-extrabold text-base sm:text-lg mr-4">Follow us —</span>
          <ul className="flex items-center justify-center gap-3">
            <li>
              <a
                href="https://www.facebook.com/astroved"
                aria-label="Facebook"
                rel="nofollow"
                target="_blank"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm border border-stone-200 text-[#1877F2] transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:border-[#1877F2] hover:shadow-lg hover:shadow-[#1877F2]/20"
              >
                <i className="fa-brands fa-facebook-f text-lg text-[#1877F2]"></i>
              </a>
            </li>
            <li>
              <a
                href="https://twitter.com/astroved"
                aria-label="X (formerly Twitter)"
                rel="nofollow"
                target="_blank"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm border border-stone-200 text-black transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:border-black hover:shadow-lg hover:shadow-black/10"
              >
                <i className="fa-brands fa-x-twitter text-base text-black"></i>
              </a>
            </li>
            <li>
              <a
                href="https://www.youtube.com/channel/UCLzw8opUlMnSA2TQfj34K9w"
                aria-label="YouTube"
                rel="nofollow"
                target="_blank"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm border border-stone-200 text-[#FF0000] transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:border-[#FF0000] hover:shadow-lg hover:shadow-[#FF0000]/20"
              >
                <i className="fa-brands fa-youtube text-lg text-[#FF0000]"></i>
              </a>
            </li>
            <li>
              <a
                href="https://www.instagram.com/astroved/"
                aria-label="Instagram"
                rel="nofollow"
                target="_blank"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm border border-stone-200 text-[#E1306C] transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:border-[#E1306C] hover:shadow-lg hover:shadow-[#E1306C]/20"
              >
                <i className="fa-brands fa-instagram text-lg text-[#E1306C]"></i>
              </a>
            </li>
            <li>
              <a
                href="https://www.linkedin.com/company/astroved-com"
                aria-label="LinkedIn"
                rel="nofollow"
                target="_blank"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm border border-stone-200 text-[#0A66C2] transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:border-[#0A66C2] hover:shadow-lg hover:shadow-[#0A66C2]/20"
              >
                <i className="fa-brands fa-linkedin-in text-lg text-[#0A66C2]"></i>
              </a>
            </li>
            <li>
              <a
                href="https://whatsapp.com/channel/0029VaAG971AInPbquhYnI3u"
                aria-label="WhatsApp Channel"
                rel="nofollow"
                target="_blank"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm border border-stone-200 text-[#25D366] transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:border-[#25D366] hover:shadow-lg hover:shadow-[#25D366]/20"
              >
                <i className="fa-brands fa-whatsapp text-xl text-[#25D366]"></i>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-10 flex flex-col lg:flex-row justify-between gap-12 lg:gap-8 mb-10">
        {/* Logo Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Image
              src={priestservicesLogo}
              alt="AstroVed Priest Services"
              width={192}
              height={48}
              className="h-10 sm:h-12 w-auto object-contain grayscale-0"
              style={{ width: "auto" }}
            />
          </div>
          <p className="text-xs sm:text-sm text-stone-600 max-w-xs leading-relaxed font-medium">
            Priest Services is a spiritual platform that enables devotees to book authentic Vedic pujas at sacred temples across India.
          </p>
        </div>

        {/* EXPLORE */}
        <div>
          <h4 className="text-[#1f1a17] font-bold text-sm tracking-[0.15em] uppercase mb-6">Explore</h4>
          <ul className="flex flex-col gap-4 text-sm text-stone-600 font-medium">
            <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
            <li><Link href="/puja" className="hover:text-primary transition-colors">Puja</Link></li>
            <li><Link href="/account" className="hover:text-primary transition-colors">Account</Link></li>
          </ul>
        </div>

        {/* SUPPORT */}
        <div>
          <h4 className="text-[#1f1a17] font-bold text-sm tracking-[0.15em] uppercase mb-6">Support</h4>
          <ul className="flex flex-col gap-4 text-sm text-stone-600 font-medium">
            <li><Link href="mailto:support@astroved.com" className="hover:text-primary transition-colors">support@astroved.com</Link></li>
            <li><Link href="/account?tab=support" className="hover:text-primary transition-colors">Contact Us</Link></li>
            <li><Link href="https://wa.me/919677391109" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">WhatsApp: +91 9677391109</Link></li>
            <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link></li>
          </ul>
        </div>

        {/* CONNECT */}
        <div>
          <h4 className="text-[#1f1a17] font-bold text-sm tracking-[0.15em] uppercase mb-6">Connect</h4>
          <ul className="flex flex-col gap-6 text-sm text-stone-600 font-medium">
            <li>
              <strong className="block text-[#1f1a17] mb-1 font-semibold">Customer Care</strong>
              <a href="tel:+919677391108" className="hover:text-primary transition-colors block leading-relaxed">+91 9677391108</a>
              <a href="tel:+914443419898" className="hover:text-primary transition-colors block leading-relaxed">+91 44 43419898</a>
            </li>
            <li>
              <strong className="block text-[#1f1a17] mb-1 font-semibold">Toll Free</strong>
              <a href="tel:18001029098" className="hover:text-primary transition-colors block leading-relaxed">1800 102 9098</a>
            </li>
          </ul>
        </div>

        {/* CORPORATE OFFICE */}
        <div>
          <h4 className="text-[#1f1a17] font-bold text-sm tracking-[0.15em] uppercase mb-6">Corporate Office</h4>
          <div className="text-sm text-stone-600 font-medium leading-loose">
            6th Floor, B-Block, Prince Info Park,<br />
            2nd Main Road,<br />
            Ambattur Industrial Estate, Chennai 600058.<br /><br />
            Phone: <a href="tel:+914443419898" className="hover:text-primary transition-colors">+91-44-43419898</a>
          </div>
        </div>
      </div>

      <div className="border-t border-stone-200/80 pt-8 text-center text-xs text-stone-500 font-medium flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        <span>© 2026 Astroved PriestService. All rights reserved.</span>
      </div>
    </footer>
  );
}
