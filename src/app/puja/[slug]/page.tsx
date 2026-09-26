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

  if (!puja) {
    return {
      title: 'Puja Not Found | AstroVed Puja Seva',
      description: 'The requested puja could not be found.',
    };
  }

  const title = puja.metaTitle || `${puja.title} | AstroVed Puja Seva`;
  const description =
    puja.metaDescription ||
    puja.description ||
    puja.details?.heroSubtitle ||
    'Join us for this sacred ritual to seek divine blessings.';
  const keywords = puja.metaKeywords
    ? puja.metaKeywords.split(',').map((k: string) => k.trim())
    : ['puja', 'seva', puja.title, 'AstroVed', 'rituals'];

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      images: puja.imageUrl ? [{ url: puja.imageUrl }] : [],
    },
  };
}

import { getAllHomas } from '@/lib/homas';

export default async function PujaDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const puja = slug ? await getPujaBySlug(slug) : null;
  const allHomas = await getAllHomas();
  const recommendations = allHomas.filter(h => (puja as any)?.recommendedHomaIds?.includes(String(h._id)));

  return <PujaDetailClient initialPuja={puja as any} recommendations={recommendations} />;
}
