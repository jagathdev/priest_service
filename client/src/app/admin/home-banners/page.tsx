import ContentManager from "@/components/admin/ContentManager";

export default function AdminHomeBannersPage() {
  const fields = [
    { name: "title", label: "Title", type: "text", required: true, placeholder: "e.g. Sankashti Ganesh Puja for Removal of Obstacles" },
    { name: "tagLine", label: "Tagline", type: "text", required: true, placeholder: "e.g. SPECIAL SANKASHTI SANKALPAM" },
    { name: "description", label: "Description", type: "textarea", required: true, placeholder: "Short description of the banner offer/event..." },
    { name: "ctaText", label: "CTA Button Text", type: "text", required: true, placeholder: "e.g. Book Puja Now" },
    { name: "ctaUrl", label: "CTA Link URL", type: "text", required: true, placeholder: "e.g. /puja/sankashti-ganesh-puja" },
    { name: "imageUrl", label: "Image URL", type: "url", required: true, placeholder: "https://your-cdn.com/images/sankashti-ganesh-puja.jpg" },
    { name: "displayOrder", label: "Display Order", type: "number", required: true, placeholder: "1" },
    {
      name: "isActive",
      label: "Status",
      type: "select",
      options: ["true", "false"],
      required: true
    },
  ];

  return (
    <ContentManager
      type="home-banner"
      title="Home Banners"
      fields={fields as any}
      searchFields={["title", "tagLine", "description"]}
    />
  );
}
