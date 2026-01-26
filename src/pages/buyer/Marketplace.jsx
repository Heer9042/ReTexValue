import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ShoppingCart, CheckCircle, MapPin, Phone, MessageSquare, TrendingUp, Sparkles, ArrowRight, ShieldCheck, Globe, Zap, Package } from 'lucide-react';

export default function Marketplace() {
  const { user, listings, purchaseListing, settings } = useApp();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [purchasingId, setPurchasingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const categories = ['All', ...(settings?.categories || ['Cotton', 'Polyester', 'Silk', 'Wool', 'Blended'])];

  const liveListings = listings.filter(l => l.status === 'Live');

  const filteredListings = liveListings.filter(l => {
    const matchesCategory = filter === 'All' || 
                           l.fabricType.toLowerCase().includes(filter.toLowerCase()) || 
                           (l.fabricCategory && l.fabricCategory === filter);
                           
    const matchesSearch = l.fabricType.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (l.shopName && l.shopName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          l.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleBuy = async (listing) => {
    if (!user) {
        alert("Please log in to purchase listings");
        return;
    }
    
    if (confirm(`Confirm acquisition of ${listing.quantity}kg ${listing.fabricType} for ₹${listing.price * listing.quantity}?`)) {
        setPurchasingId(listing.id);
        try {
            await purchaseListing(listing);
            alert("Acquisition Protocol Successful. Order entry created in ledger.");
            navigate('/buyer/orders');
        } catch (err) {
            console.error("Purchase failed", err);
            alert("Transaction failed. Contact support.");
        } finally {
            setPurchasingId(null);
        }
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 min-h-screen pb-10">
      {/* Hero Banner with Search */}
      <div className="relative rounded-3xl overflow-hidden bg-linear-to-r from-emerald-900 to-teal-900 shadow-2xl">
         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
         <div className="relative z-10 p-8 md:p-14 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="max-w-xl space-y-4 text-center md:text-left">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                  <Sparkles size={12} /> Premium Waste Marketplace
               </div>
               <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
                  Source High-Quality <span className="text-emerald-400">Textile Waste</span>
               </h1>
               <p className="text-emerald-100/80 text-lg">
                  Connect directly with verified factories. Sustainable sourcing made simple and transparent.
               </p>
               
               <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-lg flex flex-col sm:flex-row gap-2 max-w-md mx-auto md:mx-0">
                  <div className="relative flex-1">
                     <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                     <input 
                       type="text" 
                       placeholder="Filter by textile spec or origin..." 
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                       className="w-full bg-transparent border-none outline-none pl-12 pr-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400"
                     />
                  </div>
                  <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition-colors">
                     Search
                  </button>
               </div>
            </div>

            {/* Strategic Metrics */}
            <div className="hidden lg:grid grid-cols-2 gap-6 w-full lg:w-auto">
               <MarketStat value="842" label="Live Lots" icon={<Zap size={20}/>} />
               <MarketStat value="99.2%" label="AI Precision" icon={<ShieldCheck size={20}/>} />
               <div className="col-span-2 bg-emerald-600 p-8 rounded-[2.5rem] flex items-center justify-between gap-8 group cursor-pointer hover:bg-emerald-500 transition-all shadow-2xl shadow-emerald-500/20" onClick={() => navigate('/buyer/bulk-request')}>
                  <div>
                     <p className="font-black text-white text-xl tracking-tighter uppercase">Bulk Sourcing</p>
                     <p className="text-[10px] text-emerald-100 font-bold uppercase tracking-widest mt-1">Deploy Regional Tender</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white group-hover:translate-x-2 transition-transform">
                     <ArrowRight size={24} />
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Categories & Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 sticky top-4 z-40 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-xl p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
         <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide px-2">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  filter === c 
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md transform scale-105' 
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {c}
              </button>
            ))}
         </div>
         
         <div className="relative group">
             <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors">
                <Filter size={16} /> Filters
             </button>
         </div>
      </div>

      {/* Grid Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredListings.map(listing => (
           <div key={listing.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group flex flex-col h-full relative">
              {/* Media Aspect */}
              <div className="relative h-72 overflow-hidden">
                 <img 
                    src={listing.imageUrl} 
                    alt={listing.fabricType} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                 />
                 <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 via-transparent to-transparent"></div>
                 
                 <div className="absolute top-4 left-4">
                    <span className="bg-white/10 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border border-white/20">
                       {listing.fabricCategory || 'Industrial'}
                    </span>
                 </div>

                 <div className="absolute top-4 right-4">
                    <div className="flex flex-col items-end gap-1">
                       <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border backdrop-blur-md shadow-xl ${
                          listing.aiConfidence > 80 
                          ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30' 
                          : 'bg-amber-500/20 text-amber-200 border-amber-500/30'
                       }`}>
                          {listing.aiConfidence}% Score
                       </span>
                    </div>
                 </div>

                 <div className="absolute bottom-6 left-6 right-6 text-white">
                    <h3 className="font-black text-2xl leading-tight uppercase tracking-tighter group-hover:text-blue-400 transition-colors uppercase">{listing.fabricType}</h3>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-2">
                       <MapPin size={12} className="text-blue-400" /> {listing.location.split(',')[0]}
                    </div>
                 </div>
              </div>
              
              {/* Commercial Specs */}
              <div className="p-8 flex-1 flex flex-col">
                 <div className="flex justify-between items-end mb-8">
                    <div>
                       <p className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black mb-1">Commercial Price</p>
                       <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">₹{listing.price}<span className="text-[10px] text-slate-400 font-bold tracking-normal">/kg</span></p>
                    </div>
                    <div className="text-right">
                       <p className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black mb-1">Ready Stock</p>
                       <p className="text-xl font-black text-slate-700 dark:text-slate-300 tracking-tighter">{listing.quantity} kg</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                       <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest mb-1">Protocol</p>
                       <p className="text-xs font-black text-slate-900 dark:text-white uppercase">Grade A</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                       <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest mb-1">Lead Time</p>
                       <p className="text-xs font-black text-slate-900 dark:text-white uppercase">24-48h</p>
                    </div>
                 </div>

                 {/* Strategic Action */}
                 <div className="flex flex-col gap-3 mt-auto">
                    <button
                      onClick={() => handleBuy(listing)}
                      disabled={purchasingId === listing.id}
                      className="w-full py-5 bg-blue-600 hover:bg-black dark:hover:bg-white dark:hover:text-black text-white font-black rounded-[1.25rem] shadow-2xl shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-[10px] uppercase tracking-widest"
                    >
                      {purchasingId === listing.id ? (
                         <div className="flex items-center gap-3"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Authorizing...</div>
                      ) : (
                         <><ShoppingCart size={18} /> Initiate Acquisition</>
                      )}
                    </button>
                    <button 
                       onClick={() => navigate('/buyer/bulk-request')}
                       className="w-full py-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
                    >
                       Request Verification &rarr;
                    </button>
                 </div>
              </div>
           </div>
        ))}
        
        {filteredListings.length === 0 && (
           <div className="col-span-full py-40 text-center animate-in fade-in">
             <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-300">
               <Package size={40} />
             </div>
             <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">No Assets Found</h3>
             <p className="text-slate-500 mt-2 font-medium">Your search query did not match any active listings in the network.</p>
             <button onClick={() => {setFilter('All'); setSearchQuery('');}} className="mt-8 px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">
                Reset Network Feed
             </button>
           </div>
        )}
      </div>
    </div>
  );
}

function MarketStat({ value, label, icon }) {
   return (
      <div className="bg-white/5 backdrop-blur-3xl p-6 rounded-[2.5rem] border border-white/10 text-center flex flex-col items-center gap-2 min-w-[160px]">
         <div className="mb-2 text-blue-500">{icon}</div>
         <p className="text-4xl font-black text-white tracking-tighter">{value}</p>
         <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{label}</p>
      </div>
   );
}

