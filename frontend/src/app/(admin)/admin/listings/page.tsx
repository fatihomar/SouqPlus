'use client';

import React, { useEffect, useState } from 'react';
import { getAdminListings, updateListingStatus } from '@/services/admin.service';
import { toast } from 'react-hot-toast';
import { CheckCircle2, Clock, Trash2, ShieldAlert, Image as ImageIcon, Search, Filter, ExternalLink } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function AdminListingsPage() {
  const t = useTranslations('admin');
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [listingToUpdate, setListingToUpdate] = useState<{listing: any, newStatus: string} | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');

  const fetchListings = async (currentPage: number, currentSearch: string, currentStatus: string, currentCategory: string) => {
    try {
      setLoading(true);
      const data = await getAdminListings(
        currentPage, 
        20, 
        currentStatus || undefined,
        currentSearch || undefined,
        currentCategory || undefined
      );
      if (data.success) {
        setListings(data.listings);
        if (data.pagination) setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      toast.error(t('noData'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchListings(page, search, status, category);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [page, search, status, category]);

  const confirmStatusUpdate = async () => {
    if (!listingToUpdate) return;
    try {
      const res = await updateListingStatus(listingToUpdate.listing.id, listingToUpdate.newStatus);
      if (res.success) {
        toast.success(t('saveChanges'));
        setListings(listings.map(l => l.id === listingToUpdate.listing.id ? { ...l, status: listingToUpdate.newStatus } : l));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('noData'));
    } finally {
      setListingToUpdate(null);
    }
  };

  const getStatusBadge = (listingStatus: string) => {
    switch (listingStatus) {
      case 'ACTIVE': return <span className="inline-flex items-center text-primary-dark font-medium text-xs bg-primary-50 px-2.5 py-1 rounded-md"><CheckCircle2 className="w-3.5 h-3.5 ms-1 rtl:mr-1 rtl:ml-0" /> {t('active')}</span>;
      case 'PENDING_REVIEW': return <span className="inline-flex items-center text-amber-600 font-medium text-xs bg-amber-50 px-2.5 py-1 rounded-md"><Clock className="w-3.5 h-3.5 ms-1 rtl:mr-1 rtl:ml-0" /> {t('pending')}</span>;
      case 'REPORTED': return <span className="inline-flex items-center text-rose-600 font-medium text-xs bg-rose-50 px-2.5 py-1 rounded-md"><ShieldAlert className="w-3.5 h-3.5 ms-1 rtl:mr-1 rtl:ml-0" /> {t('reported')}</span>;
      case 'REJECTED': return <span className="inline-flex items-center text-rose-600 font-medium text-xs bg-rose-50 px-2.5 py-1 rounded-md">{t('rejected')}</span>;
      case 'DELETED': return <span className="inline-flex items-center text-slate-600 font-medium text-xs bg-slate-100 px-2.5 py-1 rounded-md"><Trash2 className="w-3.5 h-3.5 ms-1 rtl:mr-1 rtl:ml-0" /> {t('deleted')}</span>;
      default: return <span className="inline-flex items-center text-slate-600 font-medium text-xs bg-slate-100 px-2.5 py-1 rounded-md">{listingStatus}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{t('listings')}</h1>
        </div>
      </div>

      {/* Filters Section */}
      <div className="flex flex-col gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute end-4 start-auto top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder={t('searchListings')}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full h-12 bg-white shadow-sm border border-slate-100 rounded-xl rtl:pr-4 rtl:pl-12 ltr:pl-12 ltr:pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>
        
        {/* Horizontal Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar">
          {['', 'ACTIVE', 'PENDING_REVIEW', 'REPORTED', 'REJECTED', 'DELETED'].map((s) => (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1); }}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                status === s 
                  ? 'bg-primary text-white shadow-md shadow-primary/20' 
                  : 'bg-white border border-slate-100 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {s === '' ? t('allStatuses') : s === 'PENDING_REVIEW' ? t('pending') : s === 'ACTIVE' ? t('active') : s === 'REPORTED' ? t('reported') : s === 'REJECTED' ? t('rejected') : t('deleted')}
            </button>
          ))}
          
          <select 
            value={category} 
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="whitespace-nowrap px-4 py-2 bg-white border border-slate-100 text-slate-600 rounded-full text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
          >
            <option value="">{t('allCategories') || 'All Categories'}</option>
            <option value="REAL_ESTATE">{t('realEstate')}</option>
            <option value="CAR">{t('cars')}</option>
          </select>
        </div>
      </div>

      {loading && listings.length === 0 ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Mobile Cards View */}
          <div className="flex flex-col gap-4 lg:hidden">
            {listings.map((listing) => (
              <div key={listing.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex flex-col gap-3">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center shrink-0 border border-slate-100">
                    {listing.images && listing.images[0] ? (
                      <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/listings/${listing.id}`} className="font-bold text-slate-900 truncate hover:text-primary-dark transition-colors flex items-center gap-1">
                      {listing.title}
                    </Link>
                    <p className="text-[11px] text-slate-500 mb-1">{listing.seller?.fullName || 'N/A'}</p>
                    <p className="text-sm font-black text-primary-dark">{listing.price} {listing.currency || 'SAR'}</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-sm border-t border-slate-50 pt-3">
                  <div className="flex gap-2">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${listing.category === 'CAR' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {listing.category === 'CAR' ? t('cars') : t('realEstate')}
                    </span>
                    {getStatusBadge(listing.status)}
                  </div>
                  <div className="flex gap-2">
                    {listing.status === 'PENDING_REVIEW' && (
                      <button onClick={() => setListingToUpdate({ listing, newStatus: 'ACTIVE' })} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100">{t('approve')}</button>
                    )}
                    {listing.status !== 'DELETED' && (
                      <button onClick={() => setListingToUpdate({ listing, newStatus: 'DELETED' })} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100">{t('delete')}</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-start rtl:text-right text-sm whitespace-nowrap">
                <thead className="bg-slate-50/50 text-slate-400 font-bold uppercase text-[11px] tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-4 px-6">{t('listing')}</th>
                    <th className="py-4 px-6">{t('seller')}</th>
                    <th className="py-4 px-6">{t('type')}</th>
                    <th className="py-4 px-6">{t('price')}</th>
                    <th className="py-4 px-6">{t('status')}</th>
                    <th className="py-4 px-6 text-center">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-600 font-medium">
                  {listings.map((listing) => (
                    <tr key={listing.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                            {listing.images && listing.images[0] ? (
                              <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <Link href={`/listings/${listing.id}`} className="font-bold text-slate-900 truncate max-w-[200px] hover:text-primary-dark transition-colors flex items-center gap-1">
                            {listing.title}
                          </Link>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{listing.seller?.fullName || 'N/A'}</span>
                          <span className="text-[11px] text-slate-500">{listing.seller?.email}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">{listing.category === 'CAR' ? t('cars') : t('realEstate')}</td>
                      <td className="py-4 px-6 font-bold text-primary-dark">{listing.price} {listing.currency || 'SAR'}</td>
                      <td className="py-4 px-6">
                        {getStatusBadge(listing.status)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex justify-center gap-2">
                           {listing.status === 'PENDING_REVIEW' && (
                            <button onClick={() => setListingToUpdate({ listing, newStatus: 'ACTIVE' })} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors">
                              {t('approve')}
                            </button>
                           )}
                           {listing.status !== 'DELETED' && (
                             <button onClick={() => setListingToUpdate({ listing, newStatus: 'DELETED' })} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors">
                               {t('delete')}
                             </button>
                           )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {listings.length === 0 && !loading && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 font-medium">
                        {t('noData')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button 
            disabled={page === 1} 
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            {t('previous')}
          </button>
          <span className="text-sm font-bold text-slate-500">
             {t('pageOf', { page, totalPages })}
          </span>
          <button 
            disabled={page === totalPages} 
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            {t('next')}
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {listingToUpdate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {t('confirmActionTitle')}
            </h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              {t('confirmActionDesc', { status: listingToUpdate.newStatus })}
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setListingToUpdate(null)}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                {t('cancel')}
              </button>
              <button 
                onClick={confirmStatusUpdate}
                className={`px-5 py-2.5 text-sm font-bold text-white rounded-xl transition-colors ${listingToUpdate.newStatus === 'DELETED' || listingToUpdate.newStatus === 'REJECTED' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-primary hover:bg-primary-dark'}`}
              >
                {t('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
