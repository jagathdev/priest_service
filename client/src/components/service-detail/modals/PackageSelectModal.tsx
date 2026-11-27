"use client";

import { XMarkIcon } from "@heroicons/react/24/solid";
import PriceTag from "@/components/ui/PriceTag";
import { ServicePackage } from "../types";

interface PackageSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  packages: ServicePackage[];
  selectedPackageId: string | null;
  onSelectPackage: (pkgId: string) => void;
  onConfirm: () => void;
  serviceType: "puja" | "homa";
}

export default function PackageSelectModal({
  isOpen,
  onClose,
  packages,
  selectedPackageId,
  onSelectPackage,
  onConfirm,
  serviceType,
}: PackageSelectModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 pb-[90px] md:pb-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl relative max-h-[85vh] md:max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-2 cursor-pointer"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        <h3 className="text-2xl font-serif font-bold text-stone-900 mb-1.5">
          Select {serviceType === "homa" ? "Homa" : "Puja"} Package
        </h3>
        <p className="text-stone-600 text-xs sm:text-sm mb-6">
          Choose your desired package for sacred ritual participation.
        </p>

        <div className="space-y-3 mb-6">
          {packages.map((pkg) => {
            const isSelected = selectedPackageId === pkg.id;
            return (
              <div
                key={pkg.id}
                onClick={() => onSelectPackage(pkg.id)}
                className={`border-2 rounded-2xl p-4 cursor-pointer transition-all flex items-center justify-between ${isSelected
                  ? "border-[#00B05F] bg-[#F1FBF5] shadow-xs"
                  : "border-stone-200 hover:border-stone-400 bg-white"
                  }`}
              >
                <div>
                  <h4 className="font-extrabold text-stone-900 text-base">{pkg.name}</h4>
                  {pkg.devoteeCount && (
                    <span className="text-xs text-stone-500 font-semibold block mt-0.5">
                      {pkg.devoteeCount}
                    </span>
                  )}
                  <p className="text-stone-600 text-xs mt-1">
                    {pkg.description || "Includes personalized sankalpam and video proof."}
                  </p>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <PriceTag
                    sellingPrice={pkg.priceINR}
                    listPrice={pkg.listPriceINR}
                    sellingPriceClassName="font-extrabold text-lg text-stone-900 block"
                    listPriceClassName="text-xs font-bold text-stone-400 line-through decoration-red-500 decoration-1.5 mr-1"
                    className="flex items-baseline gap-1 flex-wrap justify-end"
                  />
                  <span className={`text-[10px] font-extrabold uppercase mt-1 block ${isSelected ? "text-[#00B05F]" : "text-stone-400"
                    }`}>
                    {isSelected ? "Selected ✓" : "Select"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => {
            onClose();
            onConfirm();
          }}
          className="w-full bg-[#00B05F] hover:bg-[#008F4C] active:scale-95 text-white font-extrabold text-base py-3.5 rounded-full shadow-md transition-all cursor-pointer"
        >
          Confirm & Proceed
        </button>
      </div>
    </div>
  );
}
