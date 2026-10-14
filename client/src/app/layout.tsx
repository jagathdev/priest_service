import type { Metadata, Viewport } from "next";
import "./globals.css";
import type { ReactNode } from "react";
import GlobalChrome from "@/components/layout/GlobalChrome";
import { Providers } from "./Providers";
import { cookies } from "next/headers";
import Script from "next/script";

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

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const mockUserCookie = cookieStore.get("mockUser");

  let serverUser = null;
  if (mockUserCookie && mockUserCookie.value) {
    try {
      serverUser = JSON.parse(decodeURIComponent(mockUserCookie.value));
    } catch (e) {
      console.error("Failed to parse mockUser cookie on server", e);
    }
  }

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
        <link rel="icon" type="image/png" href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABiElEQVR4AWIgDP4zMpALQkP/M2dkADgnB5iKojAAZ9uuKXtmNqYasq7SkG1raq6xIWtqRrZryjae1X/3zsvedvx/3zGnqLxcJPMvAUFwIkDAx3F2yJ9hHBepgGAbBCIoVzIyRIp/FLBzaFicuEJop/0BZhgDdIEETFQe4/i93q8EALcj6AHH+SHQZtBtiuI0/QhDkDMEs5CgRnyY7DZ0Fo8Uxbb5EqavC4JGEXyQlnaoy+3Tw7PJBwNYxSmS9Hz5NjCMHQRBAkhCkmRhvH6dQE6nEYc1oOdJkuxMJObhOMvrA0xfEwwuo1nmh3Ib1BkNZouP+ZYCZpPZVEfukDr0ryHJNFyz/PuDo8QzcwQEwfO7L7CIZ+RbCR8LLAWPUD7kW0RSFD9cskIc58Y/w8nJIh1Y4jGyD5WXl8s8FBjpAzwPScAosJq4zbfQps8IJhpDcbvR0SINyZPNg3QAkl0M4zhIxIxCS2MQdNGyV2/EHeA9Oh5uJwN9mnUF+DhPA2Ni0glMLTgcKAUAst8Rb7CK94wAAAAASUVORK5CYII=" />
        <meta id="meta-robots" name="robots" content="index, follow" />
        <Script
          id="meta-robots-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if (window.location.search && window.location.search.length > 1) {
                document.getElementById("meta-robots").setAttribute("content", "noindex, follow");
              }
            `,
          }}
        />
        <Script
          id="json-ld-script"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              {
                "@context": "https://schema.org",
                "@type": "WebPage",
                "name": "Priest Services | Sacred Pujas & Rituals by AstroVed",
                "description": "Book authentic Vedic pujas, homas, and ritual services online. Expert priests for your spiritual and religious needs.",
                "url": "https://www.priestservices.astroved.com/",
                "publisher": {
                  "@type": "Organization",
                  "name": "AstroVed",
                  "url": "https://www.astroved.com"
                }
              }
            `,
          }}
        />

        {/* jQuery (Required for GTM Custom Tags) */}
        <Script
          id="jquery-cdn"
          src="https://code.jquery.com/jquery-3.7.1.min.js"
          strategy="beforeInteractive"
        />

        <Script
          id="gtm-script"
          strategy="beforeInteractive"
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
                function removeChatAndPushWidgets() {
                  // Hide chat and webpushr elements by selectors
                  var nodes = document.querySelectorAll(
                    '#prime, #chatWidget, .chat-widget-container, .chat-popup-box, .chat-toggle-button, [class*="chat_fem"], [class*="chat-fem"], [class*="chatfem"], .ico-chat, .ico_chat, .ico_whatsapp, [id^="webpushr"], [class*="webpushr"], #webpushr-prompt-wrapper, .webpushr-prompt, .webpushr-bell'
                  );
                  nodes.forEach(function(el) {
                    el.style.setProperty('display', 'none', 'important');
                    el.style.setProperty('visibility', 'hidden', 'important');
                    el.style.setProperty('opacity', '0', 'important');
                    el.style.setProperty('pointer-events', 'none', 'important');
                  });

                  // Scan floating/fixed prompt boxes containing the subscription text or greeting text
                  var allElements = document.querySelectorAll('div, p, span, a, section');
                  for (var i = 0; i < allElements.length; i++) {
                    var el = allElements[i];
                    var text = el.innerText || el.textContent || '';
                    if (
                      (text.indexOf('How can I help you') !== -1 && text.length < 120) ||
                      (text.indexOf('Subscribe now') !== -1 && text.length < 200) ||
                      (text.indexOf('timely updates on our events') !== -1 && text.length < 250)
                    ) {
                      var parent = el;
                      for (var j = 0; j < 5; j++) {
                        if (parent && parent.parentElement && parent !== document.body) {
                          var style = window.getComputedStyle(parent);
                          if (
                            style.position === 'fixed' ||
                            style.position === 'absolute' ||
                            parent.id === 'prime' ||
                            (parent.className && typeof parent.className === 'string' && (parent.className.indexOf('chat') !== -1 || parent.className.indexOf('webpushr') !== -1 || parent.className.indexOf('prompt') !== -1))
                          ) {
                            parent.style.setProperty('display', 'none', 'important');
                            parent.style.setProperty('visibility', 'hidden', 'important');
                            break;
                          }
                          parent = parent.parentElement;
                        }
                      }
                      el.style.setProperty('display', 'none', 'important');
                    }
                  }
                }

                if (typeof window !== 'undefined') {
                  window.addEventListener('DOMContentLoaded', removeChatAndPushWidgets);
                  setInterval(removeChatAndPushWidgets, 500);
                  var observer = new MutationObserver(function() {
                    removeChatAndPushWidgets();
                  });
                  if (document.body) {
                    observer.observe(document.body, { childList: true, subtree: true });
                  } else {
                    document.addEventListener('DOMContentLoaded', function() {
                      observer.observe(document.body, { childList: true, subtree: true });
                    });
                  }
                }
              })();
            `,
          }}
        />
      </head>
      <body className="flex flex-col min-h-screen">
        <noscript>
          <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TRS65PJ" height="0" width="0" style={{ display: "none", visibility: "hidden" }}></iframe>
        </noscript>
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
