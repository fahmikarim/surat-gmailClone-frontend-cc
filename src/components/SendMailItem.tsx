import { Surat } from "@/types";
import { FileText, Trash2 } from "lucide-react";
import { format } from 'date-fns';
import { id } from "date-fns/locale";

// Komponen SentMailItem (Mirip MailItem, tapi untuk surat terkirim)
interface SentMailItemProps {
  surat: Surat;
  onView: (surat: Surat) => void;
  onDelete: (suratId: string) => void; 
}

const SentMailItem: React.FC<SentMailItemProps> = ({ surat, onView, onDelete }) => {
  return (
    <div
      onClick={() => onView(surat)}
      className="flex items-start p-4 border-b border-gray-300 hover:bg-gray-50 cursor-pointer transition-colors duration-150 bg-white"
    >
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <p className="text-sm text-slate-700 truncate">
            Kepada: {surat.penerima.nama}
          </p>
          <time className="text-xs text-slate-700">
            {format(new Date(surat.createdAt), 'dd MMM yy, HH:mm', { locale: id })}
          </time>
        </div>
        <p className="text-sm font-medium truncate mt-1 text-gray-700">
          {surat.subject}
        </p>
        <p className="text-xs text-slate-700 truncate mt-1">
          {surat.isi ? surat.isi.substring(0, 100) + (surat.isi.length > 100 ? '...' : '') : '(Tidak ada isi)'}
        </p>
      </div>
      <div className="ml-4 flex items-center space-x-2">
        {surat.kategori_surat === 'resmi' && surat.pdf_file_path && (
          <FileText className="w-5 h-5 text-red-500" xlinkTitle="Surat Resmi (PDF)" />
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(surat.id); }}
          className="ml-2 text-red-400 hover:text-red-600"
          title="Hapus Surat"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      
    </div>
  );
};

export default SentMailItem;