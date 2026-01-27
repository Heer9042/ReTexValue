import React from 'react';
import { useApp } from '../../context/AppContext';
import { BarChart, BadgeDollarSign, TrendingUp, Calendar, PieChart, ShoppingBag, Leaf, Activity, Zap, Compass, ShieldCheck } from 'lucide-react';

export default function Analytics() {
  const { transactions, user, listings } = useApp();

  // Optimized Metrics Integration
  const totalSpentVal = transactions.filter(t => t.buyerId === user?.id).reduce((acc, t) => acc + (t.amount || 0), 0);
  const totalSpent = `₹${totalSpentVal.toLocaleString()}`;
  const ordersPlaced = transactions.filter(t => t.buyerId === user?.id).length;
  const co2Saved = `${(totalSpentVal / 100).toFixed(0)} kg`;
  const recycledMaterialUsed = `${(totalSpentVal / 30).toFixed(0)} kg`;

  // Calculate dynamic spending trend (last 6 months)
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const buyerTransactions = transactions.filter(t => t.buyerId === user?.id);
  
  const spendingTrend = [];
  for (let i = 5; i >= 0; i--) {
    let m = currentMonth - i;
    let y = currentYear;
    if (m < 0) {
      m += 12;
      y -= 1;
    }
    const monthAmount = buyerTransactions
      .filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === m && d.getFullYear() === y;
      })
      .reduce((acc, t) => acc + (t.amount || 0), 0);
    
    spendingTrend.push({ month: months[m], amount: monthAmount });
  }

  const maxSpending = Math.max(...spendingTrend.map(d => d.amount), 1000); // Avoid division by zero

  // Calculate dynamic material distribution
  const boughtListingIds = buyerTransactions.map(t => t.listingId);
  const boughtListings = listings.filter(l => boughtListingIds.includes(l.id));
  
  const materialDist = boughtListings.reduce((acc, l) => {
    const cat = l.fabricCategory || l.fabricType || 'Other';
    acc[cat] = (acc[cat] || 0) + (l.quantity || 0);
    return acc;
  }, {});

  const totalQuantity = Object.values(materialDist).reduce((sum, q) => sum + q, 0);
  const distributionData = Object.entries(materialDist).map(([label, quantity]) => ({
    label,
    percentage: totalQuantity > 0 ? `${Math.round((quantity / totalQuantity) * 100)}%` : '0%',
    color: label.includes('Cotton') ? 'bg-emerald-500' : 
           label.includes('Polyester') ? 'bg-blue-500' :
           label.includes('Silk') ? 'bg-purple-500' : 'bg-slate-400'
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-16 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Procurement <span className="text-blue-600">Intelligence</span></h1>
           <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium italic">Strategic acquisition and environmental impact audit.</p>
        </div>
        <div className="bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 flex gap-1 shadow-inner">
           <button className="px-6 py-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-xl transition-all">6 Months</button>
           <button className="px-6 py-2.5 text-slate-400 hover:text-slate-900 dark:hover:text-white text-[10px] font-black uppercase tracking-widest transition-all">Annual Overview</button>
        </div>
      </div>

      {/* Hero Metrics Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <MetricCard 
           title="Capital Deployed" 
           value={totalSpent} 
           change="+8.5%" 
           isPositive={false}
           icon={<BadgeDollarSign />}
           color="text-blue-500"
           bg="bg-blue-50 dark:bg-blue-500/10"
        />
        <MetricCard 
           title="Acquisition Load" 
           value={ordersPlaced} 
           change="+2" 
           isPositive={true}
           icon={<ShoppingBag />}
           color="text-amber-500"
           bg="bg-amber-50 dark:bg-amber-500/10"
        />
        <MetricCard 
           title="GHG Abatement" 
           value={co2Saved} 
           change="+120 kg" 
           isPositive={true}
           icon={<Leaf />}
           color="text-emerald-500"
           bg="bg-emerald-50 dark:bg-emerald-500/10"
        />
        <MetricCard 
           title="Material Recycled" 
           value={recycledMaterialUsed} 
           change="+15%" 
           isPositive={true}
           icon={<Activity />}
           color="text-purple-500"
           bg="bg-purple-50 dark:bg-purple-500/10"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
         {/* Spending Signal Chart */}
         <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-10 rounded-[3rem] shadow-2xl shadow-slate-200/50 dark:shadow-none flex flex-col group">
            <div className="flex justify-between items-center mb-12">
               <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-3">
                     <Zap className="text-blue-600" /> Sourcing Expenditure Matrix
                  </h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 px-1">Monthly industrial acquisition volume</p>
               </div>
               <button className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-blue-600 transition-colors">
                  <Compass size={20} />
               </button>
            </div>
            
            <div className="flex-1 flex items-end justify-between gap-6 px-4 pb-4 h-64">
               {spendingTrend.map((data, index) => {
                  const heightPercent = (data.amount / maxSpending) * 100;
                  return (
                     <div key={index} className="w-full h-full flex flex-col justify-end items-center group">
                        <div className="w-full relative h-full flex flex-col justify-end">
                           <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100 bg-slate-900 dark:bg-white text-white dark:text-black text-[10px] font-black py-2 px-4 rounded-xl whitespace-nowrap z-10 shadow-2xl">
                              ₹{data.amount.toLocaleString()}
                           </div>
                           
                           <div 
                              style={{ height: `${heightPercent}%` }} 
                              className="w-full bg-linear-to-t from-blue-600/10 to-blue-600 dark:from-blue-600/20 dark:to-blue-500 rounded-2xl group-hover:to-emerald-500 transition-all duration-700 relative shadow-xl shadow-transparent group-hover:shadow-blue-500/20"
                           >
                              <div className="absolute top-0 w-full h-[4px] bg-white/20 dark:bg-blue-300/30 rounded-full blur-[1px]"></div>
                           </div>
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase mt-4 tracking-widest group-hover:text-blue-600 transition-colors">{data.month}</span>
                     </div>
                  );
               })}
            </div>
         </div>

         {/* Circular Composition */}
         <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-10 rounded-[3rem] shadow-2xl shadow-slate-200/50 dark:shadow-none flex flex-col hover:border-blue-500/20 transition-all">
             <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-10">Material Stream</h3>
             
             <div className="flex-1 flex flex-col items-center justify-center">
                <div className="relative w-56 h-56 mb-12">
                   <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 drop-shadow-2xl">
                      <circle cx="50" cy="50" r="42" fill="transparent" stroke="currentColor" className="text-slate-50 dark:text-slate-800" strokeWidth="10" /> 
                      <circle cx="50" cy="50" r="42" fill="transparent" stroke="#10b981" strokeWidth="12" strokeDasharray="100 264" strokeLinecap="round" className="animate-pulse shadow-2xl" />
                      <circle cx="50" cy="50" r="42" fill="transparent" stroke="#3b82f6" strokeWidth="12" strokeDasharray="75 264" strokeDashoffset="-105" strokeLinecap="round" />
                      <circle cx="50" cy="50" r="42" fill="transparent" stroke="#a855f7" strokeWidth="12" strokeDasharray="50 264" strokeDashoffset="-185" strokeLinecap="round" />
                   </svg>
                   <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <ShieldCheck size={32} className="text-blue-600 mb-2" />
                      <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">100%</span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Verified</span>
                   </div>
                </div>

                <div className="w-full space-y-3">
                   {distributionData.length > 0 ? distributionData.map((item, idx) => (
                      <DistributionRow key={idx} label={item.label} percentage={item.percentage} color={item.color} />
                   )) : (
                      <p className="text-[10px] text-slate-400 text-center font-bold uppercase tracking-widest mt-4">No Material Data Available</p>
                   )}
                </div>
             </div>
         </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, change, isPositive, icon, color, bg }) {
   return (
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-none flex flex-col gap-6 group hover:border-blue-500/30 transition-all hover:-translate-y-2">
         <div className="flex justify-between items-start">
            <div className={`w-14 h-14 rounded-2xl ${bg} ${color} flex items-center justify-center shadow-lg border border-transparent group-hover:border-inherit transition-all`}>
               {React.cloneElement(icon, { size: 28 })}
            </div>
            <div className={`text-[10px] font-black px-3 py-1.5 rounded-xl border ${isPositive ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-slate-50 text-slate-400 border-slate-100 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700'}`}>
               {change}
            </div>
         </div>
         <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{title}</p>
            <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{value}</h3>
         </div>
      </div>
   );
}

function DistributionRow({ label, percentage, color }) {
   return (
      <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all group">
         <div className="flex items-center gap-4">
            <span className={`w-3 h-3 rounded-full ${color} shadow-lg shadow-inherit group-hover:scale-125 transition-transform`}></span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{label}</span>
         </div>
         <span className="text-sm font-black text-slate-900 dark:text-white">{percentage}</span>
      </div>
   );
}
