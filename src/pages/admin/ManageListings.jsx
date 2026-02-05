import React, { useState, useEffect } from 'react';
import { Search, Filter, Trash2, Edit2, ShoppingBag, Eye, MapPin, Package } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function ManageListings() {
  const { listings, deleteListing, users, fetchListings, fetchUsers } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedListing, setSelectedListing] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    const loadData = async () => {
      // Check for cached data
      const hasCachedData = 
        sessionStorage.getItem('retex_cache_listings') ||
        sessionStorage.getItem('retex_cache_users');
      
      if (!hasCachedData) {
        setLoading(true);
      }

      try {
        await Promise.all([
          fetchListings(),
          fetchUsers()
        ]);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchListings, fetchUsers]);

  // Helper to get factory name
  const getFactoryName = (factoryId) => {
      const factory = users.find(u => u.id === factoryId);
      return factory ? factory.name : 'Unknown Factory';
  };

  const filteredListings = listings.filter(l => {
      const matchSearch = (l.fabricType?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                          (l.shopName?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      const matchStatus = filterStatus === 'All' || l.status === filterStatus;
      return matchSearch && matchStatus;
  });

  const handleDelete = async (id) => {
      if (window.confirm("Are you sure you want to delete this listing? This action cannot be undone. \n\nNote: If this listing has associated transactions, it may not be deletable for audit purposes.")) {
          try {
              await deleteListing(id);
              alert("Listing deleted successfully");
              setSelectedListing(null); // Clear selected if it was this one
          } catch (error) {
              console.error("Failed to delete", error);
              if (error.message?.includes('foreign key')) {
                  alert("Cannot delete this listing because it has associated transaction history. Try marking it as 'Sold' instead.");
              } else {
                  alert("Failed to delete listing: " + (error.message || "Unknown error"));
              }
          }
      }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
       {/* Header */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Manage Listings</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Oversee all marketplace inventory and factory uploads.</p>
          </div>
       </div>

       {/* Controls */}
       <div className="flex flex-col md:flex-row gap-4 justify-between bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 backdrop-blur-sm shadow-sm">
           <div className="flex gap-4">
               <div className="relative">
                 <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="appearance-none bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 pl-10 pr-8 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 focus:border-emerald-500 outline-none"
                 >
                    <option value="All">All Status</option>
                    <option value="Live">Live</option>
                    <option value="Sold">Sold</option>
                    <option value="Pending">Pending</option>
                 </select>
                 <Filter className="absolute left-3 top-3 text-slate-500 w-4 h-4 pointer-events-none" />
               </div>
           </div>

           <div className="relative w-full md:w-64">
                <input 
                  type="text" 
                  placeholder="Search fabric or factory..."
                  className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-3 text-slate-500 w-4 h-4" />
           </div>
       </div>

       {/* Table */}
       <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 uppercase text-xs font-semibold tracking-wider border-b border-slate-200 dark:border-slate-700">
                   <tr>
                      <th className="px-6 py-4">Item Details</th>
                      <th className="px-6 py-4">Factory / Shop</th>
                      <th className="px-6 py-4">Price / Qty</th>
                      <th className="px-6 py-4">Location</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                   {filteredListings.length > 0 ? (
                       filteredListings.map(item => (
                           <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                               <td className="px-6 py-4">
                                   <div className="flex items-center gap-4">
                                       <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-700 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-600">
                                           {item.imageUrl ? (
                                               <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                                           ) : (
                                               <div className="flex items-center justify-center h-full text-slate-400"><ShoppingBag size={20} /></div>
                                           )}
                                       </div>
                                       <div>
                                           <div className="font-bold text-slate-900 dark:text-white">{item.fabricType}</div>
                                           <div className="text-xs text-slate-500">{item.fabricCategory || 'Uncategorized'}</div>
                                       </div>
                                   </div>
                               </td>
                               <td className="px-6 py-4">
                                   <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                       {item.shopName || getFactoryName(item.factoryId)}
                                   </div>
                                   <div className="text-xs text-slate-500">ID: {item.factoryId?.slice(0,8)}...</div>
                               </td>
                               <td className="px-6 py-4">
                                   <div className="font-semibold text-emerald-600 dark:text-emerald-400">₹{item.price}<span className="text-xs text-slate-400 font-normal">/kg</span></div>
                                   <div className="text-xs text-slate-500">{item.quantity} kg avail</div>
                               </td>
                               <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                                   <div className="flex items-center gap-1">
                                       <MapPin size={12} className="text-slate-400" />
                                       <span className="truncate max-w-[150px]">{item.location}</span>
                                   </div>
                               </td>
                               <td className="px-6 py-4">
                                   <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                                       item.status === 'Live' ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' :
                                       item.status === 'Sold' ? 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-300' :
                                       'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400'
                                   }`}>
                                       {item.status}
                                   </span>
                               </td>
                               <td className="px-6 py-4 text-right">
                                   <button 
                                      onClick={() => handleDelete(item.id)}
                                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                      title="Delete Listing"
                                   >
                                      <Trash2 size={18} />
                                   </button>
                               </td>
                           </tr>
                       ))
                   ) : (
                       <tr>
                           <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                               <div className="flex flex-col items-center gap-2">
                                   <Package size={40} className="text-slate-300" />
                                   <p>No listings found.</p>
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
