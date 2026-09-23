"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getListings } from "@/services/listing.service";
import {
  Home as HomeIcon, 
  Car,
  MapPin,
  Heart,
  ArrowRight,
  Bed,
  Bath,
  Maximize,
  Gauge,
  Calendar
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { useRouter } from "next/navigation";
import { favoritesService } from "@/services/favorites.service";
import { useAuthStore } from "@/store/auth.store";
import toast from "react-hot-toast";

function FeaturedListingCard({ listing, t }: { listing: any; t: any }) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
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
    } catch (err: any) {
      toast.error(t("errorGeneric"));
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <Link href={`/listings/${listing.id}`} className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 group flex flex-col">
      <div className="h-[200px] w-full relative overflow-hidden bg-slate-100">
        <img src={listing.images?.[0] || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750'} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        
        {/* Top Left Badge (For Sale / Rent) */}
        <div className="absolute top-4 start-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full text-[11px] font-bold text-primary shadow-sm flex items-center gap-1.5 uppercase tracking-wider">
          {listing.category === 'CAR' ? <Car className="w-3.5 h-3.5" strokeWidth={2.5} /> : <HomeIcon className="w-3.5 h-3.5" strokeWidth={2.5} />}
          {listing.listingType === 'RENT' ? t("forRent") : t("forSale")}
        </div>

        {/* Top Right Heart */}
        <button 
          onClick={toggleFavorite}
          disabled={isLiking}
          className={`absolute top-4 end-4 w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all duration-300 ${isFavorite ? 'bg-red-50 text-red-500' : 'bg-white/95 backdrop-blur-md text-slate-400 hover:text-red-500'}`}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''} ${isLiking ? 'animate-pulse' : ''}`} strokeWidth={2} />
        </button>
      </div>
      
      <div className="p-5 flex flex-col flex-1">
        {/* Title & Location */}
        <h3 className="font-bold text-slate-900 text-[17px] mb-1.5 line-clamp-1 group-hover:text-primary transition-colors" dir="auto">
          {listing.title}
        </h3>
        <div className="flex items-center gap-1.5 text-[13px] text-slate-500 mb-5" dir="auto">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{listing.city} {listing.district && `- ${listing.district}`}</span>
        </div>

        {/* Specs Row */}
        <div className="flex items-center gap-4 text-[13px] font-medium text-slate-500 mb-5">
          {listing.category === 'REAL_ESTATE' ? (
            <>
              {listing.propertyDetails?.bedrooms !== undefined && (
                <div className="flex items-center gap-1.5">
                  <Bed className="w-4 h-4 text-slate-400" /> {listing.propertyDetails.bedrooms}
                </div>
              )}
              {listing.propertyDetails?.bathrooms !== undefined && (
                <div className="flex items-center gap-1.5">
                  <Bath className="w-4 h-4 text-slate-400" /> {listing.propertyDetails.bathrooms}
                </div>
              )}
              {listing.propertyDetails?.area !== undefined && (
                <div className="flex items-center gap-1.5">
                  <Maximize className="w-4 h-4 text-slate-400" /> {listing.propertyDetails.area} m²
                </div>
              )}
            </>
          ) : (
            <>
              {listing.carDetails?.year !== undefined && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" /> {listing.carDetails.year}
                </div>
              )}
              {listing.carDetails?.mileage !== undefined && (
                <div className="flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-slate-400" /> {listing.carDetails.mileage.toLocaleString()} km
                </div>
              )}
            </>
          )}
        </div>

        {/* Price Footer */}
        <div className="mt-auto pt-4 border-t border-slate-100/80 flex items-center">
          <p className="text-primary font-black text-xl flex items-baseline gap-1" dir="ltr">
            ${listing.price?.toLocaleString()} 
            {listing.listingType === 'RENT' && <span className="text-[13px] font-semibold text-slate-400 ms-1">{t("perMonth")}</span>}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const [latestListings, setLatestListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const t = useTranslations("home");

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await getListings();
        if (res.success) {
          setLatestListings(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch listings", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchListings();
  }, []);

  return (
    <DashboardLayout>
      <div className="mx-auto pb-24 flex flex-col gap-10 sm:gap-14 bg-slate-50 min-h-screen">
        
        {/* 1. Hero Section */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 w-full mt-4 sm:mt-6">
          <div className="relative w-full rounded-[32px] overflow-hidden bg-white border border-slate-200 min-h-[500px] md:min-h-[460px] flex flex-col md:block shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
            
            {/* Top Right Pills */}
            <div className="absolute top-4 end-4 md:top-8 md:end-8 flex items-center gap-2 md:gap-3 z-30">
              <Link href="/explore?category=REAL_ESTATE" className="bg-white/95 backdrop-blur-md hover:bg-white text-slate-800 font-bold text-xs md:text-sm px-3 md:px-5 py-2 md:py-2.5 rounded-full flex items-center gap-1.5 md:gap-2 shadow-sm transition-all hover:-translate-y-0.5">
                <HomeIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" /> {t("realEstate")}
              </Link>
              <Link href="/explore?category=CAR" className="bg-white/95 backdrop-blur-md hover:bg-white text-slate-800 font-bold text-xs md:text-sm px-3 md:px-5 py-2 md:py-2.5 rounded-full flex items-center gap-1.5 md:gap-2 shadow-sm transition-all hover:-translate-y-0.5">
                <Car className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" /> {t("cars")}
              </Link>
            </div>

            {/* Images Container (Top half on Mobile, Full background on Desktop) */}
            <div className="relative h-[280px] md:h-auto md:absolute md:inset-0 w-full overflow-hidden flex z-0 pointer-events-none">
              {/* Left side (Real Estate) */}
              <div className="w-full h-full md:absolute md:top-0 md:start-0 md:bottom-0 md:w-[28%] lg:w-[30%] md:ltr:[clip-path:polygon(0_0,100%_0,85%_100%,0_100%)] md:rtl:[clip-path:polygon(15%_0,100%_0,100%_100%,0_100%)] relative z-0">
                <img 
                  src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=2000&auto=format&fit=crop" 
                  alt="Luxury Villa" 
                  className="w-full h-full object-cover object-right pointer-events-auto"
                />
                {/* Mobile Gradient: Fade to white at bottom */}
                <div className="md:hidden absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
              </div>

              {/* Right side (Cars) with diagonal split */}
              <div className="absolute top-0 end-0 bottom-0 w-[55%] md:w-[30%] lg:w-[32%] z-10 ltr:[clip-path:polygon(15%_0,100%_0,100%_100%,0_100%)] rtl:[clip-path:polygon(0_0,85%_0,100%_100%,0_100%)] md:ltr:[clip-path:polygon(15%_0,100%_0,100%_100%,0_100%)] md:rtl:[clip-path:polygon(0_0,100%_0,85%_100%,0_100%)] pointer-events-auto">
                <img 
                  src="https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?q=80&w=2000&auto=format&fit=crop" 
                  alt="Luxury Car" 
                  className="w-full h-full object-cover object-left"
                />
                {/* Mobile Gradient: Fade to white at bottom */}
                <div className="md:hidden absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
              </div>
            </div>

            {/* Content Container */}
            <div className="relative z-20 w-full flex-1 flex flex-col justify-end md:justify-center md:items-center px-6 pb-8 md:p-14 -mt-10 md:mt-0 bg-transparent pointer-events-none">
              {/* Main Text */}
              <div className="w-full md:w-[42%] lg:w-[38%] relative z-20 text-start pointer-events-auto md:-mt-6">
                <h1 className="text-3xl sm:text-5xl lg:text-[46px] font-black leading-[1.2] md:leading-[1.15] mb-3 md:mb-5 tracking-tight text-slate-900 md:drop-shadow-sm">
                  {t("heroFind")} <span className="text-primary">{t("heroHouse")}</span><br className="hidden md:block" />{" "}
                  {t("heroForSale")} <span className="text-primary">{t("heroForRent")}</span>
                </h1>
                <p className="text-[13.5px] sm:text-base lg:text-[16px] text-slate-600 font-medium mb-6 md:mb-8 leading-relaxed md:drop-shadow-sm md:pe-4">
                  {t("heroSubtitle")}
                </p>
                <Link href="/explore" className="inline-flex items-center justify-center px-7 md:px-8 py-3 md:py-3.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-full shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 text-sm md:text-base">
                  {t("heroExplore")} <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ms-2 rtl:rotate-180" strokeWidth={2.5} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Category Cards */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 w-full mt-10 md:mt-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            
            {/* Real Estate Category Card */}
            <Link href="/explore?category=REAL_ESTATE" className="group relative bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.1)] transition-all duration-300 block h-[220px]">
              {/* Background Image (End side always) */}
              <div className="absolute top-0 end-0 bottom-0 w-[55%] z-0 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop" 
                  alt={t("realEstate")} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                />
              </div>
              
              {/* Seamless Gradient Mask */}
              <div className="absolute inset-0 z-10 bg-gradient-to-r rtl:bg-gradient-to-l from-white from-45% via-white/80 to-transparent" />

              {/* Content (Start side) */}
              <div className="relative z-20 p-6 sm:p-8 lg:p-10 flex flex-col justify-start h-full max-w-[70%]">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 text-primary rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 shrink-0">
                  <HomeIcon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-1">{t("realEstate")}</h3>
                <p className="text-slate-500 text-[13px] sm:text-sm font-medium pr-2">{t("realEstateDesc")}</p>
              </div>
              
              {/* Arrow Button (Lowered) */}
              <div className="absolute z-20 bottom-4 sm:bottom-5 start-6 sm:start-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary text-white flex items-center justify-center group-hover:bg-primary-dark transition-colors shadow-sm">
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 rtl:rotate-180" strokeWidth={2.5} />
              </div>
            </Link>

            {/* Cars Category Card */}
            <Link href="/explore?category=CAR" className="group relative bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.1)] transition-all duration-300 block h-[220px]">
              {/* Background Image (Start on Mobile, End on Desktop) */}
              <div className="absolute top-0 start-0 md:start-auto md:end-0 bottom-0 w-[55%] z-0 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?q=80&w=1200&auto=format&fit=crop" 
                  alt={t("cars")} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                />
              </div>
              
              {/* Seamless Gradient Mask */}
              <div className="absolute inset-0 z-10 bg-gradient-to-l rtl:bg-gradient-to-r md:bg-gradient-to-r md:rtl:bg-gradient-to-l from-white from-45% via-white/80 to-transparent" />

              {/* Content (End on Mobile, Start on Desktop) */}
              <div className="relative z-20 p-6 sm:p-8 lg:p-10 flex flex-col justify-start items-end text-end md:items-start md:text-start h-full max-w-[70%] ms-auto md:ms-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 text-primary rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 shrink-0">
                  <Car className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-1">{t("cars")}</h3>
                <p className="text-slate-500 text-[13px] sm:text-sm font-medium pr-2">{t("carsDesc")}</p>
              </div>
              
              {/* Arrow Button (Lowered) */}
              <div className="absolute z-20 bottom-4 sm:bottom-5 end-6 sm:end-10 md:end-auto md:start-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary text-white flex items-center justify-center group-hover:bg-primary-dark transition-colors shadow-sm">
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 rtl:rotate-180" strokeWidth={2.5} />
              </div>
            </Link>

          </div>
        </div>

        {/* 3. Featured Listings */}
        {(isLoading || latestListings.length > 0) && (
          <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 w-full mb-10">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl sm:text-[28px] font-black text-slate-900">{t("featuredListings")}</h2>
            <Link href="/explore" className="text-primary font-bold hover:text-primary-dark transition-colors flex items-center text-sm sm:text-base">
              {t("viewAll")} <ArrowRight className="w-4 h-4 ms-1.5 rtl:rotate-180" strokeWidth={2.5} />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {latestListings.slice(0, 4).map((listing: any, index) => (
              <FeaturedListingCard key={index} listing={listing} t={t} />
            ))}
            
            {/* Loading Skeletons */}
            {isLoading && (
              <>
                {[1,2,3,4].map(i => (
                  <div key={i} className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm h-[380px] animate-pulse flex flex-col">
                    <div className="h-[200px] bg-slate-100 w-full" />
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="h-5 bg-slate-100 rounded-full w-3/4 mb-3" />
                      <div className="h-3 bg-slate-100 rounded-full w-1/2 mb-6" />
                      <div className="flex gap-4 mb-5">
                        <div className="h-4 bg-slate-100 rounded-full w-10" />
                        <div className="h-4 bg-slate-100 rounded-full w-10" />
                        <div className="h-4 bg-slate-100 rounded-full w-16" />
                      </div>
                      <div className="mt-auto pt-4 border-t border-slate-100/80">
                        <div className="h-7 bg-slate-100 rounded-full w-24" />
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
