'use client';

import React, { useEffect, useState } from 'react';
import { getAuditLogs } from '@/services/admin.service';
import { toast } from 'react-hot-toast';
import { Search, Filter, Activity, Clock, ShieldCheck, User } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function AdminLogsPage() {
  const t = useTranslations('admin');
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [action, setAction] = useState('');

  const fetchLogs = async (currentPage: number, currentAction: string) => {
    try {
      setLoading(true);
      const data = await getAuditLogs(currentPage, 20, currentAction || undefined);
      if (data.success) {
        setLogs(data.logs);
        if (data.pagination) setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      toast.error(t('noData'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(page, action);
  }, [page, action]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{t('logs')}</h1>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
        <div className="flex gap-4">
          <select
            value={action}
            onChange={(e) => { setAction(e.target.value); setPage(1); }}
            className="w-full md:w-auto px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-primary text-sm font-medium"
          >
            <option value="ALL">{t('allStatuses')}</option>
            <option value="BAN_USER">{t('logTypes.banUser', { defaultValue: 'Ban User' })}</option>
            <option value="UNBAN_USER">{t('logTypes.unbanUser', { defaultValue: 'Unban User' })}</option>
            <option value="UPDATE_LISTING_STATUS">{t('logTypes.updateListing', { defaultValue: 'Update Listing' })}</option>
            <option value="UPDATE_REPORT_STATUS">{t('logTypes.updateReport', { defaultValue: 'Update Report' })}</option>
            <option value="UPDATE_SYSTEM_SETTINGS">{t('logTypes.updateSettings', { defaultValue: 'Update Settings' })}</option>
          </select>
        </div>
      </div>

      {loading && logs.length === 0 ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Mobile Cards View */}
          <div className="grid grid-cols-1 gap-4 lg:hidden">
            {logs.map((log) => (
              <div key={log.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex flex-col gap-3 relative overflow-hidden">
                <div className="absolute top-0 end-0 w-1 bg-primary h-full"></div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{log.action}</h3>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(log.createdAt).toLocaleString('ar-EG')}</p>
                  </div>
                  <div className="bg-primary-50 text-primary-dark w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
                     <Activity className="w-4 h-4" />
                  </div>
                </div>
                
                <div className="text-sm border-t border-slate-50 pt-3 mt-1">
                  <details className="group cursor-pointer outline-none">
                    <summary className="font-medium text-slate-700 leading-relaxed truncate list-none outline-none">{log.details}</summary>
                    <p className="mt-2 text-xs text-slate-500 leading-relaxed break-words whitespace-pre-wrap">{log.details}</p>
                  </details>
                </div>
                
                <div className="flex justify-between items-center text-sm border-t border-slate-50 pt-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-slate-400" />
                    <span className="font-bold text-slate-900">{log.actor?.fullName || 'System'}</span>
                  </div>
                  {log.targetUser && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="font-medium text-slate-600 truncate max-w-[100px]">{log.targetUser?.fullName}</span>
                    </div>
                  )}
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
                    <th className="py-4 px-6">{t('action')}</th>
                    <th className="py-4 px-6">{t('admin')}</th>
                    <th className="py-4 px-6">{t('details')}</th>
                    <th className="py-4 px-6">{t('timestamp')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-600 font-medium">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary-dark shrink-0">
                            <Activity className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-slate-900">{log.action}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{log.actor?.fullName || 'System'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 max-w-[400px] truncate" title={log.details}>{log.details}</td>
                      <td className="py-4 px-6 text-xs text-slate-500">
                         {new Date(log.createdAt).toLocaleString('ar-EG')}
                      </td>
                    </tr>
                  ))}
                  {logs.length === 0 && !loading && (
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
    </div>
  );
}
