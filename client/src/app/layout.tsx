import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Playfair_Display, Outfit } from "next/font/google";
import "./globals.css";
import type { ReactNode } from "react";
import GlobalChrome from "@/components/layout/GlobalChrome";
import { Providers } from "./Providers";
import { cookies } from "next/headers";
import Script from "next/script";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Priest Services | Sacred Pujas & Rituals by AstroVed",
  description: "Book authentic Vedic pujas, homas, and ritual services online. Expert priests for your spiritual and religious needs.",
  keywords: "Priest services, Vedic puja online, Homa booking, Expert Hindu priests, Online rituals, AstroVed priest services, Authentic Vedic rituals",
  alternates: {
    canonical: "https://www.priestservices.astroved.com/",
  },
  openGraph: {
    type: "website",
    url: "https://www.priestservices.astroved.com/",
    title: "Priest Services | Sacred Pujas & Rituals by AstroVed",
    description: "Book authentic Vedic pujas, homas, and ritual services online. Expert priests for your spiritual and religious needs.",
    images: ["https://www.astroved.com/images/assets/priest-services-og-image.jpg"],
    siteName: "AstroVed",
  },
  twitter: {
    card: "summary_large_image",
    title: "Priest Services | Sacred Pujas & Rituals by AstroVed",
    description: "Book authentic Vedic pujas, homas, and ritual services online. Expert priests for your spiritual and religious needs.",
    images: ["https://www.astroved.com/images/assets/priest-services-og-image.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Priest Services | Sacred Pujas & Rituals by AstroVed",
  description: "Book authentic Vedic pujas, homas, and ritual services online. Expert priests for your spiritual and religious needs.",
  url: "https://www.priestservices.astroved.com/",
  publisher: {
    "@type": "Organization",
    name: "AstroVed",
    url: "https://www.astroved.com",
  },
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const mockUserCookie = cookieStore.get("mockUser");
  const tokenCookie = cookieStore.get("token") || cookieStore.get("adminToken");

  let serverUser = null;
  if (tokenCookie?.value && mockUserCookie?.value) {
    try {
      serverUser = JSON.parse(decodeURIComponent(mockUserCookie.value));
    } catch (e) {
      console.error("Failed to parse mockUser cookie on server", e);
    }
  }


  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${playfairDisplay.variable} ${outfit.variable}`}>
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
        <link rel="icon" type="image/png" href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABiElEQVR4AWIgDP4zMpALQkP/M2dkADgnB5iKojAAZ9uuKXtmNqYasq7SkG1raq6xIWtqRrZryjae1X/3zsvedvx/3zGnqLxcJPMvAUFwIkDAx3F2yJ9hHBepgGAbBCIoVzIyRIp/FLBzaFicuEJop/0BZhgDdIEETFQe4/i93q8EALcj6AHH+SHQZtBtiuI0/QhDkDMEs5CgRnyY7DZ0Fo8Uxbb5EqavC4JGEXyQlnaoy+3Tw7PJBwNYxSmS9Hz5NjCMHQRBAkhCkmRhvH6dQE6nEYc1oOdJkuxMJObhOMvrA0xfEwwuo1nmh3Ib1BkNZouP+ZYCZpPZVEfukDr0ryHJNFyz/PuDo8QzcwQEwfO7L7CIZ+RbCR8LLAWPUD7kW0RSFD9cskIc58Y/w8nJIh1Y4jGyD5WXl8s8FBjpAzwPScAosJq4zbfQps8IJhpDcbvR0SINyZPNg3QAkl0M4zhIxIxCS2MQdNGyV2/EHeA9Oh5uJwN9mnUF+DhPA2Ni0glMLTgcKAUAst8Rb7CK94wAAAAASUVORK5CYII=" />
        <meta id="meta-robots" name="robots" content="index, follow" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="flex flex-col min-h-screen">
        <noscript>
          <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TRS65PJ" height="0" width="0" style={{ display: "none", visibility: "hidden" }}></iframe>
        </noscript>

        <Script
          id="meta-robots-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if (window.location.search && window.location.search.length > 1) {
                var metaEl = document.getElementById("meta-robots");
                if (metaEl) {
                  metaEl.setAttribute("content", "noindex, follow");
                }
              }
            `,
          }}
        />

        {/* jQuery (Required for GTM Custom Tags) */}
        <Script
          id="jquery-cdn"
          src="https://code.jquery.com/jquery-3.7.1.min.js"
          strategy="afterInteractive"
        />

        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function (w, d, s, l, i) {
                w[l] = w[l] || [];
                w[l].push({
                  'gtm.start': new Date().getTime(),
                  event: 'gtm.js'
                });
                var f = d.getElementsByTagName(s)[0],
                  j = d.createElement(s),
                  dl = l !== 'dataLayer' ? '&l=' + l : '';
                j.async = true;
                j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
                f.parentNode.insertBefore(j, f);
              })(window, document, 'script', 'dataLayer', 'GTM-TRS65PJ');
            `,
          }}
        />
        <Script
          id="cookie-analytics-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              function getCookie(name) {
                var match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
                return match ? match[2] : null;
              }

              var cId = getCookie("C_Id");
              var pageLanguage = "en-US";

              window.dataLayer = window.dataLayer || [];
              window.dataLayer.push({
                event: "page_view",
                page_name: document.title || "",
                page_url: window.location.href,
                user_id: cId || 0,
                language: pageLanguage
              });
            `,
          }}
        />
        <Script
          id="suppress-chat-widget-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var isSuppressed = false;
                function removeChatAndPushWidgets() {
                  try {
                    // Hide chat and webpushr elements by specific selectors
                    var nodes = document.querySelectorAll(
                      '#prime, #chatWidget, .chat-widget-container, .chat-popup-box, .chat-toggle-button, [class*="chat_fem"], [class*="chat-fem"], [class*="chatfem"], .ico-chat, .ico_chat, .ico_whatsapp, [id^="webpushr"], [class*="webpushr"], #webpushr-prompt-wrapper, .webpushr-prompt, .webpushr-bell'
                    );
                    for (var k = 0; k < nodes.length; k++) {
                      var n = nodes[k];
                      if (n && n.style) {
                        n.style.setProperty('display', 'none', 'important');
                        n.style.setProperty('visibility', 'hidden', 'important');
                        n.style.setProperty('opacity', '0', 'important');
                        n.style.setProperty('pointer-events', 'none', 'important');
                      }
                    }

                    // Only scan direct top-level children of body where 3rd party scripts inject floating overlays
                    if (document.body && document.body.children) {
                      var bodyChildren = document.body.children;
                      for (var i = 0; i < bodyChildren.length; i++) {
                        var child = bodyChildren[i];
                        if (!child || child.id === '__next' || child.tagName === 'SCRIPT' || child.tagName === 'LINK' || child.tagName === 'MAIN') continue;
                        var childId = (child.id || '').toLowerCase();
                        var childClass = (typeof child.className === 'string' ? child.className : '').toLowerCase();
                        if (
                          childId.indexOf('prime') !== -1 ||
                          childId.indexOf('chat') !== -1 ||
                          childId.indexOf('webpushr') !== -1 ||
                          childClass.indexOf('chat') !== -1 ||
                          childClass.indexOf('webpushr') !== -1
                        ) {
                          child.style.setProperty('display', 'none', 'important');
                          child.style.setProperty('visibility', 'hidden', 'important');
                        }
                      }
                    }
                  } catch (e) {}
                }

                if (typeof window !== 'undefined') {
                  if (document.readyState === 'loading') {
                    window.addEventListener('DOMContentLoaded', removeChatAndPushWidgets);
                  } else {
                    removeChatAndPushWidgets();
                  }

                  // Throttled observer that runs at most once every 1500ms
                  var scheduled = false;
                  function scheduleRemoval() {
                    if (scheduled) return;
                    scheduled = true;
                    setTimeout(function() {
                      scheduled = false;
                      removeChatAndPushWidgets();
                    }, 1500);
                  }

                  if (typeof MutationObserver !== 'undefined' && document.body) {
                    var observer = new MutationObserver(scheduleRemoval);
                    observer.observe(document.body, { childList: true });
                  }
                }
              })();
            `,
          }}
        />

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
