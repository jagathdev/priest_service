import ContentManager from "@/components/admin/ContentManager";

export default function AdminPanchangPage() {
  const fields = [
    { name: "date", label: "Date", type: "date", required: true },
    { name: "tithi", label: "Tithi", type: "text" },
    { name: "nakshatra", label: "Nakshatra", type: "text" },
    { name: "yoga", label: "Yoga", type: "text" },
    { name: "karana", label: "Karana", type: "text" },
    { name: "sunrise", label: "Sunrise", type: "text" },
    { name: "sunset", label: "Sunset", type: "text" },
  ];

  return <ContentManager type="panchang" title="Panchang" fields={fields as any} />;
}
