import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://priestservices.astroved.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/account', '/admin', '/payment'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
