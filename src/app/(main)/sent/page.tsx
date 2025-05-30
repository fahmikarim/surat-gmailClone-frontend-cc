// src/app/(main)/sent/page.tsx
'use client';
import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '@/services/api';
import { Surat } from '@/types';

import { Send as SendIcon, FileText, Search, X } from 'lucide-react';
import SentMailItem from '@/components/SendMailItem';
import LoadingOverlay from '@/components/LoadingOverlay';
// Anda mungkin perlu MailItem dan MailDetailModal yang dimodifikasi atau yang sama
// Untuk kesederhanaan, kita anggap bisa pakai MailDetailModal yang ada






export default function SentPage() {
  const [sentMailList, setSentMailList] = useState<Surat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSurat, setSelectedSurat] = useState<Surat | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchSentMail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let url = '/surat?type=sent';
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }
      const response = await apiClient.get<Surat[]>(url);
      console.log("Fetched Sent Mail:", response.data);
      setSentMailList(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memuat surat terkirim.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchSentMail();
  }, [fetchSentMail]);

  const handleViewSurat = (surat: Surat) => {
    console.log("Selected Surat:", surat);
    setSelectedSurat(surat);
  };

  const handleDeleteSurat = async (suratId: string) => {
    setLoading(true);
    if (window.confirm("Apakah Anda yakin ingin menghapus surat ini?")) {
      try {
        await apiClient.delete(`/surat/${suratId}`);
        fetchSentMail(); // Refresh list
        if(selectedSurat && selectedSurat.id === suratId) {
          setSelectedSurat(null); // Tutup detail jika surat yang sama dihapus
        }
      } catch (err: any) {
        alert(err.response?.data?.message || 'Gagal menghapus surat.');
        console.error('Gagal menghapus surat:', err);
      }
    }
    setLoading(false);
  };
  
  const handleCloseDetail = () => {
    setSelectedSurat(null);
  };

  // MailDetailModal bisa direuse dari halaman Inbox atau dibuat varian baru jika perlu
  // Impor MailDetailModal jika Anda memisahkannya
  // import MailDetailModal from '@/components/mail/MailDetailModal';

  return (
    <div className=" rounded-lg shadow-[0px_0px_10px_3px_rgba(0,0,0,0.1)] h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-2">
          <SendIcon className="w-6 h-6 text-slate-800" />
          <h1 className="text-xl font-semibold text-slate-700">Surat Terkirim</h1>
        </div>
        <div className="relative flex-grow sm:flex-grow-0 max-w-xs w-full">
          <input
            type="text"
            placeholder="Cari subjek/isi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchSentMail()}
            className="pl-10 pr-4 py-2 w-full text-slate-700 bg-slate-50 rounded-md border border-gray-400 focus:ring-1 focus:ring-primary focus:border-primary text-sm"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
        </div>
      </div>

      {loading && <div className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>}
      {error && <p className="p-4 text-red-600 text-center">{error}</p>}
      {!loading && !error && sentMailList.length === 0 && <p className="p-4 text-slate-700 text-center italic">Tidak ada surat terkirim.</p>}
      {!loading && !error && sentMailList.length > 0 && (
        <div className="flex-1 overflow-y-auto">
          {sentMailList.map((surat) => (
            <SentMailItem key={surat.id} surat={surat} onView={handleViewSurat} onDelete={handleDeleteSurat} />
          ))}
        </div>
      )}
      {/* <MailDetailModal surat={selectedSurat} onClose={handleCloseDetail} /> */}
      {/* Jika MailDetailModal ada di src/components/mail/MailDetailModal.tsx dan sudah diimpor */}
      {selectedSurat && (
         <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleCloseDetail}>
         <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
           <div className="flex justify-between items-center p-4 border-b">
             <h2 className="text-xl font-semibold text-slate-700">{selectedSurat.subject}</h2>
             <button onClick={handleCloseDetail} className="text-gray-500 hover:text-gray-700">
               <X className="w-6 h-6" />
             </button>
           </div>
           <div className="p-6 overflow-y-auto text-slate-600">
             <p>Dari: {selectedSurat.pengirim.nama}</p>
             <p>Kepada: {selectedSurat.penerima.nama}</p>
             <p>Isi: {selectedSurat.isi || "Tidak ada isi"}</p>
             {selectedSurat.pdf_file_path && (
              <div className="">
                <a href={`${selectedSurat.pdf_file_path}`} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Lihat PDF</a>
                <div className="mt-2">
                <h5 className="text-sm font-semibold text-textPrimary mb-2">Preview Dokumen:</h5>
                <iframe
                  src={selectedSurat.pdf_file_path}
                  className="w-full h-[500px] rounded-md border border-gray-300" // Atur tinggi sesuai kebutuhan, misal h-[500px] atau h-96
                  title={`Preview PDF - ${selectedSurat.subject}`}
                  // sandbox="allow-scripts allow-same-origin" // Pertimbangkan sandbox untuk keamanan jika sumber PDF tidak sepenuhnya terpercaya
                >
                  <p className="p-4 text-sm text-gray-600">
                    Browser Anda tidak mendukung tampilan PDF dalam iframe.
                    Silakan <a href={selectedSurat.pdf_file_path} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">unduh PDF</a> untuk melihatnya.
                  </p>
                </iframe>
              </div>
              </div>
              
              )}

           </div>
         </div>
       </div>
      )}

      {loading && <LoadingOverlay />}
    </div>
  );
}