export const revalidate = 60;

import { Metadata } from 'next';
import { getPujaBySlug } from '@/lib/pujas';

import { resolveAbsoluteImageUrl } from '@/config/images.config';

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  if (!slug) {
    return {
      title: 'AstroVed Puja Seva',
      description: 'Book sacred pujas and ritual offerings online.',
    };
  }

  const puja = await getPujaBySlug(slug);
  const formattedSlugTitle = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const title = puja?.metaTitle || (puja?.title ? `${puja.title} | AstroVed Puja Seva` : `${formattedSlugTitle} | AstroVed Puja Seva`);
  const description =
    puja?.metaDescription ||
    puja?.description ||
    puja?.details?.heroSubtitle ||
    'Join us for this sacred ritual to seek divine blessings.';
  const keywords = puja?.metaKeywords
    ? puja.metaKeywords.split(',').map((k: string) => k.trim())
    : ['puja', 'seva', puja?.title || formattedSlugTitle, 'AstroVed', 'rituals'];

  const rawImageUrl =
    puja?.imageUrl ||
    (puja as any)?.details?.heroImage ||
    (puja as any)?.image;

  const absoluteImageUrl = resolveAbsoluteImageUrl(rawImageUrl);
  const canonicalUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}puja/${slug}`;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'website',
      url: canonicalUrl,
      title,
      description,
      siteName: 'Priest Services | AstroVed',
      images: [
        {
          url: absoluteImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [absoluteImageUrl],
    },
  };
}

import ServiceDetailClient from '@/components/service-detail/ServiceDetailClient';

export default async function PujaDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const puja = slug ? await getPujaBySlug(slug) : null;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';

  return (
    <ServiceDetailClient
      serviceType="puja"
      initialItem={puja as any}
      apiEndpoint={`${baseUrl}/api/pujas`}
    />
  );
}
