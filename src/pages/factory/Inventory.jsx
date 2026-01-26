import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Trash2, Edit, Search, Filter, SlidersHorizontal, ArrowUpDown, Package, Trash, AlertCircle } from 'lucide-react';

export default function Inventory() {
  const { listings, deleteListing, user } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Newest');

  // Filter listings for the logged-in factory
  const myListings = listings.filter(l => l.factoryId === user?.id);
  
  // Get Unique Filter Options
  const fabricTypes = ['All', ...new Set(myListings.map(l => l.fabricType))];

  // Advanced Filtering Logic
  const filteredListings = myListings.filter(l => {
      const matchesSearch = l.fabricType.toLowerCase().includes(searchTerm.toLowerCase()) || l.id.includes(searchTerm);
      const matchesStatus = statusFilter === 'All' || l.status === statusFilter;
      const matchesType = typeFilter === 'All' || l.fabricType === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
  }).sort((a, b) => {
      if (sortBy === 'Newest') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'Oldest') return new Date(a.date) - new Date(b.date);
      if (sortBy === 'Price: High to Low') return b.price - a.price;
      if (sortBy === 'Price: Low to High') return a.price - b.price;
      return 0;
  });

  const handleDelete = async (id) => {
     await deleteListing(id);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Inventory Management</h1>
           <p className="text-slate-500 dark:text-slate-400 mt-1">Track and manage your textile waste listings.</p>
        </div>
      </div>

      {/* Modern Filter Panel */}
      <div className="bg-white dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl shadow-slate-200/50 dark:shadow-none flex flex-col lg:flex-row gap-6 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
             {/* Search */}
             <div className="relative w-full sm:w-80">
                <input 
                  type="text" 
                  placeholder="Asset ID or textile type..." 
                  className="w-full bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white rounded-2xl pl-12 pr-4 py-3.5 border border-slate-100 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-medium text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
             </div>

             {/* Status Filter */}
             <div className="relative h-full">
                <select 
                   value={statusFilter}
                   onChange={(e) => setStatusFilter(e.target.value)}
                   className="h-full bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 pl-12 pr-10 py-3.5 rounded-2xl border border-slate-100 dark:border-slate-700 outline-none appearance-none cursor-pointer font-bold text-xs uppercase tracking-widest"
                >
                   <option value="All">All Status</option>
                   <option value="Live">Live</option>
                   <option value="Pending">On Verification</option>
                   <option value="Sold">Archived/Sold</option>
                </select>
                <Filter className="absolute left-4 top-4 text-slate-400 w-4 h-4" />
             </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
             {/* Type Filter */}
             <div className="relative">
                <select 
                   value={typeFilter}
                   onChange={(e) => setTypeFilter(e.target.value)}
                   className="h-full bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 pl-12 pr-10 py-3.5 rounded-2xl border border-slate-100 dark:border-slate-700 outline-none appearance-none cursor-pointer font-bold text-xs uppercase tracking-widest"
                >
                   {fabricTypes.map(t => <option key={t} value={t}>{t === 'All' ? 'Textile Hierarchy' : t}</option>)}
                </select>
                <SlidersHorizontal className="absolute left-4 top-4 text-slate-400 w-4 h-4" />
             </div>

             {/* Sort */}
             <div className="relative">
                <select 
                   value={sortBy}
                   onChange={(e) => setSortBy(e.target.value)}
                   className="h-full bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 pl-12 pr-10 py-3.5 rounded-2xl border border-slate-100 dark:border-slate-700 outline-none appearance-none cursor-pointer font-bold text-xs uppercase tracking-widest"
                >
                   <option>Newest</option>
                   <option>Oldest</option>
                   <option>Price: High to Low</option>
                   <option>Price: Low to High</option>
                </select>
                <ArrowUpDown className="absolute left-4 top-4 text-slate-400 w-4 h-4" />
             </div>
          </div>
      </div>

      {/* Listing Table */}
      <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50/50 dark:bg-slate-900/30">
                <th className="px-8 py-6">Asset Spec</th>
                <th className="px-8 py-6">Composition</th>
                <th className="px-8 py-6">Inventory Volume</th>
                <th className="px-8 py-6">Market Price</th>
                <th className="px-8 py-6">Lifecycle Phase</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {filteredListings.length > 0 ? (
                 filteredListings.map((listing) => (
                   <tr key={listing.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-all group">
                     <td className="px-8 py-6">
                       <div className="w-16 h-16 rounded-2xl border border-slate-100 dark:border-slate-600 overflow-hidden shadow-sm group-hover:scale-110 transition-transform">
                          <img src={listing.imageUrl} alt={listing.fabricType} className="w-full h-full object-cover" />
                       </div>
                     </td>
                     <td className="px-8 py-6">
                       <div className="font-bold text-slate-900 dark:text-white text-sm">{listing.fabricType}</div>
                       <div className="text-[9px] font-mono text-slate-400 uppercase tracking-tighter mt-1">UUID: {listing.id.substring(0, 12)}...</div>
                     </td>
                     <td className="px-8 py-6 text-sm font-black text-slate-700 dark:text-slate-300">
                        {listing.quantity} <span className="text-[10px] text-slate-400">kg</span>
                     </td>
                     <td className="px-8 py-6">
                        <span className="text-sm font-black text-emerald-600">₹{listing.price}</span>
                        <span className="text-[9px] text-slate-400 font-bold ml-1">/kg</span>
                     </td>
                     <td className="px-8 py-6">
                        <StatusLabel status={listing.status} />
                     </td>
                     <td className="px-8 py-6 text-right">
                       <div className="flex justify-end gap-2">
                          <button className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-600 dark:text-slate-300 transition-all transform active:scale-95">
                             <Edit size={16} />
                          </button>
                          <button 
                             onClick={() => handleDelete(listing.id)}
                             className="w-10 h-10 flex items-center justify-center bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-500 hover:text-white rounded-xl text-rose-500 transition-all transform active:scale-95"
                          >
                             <Trash size={16} />
                          </button>
                       </div>
                     </td>
                   </tr>
                 ))
              ) : (
                 <tr>
                    <td colSpan="6" className="px-8 py-32 text-center text-slate-500">
                       <div className="flex flex-col items-center gap-6">
                          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center border border-slate-100 dark:border-slate-800">
                             <AlertCircle size={32} className="opacity-20 text-slate-900 dark:text-white" />
                          </div>
                          <div>
                             <p className="text-sm font-black uppercase tracking-widest text-slate-400 mb-2">No Match Detected</p>
                             <p className="text-xs text-slate-500 font-medium">Clear your parameters to view the global catalog.</p>
                          </div>
                          <button 
                             onClick={() => {setStatusFilter('All'); setTypeFilter('All'); setSearchTerm('');}}
                             className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
                          >
                             Reset Hierarchy
                          </button>
                       </div>
                    </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusLabel({ status }) {
   const styles = {
     Live: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
     Pending: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
     Sold: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
     Rejected: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400",
   };
   return (
     <span className={`px-4 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${styles[status] || styles.Pending}`}>
       {status}
     </span>
   );
}

