import { notFound } from "next/navigation";
import Link from "next/link";
import PromoCodeForm from "@/components/admin/PromoCodeForm";

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function EditPromoCodePage({ params }: PageProps) {
    const { id } = await params;
    
    // In server components, always provide an absolute URL or use standard fetch from the API URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";
    const response = await fetch(`${baseUrl}/api/promos/${id}`, {
        cache: "no-store",
    });

    if (!response.ok) {
        notFound();
    }

    const result = await response.json();

    return (
        <div className="p-6 max-w-4xl">
            <div className="mb-8">
                <Link
                    href="/admin/promo-codes"
                    className="flex items-center text-sm font-bold text-gray-500 hover:text-[#069e5d] transition-colors w-fit"
                >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Back to Promo Codes
                </Link>
                <h1 className="mt-4 text-2xl font-bold text-[#2d2a6e]">Edit Promo Code</h1>
                <p className="mt-1 text-sm font-medium text-gray-500">
                    Update promo code settings.
                </p>
            </div>
            <PromoCodeForm promo={result.data} />
        </div>
    );
}
