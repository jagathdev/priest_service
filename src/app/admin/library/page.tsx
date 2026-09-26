import ContentManager from "@/components/admin/ContentManager";

export default function AdminLibraryPage() {
  const fields = [
    { name: "title", label: "Book/Article Title", type: "text", required: true },
    { name: "author", label: "Author", type: "text" },
    { name: "category", label: "Category", type: "text" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "imageUrl", label: "Cover Image URL", type: "url" },
    { name: "content", label: "Content/Link", type: "textarea" },
  ];

  return <ContentManager type="library" title="Library" fields={fields as any} />;
}
