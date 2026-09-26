import ContentManager from "@/components/admin/ContentManager";

export default function AdminChadhavaPage() {
  const fields = [
    { name: "title", label: "Main Title", type: "text", required: true },
    { name: "slug", label: "Slug (optional)", type: "text" },
    { name: "subtitle", label: "Subtitle (Date/Event Info)", type: "text" },
    { name: "imageUrl", label: "Main Image URL", type: "url" },
    { name: "location", label: "Location", type: "text" },
    { name: "description", label: "Short Description (for cards)", type: "textarea" },
    
    { name: "heroTitle", label: "Hero Title", type: "text" },
    { name: "content", label: "Long Content (for detail page)", type: "textarea" },

    { name: "offering1Name", label: "Offering 1 Name", type: "text" },
    { name: "offering1PriceINR", label: "Offering 1 Price (INR)", type: "number" },
    { name: "offering1PriceUSD", label: "Offering 1 Price (USD)", type: "number" },
    { name: "offering1PriceMYR", label: "Offering 1 Price (MYR)", type: "number" },
    { name: "offering1Description", label: "Offering 1 Description", type: "textarea" },
    { name: "offering1ImageUrl", label: "Offering 1 Image URL", type: "url" },

    { name: "offering2Name", label: "Offering 2 Name", type: "text" },
    { name: "offering2PriceINR", label: "Offering 2 Price (INR)", type: "number" },
    { name: "offering2PriceUSD", label: "Offering 2 Price (USD)", type: "number" },
    { name: "offering2PriceMYR", label: "Offering 2 Price (MYR)", type: "number" },
    { name: "offering2Description", label: "Offering 2 Description", type: "textarea" },
    { name: "offering2ImageUrl", label: "Offering 2 Image URL", type: "url" },

    { name: "offering3Name", label: "Offering 3 Name", type: "text" },
    { name: "offering3PriceINR", label: "Offering 3 Price (INR)", type: "number" },
    { name: "offering3PriceUSD", label: "Offering 3 Price (USD)", type: "number" },
    { name: "offering3PriceMYR", label: "Offering 3 Price (MYR)", type: "number" },
    { name: "offering3Description", label: "Offering 3 Description", type: "textarea" },
    { name: "offering3ImageUrl", label: "Offering 3 Image URL", type: "url" },

    { name: "offering4Name", label: "Offering 4 Name", type: "text" },
    { name: "offering4PriceINR", label: "Offering 4 Price (INR)", type: "number" },
    { name: "offering4PriceUSD", label: "Offering 4 Price (USD)", type: "number" },
    { name: "offering4PriceMYR", label: "Offering 4 Price (MYR)", type: "number" },
    { name: "offering4Description", label: "Offering 4 Description", type: "textarea" },
    { name: "offering4ImageUrl", label: "Offering 4 Image URL", type: "url" },

    { name: "offering5Name", label: "Offering 5 Name", type: "text" },
    { name: "offering5PriceINR", label: "Offering 5 Price (INR)", type: "number" },
    { name: "offering5PriceUSD", label: "Offering 5 Price (USD)", type: "number" },
    { name: "offering5PriceMYR", label: "Offering 5 Price (MYR)", type: "number" },
    { name: "offering5Description", label: "Offering 5 Description", type: "textarea" },
    { name: "offering5ImageUrl", label: "Offering 5 Image URL", type: "url" },

    { name: "faq1Question", label: "FAQ 1 Question", type: "text" },
    { name: "faq1Answer", label: "FAQ 1 Answer", type: "textarea" },
    { name: "faq2Question", label: "FAQ 2 Question", type: "text" },
    { name: "faq2Answer", label: "FAQ 2 Answer", type: "textarea" },
    { name: "faq3Question", label: "FAQ 3 Question", type: "text" },
    { name: "faq3Answer", label: "FAQ 3 Answer", type: "textarea" },
    { name: "faq4Question", label: "FAQ 4 Question", type: "text" },
    { name: "faq4Answer", label: "FAQ 4 Answer", type: "textarea" },
    { name: "faq5Question", label: "FAQ 5 Question", type: "text" },
    { name: "faq5Answer", label: "FAQ 5 Answer", type: "textarea" },
    {
      name: "sectionOrder",
      label: "Frontend Section Order",
      type: "section-order",
      options: ["hero", "offerings", "faqs"]
    }
  ];

  return (
    <ContentManager
      type="chadhava"
      title="Chadhava"
      fields={fields as any}
      searchFields={["title", "subtitle", "description", "location", "slug"]}
    />
  );
}
