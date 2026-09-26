import ContentManager from "@/components/admin/ContentManager";

export default function AdminOfferingsPage() {
  const fields = [
    { name: "name", label: "Offering Name", type: "text", required: true },
    { name: "productId", label: "AstroVed Product ID", type: "number", placeholder: "e.g. 36" },
    { name: "priceINR", label: "Price (INR)", type: "number", required: true },
    { name: "priceUSD", label: "Price (USD)", type: "number" },
    { name: "priceMYR", label: "Price (MYR)", type: "number" },
    { name: "badge", label: "Badge (e.g. Home Delivery)", type: "text" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "imageUrl", label: "Image URL", type: "url" },
  ];

  return <ContentManager type="offering" title="Offerings" fields={fields as any} />;
}
