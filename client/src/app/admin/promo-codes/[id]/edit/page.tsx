import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cookies } from "next/headers";
import PromoCodeForm from "@/components/admin/PromoCodeForm";

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function EditPromoCodePage({ params }: PageProps) {
    const { id } = await params;
    const cookieStore = await cookies();
    const adminToken = cookieStore.get("adminToken")?.value || cookieStore.get("token")?.value;

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";
    const headers: Record<string, string> = adminToken
        ? { Authorization: `Bearer ${adminToken}`, Cookie: `adminToken=${adminToken}` }
        : {};

    const response = await fetch(`${baseUrl}/api/promos/${id}`, {
        cache: "no-store",
        headers,
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
                    <ArrowLeft className="w-4 h-4 mr-1" strokeWidth={2} />
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
