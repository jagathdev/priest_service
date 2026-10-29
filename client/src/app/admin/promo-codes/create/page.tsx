import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PromoCodeForm from "@/components/admin/PromoCodeForm";

export default function CreatePromoCodePage() {
    return (
        <div className="p-6 max-w-4xl">
            <div className="mb-8">
                <Link
                    href="/admin/promo-codes"
                    className="flex items-center text-sm font-bold text-gray-500 hover:text-success transition-colors w-fit"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" strokeWidth={2} />
                    Back to Promo Codes
                </Link>
                <h1 className="mt-4 text-2xl font-bold text-[#2d2a6e]">Create Promo Code</h1>
                <p className="mt-1 text-sm font-medium text-gray-500">
                    Create a new promotional discount.
                </p>
            </div>
            <PromoCodeForm />
        </div>
    );
}
