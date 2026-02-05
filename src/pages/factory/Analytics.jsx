import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  TrendingUp, PieChart, BadgeDollarSign, Leaf, AlertCircle, Package, 
  ArrowUpRight, ArrowDownRight, ShoppingBag, Target
} from 'lucide-react';
import {
  AreaChart, Area, PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#a855f7', '#f59e0b', '#ec4899', '#14b8a6', '#f97316', '#6366f1'];

export default function Analytics() {
   const { transactions, user, listings, fetchTransactions, fetchListings } = useApp();
   const [loading, setLoading] = useState(true);
   const [timeFrame, setTimeFrame] = useState('6m');
   const [cachedData] = useState(() => {
     try {
       const cached = localStorage.getItem('factory_analytics_cache');
       return cached ? JSON.parse(cached) : null;
     } catch {
       return null;
     }
   });

   useEffect(() => {
      const loadData = async () => {
         // If we have cached data, don't show loader
         if (cachedData) {
            setLoading(false);
         }
         
         try {
            await Promise.all([fetchTransactions(), fetchListings()]);
            // Cache the data
            localStorage.setItem('factory_analytics_cache', JSON.stringify({ timestamp: Date.now() }));
         } catch (error) {
            console.error('Failed to load analytics data:', error);
         } finally {
            setLoading(false);
         }
      };
      loadData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

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
      
      // Check sellerId match (factory is the seller)
      const sellerMatch = t.sellerId === user.id;
      if (!sellerMatch) return false;
      
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
  const myListings = useMemo(() => listings?.filter(l => l.factoryId === user?.id) || [], [listings, user?.id]);
  const soldListings = useMemo(() => myListings.filter(l => l.status === 'Sold'), [myListings]);

  // Debug logging
  React.useEffect(() => {
    console.log('🏭 [Factory Analytics] Data state:', {
      transactions: transactions?.length || 0,
      filteredTransactions: filteredTransactions.length,
      myListings: myListings.length,
      soldListings: soldListings.length,
      user: user?.id,
      timeFrame
    });
  }, [transactions, filteredTransactions, myListings, soldListings, user, timeFrame]);

  // Calculate KPIs
  const totalRevenue = filteredTransactions.reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);
  const salesCount = filteredTransactions.length;
  const averageOrderValue = salesCount > 0 ? totalRevenue / salesCount : 0;
  
  // Calculate commission earned (platform takes commission from seller)
  const totalCommission = filteredTransactions.reduce((acc, t) => acc + (parseFloat(t.commission) || 0), 0);
  const netRevenue = totalRevenue - totalCommission;

  // Calculate previous period for comparison
  const getPreviousPeriodData = () => {
    if (!transactions || transactions.length === 0) return { revenue: 0, sales: 0 };
    
    const now = new Date();
    let prevStart = new Date();
    let prevEnd = new Date();
    
    switch(timeFrame) {
      case '1m':
        prevStart.setMonth(now.getMonth() - 2);
        prevEnd.setMonth(now.getMonth() - 1);
        break;
      case '6m':
        prevStart.setMonth(now.getMonth() - 12);
        prevEnd.setMonth(now.getMonth() - 6);
        break;
      case '1y':
        prevStart.setFullYear(now.getFullYear() - 2);
        prevEnd.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return { revenue: 0, sales: 0 };
    }
    
    const prevTransactions = transactions.filter(t => {
      if (!user?.id || t.sellerId !== user.id) return false;
      try {
        const tDate = new Date(t.date);
        return tDate >= prevStart && tDate < prevEnd;
      } catch {
        return false;
      }
    });
    
    return {
      revenue: prevTransactions.reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0),
      sales: prevTransactions.length
    };
  };

  const previousPeriod = getPreviousPeriodData();
  const revenueGrowth = previousPeriod.revenue > 0 
    ? ((totalRevenue - previousPeriod.revenue) / previousPeriod.revenue) * 100 
    : 0;
  const salesGrowth = previousPeriod.sales > 0
    ? ((salesCount - previousPeriod.sales) / previousPeriod.sales) * 100
    : 0;

  // Calculate material volume from transactions
  const volumeSold = filteredTransactions.reduce((acc, t) => acc + (parseFloat(t.quantity) || 0), 0);
  const co2Saved = volumeSold * 15; // 15kg CO2 per kg textile waste

  // Calculate revenue trend
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const revenueTrend = [];
  const monthsToShow = timeFrame === '1m' ? 4 : timeFrame === '6m' ? 6 : 12;
  
  for (let i = monthsToShow - 1; i >= 0; i--) {
    let m = currentMonth - i;
    let y = currentYear;
    if (m < 0) {
      m += 12;
      y -= 1;
    }
    const monthTransactions = filteredTransactions.filter(t => {
      try {
        const d = new Date(t.date);
        return d.getMonth() === m && d.getFullYear() === y;
      } catch {
        return false;
      }
    });
    const monthRevenue = monthTransactions.reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);
    const monthSales = monthTransactions.length;
    const monthVolume = monthTransactions.reduce((acc, t) => {
      const listing = myListings.find(l => l.id === t.listingId);
      return acc + (listing ? parseFloat(listing.quantity) || 0 : 0);
    }, 0);
    
    revenueTrend.push({ 
      month: months[m], 
      revenue: monthRevenue || 0,
      sales: monthSales,
      volume: monthVolume,
      net: monthRevenue - (monthTransactions.reduce((acc, t) => acc + (parseFloat(t.commission) || 0), 0))
    });
  }

  // Material categories from transactions
  const materialBreakdown = filteredTransactions.reduce((acc, t) => {
    const category = t.fabricType || t.fabricCategory || 'Other';
    const revenue = parseFloat(t.amount) || 0;
    if (!acc[category]) {
      acc[category] = { count: 0, volume: 0, revenue: 0 };
    }
    acc[category].count += 1;
    acc[category].volume += parseFloat(t.quantity) || 0;
    acc[category].revenue += revenue;
    return acc;
  }, {});

  const materialData = useMemo(() => {
    const entries = Object.entries(materialBreakdown);
    const total = entries.reduce((sum, [, data]) => sum + data.count, 0);
    return entries.map(([name, data]) => ({
      name,
      count: data.count,
      volume: data.volume,
      revenue: data.revenue,
      percentage: total > 0 ? (data.count / total) * 100 : 0,
      value: data.revenue
    })).sort((a, b) => b.revenue - a.revenue);
  }, [materialBreakdown]);

  // Listing status
  const statusData = useMemo(() => {
    const live = myListings.filter(l => l.status === 'Live').length;
    const sold = myListings.filter(l => l.status === 'Sold').length;
    const pending = myListings.filter(l => l.status === 'Pending').length;
    const total = live + sold + pending || 1;
    
    return [
      { name: 'Live', count: live, percentage: (live / total) * 100, color: '#10b981', value: live },
      { name: 'Sold', count: sold, percentage: (sold / total) * 100, color: '#3b82f6', value: sold },
      { name: 'Pending', count: pending, percentage: (pending / total) * 100, color: '#f59e0b', value: pending }
    ].filter(item => item.count > 0);
  }, [myListings]);

  // Show loader while fetching data
  if (loading) {
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
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No Sales Yet</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">Start selling inventory to see your analytics</p>
            </div>
         </div>
      );
   }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pt-8">
        <div>
           <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-2">
             Factory <span className="text-emerald-600 dark:text-emerald-400">Analytics</span>
           </h1>
           <p className="text-slate-600 dark:text-slate-400 text-lg">Track your sales performance and environmental impact</p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <KPICard
           title="Total Revenue"
           value={`₹${totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
           subtitle={`Net: ₹${netRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
           icon={<BadgeDollarSign />}
           trend={revenueGrowth}
           color="blue"
        />
        <KPICard
           title="Sales Count"
           value={salesCount}
           subtitle={`₹${averageOrderValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })} avg order`}
           icon={<ShoppingBag />}
           trend={salesGrowth}
           color="purple"
        />
        <KPICard
           title="Volume Sold"
           value={`${volumeSold.toFixed(1)} kg`}
           subtitle={`${soldListings.length} listings sold`}
           icon={<Package />}
           trend={20}
           color="green"
        />
      </div>

      {/* Revenue Trend - Area Chart */}
      <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-lg">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <TrendingUp className="text-emerald-600" size={28} /> Revenue Trend
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">Gross and net revenue over time</p>
        </div>
        
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={revenueTrend}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" stroke="#64748b" />
            <YAxis stroke="#64748b" tickFormatter={(value) => `₹${(value/1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={3} name="Gross" />
            <Area type="monotone" dataKey="net" stroke="#3b82f6" fillOpacity={1} fill="url(#colorNet)" strokeWidth={2} name="Net" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Material & Status Distribution */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Material Distribution Pie Chart */}
        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-lg">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <PieChart className="text-purple-600" size={28} /> Material Revenue
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Revenue breakdown by fabric type</p>
          </div>
          
          {materialData.length > 0 ? (
            <div className="flex flex-col lg:flex-row items-center gap-6">
              <ResponsiveContainer width="100%" height={250}>
                <RePieChart>
                  <Pie
                    data={materialData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomLabel}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {materialData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </RePieChart>
              </ResponsiveContainer>
              
              <div className="w-full space-y-2">
                {materialData.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">₹{(item.revenue/1000).toFixed(0)}k</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">({item.percentage.toFixed(0)}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState message="No material data available" />
          )}
        </div>

        {/* Listing Status Donut Chart */}
        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-lg">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Target className="text-blue-600" size={28} /> Listing Status
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Distribution by listing status</p>
          </div>
          
          {myListings.length > 0 ? (
            <div className="flex flex-col lg:flex-row items-center gap-6">
              <ResponsiveContainer width="100%" height={250}>
                <RePieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </RePieChart>
              </ResponsiveContainer>
              
              <div className="w-full space-y-2">
                {statusData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
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
            <EmptyState message="No listing data available" />
          )}
        </div>
      </div>

      {/* Environmental Impact */}
      <div className="bg-linear-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200 dark:border-emerald-700 rounded-2xl p-8 shadow-lg">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <Leaf className="text-emerald-600" size={28} /> Environmental Impact
          </h2>
          <p className="text-slate-600 dark:text-slate-400">Your contribution to circular economy</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <ImpactMetric
            label="CO₂ Emissions Prevented"
            value={`${co2Saved.toFixed(1)} kg`}
            description={`${(co2Saved / 21).toFixed(0)} trees equivalent`}
            icon="🌳"
          />
          <ImpactMetric
            label="Waste Recycled"
            value={`${volumeSold.toFixed(1)} kg`}
            description="Diverted from landfills"
            icon="♻️"
          />
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

  const isPositive = trend >= 0;

  return (
    <div className={`border rounded-2xl p-6 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl ${colors[color]}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
          {React.cloneElement(icon, { size: 24 })}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-bold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
            {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
      <p className="text-sm font-semibold opacity-75 mb-1">{title}</p>
      <h3 className="text-3xl font-bold mb-2">{value}</h3>
      <p className="text-xs opacity-60">{subtitle}</p>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 shadow-lg">
        <p className="font-bold text-slate-900 dark:text-white mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: 
            <span className="font-bold ml-1">
              ₹{entry.value.toLocaleString('en-IN')}
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
}

function CustomPieTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 shadow-lg">
        <p className="font-bold text-slate-900 dark:text-white mb-1">{data.name}</p>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Count: <span className="font-bold">{data.count}</span>
        </p>
        {data.revenue && (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Revenue: <span className="font-bold">₹{data.revenue.toLocaleString('en-IN')}</span>
          </p>
        )}
        {data.volume && (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Volume: <span className="font-bold">{data.volume.toFixed(1)} kg</span>
          </p>
        )}
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Percentage: <span className="font-bold">{data.percentage.toFixed(1)}%</span>
        </p>
      </div>
    );
  }
  return null;
}

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null; // Don't show label if less than 5%

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      className="text-xs font-bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center h-72">
      <AlertCircle className="text-slate-400 dark:text-slate-600 mb-4" size={48} />
      <p className="text-slate-500 dark:text-slate-400 font-semibold">{message}</p>
    </div>
  );
}

function ImpactMetric({ label, value, description, icon }) {
  return (
    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-5 rounded-xl border border-emerald-200 dark:border-emerald-700/50 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4">
        <span className="text-4xl">{icon}</span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">{label}</p>
          <p className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-1">{value}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
        </div>
      </div>
    </div>
  );
}