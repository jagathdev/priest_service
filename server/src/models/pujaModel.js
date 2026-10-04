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

const pujaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Puja title is required"],
      trim: true,
    },
    productId: { type: Number },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    slug: { type: String, default: "" },
    shortTitle: { type: String, default: "" },
    subtitle: { type: String, default: "" },
    badge: { type: String, default: "" },
    description: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    location: { type: String, default: "" },
    templeVenue: { type: String, default: "" },
    templeNote: { type: String, default: "" },

    // Filters
    deity: { type: String, default: "" },
    tithis: { type: String, default: "" },
    dosha: { type: String, default: "" },
    benefit: { type: String, default: "" },
    filterLocation: { type: String, default: "" },

    // Dates & Display
    date: { type: String, default: "" },
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
    recommendedHomaIds: [{ type: String }],
    sectionOrder: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

const Puja = mongoose.model("Puja", pujaSchema);

export default Puja;
