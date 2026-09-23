"use client";

import { useEffect, useState, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getMyListings, deleteListing, getMyListingsStats } from "@/services/listing.service";
import { 
  Loader2, 
  List, 
  Plus, 
  Trash2, 
  MoreVertical, 
  Edit, 
  Eye, 
  MessageSquare, 
  DollarSign, 
  Heart,
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  Gauge,
  Calendar,
  Fuel
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import ListingImageCarousel from "@/components/listings/ListingImageCarousel";

interface ListingStatsSummary {
  totalViews: number;
  totalMessages: number;
  totalOffers: number;
  totalFavorites: number;
  totalListings: number;
  activeListings: number;
  soldListings: number;
  pendingListings: number;
}

interface ListingPerformanceItem {
  id: string;
  title: string;
  thumbnail: string | null;
  category: string;
  price: number;
  status: string;
  views: number;
  messagesCount: number;
  offersCount: number;
  favoritesCount: number;
}

export default function MyListingsPage() {
  const t = useTranslations("myListingsPage");
  const tHome = useTranslations("home");
  const [listings, setListings] = useState<any[]>([]);
  const [stats, setStats] = useState<{ summary: ListingStatsSummary; listings: ListingPerformanceItem[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("All");

  const tabs = [
    { id: "All", label: t("tabAll") },
    { id: "For Sale", label: t("tabForSale") },
    { id: "For Rent", label: t("tabForRent") },
    { id: "Active", label: t("tabActive") },
    { id: "Sold", label: t("tabSold") },
    { id: "Rented", label: t("tabRented") }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const listingsRes = await getMyListings();
      const userListings = listingsRes.success 
        ? listingsRes.data.filter((l: any) => l.status !== 'DELETED')
        : [];
      setListings(userListings);

      if (userListings.length > 0) {
        try {
          const statsRes = await getMyListingsStats();
          if (statsRes && statsRes.summary) {
            setStats(statsRes);
          }
        } catch (statsErr) {
          console.error("Failed to load listings stats:", statsErr);
        }
      } else {
        setStats(null);
      }
    } catch (err) {
      console.error("Failed to load listings:", err);
      toast.error("حدث خطأ أثناء تحميل إعلاناتك");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("deleteConfirm"))) {
      return;
    }
    
    try {
      const res = await deleteListing(id);
      if (res.success) {
        toast.success(res.message || t("deleteSuccess"));
        const updated = listings.filter(l => l.id !== id);
        setListings(updated);
        if (updated.length === 0) {
          setStats(null);
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error?.message || err.response?.data?.message || t("deleteError"));
      if (err.response?.status === 404 || err.response?.data?.message === 'الإعلان غير موجود مسبقاً') {
        setListings(listings.filter(listing => listing.id !== id));
      }
    }
  };

  const filteredListings = useMemo(() => {
    return listings.filter(l => {
      if (activeTab === "All") return true;
      if (activeTab === "For Sale") return l.listingType !== 'RENT';
      if (activeTab === "For Rent") return l.listingType === 'RENT';
      if (activeTab === "Active") return l.status === "ACTIVE";
      if (activeTab === "Sold") return l.status === "SOLD";
      if (activeTab === "Rented") return l.status === "RENTED";
      return true;
    });
  }, [listings, activeTab]);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 min-h-screen bg-[#F8FAFC]">
        
        {/* Header Section */}
        <div className="flex flex-col justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#102A2A]">{t("pageTitle")}</h1>
            <p className="text-sm text-[#64748B] mt-1">{t("pageSubtitle")}</p>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#087F5B]" />
            <p className="font-medium text-sm">{t("loading")}</p>
          </div>
        ) : listings.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-2xl border border-[#E2E8F0] text-center px-6 mt-8">
            <div className="w-16 h-16 bg-[#EAF7F1] text-[#087F5B] rounded-full flex items-center justify-center mb-4">
              <List className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-[#102A2A] mb-2">{t("emptyTitle")}</h3>
            <p className="text-[#64748B] mb-6 text-sm max-w-sm">
              {t("emptySubtitle")}
            </p>
            <Link 
              href="/create-listing" 
              className="bg-[#087F5B] hover:bg-[#065A42] text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{t("postNewAd")}</span>
            </Link>
          </div>
        ) : (
          <>
            {/* Statistics Row (Minimal) */}
            {stats && stats.summary && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-xl p-4 border border-[#E2E8F0] flex items-center gap-3">
                  <Eye className="w-5 h-5 text-[#087F5B]" />
                  <div>
                    <div className="text-xs text-[#64748B] font-medium">{t("totalViews")}</div>
                    <div className="text-lg font-bold text-[#102A2A]">{stats.summary.totalViews.toLocaleString()}</div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-[#E2E8F0] flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-[#087F5B]" />
                  <div>
                    <div className="text-xs text-[#64748B] font-medium">{t("messages")}</div>
                    <div className="text-lg font-bold text-[#102A2A]">{stats.summary.totalMessages.toLocaleString()}</div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-[#E2E8F0] flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-[#087F5B]" />
                  <div>
                    <div className="text-xs text-[#64748B] font-medium">{t("offers")}</div>
                    <div className="text-lg font-bold text-[#102A2A]">{stats.summary.totalOffers.toLocaleString()}</div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-[#E2E8F0] flex items-center gap-3">
                  <Heart className="w-5 h-5 text-[#087F5B]" />
                  <div>
                    <div className="text-xs text-[#64748B] font-medium">{t("favorites")}</div>
                    <div className="text-lg font-bold text-[#102A2A]">{stats.summary.totalFavorites.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Filters / Tabs */}
            <div className="flex overflow-x-auto hide-scrollbar gap-6 border-b border-[#E2E8F0] mb-6 pb-px">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-3 text-sm font-medium whitespace-nowrap transition-colors relative ${
                    activeTab === tab.id 
                      ? "text-[#087F5B]" 
                      : "text-[#64748B] hover:text-[#102A2A]"
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 start-0 end-0 h-0.5 bg-[#087F5B] rounded-t-full"></span>
                  )}
                </button>
              ))}
            </div>

            {/* Backdrop for dropdown */}
            {activeDropdown && (
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setActiveDropdown(null)}
              />
            )}

            {/* Listings Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {filteredListings.map((listing) => {
                const itemStats = stats?.listings?.find((l) => l.id === listing.id);
                const isRealEstate = listing.category === "REAL_ESTATE" || listing.category?.nameEn === "Real Estate";
                
                return (
                  <div key={listing.id} className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden flex flex-col hover:shadow-sm transition-shadow">
                    
                    {/* Top Image Area */}
                    <div className="relative aspect-[4/3] bg-slate-100">
                      <ListingImageCarousel images={listing.images} title={listing.title} useNextImage={false} />

                      {/* Badges - Top Left */}
                      <div className="absolute top-3 start-3 flex gap-2">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide shadow-sm ${
                          listing.listingType === 'RENT' 
                            ? 'bg-slate-100 text-[#64748B]' 
                            : 'bg-[#EAF7F1] text-[#087F5B]'
                        }`}>
                          {listing.listingType === 'RENT' ? tHome("forRent") : tHome("forSale")}
                        </span>
                        
                        {listing.status === 'PENDING_REVIEW' && (
                          <span className="bg-amber-50 text-amber-600 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide shadow-sm">
                            {t("statusPending")}
                          </span>
                        )}
                        {(listing.status === 'SOLD' || listing.status === 'RENTED') && (
                          <span className="bg-red-50 text-red-600 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide shadow-sm">
                            {listing.status === 'SOLD' ? t("statusSold") : t("statusRented")}
                          </span>
                        )}
                      </div>

                      {/* Category Badge - Top Right */}
                      <div className="absolute top-3 end-3">
                        <span className="bg-white/95 text-[#087F5B] px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm backdrop-blur-md">
                          {isRealEstate ? tHome("realEstate") : tHome("cars")}
                        </span>
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="text-lg font-bold text-[#087F5B] mb-1">
                        ${listing.price?.toLocaleString()}
                        {listing.title.toLowerCase().includes('rent') && <span className="text-xs text-[#64748B] font-normal ms-1">/ month</span>}
                      </div>
                      
                      <h3 className="font-bold text-[#102A2A] text-sm line-clamp-1 mb-1">
                        {listing.title}
                      </h3>
                      
                      <div className="flex items-center gap-1 text-xs text-[#64748B] mb-3">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="line-clamp-1">{listing.district ? `${listing.district}, ` : ''}{listing.city || "Location"}</span>
                      </div>

                      {/* Specs Row */}
                      <div className="flex items-center gap-3 text-xs text-[#64748B] mb-4 mt-auto border-t border-[#E2E8F0] pt-3">
                        {isRealEstate ? (
                          <>
                            <div className="flex items-center gap-1" title="Bedrooms">
                              <BedDouble className="w-3.5 h-3.5" />
                              <span>{listing.propertyDetails?.bedrooms || "-"}</span>
                            </div>
                            <div className="flex items-center gap-1" title="Bathrooms">
                              <Bath className="w-3.5 h-3.5" />
                              <span>{listing.propertyDetails?.bathrooms || "-"}</span>
                            </div>
                            <div className="flex items-center gap-1" title="Area">
                              <Maximize className="w-3.5 h-3.5" />
                              <span>{listing.propertyDetails?.area || "-"} m²</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-1" title="Mileage">
                              <Gauge className="w-3.5 h-3.5" />
                              <span>{listing.carDetails?.mileage ? `${listing.carDetails.mileage.toLocaleString()} km` : "-"}</span>
                            </div>
                            <div className="flex items-center gap-1" title="Year">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{listing.carDetails?.year || "-"}</span>
                            </div>
                            <div className="flex items-center gap-1" title="Fuel Type">
                              <Fuel className="w-3.5 h-3.5" />
                              <span>{listing.carDetails?.fuelType || "-"}</span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Very subtle performance stats row */}
                      {itemStats && (
                        <div className="flex items-center justify-between text-[10px] text-[#64748B] mb-3 bg-slate-50 px-2 py-1.5 rounded-lg">
                          <span className="flex items-center gap-1" title="Views"><Eye className="w-3 h-3"/> {itemStats.views}</span>
                          <span className="flex items-center gap-1" title="Messages"><MessageSquare className="w-3 h-3"/> {itemStats.messagesCount}</span>
                          <span className="flex items-center gap-1" title="Offers"><DollarSign className="w-3 h-3"/> {itemStats.offersCount}</span>
                          <span className="flex items-center gap-1" title="Favorites"><Heart className="w-3 h-3"/> {itemStats.favoritesCount}</span>
                        </div>
                      )}

                      {/* Footer Actions */}
                      <div className="flex items-center gap-2 pt-2">
                        <Link 
                          href={`/listings/${listing.id}`}
                          className="flex-1 text-center py-1.5 text-xs font-medium text-[#102A2A] hover:bg-slate-50 rounded-md border border-[#E2E8F0] transition-colors"
                        >
                          {t("viewButton")}
                        </Link>
                        <Link 
                          href={`/edit-listing/${listing.id}`}
                          className="flex-1 text-center py-1.5 text-xs font-medium text-[#102A2A] hover:bg-slate-50 rounded-md border border-[#E2E8F0] transition-colors"
                        >
                          {t("editButton")}
                        </Link>
                        
                        <div className="relative z-10">
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setActiveDropdown(activeDropdown === listing.id ? null : listing.id);
                            }}
                            className="p-1.5 border border-[#E2E8F0] text-[#64748B] hover:bg-slate-50 rounded-md transition-colors"
                            title="More"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>
                          
                          {activeDropdown === listing.id && (
                            <div 
                              className="absolute bottom-full mb-1 end-0 bg-white rounded-lg shadow-lg border border-[#E2E8F0] py-1 w-28 overflow-hidden z-30"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                            >
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleDelete(listing.id);
                                  setActiveDropdown(null);
                                }}
                                className="w-full text-start px-3 py-2 text-[11px] font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>{t("deleteButton")}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
            
            {filteredListings.length === 0 && (
              <div className="py-20 text-center text-[#64748B] text-sm">
                {t("noListingsFound")}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
