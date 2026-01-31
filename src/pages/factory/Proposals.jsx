import React from 'react';
import { useApp } from '../../context/AppContext';
import { FileText, CheckCircle, Clock, XCircle, ArrowRight, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FactoryProposals() {
  const { proposals, user } = useApp();
  
  // Mock proposals if none exist for factory context (since context might be shared/mocked)
  // Filtering proposals made BY this factory or TO this factory? 
  // Assuming 'Factory' role submits proposals TO buyers' requests.
  // Filter proposals for the current user/factory (assuming 'factory1' for demo or user.id)
  const myProposals = proposals.filter(p => p.factoryId === user?.id);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">My Proposals</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm sm:text-base">Track the status of quotes sent to buyers.</p>
        </div>
        <Link to="/buyer/bulk-request" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-colors text-sm font-medium">
           <FileText size={16} /> Browse New Requests
        </Link>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {myProposals.map((p) => (
          <div key={p.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 dark:text-white truncate">{p.fabricType}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">#{p.requestId}</p>
              </div>
              <StatusBadge status={p.status} />
            </div>
            <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-100 dark:border-slate-700">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Buyer</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                    <User size={10} />
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{p.buyer}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">My Quote</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">₹{p.priceQuoted}/kg</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Quantity</p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{p.quantity} kg</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Date</p>
                <p className="text-xs text-slate-600 dark:text-slate-300">{p.date}</p>
              </div>
            </div>
            <button className="w-full mt-3 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm flex items-center justify-center gap-1 py-2 bg-slate-50 dark:bg-slate-700/30 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              View Details <ArrowRight size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm dark:shadow-none">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold tracking-wider">
                     <th className="p-5">Request ID</th>
                     <th className="p-5">Details</th>
                     <th className="p-5">Buyer</th>
                     <th className="p-5">My Quote</th>
                     <th className="p-5">Submitted On</th>
                     <th className="p-5">Status</th>
                     <th className="p-5">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
                  {myProposals.map((p) => (
                     <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors group">
                        <td className="p-5 font-mono text-slate-500 dark:text-slate-400 font-medium">#{p.requestId}</td>
                        <td className="p-5">
                           <p className="font-bold text-slate-900 dark:text-white">{p.fabricType}</p>
                           <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{p.quantity} kg required</p>
                        </td>
                        <td className="p-5">
                           <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs">
                                 <User size={12} />
                              </div>
                              <span className="text-slate-700 dark:text-slate-300">{p.buyer}</span>
                           </div>
                        </td>
                        <td className="p-5 font-medium text-slate-900 dark:text-white">
                           ₹{p.priceQuoted}/kg
                        </td>
                        <td className="p-5 text-slate-500 dark:text-slate-400">
                           {p.date}
                        </td>
                        <td className="p-5">
                           <StatusBadge status={p.status} />
                        </td>
                        <td className="p-5">
                           <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              View Details <ArrowRight size={14} />
                           </button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
   const styles = {
      Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-700/50',
      Accepted: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-700/50',
      Rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-700/50',
   };

   const icons = {
      Pending: <Clock size={12} />,
      Accepted: <CheckCircle size={12} />,
      Rejected: <XCircle size={12} />,
   };

   return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.Pending}`}>
         {icons[status]} {status}
      </span>
   );
}
