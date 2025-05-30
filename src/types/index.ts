// src/types/index.ts
export interface User {
  id: string;
  nama: string;
  email: string;
}

export interface Surat {
  id: string;
  subject: string;
  isi?: string | null;
  kategori_surat: "resmi" | "tidak resmi";
  status_baca: "dibaca" | "belum dibaca";
  pdf_file_path?: string | null;
  pengirimId: string;
  pengirim: Pick<User, 'id' | 'nama' | 'email'>; // Hanya beberapa field dari User
  penerimaId: string;
  penerima: Pick<User, 'id' | 'nama' | 'email'>;
  createdAt: string; // ISO date string
}

export interface ActivityLog {
  id: string;
  userId?: string | null;
  action: string;
  entity?: string | null;
  entityId?: string | null;
  details?: any | null; // Bisa lebih spesifik jika tahu strukturnya
  ipAddress?: string | null;
  createdAt: string; // ISO date string
}

export interface AuthResponse {
  accessToken: string;
  userId: string;
  nama: string;
}