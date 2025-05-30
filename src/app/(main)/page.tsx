// src/app/(main)/page.tsx (Contoh untuk Inbox)
'use client';
import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '@/services/api';
import { Surat } from '@/types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Inbox as InboxIcon, FileText, Search, Filter, Eye, EyeOff, Trash2, ChevronDown, X } from 'lucide-react';
import Link from 'next/link'; // Jika ingin detail surat di halaman terpisah
import MailItem from '@/components/mail/MailItem';
import MailDetailModal from '@/components/mail/MailDetailModal';
import LoadingOverlay from '@/components/LoadingOverlay';







// Halaman Inbox Utama
export default function InboxPage() {
  const [suratList, setSuratList] = useState<Surat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSurat, setSelectedSurat] = useState<Surat | null>(null);
  const [filterStatus, setFilterStatus] = useState<'semua' | 'dibaca' | 'belum dibaca'>('semua');
  const [searchTerm, setSearchTerm] = useState('');

  // const [loadingInteractive, setLoadingInteractive] = useState(false);

  const fetchSurat = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let url = '/surat?type=inbox';
      if (filterStatus !== 'semua') {
        url += `&status=${filterStatus}`;
      }
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }
      const response = await apiClient.get<Surat[]>(url);
      setSuratList(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memuat kotak masuk.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, searchTerm]);

  useEffect(() => {
    fetchSurat();
  }, [fetchSurat]);

  const handleViewSurat = async (surat: Surat) => {
    setSelectedSurat(surat);
    // Jika surat belum dibaca, panggil API untuk menandai sudah dibaca
    if (surat.status_baca === 'belum dibaca') {
      try {
        await apiClient.patch(`/surat/${surat.id}/status`, { status_baca: 'dibaca' });
        // Update state lokal atau fetch ulang
        fetchSurat();
      } catch (err) {
        console.error('Gagal menandai surat sebagai dibaca:', err);
      }
    }
  };
  
  const handleToggleReadStatus = async (surat: Surat) => {
    const newStatus = surat.status_baca === 'belum dibaca' ? 'dibaca' : 'belum dibaca';
    try {
      await apiClient.patch(`/surat/${surat.id}/status`, { status_baca: newStatus });
      fetchSurat(); // Refresh list
      if(selectedSurat && selectedSurat.id === surat.id) {
        setSelectedSurat(prev => prev ? {...prev, status_baca: newStatus} : null);
      }
    } catch (err) {
      console.error(`Gagal mengubah status surat ke ${newStatus}:`, err);
      alert(`Gagal mengubah status surat ke ${newStatus}`);
    }
  };

  const handleDeleteSurat = async (suratId: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus surat ini?")) {
      try {
        await apiClient.delete(`/surat/${suratId}`);
        fetchSurat(); // Refresh list
        if(selectedSurat && selectedSurat.id === suratId) {
          setSelectedSurat(null); // Tutup detail jika surat yang sama dihapus
        }
      } catch (err: any) {
        alert(err.response?.data?.message || 'Gagal menghapus surat.');
        console.error('Gagal menghapus surat:', err);
      }
    }
  };

  
  
  const handleMarkAsUnreadFromDetail = async (suratId: string) => {
    try {
      await apiClient.patch(`/surat/${suratId}/status`, { status_baca: 'belum dibaca' });
      fetchSurat(); // Refresh list
      setSelectedSurat(prev => prev ? {...prev, status_baca: 'belum dibaca'} : null);
    } catch (err) {
      console.error('Gagal menandai surat sebagai belum dibaca:', err);
      alert('Gagal menandai surat sebagai belum dibaca.');
    }
  };
  const handleMarkAsReadFromDetail = async (suratId: string) => {
    if (!suratId) return; // Pastikan ada surat yang dipilih
    if (selectedSurat?.status_baca === 'dibaca') return; // Jika sudah dibaca, tidak perlu menandai ulang
    try {
      await apiClient.patch(`/surat/${suratId}/status`, { status_baca: 'belum dibaca' });
      fetchSurat(); // Refresh list
      setSelectedSurat(prev => prev ? {...prev, status_baca: 'belum dibaca'} : null);
    } catch (err) {
      console.error('Gagal menandai surat sebagai belum dibaca:', err);
      alert('Gagal menandai surat sebagai belum dibaca.');
    }
  };
  const handleCloseDetail = () => {
    // handleMarkAsReadFromDetail(selectedSurat?.id || '');
    setSelectedSurat(null);
  };


  return (
    <div className=" rounded-lg shadow-slate-400 shadow-[0px_0px_10px_1px_rgba(0,0,0,0.01)] h-full flex flex-col">
      <div className="p-4 border-b border-gray-400 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-2">
          <InboxIcon className="w-6 h-6 text-slate-700" />
          <h1 className="text-xl font-semibold text-slate-700">Kotak Masuk</h1>
        </div>
        <div className="flex items-center space-x-2 w-full sm:w-auto">
           {/* Search Input */}
          <div className="relative flex-grow sm:flex-grow-0">
            <input
              type="text"
              placeholder="Cari subjek/isi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchSurat()}
              className="pl-10 pr-4 py-2 w-full bg-slate-50 text-slate-700 rounded-md border border-gray-400 focus:ring-1 focus:ring-primary focus:border-slate-400 text-sm"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
          {/* Filter Dropdown */}
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              className="pl-3 pr-8 py-2 text-slate-700 rounded-md border border-gray-400 focus:ring-1 focus:ring-primary focus:border-primary text-sm appearance-none bg-white"
            >
              <option value="semua">Semua</option>
              <option value="belum dibaca">Belum Dibaca</option>
              <option value="dibaca">Sudah Dibaca</option>
            </select>
            <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-700 pointer-events-none" />
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
      {error && <p className="p-4 text-red-600 text-center">{error}</p>}

      {!loading && !error && suratList.length === 0 && (
        <p className="p-4 text-slate-800 text-center italic">Kotak masuk Anda kosong.</p>
      )}

      {!loading && !error && suratList.length > 0 && (
        <div className="flex-1 overflow-y-auto">
          {suratList.map((surat) => (
            <MailItem key={surat.id} surat={surat} onView={handleViewSurat} onDelete={handleDeleteSurat} onToggleRead={handleToggleReadStatus} />
          ))}
        </div>
      )}

      <MailDetailModal surat={selectedSurat} onClose={handleCloseDetail} onMarkAsUnread={handleMarkAsUnreadFromDetail}/>

      {loading && <LoadingOverlay />}

    </div>
  );
}