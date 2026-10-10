export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UserAddress {
  _id?: string;
  type: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

export interface User {
  _id: string;
  mobileNumber: string;
  name: string;
  email: string;
  isVerified: boolean;
  walletBalance: number;
  addresses: UserAddress[];
  role: "user" | "admin";
  createdAt: string;
  updatedAt: string;
}

export interface ServiceBenefit {
  title: string;
  description: string;
}

export interface ServiceProcess {
  title: string;
  description: string;
}

export interface ServiceFaq {
  question: string;
  answer: string;
}

export interface ServicePackage {
  name: string;
  priceINR: number;
  priceUSD: number;
  priceMYR: number;
  description: string;
}

export interface ServiceOffering {
  _id?: string;
  name: string;
  priceINR: number;
  description: string;
  imageUrl: string;
  badge: string;
}

export interface Service {
  _id: string;
  type: "puja" | "homa";
  title: string;
  productId?: number;
  status: "active" | "inactive";
  slug: string;
  shortTitle: string;
  subtitle: string;
  badge: string;
  description: string;
  imageUrl: string;
  additionalImages: string[];
  location: string;
  templeVenue: string;
  templeNote: string;
  basePrice: number;
  extraParticipantPrice: number;
  maxParticipants: number;
  isActive: boolean;
  displayOrder: number;
  eventDate?: string | null;
  deity: string;
  tithis: string;
  dosha: string;
  benefit: string;
  filterLocation: string;
  date: string;
  eventDateTime: string;
  buttonText: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  heroTitle: string;
  heroSubtitle: string;
  strengthFor: string;
  ritualSummary: string;
  about: string;
  templeLocation: string;
  gallery: string[];
  benefits: ServiceBenefit[];
  process: ServiceProcess[];
  inclusions: string[];
  faq: ServiceFaq[];
  packages: ServicePackage[];
  offerings: ServiceOffering[];
  recommendedServiceIds: string[];
  sectionOrder: string[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderParticipant {
  name: string;
}

export interface OrderPricing {
  basePrice: number;
  extraParticipantCount: number;
  extraParticipantAmount: number;
  convenienceFee: number;
  panditFee: number;
  recordingFee: number;
  total: number;
  currency: string;
}

export interface OrderPaymentDetails {
  transactionId?: string;
  paymentMethod?: string;
  paymentDate?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  pooja: string;
  serviceId: string;
  serviceType: "Pooja" | "Homa";
  customer: string;
  customerName: string;
  itemName: string;
  mobileNumber: string;
  whatsappNumber: string;
  participants: OrderParticipant[];
  gotra: string;
  doesNotKnowGotra: boolean;
  wish: string;
  pricing: OrderPricing;
  bookingDate: string;
  paymentDetails: OrderPaymentDetails;
  razorpayOrderId?: string;
  promoCode: string;
  promoCodeId?: string;
  originalAmount: number;
  discountAmount: number;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  orderStatus: "created" | "confirmed" | "scheduled" | "performed" | "completed" | "cancelled";
  scheduledDate?: string | null;
  videoLink: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  _id: string;
  order: string;
  provider: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  signature?: string;
  amount: number;
  status: "created" | "captured" | "failed" | "refunded";
  method?: string;
  rawEvent?: unknown;
  paidAt?: string;
  refundedAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PromoCode {
  _id: string;
  code: string;
  description: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  maxDiscount?: number | null;
  minimumOrderAmount: number;
  startDate: string;
  endDate: string;
  usageLimit?: number | null;
  usedCount: number;
  usageLimitPerUser: number;
  applicableServices: "ALL" | "POOJA" | "HOMA";
  applicablePackages: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HeroBannerCta {
  text: string;
  url: string;
}

export interface HeroBanner {
  _id: string;
  tagLine: string;
  title: string;
  description: string;
  cta: HeroBannerCta;
  imageUrl: string;
  isActive: boolean;
  displayOrder: number;
  eventDateTime: string;
  location: string;
  templeVenue: string;
  eventDateText: string;
  createdAt: string;
  updatedAt: string;
}

export interface WishlistItem {
  _id: string;
  userId: string;
  serviceId: string;
  serviceType: "pooja" | "homa";
  createdAt: string;
  updatedAt: string;
}
