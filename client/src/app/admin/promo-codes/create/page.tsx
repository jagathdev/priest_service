import Link from "next/link";
import PromoCodeForm from "@/components/admin/PromoCodeForm";

export default function CreatePromoCodePage() {
    return (
        <div className="p-6 max-w-4xl">
            <div className="mb-8">
                <Link
                    href="/admin/promo-codes"
                    className="flex items-center text-sm font-bold text-gray-500 hover:text-success transition-colors w-fit"
                >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
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
