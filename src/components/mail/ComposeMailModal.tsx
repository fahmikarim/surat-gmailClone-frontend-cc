// src/components/mail/ComposeMailModal.tsx
'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import apiClient from '@/services/api';
import { X, Send, Users } from 'lucide-react'; // Tambahkan ikon Users jika perlu
import { Surat, User } from '@/types'; // Asumsi tipe User juga ada di types
import { useAuth } from '@/contexts/AuthContext';
import { ka } from 'date-fns/locale';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_PDF_TYPE = "application/pdf";

// Skema Zod untuk form tulis surat
const composeMailSchema = z.object({
  penerimaEmail: z.string()
    .min(1, "Email penerima tidak boleh kosong")
    .email("Format email tidak valid"),
  subject: z.string()
    .min(1, "Subjek tidak boleh kosong"),
  isi: z.string(), // Isi surat opsional
  kategori_surat: z.enum(["resmi", "tidak resmi"], {
    errorMap: () => ({ message: "Pilih kategori surat" }),
  }),
  pdfFile: z.any() // Menggunakan z.any() untuk menerima FileList
    .optional() // Opsional secara umum, tapi akan divalidasi lebih lanjut dengan superRefine
    .refine(
      (files) => {
        // Hanya validasi jika files adalah FileList dan ada isinya (berjalan di client)
        if (typeof FileList !== 'undefined' && files instanceof FileList && files.length > 0) {
          return files[0].size <= MAX_FILE_SIZE_BYTES;
        }
        return true; // Jika bukan FileList atau kosong, lewati validasi ini (superRefine akan menangani required)
      },
      `Ukuran file PDF maksimal adalah ${MAX_FILE_SIZE_MB}MB.`
    )
    .refine(
      (files) => {
        if (typeof FileList !== 'undefined' && files instanceof FileList && files.length > 0) {
          return files[0].type === ACCEPTED_PDF_TYPE;
        }
        return true;
      },
      "Hanya file dengan format PDF yang diizinkan."
    ),
})
.superRefine((data, ctx) => {
  // Validasi kondisional untuk pdfFile berdasarkan kategori_surat
  if (data.kategori_surat === "resmi") {
    if (!data.pdfFile || data.pdfFile.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "File PDF wajib diisi untuk surat resmi",
        path: ["pdfFile"], // Path field yang bermasalah
      });
    }
  }
});

// Infer type dari skema Zod untuk digunakan di komponen
type ComposeFormInputs = z.infer<typeof composeMailSchema>;

interface ComposeMailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMailSent: (newMail: Surat) => void;
}

// type ComposeFormInputs = {
//   penerimaEmail: string; // Ini akan menjadi email dari user yang dipilih
//   subject: string;
//   isi: string;
//   kategori_surat: "resmi" | "tidak resmi";
//   pdfFile?: FileList;
// };

const ComposeMailModal: React.FC<ComposeMailModalProps> = ({ isOpen, onClose, onMailSent }) => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
    setValue, // Masih bisa digunakan jika perlu
    // getValues // Bisa berguna untuk debugging
  } = useForm<ComposeFormInputs>({
    resolver: zodResolver(composeMailSchema), // Gunakan zodResolver di sini
    defaultValues: {
      kategori_surat: "tidak resmi",
      penerimaEmail: "",
      subject: "",
      isi: "",
      pdfFile: undefined, // Eksplisit set undefined untuk FileList
    }
  });
  const [serverError, setServerError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]); // State untuk menyimpan daftar user
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  const kategoriSurat = watch("kategori_surat");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { user: currentUser } = useAuth(); // Mengambil user yang sedang login dari AuthContext

  const pdfFileFromWatch = watch("pdfFile");
  // console.log("is submitting: ", isSubmitting);

  useEffect(() => {
    if (kategoriSurat === 'resmi') { // Hanya log jika relevan
      if (pdfFileFromWatch && pdfFileFromWatch.length > 0) {
        console.log("WATCHED PDF FILE:", pdfFileFromWatch[0]); // Log file yang terdeteksi
      } else {
        console.log("WATCHED PDF FILE: Kosong atau tidak ada file.");
      }
    }
  }, [pdfFileFromWatch, kategoriSurat]);

  // Fungsi untuk mengambil daftar user
  useEffect(() => {
    if (isOpen) { // Hanya fetch user jika modal terbuka
      const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
          const response = await apiClient.get<User[]>('/auth/users'); // Endpoint Anda
          // Filter user yang sedang login agar tidak muncul di daftar penerima
          const filteredUsers = response.data.filter(user => user.id !== currentUser?.id);
          setUsers(filteredUsers);
        } catch (error) {
          console.error("Gagal mengambil daftar user:", error);
          // Anda bisa menampilkan error ke pengguna jika perlu
          setServerError("Gagal memuat daftar penerima.");
        } finally {
          setLoadingUsers(false);
        }
      };
      fetchUsers();
    } else{
      setUsers([]); // Kosongkan daftar user saat modal ditutup
      setServerError(null); // Reset error saat modal ditutup
      reset(); // Reset form saat modal ditutup
    }
  }, [isOpen, currentUser?.id]); // Tambahkan currentUser?.id sebagai dependency

  const onSubmit: SubmitHandler<ComposeFormInputs> = async (data) => {
    // console.log("Form Data kirim email: ", data);
    // setServerError(null);

    // if (kategoriSurat === 'resmi' && !data.pdfFile) {
    //   setServerError('File PDF wajib diisi untuk surat resmi.');
    //   return;
    // }

    // if (!data.penerimaEmail) {
    //   setServerError('Penerima surat wajib dipilih.');
    //   return;
    // }

    // const formData = new FormData();
    // formData.append('penerimaEmail', data.penerimaEmail);
    // formData.append('subject', data.subject);
    // formData.append('isi', data.isi ?? "");
    // formData.append('kategori_surat', data.kategori_surat);

    // if (data.kategori_surat === 'resmi' && data.pdfFile && data.pdfFile.length > 0) {
    //   formData.append('pdfFile', data.pdfFile[0]);
    // } else if (data.kategori_surat === 'resmi' && (!data.pdfFile || data.pdfFile.length === 0)) {
    //   setServerError('File PDF wajib diisi untuk surat resmi.');
    //   return;
    // }
    setServerError(null);
    console.log("Form data (Zod validated):", data);

    const formData = new FormData();
    formData.append('penerimaEmail', data.penerimaEmail);
    formData.append('subject', data.subject);
    formData.append('isi', data.isi || ""); // Kirim string kosong jika isi undefined
    formData.append('kategori_surat', data.kategori_surat);

    if (data.kategori_surat === 'resmi' && data.pdfFile && data.pdfFile.length > 0) {
      console.log("Mengirim file PDF:", data.pdfFile[0].name);
      formData.append('pdfFile', data.pdfFile[0]);
    }
    // Validasi "jika resmi maka pdfFile wajib" sudah ditangani oleh Zod .superRefine


    try {
      const response = await apiClient.post<{ message: string; surat: Surat }>('/surat', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      onMailSent(response.data.surat);
      console.log("Surat berhasil dikirim:", response.data.surat);
      reset();
      setUsers([]); // Kosongkan daftar user setelah berhasil, agar fetch ulang saat dibuka lagi jika ada perubahan
      alert(response.data.message || 'Surat berhasil dikirim!');
      onClose();
    } catch (error: any) {
      setServerError(error.response?.data?.message || 'Gagal mengirim surat.');
      console.error(error);
    }
  };

  // const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   console.log("NATIVE onChange triggered on file input.");
  //   if (event.target.files && event.target.files.length > 0) {
  //     console.log("NATIVE Selected File:", event.target.files[0].name, event.target.files[0]);
  //     // Coba secara manual set nilai ke react-hook-form
  //     // Ini akan memberitahu RHF tentang file tersebut dan seharusnya memicu 'watch'
  //     setValue('pdfFile', event.target.files, { shouldValidate: true, shouldDirty: true });
  //   } else {
  //     console.log("NATIVE No file selected or files array is empty.");
  //     // Jika tidak ada file, set nilainya ke undefined atau null agar RHF tahu
  //     setValue('pdfFile', undefined, { shouldValidate: true, shouldDirty: true });
  //   }
  // };

  const handleCloseModal = () => {
    reset(); // Reset form saat ditutup manual
    setUsers([]);
    onClose();
  };

  if (!isOpen) return null;

  console.log("Form Errors:", errors); // <-- TAMBAHKAN INI
  console.log("is submitting (luar onSubmit): ", isSubmitting); // Log Anda yang sudah ada
  console.log("kategoriSurat saat render:", kategoriSurat);

  return (
    <div className="fixed inset-0 bg-black/40 bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
      <div className="bg-surface rounded-xl bg-slate-50 text-slate-700 shadow-2xl w-full max-w-2xl transform transition-all duration-300 scale-100 max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-textPrimary">Tulis Surat Baru</h2>
          <button onClick={() => { reset(); setUsers([]); onClose(); }} className="text-gray-500 hover:text-gray-700 transition-colors">
            <X className="w-7 h-7" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5 overflow-y-auto text-slate-700">
          <div>
            <label htmlFor="penerimaEmail" className="block text-sm font-medium text-gray-700 mb-1">
              Kepada (Pilih Penerima) <span className="text-red-500">*</span>
            </label>
            {loadingUsers ? (
              <div className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-sm">
                Memuat daftar penerima...
              </div>
            ) : (
              <select
                id="penerimaEmail"
                {...register('penerimaEmail')}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm appearance-none bg-white"
                defaultValue="" // Penting untuk placeholder
              >
                <option value="" disabled>Pilih penerima...</option>
                {users.map(user => (
                  <option key={user.id} value={user.email}>
                    {user.nama} ({user.email})
                  </option>
                ))}
              </select>
            )}
            {errors.penerimaEmail && <p className="mt-1 text-xs text-red-600">{errors.penerimaEmail.message}</p>}
          </div>

          {/* Sisa form lainnya (subject, isi, kategori, pdfFile) tetap sama */}
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
              Subjek <span className="text-red-500">*</span>
            </label>
            <input
              id="subject"
              type="text"
              {...register('subject')}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="Subjek surat Anda"
            />
            {errors.subject && <p className="mt-1 text-xs text-red-600">{errors.subject.message}</p>}
          </div>

          <div>
            <label htmlFor="isi" className="block text-sm font-medium text-gray-700 mb-1">
              Isi Surat
            </label>
            <textarea
              id="isi"
              {...register('isi')}
              rows={6}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="Tulis isi surat Anda di sini..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kategori Surat <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="radio" value="tidak resmi" {...register('kategori_surat')} className="form-radio text-primary focus:ring-primary" />
                <span className="text-sm">Tidak Resmi</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="radio" value="resmi" {...register('kategori_surat')} className="form-radio text-primary focus:ring-primary" />
                <span className="text-sm">Resmi (Dengan PDF)</span>
              </label>
            </div>
          </div>

          {kategoriSurat === 'resmi' && (
            <div>
              <label htmlFor="pdfFile" className="block text-sm font-medium text-gray-700 bg-slate-50 mb-1">
                Lampiran PDF <span className="text-red-500">*</span>
              </label>
              <input
                id="pdfFile"
                type="file"
                accept=".pdf"
                {...register('pdfFile')}
                // ref={fileInputRef}
                // onChange={(e) => {
                  // console.log("File changed: ", e.target.files?.[0]);

                  // // Cek nilai di form context React Hook Form
                  // const formValue = getValues("pdfFile");
                  // console.log("File in form via getValues:", formValue);
                //   handleFileChange(e);
                // }}
                className="block w-full text-sm border border-black/15 rounded-lg text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-hover file:cursor-pointer"
              />
              {/* {errors.pdfFile?.message && <p className="mt-1 text-xs text-red-600">{errors.pdfFile.message}</p>} */}
            </div>
          )}

          {serverError && <p className="text-sm text-red-600 text-center py-2">{serverError}</p>}

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => { reset(); setUsers([]); onClose(); handleCloseModal(); }}
              disabled={isSubmitting}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition duration-150 ease-in-out disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || loadingUsers} // Disable juga jika sedang loading users
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary flex items-center justify-center space-x-2 transition duration-150 ease-in-out disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>{isSubmitting ? 'Mengirim...' : 'Kirim Surat'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComposeMailModal;

// Jangan lupa untuk mengimpor useAuth jika belum ada di file ini
// import { useAuth } from '@/contexts/AuthContext'; // Sesuaikan path jika perlu