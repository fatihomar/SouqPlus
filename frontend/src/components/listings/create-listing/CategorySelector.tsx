"use client";

import { useCreateListingStore } from "@/store/createListingStore";
import { Home, Car } from "lucide-react";
import { useTranslations } from "next-intl";

interface CategorySelectorProps {
  errors: Record<string, string>;
  tErrors: any;
}

export function CategorySelector({ errors, tErrors }: CategorySelectorProps) {
  const { formData, updateFormData } = useCreateListingStore();
  const t = useTranslations("createListing");

  return (
    <section>
      <h2 className="text-lg font-bold text-slate-900 mb-2">{t("step1")}</h2>
      <p className="text-sm text-slate-500 mb-4">{t("step1Desc")}</p>
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => updateFormData({ category: 'REAL_ESTATE', propertyDetails: undefined })}
          className={`p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all text-center ${formData.category === 'REAL_ESTATE' ? 'border-primary bg-primary/5 shadow-md scale-[1.02]' : 'border-slate-200 bg-white hover:border-primary/50'}`}
        >
          <div className={`p-4 rounded-full ${formData.category === 'REAL_ESTATE' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-slate-100 text-slate-500'}`}>
            <Home className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900 mb-1">{t("realEstate")}</h3>
            <p className="text-xs text-slate-500 max-w-[200px] mx-auto">{t("realEstateDesc")}</p>
          </div>
        </button>
        <button
          type="button"
          onClick={() => updateFormData({ category: 'CAR', propertyDetails: undefined })}
          className={`p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all text-center ${formData.category === 'CAR' ? 'border-primary bg-primary/5 shadow-md scale-[1.02]' : 'border-slate-200 bg-white hover:border-primary/50'}`}
        >
          <div className={`p-4 rounded-full ${formData.category === 'CAR' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-slate-100 text-slate-500'}`}>
            <Car className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900 mb-1">{t("cars")}</h3>
            <p className="text-xs text-slate-500 max-w-[200px] mx-auto">{t("carsDesc")}</p>
          </div>
        </button>
      </div>
      {errors.category && <p className="text-sm text-red-500 mt-2 text-center">{errors.category && (tErrors(errors.category as any) || errors.category)}</p>}
    </section>
  );
}
