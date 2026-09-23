'use client';

import React, { useEffect, useState } from 'react';
import { getReports, updateReportStatus } from '@/services/admin.service';
import { toast } from 'react-hot-toast';
import { AlertTriangle, CheckCircle2, Clock, Eye, Search, Filter, ShieldAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function AdminReportsPage() {
  const t = useTranslations('admin');
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [reportToUpdate, setReportToUpdate] = useState<{report: any, newStatus: string} | null>(null);

  // Filters
  const [status, setStatus] = useState('');

  const fetchReports = async (currentPage: number, currentStatus: string) => {
    try {
      setLoading(true);
      const data = await getReports(currentPage, 20, currentStatus || undefined);
      if (data.success) {
        setReports(data.reports);
        if (data.pagination) setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      toast.error(t('noData'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(page, status);
  }, [page, status]);

  const confirmStatusUpdate = async () => {
    if (!reportToUpdate) return;
    try {
      const res = await updateReportStatus(reportToUpdate.report.id, reportToUpdate.newStatus);
      if (res.success) {
        toast.success(t('saveChanges'));
        setReports(reports.map(r => r.id === reportToUpdate.report.id ? { ...r, status: reportToUpdate.newStatus } : r));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('noData'));
    } finally {
      setReportToUpdate(null);
    }
  };

  const getStatusBadge = (reportStatus: string) => {
    switch (reportStatus) {
      case 'PENDING': return <span className="inline-flex items-center text-amber-600 font-medium text-xs bg-amber-50 px-2.5 py-1 rounded-md"><Clock className="w-3 h-3 ms-1" /> {reportStatus}</span>;
      case 'REVIEWING': return <span className="inline-flex items-center text-blue-600 font-medium text-xs bg-blue-50 px-2.5 py-1 rounded-md"><Eye className="w-3 h-3 ms-1" /> {reportStatus}</span>;
      case 'RESOLVED': return <span className="inline-flex items-center text-emerald-600 font-medium text-xs bg-emerald-50 px-2.5 py-1 rounded-md"><CheckCircle2 className="w-3 h-3 ms-1" /> {reportStatus}</span>;
      case 'REJECTED': return <span className="inline-flex items-center text-slate-600 font-medium text-xs bg-slate-100 px-2.5 py-1 rounded-md">{reportStatus}</span>;
      default: return <span className="inline-flex items-center text-slate-600 font-medium text-xs bg-slate-100 px-2.5 py-1 rounded-md">{reportStatus}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{t('reports')}</h1>
        </div>
      </div>

      {/* Filters Section */}
      <div className="flex flex-col gap-4">
        {/* Horizontal Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar">
          {['', 'PENDING', 'REVIEWING', 'RESOLVED', 'REJECTED'].map((s) => (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1); }}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                status === s 
                  ? 'bg-primary text-white shadow-md shadow-primary/20' 
                  : 'bg-white border border-slate-100 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {s === '' ? t('allStatuses') : s === 'PENDING' ? t('pending') : s === 'REVIEWING' ? 'Reviewing' : s === 'RESOLVED' ? 'Resolved' : t('rejected')}
            </button>
          ))}
        </div>
      </div>

      {loading && reports.length === 0 ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Mobile Cards View */}
          <div className="grid grid-cols-1 gap-4 lg:hidden">
            {reports.map((report) => (
              <div key={report.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start border-b border-slate-50 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{t('reportId')}: {report.id}</h3>
                    <p className="text-xs text-slate-500 mt-1">{new Date(report.createdAt).toLocaleString('ar-EG')}</p>
                  </div>
                  {getStatusBadge(report.status)}
                </div>
                
                <div className="text-sm">
                  <span className="text-xs text-slate-500 block mb-1">{t('reason')}</span>
                  <p className="font-medium text-slate-900 leading-relaxed bg-slate-50 p-3 rounded-lg">{report.reason}</p>
                </div>
                
                <div className="flex justify-between items-center text-sm border-t border-slate-50 pt-3">
                  <div>
                    <span className="text-xs text-slate-500 block">{t('reporter')}</span>
                    <span className="font-bold text-slate-900">{report.user?.fullName || 'N/A'}</span>
                  </div>
                  <div className="text-end">
                    <span className="text-xs text-slate-500 block">{t('reportedTarget')}</span>
                    <span className="font-bold text-slate-900">{report.listing?.title || 'N/A'}</span>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-2">
                  {report.status !== 'RESOLVED' && report.status !== 'REJECTED' && (
                    <>
                      <button onClick={() => setReportToUpdate({ report, newStatus: 'RESOLVED' })} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100">{t('approve')}</button>
                      <button onClick={() => setReportToUpdate({ report, newStatus: 'REJECTED' })} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100">{t('reject')}</button>
                    </>
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
                    <th className="py-4 px-6">{t('reportId')}</th>
                    <th className="py-4 px-6">{t('reporter')}</th>
                    <th className="py-4 px-6">{t('reportedTarget')}</th>
                    <th className="py-4 px-6">{t('reason')}</th>
                    <th className="py-4 px-6">{t('status')}</th>
                    <th className="py-4 px-6 text-center">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-600 font-medium">
                  {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <span className="font-bold text-slate-900">#{report.id.substring(0, 8)}</span>
                        <span className="block text-xs text-slate-500 mt-1">{new Date(report.createdAt).toLocaleDateString('ar-EG')}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{report.user?.fullName || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-bold text-primary-dark max-w-[200px] truncate" title={report.listing?.title}>{report.listing?.title || 'N/A'}</td>
                      <td className="py-4 px-6 max-w-[250px] truncate" title={report.reason}>{report.reason}</td>
                      <td className="py-4 px-6">
                        {getStatusBadge(report.status)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex justify-center gap-2">
                           {report.status !== 'RESOLVED' && report.status !== 'REJECTED' && (
                             <>
                               <button onClick={() => setReportToUpdate({ report, newStatus: 'RESOLVED' })} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors">
                                 {t('approve')}
                               </button>
                               <button onClick={() => setReportToUpdate({ report, newStatus: 'REJECTED' })} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors">
                                 {t('reject')}
                               </button>
                             </>
                           )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {reports.length === 0 && !loading && (
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
      {reportToUpdate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {t('confirmActionTitle')}
            </h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              {t('confirmActionDesc', { status: reportToUpdate.newStatus })}
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setReportToUpdate(null)}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                {t('cancel')}
              </button>
              <button 
                onClick={confirmStatusUpdate}
                className={`px-5 py-2.5 text-sm font-bold text-white rounded-xl transition-colors ${reportToUpdate.newStatus === 'REJECTED' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-primary hover:bg-primary-dark'}`}
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
