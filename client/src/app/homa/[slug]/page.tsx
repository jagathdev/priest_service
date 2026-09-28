
import { Metadata } from 'next';
import { getHomaBySlug } from '@/lib/homas';
import HomaDetailClient from './HomaDetailClient';

type Props = {
  params: Promise<{ slug: string }> | { slug: string };
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined };
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

  const homa = await getHomaBySlug(slug);

  if (!homa) {
    return {
      title: 'Homa Not Found | AstroVed Homa Seva',
      description: 'The requested homa could not be found.',
    };
  }

  const title = homa.metaTitle || `${homa.title} | AstroVed Homa Seva`;
  const description =
    homa.metaDescription ||
    homa.description ||
    homa.details?.heroSubtitle ||
    'Join us for this sacred ritual to seek divine blessings.';
  const keywords = homa.metaKeywords
    ? homa.metaKeywords.split(',').map((k: string) => k.trim())
    : ['homa', 'seva', homa.title, 'AstroVed', 'rituals'];

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      images: homa.imageUrl ? [{ url: homa.imageUrl }] : [],
    },
  };
}

import { getAllPujas } from '@/lib/pujas';

export default async function HomaDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const homa = slug ? await getHomaBySlug(slug) : null;
  const allPujas = await getAllPujas();
  const recommendations = allPujas.filter(p => (homa as any)?.recommendedPujaIds?.includes(String(p._id)));

  return <HomaDetailClient initialPuja={homa as any} recommendations={recommendations} />;
}
