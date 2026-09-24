"use client";

import { useCreateListingStore } from "@/store/createListingStore";
import { UploadCloud, X } from "lucide-react";
import { useTranslations } from "next-intl";

interface MediaUploadSectionProps {
  errors: Record<string, string>;
  tErrors: any;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (index: number) => void;
  previewUrls: string[];
}

export function MediaUploadSection({
  errors,
  tErrors,
  handleImageChange,
  removeImage,
  previewUrls
}: MediaUploadSectionProps) {
  const { formData } = useCreateListingStore();
  const t = useTranslations("createListing");

  if (!formData.category) return null;

  return (
    <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900 mb-1">{t("step5")}</h2>
      <p className="text-xs text-slate-500 mb-4">{t("step5Desc")}</p>
      
      <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors bg-white relative overflow-hidden group cursor-pointer mb-4">
        <input
          type="file"
          multiple
          accept="image/png, image/jpeg, image/webp, image/avif"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          onChange={handleImageChange}
        />
        <div className="flex flex-col items-center justify-center space-y-2">
          <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-primary transition-colors" />
          <p className="text-sm font-bold text-slate-700 whitespace-pre-line">{t("dragDrop")}</p>
          <p className="text-[10px] text-slate-400">{t("maxPhotos")}</p>
        </div>
      </div>
      {errors.images && <p className="text-xs text-red-500 font-bold mb-4">{errors.images && (tErrors(errors.images as any) || errors.images)}</p>}

      {/* Image Previews */}
      {previewUrls.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {previewUrls.slice(0, 3).map((url, idx) => (
            <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200 shadow-sm">
              <img src={url} alt={`Preview ${idx}`} className="object-cover w-full h-full" />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-1 end-1 p-1 bg-black/50 hover:bg-red-500 text-white rounded-full transition-colors opacity-0 group-hover:opacity-100"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {previewUrls.length > 3 && (
            <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-800 flex items-center justify-center text-white font-bold text-sm">
              +{previewUrls.length - 3}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
