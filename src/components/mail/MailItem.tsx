import { Surat } from "@/types";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Eye, EyeOff, FileText, Trash2 } from "lucide-react";

// Komponen MailItem (Bisa dipisah ke file sendiri: src/components/mail/MailItem.tsx)
interface MailItemProps {
  surat: Surat;
  onView: (surat: Surat) => void;
  onDelete: (suratId: string) => void; // Tambahkan prop onDelete
  onToggleRead: (surat: Surat) => void;
}

const MailItem: React.FC<MailItemProps> = ({ surat, onView, onDelete, onToggleRead }) => {
  const isUnread = surat.status_baca === 'belum dibaca';
  return (
    <div
      className={`flex text-slate-700 items-start p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${
        isUnread ? 'bg-blue-100 font-semibold' : 'bg-white'
      }`}
    >
      <div className="flex-shrink-0 mr-4">
        {/* Checkbox atau ikon user bisa ditambahkan di sini */}
        <button onClick={(e) => { e.stopPropagation(); onToggleRead(surat); }} title={isUnread ? "Tandai sudah dibaca" : "Tandai belum dibaca"}>
          {isUnread ? <EyeOff className="w-5 h-5 text-blue-500" /> : <Eye className="w-5 h-5 text-gray-400" />}
        </button>
      </div>
      <div className="flex-1 min-w-0" onClick={() => onView(surat)}>
        <div className="flex justify-between items-center">
          <p className={`text-sm truncate ${isUnread ? 'text-primary' : 'text-textPrimary'}`}>
            {surat.pengirim.nama}
          </p>
          <time className={`text-xs ${isUnread ? 'text-blue-600' : 'text-textSecondary'}`}>
            {format(new Date(surat.createdAt), 'dd MMM yy, HH:mm', { locale: id })}
          </time>
        </div>
        <p className={`text-sm font-medium truncate mt-1 ${isUnread ? 'text-gray-800' : 'text-gray-700'}`}>
          {surat.subject}
        </p>
        <p className="text-xs text-textSecondary truncate mt-1">
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

export default MailItem;