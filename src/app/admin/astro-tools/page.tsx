import ContentManager from "@/components/admin/ContentManager";

export default function AdminAstroToolsPage() {
  const fields = [
    { name: "name", label: "Tool Name", type: "text", required: true },
    { name: "description", label: "Description", type: "text" },
    { name: "url", label: "Tool URL/Path", type: "text" },
    { name: "imageUrl", label: "Icon URL", type: "url" },
  ];

  return <ContentManager type="astro-tools" title="Astro Tools" fields={fields as any} />;
}
