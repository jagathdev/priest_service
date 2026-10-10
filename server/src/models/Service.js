import mongoose from "mongoose";

const benefitSchema = new mongoose.Schema({
  title: { type: String, default: "" },
  description: { type: String, default: "" },
}, { _id: false });

const processSchema = new mongoose.Schema({
  title: { type: String, default: "" },
  description: { type: String, default: "" },
}, { _id: false });

const faqSchema = new mongoose.Schema({
  question: { type: String, default: "" },
  answer: { type: String, default: "" },
}, { _id: false });

const packageSchema = new mongoose.Schema({
  name: { type: String, default: "" },
  priceINR: { type: Number, default: 0 },
  priceUSD: { type: Number, default: 0 },
  priceMYR: { type: Number, default: 0 },
  description: { type: String, default: "" },
}, { _id: false });

const offeringSchema = new mongoose.Schema({
  name: { type: String, default: "" },
  priceINR: { type: Number, default: 0 },
  description: { type: String, default: "" },
  imageUrl: { type: String, default: "" },
  badge: { type: String, default: "" },
});

const serviceSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["puja", "homa"], required: true },
    title: { type: String, required: [true, "Title is required"], trim: true },
    productId: { type: Number },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    slug: { type: String, required: true, unique: true },
    shortTitle: { type: String, default: "" },
    subtitle: { type: String, default: "" },
    badge: { type: String, default: "" },
    description: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    additionalImages: [{ type: String }],
    location: { type: String, default: "" },
    templeVenue: { type: String, default: "" },
    templeNote: { type: String, default: "" },

    // Pricing & Booking
    basePrice: { type: Number, required: true, min: 0 },
    extraParticipantPrice: { type: Number, default: 0, min: 0 },
    maxParticipants: { type: Number, default: 10 },
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
    eventDate: { type: Date, default: null },

    // Filters
    deity: { type: String, default: "" },
    tithis: { type: String, default: "" },
    dosha: { type: String, default: "" },
    benefit: { type: String, default: "" },
    filterLocation: { type: String, default: "" },

    // Dates & Display
    date: { type: String, default: "" }, // Will migrate to eventDate, keeping for legacy if needed
    eventDateTime: { type: String, default: "" },
    buttonText: { type: String, default: "" },

    // SEO
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    metaKeywords: { type: String, default: "" },

    // Details Content
    heroTitle: { type: String, default: "" },
    heroSubtitle: { type: String, default: "" },
    strengthFor: { type: String, default: "" },
    ritualSummary: { type: String, default: "" },
    about: { type: String, default: "" },
    templeLocation: { type: String, default: "" },

    // Arrays & Nested Structures
    gallery: [{ type: String }],
    benefits: [benefitSchema],
    process: [processSchema],
    inclusions: [{ type: String }],
    faq: [faqSchema],
    packages: [packageSchema],
    offerings: [offeringSchema],
    recommendedServiceIds: [{ type: String }],
    sectionOrder: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

serviceSchema.index({ type: 1, isActive: 1, eventDate: 1 });
serviceSchema.index({ slug: 1 }, { unique: true });

const Service = mongoose.models.Service || mongoose.model("Service", serviceSchema);
export default Service;
