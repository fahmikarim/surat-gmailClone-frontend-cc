// src/app/(main)/activity/page.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '@/services/api';
import { ActivityLog } from '@/types'; // Pastikan path ini benar
import { Activity as ActivityIcon, ListChecks, AlertCircle, RotateCw } from 'lucide-react';
import ActivityLogItem from '@/components/ActivityLogItem';




export default function ActivityLogPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivityLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Endpoint ini harus Anda buat di backend
      const response = await apiClient.get<ActivityLog[]>('/me/activity-logs');
      setLogs(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memuat log aktivitas.');
      console.error('Error fetching activity logs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivityLogs();
  }, [fetchActivityLogs]);

  return (
    <div className="rounded-lg shadow-[0px_0px_10px_3px_rgba(0,0,0,0.1)] h-full flex flex-col">
      <div className="p-4 sm:p-6 border-b border-gray-300 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <ListChecks className="w-7 h-7 text-slate-800" />
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-700">Log Aktivitas Saya</h1>
        </div>
        <button
            onClick={fetchActivityLogs}
            disabled={loading}
            className="px-4 text-slate-800 py-2 text-sm bg-blue-200 text-primary rounded-lg hover:bg-blue-100 flex items-center space-x-2 transition-colors disabled:opacity-50"
        >
            <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {loading && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
            <p className="text-textSecondary">Memuat log aktivitas...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center h-full text-center p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
            <p className="text-red-700 font-semibold">Oops! Terjadi Kesalahan</p>
            <p className="text-red-600 text-sm">{error}</p>
            <button
                onClick={fetchActivityLogs}
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
            >
                Coba Lagi
            </button>
          </div>
        )}

        {!loading && !error && logs.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
             <ActivityIcon className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-textSecondary text-lg">Tidak ada aktivitas yang tercatat.</p>
            <p className="text-sm text-gray-400">Semua aktivitas Anda akan muncul di sini.</p>
          </div>
        )}

        {!loading && !error && logs.length > 0 && (
          <div className="space-y-3">
            {logs.map((log) => (
              <ActivityLogItem key={log.id} log={log} />
            ))}
          </div>
        )}
      </div> 
    </div>
  );
}