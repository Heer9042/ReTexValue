import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Filter, Download, ArrowUpRight, ArrowDownLeft, DollarSign, Calendar, BadgeDollarSign } from 'lucide-react';

export default function Transactions() {
  const { transactions, listings, users, settings } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');

  // Helper to find participant names
  const getParticipant = (id, role) => {
     const u = users.find(user => user.id === id);
     if (u) return u.name;
     if (role === 'Seller') {
        const listing = listings.find(l => l.id === id || l.factoryId === id);
        return listing ? (listing.shopName || `Factory ${id.slice(0, 4)}`) : 'Unknown Seller';
     }
     return `User ${id?.slice(0, 4)}`;
  };

  const filteredTransactions = transactions.filter(t => {
     const buyerName = getParticipant(t.buyerId, 'Buyer');
     const sellerName = getParticipant(t.sellerId, 'Seller');
     
     const matchesSearch = 
        t.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sellerName.toLowerCase().includes(searchTerm.toLowerCase());
     
     const matchesFilter = filter === 'All' ? true : t.status === filter; 

     return matchesSearch && matchesFilter;
  });

  const totalFees = transactions.reduce((acc, curr) => acc + (curr.commission || 0), 0);
  const totalVolume = transactions.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <BadgeDollarSign className="text-emerald-500" /> Transaction Ledger
           </h1>
           <p className="text-slate-500 dark:text-slate-400 mt-1">Audit Trail for all marketplace financial activities.</p>
        </div>
        <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
           <div className="px-4 py-2 text-center border-r border-slate-100 dark:border-slate-700">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Gross GMV</p>
              <p className="text-lg font-black text-slate-900 dark:text-white">₹{totalVolume.toLocaleString()}</p>
           </div>
           <div className="px-4 py-2 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Net Fees</p>
              <p className="text-lg font-black text-emerald-500">₹{totalFees.toLocaleString()}</p>
           </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch">
         <div className="relative flex-1 max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
               type="text" 
               placeholder="Search transactions, buyers, or factories..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 dark:text-white shadow-sm transition-all"
            />
         </div>
         <div className="flex bg-white dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm self-start">
            {['All', 'Completed', 'Processing', 'Failed'].map((f) => (
               <button 
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                     filter === f 
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30' 
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
               >
                  {f}
               </button>
            ))}
         </div>
         <button 
            onClick={() => {
              const headers = ['Reference ID', 'Buyer', 'Seller', 'Amount', 'Platform Fee', 'Status', 'Date'];
              const csvRows = [
                headers.join(','),
                ...filteredTransactions.map(t => {
                  const platformFee = t.commission || (t.amount * (settings?.platformFee || 5) / 100);
                  return [
                    `TX-${t.id.slice(0, 8).toUpperCase()}`,
                    `"${getParticipant(t.buyerId, 'Buyer')}"`,
                    `"${getParticipant(t.sellerId, 'Seller')}"`,
                    t.amount,
                    platformFee.toFixed(2),
                    t.status || 'Completed',
                    t.date
                  ].join(',');
                })
              ];
              const csvContent = csvRows.join('\n');
              const blob = new Blob([csvContent], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `transactions-export-${new Date().toISOString().split('T')[0]}.csv`;
              a.click();
              window.URL.revokeObjectURL(url);
            }}
            className="bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm shadow-xl shadow-slate-900/10 transition-all active:scale-95"
         >
            <Download size={18} />
            <span>Export CSV</span>
         </button>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
               <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 text-[10px] uppercase text-slate-400 dark:text-slate-500 font-black tracking-widest">
                     <th className="p-6">Reference ID</th>
                     <th className="p-6">Transaction Flow</th>
                     <th className="p-6">Financials</th>
                     <th className="p-6">Revenue Line</th>
                     <th className="p-6">Activity Date</th>
                     <th className="p-6">Status</th>
                     <th className="p-6">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {filteredTransactions.map((t) => {
                     const platformFee = t.commission || (t.amount * (settings?.platformFee || 5) / 100);
                     
                     return (
                        <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/10 transition-colors group">
                           <td className="p-6">
                              <span className="font-mono text-[11px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded-md">
                                 TX-{t.id.slice(0, 8).toUpperCase()}
                              </span>
                           </td>
                           <td className="p-6">
                              <div className="flex flex-col gap-2">
                                 <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                       <ArrowDownLeft size={12} className="text-emerald-600" />
                                    </div>
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{getParticipant(t.buyerId, 'Buyer')}</span>
                                 </div>
                                 <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                       <ArrowUpRight size={12} className="text-blue-600" />
                                    </div>
                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{getParticipant(t.sellerId, 'Seller')}</span>
                                 </div>
                              </div>
                           </td>
                           <td className="p-6">
                              <div className="flex flex-col">
                                 <span className="text-sm font-black text-slate-900 dark:text-white">
                                    ₹{t.amount.toLocaleString()}
                                 </span>
                                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Post-Tax Total</span>
                              </div>
                           </td>
                           <td className="p-6">
                              <div className="flex flex-col">
                                 <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                                    +₹{platformFee.toLocaleString()}
                                 </span>
                                 <span className="text-[10px] text-emerald-500/60 font-bold uppercase tracking-tight">Platform Fee ({settings?.platformFee || 5}%)</span>
                              </div>
                           </td>
                           <td className="p-6">
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                                 <Calendar size={14} className="opacity-50" /> {t.date}
                              </div>
                           </td>
                           <td className="p-6">
                              <StatusBadge status={t.status || 'Completed'} />
                           </td>
                           <td className="p-6">
                              <button 
                                 onClick={() => {
                                   const invoiceContent = `INVOICE\n\nTransaction ID: TX-${t.id.slice(0, 8).toUpperCase()}\nDate: ${t.date}\n\nBuyer: ${getParticipant(t.buyerId, 'Buyer')}\nSeller: ${getParticipant(t.sellerId, 'Seller')}\n\nAmount: ₹${t.amount.toLocaleString()}\nPlatform Fee (${settings?.platformFee || 5}%): ₹${platformFee.toLocaleString()}\nNet Amount: ₹${(t.amount - platformFee).toLocaleString()}\n\nStatus: ${t.status || 'Completed'}`;
                                   const blob = new Blob([invoiceContent], { type: 'text/plain' });
                                   const url = window.URL.createObjectURL(blob);
                                   const a = document.createElement('a');
                                   a.href = url;
                                   a.download = `invoice-TX-${t.id.slice(0, 8).toUpperCase()}.txt`;
                                   a.click();
                                   window.URL.revokeObjectURL(url);
                                 }}
                                 className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0"
                              >
                                 Invoice
                              </button>
                           </td>
                        </tr>
                     );
                  })}
                  {filteredTransactions.length === 0 && (
                     <tr>
                        <td colSpan="7" className="p-20 text-center">
                           <div className="flex flex-col items-center gap-2 text-slate-400">
                              <DollarSign size={48} className="opacity-10" />
                              <p className="font-bold text-sm">No transactions found matching your criteria.</p>
                           </div>
                        </td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>
         
         <div className="p-6 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Displaying {filteredTransactions.length} unique records</p>
            <div className="flex gap-4">
               <button className="text-[10px] font-black uppercase text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors disabled:opacity-30" disabled>Previous Page</button>
               <button className="text-[10px] font-black uppercase text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors disabled:opacity-30" disabled>Next Page</button>
            </div>
         </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
   const styles = {
      Completed: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20',
      Processing: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border-amber-100 dark:border-amber-500/20',
      Failed: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 border-rose-100 dark:border-rose-500/20',
      Refunded: 'bg-slate-50 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400 border-slate-100 dark:border-slate-500/20'
   };

   return (
      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${styles[status] || styles.Completed}`}>
         {status}
      </span>
   );
}

