import ContentManager from "@/components/admin/ContentManager";

export default function AdminStorePage() {
  const fields = [
    { name: "title", label: "Product Name", type: "text", required: true },
    { name: "description", label: "Description", type: "textarea" },
    { name: "priceINR", label: "Price (INR)", type: "number" },
    { name: "priceUSD", label: "Price (USD)", type: "number" },
    { name: "priceMYR", label: "Price (MYR)", type: "number" },
    { name: "imageUrl", label: "Image URL", type: "url" },
    { name: "category", label: "Category", type: "text" },
  ];

  return <ContentManager type="store" title="Store" fields={fields as any} />;
}
