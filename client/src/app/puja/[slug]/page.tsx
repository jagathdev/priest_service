export const dynamic = "force-dynamic";
export const revalidate = 0;

import { Metadata } from 'next';
import { getPujaBySlug } from '@/lib/pujas';
import PujaDetailClient from './PujaDetailClient';

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
    (puja as any)?.image ||
    "https://www.priestservices.astroved.com/api/images/shani-puja.png";

  const absoluteImageUrl = rawImageUrl.startsWith("http")
    ? rawImageUrl
    : `https://www.priestservices.astroved.com${rawImageUrl.startsWith("/") ? "" : "/"}${rawImageUrl}`;

  const canonicalUrl = `https://www.priestservices.astroved.com/puja/${slug}`;

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

import { getAllHomas } from '@/lib/homas';

export default async function PujaDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const puja = slug ? await getPujaBySlug(slug) : null;
  const allHomas = await getAllHomas();
  const recommendations = allHomas.filter((h: { _id?: string | number | undefined }) => {
    const recommendedIds = (puja as { recommendedHomaIds?: string[] } | null)?.recommendedHomaIds;
    return recommendedIds?.includes(String(h._id));
  });

  return <PujaDetailClient initialPuja={puja as React.ComponentProps<typeof PujaDetailClient>['initialPuja']} recommendations={recommendations} />;
}
