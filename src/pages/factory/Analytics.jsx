import React from 'react';
import { useApp } from '../../context/AppContext';
import { BarChart, BadgeDollarSign, TrendingUp, Calendar, ArrowUpRight, Zap, Globe, ShieldCheck, Activity } from 'lucide-react';

export default function Analytics() {
  const { transactions, user } = useApp();

  const chartData = [
    { month: 'Jan', revenue: 12000 },
    { month: 'Feb', revenue: 19000 },
    { month: 'Mar', revenue: 15000 },
    { month: 'Apr', revenue: 22000 },
    { month: 'May', revenue: 35000 },
    { month: 'Jun', revenue: 45000 },
  ];

  const maxRevenue = Math.max(...chartData.map(d => d.revenue));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Performance Analytics</h1>
        <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1 flex space-x-1">
           <button className="px-3 py-1 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm rounded-md shadow-sm">6 Months</button>
           <button className="px-3 py-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm transition-colors">1 Year</button>
           <button className="px-3 py-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm transition-colors">All Time</button>
        </div>
      </div>

      {/* High-Fidelity Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <MetricCard 
           title="Gross Revenue" 
           value="₹1,48,000" 
           change="+12.5%" 
           isPositive={true}
           icon={<BadgeDollarSign />}
           color="text-emerald-500"
           bg="bg-emerald-50 dark:bg-emerald-500/10"
        />
        <MetricCard 
           title="Yield Index" 
           value="₹42.50/kg" 
           change="+5.2%" 
           isPositive={true}
           icon={<TrendingUp />}
           color="text-blue-500"
           bg="bg-blue-50 dark:bg-blue-500/10"
        />
        <MetricCard 
           title="Throughput" 
           value="3,250 kg" 
           change="-2.1%" 
           isPositive={false}
           icon={<Activity />}
           color="text-purple-500"
           bg="bg-purple-50 dark:bg-purple-500/10"
        />
      </div>

      {/* Main Signal Area */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-10 rounded-[3rem] shadow-2xl shadow-slate-200/50 dark:shadow-none">
         <div className="flex justify-between items-center mb-12">
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-3">
               <Calendar className="text-blue-500" /> Revenue Flow Matrix
            </h2>
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
               <div className="w-3 h-3 bg-blue-500 rounded-full"></div> Gross Profit
            </div>
         </div>
         
         <div className="h-64 flex items-end justify-between gap-4">
            {chartData.map((data, index) => {
               const heightPercent = (data.revenue / maxRevenue) * 100;
               return (
                  <div key={index} className="w-full h-full flex flex-col items-center group cursor-pointer">
                     <div className="relative w-full h-full flex items-end mb-4">
                        <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100 bg-slate-900 dark:bg-white text-white dark:text-black text-[10px] font-black py-2 px-4 rounded-xl whitespace-nowrap z-10 shadow-2xl">
                           ₹{data.revenue.toLocaleString()}
                        </div>
                        <div 
                           style={{ height: `${heightPercent}%` }} 
                           className="w-full bg-linear-to-t from-blue-600/10 to-blue-500 dark:from-blue-500/20 dark:to-blue-400 rounded-2xl group-hover:to-emerald-400 transition-all duration-700 relative"
                        >
                           <div className="absolute top-0 w-full h-[6px] bg-white/20 dark:bg-blue-300/30 rounded-full blur-[2px]"></div>
                        </div>
                     </div>
                     <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{data.month}</span>
                  </div>
               );
            })}
         </div>
      </div>

      {/* Secondary Insights Matrix */}
      <div className="grid lg:grid-cols-5 gap-8">
         <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-10 rounded-[3rem] shadow-2xl shadow-slate-200/50 dark:shadow-none">
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-8">Asset Composition</h3>
            <div className="space-y-8">
               <CompositionRow name="Cotton (Pure)" percentage={45} value="₹65,000" color="bg-emerald-500" />
               <CompositionRow name="Polyester Blend" percentage={30} value="₹42,000" color="bg-blue-500" />
               <CompositionRow name="Waste Denim" percentage={15} value="₹21,000" color="bg-indigo-500" />
               <CompositionRow name="Refined Silk" percentage={10} value="₹20,000" color="bg-purple-500" />
            </div>
         </div>
         
         <div className="lg:col-span-2 bg-linear-to-br from-indigo-600 to-blue-700 p-10 rounded-[3rem] text-white overflow-hidden shadow-2xl shadow-blue-500/20 group relative cursor-pointer">
            <Globe className="absolute -right-12 -bottom-12 w-64 h-64 text-white/10 group-hover:scale-110 transition-transform duration-1000" />
            <div className="relative z-10 flex flex-col h-full">
               <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md mb-8 group-hover:scale-110 transition-transform">
                  <Zap size={28} />
               </div>
               <h3 className="text-2xl font-black tracking-tighter mb-4 leading-tight">Expansion Protocol Identified</h3>
               <p className="text-indigo-100 text-sm font-medium mb-10 leading-relaxed">
                  High-yield demand detected in the <strong>Southeast Asian</strong> corridor for your current <strong>Cotton Waste</strong> inventory. Premium valuation up to 18%.
               </p>
               <button className="mt-auto bg-white text-indigo-700 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all hover:bg-indigo-50 flex items-center justify-center gap-3">
                  Analyze Corridor <ArrowUpRight size={16} />
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, change, isPositive, icon, color, bg }) {
   return (
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-none flex flex-col gap-6 group hover:border-blue-500/30 transition-all">
         <div className="flex justify-between items-start">
            <div className={`w-14 h-14 rounded-2xl ${bg} ${color} flex items-center justify-center shadow-lg border border-transparent group-hover:border-inherit transition-all`}>
               {React.cloneElement(icon, { size: 28 })}
            </div>
            <div className={`text-[10px] font-black px-3 py-1.5 rounded-xl border ${isPositive ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'}`}>
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

function CompositionRow({ name, percentage, value, color }) {
   return (
      <div className="group">
         <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest mb-3">
            <span className="text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{name}</span>
            <span className="text-slate-900 dark:text-white">{value}</span>
         </div>
         <div className="w-full h-3 bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-100 dark:border-slate-700">
            <div className={`h-full ${color} rounded-full group-hover:brightness-110 transition-all`} style={{ width: `${percentage}%` }} />
         </div>
      </div>
   );
}

