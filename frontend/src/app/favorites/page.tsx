"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { favoritesService } from "@/services/favorites.service";
import { Heart, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import ListingCard from "@/components/listings/ListingCard";
import { useTranslations } from "next-intl";

export default function FavoritesPage() {
  const t = useTranslations("favoritesPage");
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const res = await favoritesService.getFavorites();
      if (res.success) setFavorites(res.data);
    } catch (err) {
      toast.error(t("loadError"));
    } finally {
      setIsLoading(false);
    }
  };

  const removeFavorite = async (listingId: string) => {
    try {
      await favoritesService.toggleFavorite(listingId);
      setFavorites(favorites.filter((f) => f.id !== listingId));
      toast.success(t("removeSuccess"));
    } catch (err) {
      toast.error(t("removeError"));
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{t("pageTitle")}</h1>
        <p className="text-slate-500 mb-8 font-medium">{t("pageDesc")}</p>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : favorites.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{t("emptyTitle")}</h3>
            <p className="text-slate-500 text-sm">{t("emptyDesc")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {favorites.map((listing) => (
              <ListingCard 
                key={listing.id} 
                listing={listing} 
                onFavoriteToggle={(id) => setFavorites(favorites.filter(f => f.id !== id))} 
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
