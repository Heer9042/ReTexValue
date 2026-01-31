import React from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowRight } from 'lucide-react';

export default function BulkRequests() {
  const { bulkRequests } = useApp();
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Bulk Requests</h1>
        <div className="bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-4 py-2 rounded-lg text-sm font-medium border border-blue-200 dark:border-blue-700/50 flex items-center gap-2">
           <FileText size={16} /> {bulkRequests.length} active requests
        </div>
      </div>

      <div className="grid gap-4">
          {bulkRequests.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-800/30 rounded-xl text-slate-500 border border-dashed border-slate-300 dark:border-slate-700">
               <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
               <p className="text-lg font-medium text-slate-900 dark:text-white">No Requests Found</p>
               <p className="text-slate-500">There are no active bulk material requests from buyers.</p>
            </div>
          ) : (
            bulkRequests.map((req) => (
              <div key={req.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-xl flex flex-col md:flex-row justify-between gap-6 shadow-sm dark:shadow-none hover:border-blue-300 dark:hover:border-blue-700 transition-colors animate-in fade-in slide-in-from-bottom-2">
                 <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                       <h3 className="text-xl font-bold text-slate-900 dark:text-white">{req.fabricType}</h3>
                       <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                          {req.fabricCategory}
                       </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400 mb-4">
                        <span className="flex items-center gap-1">
                           <span className="font-semibold text-slate-900 dark:text-white">Qty:</span> {req.quantity} kg
                        </span>
                        <span className="flex items-center gap-1">
                           <span className="font-semibold text-slate-900 dark:text-white">Target:</span> ₹{req.targetPrice || 'Market'}
                        </span>
                        <span className="flex items-center gap-1">
                           <span className="font-semibold text-slate-900 dark:text-white">Deadline:</span> {req.deadline}
                        </span>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-700/50">
                       <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                          "{req.description || 'No specific description provided.'}"
                       </p>
                       <div className="mt-3 text-xs text-slate-500 flex items-center gap-2">
                          Request ID: <span className="font-mono text-slate-400">{req.id ? req.id.slice(0, 8) : 'REQ-001'}</span>
                          <span>•</span>
                          Buyer: <span className="font-medium text-slate-700 dark:text-slate-300">{req.buyerName}</span>
                       </div>
                    </div>
                 </div>
                 
                 <div className="flex flex-col justify-center shrink-0 w-full md:w-48 gap-3">
                    <button 
                       onClick={() => {
                         navigate(`/admin/bulk-requests/${req.id}/match`);
                       }}
                       className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg text-sm font-bold transition-colors shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                    >
                       Match Factory <ArrowRight size={16} />
                    </button>
                    <button 
                       onClick={() => {
                         navigate(`/admin/bulk-requests/${req.id}`);
                       }}
                       className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors"
                    >
                       View Details
                    </button>
                 </div>
              </div>
            ))
          )}
      </div>
    </div>
  );
}
