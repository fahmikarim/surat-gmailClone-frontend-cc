// src/components/mail/MailDetailModal.tsx
import { Surat } from "@/types";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { FileText, X } from "lucide-react";

interface MailDetailModalProps {
  surat: Surat | null;
  onClose: () => void;
  onMarkAsUnread?: (suratId: string) => void;
}

const MailDetailModal: React.FC<MailDetailModalProps> = ({ surat, onClose, onMarkAsUnread }) => {
  if (!surat) return null;

  // Asumsi surat.pdf_file_path adalah URL publik yang valid ke file PDF di GCS
  // Jika PDF Anda memerlukan URL viewer khusus (misalnya dari Google Drive), Anda mungkin perlu menyesuaikannya.
  // Untuk GCS, URL publik langsung biasanya sudah cukup untuk iframe.
  const pdfUrl = surat.pdf_file_path;

  console.log("URL PDF untuk iframe:", pdfUrl);

  return (
    <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white text-slate-700 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}> {/* Max-width bisa disesuaikan */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-textPrimary">{surat.subject}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-grow"> {/* flex-grow agar konten bisa memenuhi sisa ruang */}
          <div className="mb-4">
            <p className="text-sm text-textSecondary">
              Dari: <span className="font-medium text-textPrimary">{surat.pengirim.nama} ({surat.pengirim.email})</span>
            </p>
            <p className="text-sm text-textSecondary">
              Kepada: <span className="font-medium text-textPrimary">{surat.penerima.nama} ({surat.penerima.email})</span>
            </p>
            <p className="text-sm text-textSecondary">
              Tanggal: {format(new Date(surat.createdAt), 'EEEE, dd MMMM yyyy, HH:mm', { locale: id })}
            </p>
            <p className="text-sm text-textSecondary">
              Kategori: <span className="capitalize">{surat.kategori_surat}</span>
            </p>
            {surat.status_baca === 'dibaca' && onMarkAsUnread && (
              <button
                onClick={() => onMarkAsUnread(surat.id)}
                className="mt-2 text-xs text-blue-600 hover:underline"
              >
                Tandai sebagai belum dibaca
              </button>
            )}
          </div>
          <div className="prose max-w-none text-gray-700 mb-6"> {/* Tambah margin bawah untuk isi surat */}
            {surat.isi || <p className="italic">Tidak ada isi pesan.</p>}
          </div>

          {/* Bagian Lampiran dan Preview PDF */}
          {surat.kategori_surat === 'resmi' && pdfUrl && (
            <div className="mt-4 pt-4 border-t"> {/* Border pemisah */}
              <div className="mb-4"> {/* Kontainer untuk link unduh */}
                <h4 className="font-semibold text-textPrimary mb-2">Lampiran PDF:</h4>
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-primary hover:underline"
                >
                  <FileText className="w-5 h-5" />
                  <span>Lihat/Unduh PDF</span>
                </a>
                {/* <p className="text-xs text-gray-500 mt-1">Path: {pdfUrl}</p> */} {/* Path mungkin tidak perlu ditampilkan jika sudah ada link */}
              </div>

              {/* Preview PDF dalam Iframe */}
              <div className="mt-2">
                <h5 className="text-sm font-semibold text-textPrimary mb-2">Preview Dokumen:</h5>
                <iframe
                  src={pdfUrl}
                  className="w-full h-[500px] rounded-md border border-gray-300" // Atur tinggi sesuai kebutuhan, misal h-[500px] atau h-96
                  title={`Preview PDF - ${surat.subject}`}
                  // sandbox="allow-scripts allow-same-origin" // Pertimbangkan sandbox untuk keamanan jika sumber PDF tidak sepenuhnya terpercaya
                >
                  <p className="p-4 text-sm text-gray-600">
                    Browser Anda tidak mendukung tampilan PDF dalam iframe.
                    Silakan <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">unduh PDF</a> untuk melihatnya.
                  </p>
                </iframe>
              </div>
            </div>
          )}
        </div>
        <div className="p-4 border-t flex justify-end bg-gray-50 rounded-b-lg"> {/* Latar footer modal */}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default MailDetailModal;