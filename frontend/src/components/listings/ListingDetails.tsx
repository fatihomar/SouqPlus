"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Heart, MapPin, Share2, ShieldCheck, CheckCircle2, Phone, Home as HomeIcon, Zap, Car, Eye, X, Send, DollarSign, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { offersService } from '@/services/offers.service';
import { messagesService } from '@/services/messages.service';
import { favoritesService } from '@/services/favorites.service';
import { toast } from 'react-hot-toast';
import ListingImageCarousel from './ListingImageCarousel';

interface ListingDetailsProps {
  listing: any;
}

export default function ListingDetails({ listing }: ListingDetailsProps) {
  const t = useTranslations("listingDetails");
  const th = useTranslations("home");
  const [showPhone, setShowPhone] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  
  // Modals state
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [messageText, setMessageText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  
  const [isSaved, setIsSaved] = useState(
    listing?.favorites?.some((f: any) => f.userId === user?.id) || false
  );
  
  const router = useRouter();
  
  if (!listing) return null;

  const isRealEstate = listing.category === 'REAL_ESTATE';
  const isCar = listing.category === 'CAR';
  const details = listing.propertyDetails || listing.carDetails || {};

  const isOwner = isAuthenticated && user?.id === listing.seller?.id;

  const handleAction = (actionType: 'offer' | 'message') => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (isOwner) return;

    if (actionType === 'offer') {
      setShowOfferModal(true);
    } else {
      setShowMessageModal(true);
    }
  };

  const handleOfferSubmit = async () => {
    if (!offerAmount) return;
    try {
      setIsSubmitting(true);
      toast.success(t('offerSent'));
      setShowOfferModal(false);
      setOfferAmount('');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || error.response?.data?.message || t('genericError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMessageSubmit = async () => {
    if (!messageText.trim()) return;
    try {
      setIsSubmitting(true);
      toast.success(t('messageSent'));
      setShowMessageModal(false);
      setMessageText('');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || error.response?.data?.message || t('genericError'));
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing.title,
          text: `${t('checkOutListing') || 'شاهد هذا الإعلان:'} ${listing.title}`,
          url: url,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success(t('linkCopied') || 'تم نسخ الرابط');
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    try {
      setIsSaved(!isSaved);
      
      const res = await favoritesService.toggleFavorite(listing.id);
      if (res.success) {
        toast.success(res.data.isFavorited ? t('savedSuccessfully') : t('removedFromSaved'));
      }
    } catch (error: any) {
      setIsSaved(!isSaved);
      toast.error(error.response?.data?.error?.message || error.response?.data?.message || t('updateFavoriteError'));
    }
  };
  return (
    <div className="max-w-[1200px] mx-auto pb-20 px-4 sm:px-6 pt-6">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs font-black px-3 py-1 rounded-lg shadow-sm ${
              listing.listingType === 'RENT' 
                ? 'bg-primary-50 text-primary-dark' 
                : 'bg-primary-50 text-primary-dark'
            }`}>
              {listing.listingType === 'RENT' ? th("forRent") : th("forSale")}
            </span>
            <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
              {isRealEstate ? th("realEstate") : th("cars")}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2" dir="auto">{listing.title}</h1>
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium" dir="auto">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate">{listing.district && `${listing.district} - `}{listing.city}</span>
          </div>
        </div>
        
        <div className="flex flex-col items-start md:items-end">
          <div className="text-3xl font-black text-slate-900 flex items-center gap-2 justify-end">
            <span dir="ltr">${listing.price?.toLocaleString()}</span>
            {listing.listingType === 'RENT' && <span className="text-lg font-medium text-slate-500">/ {listing.rentPeriod ? t(`enums.rentPeriod.${listing.rentPeriod}`) : th("perMonth")}</span>}
          </div>
          <div className="flex items-center gap-2 mt-4">
            <Button onClick={handleShare} variant="outline" size="sm" className="gap-2 rounded-xl text-slate-600 bg-white shadow-sm border-slate-200 hover:bg-slate-50 transition-colors">
              <Share2 className="w-4 h-4" />
              {t('share')}
            </Button>
            <Button onClick={handleSave} variant="outline" size="sm" className={`gap-2 rounded-xl bg-white shadow-sm transition-colors ${isSaved ? 'border-primary text-primary hover:bg-primary-50' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-primary text-primary' : ''}`} />
              {t('save')}
            </Button>
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      <div className={`grid grid-cols-1 ${listing?.images?.length > 1 ? 'md:grid-cols-4' : ''} gap-2 mb-10 h-[300px] sm:h-[400px] md:h-[500px] rounded-3xl overflow-hidden`}>
        <div 
          className={`${listing?.images?.length > 1 ? 'md:col-span-3' : 'md:col-span-1 w-full'} bg-slate-100 h-full relative group overflow-hidden`}
        >
          {listing.images && listing.images.length > 0 ? (
            <>
              <div 
                className="hidden md:block w-full h-full cursor-pointer"
                onClick={() => setActiveImageIndex(0)}
              >
                <Image src={listing.images[0]} alt="Main" fill sizes="(max-width: 768px) 100vw, 75vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="block md:hidden w-full h-full">
                <ListingImageCarousel 
                  images={listing.images} 
                  title={listing.title} 
                  onImageClick={(idx) => setActiveImageIndex(idx)}
                />
              </div>
            </>
          ) : (
            <div className="w-full h-full bg-slate-100"></div>
          )}
        </div>
        {listing?.images?.length > 1 && (
          <div className="hidden md:flex flex-col gap-2 h-full">
            {[1, 2].map((idx) => (
              <div 
                key={idx} 
                className="bg-slate-100 flex-1 relative overflow-hidden cursor-pointer group"
                onClick={() => listing.images && listing.images[idx] && setActiveImageIndex(idx)}
              >
                {listing.images && listing.images[idx] ? (
                   <Image src={listing.images[idx]} alt={`Gallery ${idx}`} fill sizes="(max-width: 768px) 0vw, 25vw" className="object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-slate-50"></div>
                )}
              </div>
            ))}
            <div 
              className="bg-primary-light flex-1 relative overflow-hidden flex items-center justify-center cursor-pointer hover:bg-primary-light transition-colors"
              onClick={() => listing.images && listing.images.length > 0 && setActiveImageIndex(0)}
            >
              <span className="text-primary-dark font-bold flex items-center gap-2"><Eye className="w-5 h-5"/> {t('viewAll')}</span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Key Specs */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-wrap gap-6 justify-between items-center">
            {isRealEstate ? (
              <>
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-slate-500 font-medium">{th("rooms")}</span>
                  <span className="text-lg font-bold text-slate-900 flex items-center gap-2"><HomeIcon className="w-5 h-5 text-primary" /> {details.bedrooms || 0}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-slate-500 font-medium">{th("bathrooms")}</span>
                  <span className="text-lg font-bold text-slate-900 flex items-center gap-2"><Zap className="w-5 h-5 text-primary" /> {details.bathrooms || 0}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-slate-500 font-medium">{t("propertyType")}</span>
                  <span className="text-lg font-bold text-slate-900">{details.propertyType ? t(`enums.propertyType.${details.propertyType.toUpperCase()}`) : ''}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-slate-500 font-medium">{t("area")}</span>
                  <span className="text-lg font-bold text-slate-900 flex items-center gap-2" dir="ltr"><ShieldCheck className="w-5 h-5 text-primary" /> {details.area || 0} m²</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-slate-500 font-medium">{t('brand')}</span>
                  <span className="text-lg font-bold text-slate-900 flex items-center gap-2"><Car className="w-5 h-5 text-primary" /> {details.brand}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-slate-500 font-medium">{t("yearBuilt")}</span>
                  <span className="text-lg font-bold text-slate-900">{details.year}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-slate-500 font-medium">{t("transmission")}</span>
                  <span className="text-lg font-bold text-slate-900">{details.transmission ? t(`enums.transmission.${details.transmission.toUpperCase()}`) : ''}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-slate-500 font-medium">{t("condition")}</span>
                  <span className="text-lg font-bold text-slate-900">{details.condition ? t(`enums.condition.${details.condition.toUpperCase()}`) : ''}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-slate-500 font-medium">{t('mileage')}</span>
                  <span className="text-lg font-bold text-slate-900" dir="ltr">{details.mileage?.toLocaleString() || 0} km</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-slate-500 font-medium">{t("fuel")}</span>
                  <span className="text-lg font-bold text-slate-900 flex items-center gap-2"><Zap className="w-5 h-5 text-primary" /> {details.fuelType ? t(`enums.fuelType.${details.fuelType.toUpperCase()}`) : ''}</span>
                </div>
              </>
            )}
          </div>

          {/* Amenities */}
          {details.amenities && details.amenities.length > 0 && (
            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4">{t("amenities")}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {details.amenities.map((amenity: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 text-sm font-medium text-slate-700 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    {amenity}
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 relative">
          <div className="sticky top-24 bg-white rounded-3xl p-6 border border-slate-100 shadow-lg shadow-slate-200/40">
            <h3 className="text-lg font-black text-slate-900 mb-6">{t("sellerDetails")}</h3>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-primary-50 text-primary-dark flex items-center justify-center font-black text-xl shrink-0 border-2 border-primary-light">
                {listing.seller?.fullName?.charAt(0) || 'U'}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-lg" dir="auto">{listing.seller?.fullName || t('sellerDetails')}</h4>
                <div className="flex items-center gap-1 text-xs font-medium text-primary-dark bg-primary-50 w-fit px-2 py-1 rounded-md mt-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {t("verified")}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {!isOwner ? (
                <>
                  <Button 
                    onClick={() => handleAction('offer')}
                    className="w-full h-12 rounded-xl text-sm font-bold bg-primary hover:bg-primary-dark text-white flex items-center justify-center gap-2 shadow-md shadow-primary/20"
                  >
                    <DollarSign className="w-4 h-4" />
                    {t('makeOffer')}
                  </Button>
                  <Button 
                    onClick={() => handleAction('message')}
                    variant="outline" 
                    className="w-full h-12 rounded-xl text-sm font-bold border-2 border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {t('sendMessage')}
                  </Button>
                  {listing.whatsappNumber && (
                    <Button 
                      onClick={() => {
                        const cleanNum = listing.whatsappNumber?.replace(/\+/g, '').replace(/\s/g, '');
                        window.open(`https://wa.me/${cleanNum}`, '_blank');
                      }}
                      className="w-full h-12 rounded-xl text-sm font-bold bg-[#25D366] hover:bg-[#128C7E] text-white flex items-center justify-center gap-2 shadow-md"
                    >
                      <MessageCircle className="w-5 h-5" />
                      {t('whatsapp')}
                    </Button>
                  )}
                </>
              ) : (
                <div className="p-3 bg-slate-50 rounded-xl text-center text-sm font-medium text-slate-500 border border-slate-100 mt-2">
                  {t('isOwnerNotice')}
                </div>
              )}
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-100 text-xs text-slate-500 text-center leading-relaxed">
              {t('safetyWarning')}
            </div>
          </div>
        </div>

      </div>

      {/* Lightbox Modal */}
      {activeImageIndex !== null && listing.images && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center">
          <button 
            className="absolute top-6 end-6 text-white/70 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            onClick={() => setActiveImageIndex(null)}
          >
            <X className="w-8 h-8" />
          </button>
          
          <div className="w-full max-w-5xl px-4 flex items-center gap-4">
            <button 
              className="text-white/50 hover:text-white p-4"
              onClick={() => setActiveImageIndex(prev => prev! > 0 ? prev! - 1 : listing.images.length - 1)}
            >
              <div className="w-10 h-10 border-t-4 border-e-4 border-current transform -rotate-135 rtl:rotate-45" />
            </button>
            
            <div className="flex-1 h-[80vh] relative flex items-center justify-center">
              <Image 
                src={listing.images[activeImageIndex]} 
                alt="Enlarged" 
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>
            
            <button 
              className="text-white/50 hover:text-white p-4"
              onClick={() => setActiveImageIndex(prev => prev! < listing.images.length - 1 ? prev! + 1 : 0)}
            >
              <div className="w-10 h-10 border-t-4 border-e-4 border-current transform rotate-45 rtl:-rotate-135" />
            </button>
          </div>
          
          <div className="absolute bottom-6 start-0 end-0 flex justify-center gap-2">
            {listing.images.map((_: any, idx: number) => (
              <button 
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`w-3 h-3 rounded-full transition-colors ${activeImageIndex === idx ? 'bg-white' : 'bg-white/30'}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Make Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 z-[90] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-900">{t('makeOffer')}</h3>
              <button onClick={() => setShowOfferModal(false)} className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-6">{t('offerNotice')}</p>
            
            <div className="space-y-4 mb-8">
              <div className="relative">
                <span className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                <input 
                  type="number" 
                  placeholder={t('enterOffer')}
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                  className="w-full h-14 bg-slate-50 border border-slate-200 rounded-xl ps-10 pe-4 text-lg font-bold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button onClick={() => setShowOfferModal(false)} variant="outline" className="flex-1 h-12 rounded-xl text-slate-600 font-bold border-slate-200">
                {t('cancel')}
              </Button>
              <Button 
                onClick={handleOfferSubmit}
                disabled={isSubmitting || !offerAmount}
                className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold shadow-md shadow-primary/20"
              >
                {isSubmitting ? t('sendOfferLoading') : t('sendOfferButton')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Send Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 z-[90] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-900">{t('sendMessage')}</h3>
              <button onClick={() => setShowMessageModal(false)} className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-6">{t('messageNotice')}</p>
            
            <div className="space-y-4 mb-8">
              <textarea 
                placeholder={t('writeMessage')}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="w-full h-32 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 resize-none"
              />
            </div>
            
            <div className="flex gap-3">
              <Button onClick={() => setShowMessageModal(false)} variant="outline" className="flex-1 h-12 rounded-xl text-slate-600 font-bold border-slate-200">
                {t('cancel')}
              </Button>
              <Button 
                onClick={handleMessageSubmit}
                disabled={isSubmitting || !messageText.trim()}
                className="flex-1 h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold flex gap-2 items-center justify-center"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? t('sendOfferLoading') : t('send')}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
