export interface ServicePackage {
  id: string;
  name: string;
  priceINR: number;
  listPriceINR?: number;
  priceUSD?: number;
  priceMYR?: number;
  description?: string;
  imageUrl?: string;
  devoteeCount?: string;
  discountPercent?: string;
}

export interface ServiceDetailData {
  _id: string;
  title: string;
  subtitle?: string;
  shortTitle?: string;
  description?: string;
  badge?: string;
  buttonText?: string;
  imageUrl: string;
  additionalImages?: string[];
  bannerImage?: string;
  videoUrl?: string;
  videoTitle?: string;
  date?: string;
  time?: string;
  eventDateTime?: string;
  showTimer?: boolean;
  devoteeCount?: number;
  packages?: ServicePackage[];
  about?: string;
  howToBook?: { stepNumber: number; title: string; description: string }[];
  whenToDo?: { title: string; description: string }[];
  benefits?: { title: string; description: string }[];
  process?: { title: string; description: string }[];
  templeVenue?: string;
  templeLocation?: string;
  templeImage?: string;
  templeNote?: string;
  inclusions?: string[];
  faq?: { question: string; answer: string }[];
  gallery?: string[];
  trustBadges?: string[];
  details?: {
    benefits?: { title: string; description: string }[];
    templeLocation?: string;
    templeName?: string;
    imageUrl?: string;
  };
  [key: string]: any;
}
