"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getExternalListingById } from "@/services/external-listings.service";
import ListingImageCarousel from "@/components/listings/ListingImageCarousel";
import { MapPin, Globe, ExternalLink, ChevronLeft, Calendar } from "lucide-react";
import { useTranslations } from "next-intl";

export default function ExternalListingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("home");
  const listingId = params.id as string;
  
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await getExternalListingById(listingId);
        if (res.success) {
          setListing(res.data);
        } else {
          router.push('/explore');
        }
      } catch (error) {
        console.error("Failed to fetch external listing details", error);
        router.push('/explore');
      } finally {
        setLoading(false);
      }
    };
    if (listingId) fetchListing();
  }, [listingId, router]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[70vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-100 border-t-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!listing) return null;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto pb-24 pt-4 sm:pt-8 px-4 sm:px-6">
        
        {/* Back Button & Header */}
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-1 text-slate-500 hover:text-primary transition-colors mb-6 font-medium text-sm"
        >
          <ChevronLeft className="w-5 h-5" />
          {t("back") || "Back"}
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Images */}
          <div className="w-full aspect-video md:aspect-[21/9] bg-slate-100 relative">
             <div className="absolute top-4 start-4 z-10">
               <span className="text-xs font-bold px-3 py-1.5 rounded-lg shadow-md backdrop-blur-md bg-emerald-500/90 text-white flex items-center gap-1.5">
                 <Globe className="w-4 h-4" />
                 {listing.source}
               </span>
             </div>
             {listing.images && listing.images.length > 0 ? (
               <ListingImageCarousel images={listing.images} title={listing.title} useNextImage={true} />
             ) : (
               <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium">
                 {t("noImage") || "No Image"}
               </div>
             )}
          </div>

          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
              
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-3 leading-tight" dir="auto">
                  {listing.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 font-medium">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>
                      {listing.location?.district && `${listing.location.district}, `}
                      {listing.location?.city || "Unknown"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{new Date(listing.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Price & CTA */}
              <div className="flex flex-col items-start md:items-end gap-4 min-w-[200px] shrink-0 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-3xl font-black text-primary flex items-center">
                  {listing.price ? (
                    <>
                      <span className="text-2xl me-1">{listing.currency === 'USD' ? '$' : listing.currency}</span>
                      {listing.price.toLocaleString()}
                    </>
                  ) : (
                    <span className="text-lg text-slate-500">{t("contactForPrice") || "Contact for price"}</span>
                  )}
                </div>
                
                <a 
                  href={listing.externalUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-6 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold flex justify-center items-center gap-2 transition-all shadow-sm shadow-primary/20 hover:shadow-md"
                >
                  {t("viewOriginalListing") || "View Original"}
                  <ExternalLink className="w-4 h-4" />
                </a>
                <p className="text-[10px] text-slate-400 text-center w-full mt-1">
                   You will be redirected to an external partner
                </p>
              </div>
            </div>

            {/* Description */}
            {listing.description && (
              <div className="border-t border-slate-100 pt-8 mt-4">
                <h2 className="text-xl font-bold text-slate-800 mb-4">{t("description") || "Description"}</h2>
                <div 
                  className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap text-[15px]" 
                  dir="auto"
                >
                  {listing.description}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
