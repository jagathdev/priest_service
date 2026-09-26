import ContentManager from "@/components/admin/ContentManager";

export default function AdminCurrencyPage() {
  const fields = [
    { name: "baseCurrency", label: "Base Currency", type: "text", required: true, options: ["USD", "INR", "MYR"], placeholder: "USD" },
    { name: "usdConversionRate", label: "USD Conversion Rate (e.g., 0.012 means 1 INR = 0.012 USD)", type: "number", required: true },
    { name: "myrConversionRate", label: "MYR Conversion Rate (e.g., 0.056 means 1 INR = 0.056 MYR)", type: "number", required: true },
    { name: "usdSymbol", label: "USD Symbol (e.g., $)", type: "text" },
    { name: "inrSymbol", label: "INR Symbol (e.g., ₹)", type: "text" },
    { name: "myrSymbol", label: "MYR Symbol (e.g., RM)", type: "text" },
  ];

  return <ContentManager type="currency" title="Currency Settings" fields={fields as any} hideAddButton={true} />;
}

