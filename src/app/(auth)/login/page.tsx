// src/app/(auth)/login/page.tsx
'use client';
import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { AuthResponse, User } from '@/types';
import { LogIn } from 'lucide-react';

type LoginFormInputs = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>();
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();
  const { login } = useAuth();

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    setServerError(null);
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', data);
      const { accessToken, userId, nama } = response.data;
      console.log("Login successful:", response.data);

      // Asumsi email didapat dari form, atau backend harus mengembalikannya jika perlu disimpan
      const userData: User = { id: userId, nama, email: data.email };
      login(accessToken, userData);
      router.push('/'); // Arahkan ke halaman utama setelah login
    } catch (error: any) {
      console.error("Login error:", error);
      setServerError(error.response?.data?.message || 'Login gagal. Silakan coba lagi.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8 text-slate-500">
          <LogIn className="mx-auto h-16 w-16 text-primary mb-4" />
          <h1 className="text-3xl font-bold text-slate-500">Selamat Datang Kembali!</h1>
          <p className="text-textSecondary">Masuk untuk melanjutkan ke aplikasi mail.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Alamat Email
            </label>
            <input
              id="email"
              type="email"
              {...register('email', { required: 'Email tidak boleh kosong' })}
              className="mt-1 text-slate-500 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
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
              {...register('password', { required: 'Password tidak boleh kosong' })}
              className="mt-1 text-slate-500 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="••••••••"
            />
            {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>}
          </div>

          {serverError && <p className="text-sm text-red-600 text-center">{serverError}</p>}

          <div>
            <button
              type="submit"
              className="w-full text-slate-200 flex justify-center py-3 px-4 bg-blue-500 rounded-lg shadow-sm text-sm font-medium hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition duration-150 ease-in-out"
            >
              Masuk
            </button>
          </div>
        </form>
        <p className="mt-8 text-center text-sm text-gray-600">
          Belum punya akun?{' '}
          <Link href="/register" className="font-medium text-primary hover:text-primary-hover">
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  );
}