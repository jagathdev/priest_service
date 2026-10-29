import ContentManager from "@/components/admin/ContentManager";

/** Module-level stable reference — inline arrays in the component body change every render and break filter memoization. */
const HOMA_ADMIN_FILTER_GROUPS = [
  {
    label: "Deity",
    options: [
      { value: "All" },
      { value: "Ganapathi", keywords: ["ganapathi", "ganesh", "ganesha", "vinayaka"] },
      { value: "Lakshmi", keywords: ["lakshmi", "laxmi"] },
      { value: "Shiva", keywords: ["shiva", "mahadev"] },
      { value: "Vishnu", keywords: ["vishnu", "narayan"] },
      { value: "Hanuman", keywords: ["hanuman", "anjaneya"] },
      { value: "Durga", keywords: ["durga", "devi", "kali"] },
      { value: "Saraswati", keywords: ["saraswati", "saraswathi"] },
    ],
  },
  {
    label: "Tithis",
    options: [
      { value: "All" },
      { value: "Ekadashi", keywords: ["ekadashi"] },
      { value: "Purnima", keywords: ["purnima", "poornima"] },
      { value: "Amavasya", keywords: ["amavasya"] },
      { value: "Pradosh", keywords: ["pradosh", "pradosham"] },
      { value: "Navami", keywords: ["navami"] },
    ],
  },
  {
    label: "Dosha",
    options: [
      { value: "All" },
      { value: "Mangal Dosha", keywords: ["mangal", "manglik"] },
      { value: "Kala Sarpa", keywords: ["kala sarpa", "kalasarpa"] },
      { value: "Pitru Dosha", keywords: ["pitru", "pitra"] },
      { value: "Shani Dosha", keywords: ["shani", "sade sati"] },
    ],
  },
  {
    label: "Benefits",
    options: [
      { value: "All" },
      { value: "Prosperity", keywords: ["prosperity", "wealth", "money"] },
      { value: "Protection", keywords: ["protection", "safety"] },
      { value: "Peace", keywords: ["peace", "shanti"] },
      { value: "Health", keywords: ["health", "healing"] },
      { value: "Career", keywords: ["career", "job", "business"] },
      { value: "Marriage", keywords: ["marriage", "wedding"] },
    ],
  },
];

export default function AdminHomasPage() {
  const fields = [
    // ── 1. Basic & Header Info ──
    {
      name: "title",
      label: "Main Title",
      type: "text",
      required: true,
      placeholder: "e.g. Maha Ganapathi Homa",
      section: "Basic & Header Info",
    },
    {
      name: "shortTitle",
      label: "Short Title (Centered Top Tag)",
      type: "text",
      placeholder: "e.g. Sacred Fire Ritual for Obstacle Removal",
      section: "Basic & Header Info",
    },
    {
      name: "badge",
      label: "Badge (e.g. Special Event)",
      type: "text",
      placeholder: "Special Event / Recommended",
      section: "Basic & Header Info",
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: ["active", "inactive"],
      placeholder: "active",
      section: "Basic & Header Info",
    },
    {
      name: "slug",
      label: "Slug (URL identifier)",
      type: "text",
      placeholder: "e.g. maha-ganapathi-homa",
      section: "Basic & Header Info",
    },
    {
      name: "buttonText",
      label: "Primary Button Text",
      type: "text",
      placeholder: "Book Now / Participate",
      section: "Basic & Header Info",
    },

    // ── 2. Media & Banners ──
    {
      name: "imageUrl",
      label: "Main Banner Image URL",
      type: "url",
      placeholder: "https://example.com/banner.jpg",
      section: "Media & Banners",
    },
    {
      name: "additionalImages",
      label: "Additional Banner Image URLs (Carousel)",
      type: "array-string",
      placeholder: "https://example.com/banner-extra.jpg",
      section: "Media & Banners",
    },
    {
      name: "gallery",
      label: "Gallery Image URLs",
      type: "array-string",
      placeholder: "https://example.com/gallery.jpg",
      section: "Media & Banners",
    },

    // ── 3. Trust & Assurances ──
    {
      name: "trustBadges",
      label: "Trust Highlights (Strip below Banner)",
      type: "array-string",
      placeholder: "e.g. Homa recording shared within 48 hours",
      section: "Trust & Assurances",
    },

    // ── 4. Schedule & Muhurat ──
    {
      name: "date",
      label: "Homa Date (DD-MM-YYYY)",
      type: "date-ddmmyyyy",
      section: "Schedule & Muhurat",
    },
    {
      name: "time",
      label: "Homa Time (e.g. 06:00 PM / 10:30 AM)",
      type: "text",
      placeholder: "e.g. 06:00 PM or 10:30 AM",
      section: "Schedule & Muhurat",
    },
    {
      name: "subtitle",
      label: "Date Occasion / Ceremony Tag (e.g. Beside Date)",
      type: "text",
      placeholder: "e.g. Sacred Ancestral Offering / Purnima Special",
      section: "Schedule & Muhurat",
    },
    {
      name: "eventDateTime",
      label: "Countdown Date & Time",
      type: "datetime-local",
      placeholder: "2026-04-19T18:30",
      section: "Schedule & Muhurat",
    },
    {
      name: "showTimer",
      label: "Show Countdown Timer",
      type: "checkbox",
      placeholder: "Show live countdown timer on page",
      section: "Schedule & Muhurat",
    },

    // ── 4. Temple & Location ──
    {
      name: "templeVenue",
      label: "Temple Venue Name",
      type: "text",
      placeholder: "e.g. Shri Gajalakshmi Temple",
      section: "Temple & Location",
    },
    {
      name: "location",
      label: "Location State / City",
      type: "text",
      placeholder: "e.g. Tamil Nadu, Rameshwaram",
      section: "Temple & Location",
    },
    {
      name: "templeImage",
      label: "Temple Image URL",
      type: "url",
      placeholder: "https://example.com/temple.jpg",
      section: "Temple & Location",
    },
    {
      name: "templeLocation",
      label: "Temple Location (Details Section Address)",
      type: "text",
      placeholder: "e.g. Rameshwaram, Tamil Nadu",
      section: "Temple & Location",
    },
    {
      name: "templeNote",
      label: "Temple Significance Note",
      type: "textarea",
      placeholder: "Short temple significance or venue note.",
      section: "Temple & Location",
    },

    // ── 5. Packages & Pricing (INR Only) ──
    {
      name: "packages",
      label: "Packages (INR)",
      type: "array-object",
      section: "Packages & Pricing",
      objectSchema: [
        {
          name: "name",
          label: "Package Name",
          type: "select",
          options: [
            "Individual Homa",
            "Couple Homa",
            "Partner Homa",
            "Family Homa",
            "Family + Bhog",
            "Joint Family + Bhog",
          ],
        },

        {
          name: "priceINR",
          label: "Price (INR ₹)",
          type: "number",
          placeholder: "Price in INR",
        },

      ],
    },
    {
      name: "offerings",
      label: "Prasadam & Offerings (INR)",
      type: "array-object",
      section: "Packages & Pricing",
      objectSchema: [
        { name: "name", label: "Offering Name", type: "text", placeholder: "e.g. Special Prasadam Box" },
        { name: "priceINR", label: "Price (INR ₹)", type: "number", placeholder: "Price in INR" },
        { name: "description", label: "Description", type: "textarea", placeholder: "Offering details" },
        { name: "imageUrl", label: "Image URL", type: "url", placeholder: "https://example.com/offering.jpg" },
        { name: "badge", label: "Badge (Optional)", type: "text", placeholder: "e.g. Popular, Sacred" },
      ],
    },

    // ── 6. About & Sacred Details ──
    {
      name: "description",
      label: "Short Description (Hero Summary)",
      type: "textarea",
      placeholder: "Short summary shown in the top hero section...",
      section: "About & Sacred Details",
    },
    {
      name: "about",
      label: "About Homa (In-depth Overview)",
      type: "textarea",
      placeholder: "Detailed explanation of the homa history and spiritual significance...",
      section: "About & Sacred Details",
    },
    {
      name: "ritualSummary",
      label: "Ritual Summary / Highlights",
      type: "textarea",
      placeholder: "Summary of ritual proceedings and sacred chantings...",
      section: "About & Sacred Details",
    },
    {
      name: "inclusions",
      label: "What Will You Receive (Inclusions)",
      type: "array-string",
      placeholder: "e.g. Homa Video Delivered Within 48 hours, Sanctified Prasad box",
      section: "About & Sacred Details",
    },
    {
      name: "benefits",
      label: "Homa Benefits",
      type: "array-object",
      section: "About & Sacred Details",
      objectSchema: [
        { name: "title", label: "Benefit Title", type: "text", placeholder: "e.g. Eliminates Obstacles & Negativity" },
        { name: "description", label: "Benefit Description", type: "textarea", placeholder: "Detailed benefit description..." },
      ],
    },
    {
      name: "process",
      label: "Homa Procedure / Steps",
      type: "array-object",
      section: "About & Sacred Details",
      objectSchema: [
        { name: "title", label: "Step Title", type: "text", placeholder: "e.g. Sankalpam & Agni Pratishta" },
        { name: "description", label: "Step Description", type: "textarea", placeholder: "How this step is performed..." },
      ],
    },

    // ── 7. Vedic Filters & Categorization ──
    {
      name: "deity",
      label: "Deity",
      type: "select",
      options: ["Ganapathi", "Lakshmi", "Shiva", "Vishnu", "Hanuman", "Durga", "Saraswati"],
      section: "Vedic Filters",
    },
    {
      name: "tithis",
      label: "Tithis",
      type: "select",
      options: ["Ekadashi", "Purnima", "Amavasya", "Pradosh", "Navami"],
      section: "Vedic Filters",
    },
    {
      name: "dosha",
      label: "Dosha",
      type: "select",
      options: ["Mangal Dosha", "Kala Sarpa", "Pitru Dosha", "Shani Dosha"],
      section: "Vedic Filters",
    },
    {
      name: "benefit",
      label: "Primary Benefit",
      type: "select",
      options: ["Prosperity", "Protection", "Peace", "Health", "Career", "Marriage"],
      section: "Vedic Filters",
    },
    {
      name: "filterLocation",
      label: "Location State (Filter)",
      type: "select",
      options: ["Tamil Nadu", "Karnataka", "Kerala", "Uttar Pradesh", "Andhra Pradesh", "Rajasthan"],
      section: "Vedic Filters",
    },

    // ── 8. FAQs & Page Ordering ──
    {
      name: "faq",
      label: "Frequently Asked Questions",
      type: "array-object",
      section: "FAQs & Layout",
      objectSchema: [
        { name: "question", label: "Question", type: "text", placeholder: "e.g. Do I need to be physically present?" },
        { name: "answer", label: "Answer", type: "textarea", placeholder: "Detailed answer for devotees..." },
      ],
    },
    {
      name: "recommendedPujaIds",
      label: "Recommended Pujas",
      type: "reference-array",
      referenceEndpoint: "https://priestservices.astroved.com/api/pujas",
      referenceLabelField: "title",
      section: "FAQs & Layout",
    },
    {
      name: "sectionOrder",
      label: "Frontend Section Order",
      type: "section-order",
      options: ["about", "benefits", "process", "temple", "packages", "reviews", "faqs", "recommendations"],
      section: "FAQs & Layout",
    },
  ];

  return (
    <ContentManager
      type="homa"
      title="Homas"
      fields={fields as any}
      searchFields={["title", "shortTitle", "description", "location", "slug", "badge"]}
      filterGroups={HOMA_ADMIN_FILTER_GROUPS}
      dynamicPujaLocationFromItems
    />
  );
}
