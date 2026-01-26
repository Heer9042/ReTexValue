import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Check, X, ShieldAlert, User, MapPin, Edit2, Trash2, Save } from 'lucide-react';

export default function PendingApprovals() {
  const { listings, updateListingStatus, updateListing, deleteListing } = useApp();
  const pendingListings = listings.filter(l => l.status === 'Pending');

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const handleEdit = (listing) => {
      setEditingId(listing.id);
      setEditForm({
          fabricType: listing.fabricType,
          quantity: listing.quantity,
          price: listing.price,
          location: listing.location,
          description: listing.description
      });
  };

  const handleChange = (e) => {
      setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSave = async (id) => {
      await updateListing(id, editForm);
      setEditingId(null);
  };

  const handleCancel = () => {
      setEditingId(null);
      setEditForm({});
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Pending Approvals</h1>
        <div className="bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-4 py-2 rounded-lg text-sm font-medium border border-amber-200 dark:border-amber-700/50 flex items-center gap-2">
           <ShieldAlert size={16} /> {pendingListings.length} items requiring review
        </div>
      </div>

      <div className="space-y-4">
         {pendingListings.map(l => (
            <div key={l.id} className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 p-6 rounded-xl flex flex-col md:flex-row gap-6 items-start md:items-center justify-between shadow-sm dark:shadow-none animate-in fade-in slide-in-from-bottom-2 group">
               <div className="flex flex-col md:flex-row gap-6 w-full">
                  <div className="relative">
                      <img src={l.imageUrl} alt="Waste" className="w-full md:w-32 h-48 md:h-32 rounded-lg object-cover bg-slate-100 dark:bg-slate-700 shrink-0" />
                      {!editingId && (
                           <button onClick={() => deleteListing(l.id)} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity" title="Delete Listing">
                               <Trash2 size={14} />
                           </button>
                      )}
                  </div>
                  
                  <div className="flex-1 space-y-3 w-full">
                     {editingId === l.id ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-emerald-500/30">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Fabric Type</label>
                                <input name="fabricType" value={editForm.fabricType} onChange={handleChange} className="w-full bg-white dark:bg-slate-800 border rounded px-2 py-1 text-sm outline-none focus:border-emerald-500" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Price / kg</label>
                                <input name="price" type="number" value={editForm.price} onChange={handleChange} className="w-full bg-white dark:bg-slate-800 border rounded px-2 py-1 text-sm outline-none focus:border-emerald-500" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Quantity (kg)</label>
                                <input name="quantity" type="number" value={editForm.quantity} onChange={handleChange} className="w-full bg-white dark:bg-slate-800 border rounded px-2 py-1 text-sm outline-none focus:border-emerald-500" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Location</label>
                                <input name="location" value={editForm.location} onChange={handleChange} className="w-full bg-white dark:bg-slate-800 border rounded px-2 py-1 text-sm outline-none focus:border-emerald-500" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
                                <textarea name="description" value={editForm.description} onChange={handleChange} className="w-full bg-white dark:bg-slate-800 border rounded px-2 py-1 text-sm outline-none focus:border-emerald-500" rows="2" />
                            </div>
                            <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                                <button onClick={handleCancel} className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 rounded text-sm font-medium">Cancel</button>
                                <button onClick={() => handleSave(l.id)} className="px-3 py-1.5 bg-emerald-600 text-white rounded text-sm font-medium flex items-center gap-1"><Save size={14}/> Save Changes</button>
                            </div>
                        </div>
                     ) : (
                         <>
                             <div className="flex justify-between items-start">
                                <div>
                                   <div className="flex items-center gap-3">
                                       <h3 className="text-slate-900 dark:text-white font-bold text-xl">{l.fabricType}</h3>
                                       <button onClick={() => handleEdit(l)} className="text-slate-400 hover:text-blue-500 transition-colors"><Edit2 size={16} /></button>
                                   </div>
                                   <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-slate-400 mt-2">
                                      <span className="flex items-center gap-1"><User size={14} /> {l.shopName || l.factoryId}</span>
                                      <span className="flex items-center gap-1"><MapPin size={14} /> {l.location}</span>
                                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">₹{l.price}/kg</span>
                                   </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className="text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-400/10 px-3 py-1 rounded-full text-xs border border-amber-200 dark:border-amber-400/20 font-medium whitespace-nowrap">
                                        AI Score: {l.aiConfidence}%
                                    </span>
                                </div>
                             </div>
                             
                             <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-sm text-slate-500 dark:text-slate-400 grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div><span className="text-slate-400 dark:text-slate-500 block text-xs uppercase tracking-wider mb-1">Quantity</span> {l.quantity} kg</div>
                                <div><span className="text-slate-400 dark:text-slate-500 block text-xs uppercase tracking-wider mb-1">Contact</span> {l.email || 'N/A'}</div>
                                <div className="col-span-2"><span className="text-slate-400 dark:text-slate-500 block text-xs uppercase tracking-wider mb-1">Description</span> {l.description || 'No description provided.'}</div>
                             </div>
                         </>
                     )}
                  </div>
               </div>
               
               {!editingId && (
                   <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto border-t md:border-t-0 border-slate-200 dark:border-slate-700/50 pt-4 md:pt-0">
                      <button 
                         onClick={() => updateListingStatus(l.id, 'Live')}
                         className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-500/20 font-medium"
                      >
                         <Check size={18} /> Approve
                      </button>
                      <button 
                         onClick={() => updateListingStatus(l.id, 'Rejected')}
                         className="flex-1 md:flex-none bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 border border-slate-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-800 px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all font-medium"
                      >
                         <X size={18} /> Reject
                      </button>
                      <button 
                         onClick={() => deleteListing(l.id)}
                         className="md:hidden flex-1 bg-red-100 text-red-600 px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium"
                      >
                         <Trash2 size={18} /> Delete
                      </button>
                   </div>
               )}
            </div>
         ))}
         {pendingListings.length === 0 && (
            <div className="p-12 text-center bg-white dark:bg-slate-800/30 rounded-xl text-slate-500 border border-dashed border-slate-300 dark:border-slate-700">
               <ShieldAlert className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
               <p className="text-lg font-medium text-slate-900 dark:text-white">All caught up!</p>
               <p className="text-slate-500">No pending listings to review at the moment.</p>
            </div>
         )}
      </div>
    </div>
  );
}
