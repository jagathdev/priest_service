/**
 * Order & Booking Type Definitions
 */

export type OrderStatus =
  | "created"
  | "confirmed"
  | "scheduled"
  | "performed"
  | "completed"
  | "cancelled"
  | "paid"
  | "pending";

export type PaymentStatus = "pending" | "paid" | "completed" | "failed" | "refunded";

export interface DevoteeParticipant {
  name: string;
  rashi?: string;
  nakshatra?: string;
  gothra?: string;
  relationship?: string;
  dob?: string;
  timeOfBirth?: string;
  placeOfBirth?: string;
}

export interface OrderItemRecord {
  _id: string;
  orderId?: string;
  displayOrderId?: string;
  customerName?: string;
  name?: string;
  customerEmail?: string;
  customerPhone?: string;
  serviceType?: "puja" | "homa" | "PUJA" | "HOMA";
  type?: string;
  serviceTitle?: string;
  itemName?: string;
  pooja?: {
    _id?: string;
    title?: string;
    name?: string;
    slug?: string;
    price?: number;
  } | string;
  amount?: number;
  pricing?: {
    basePrice?: number;
    total?: number;
    discount?: number;
  };
  orderStatus?: OrderStatus;
  paymentStatus?: PaymentStatus;
  bookingDate?: string;
  scheduledDate?: string;
  createdAt?: string;
  updatedAt?: string;
  participants?: DevoteeParticipant[];
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  videoLink?: string;
  sankalpamNotes?: string;
  specialInstructions?: string;
  priestNotes?: string;
}
