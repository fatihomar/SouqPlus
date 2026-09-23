"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import DashboardLayout from '@/components/layout/DashboardLayout';
import CreateListingForm from '@/components/listings/CreateListingForm';
import { getListingById } from '@/services/listing.service';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';

export default function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const t = useTranslations('editListing');
  const [isClient, setIsClient] = useState(false);
  const [initialData, setInitialData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      if (!isAuthenticated) {
        router.push('/login');
      } else {
        loadListing();
      }
    }
  }, [isClient, isAuthenticated, user, router]);

  const loadListing = async () => {
    try {
      const res = await getListingById(unwrappedParams.id);
      if (res.success && res.data) {
        const listing = res.data;
        
        // Security check: ensure the current user owns this listing
        if (listing.sellerId !== user?.id) {
          toast.error("ليس لديك صلاحية لتعديل هذا الإعلان");
          router.push('/my-listings');
          return;
        }

        // Map backend listing to frontend formData structure
        const mappedData: any = {
          title: listing.title,

          category: listing.category,
          listingType: listing.listingType,
          price: listing.price,
          city: listing.city,
          district: listing.district,
          images: listing.images,
        };

        if (listing.rentPeriod) {
          mappedData.rentPeriod = listing.rentPeriod;
        }

        if (listing.category === 'REAL_ESTATE' && listing.propertyDetails) {
          mappedData.propertyDetails = {
            propertyType: listing.propertyDetails.propertyType,
            area: listing.propertyDetails.area,
            bedrooms: listing.propertyDetails.bedrooms || '',
            bathrooms: listing.propertyDetails.bathrooms || '',
            floor: listing.propertyDetails.floor || '',
            yearBuilt: listing.propertyDetails.yearBuilt || '',
            amenities: listing.propertyDetails.amenities || [],
          };
        } else if (listing.category === 'CAR' && listing.carDetails) {
          mappedData.propertyDetails = { // Note: mapped to propertyDetails to match CreateListingForm's unified state
            brand: listing.carDetails.brand,
            model: listing.carDetails.model,
            year: listing.carDetails.year,
            mileage: listing.carDetails.mileage || '',
            fuelType: listing.carDetails.fuelType,
            transmission: listing.carDetails.transmission,
            condition: listing.carDetails.condition,
          };
        }

        setInitialData(mappedData);
      }
    } catch (err: any) {
      console.error(err);
      toast.error("تعذر تحميل الإعلان");
      router.push('/my-listings');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isClient || !isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-32 text-slate-400">
          <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
          <p>جاري تحميل بيانات الإعلان...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-[1200px] mx-auto pb-12">
        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t('title')}</h1>
            <p className="mt-2 text-sm text-slate-500 font-medium">
              {t('subtitle')}
            </p>
          </div>
        </div>
        
        {initialData && (
          <CreateListingForm 
            isEditMode={true} 
            initialData={initialData} 
            listingId={unwrappedParams.id} 
          />
        )}
      </div>
    </DashboardLayout>
  );
}
