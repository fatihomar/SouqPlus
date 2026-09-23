"use client";

import { useCreateListingStore } from "@/store/createListingStore";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslations } from "next-intl";

const amenitiesList = ["Swimming Pool", "Garden", "Parking", "Balcony", "Security", "Air Conditioning"];
const amenitiesMap: Record<string, string> = {
  "Swimming Pool": "مسبح",
  "Garden": "حديقة",
  "Parking": "موقف سيارات",
  "Balcony": "شرفة",
  "Security": "حراسة أمنية",
  "Air Conditioning": "تكييف مركزي"
};

export function AmenitiesSection() {
  const { formData, updateFormData } = useCreateListingStore();
  const t = useTranslations("createListing");

  if (formData.category !== 'REAL_ESTATE') return null;

  const handleAmenityToggle = (amenity: string) => {
    const currentAmenities = formData.propertyDetails?.amenities || [];
    const newAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter((a) => a !== amenity)
      : [...currentAmenities, amenity];
      
    updateFormData({
      propertyDetails: {
        ...(formData.propertyDetails as any),
        amenities: newAmenities
      }
    });
  };

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-slate-900">{t("step4")}</h2>
        <p className="text-xs text-slate-500 mt-1">{t("step4Desc")}</p>
      </div>
      <div className="space-y-3 pt-2">
        {amenitiesList.map((amenityEn) => {
          const amenityAr = amenitiesMap[amenityEn];
          const isChecked = formData.propertyDetails?.amenities?.includes(amenityAr) || false;
          // Get localized amenity name (camelCase the English name for the key)
          const amenityKey = amenityEn.charAt(0).toLowerCase() + amenityEn.slice(1).replace(/\s+(.)/g, (match, group1) => group1.toUpperCase());
          return (
            <div key={amenityEn} className="flex items-center space-x-3 rtl:space-x-reverse">
              <Checkbox 
                id={`amenity-${amenityEn}`} 
                checked={isChecked}
                onCheckedChange={() => handleAmenityToggle(amenityAr)}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <label
                htmlFor={`amenity-${amenityEn}`}
                className="text-sm font-semibold leading-none cursor-pointer text-slate-700"
              >
                {t(amenityKey as any)}
              </label>
            </div>
          )
        })}
      </div>
    </section>
  );
}
