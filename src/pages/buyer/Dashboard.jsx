import React from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, TrendingUp, AlertCircle, Clock, ArrowRight, Package, CheckCircle, Zap, ShieldCheck, Heart } from 'lucide-react';
import Avatar from '../../components/Avatar';
import TenderTracker from '../../components/TenderTracker';
import cottonImg from '../../assets/cotton_fabric.png';
import polyesterImg from '../../assets/polyester_fabric.png';
import blendedImg from '../../assets/blended_fabric.png';

export default function BuyerDashboard() {
  const { user, transactions, proposals, listings, bulkRequests } = useApp();
  const navigate = useNavigate();

  // Data Calculations for current authenticated buyer
  const myOrders = transactions.filter(t => t.buyerId === user?.id);
  const activeProposals = proposals.filter(p => p.buyerId === user?.id && (p.status === 'Pending' || p.status === 'Negotiating'));
  const totalSpent = myOrders.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  
  // Get recent available listings
  const recentListings = listings.filter(l => l.status === 'Live').slice(0, 3);

   return (
    <div className="max-w-7xl mx-auto space-y-10 pb-10">
      {/* Premium Hero Greeting */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
         <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-3xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl group cursor-pointer active:scale-95 transition-all" onClick={() => navigate('/buyer/profile')}>
               <Avatar 
                  src={user?.avatar_url}
                  name={user?.full_name || user?.name || 'User'}
                  alt="Profile"
                  debug={true}
               />
            </div>
            <div>
               <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  Sourcing <span className="text-blue-600">Hub</span>
               </h1>
               <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium italic">Welcome back, {user?.full_name || user?.name || 'Visionary'}. Circular supply chain active.</p>
            </div>
         </div>
         <div className="flex gap-4">
            <button onClick={() => navigate('/buyer/marketplace')} className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl active:scale-95">
               Explore Stock
            </button>
            <button onClick={() => navigate('/buyer/bulk-request')} className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-blue-500/20 active:scale-95">
               Tender Request
            </button>
         </div>
      </div>

      {/* Tender Status Protocol - New Section */}
      <TenderTracker requests={bulkRequests.filter(r => r.buyerId === user?.id)} />

      {/* Modern Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <MetricCard 
            title="Procurement Orders" 
            value={myOrders.filter(o => o.status !== 'Completed').length} 
            icon={<Zap className="text-amber-500" />} 
            bg="bg-amber-50 dark:bg-amber-500/10"
            footer="Active lifecycle items"
         />
         <MetricCard 
            title="Open Negotiations" 
            value={activeProposals.length} 
            icon={<ShieldCheck className="text-blue-500" />} 
            bg="bg-blue-50 dark:bg-blue-500/10"
            footer="Pending factory response"
         />
         <MetricCard 
            title="Capital Deployed" 
            value={`₹${totalSpent.toLocaleString()}`} 
            icon={<TrendingUp className="text-emerald-500" />} 
            bg="bg-emerald-50 dark:bg-emerald-500/10"
            footer="Gross acquisition value"
         />
         <MetricCard 
            title="Circular Impact" 
            value={`${(totalSpent / 50).toFixed(0)} kg`} 
            icon={<Heart className="text-rose-500" />} 
            bg="bg-rose-50 dark:bg-rose-500/10"
            footer="Estimated waste diverted"
         />
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
         {/* Left: Global Supply Feed */}
         <div className="lg:col-span-2 space-y-8">
            <div className="flex justify-between items-center px-4">
               <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Acquisition History</h2>
               <Link to="/buyer/orders" className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:underline">See Ledger</Link>
            </div>
            
            <div className="bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none">
               {myOrders.length > 0 ? (
                  <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
                     {myOrders.slice(0, 5).map(order => (
                        <div key={order.id} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors group">
                           <div className="flex items-center gap-5">
                              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                                 <Package size={24} />
                              </div>
                              <div>
                                 <p className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-tight">Order #{order.id.slice(0, 8)}</p>
                                 <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(order.date).toLocaleDateString()}</p>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className="font-black text-slate-900 dark:text-white text-sm">₹{order.amount.toLocaleString()}</p>
                              <div className="flex justify-end mt-1">
                                 <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${
                                    order.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 
                                    'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'
                                 }`}>
                                    {order.status}
                                 </span>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               ) : (
                  <div className="p-20 text-center flex flex-col items-center gap-4 opacity-20">
                     <ShoppingBag size={64} className="text-slate-400" />
                     <p className="text-sm font-black uppercase tracking-widest">No Acquisitions Recorded</p>
                  </div>
               )}
            </div>
         </div>

         {/* Right: Market Curations */}
         <div className="space-y-8">
            <div className="flex justify-between items-center px-4">
               <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Market Intake</h2>
               <button onClick={() => navigate('/buyer/marketplace')} className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:underline transition-all">Inspect All</button>
            </div>

            <div className="space-y-4">
               {recentListings.map(listing => (
                  <div key={listing.id} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 flex gap-4 hover:shadow-2xl transition-all group cursor-pointer active:scale-95" onClick={() => navigate('/buyer/marketplace')}>
                     <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-sm group-hover:scale-105 transition-transform shrink-0">
                        <img 
                           src={listing.imageUrl || blendedImg} 
                           onError={(e) => { 
                               e.target.onerror = null; 
                               const type = (listing.fabricType || '').toLowerCase();
                               if(type.includes('cotton')) e.target.src = cottonImg;
                               else if(type.includes('poly')) e.target.src = polyesterImg;
                               else e.target.src = blendedImg;
                           }}
                           alt={listing.fabricType} 
                           className="w-full h-full object-cover" 
                        />
                     </div>
                     <div className="flex-1 flex flex-col justify-center">
                        <h4 className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-tight group-hover:text-blue-600 transition-colors leading-tight">{listing.fabricType}</h4>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">{listing.quantity} kg • {listing.location.split(',')[0]}</p>
                        <p className="text-emerald-600 dark:text-emerald-400 font-black text-xs mt-2 uppercase tracking-tighter">₹{listing.price}/kg</p>
                     </div>
                  </div>
               ))}
               
               <div className="bg-linear-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-blue-500/20 group cursor-pointer" onClick={() => navigate('/buyer/bulk-request')}>
                  <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-125 transition-transform duration-700">
                     <Zap size={140} />
                  </div>
                  <div className="relative z-10">
                     <p className="font-black text-lg mb-2 leading-tight">Can't find the exact specification?</p>
                     <p className="text-[10px] font-bold text-blue-100 uppercase tracking-widest mb-6">Deploy a global sourcing tender</p>
                     <button className="px-6 py-3 bg-white text-blue-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-blue-50">
                        Request Bulk
                     </button>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, bg, footer }) {
   return (
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 p-8 rounded-4xl shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col gap-6 transition-all group hover:border-blue-500/30">
         <div className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm border border-transparent group-hover:border-inherit`}>
            {React.cloneElement(icon, { size: 28 })}
         </div>
         <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{title}</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{value}</h3>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mt-2 opacity-60 italic">{footer}</p>
         </div>
      </div>
   );
}
