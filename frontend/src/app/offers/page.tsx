"use client";

import { useEffect, useState, Suspense } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { offersService } from "@/services/offers.service";
import { useTranslations, useLocale } from "next-intl";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, DollarSign, Check, X, ExternalLink, User as UserIcon } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { aiService } from "@/services/ai.service";
import { Sparkles } from "lucide-react";

function OffersContent() {
  const t = useTranslations("offers");
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = useLocale();
  
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [receivedOffers, setReceivedOffers] = useState<any[]>([]);
  const [sentOffers, setSentOffers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [aiAdvice, setAiAdvice] = useState<Record<string, any>>({});
  const [isAnalyzing, setIsAnalyzing] = useState<string | null>(null);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'sent') {
      setActiveTab('sent');
    } else {
      setActiveTab('received');
    }
  }, [searchParams]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [receivedRes, sentRes] = await Promise.all([
        offersService.getReceivedOffers(),
        offersService.getMyOffers()
      ]);
      setReceivedOffers(receivedRes.data || []);
      setSentOffers(sentRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error(t("fetchError"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRespond = async (offerId: string, action: 'ACCEPT' | 'REJECT') => {
    setIsProcessing(offerId);
    try {
      await offersService.respondToOffer(offerId, action);
      toast.success(action === 'ACCEPT' ? t("statusAccepted") : t("statusRejected"));
      loadData(); // Reload everything to get updated statuses
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("generalError"));
    } finally {
      setIsProcessing(null);
    }
  };

  const handleAskAI = async (offer: any) => {
    setIsAnalyzing(offer.id);
    try {
      const result = await aiService.negotiateOffer(offer.listing.price, offer.amount, "No message", locale);
      if (result && result.data) {
        setAiAdvice(prev => ({ ...prev, [offer.id]: result.data }));
        toast.success(t("aiSuccess"));
      }
    } catch (err) {
      toast.error(t("aiError"));
    } finally {
      setIsAnalyzing(null);
    }
  };

  const renderOfferStatus = (offer: any) => {
    const isAutoRejected = offer.status === 'REJECTED' && ['SOLD', 'RENTED'].includes(offer.listing?.status);
    
    if (isAutoRejected) {
      return (
        <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold border border-red-100 whitespace-nowrap">
          {t("autoRejected")}
        </span>
      );
    }

    switch (offer.status) {
      case 'PENDING':
        return <span className="px-3 py-1 bg-primary-50 text-primary-dark rounded-full text-xs font-bold border border-primary-light">{t("statusPending")}</span>;
      case 'ACCEPTED':
        return <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold border border-green-100">{t("statusAccepted")}</span>;
      case 'REJECTED':
        return <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold border border-red-100">{t("statusRejected")}</span>;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-primary-light text-primary-dark rounded-xl">
          <DollarSign className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">{t("title")}</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 mb-6 overflow-x-auto no-scrollbar">
        <button
          onClick={() => { setActiveTab('received'); router.replace('/offers?tab=received'); }}
          className={`pb-4 px-2 text-sm font-bold transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'received' 
              ? 'border-primary text-primary-dark' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          {t("receivedOffers")} {receivedOffers.length > 0 && `(${receivedOffers.length})`}
        </button>
        <button
          onClick={() => { setActiveTab('sent'); router.replace('/offers?tab=sent'); }}
          className={`pb-4 px-2 text-sm font-bold transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'sent' 
              ? 'border-primary text-primary-dark' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          {t("sentOffers")} {sentOffers.length > 0 && `(${sentOffers.length})`}
        </button>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mb-4" />
        </div>
      ) : (
        <div className="grid gap-4">
          {activeTab === 'received' ? (
            receivedOffers.length === 0 ? (
              <div className="text-center py-20 text-slate-500 bg-slate-50 rounded-3xl border border-slate-100">
                {t("noReceivedOffers")}
              </div>
            ) : (
              receivedOffers.map(offer => (
                <div key={offer.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-5 items-start md:items-center hover:border-slate-200 transition-colors">
                  {/* Listing Image & Info */}
                  <div className="flex gap-4 w-full md:w-1/3">
                    <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                      {offer.listing?.images?.[0] ? (
                        <img src={offer.listing.images[0]} alt="listing" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <DollarSign className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col justify-center min-w-0">
                      <Link href={`/listings/${offer.listingId}`} className="font-bold text-slate-900 truncate hover:text-primary-dark transition-colors block text-sm">
                        {offer.listing?.title}
                      </Link>
                      <Link href={`/listings/${offer.listingId}`} className="text-xs text-slate-500 mt-1 flex items-center gap-1 hover:text-primary-dark w-fit">
                        <ExternalLink className="w-3 h-3" /> {t("viewListing")}
                      </Link>
                    </div>
                  </div>

                  {/* Buyer & Offer Amount */}
                  <div className="flex-1 w-full grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-400 mb-1">{t("buyer")}</p>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary-light text-primary-dark flex items-center justify-center shrink-0">
                          <UserIcon className="w-3 h-3" />
                        </div>
                        <span className="font-medium text-slate-700 text-sm truncate">{offer.buyer?.fullName}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">{t("amount")}</p>
                      <p className="font-black text-primary text-lg">${offer.amount?.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* AI Advice Badge (if exists) */}
                  {aiAdvice[offer.id] && (
                    <div className="w-full mt-3 p-4 rounded-xl bg-primary-50 border border-primary-light flex flex-col gap-2">
                      <div className="flex items-center gap-2 font-bold text-primary-dark text-sm">
                        <Sparkles className="w-4 h-4" /> 
                        {t("aiAdviceLabel")}
                        <span className={
                          aiAdvice[offer.id].recommended_action === 'ACCEPT' ? 'text-green-600' :
                          aiAdvice[offer.id].recommended_action === 'REJECT' ? 'text-red-600' : 'text-primary-dark'
                        }>
                          {aiAdvice[offer.id].recommended_action === 'ACCEPT' ? t("aiAccept") : 
                           aiAdvice[offer.id].recommended_action === 'REJECT' ? t("aiReject") : t("aiNegotiate")}
                        </span>
                      </div>
                      <p className="text-xs text-primary-dark">{aiAdvice[offer.id].reasoning}</p>
                      <p className="text-xs font-medium text-primary-dark bg-white/50 p-2 rounded-lg mt-1 border border-primary-light/50">
                        {t("aiReplySuggest")} "{aiAdvice[offer.id].suggested_reply}"
                      </p>
                    </div>
                  )}

                  {/* Actions / Status */}
                  <div className="flex items-center gap-3 w-full md:w-auto mt-4 pt-4 border-t border-slate-100 justify-end flex-wrap">
                    {offer.status === 'PENDING' ? (
                      <>
                        {!aiAdvice[offer.id] && (
                          <button 
                            disabled={isAnalyzing === offer.id}
                            onClick={() => handleAskAI(offer)}
                            className="w-full md:w-auto px-4 py-2.5 text-xs font-bold text-primary-dark bg-primary-50 border border-primary-light rounded-xl hover:bg-primary-light transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                          >
                            {isAnalyzing === offer.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            {t("analyzeOfferBtn")}
                          </button>
                        )}
                        <button 
                          disabled={isProcessing === offer.id}
                          onClick={() => handleRespond(offer.id, 'REJECT')}
                          className="flex-1 md:flex-none px-4 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                        >
                          <X className="w-4 h-4" /> {t("reject")}
                        </button>
                        <button 
                          disabled={isProcessing === offer.id}
                          onClick={() => handleRespond(offer.id, 'ACCEPT')}
                          className="flex-1 md:flex-none px-4 py-2.5 text-sm font-bold text-white bg-green-500 border border-green-500 rounded-xl hover:bg-green-600 transition-colors flex items-center justify-center gap-1 shadow-sm shadow-green-500/20 disabled:opacity-50"
                        >
                          {isProcessing === offer.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                          {t("accept")}
                        </button>
                      </>
                    ) : (
                      renderOfferStatus(offer)
                    )}
                  </div>
                </div>
              ))
            )
          ) : (
            sentOffers.length === 0 ? (
              <div className="text-center py-20 text-slate-500 bg-slate-50 rounded-3xl border border-slate-100">
                {t("noSentOffers")}
              </div>
            ) : (
              sentOffers.map(offer => (
                <div key={offer.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-5 items-start md:items-center hover:border-slate-200 transition-colors">
                  {/* Listing Image & Info */}
                  <div className="flex gap-4 w-full md:w-1/2">
                    <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                      {offer.listing?.images?.[0] ? (
                        <img src={offer.listing.images[0]} alt="listing" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <DollarSign className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col justify-center min-w-0">
                      <Link href={`/listings/${offer.listingId}`} className="font-bold text-slate-900 truncate hover:text-primary-dark transition-colors text-sm">
                        {offer.listing?.title}
                      </Link>
                      <Link href={`/listings/${offer.listingId}`} className="text-xs text-slate-500 mt-1 flex items-center gap-1 hover:text-primary-dark w-fit">
                        <ExternalLink className="w-3 h-3" /> {t("viewListing")}
                      </Link>
                    </div>
                  </div>

                  {/* Offer Amount & Status */}
                  <div className="flex-1 w-full flex items-center justify-between md:justify-end gap-6 mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div>
                      <p className="text-xs text-slate-400 mb-1">{t("amount")}</p>
                      <p className="font-black text-slate-900 text-lg">${offer.amount?.toLocaleString()}</p>
                    </div>
                    <div>
                      {renderOfferStatus(offer)}
                    </div>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      )}
    </div>
  );
}

export default function OffersPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div className="p-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>}>
        <OffersContent />
      </Suspense>
    </DashboardLayout>
  );
}
