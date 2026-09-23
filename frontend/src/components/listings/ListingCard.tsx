import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, MapPin, Bed, Bath, Maximize, Car, Calendar, Fuel } from 'lucide-react';
import ListingImageCarousel from './ListingImageCarousel';
import { useTranslations } from 'next-intl';
import { favoritesService } from '@/services/favorites.service';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface ListingCardProps {
  listing: any;
  onFavoriteToggle?: (listingId: string) => void;
}

export default function ListingCard({ listing, onFavoriteToggle }: ListingCardProps) {
  const t = useTranslations("home");
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(!!listing.favoriteId);
  const [isLiking, setIsLiking] = useState(false);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error(t("loginRequired"));
      router.push('/login');
      return;
    }
    
    if (isLiking) return;
    setIsLiking(true);
    
    try {
      await favoritesService.toggleFavorite(listing.id);
      setIsFavorite(!isFavorite);
      if (!isFavorite) {
         toast.success(t("addedToFavorites"));
      } else {
         toast.success(t("removedFromFavorites"));
      }
      if (onFavoriteToggle) {
        onFavoriteToggle(listing.id);
      }
    } catch (err: any) {
      const serverMsg = err.response?.data?.error?.message || err.response?.data?.error;
      if (serverMsg === 'لا يمكنك إضافة إعلانك الخاص إلى المفضلة' || serverMsg === 'You cannot favorite your own listing') {
        toast.error(t("cannotFavoriteOwn"));
      } else if (err.response?.status === 401) {
        toast.error(t("loginRequired"));
      } else {
        toast.error(typeof serverMsg === 'string' ? serverMsg : t("errorGeneric"));
      }
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <Link href={`/listings/${listing.id}`} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 relative block group">
      {/* Image Container */}
      <div className="w-full aspect-video sm:aspect-[4/3] bg-slate-100 relative overflow-hidden">
        
        {/* Badge - Top Left */}
        <div className="absolute top-3 start-3 z-10 flex gap-2">
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md shadow-sm backdrop-blur-md ${
            listing.listingType === 'RENT' 
              ? 'bg-white/90 text-slate-800' 
              : 'bg-primary/90 text-white'
          }`}>
            {listing.listingType === 'RENT' ? t("forRent") : t("forSale")}
          </span>
        </div>

        {/* Favorite - Top Right */}
        <button 
          onClick={toggleFavorite}
          disabled={isLiking}
          className={`absolute top-3 end-3 w-8 h-8 rounded-full flex items-center justify-center z-10 shadow-sm transition-all duration-300 ${isFavorite ? 'bg-red-50 text-red-500' : 'bg-white/90 backdrop-blur-md text-slate-400 hover:text-red-500'}`}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''} ${isLiking ? 'animate-pulse' : ''}`} />
        </button>

        {/* Image Carousel */}
        <ListingImageCarousel images={listing.images} title={listing.title} useNextImage={true} />
      </div>

      {/* Content Container */}
      <div className="p-3 sm:p-5 flex flex-col h-full">
        {/* Price */}
        <div className="text-lg sm:text-xl font-black text-slate-900 mb-1 flex items-center">
          <span dir="ltr" className="inline-flex items-center">
            <span className="text-primary me-1">$</span>
            {listing.price?.toLocaleString()} 
          </span>
          <span className="text-xs text-slate-400 font-medium ms-1">
            {listing.listingType === 'RENT' ? (listing.rentPeriod === 'MONTHLY' ? `/${t("perMonth")}` : `/${t("perDay")}`) : ''}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-slate-800 text-sm sm:text-base line-clamp-1 mb-1 group-hover:text-primary-dark transition-colors" dir="auto">
          {listing.title}
        </h3>
        
        {/* Location */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-4" dir="auto">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{listing.district && `${listing.district}, `}{listing.city}</span>
        </div>
        
        {/* Specs Divider */}
        <div className="mt-auto pt-3 sm:pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-xs text-slate-600 font-medium">
          {listing.category === 'REAL_ESTATE' ? (
            <>
              <div className="flex items-center gap-1.5"><Bed className="w-4 h-4 text-slate-400" /> <span>{listing.propertyDetails?.bedrooms || 0}</span></div>
              <div className="w-px h-4 bg-slate-200"></div>
              <div className="flex items-center gap-1.5"><Bath className="w-4 h-4 text-slate-400" /> <span>{listing.propertyDetails?.bathrooms || 0}</span></div>
              <div className="w-px h-4 bg-slate-200"></div>
              <div className="flex items-center gap-1.5" dir="ltr"><Maximize className="w-4 h-4 text-slate-400" /> <span>{listing.propertyDetails?.area || 0}m²</span></div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1.5" dir="ltr"><Car className="w-4 h-4 text-slate-400" /> <span>{listing.carDetails?.mileage?.toLocaleString() || 0}km</span></div>
              <div className="w-px h-4 bg-slate-200"></div>
              <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-slate-400" /> <span>{listing.carDetails?.year || '-'}</span></div>
              <div className="w-px h-4 bg-slate-200"></div>
              <div className="flex items-center gap-1"><Fuel className="w-3.5 h-3.5 text-slate-400" /> <span className="truncate max-w-[40px] sm:max-w-[60px]">{listing.carDetails?.fuelType || t("petrol")}</span></div>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
