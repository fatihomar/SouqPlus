"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getListingById } from "@/services/listing.service";
import ListingDetails from "@/components/listings/ListingDetails";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

export default function ListingPage() {
  const t = useTranslations("listingDetails");
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const res = await getListingById(id);
        if (res.success) {
          setListing(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch listing", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchListing();
    }
  }, [id]);

  return (
    <DashboardLayout>
      {loading ? (
        <div className="flex justify-center items-center h-[60vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : listing ? (
        <ListingDetails listing={listing} />
      ) : (
        <div className="flex flex-col items-center justify-center py-32 text-slate-400">
          <p className="text-xl font-bold">{t('notFound')}</p>
        </div>
      )}
    </DashboardLayout>
  );
}
