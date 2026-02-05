import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { DollarSign, Scale, Leaf, ArrowRight, Activity, Plus, Package, TrendingUp, BarChart3, Recycle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import blendedImg from '../../assets/blended_fabric.png';
import cottonImg from '../../assets/cotton_fabric.png';
import polyesterImg from '../../assets/polyester_fabric.png';

export default function FactoryDashboard() {
  const { user, listings, getStats, bulkRequests, transactions, fetchListings, fetchBulkRequests, fetchTransactions } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      // Check if we have cached data - if yes, don't show loader
      const hasData = (listings && listings.length > 0) || (transactions && transactions.length > 0);
      if (!hasData) setLoading(true);
      
      try {
        await Promise.all([
          fetchListings(),
          fetchBulkRequests(),
          fetchTransactions()
        ]);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchListings, fetchBulkRequests, fetchTransactions]);

  // Show loader only if we're fetching AND we have no data
  if (loading && (!listings || listings.length === 0) && (!transactions || transactions.length === 0)) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = getStats();

  // Filter listings for the current authenticated factory
  const myListings = listings.filter(l => l.factoryId === user?.id);
  
  // Calculate factory-specific stats
  const factoryTransactions = transactions.filter(t => t.sellerId === user?.id);
  const factoryRevenue = factoryTransactions.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const factoryWasteSold = listings
    .filter(l => l.factoryId === user?.id && l.status === 'Sold')
    .reduce((acc, curr) => acc + Number(curr.quantity || 0), 0);
  const factoryCO2 = factoryWasteSold * 15; // 15kg CO2 per kg of textile waste

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
         <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Factory Overview</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your inventory, sustainability impact, and sales.</p>
         </div>
         <div className="flex gap-3">
             <Link to="/factory/analytics" className="px-5 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
               <Activity size={18} /> View Analytics
             </Link>
             <Link to="/factory/upload" className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2">
               <Plus size={18} /> New Listing
             </Link>
         </div>
      </div>

      {/* Dynamic Impact Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
           title="Gross Revenue" 
           value={`₹${factoryRevenue.toLocaleString()}`} 
           icon={<DollarSign size={24} />} 
           color="emerald"
           subtitle="Total generated income"
        />
        <StatCard 
           title="Material Diverted" 
           value={`${factoryWasteSold} kg`} 
           icon={<Recycle size={24} />} 
           color="blue"
           subtitle="Waste sent to recycling"
        />
        <StatCard 
           title="Active Inventory" 
           value={myListings.length} 
           icon={<Package size={24} />} 
           color="purple"
           subtitle="Live market listings"
        />
        <StatCard 
           title="Carbon Offset" 
           value={`${factoryCO2.toLocaleString()} kg`} 
           icon={<Leaf size={24} />} 
           color="lime"
           subtitle="CO₂ emissions prevented"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Col: Main Activity & Listings */}
        <div className="lg:col-span-2 space-y-8">
           
           {/* Recent Listings Table */}
           <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                 <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Inventory</h2>
                 <Link to="/factory/inventory" className="text-emerald-600 dark:text-emerald-400 text-sm font-semibold hover:underline flex items-center gap-1">
                    View All <ArrowRight size={16} />
                 </Link>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 uppercase text-xs font-semibold tracking-wider">
                       <tr>
                          <th className="px-6 py-4">Fabric</th>
                          <th className="px-6 py-4">Qty (kg)</th>
                          <th className="px-6 py-4">Price/kg</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4">Score</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                       {myListings.slice(0, 5).map((listing) => (
                          <tr key={listing.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                             <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                   <img 
                                      src={listing.imageUrl || blendedImg} 
                                      onError={(e) => { 
                                         e.target.onerror = null; 
                                         const type = (listing.fabricType || '').toLowerCase();
                                         if(type.includes('cotton')) e.target.src = cottonImg;
                                         else if(type.includes('poly')) e.target.src = polyesterImg;
                                         else e.target.src = blendedImg;
                                      }}
                                      alt="" 
                                      className="w-10 h-10 rounded-lg object-cover bg-slate-100" 
                                   />
                                   <span className="font-medium text-slate-900 dark:text-white">{listing.fabricType}</span>
                                </div>
                             </td>
                             <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{listing.quantity}</td>
                             <td className="px-6 py-4 text-slate-600 dark:text-slate-300">₹{listing.price}</td>
                             <td className="px-6 py-4"><StatusBadge status={listing.status} /></td>
                             <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                   <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                      <div className={`h-full rounded-full ${listing.aiConfidence > 80 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${listing.aiConfidence}%` }} />
                                   </div>
                                   <span className="text-xs font-medium text-slate-500">{listing.aiConfidence}%</span>
                                </div>
                             </td>
                          </tr>
                       ))}
                       {myListings.length === 0 && (
                          <tr>
                             <td colSpan="5" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                <Package className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600 opacity-50" />
                                <p>No items listed yet. Start by uploading stock.</p>
                             </td>
                          </tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>

        </div>

         {/* Opportunity Panel */}
         <div className="space-y-8">
            <div className="bg-slate-900 dark:bg-black p-8 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl border border-white/5">
               <div className="absolute -right-12 -top-12 opacity-5 scale-150 rotate-12">
                  <TrendingUp size={240} />
               </div>
               
               <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-8">
                     <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse ring-4 ring-emerald-500/20"></div>
                     <h3 className="font-black uppercase tracking-widest text-xs text-slate-400">Live Demand Sourcing</h3>
                  </div>

                  <div className="space-y-4 mb-10 overflow-hidden">
                     {bulkRequests && bulkRequests.slice(0, 3).map(req => (
                        <div key={req.id} className="p-5 bg-white/5 hover:bg-white/10 rounded-3xl border border-white/5 transition-all group cursor-pointer active:scale-95" onClick={() => navigate('/factory/proposals')}>
                           <div className="flex justify-between items-start mb-2">
                              <h4 className="font-bold text-sm text-slate-200">{req.fabricType}</h4>
                              <span className="text-[10px] font-black uppercase text-emerald-400">{req.quantity} kg</span>
                           </div>
                           <p className="text-[10px] text-slate-400 line-clamp-2 mb-4 font-medium uppercase tracking-tight">
                              {req.description || "Specific requirement for recycled circular fibers."}
                           </p>
                           <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tighter">
                              <span className="text-slate-500">Target ₹{req.targetPrice}/kg</span>
                              <div className="flex items-center gap-1 text-emerald-500 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all">
                                 Draft Bid <ArrowRight size={10} />
                              </div>
                           </div>
                        </div>
                     ))}
                     {(!bulkRequests || bulkRequests.length === 0) && (
                        <div className="p-10 text-center opacity-30">
                           <Activity size={32} className="mx-auto mb-2" />
                           <p className="text-[10px] font-black uppercase tracking-widest">Market Quiet</p>
                        </div>
                     )}
                  </div>

                  <button 
                     onClick={() => navigate('/factory/proposals')}
                     className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[1.25rem] font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                  >
                     Explore Tenders
                  </button>
               </div>
            </div>

            {/* Sustainability Insight */}
            <div className="p-8 bg-linear-to-br from-indigo-600 to-indigo-800 rounded-[2.5rem] text-white shadow-xl shadow-indigo-500/10">
               <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-white/10 rounded-2xl">
                     <Leaf size={24} className="text-lime-400" />
                  </div>
                  <div>
                     <h4 className="font-black text-sm uppercase tracking-tight">Eco Impact Pro</h4>
                  </div>
               </div>
               <p className="text-xs leading-relaxed text-indigo-100 font-medium mb-6">
                  Your recycled material has saved enough energy to power <span className="font-bold underline">1.2k homes</span> for a day.
               </p>
               <button className="text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-colors">
                  View PDF Certificate →
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, subtitle }) {
   const colors = {
      emerald: 'bg-emerald-500 shadow-emerald-500/20 text-emerald-500',
      blue: 'bg-blue-500 shadow-blue-500/20 text-blue-500',
      purple: 'bg-purple-500 shadow-purple-500/20 text-purple-500',
      lime: 'bg-lime-500 shadow-lime-500/20 text-lime-500'
   };

   return (
      <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all group">
         <div className={`w-14 h-14 rounded-2xl ${colors[color]} text-white flex items-center justify-center mb-6 shadow-2xl transition-transform group-hover:scale-110`}>
            {icon}
         </div>
         <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{title}</p>
         <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{value}</h3>
         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter opacity-60">{subtitle}</p>
      </div>
   );
}

function StatusBadge({ status }) {
   const styles = {
      Live: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20",
      Pending: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border-amber-100 dark:border-amber-500/20",
      Sold: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border-blue-100 dark:border-blue-500/20",
      Rejected: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 border-rose-100 dark:border-rose-500/20",
   };
   return (
      <span className={`px-4 py-1 rounded-lg text-[10px] font-black uppercase border ${styles[status] || styles.Pending}`}>
         {status}
      </span>
   );
}
