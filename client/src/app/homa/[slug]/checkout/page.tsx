import { getHomaBySlug } from '@/lib/homas';
import CheckoutClient from './CheckoutClient';
import { notFound } from 'next/navigation';

export default async function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const homa = await getHomaBySlug(slug);

  if (!homa) {
    return notFound();
  }

  return <CheckoutClient homa={homa} />;
}
