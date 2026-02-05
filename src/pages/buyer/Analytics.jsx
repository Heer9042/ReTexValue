import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { BarChart3, TrendingUp, PieChart, ShoppingCart, Leaf, AlertCircle, Package, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function Analytics() {
   const { transactions, user, bulkRequests, fetchTransactions, fetchBulkRequests } = useApp();
   const [loading, setLoading] = useState(false);
   const [timeFrame, setTimeFrame] = useState('6m'); // 6m, 1y, all

   useEffect(() => {
      const loadData = async () => {
         // Check if we have cached data - if yes, don't show loader
         const hasData = transactions && transactions.length > 0;
         
         if (!hasData) {
            setLoading(true);
         }
         
         try {
            await Promise.all([fetchTransactions(), fetchBulkRequests()]);
         } catch (error) {
            console.error('Failed to load analytics data:', error);
         } finally {
            // Always hide loader after fetch attempt, whether successful or not
            setLoading(false);
         }
      };
      loadData();
   }, [fetchTransactions, fetchBulkRequests]);

  // Filter data based on timeframe
  const getFilteredData = () => {
    if (!transactions || transactions.length === 0) return [];
    
    const now = new Date();
    let startDate = new Date();
    
    switch(timeFrame) {
      case '1m':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '6m':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate = new Date(0);
    }
    
    return transactions.filter(t => {
      // If user not loaded yet, show all transactions
      if (!user?.id) return true;
      
      // Check buyerId match
      const buyerMatch = t.buyerId === user.id;
      if (!buyerMatch) return false;
      
      // Check date - safely parse date
      try {
        const tDate = new Date(t.date);
        return tDate >= startDate;
      } catch {
        return true; // If date parsing fails, include it
      }
    });
  };

  const filteredTransactions = getFilteredData();
  const filteredRequests = bulkRequests && bulkRequests.length > 0 ? bulkRequests.filter(r => r.buyerId === user?.id) : [];

  // Calculate KPIs
  const totalSpent = filteredTransactions.reduce((acc, t) => acc + (t.amount || 0), 0);
  const ordersPlaced = filteredTransactions.length;
  const requestsSubmitted = filteredRequests.length;
  const averageOrderValue = ordersPlaced > 0 ? totalSpent / ordersPlaced : 0;

  // Calculate CO2 Saved (1 kg waste = 2.5 kg CO2 equivalent)
  const co2Saved = (totalSpent / 100) * 2.5;
  const wasteDiverted = totalSpent / 100; // kg

  // Calculate spending trend
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const spendingTrend = [];
  const monthsToShow = timeFrame === '1m' ? 1 : timeFrame === '6m' ? 6 : 12;
  
  for (let i = monthsToShow - 1; i >= 0; i--) {
    let m = currentMonth - i;
    let y = currentYear;
    if (m < 0) {
      m += 12;
      y -= 1;
    }
    const monthAmount = filteredTransactions
      .filter(t => {
        try {
          const d = new Date(t.date);
          return d.getMonth() === m && d.getFullYear() === y;
        } catch {
          return false;
        }
      })
      .reduce((acc, t) => acc + (t.amount || 0), 0);
    
    spendingTrend.push({ month: months[m], amount: monthAmount || 0 });
  }

  const maxSpending = Math.max(...spendingTrend.map(d => d.amount), 10000);
  const avgMonthlySpend = spendingTrend.length > 0 ? totalSpent / spendingTrend.length : 0;

  // Calculate material categories
  const materialBreakdown = filteredTransactions.reduce((acc, t) => {
    const category = t.fabricType || t.fabricCategory || 'Other';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const materialData = useMemo(() => {
    const entries = Object.entries(materialBreakdown);
    const total = entries.reduce((sum, [, count]) => sum + count, 0);
    return entries.map(([name, count]) => ({
      name,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0
    })).sort((a, b) => b.count - a.count);
  }, [materialBreakdown]);

  // Calculate order status distribution
  const statusData = useMemo(() => {
    const completed = filteredTransactions.filter(t => t.status === 'completed' || t.status === 'delivered').length;
    const pending = filteredTransactions.filter(t => t.status === 'pending' || t.status === 'processing').length;
    const cancelled = filteredTransactions.filter(t => t.status === 'cancelled').length;
    const total = completed + pending + cancelled || 1;
    
    return [
      { label: 'Completed', count: completed, percentage: (completed / total) * 100, color: '#10b981' },
      { label: 'Pending', count: pending, percentage: (pending / total) * 100, color: '#f59e0b' },
      { label: 'Cancelled', count: cancelled, percentage: (cancelled / total) * 100, color: '#ef4444' }
    ];
  }, [filteredTransactions]);

  // Show loader only if we're fetching AND we have no data
  if (loading && (!transactions || transactions.length === 0)) {
      return (
         <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600 mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-slate-400">Loading analytics...</p>
            </div>
         </div>
      );
   }

  // Show empty state if no data after loading
  if (!loading && (!transactions || transactions.length === 0)) {
      return (
         <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <Package className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No Orders Yet</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">Start placing orders to see your analytics</p>
            </div>
         </div>
      );
   }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pt-8">
        <div>
           <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-2">
             Analytics <span className="text-emerald-600 dark:text-emerald-400">Dashboard</span>
           </h1>
           <p className="text-slate-600 dark:text-slate-400 text-lg">Track your procurement activity and environmental impact</p>
        </div>
        
        {/* Time Frame Selector */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1 flex gap-1 shadow-sm">
           {['1m', '6m', '1y'].map(period => (
             <button
               key={period}
               onClick={() => setTimeFrame(period)}
               className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                 timeFrame === period
                   ? 'bg-emerald-600 text-white shadow-lg'
                   : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
               }`}
             >
               {period === '1m' ? '1 Month' : period === '6m' ? '6 Months' : '1 Year'}
             </button>
           ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
           title="Total Spent"
           value={`₹${totalSpent.toLocaleString()}`}
           subtitle={`₹${avgMonthlySpend.toLocaleString()} avg/month`}
           icon={<ShoppingCart />}
           trend={+8.5}
           color="blue"
        />
        <KPICard
           title="Orders Placed"
           value={ordersPlaced}
           subtitle={`Avg: ₹${averageOrderValue.toLocaleString()} per order`}
           icon={<BarChart3 />}
           trend={+12}
           color="purple"
        />
        <KPICard
           title="CO₂ Saved"
           value={`${co2Saved.toFixed(1)} kg`}
           subtitle="Environmental impact"
           icon={<Leaf />}
           trend={+25}
           color="green"
        />
        <KPICard
           title="Material Sourced"
           value={`${wasteDiverted.toFixed(0)} kg`}
           subtitle={`${requestsSubmitted} requests`}
           icon={<Package />}
           trend={+18}
           color="amber"
        />
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6">
         {/* Spending Trend Chart */}
         <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 shadow-lg">
            <div className="mb-8">
               <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <TrendingUp className="text-emerald-600" /> Spending Trend
               </h2>
               <p className="text-slate-600 dark:text-slate-400 text-sm">Monthly procurement expenditure</p>
            </div>
            
            <div className="flex items-end justify-between gap-3 h-72 px-2 pb-6">
               {spendingTrend.map((data, index) => {
                  const heightPercent = (data.amount / maxSpending) * 100;
                  return (
                     <div key={index} className="flex-1 flex flex-col justify-end items-center group">
                        <div className="w-full relative h-full flex flex-col justify-end items-center">
                           {/* Hover Tooltip */}
                           <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-all bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap z-20 shadow-lg">
                              ₹{data.amount.toLocaleString()}
                           </div>
                           
                           {/* Bar */}
                           <div 
                              style={{ height: `${Math.max(heightPercent, 5)}%` }} 
                              className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg group-hover:shadow-lg group-hover:shadow-emerald-500/50 transition-all duration-300"
                           ></div>
                        </div>
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-3 group-hover:text-emerald-600 transition-colors">{data.month}</span>
                     </div>
                  );
               })}
            </div>
         </div>

         {/* Order Status Pie Chart */}
         <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-2">
               <Package className="text-blue-600" /> Order Status
            </h2>
            
            {ordersPlaced > 0 ? (
              <div className="flex flex-col items-center">
                <DonutChart data={statusData} size={220} />
                <div className="w-full mt-6 space-y-3">
                  {statusData.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{item.count}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">({item.percentage.toFixed(0)}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-72">
                <AlertCircle className="text-slate-400 mb-4" size={48} />
                <p className="text-slate-500 dark:text-slate-400 font-semibold">No order data available</p>
              </div>
            )}
         </div>
      </div>

      {/* Material Distribution Pie Chart */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-2">
            <PieChart className="text-purple-600" /> Material Distribution
          </h2>
          
          {materialData.length > 0 ? (
            <div className="flex flex-col items-center">
              <PieChartComponent data={materialData} size={220} />
              <div className="w-full mt-6 space-y-3">
                {materialData.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getPieColor(idx) }}></div>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{item.count}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">({item.percentage.toFixed(0)}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-72">
              <AlertCircle className="text-slate-400 mb-4" size={48} />
              <p className="text-slate-500 dark:text-slate-400 font-semibold">No material data available</p>
            </div>
          )}
        </div>

        {/* Environmental Impact */}
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200 dark:border-emerald-700 rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-2">
            <Leaf className="text-emerald-600" /> Environmental Impact
          </h2>
          
          <div className="space-y-6">
            <ImpactMetric
              label="CO₂ Emissions Saved"
              value={`${co2Saved.toFixed(1)} kg`}
              description="Equivalent to planting trees"
              icon="🌳"
            />
            <ImpactMetric
              label="Waste Diverted"
              value={`${wasteDiverted.toFixed(1)} kg`}
              description="From landfills to reuse"
              icon="♻️"
            />
            <ImpactMetric
              label="Water Saved"
              value={`${(wasteDiverted * 10).toFixed(0)} L`}
              description="Conserved through recycling"
              icon="💧"
            />
            <ImpactMetric
              label="Energy Saved"
              value={`${(co2Saved * 1.5).toFixed(0)} kWh`}
              description="Renewable energy equivalent"
              icon="⚡"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, subtitle, icon, trend, color }) {
  const colors = {
    blue: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/30',
    purple: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/30',
    green: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30',
    amber: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30'
  };

  return (
    <div className={`border rounded-2xl p-6 shadow-lg transition-all hover:-translate-y-1 ${colors[color]}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-white dark:bg-slate-800 rounded-lg">
          {React.cloneElement(icon, { size: 24 })}
        </div>
        <div className="flex items-center gap-1 text-sm font-bold">
          {trend > 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          {Math.abs(trend)}%
        </div>
      </div>
      <p className="text-sm font-semibold opacity-75">{title}</p>
      <h3 className="text-3xl font-bold mt-1">{value}</h3>
      <p className="text-xs opacity-60 mt-2">{subtitle}</p>
    </div>
  );
}

function DonutChart({ data, size }) {
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 2 - 20;
  const innerRadius = radius * 0.6;
  
  let currentAngle = -90;
  
  return (
    <svg width={size} height={size} className="transform rotate-0">
      {data.map((item, index) => {
        const startAngle = currentAngle;
        const angle = (item.percentage / 100) * 360;
        currentAngle += angle;
        
        if (item.count === 0) return null;
        
        const path = describeArc(centerX, centerY, radius, innerRadius, startAngle, startAngle + angle);
        
        return (
          <g key={index}>
            <path
              d={path}
              fill={item.color}
              className="hover:opacity-80 transition-opacity cursor-pointer"
            />
          </g>
        );
      })}
      <circle cx={centerX} cy={centerY} r={innerRadius} fill="currentColor" className="text-white dark:text-slate-800" />
      <text x={centerX} y={centerY - 10} textAnchor="middle" className="text-3xl font-bold fill-slate-900 dark:fill-white">
        {data.reduce((sum, item) => sum + item.count, 0)}
      </text>
      <text x={centerX} y={centerY + 15} textAnchor="middle" className="text-sm fill-slate-600 dark:fill-slate-400">
        Total Orders
      </text>
    </svg>
  );
}

function PieChartComponent({ data, size }) {
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 2 - 20;
  
  let currentAngle = -90;
  
  return (
    <svg width={size} height={size} className="transform rotate-0">
      {data.map((item, index) => {
        const startAngle = currentAngle;
        const angle = (item.percentage / 100) * 360;
        currentAngle += angle;
        
        if (item.count === 0) return null;
        
        const path = describePieSlice(centerX, centerY, radius, startAngle, startAngle + angle);
        
        return (
          <g key={index}>
            <path
              d={path}
              fill={getPieColor(index)}
              className="hover:opacity-80 transition-opacity cursor-pointer"
              stroke="white"
              strokeWidth="2"
            />
          </g>
        );
      })}
    </svg>
  );
}

function describeArc(x, y, radius, innerRadius, startAngle, endAngle) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const innerStart = polarToCartesian(x, y, innerRadius, endAngle);
  const innerEnd = polarToCartesian(x, y, innerRadius, startAngle);
  
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  
  return [
    "M", start.x, start.y,
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
    "L", innerEnd.x, innerEnd.y,
    "A", innerRadius, innerRadius, 0, largeArcFlag, 1, innerStart.x, innerStart.y,
    "Z"
  ].join(" ");
}

function describePieSlice(x, y, radius, startAngle, endAngle) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  
  return [
    "M", x, y,
    "L", start.x, start.y,
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
    "Z"
  ].join(" ");
}

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

function getPieColor(index) {
  const colors = ['#10b981', '#3b82f6', '#a855f7', '#f59e0b', '#ec4899', '#14b8a6', '#f97316'];
  return colors[index % colors.length];
}

function ImpactMetric({ label, value, description, icon }) {
  return (
    <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-5 rounded-xl border border-emerald-200 dark:border-emerald-700/50">
      <div className="flex items-start gap-4">
        <span className="text-3xl">{icon}</span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">{label}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
}
