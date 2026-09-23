"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getListings } from "@/services/listing.service";
import ListingCard from "@/components/listings/ListingCard";
import FiltersSidebar from "@/components/explore/FiltersSidebar";
import { SlidersHorizontal, Search, Home as HomeIcon, ChevronLeft, ArrowUpDown } from "lucide-react";
import Link from "next/link";

export default function ExplorePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("explore"); 
  
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // استخراج الفلاتر الحالية من الرابط
  const currentFilters: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    currentFilters[key] = value;
  });

  const category = currentFilters.category;

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const res = await getListings(currentFilters);
        if (res.success) {
          setListings(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch listings", error);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, [searchParams]);

  // تحديث الرابط عند تغيير أي فلتر
  const handleFilterChange = (newFilters: Record<string, string>) => {
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value));
      }
    });
    router.push(`/explore?${params.toString()}`);
  };

  // Category Chips Data
  const getCategoryChips = () => {
    if (category === "REAL_ESTATE") {
      return [
        { id: "all", label: t("all"), value: {} },
        { id: "sale", label: t("sale"), value: { listingType: "SALE" } },
        { id: "rent", label: t("rent"), value: { listingType: "RENT" } },
        { id: "apartments", label: t("apartments"), value: { propertyType: "APARTMENT" } },
        { id: "villas", label: t("villas"), value: { propertyType: "VILLA" } },
        { id: "offices", label: t("offices"), value: { propertyType: "OFFICE" } },
      ];
    } else if (category === "CAR") {
      return [
        { id: "all", label: t("all"), value: {} },
        { id: "sale", label: t("sale"), value: { listingType: "SALE" } },
        { id: "rent", label: t("rent"), value: { listingType: "RENT" } },
      ];
    }
    return []; // No chips if no category is selected
  };

  const chips = getCategoryChips();
  const categoryName = category === "REAL_ESTATE" ? t("realEstate") : category === "CAR" ? t("cars") : t("browseListings");
  const categorySubtitle = category === "REAL_ESTATE" ? t("realEstateSubtitle") : category === "CAR" ? t("carsSubtitle") : t("browseSubtitle");

  // Check if a chip is active
  const isChipActive = (chipValue: any) => {
    if (Object.keys(chipValue).length === 0) {
      // It's the "All" chip
      return !currentFilters.listingType && !currentFilters.propertyType && !currentFilters.condition;
    }
    // Check if the current filters match the chip's values
    return Object.entries(chipValue).every(([k, v]) => currentFilters[k] === String(v));
  };

  const handleChipClick = (chipValue: any) => {
    // Reset specific chip filters first, then apply new one
    const newFilters = { ...currentFilters };
    delete newFilters.listingType;
    delete newFilters.propertyType;
    delete newFilters.condition;

    handleFilterChange({ ...newFilters, ...chipValue });
  };

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto pb-12 px-0 sm:px-6 mt-4 sm:mt-6">
        
        {/* Header Section (Desktop & Mobile) */}
        <div className="px-4 sm:px-0 mb-6">
          {/* Breadcrumbs */}
          <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500 font-medium mb-4">
            <Link href="/home" className="hover:text-primary-dark transition-colors flex items-center gap-1">
              <HomeIcon className="w-4 h-4" />
              {t("home")}
            </Link>
            <ChevronLeft className="w-4 h-4 text-slate-300" />
            <span className="text-slate-800 font-bold">{categoryName}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 mb-2">{categoryName}</h1>
          <p className="text-slate-500 text-sm sm:text-base font-medium mb-6">{categorySubtitle}</p>

          {/* Category Chips (Horizontal Scroll) */}
          {chips.length > 0 && (
            <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
              {chips.map((chip) => {
                const active = isChipActive(chip.value);
                return (
                  <button
                    key={chip.id}
                    onClick={() => handleChipClick(chip.value)}
                    className={`whitespace-nowrap px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-bold text-sm transition-all duration-200 border shadow-sm shrink-0 flex items-center gap-2 ${
                      active 
                        ? 'bg-primary border-primary text-white shadow-primary/20' 
                        : 'bg-white border-slate-200 text-slate-600 hover:border-primary hover:text-primary-dark'
                    }`}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Mobile Action Buttons (Filters & Sort) */}
        <div className="flex sm:hidden gap-3 px-4 mb-6">
          <button 
            onClick={() => setIsMobileFiltersOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 bg-white text-slate-700 px-4 py-3 rounded-xl font-bold border border-slate-200 shadow-sm"
          >
            <SlidersHorizontal className="w-5 h-5 text-primary" />
            {t("filters")}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 items-start px-4 sm:px-0">
          
          {/* Filters Sidebar (Desktop) */}
          <div className="hidden lg:block w-[320px] sticky top-28 shrink-0 h-[calc(100vh-140px)]">
            <FiltersSidebar 
              initialFilters={currentFilters} 
              onFilterChange={handleFilterChange} 
            />
          </div>

          {/* Filters Bottom Sheet (Mobile) */}
          {isMobileFiltersOpen && (
            <div className="fixed inset-0 z-50 flex items-end lg:hidden bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsMobileFiltersOpen(false)}>
              <div 
                className="w-full h-[85vh] bg-white rounded-t-[2rem] overflow-hidden animate-in slide-in-from-bottom-full duration-300 shadow-2xl"
                onClick={e => e.stopPropagation()}
              >
                <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto my-4"></div>
                <div className="h-full px-2 pb-6">
                  <FiltersSidebar 
                    initialFilters={currentFilters} 
                    onFilterChange={handleFilterChange} 
                    onClose={() => setIsMobileFiltersOpen(false)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Listings Grid */}
          <div className="flex-1 w-full min-h-[500px]">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-100 border-t-primary"></div>
              </div>
            ) : listings.length > 0 ? (
              <div className={`grid ${listings.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6`}>
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 text-slate-400 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-xl font-bold text-slate-800 mb-2">{t("noResults")}</p>
                <p className="text-sm font-medium">{t("tryDifferentFilters")}</p>
                <button 
                  onClick={() => handleFilterChange(category ? { category } : {})}
                  className="mt-6 px-6 py-3 bg-primary text-white font-bold rounded-full hover:bg-primary-dark transition-colors shadow-sm"
                >
                  {t("clearFilters")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
