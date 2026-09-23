'use client';

import React, { useEffect, useState } from 'react';
import { getAdminStats, getAdminUsers, getAdminListings, getAuditLogs } from '@/services/admin.service';
import { Users, FileText, CheckCircle, MessageSquare, Calendar, ChevronDown, Plus, Settings, BarChart2, UserPlus, MoreVertical, Activity } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTranslations } from 'next-intl';

export default function AdminDashboardPage() {
  const t = useTranslations('admin');
  const [stats, setStats] = useState<any>(null);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentListings, setRecentListings] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, usersRes, listingsRes, logsRes] = await Promise.all([
          getAdminStats(),
          getAdminUsers(),
          getAdminListings(),
          getAuditLogs(1, 5)
        ]);
        
        if (statsRes.success) setStats(statsRes.data);
        if (usersRes.success) setRecentUsers(usersRes.users.slice(0, 5));
        if (listingsRes.success) setRecentListings(listingsRes.listings.slice(0, 5));
        if (logsRes.success) setRecentActivity(logsRes.logs.slice(0, 5));
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  const statCards = [
    { title: t('totalUsers'), value: stats?.totalUsers || 0, icon: Users, color: 'text-primary-dark', bg: 'bg-primary-50' },
    { title: t('totalListings'), value: stats?.totalListings || 0, icon: FileText, color: 'text-primary-dark', bg: 'bg-primary-50' },
    { title: t('activeListings'), value: stats?.activeListings || 0, icon: CheckCircle, color: 'text-primary-dark', bg: 'bg-primary-50' },
    { title: t('totalReports'), value: stats?.pendingReports || 0, icon: MessageSquare, color: 'text-primary-dark', bg: 'bg-primary-50' },
  ];

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{t('dashboard')}</h1>
          <p className="text-slate-500 mt-1 font-medium">{t('overview')}</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center gap-3 md:gap-5">
            <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl ${card.bg} flex items-center justify-center shrink-0`}>
              <card.icon className={`w-5 h-5 md:w-6 md:h-6 ${card.color}`} />
            </div>
            <div>
              <p className="text-[11px] md:text-[13px] font-bold text-slate-400 uppercase tracking-wide">{card.title}</p>
              <div className="flex items-baseline gap-3 mt-1">
                <h3 className="text-xl md:text-3xl font-black text-slate-900">{card.value.toLocaleString()}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Users */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-4 md:p-6 border-b border-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">{t('recentUsers')}</h3>
            <a href="/admin/users" className="text-xs md:text-sm font-bold text-primary-dark hover:text-primary-dark">{t('viewAll')}</a>
          </div>
          
          {/* Mobile Cards */}
          <div className="md:hidden flex flex-col divide-y divide-slate-50">
            {recentUsers.length > 0 ? (
              recentUsers.map(user => (
                <a key={user.id} href="/admin/users" className="flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                    {user.avatar ? <img src={user.avatar} alt={user.fullName} onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} className="w-full h-full object-cover"/> : null}
                    <div className={`w-full h-full bg-primary-light text-primary-dark flex items-center justify-center font-bold ${user.avatar ? 'hidden' : ''}`}>{user.fullName.charAt(0)}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{user.fullName}</h4>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${user.role === 'ADMIN' ? 'bg-primary-light text-primary-dark' : 'bg-slate-100 text-slate-700'}`}>
                      {user.role === 'ADMIN' ? t('adminRole') : user.role === 'SELLER' ? t('sellerRole') : t('buyerRole')}
                    </span>
                    {user.isBanned && (
                      <span className="text-[10px] font-bold text-rose-500">{t('banned')}</span>
                    )}
                  </div>
                </a>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500 font-medium text-sm">{t('noUsers')}</div>
            )}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-start text-sm whitespace-nowrap">
              <thead className="bg-slate-50/50 text-slate-400 font-bold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-4 px-6 font-semibold">{t('user')}</th>
                  <th className="py-4 px-6 font-semibold">{t('email')}</th>
                  <th className="py-4 px-6 font-semibold">{t('role')}</th>
                  <th className="py-4 px-6 font-semibold">{t('status')}</th>
                  <th className="py-4 px-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-600 font-medium">
                {recentUsers.length > 0 ? (
                  recentUsers.map(user => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                            {user.avatar ? <img src={user.avatar} alt={user.fullName} onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} className="w-full h-full object-cover"/> : null}
                            <div className={`w-full h-full bg-primary-light text-primary-dark flex items-center justify-center font-bold ${user.avatar ? 'hidden' : ''}`}>{user.fullName.charAt(0)}</div>
                          </div>
                          <span className="font-bold text-slate-900">{user.fullName}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">{user.email}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${user.role === 'ADMIN' ? 'bg-primary-light text-primary-dark' : user.role === 'SELLER' ? 'bg-primary-light text-primary-dark' : 'bg-primary-light text-primary-dark'}`}>
                          {user.role === 'ADMIN' ? t('adminRole') : user.role === 'SELLER' ? t('sellerRole') : t('buyerRole')}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                         <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${user.isBanned ? 'bg-rose-100 text-rose-700' : 'bg-primary-light text-primary-dark'}`}>
                          {user.isBanned ? t('banned') : t('active')}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-end">
                        <button className="text-slate-400 hover:text-slate-600"><MoreVertical className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500 font-medium">
                      {t('noUsers')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Listings */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-4 md:p-6 border-b border-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">{t('recentListings')}</h3>
            <a href="/admin/listings" className="text-xs md:text-sm font-bold text-primary-dark hover:text-primary-dark">{t('viewAll')}</a>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden flex flex-col divide-y divide-slate-50">
            {recentListings.length > 0 ? (
              recentListings.map(listing => (
                <a key={listing.id} href="/admin/listings" className="flex gap-3 p-4 hover:bg-slate-50 transition-colors">
                  <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center shrink-0 border border-slate-100">
                    {listing.images && listing.images[0] ? <img src={listing.images[0]} alt={listing.title} onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} className="w-full h-full object-cover"/> : null}
                    <div className={`w-full h-full bg-slate-100 flex items-center justify-center ${listing.images && listing.images[0] ? 'hidden' : ''}`}>
                      <FileText className="w-6 h-6 text-slate-300" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${listing.category === 'CAR' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                          {listing.category === 'CAR' ? t('cars') : t('realEstate')}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          listing.status === 'ACTIVE' ? 'bg-primary-50 text-primary-dark' :
                          listing.status === 'PENDING_REVIEW' ? 'bg-amber-50 text-amber-600' :
                          listing.status === 'REPORTED' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {listing.status === 'PENDING_REVIEW' ? t('pending') : listing.status === 'ACTIVE' ? t('active') : listing.status}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 truncate">{listing.title}</h4>
                    </div>
                    <div className="text-sm font-black text-primary-dark">{listing.price}</div>
                  </div>
                </a>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500 font-medium text-sm">{t('noListings')}</div>
            )}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-start text-sm whitespace-nowrap">
              <thead className="bg-slate-50/50 text-slate-400 font-bold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-4 px-6 font-semibold">{t('listing')}</th>
                  <th className="py-4 px-6 font-semibold">{t('category')}</th>
                  <th className="py-4 px-6 font-semibold">{t('price')}</th>
                  <th className="py-4 px-6 font-semibold">{t('status')}</th>
                  <th className="py-4 px-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-600 font-medium">
                {recentListings.length > 0 ? (
                  recentListings.map(listing => (
                    <tr key={listing.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                             {listing.images && listing.images[0] ? <img src={listing.images[0]} alt={listing.title} onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} className="w-full h-full object-cover"/> : null}
                             <div className={`w-full h-full bg-slate-200 flex items-center justify-center ${listing.images && listing.images[0] ? 'hidden' : ''}`}>
                               <FileText className="w-4 h-4 text-slate-400" />
                             </div>
                          </div>
                          <span className="font-bold text-slate-900 truncate max-w-[150px]">{listing.title}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">{listing.category === 'CAR' ? t('cars') : t('realEstate')}</td>
                      <td className="py-4 px-6 font-bold text-slate-900">{listing.price}</td>
                      <td className="py-4 px-6">
                         <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                           listing.status === 'ACTIVE' ? 'bg-primary-light text-primary-dark' :
                           listing.status === 'PENDING_REVIEW' ? 'bg-amber-100 text-amber-700' :
                           listing.status === 'REPORTED' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                         }`}>
                          {listing.status === 'PENDING_REVIEW' ? t('pending') : listing.status === 'ACTIVE' ? t('active') : listing.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-end">
                        <button className="text-slate-400 hover:text-slate-600"><MoreVertical className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500 font-medium">
                      {t('noListings')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Listings by Category Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:col-span-1">
          <h3 className="font-bold text-slate-900 mb-6">{t('listingsByCategory')}</h3>
          <div className="flex flex-col items-center justify-center gap-6">
            {/* CSS Pie Chart representation */}
            <div className="relative w-48 h-48 rounded-full flex items-center justify-center" 
                 style={{
                   background: 'conic-gradient(#087F5B 0% 60%, #EAF7F1 60% 88%, #065A42 88% 95%, #102A2A 95% 100%)'
                 }}>
              <div className="w-32 h-32 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                <span className="text-2xl font-black text-slate-900">{stats?.totalListings || 0}</span>
                <span className="text-xs font-bold text-slate-400">{t('total')}</span>
              </div>
            </div>
            
            <div className="w-full space-y-3 mt-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 font-bold text-slate-700"><span className="w-3 h-3 rounded-full bg-primary"></span> {t('realEstate')}</div>
                <div className="text-slate-500 font-medium">{stats?.realEstateListings || 0}</div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 font-bold text-slate-700"><span className="w-3 h-3 rounded-full bg-primary"></span> {t('cars')}</div>
                <div className="text-slate-500 font-medium">{stats?.carListings || 0}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Admin Activity */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col lg:col-span-2">
          <div className="p-4 md:p-6 border-b border-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">{t('recentActivity')}</h3>
            <a href="/admin/logs" className="text-xs md:text-sm font-bold text-primary-dark hover:text-primary-dark">{t('viewAll')}</a>
          </div>

          {/* Mobile List */}
          <div className="md:hidden flex flex-col divide-y divide-slate-50">
            {recentActivity.length > 0 ? (
              recentActivity.map(log => (
                <div key={log.id} className="p-4 flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary-dark shrink-0">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-bold text-slate-900 text-sm truncate">{log.action}</span>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mb-0.5"><span className="font-medium text-slate-700">{log.actor?.fullName || 'System'}</span></p>
                    <p className="text-[11px] text-slate-400 truncate">{log.details || '-'}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500 font-medium text-sm">{t('noData')}</div>
            )}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-start text-sm whitespace-nowrap">
              <thead className="bg-slate-50/50 text-slate-400 font-bold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-4 px-6 font-semibold">{t('action')}</th>
                  <th className="py-4 px-6 font-semibold">{t('user')}</th>
                  <th className="py-4 px-6 font-semibold">{t('target')}</th>
                  <th className="py-4 px-6 font-semibold">{t('timestamp')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-600 font-medium">
                {recentActivity.length > 0 ? (
                  recentActivity.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary-dark shrink-0">
                            <Activity className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-slate-900">{log.action}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">{log.actor?.fullName || 'System'}</td>
                      <td className="py-4 px-6 text-slate-500 truncate max-w-[200px]" title={log.details || ''}>{log.details || '-'}</td>
                      <td className="py-4 px-6 text-xs text-slate-400">
                        {new Date(log.createdAt).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500 font-medium">
                      {t('noData')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
