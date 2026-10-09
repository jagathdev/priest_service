
import { Metadata } from 'next';
import { getHomaBySlug } from '@/lib/homas';
import HomaDetailClient from './HomaDetailClient';

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
      title: 'AstroVed Homa Seva',
      description: 'Book sacred homas and fire ritual offerings online.',
    };
  }

  const homa = await getHomaBySlug(slug);
  const formattedSlugTitle = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const title = homa?.metaTitle || (homa?.title ? `${homa.title} | AstroVed Homa Seva` : `${formattedSlugTitle} | AstroVed Homa Seva`);
  const description =
    homa?.metaDescription ||
    homa?.description ||
    homa?.details?.heroSubtitle ||
    'Join us for this sacred fire ritual to seek divine blessings.';
  const keywords = homa?.metaKeywords
    ? homa.metaKeywords.split(',').map((k: string) => k.trim())
    : ['homa', 'seva', homa?.title || formattedSlugTitle, 'AstroVed', 'rituals'];

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      images: homa?.imageUrl ? [{ url: homa.imageUrl }] : [],
    },
  };
}

import { getAllPujas } from '@/lib/pujas';
import React from 'react';

export default async function HomaDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const homa = slug ? await getHomaBySlug(slug) : null;
  const allPujas = await getAllPujas();
  const recommendations = allPujas.filter((p: any) => (homa as { recommendedPujaIds?: string[] } | null)?.recommendedPujaIds?.includes(String(p._id)));

  return <HomaDetailClient initialHoma={homa as React.ComponentProps<typeof HomaDetailClient>['initialHoma']} recommendations={recommendations} />;
}
