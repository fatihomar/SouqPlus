"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCreateListingStore } from "@/store/createListingStore";
import { basicInfoSchema, propertyDetailsSchema, carDetailsSchema } from "@/validations/listingSchema";
import { uploadImages } from "@/services/upload.service";
import { createListing, updateListing } from "@/services/listing.service";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { CategorySelector } from "./create-listing/CategorySelector";
import { BasicInfoSection } from "./create-listing/BasicInfoSection";

import { AmenitiesSection } from "./create-listing/AmenitiesSection";
import { MediaUploadSection } from "./create-listing/MediaUploadSection";

// Property types and amenities moved to respective components

interface CreateListingFormProps {
  isEditMode?: boolean;
  initialData?: any;
  listingId?: string;
}

export default function CreateListingForm({ isEditMode = false, initialData, listingId }: CreateListingFormProps) {
  const router = useRouter();
  const { formData, updateFormData, resetForm } = useCreateListingStore();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>(initialData?.images || []);
  const t = useTranslations("createListing");
  const tErrors = useTranslations("errors");
  const locale = useLocale();
  const { aiService } = require("@/services/ai.service");

  // Populate form with initial data when in edit mode
  useEffect(() => {
    if (isEditMode && initialData) {
      updateFormData(initialData);
    }
    
    // Cleanup function to reset form when leaving the page (optional, 
    // but ensures we don't leak edit state into create state)
    return () => {
      if (isEditMode) {
        resetForm();
      }
    };
  }, [isEditMode, initialData, updateFormData, resetForm]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const totalImages = previewUrls.length + filesArray.length;
      if (totalImages > 20) {
        toast.error("You can only upload up to 20 photos");
        return;
      }
      const newImages = [...selectedImages, ...filesArray];
      setSelectedImages(newImages);
      
      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setPreviewUrls([...previewUrls, ...newPreviews]);
      updateFormData({ images: newImages });
    }
  };

  const removeImage = (index: number) => {
    // If it's a pre-existing URL from edit mode, just remove it from previewUrls.
    const newPreviewUrls = [...previewUrls];
    newPreviewUrls.splice(index, 1);
    setPreviewUrls(newPreviewUrls);

    const existingUrlCount = previewUrls.length - selectedImages.length;
    if (index >= existingUrlCount) {
      const fileIndex = index - existingUrlCount;
      const newImages = [...selectedImages];
      newImages.splice(fileIndex, 1);
      setSelectedImages(newImages);
      updateFormData({ images: newImages });
    }
  };

  // Handlers for image upload and validation stay here

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validate Basic Info
    const basicResult = basicInfoSchema.safeParse(formData);
    let validationErrors: Record<string, string> = {};
    
    if (!basicResult.success) {
      basicResult.error.issues.forEach((issue) => {
        if (issue.path[0]) validationErrors[issue.path[0].toString()] = issue.message;
      });
    }

    // Helper to clean empty string values so Zod's optional() works correctly
    const cleanEmptyStrings = (obj: any) => {
      if (!obj) return {};
      const cleaned = { ...obj };
      Object.keys(cleaned).forEach(key => {
        if (cleaned[key] === '') delete cleaned[key];
      });
      return cleaned;
    };

    if (formData.category === 'REAL_ESTATE') {
      const cleanedProps = cleanEmptyStrings(formData.propertyDetails);
      const propResult = propertyDetailsSchema.safeParse(cleanedProps);
      if (!propResult.success) {
        propResult.error.issues.forEach((issue) => {
          if (issue.path[0]) validationErrors[`property_${issue.path[0].toString()}`] = issue.message;
        });
      }
    } else if (formData.category === 'CAR') {
      const cleanedProps = cleanEmptyStrings(formData.propertyDetails);
      const carResult = carDetailsSchema.safeParse(cleanedProps);
      if (!carResult.success) {
        carResult.error.issues.forEach((issue) => {
          if (issue.path[0]) validationErrors[`car_${issue.path[0].toString()}`] = issue.message;
        });
      }
    }

    if (previewUrls.length === 0) {
      validationErrors['images'] = "You must upload at least one photo";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error(t("formErrors"));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      setIsSubmitting(true);
      


      toast.loading(t("uploadingImages"), { id: 'submit' });
      
      let imageUrls: string[] = [];
      if (selectedImages.length > 0) {
        imageUrls = await uploadImages(selectedImages);
      }
      
      // Combine existing URLs that were kept + newly uploaded URLs
      const existingUrls = previewUrls.filter(url => !url.startsWith('blob:'));
      const finalImages = [...existingUrls, ...imageUrls];
      
      toast.loading(isEditMode ? t("updatingListing") : t("publishingListing"), { id: 'submit' });
      
      const payload: any = {
        title: formData.title,
        category: formData.category,
        listingType: formData.listingType,
        price: Number(formData.price),
        city: formData.city,
        district: formData.district,
        whatsappNumber: formData.whatsappNumber || undefined,
        images: finalImages,
      };

      if (formData.rentPeriod) {
        payload.rentPeriod = formData.rentPeriod;
      }

      if (formData.category === 'REAL_ESTATE') {
        payload.propertyDetails = {
          propertyType: formData.propertyDetails?.propertyType,
          area: Number(formData.propertyDetails?.area),
          bedrooms: Number(formData.propertyDetails?.bedrooms) || undefined,
          bathrooms: Number(formData.propertyDetails?.bathrooms) || undefined,
          floor: Number(formData.propertyDetails?.floor) || undefined,
          yearBuilt: Number(formData.propertyDetails?.yearBuilt) || undefined,
          amenities: formData.propertyDetails?.amenities || [],
        };
      } else if (formData.category === 'CAR') {
        payload.carDetails = {
          brand: (formData.propertyDetails as any)?.brand,
          model: (formData.propertyDetails as any)?.model,
          year: Number((formData.propertyDetails as any)?.year),
          mileage: Number((formData.propertyDetails as any)?.mileage) || undefined,
          fuelType: (formData.propertyDetails as any)?.fuelType,
          transmission: (formData.propertyDetails as any)?.transmission,
          condition: (formData.propertyDetails as any)?.condition,
        };
      }

      if (isEditMode && listingId) {
        const updatePayload = { ...payload };
        delete updatePayload.category;
        delete updatePayload.listingType;
        delete updatePayload.city;
        delete updatePayload.district;
        
        await updateListing(listingId, updatePayload);
        toast.success(t("updateSuccess"), { id: 'submit' });
      } else {
        await createListing(payload);
        toast.success(t("publishSuccess"), { id: 'submit' });
      }
      
      resetForm();
      router.push("/my-listings"); 
      
    } catch (error: any) {
      console.error("Submit Error:", JSON.stringify(error.response?.data || error.message));
      console.error("Failed URL:", error.config?.url);
      const backendDetails = error.response?.data?.details;
      let errorMsg = error.response?.data?.error?.message || error.message || t("publishError");
      
      if (backendDetails && Array.isArray(backendDetails)) {
        errorMsg = backendDetails.map((d: any) => {
          if (!d || typeof d.message !== 'string') return "Error";
          try { return tErrors(d.message as any); } catch { return d.message; }
        }).join(' | ');
      } else if (errorMsg && errorMsg.startsWith('ERR_')) {
        try { errorMsg = tErrors(errorMsg as any); } catch {}
      }
      
      toast.error(errorMsg, { id: 'submit', duration: 5000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      
      {/* Left Column: Form Details */}
      <div className="lg:col-span-2 space-y-10">
        <CategorySelector errors={errors} tErrors={tErrors} />
        
        {formData.category && (
          <>
            <BasicInfoSection errors={errors} tErrors={tErrors} />

              {formData.category === 'REAL_ESTATE' && <AmenitiesSection />}
          </>
        )}
      </div>

      {/* Right Column: Photos & Publish */}
      {formData.category && (
        <div className="lg:col-span-1 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
          <MediaUploadSection 
            errors={errors} 
            tErrors={tErrors} 
            handleImageChange={handleImageChange} 
            removeImage={removeImage} 
            previewUrls={previewUrls} 
          />



        {/* Publish Button */}
        <div className="pt-4">
          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary-dark text-white rounded-xl py-6 font-bold shadow-lg shadow-primary/20"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                {isEditMode ? t("updatingListing") : t("publishingListing")}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                {isEditMode ? t("saveChanges") : t("publishListing")}
              </span>
            )}
          </Button>
          <p className="text-center text-[10px] text-slate-500 mt-3 flex items-center justify-center gap-1">
             {t("reviewNotice")}
          </p>
        </div>

        </div>
      )}
    </form>
  );
}
