import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Users, BadgeDollarSign, Activity, Globe, TrendingUp, BarChart3, Recycle, Factory, ShoppingBag, Leaf, Trash2, Calendar, Download, PieChart, Layers } from 'lucide-react';

export default function Analytics() {
  const { users, listings, transactions, getStats } = useApp();
  const [timeRange, setTimeRange] = useState('All Time');
  
  const stats = getStats();
  
  // Sell-through rate
  const sellThrough = (stats.totalWasteSold / stats.totalWasteUploaded) * 100 || 0;
  
  // Platform Metrics
  const activeFactories = users.filter(u => u.role === 'Factory' && u.status === 'Verified').length;
  const activeBuyers = users.filter(u => u.role === 'Buyer' && u.status === 'Verified').length;

  const maxGrowth = Math.max(...stats.growthData.map(d => d.count), 1);
  const totalFabricVol = Object.values(stats.fabricDistribution).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
       {/* Header */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
               <Activity className="text-emerald-500" /> Platform Analytics
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Measuring impact, growth, and circular economy performance.</p>
          </div>
          
          <div className="flex gap-3">
             <button 
                onClick={() => {
                  const ranges = ['All Time', 'Last 6 Months', 'Last Year'];
                  const currentIndex = ranges.indexOf(timeRange);
                  setTimeRange(ranges[(currentIndex + 1) % ranges.length]);
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
             >
                <Calendar size={18} />
                <span>{timeRange}</span>
             </button>
             <button 
                onClick={() => {
                  const csvContent = `Platform Analytics Report\nGenerated: ${new Date().toLocaleString()}\n\nMetric,Value\nWaste Diverted,${stats.totalWasteSold.toLocaleString()} kg\nCarbon Offset,${stats.co2Saved.toLocaleString()} kg\nPlatform Revenue,₹${stats.totalRevenue.toLocaleString()}\nUser Growth,${users.length}`;
                  const blob = new Blob([csvContent], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `platform-analytics-${new Date().toISOString().split('T')[0]}.csv`;
                  a.click();
                  window.URL.revokeObjectURL(url);
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
             >
                <Download size={18} />
                <span>Download Report</span>
             </button>
          </div>
       </div>

       {/* Impact Tiles */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ImpactCard 
             title="Waste Diverted" 
             value={`${stats.totalWasteSold.toLocaleString()} kg`}
             label="Successfully Recycled"
             icon={<Recycle className="text-emerald-500" />}
             color="emerald"
          />
          <ImpactCard 
             title="Carbon Offset" 
             value={`${stats.co2Saved.toLocaleString()} kg`}
             label="CO2e Emissions Prevented"
             icon={<Leaf className="text-green-500" />}
             color="green"
          />
          <ImpactCard 
             title="Platform Revenue" 
             value={`₹${stats.totalRevenue.toLocaleString()}`}
             label="Total Marketplace GMV"
             icon={<BadgeDollarSign className="text-amber-500" />}
             color="amber"
             trend={stats.trends.revenue}
          />
          <ImpactCard 
             title="User Growth" 
             value={users.length}
             label="Total Registered Entities"
             icon={<Users className="text-blue-500" />}
             color="blue"
             trend={stats.trends.users}
          />
       </div>

       {/* Visualizations Grid */}
       <div className="grid lg:grid-cols-3 gap-8">
          
          {/* User Growth Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-8 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none">
             <div className="flex justify-between items-center mb-8">
                <div>
                   <h3 className="text-xl font-bold text-slate-900 dark:text-white">Registration Trends</h3>
                   <p className="text-sm text-slate-500">User acquisition over the last 6 months</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-500/20">
                   <TrendingUp size={14} /> +{stats.trends.users.toFixed(1)}% Growth
                </div>
             </div>
             
             <div className="h-64 flex items-end justify-between gap-4 md:gap-8 px-2 relative">
                {/* Y-axis helper lines */}
                <div className="absolute inset-x-0 top-0 h-px bg-slate-100 dark:bg-slate-700/50 opacity-50"></div>
                <div className="absolute inset-x-0 top-1/2 h-px bg-slate-100 dark:bg-slate-700/50 opacity-50"></div>
                
                {stats.growthData.map((data, index) => {
                   const heightPercent = (data.count / maxGrowth) * 100;
                   return (
                      <div key={index} className="flex-1 flex flex-col items-center gap-4 group h-full">
                         <div className="relative w-full h-full flex items-end justify-center">
                            <div className="absolute bottom-full mb-3 opacity-0 group-hover:opacity-100 bg-slate-900 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg z-20 transition-all transform translate-y-2 group-hover:translate-y-0 shadow-xl whitespace-nowrap">
                               {data.count} Registrations
                            </div>
                            <div 
                               style={{ height: `${Math.max(heightPercent, 5)}%` }} 
                               className="w-full max-w-[40px] bg-linear-to-t from-emerald-500/80 to-emerald-400 dark:from-emerald-600 dark:to-emerald-500 rounded-t-xl transition-all duration-500 group-hover:brightness-110 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                            ></div>
                         </div>
                         <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{data.month}</span>
                      </div>
                   );
                })}
             </div>
          </div>

          {/* Composition Pie-ish Chart */}
          <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-8 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none">
             <div className="mb-8">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Material Flow</h3>
                <p className="text-sm text-slate-500">Distribution by fabric type</p>
             </div>
             
             <div className="space-y-6">
                 {Object.entries(stats.fabricDistribution).map(([type, amount], idx) => {
                    const percentage = (amount / totalFabricVol) * 100;
                    const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-amber-500', 'bg-rose-500'];
                    const color = colors[idx % colors.length];
                    
                    return (
                       <div key={type} className="group">
                          <div className="flex justify-between items-center mb-2">
                             <div className="flex items-center gap-2">
                                <div className={`w-2.5 h-2.5 rounded-full ${color}`}></div>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{type}</span>
                             </div>
                             <span className="text-xs font-mono font-bold text-slate-500">{amount.toLocaleString()} kg</span>
                          </div>
                          <div className="relative w-full h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                             <div 
                                className={`absolute inset-y-0 left-0 ${color} rounded-full transition-all duration-1000 ease-out`}
                                style={{ width: `${percentage}%` }}
                             ></div>
                          </div>
                       </div>
                    );
                 })}
                 {Object.keys(stats.fabricDistribution).length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                       <BarChart3 size={48} className="opacity-20 mb-4" />
                       <p className="text-sm">No inventory data available</p>
                    </div>
                 )}
             </div>

             <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700/50">
                <div className="flex justify-between items-center">
                   <div className="text-xs font-bold text-slate-400 uppercase">Sell-through Rate</div>
                   <div className="text-lg font-black text-emerald-500">{sellThrough.toFixed(1)}%</div>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Percentage of uploaded waste successfully sold</div>
             </div>
          </div>
       </div>

       {/* Market Participation */}
       <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-linear-to-br from-indigo-600 to-blue-700 rounded-2xl p-8 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group">
             <div className="absolute -right-8 -bottom-8 opacity-10 transform group-hover:scale-110 transition-transform duration-700">
                <Factory size={200} />
             </div>
             <div className="relative z-10">
                <h4 className="text-indigo-100 font-bold uppercase tracking-widest text-xs mb-2">Supply Side</h4>
                <div className="text-4xl font-black mb-4">{activeFactories}</div>
                <p className="text-indigo-100/80 leading-relaxed text-sm max-w-xs">
                   Verified textile factories and processing units actively contributing inventory to the marketplace.
                </p>
             </div>
          </div>

          <div className="bg-linear-to-br from-emerald-600 to-teal-700 rounded-2xl p-8 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden group">
             <div className="absolute -right-8 -bottom-8 opacity-10 transform group-hover:scale-110 transition-transform duration-700">
                <ShoppingBag size={200} />
             </div>
             <div className="relative z-10">
                <h4 className="text-emerald-100 font-bold uppercase tracking-widest text-xs mb-2">Demand Side</h4>
                <div className="text-4xl font-black mb-4">{activeBuyers}</div>
                <p className="text-emerald-100/80 leading-relaxed text-sm max-w-xs">
                   Innovative fashion brands, designers, and recycling partners sourcing materials through ReTexValue.
                </p>
             </div>
          </div>
       </div>
    </div>
  );
}

function ImpactCard({ title, value, label, icon, color, trend }) {
   const colorMap = {
      emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 ring-emerald-100 dark:ring-emerald-500/20',
      green: 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400 ring-green-100 dark:ring-green-500/20',
      amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 ring-amber-100 dark:ring-amber-500/20',
      blue: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 ring-blue-100 dark:ring-blue-500/20'
   };

   return (
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/40 dark:shadow-none hover:shadow-2xl transition-all group">
         <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ring-1 ${colorMap[color] || colorMap.emerald}`}>
               {React.cloneElement(icon, { size: 24 })}
            </div>
            {trend !== undefined && (
               <div className={`flex items-center gap-1 text-xs font-black ${trend >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
               </div>
            )}
         </div>
         <div className="text-slate-400 text-xs font-bold uppercase tracking-tighter mb-1 group-hover:text-slate-500 transition-colors">{title}</div>
         <div className="text-2xl font-black text-slate-900 dark:text-white mb-1">{value}</div>
         <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</div>
      </div>
   );
}
