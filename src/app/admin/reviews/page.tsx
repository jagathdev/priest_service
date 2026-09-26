import ContentManager from "@/components/admin/ContentManager";

export default function AdminReviewsPage() {
  const fields = [
    { name: "name", label: "User Name", type: "text", required: true },
    { name: "service", label: "Service", type: "text" },
    { name: "content", label: "Review Text", type: "textarea", required: true },
    { name: "type", label: "Type (text/video)", type: "text" },
    { name: "videoUrl", label: "Video URL (if type is video)", type: "text" },
    { name: "rating", label: "Rating (1-5)", type: "number" },
  ];

  return (
    <ContentManager
      type="reviews"
      title="Reviews & Ratings"
      fields={fields as any}
      searchFields={["name", "service", "content"]}
      reviewMode
    />
  );
}
