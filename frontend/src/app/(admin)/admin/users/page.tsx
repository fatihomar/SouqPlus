'use client';

import React, { useEffect, useState } from 'react';
import { getAdminUsers, toggleUserBan } from '@/services/admin.service';
import { toast } from 'react-hot-toast';
import { Ban, CheckCircle2, Search, Filter, MoreVertical } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function AdminUsersPage() {
  const t = useTranslations('admin');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userToBan, setUserToBan] = useState<any>(null);
  
  // Filters
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [banned, setBanned] = useState('');

  const fetchUsers = async (currentPage: number, currentSearch: string, currentRole: string, currentBanned: string) => {
    try {
      setLoading(true);
      const data = await getAdminUsers(
        currentPage, 
        20, 
        currentSearch || undefined, 
        currentRole || undefined, 
        currentBanned !== '' ? currentBanned === 'true' : undefined
      );
      if (data.success) {
        setUsers(data.users);
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
      fetchUsers(page, search, role, banned);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [page, search, role, banned]);

  const confirmBan = async () => {
    if (!userToBan) return;
    try {
      const res = await toggleUserBan(userToBan.id);
      if (res.success) {
        toast.success(res.message);
        setUsers(users.map(u => u.id === userToBan.id ? { ...u, isBanned: !u.isBanned } : u));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.response?.data?.error?.message || t('noData'));
    } finally {
      setUserToBan(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{t('users')}</h1>
        </div>
      </div>

      {/* Filters Section */}
      <div className="flex flex-col gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute end-4 start-auto top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder={t('searchUsers')}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full h-12 bg-white shadow-sm border border-slate-100 rounded-xl rtl:pr-4 rtl:pl-12 ltr:pl-12 ltr:pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>
        
        {/* Horizontal Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar">
          {['', 'ADMIN', 'SELLER', 'BUYER'].map((r) => (
            <button
              key={r}
              onClick={() => { setRole(r); setPage(1); }}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                role === r 
                  ? 'bg-primary text-white shadow-md shadow-primary/20' 
                  : 'bg-white border border-slate-100 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {r === '' ? t('allRoles') : r === 'ADMIN' ? t('adminRole') : r === 'SELLER' ? t('sellerRole') : t('buyerRole')}
            </button>
          ))}
          
          <select 
            value={banned} 
            onChange={(e) => { setBanned(e.target.value); setPage(1); }}
            className="whitespace-nowrap px-4 py-2 bg-white border border-slate-100 text-slate-600 rounded-full text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
          >
            <option value="">{t('allStatuses')}</option>
            <option value="false">{t('active')}</option>
            <option value="true">{t('banned')}</option>
          </select>
        </div>
      </div>

      {loading && users.length === 0 ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Mobile Cards View */}
          <div className="flex flex-col gap-4 lg:hidden">
            {users.map((user) => (
              <div key={user.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex gap-4 items-start">
                <div className="w-12 h-12 rounded-full bg-primary-50 overflow-hidden flex items-center justify-center shrink-0 border border-primary/10">
                  {user.avatar ? <img src={user.avatar} alt={user.fullName} onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} className="w-full h-full object-cover"/> : null}
                  <div className={`w-full h-full text-primary-dark flex items-center justify-center font-black text-lg ${user.avatar ? 'hidden' : ''}`}>{user.fullName.charAt(0)}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <h3 className="font-bold text-slate-900 truncate">{user.fullName}</h3>
                    <button
                      onClick={() => setUserToBan(user)}
                      disabled={user.role === 'ADMIN'}
                      className={`shrink-0 px-2.5 py-1 rounded-md text-[10px] font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        user.isBanned 
                          ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' 
                          : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                      }`}
                    >
                      {user.isBanned ? t('unban') : t('ban')}
                    </button>
                  </div>
                  <p className="text-[11px] font-medium text-slate-500 mb-2 truncate">{user.email}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${user.role === 'ADMIN' ? 'bg-primary-50 text-primary-dark' : 'bg-slate-100 text-slate-600'}`}>
                      {user.role === 'ADMIN' ? t('adminRole') : user.role === 'SELLER' ? t('sellerRole') : t('buyerRole')}
                    </span>
                    {user.isBanned ? (
                      <span className="inline-flex items-center text-rose-600 font-bold text-[10px] bg-rose-50 px-2 py-0.5 rounded">
                        <Ban className="w-3 h-3 ms-1 rtl:mr-1 rtl:ml-0" /> {t('banned')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-primary-dark font-bold text-[10px] bg-primary-50 px-2 py-0.5 rounded">
                        <CheckCircle2 className="w-3 h-3 ms-1 rtl:mr-1 rtl:ml-0" /> {t('active')}
                      </span>
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
                    <th className="py-4 px-6">{t('user')}</th>
                    <th className="py-4 px-6">{t('email')}</th>
                    <th className="py-4 px-6">{t('role')}</th>
                    <th className="py-4 px-6">{t('listingsCount')}</th>
                    <th className="py-4 px-6">{t('status')}</th>
                    <th className="py-4 px-6 text-center">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-600 font-medium">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900">{user.fullName}</td>
                      <td className="py-4 px-6">{user.email}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${user.role === 'ADMIN' ? 'bg-primary-light text-primary-dark' : 'bg-slate-100 text-slate-700'}`}>
                          {user.role === 'ADMIN' ? t('adminRole') : user.role === 'SELLER' ? t('sellerRole') : t('buyerRole')}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-500">{user._count?.listings || 0}</td>
                      <td className="py-4 px-6">
                        {user.isBanned ? (
                          <span className="inline-flex items-center text-rose-600 font-medium text-xs bg-rose-50 px-2 py-1 rounded">
                            <Ban className="w-3 h-3 ms-1 rtl:mr-1 rtl:ml-0" /> {t('banned')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-primary-dark font-medium text-xs bg-primary-50 px-2 py-1 rounded">
                            <CheckCircle2 className="w-3 h-3 ms-1 rtl:mr-1 rtl:ml-0" /> {t('active')}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => setUserToBan(user)}
                          disabled={user.role === 'ADMIN'}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                            user.isBanned 
                              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' 
                              : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                          }`}
                        >
                          {user.isBanned ? t('unban') : t('ban')}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && !loading && (
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
      {userToBan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {userToBan.isBanned ? t('confirmUnbanTitle') : t('confirmBanTitle')}
            </h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              {userToBan.isBanned 
                ? t('confirmUnbanDesc', { name: userToBan.fullName })
                : t('confirmBanDesc', { name: userToBan.fullName })}
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setUserToBan(null)}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                {t('cancel')}
              </button>
              <button 
                onClick={confirmBan}
                className={`px-5 py-2.5 text-sm font-bold text-white rounded-xl transition-colors ${userToBan.isBanned ? 'bg-primary hover:bg-primary-dark' : 'bg-rose-600 hover:bg-rose-700'}`}
              >
                {userToBan.isBanned ? t('unban') : t('ban')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
