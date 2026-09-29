import React from 'react';
import Link from 'next/link';
import { MapPin, ExternalLink } from 'lucide-react';
import ListingImageCarousel from './ListingImageCarousel';
import { useTranslations } from 'next-intl';

interface ExternalListingCardProps {
  listing: any;
}

export default function ExternalListingCard({ listing }: ExternalListingCardProps) {
  const t = useTranslations("home");

  return (
    <Link href={`/external-listings/${listing.id}`} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 relative block group">
      {/* Image Container */}
      <div className="w-full aspect-video sm:aspect-[4/3] bg-slate-100 relative overflow-hidden">
        
        {/* Source Badge - Top Left */}
        <div className="absolute top-3 start-3 z-10 flex gap-2">
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-md shadow-sm backdrop-blur-md bg-emerald-500/90 text-white flex items-center gap-1">
            <ExternalLink className="w-3 h-3" />
            {listing.source}
          </span>
        </div>

        {/* Image Carousel */}
        <ListingImageCarousel images={listing.images || []} title={listing.title} useNextImage={true} />
      </div>

      {/* Content Container */}
      <div className="p-3 sm:p-5 flex flex-col h-full">
        {/* Price */}
        <div className="text-lg sm:text-xl font-black text-slate-900 mb-1 flex items-center">
          {listing.price ? (
            <span dir="ltr" className="inline-flex items-center">
              <span className="text-primary me-1">{listing.currency === 'USD' ? '$' : listing.currency}</span>
              {listing.price.toLocaleString()} 
            </span>
          ) : (
            <span className="text-sm text-slate-500">{t("contactForPrice") || "Contact for price"}</span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-slate-800 text-sm sm:text-base line-clamp-2 mb-1 group-hover:text-primary-dark transition-colors" dir="auto">
          {listing.title}
        </h3>
        
        {/* Location */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-4" dir="auto">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">
            {listing.location?.district && `${listing.location.district}, `}
            {listing.location?.city || "Unknown"}
          </span>
        </div>
        
        {/* Action button */}
        <div className="mt-auto pt-3 sm:pt-4 border-t border-slate-100 flex items-center justify-center">
            <span className="text-xs font-bold text-primary group-hover:text-primary-dark transition-colors flex items-center gap-1">
                {t("viewDetails") || "View Details"}
            </span>
        </div>
      </div>
    </Link>
  );
}
