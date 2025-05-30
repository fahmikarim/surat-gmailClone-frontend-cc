// src/app/(main)/layout.tsx
'use client';
import React, { ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Inbox, Send, LogOut, Menu, X, UserCircle, Edit3, Activity, Search as SearchIcon, Mail } from 'lucide-react';
import ComposeMailModal from '@/components/mail/ComposeMailModal'; // Impor modal
import { Surat } from '@/types'; // Pastikan tipe Surat diimpor
import Sidebar from '@/components/SideBar';






// Main Layout Component
export default function MainLayout({ children }: { children: ReactNode }) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const router = useRouter();

    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showComposeModal, setShowComposeModal] = useState(false); // State untuk modal compose

    const handleMailSent = (newMail: Surat) => {
        console.log('Mail sent:', newMail);
        // Anda mungkin ingin me-refresh daftar surat terkirim atau menampilkan notifikasi
        // Untuk saat ini, kita hanya log dan tutup modal
        setShowComposeModal(false);
        // Jika halaman saat ini adalah /sent, Anda bisa memicu refresh data di sana
        if (pathname === '/sent') {
            // Logika untuk refresh halaman /sent, misal dengan event emitter atau state global
        }
    };

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading || !isAuthenticated) {
        // Tampilkan loading state atau skeleton screen
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
            </div>
        );
    }

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-blue-100 text-slate-700 shadow-sm p-4 border-b lg:border-none">
                    <div className="container mx-auto flex items-center justify-between">
                        <button onClick={toggleSidebar} className="text-slate-900 lg:hidden">
                            {sidebarOpen ? <X className="w-6 h-6 text-blue-400" /> : <Menu className="w-6 h-6 text-slate-800" />}
                        </button>
                        <div className="flex-1 lg:flex-none">
                            {/* Search Bar - Implement functionality later */}
                            <div className="relative w-full max-w-xs hidden lg:block">
                                <input
                                    type="search"
                                    placeholder="Cari surat..."
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:ring-primary focus:border-primary"
                                />
                                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-700" />
                            </div>
                        </div>
                        <button
                            onClick={() => setShowComposeModal(true)}
                            className="bg-blue-500 text-slate-100 px-4 py-2 rounded-lg shadow hover:bg-primary-hover flex items-center space-x-2 transition duration-150"
                        >
                            <Edit3 className="w-5 h-5" />
                            <span>Tulis Surat</span>
                        </button>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 bg-slate-100">
                    {children}
                </main>
            </div>
            {/* Placeholder untuk ComposeMailModal, akan dibuat nanti */}
            {/* {showComposeModal && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={() => setShowComposeModal(false)} // Close on overlay click
                >
                    <div
                        className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl"
                        onClick={(e) => e.stopPropagation()} // Prevent close when clicking inside modal
                    >
                        <h2 className="text-xl font-semibold mb-4">Tulis Surat Baru</h2>
                        <p>Form tulis surat akan ada di sini...</p>
                        <button onClick={() => setShowComposeModal(false)} className="mt-4 bg-red-500 text-white px-3 py-1 rounded">Tutup</button>
                    </div>
                </div>
            )} */}
            <ComposeMailModal
                isOpen={showComposeModal}
                onClose={() => {
                    setShowComposeModal(false);
                    // Mungkin perlu reset form jika ditutup tanpa kirim, atau handle di modalnya
                }}
                onMailSent={handleMailSent}
            />
        </div>
    );
}