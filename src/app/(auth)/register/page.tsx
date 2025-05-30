// src/app/(auth)/register/page.tsx
'use client';
import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/services/api';
import { UserPlus } from 'lucide-react';

type RegisterFormInputs = {
    nama: string;
    email: string;
    password: string;
    confirmPassword?: string; // Opsional, validasi di client
};

export default function RegisterPage() {
    const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormInputs>();
    const [serverError, setServerError] = useState<string | null>(null);
    const router = useRouter();
    const password = watch('password');

    const onSubmit: SubmitHandler<RegisterFormInputs> = async (data) => {
        setServerError(null);
        try {
            // Hapus confirmPassword sebelum mengirim ke backend
            const { confirmPassword, ...submitData } = data;
            await apiClient.post('/auth/register', submitData);
            // Arahkan ke halaman login setelah registrasi berhasil
            router.push('/login?registrationSuccess=true');
        } catch (error: any) {
            setServerError(error.response?.data?.message || 'Registrasi gagal. Silakan coba lagi.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 to-teal-500 p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
                <div className="text-center mb-8">
                    <UserPlus className="mx-auto h-16 w-16 text-green-500 mb-4" />
                    <h1 className="text-3xl font-bold text-slate-800">Buat Akun Baru</h1>
                    <p className="text-slate-600">Bergabunglah dengan aplikasi mail kami.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-slate-700">
                    <div>
                        <label htmlFor="nama" className="block text-sm font-medium text-gray-700">
                            Nama Lengkap
                        </label>
                        <input
                            id="nama"
                            type="text"
                            {...register('nama', { required: 'Nama tidak boleh kosong' })}
                            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            placeholder="Nama Anda"
                        />
                        {errors.nama && <p className="mt-2 text-sm text-red-600">{errors.nama.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Alamat Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            {...register('email', {
                                required: 'Email tidak boleh kosong',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Format email tidak valid'
                                }
                            })}
                            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            placeholder="anda@contoh.com"
                        />
                        {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            {...register('password', {
                                required: 'Password tidak boleh kosong',
                                minLength: { value: 6, message: 'Password minimal 6 karakter' }
                            })}
                            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            placeholder="••••••••" />
                        {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>}
                    </div>
                    <div>
                        <label
                            htmlFor="confirmPassword"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Konfirmasi Password
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            {...register("confirmPassword", {
                                required: "Konfirmasi password tidak boleh kosong",
                                validate: (value) =>
                                    value === password || "Password tidak cocok",
                            })}
                            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            placeholder="••••••••"
                        />
                        {errors.confirmPassword && (
                            <p className="mt-2 text-sm text-red-600">
                                {errors.confirmPassword.message}
                            </p>
                        )}
                    </div>
                    {serverError && <p className="text-sm text-red-600 text-center">{serverError}</p>}

                    <div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out"
                        >
                            Daftar
                        </button>
                    </div>
                </form>
                <p className="mt-8 text-center text-sm text-gray-600">
                    Sudah punya akun?{' '}
                    <Link href="/login" className="font-medium text-green-500 hover:text-green-600">
                        Masuk di sini
                    </Link>
                </p>
            </div>
        </div>
    );
}