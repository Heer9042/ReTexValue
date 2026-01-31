import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Trash2, Edit, Search, Filter, SlidersHorizontal, ArrowUpDown, Package, Trash, AlertCircle, Plus, X, Upload, Save, Loader, Image as ImageIcon } from 'lucide-react';
import blendedImg from '../../assets/blended_fabric.png';

export default function Inventory() {
  const { listings, deleteListing, addListing, updateListing, user, uploadFile } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Newest');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [isLoading, setIsLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
      fabricType: '',
      quantity: '',
      price: '',
      description: '',
      location: '',
      imageUrl: ''
  });

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
     if (window.confirm("Are you sure you want to delete this listing permanently?")) {
         try {
             await deleteListing(id);
         } catch (error) {
             console.error("Delete failed:", error);
             alert("Failed to delete item. It may be linked to transaction history.");
         }
     }
  };

  const handleOpenAdd = () => {
      setModalMode('add');
      setFormData({
          fabricType: '',
          quantity: '',
          price: '',
          description: '',
          location: user?.location || '',
          imageUrl: ''
      });
      setIsModalOpen(true);
  };

  const handleOpenEdit = (listing) => {
      setModalMode('edit');
      setEditId(listing.id);
      setFormData({
          fabricType: listing.fabricType,
          quantity: listing.quantity,
          price: listing.price,
          description: listing.description || '',
          location: listing.location,
          imageUrl: listing.imageUrl || blendedImg
      });
      setIsModalOpen(true);
  };

  const handleImageUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
          setIsLoading(true);
          const url = await uploadFile(file, 'products');
          setFormData(prev => ({ ...prev, imageUrl: url }));
      } catch (error) {
          alert('Upload failed: ' + error.message);
      } finally {
          setIsLoading(false);
      }
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      setIsLoading(true);
      
      try {
          if (modalMode === 'add') {
              await addListing({
                  ...formData,
                  shopName: user?.company_name || user?.name,
                  email: user?.email,
                  aiConfidence: 0.95 // Mock confidence for now
              });
          } else {
              await updateListing(editId, formData);
          }
          setIsModalOpen(false);
      } catch (error) {
          console.error(error);
          alert('Operation failed. Please try again.');
      } finally {
          setIsLoading(false);
      }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Inventory Management</h1>
           <p className="text-slate-500 dark:text-slate-400 mt-1">Track and manage your textile waste listings.</p>
        </div>
        <button 
           onClick={handleOpenAdd}
           className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-emerald-500 text-white rounded-2xl font-bold text-sm shadow-xl shadow-slate-200 dark:shadow-emerald-500/20 hover:scale-105 transition-all"
        >
           <Plus size={20} />
           Add New Item
        </button>
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
                       <div className="w-16 h-16 rounded-2xl border border-slate-100 dark:border-slate-600 overflow-hidden shadow-sm group-hover:scale-110 transition-transform bg-white dark:bg-slate-800">
                          <img 
                            src={listing.imageUrl || blendedImg} 
                            onError={(e) => { e.target.onerror = null; e.target.src = blendedImg; }}
                            alt={listing.fabricType} 
                            className="w-full h-full object-cover" 
                          />
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
                          <button 
                             onClick={() => handleOpenEdit(listing)}
                             className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-600 dark:text-slate-300 transition-all transform active:scale-95"
                          >
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

      {/* Modern Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            {modalMode === 'add' ? 'Add New Listing' : 'Edit Listing'}
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {modalMode === 'add' ? 'Publish new waste inventory to the marketplace.' : 'Update asset details and pricing.'}
                        </p>
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(false)}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                    >
                        <X size={16} className="text-slate-600 dark:text-slate-300" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Image Upload */}
                        <div className="md:col-span-2 flex flex-col items-center gap-4">
                            <div className="relative w-32 h-32 group">
                                <div className="w-full h-full rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-900/50 shadow-inner">
                                    {formData.imageUrl ? (
                                        <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <ImageIcon className="text-slate-400 w-8 h-8" />
                                    )}
                                </div>
                                {isLoading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl z-10">
                                        <Loader className="animate-spin text-white w-8 h-8" />
                                    </div>
                                )}
                            </div>
                            
                            <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold uppercase tracking-wider transition-all active:scale-95 border border-slate-200 dark:border-slate-600">
                                <Upload size={16} />
                                {formData.imageUrl ? 'Change Image' : 'Upload Image'}
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*" 
                                    onChange={handleImageUpload} 
                                    disabled={isLoading} 
                                />
                            </label>
                            <p className="text-[10px] text-slate-400 font-medium">Supports JPG, PNG (Max 5MB)</p>
                        </div>

                        <div className="space-y-2">
                             <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Fabric Type</label>
                             <input 
                                required
                                type="text" 
                                placeholder="e.g. 100% Cotton Scraps"
                                value={formData.fabricType}
                                onChange={e => setFormData({...formData, fabricType: e.target.value})}
                                className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none font-medium"
                             />
                        </div>

                        <div className="space-y-2">
                             <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Quantity (kg)</label>
                             <input 
                                required
                                type="number" 
                                placeholder="e.g. 500"
                                value={formData.quantity}
                                onChange={e => setFormData({...formData, quantity: e.target.value})}
                                className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none font-medium"
                             />
                        </div>

                        <div className="space-y-2">
                             <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Price (₹/kg)</label>
                             <input 
                                required
                                type="number" 
                                placeholder="e.g. 45"
                                value={formData.price}
                                onChange={e => setFormData({...formData, price: e.target.value})}
                                className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none font-medium"
                             />
                        </div>

                        <div className="space-y-2">
                             <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Location</label>
                             <input 
                                required
                                type="text" 
                                placeholder="e.g. Surat, Gujarat"
                                value={formData.location}
                                onChange={e => setFormData({...formData, location: e.target.value})}
                                className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none font-medium"
                             />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                             <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Description</label>
                             <textarea 
                                rows="3"
                                placeholder="Describe the condition, color, and source..."
                                value={formData.description}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                                className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none font-medium resize-none"
                             />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-700">
                        <button 
                           type="button"
                           onClick={() => setIsModalOpen(false)}
                           className="px-6 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                        >
                           Cancel
                        </button>
                        <button 
                           type="submit"
                           disabled={isLoading}
                           className="px-6 py-2.5 bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center gap-2"
                        >
                           {isLoading ? <Loader className="animate-spin text-white" size={16} /> : <Save size={16} />}
                           {modalMode === 'add' ? 'Publish Listing' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
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
