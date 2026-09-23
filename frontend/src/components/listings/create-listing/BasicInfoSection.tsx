"use client";

import { useCreateListingStore } from "@/store/createListingStore";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";

interface BasicInfoSectionProps {
  errors: Record<string, string>;
  tErrors: any;
}

const propertyTypes = ["APARTMENT", "VILLA", "OFFICE"];

export function BasicInfoSection({ errors, tErrors }: BasicInfoSectionProps) {
  const { formData, updateFormData } = useCreateListingStore();
  const t = useTranslations("createListing");
  const tEnums = useTranslations("listingDetails.enums");

  if (!formData.category) return null;

  return (
    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-lg font-bold text-slate-900 mb-4">{t("step2")}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        
        <div className="space-y-2 md:col-span-1">
          <Label className="text-xs font-bold text-slate-700">{t("titleLabel")} <span className="text-red-500">*</span></Label>
          <div className="relative">
            <Input
              className="h-11 rounded-lg bg-slate-50 border-slate-200 pr-16"
              value={formData.title}
              onChange={(e) => updateFormData({ title: e.target.value })}
            />
            <span className="absolute end-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-medium" dir="ltr">
              {formData.title.length} / 100
            </span>
          </div>
          {errors.title && <p className="text-xs text-red-500">{tErrors(errors.title as any)}</p>}
        </div>

        <div className="space-y-2 md:col-span-1">
          <Label className="text-xs font-bold text-slate-700">{t("typeLabel")} <span className="text-red-500">*</span></Label>
          <div className="flex h-11 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => updateFormData({ listingType: 'SALE', rentPeriod: undefined })}
              className={`flex-1 text-sm font-bold rounded-md transition-all ${formData.listingType === 'SALE' ? 'bg-white text-primary shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {t("forSale")}
            </button>
            <button
              type="button"
              onClick={() => updateFormData({ listingType: 'RENT' })}
              className={`flex-1 text-sm font-bold rounded-md transition-all ${formData.listingType === 'RENT' ? 'bg-white text-primary shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {t("forRent")}
            </button>
          </div>
        </div>

        {formData.listingType === 'RENT' && (
          <div className="space-y-2 md:col-span-2">
            <Label className="text-xs font-bold text-slate-700">{t("rentPeriodLabel")} <span className="text-red-500">*</span></Label>
            <select
              className="flex h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              value={formData.rentPeriod || ''}
              onChange={(e) => updateFormData({ rentPeriod: e.target.value as any })}
            >
              <option value="" disabled>{t("chooseRentPeriod")}</option>
              <option value="DAILY">{t("daily")}</option>
              <option value="WEEKLY">{t("weekly")}</option>
              <option value="MONTHLY">{t("monthly")}</option>
              <option value="YEARLY">{t("yearly")}</option>
            </select>
            {errors.rentPeriod && <p className="text-xs text-red-500">{errors.rentPeriod && (tErrors(errors.rentPeriod as any) || errors.rentPeriod)}</p>}
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-xs font-bold text-slate-700">{t("priceLabel")} <span className="text-red-500">*</span></Label>
          <div className="relative flex items-center">
            <span className="absolute start-3 text-slate-500 font-bold">$</span>
            <Input
              type="number"
              dir="ltr"
              className="h-11 rounded-lg bg-slate-50 border-slate-200 rtl:pr-8 rtl:pl-16 ltr:pl-8 ltr:pr-16 text-start"
              value={formData.price}
              onChange={(e) => updateFormData({ price: e.target.value === '' ? '' : Number(e.target.value) })}
            />
            <div className="absolute end-3 text-xs font-bold text-slate-500 rtl:border-r ltr:border-l rtl:pr-2 ltr:pl-2 border-slate-200">
              USD ▾
            </div>
          </div>
          {errors.price && <p className="text-xs text-red-500">{errors.price && (tErrors(errors.price as any) || errors.price)}</p>}
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-bold text-slate-700">{t("categoryTypeLabel")} <span className="text-red-500">*</span></Label>
          {formData.category === 'REAL_ESTATE' ? (
            <div className="w-full">
              <select
                className="flex h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                value={formData.propertyDetails?.propertyType || ''}
                onChange={(e) => updateFormData({ propertyDetails: { ...formData.propertyDetails, propertyType: e.target.value } as any })}
              >
                <option value="" disabled>{t("choose")}</option>
                {propertyTypes.map((type) => (
                  <option key={type} value={type}>{tEnums(`propertyType.${type}` as any)}</option>
                ))}
              </select>
              {errors.property_propertyType && <p className="text-xs text-red-500 mt-1">{errors.property_propertyType && (tErrors(errors.property_propertyType as any) || errors.property_propertyType)}</p>}
            </div>
          ) : formData.category === 'CAR' ? (
            <div className="w-full">
              <select
                className="flex h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                value={(formData.propertyDetails as any)?.condition || ''}
                onChange={(e) => updateFormData({ propertyDetails: { ...formData.propertyDetails, condition: e.target.value } as any })}
              >
                <option value="" disabled>{t("choose")}</option>
                <option value="NEW">{tEnums("condition.NEW")}</option>
                <option value="USED">{tEnums("condition.USED")}</option>
              </select>
              {errors.car_condition && <p className="text-xs text-red-500 mt-1">{errors.car_condition && (tErrors(errors.car_condition as any) || errors.car_condition)}</p>}
            </div>
          ) : (
            <div className="flex h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400 items-center">
              {t("chooseTypeFirst")}
            </div>
          )}
        </div>

        {formData.category === 'REAL_ESTATE' && (
          <>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700">{t("bedrooms")}</Label>
              <Input
                type="number"
                dir="ltr"
                className="h-11 rounded-lg bg-slate-50 border-slate-200 text-start"
                value={formData.propertyDetails?.bedrooms || ''}
                onChange={(e) => updateFormData({ propertyDetails: { ...formData.propertyDetails, bedrooms: e.target.value === '' ? '' : Number(e.target.value) } as any })}
              />
              {errors.property_bedrooms && <p className="text-xs text-red-500">{errors.property_bedrooms && (tErrors(errors.property_bedrooms as any) || errors.property_bedrooms)}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700">{t("bathrooms")}</Label>
              <Input
                type="number"
                dir="ltr"
                className="h-11 rounded-lg bg-slate-50 border-slate-200 text-start"
                value={formData.propertyDetails?.bathrooms || ''}
                onChange={(e) => updateFormData({ propertyDetails: { ...formData.propertyDetails, bathrooms: e.target.value === '' ? '' : Number(e.target.value) } as any })}
              />
              {errors.property_bathrooms && <p className="text-xs text-red-500">{errors.property_bathrooms && (tErrors(errors.property_bathrooms as any) || errors.property_bathrooms)}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700">{t("area")}</Label>
              <Input
                type="number"
                dir="ltr"
                className="h-11 rounded-lg bg-slate-50 border-slate-200 text-start"
                value={formData.propertyDetails?.area || ''}
                onChange={(e) => updateFormData({ propertyDetails: { ...formData.propertyDetails, area: e.target.value === '' ? '' : Number(e.target.value) } as any })}
              />
              {errors.property_area && <p className="text-xs text-red-500">{errors.property_area && (tErrors(errors.property_area as any) || errors.property_area)}</p>}
            </div>
          </>
        )}

        {formData.category === 'CAR' && (
          <>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700">{t("brand")} <span className="text-red-500">*</span></Label>
              <Input
                className="h-11 rounded-lg bg-slate-50 border-slate-200"
                value={(formData.propertyDetails as any)?.brand || ''}
                onChange={(e) => updateFormData({ propertyDetails: { ...formData.propertyDetails, brand: e.target.value } as any })}
              />
              {errors.car_brand && <p className="text-xs text-red-500">{errors.car_brand && (tErrors(errors.car_brand as any) || errors.car_brand)}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700">{t("model")} <span className="text-red-500">*</span></Label>
              <Input
                className="h-11 rounded-lg bg-slate-50 border-slate-200"
                value={(formData.propertyDetails as any)?.model || ''}
                onChange={(e) => updateFormData({ propertyDetails: { ...formData.propertyDetails, model: e.target.value } as any })}
              />
              {errors.car_model && <p className="text-xs text-red-500">{errors.car_model && (tErrors(errors.car_model as any) || errors.car_model)}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700">{t("year")} <span className="text-red-500">*</span></Label>
              <Input
                type="number"
                dir="ltr"
                className="h-11 rounded-lg bg-slate-50 border-slate-200 text-start"
                value={(formData.propertyDetails as any)?.year || ''}
                onChange={(e) => updateFormData({ propertyDetails: { ...formData.propertyDetails, year: e.target.value === '' ? '' : Number(e.target.value) } as any })}
              />
              {errors.car_year && <p className="text-xs text-red-500">{errors.car_year && (tErrors(errors.car_year as any) || errors.car_year)}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700">{t("mileage")} <span className="text-red-500">*</span></Label>
              <Input
                type="number"
                dir="ltr"
                className="h-11 rounded-lg bg-slate-50 border-slate-200 text-start"
                value={(formData.propertyDetails as any)?.mileage || ''}
                onChange={(e) => updateFormData({ propertyDetails: { ...formData.propertyDetails, mileage: e.target.value === '' ? '' : Number(e.target.value) } as any })}
              />
              {errors.car_mileage && <p className="text-xs text-red-500">{errors.car_mileage && (tErrors(errors.car_mileage as any) || errors.car_mileage)}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700">{t("transmission")} <span className="text-red-500">*</span></Label>
              <select
                className="flex h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                value={(formData.propertyDetails as any)?.transmission || ''}
                onChange={(e) => updateFormData({ propertyDetails: { ...formData.propertyDetails, transmission: e.target.value } as any })}
              >
                <option value="" disabled>{t("choose")}</option>
                <option value="AUTOMATIC">{tEnums("transmission.AUTOMATIC")}</option>
                <option value="MANUAL">{tEnums("transmission.MANUAL")}</option>
              </select>
              {errors.car_transmission && <p className="text-xs text-red-500">{errors.car_transmission && (tErrors(errors.car_transmission as any) || errors.car_transmission)}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700">{t("fuelType")} <span className="text-red-500">*</span></Label>
              <select
                className="flex h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                value={(formData.propertyDetails as any)?.fuelType || ''}
                onChange={(e) => updateFormData({ propertyDetails: { ...formData.propertyDetails, fuelType: e.target.value } as any })}
              >
                <option value="" disabled>{t("choose")}</option>
                <option value="PETROL">{tEnums("fuelType.PETROL")}</option>
                <option value="DIESEL">{tEnums("fuelType.DIESEL")}</option>
                <option value="HYBRID">{tEnums("fuelType.HYBRID")}</option>
                <option value="ELECTRIC">{tEnums("fuelType.ELECTRIC")}</option>
              </select>
              {errors.car_fuelType && <p className="text-xs text-red-500">{errors.car_fuelType && (tErrors(errors.car_fuelType as any) || errors.car_fuelType)}</p>}
            </div>
          </>
        )}

        <div className="space-y-2 md:col-span-1">
          <Label className="text-xs font-bold text-slate-700">{t("city")}</Label>
          <Input
            className="h-11 rounded-lg bg-slate-50 border-slate-200"
            value={formData.city}
            onChange={(e) => updateFormData({ city: e.target.value })}
          />
          {errors.city && <p className="text-xs text-red-500">{errors.city && (tErrors(errors.city as any) || errors.city)}</p>}
        </div>
        
        <div className="space-y-2 md:col-span-1">
          <Label className="text-xs font-bold text-slate-700">{t("district")}</Label>
          <Input
            className="h-11 rounded-lg bg-slate-50 border-slate-200"
            value={formData.district}
            onChange={(e) => updateFormData({ district: e.target.value })}
          />
          {errors.district && <p className="text-xs text-red-500">{errors.district && (tErrors(errors.district as any) || errors.district)}</p>}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label className="text-xs font-bold text-slate-700">
            {t("whatsappNumber")}
          </Label>
          <div className="relative">
            <Input
              dir="ltr"
              placeholder={t("whatsappNumberPlaceholder")}
              className="h-11 rounded-lg bg-slate-50 border-slate-200 text-start"
              value={formData.whatsappNumber || ''}
              onChange={(e) => updateFormData({ whatsappNumber: e.target.value })}
            />
          </div>
          {errors.whatsappNumber ? (
            <p className="text-xs text-red-500">{tErrors(errors.whatsappNumber as any) || errors.whatsappNumber}</p>
          ) : (
            <p className="text-xs text-slate-400">{t("whatsappHelper")}</p>
          )}
        </div>

      </div>
    </section>
  );
}
