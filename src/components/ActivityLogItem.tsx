import { ActivityLog } from "@/types";
import { useState } from "react";

import { format, parseISO } from 'date-fns';
import { id as localeID } from 'date-fns/locale'; // locale untuk bahasa Indonesia

// Komponen untuk setiap item log
const ActivityLogItem: React.FC<{ log: ActivityLog }> = ({ log }) => {
  const [showDetails, setShowDetails] = useState(false);

//   console.log("Rendering ActivityLogItem:", log);

  return (
    <div className="bg-white p-4 mb-3 rounded-lg shadow-sm border border-gray-300 hover:shadow-md transition-shadow duration-150">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div className="flex-1 mb-2 sm:mb-0">
          <p className="font-semibold text-sm sm:text-base text-slate-800">
            {log.action.replace(/_/g, ' ').toUpperCase()}
          </p>
          {log.entity && log.entityId && (
            <p className="text-xs text-gray-800">
              Entitas: {log.entity} (ID: {log.entityId})
            </p>
          )}
        </div>
        <div className="flex text-sm text-gray-500 text-left sm:text-right">
          <p>{format(parseISO(log.createdAt), 'EEEE, dd MMM yyyy', { locale: localeID })} |</p>
          <p>| {format(parseISO(log.createdAt), 'HH:mm:ss', { locale: localeID })} WIB |</p>
          {log.ipAddress && <p>| IP: {log.ipAddress}</p>}
        </div>
      </div>
      {log.details && (typeof log.details === 'object' && Object.keys(log.details).length > 0) && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-blue-600 hover:underline mb-1"
          >
            {showDetails ? 'Sembunyikan Detail' : 'Tampilkan Detail'}
          </button>
          {showDetails && (
            <pre className="bg-gray-50 p-2 rounded text-xs text-gray-700 overflow-x-auto whitespace-pre-wrap break-all">
              {JSON.stringify(log.details, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};

export default ActivityLogItem;