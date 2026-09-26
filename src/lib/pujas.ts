import clientPromise from './mongodb';

export type PujaPackage = {
  id: string;
  name: string;
  price: number;
  priceINR?: number;
  priceUSD?: number;
  priceMYR?: number;
  description: string;
  imageUrl?: string;
};

export type PujaStat = {
  label: string;
  value: string;
  detail?: string;
};

export type PujaSection = {
  title: string;
  description: string;
};

export type PujaFaq = {
  question: string;
  answer: string;
};

export type PujaDetails = {
  heroTitle: string;
  heroSubtitle: string;
  strengthFor: string;
  ritualSummary: string;
  templeName: string;
  templeLocation: string;
  templeNote?: string;
  about: string;
  stats: PujaStat[];
  benefits: PujaSection[];
  process: PujaSection[];
  inclusions: string[];
  faq: PujaFaq[];
};

export type PujaOffering = {
  id: string;
  name: string;
  price: number;
  priceINR?: number;
  priceUSD?: number;
  priceMYR?: number;
  description: string;
  imageUrl?: string;
  productId?: number;
};

export type PujaRecord = {
  _id?: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  badge?: string;
  shortTitle?: string;
  buttonText?: string;
  location?: string;
  date?: string;
  eventDateTime?: string;
  templeVenue?: string;
  templeNote?: string;
  slug?: string;
  gallery?: string[];
  details?: PujaDetails;
  packages?: PujaPackage[];
  offerings?: PujaOffering[];
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  [key: string]: unknown;
};

const normalizeOfferings = (items: unknown) => {
  if (!Array.isArray(items) || items.length === 0) {
    return [
      { id: "e1", name: "Vastra Daan", price: 501, priceINR: 501, priceUSD: 6, priceMYR: 26, description: "Offer sacred clothes to the deity", imageUrl: "https://cdn.AstroVed.com/images/puja/vastra-daan.jpg", productId: 36 },
      { id: "e2", name: "Anna Daan", price: 1101, priceINR: 1101, priceUSD: 14, priceMYR: 57, description: "Feed the needy in your name", imageUrl: "https://cdn.AstroVed.com/images/puja/anna-daan.jpg", productId: 36 },
      { id: "e3", name: "Deep Daan", price: 251, priceINR: 251, priceUSD: 3, priceMYR: 13, description: "Lighting lamps for prosperity", imageUrl: "https://cdn.AstroVed.com/images/puja/deep-daan.jpg", productId: 36 },
      { id: "e4", name: "Gau Seva", price: 501, priceINR: 501, priceUSD: 6, priceMYR: 26, description: "Feeding sacred cows", imageUrl: "https://cdn.AstroVed.com/images/puja/gau-seva.jpg", productId: 36 },
    ];
  }
  return items.map((item, index) => {
    const off = item as Partial<PujaOffering> & { productId?: number };
    const priceSource = off.priceINR ?? off.price ?? 0;
    const numericPrice = typeof priceSource === 'number' ? priceSource : Number(priceSource);
    return {
      id: off.id || `extra-${index + 1}`,
      name: off.name || "Special Offering",
      price: numericPrice,
      priceINR: typeof off.priceINR === 'number' ? off.priceINR : Number(off.priceINR || numericPrice),
      priceUSD: typeof off.priceUSD === 'number' ? off.priceUSD : Number(off.priceUSD || 0),
      priceMYR: typeof off.priceMYR === 'number' ? off.priceMYR : Number(off.priceMYR || 0),
      description: off.description || "Divine offering for the deity",
      imageUrl: off.imageUrl || "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=200&q=80",
      productId: off.productId !== undefined ? off.productId : 36
    };
  });
};

const slugify = (value: any) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const normalizeSections = (items: unknown, fallback: PujaSection[]) => {
  if (!Array.isArray(items) || items.length === 0) {
    return fallback;
  }

  return items.map((item) => {
    if (typeof item === 'string') {
      return { title: item, description: item };
    }

    if (item && typeof item === 'object') {
      const section = item as Partial<PujaSection>;
      return {
        title: section.title || section.description || fallback[0].title,
        description: section.description || section.title || fallback[0].description,
      };
    }

    return fallback[0];
  });
};

const normalizeFaq = (items: unknown, fallback: PujaFaq[]) => {
  if (!Array.isArray(items) || items.length === 0) {
    return fallback;
  }

  return items.map((item) => {
    if (typeof item === 'string') {
      return { question: item, answer: item };
    }

    if (item && typeof item === 'object') {
      const faq = item as Partial<PujaFaq>;
      return {
        question: faq.question || fallback[0].question,
        answer: faq.answer || faq.question || fallback[0].answer,
      };
    }

    return fallback[0];
  });
};

const normalizePackages = (items: unknown, fallback: PujaPackage[]) => {
  if (!Array.isArray(items) || items.length === 0) {
    return fallback;
  }

  const parsed = items
    .map((item, index) => {
      if (!item || typeof item !== 'object') {
        return null;
      }

      const pkg = item as Partial<PujaPackage> & { title?: string; amount?: number | string; priceINR?: number | string; priceUSD?: number | string; priceMYR?: number | string };
      const name = typeof pkg.name === 'string' && pkg.name.trim() ? pkg.name.trim() : pkg.title;
      const priceSource = pkg.priceINR ?? pkg.price ?? pkg.amount;
      const numericPrice = typeof priceSource === 'number' ? priceSource : Number(priceSource);

      if (!name || Number.isNaN(numericPrice)) {
        return null;
      }

      const safeId =
        typeof pkg.id === 'string' && pkg.id.trim().length > 0
          ? pkg.id.trim()
          : slugify(`${name}-${index + 1}`);

      return {
        id: safeId,
        name,
        price: numericPrice,
        priceINR: typeof pkg.priceINR === 'number' ? pkg.priceINR : Number(pkg.priceINR || 0),
        priceUSD: typeof pkg.priceUSD === 'number' ? pkg.priceUSD : Number(pkg.priceUSD || 0),
        priceMYR: typeof pkg.priceMYR === 'number' ? pkg.priceMYR : Number(pkg.priceMYR || 0),
        description:
          typeof pkg.description === 'string' && pkg.description.trim().length > 0
            ? pkg.description.trim()
            : `Recommended for ${name.toLowerCase()} devotees.`,
        imageUrl: typeof pkg.imageUrl === 'string' && pkg.imageUrl.trim().length > 0 
          ? pkg.imageUrl.trim() 
          : fallback[index]?.imageUrl,
      } as PujaPackage;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return parsed.length > 0 ? parsed : fallback;
};

const getStringField = (record: PujaRecord, key: string) => {
  const value = record[key];
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
};

const getNumberField = (record: PujaRecord, key: string) => {
  const value = record[key];
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
};

const buildFlatPackages = (puja: PujaRecord): PujaPackage[] | undefined => {
  const defaultNames = ['Individual Package', 'Partner Package', 'Family + Bhog', 'Joint Family'];
  const result: PujaPackage[] = [];

  for (let i = 1; i <= 4; i += 1) {
    const name = getStringField(puja, `package${i}Name`) || defaultNames[i - 1];
    const price = getNumberField(puja, `package${i}Price`);
    const description =
      getStringField(puja, `package${i}Description`) || `Recommended for ${name.toLowerCase()} devotees.`;
    const imageUrl = getStringField(puja, `package${i}ImageUrl`);

    if (price === undefined) continue;

    result.push({
      id: slugify(`${name}-${i}`),
      name,
      price,
      description,
      ...(imageUrl && { imageUrl }),
    });
  }

  return result.length > 0 ? result : undefined;
};

const buildSectionsFromFlatFields = (
  puja: PujaRecord,
  prefix: 'benefit' | 'process',
  fallback: PujaSection[]
) => {
  const sections: PujaSection[] = [];

  for (let i = 1; i <= 4; i += 1) {
    const title = getStringField(puja, `${prefix}${i}Title`);
    const description = getStringField(puja, `${prefix}${i}Description`);
    if (!title && !description) continue;

    sections.push({
      title: title || fallback[Math.min(i - 1, fallback.length - 1)].title,
      description: description || fallback[Math.min(i - 1, fallback.length - 1)].description,
    });
  }

  return sections.length > 0 ? sections : undefined;
};

const buildStatsFromFlatFields = (puja: PujaRecord) => {
  const stats: PujaStat[] = [];

  for (let i = 1; i <= 4; i += 1) {
    const label = getStringField(puja, `stat${i}Label`);
    const value = getStringField(puja, `stat${i}Value`);
    const detail = getStringField(puja, `stat${i}Detail`);
    if (!label && !value && !detail) continue;

    stats.push({
      label: label || defaultDetails.stats[Math.min(i - 1, defaultDetails.stats.length - 1)].label,
      value: value || defaultDetails.stats[Math.min(i - 1, defaultDetails.stats.length - 1)].value,
      detail,
    });
  }

  return stats.length > 0 ? stats : undefined;
};

const buildInclusionsFromFlatFields = (puja: PujaRecord) => {
  const inclusions: string[] = [];

  for (let i = 1; i <= 5; i += 1) {
    const inclusion = getStringField(puja, `inclusion${i}`);
    if (inclusion) inclusions.push(inclusion);
  }

  return inclusions.length > 0 ? inclusions : undefined;
};

const buildOfferingsFromFlatFields = (puja: PujaRecord): PujaOffering[] | undefined => {
  const offerings: PujaOffering[] = [];

  for (let i = 1; i <= 5; i += 1) {
    const name = getStringField(puja, `offering${i}Name`);
    const price = getNumberField(puja, `offering${i}Price`);
    const description = getStringField(puja, `offering${i}Description`);
    const imageUrl = getStringField(puja, `offering${i}ImageUrl`);

    if (name && price !== undefined) {
      offerings.push({
        id: slugify(`${name}-${i}`),
        name,
        price,
        description: description || `Recommended offering for ${name.toLowerCase()}.`,
        imageUrl: imageUrl || "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=200&q=80"
      });
    }
  }

  return offerings.length > 0 ? offerings : undefined;
};

const buildFaqFromFlatFields = (puja: PujaRecord) => {
  const faqs: PujaFaq[] = [];

  for (let i = 1; i <= 3; i += 1) {
    const question = getStringField(puja, `faq${i}Question`);
    const answer = getStringField(puja, `faq${i}Answer`);
    if (!question && !answer) continue;

    faqs.push({
      question: question || defaultDetails.faq[Math.min(i - 1, defaultDetails.faq.length - 1)].question,
      answer: answer || defaultDetails.faq[Math.min(i - 1, defaultDetails.faq.length - 1)].answer,
    });
  }

  return faqs.length > 0 ? faqs : undefined;
};

export const defaultPackages: PujaPackage[] = [
  {
    id: 'individual-package',
    name: 'Individual Package',
    price: 51,
    description: 'Best for one devotee with sankalp, mantra jaap and prasadam blessings.',
    imageUrl: 'https://cdn.create.vista.com/api/media/small/114995436/stock-photo-indian-woman-performing-puja-indian-girl-with-pooja-thali-or-puja-thali-portrait-of-a',
  },
  {
    id: 'partner-package',
    name: 'Partner Package',
    price: 81,
    description: 'For a couple or two devotees joining the puja together.',
    imageUrl: 'https://tse2.mm.bing.net/th/id/OIP.YT0kNhRDE0kIfg6BYzurBwAAAA?cb=thfc1falcon2&pid=ImgDet&w=419&h=608&rs=1&o=7&rm=3'
  },
  {
    id: 'family-bhog',
    name: 'Family + Bhog',
    price: 151,
    description: 'Family sankalp with bhog offering and temple archana included.',
    imageUrl: 'https://www.srimandir.com/_next/image?url=https%3A%2F%2Fsrm-cdn.a4b.io%2Fyoda%2F1742742465008.svg&w=640&q=75',
  },
  {
    id: 'joint-family',
    name: 'Joint Family',
    price: 221,
    description: 'Ideal for larger families seeking collective blessings and sankalp.',
    imageUrl: 'https://www.bing.com/th/id/OIP.qEZjsTuYnfH854fbC8ozVgHaEK?w=180&h=135&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2',
  },
];

export const defaultDetails: PujaDetails = {
  heroTitle: '11,00,000 Lakshmi Beej Mantra Jaap',
  heroSubtitle: '11,00,000 Lakshmi Beej Mantra Jaap, 1,10,000 Dashansh Havan and 108 Narvial Gola Purnahuti',
  strengthFor: 'For relief from financial obstacles, prosperity and stable wealth growth.',
  ritualSummary:
    'This grand mahapuja includes mantra chanting, dashansh havan, puja offerings and a special purnahuti performed by experienced pandits.',
  templeName: 'Shri Gajalakshmi Temple',
  templeLocation: 'Ujjain, Madhya Pradesh',
  templeNote: 'A revered spiritual center for prosperity and positive energy rituals.',
  about:
    'This puja is performed at a powerful Lakshmi kshetra to invoke abundance, prosperity, career growth and positive opportunities for devotees and their families.',
  stats: [
    { label: 'Mantra Jaap', value: '11,00,000', detail: 'Lakshmi Beej Mantra' },
    { label: 'Dashansh Havan', value: '1,10,000', detail: 'Special fire ritual' },
    { label: 'Purnahuti', value: '108', detail: 'Narvial Gola offering' },
    { label: 'Rating', value: '4.9/5', detail: 'Trusted by devotees' },
  ],
  benefits: [
    {
      title: 'Economic growth and stable wealth flow',
      description: 'Supports income stability, savings and long-term prosperity.',
    },
    {
      title: 'Career and business success',
      description: 'Encourages progress, recognition and new opportunities.',
    },
    {
      title: 'Removal of financial obstacles',
      description: 'Helps reduce hidden blocks, delays and recurring monetary stress.',
    },
    {
      title: 'Peace and positive energy',
      description: 'Creates a more balanced and auspicious home environment.',
    },
  ],
  process: [
    {
      title: 'Select Puja',
      description: 'Choose the package that matches your family or personal sankalp.',
    },
    {
      title: 'Add Offerings',
      description: 'Include offerings like flowers, bhog or special puja dravyas if needed.',
    },
    {
      title: 'Provide Sankalp Details',
      description: 'Enter your name and gothra so the puja is performed in your name.',
    },
    {
      title: 'Puja Updates and Video',
      description: 'Receive updates along with a puja video and completion details.',
    },
  ],
  inclusions: [
    'Experienced pandit-led ritual at the temple',
    'Your sankalp performed in your name',
    'Special mantra chanting and havan',
    'Puja update with completion details',
    'Prasadam or bhog as per selected package',
  ],
  faq: [
    {
      question: 'Do I need to be present in the temple?',
      answer: 'No. The puja is performed on your behalf and you receive the completion update remotely.',
    },
    {
      question: 'Can I book for my family?',
      answer: 'Yes. The package options include individual, partner, family + bhog and joint family options.',
    },
    {
      question: 'Will I receive a puja video?',
      answer: 'Yes. A puja update or video is shared after completion depending on the package and booking flow.',
    },
  ],
};

export const fallbackPujas: PujaRecord[] = [
  {
    title: '11,00,000 Lakshmi Beej Mantra Jaap | 19th April 26',
    shortTitle: 'Akshaya Tritiya Special',
    subtitle: 'MAHAMANTRA ANUSH TTHI DEEP PUJA',
    badge: 'Special Event',
    description:
      'Become part of this rare grand mahapuja and receive divine blessings for wealth and prosperity.',
    imageUrl:
      'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&w=1600&q=80',
    location: 'Shri Gajalakshmi Temple, Ujjain, Madhya Pradesh',
    date: '19-04-2026',
    eventDateTime: '2026-04-19T18:30',
    buttonText: 'Participate',
    slug: '1100000-lakshmi-beej-mantra-jaap-19th-april-26',
    details: defaultDetails,
    packages: defaultPackages,
  },
];

export const normalizePuja = (puja: any, offeringsMap: Record<string, any> = {}) => {
  const record = puja as PujaRecord;
  return {
    ...record,
    title: record.title || 'Untitled Puja',
    _id: record._id ? String(record._id) : slugify(record.title || 'Untitled Puja'),
    buttonText: record.buttonText || 'Participate',
    imageUrl:
      record.imageUrl ||
      'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&w=1600&q=80',
    slug: record.slug || slugify(record.title || 'Untitled Puja'),
    gallery: Array.isArray(record.gallery) && record.gallery.length > 0 ? record.gallery : undefined,
    eventDateTime: getStringField(record, 'eventDateTime') || undefined,
    details: (() => {
      const flatDetails = {
        heroTitle: getStringField(record, 'heroTitle'),
        heroSubtitle: getStringField(record, 'heroSubtitle'),
        strengthFor: getStringField(record, 'strengthFor'),
        ritualSummary: getStringField(record, 'ritualSummary'),
        about: getStringField(record, 'about'),
        templeName: getStringField(record, 'templeVenue') || getStringField(record, 'templeName'),
        templeLocation: getStringField(record, 'templeLocation') || record.location,
        templeNote: getStringField(record, 'templeNote'),
        stats: buildStatsFromFlatFields(record),
        benefits: buildSectionsFromFlatFields(record, 'benefit', defaultDetails.benefits),
        process: buildSectionsFromFlatFields(record, 'process', defaultDetails.process),
        inclusions: buildInclusionsFromFlatFields(record),
        faq: buildFaqFromFlatFields(record),
      };

      return {
        ...defaultDetails,
        ...(record.details || {}),
        ...Object.fromEntries(Object.entries(flatDetails).filter(([, value]) => value !== undefined)),
        benefits: normalizeSections(record.benefits ?? flatDetails.benefits ?? record.details?.benefits, defaultDetails.benefits),
        process: normalizeSections(record.process ?? flatDetails.process ?? record.details?.process, defaultDetails.process),
        faq: normalizeFaq(record.faq ?? flatDetails.faq ?? record.details?.faq, defaultDetails.faq),
        inclusions:
          Array.isArray(record.inclusions) && record.inclusions.length > 0
            ? record.inclusions
            : Array.isArray(flatDetails.inclusions) && flatDetails.inclusions.length > 0
              ? flatDetails.inclusions
              : Array.isArray(record.details?.inclusions) && record.details?.inclusions.length > 0
                ? record.details!.inclusions.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
                : defaultDetails.inclusions,
        stats:
          Array.isArray(record.stats) && record.stats.length > 0
            ? record.stats
            : Array.isArray(flatDetails.stats) && flatDetails.stats.length > 0
              ? flatDetails.stats
              : Array.isArray(record.details?.stats) && record.details?.stats.length > 0
                ? record.details!.stats
                : defaultDetails.stats,
        templeName:
          flatDetails.templeName || record.details?.templeName || record.templeVenue || defaultDetails.templeName,
        templeLocation:
          flatDetails.templeLocation || record.details?.templeLocation || record.location || defaultDetails.templeLocation,
        templeNote: flatDetails.templeNote || record.details?.templeNote || record.templeNote || defaultDetails.templeNote,
      };
    })(),
    packages: normalizePackages(Array.isArray(record.packages) && record.packages.length > 0 ? record.packages : buildFlatPackages(record), defaultPackages),
    offerings: Array.isArray(record.offeringIds) && record.offeringIds.length > 0
      ? record.offeringIds.map((id: string) => offeringsMap[id]).filter(Boolean).map((o: any) => ({
        id: String(o._id),
        name: o.name,
        price: o.priceINR || o.price || 0,
        priceINR: o.priceINR,
        priceUSD: o.priceUSD,
        priceMYR: o.priceMYR,
        badge: o.badge,
        description: o.description,
        imageUrl: o.imageUrl,
        productId: o.productId !== undefined ? Number(o.productId) : 36
      }))
      : normalizeOfferings(Array.isArray(record.offerings) && record.offerings.length > 0 ? record.offerings : buildOfferingsFromFlatFields(record)),
  };
};

export async function getAllPujas() {
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection('puja');

  const items = await collection.find({}).toArray();

  const offeringsCollection = db.collection('offering');
  const offeringsData = await offeringsCollection.find({}).toArray();
  const offeringsMap = Object.fromEntries(offeringsData.map(o => [String(o._id), o]));

  const normalized = (items as any[]).map(p => normalizePuja(p, offeringsMap));
  const allPujas = normalized.length > 0 ? normalized : fallbackPujas.map(p => normalizePuja(p, offeringsMap));

  return allPujas.filter(
    (item: any) => String(item.status || "active").toLowerCase() !== "inactive"
  );
}

export async function getPujaBySlug(slug: string) {
  const allPujas = await getAllPujas();
  const found = allPujas.find((p) => p.slug === slug);
  return found || null;
}
