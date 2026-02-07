import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BarChart3, TrendingUp, PieChart, ShoppingCart, Leaf, AlertCircle, Package, 
  ArrowUpRight, ArrowDownRight, IndianRupee, Calendar, Truck, Factory, 
  TrendingDown, Activity, Target, Award
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#a855f7', '#f59e0b', '#ec4899', '#14b8a6', '#f97316', '#6366f1'];

export default function Analytics() {
   const { transactions, user, bulkRequests, fetchTransactions, fetchBulkRequests } = useApp();
   const [loading, setLoading] = useState(true);
   const [timeFrame, setTimeFrame] = useState('6m');
   const [cachedData] = useState(() => {
     try {
       const cached = localStorage.getItem('buyer_analytics_cache');
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
            await Promise.all([fetchTransactions(), fetchBulkRequests()]);
            // Cache the data
            localStorage.setItem('buyer_analytics_cache', JSON.stringify({ timestamp: Date.now() }));
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

  // Debug logging
  React.useEffect(() => {
    console.log('📊 [Analytics] Data state:', {
      transactions: transactions?.length || 0,
      filteredTransactions: filteredTransactions.length,
      user: user?.id,
      timeFrame
    });
  }, [transactions, filteredTransactions, user, timeFrame]);

  // Calculate KPIs
  const totalSpent = filteredTransactions.reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);
  const ordersPlaced = filteredTransactions.length;
  const requestsSubmitted = filteredRequests.length;
  const averageOrderValue = ordersPlaced > 0 ? totalSpent / ordersPlaced : 0;

  // Calculate previous period for comparison
  const getPreviousPeriodData = () => {
    if (!transactions || transactions.length === 0) return { spent: 0, orders: 0 };
    
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
        return { spent: 0, orders: 0 };
    }
    
    const prevTransactions = transactions.filter(t => {
      if (!user?.id || t.buyerId !== user.id) return false;
      try {
        const tDate = new Date(t.date);
        return tDate >= prevStart && tDate < prevEnd;
      } catch {
        return false;
      }
    });
    
    return {
      spent: prevTransactions.reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0),
      orders: prevTransactions.length
    };
  };

  const previousPeriod = getPreviousPeriodData();
  const spentGrowth = previousPeriod.spent > 0 
    ? ((totalSpent - previousPeriod.spent) / previousPeriod.spent) * 100 
    : 0;
  const ordersGrowth = previousPeriod.orders > 0
    ? ((ordersPlaced - previousPeriod.orders) / previousPeriod.orders) * 100
    : 0;

  // Calculate CO2 Saved (1 kg waste = 2.5 kg CO2 equivalent)
  const co2Saved = (totalSpent / 100) * 2.5;
  const wasteDiverted = totalSpent / 100; // kg

  // Calculate spending trend
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const spendingTrend = [];
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
    const monthAmount = monthTransactions.reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);
    const orderCount = monthTransactions.length;
    
    spendingTrend.push({ 
      month: months[m], 
      amount: monthAmount || 0,
      orders: orderCount,
      avg: orderCount > 0 ? monthAmount / orderCount : 0
    });
  }

  const avgMonthlySpend = spendingTrend.length > 0 ? totalSpent / spendingTrend.length : 0;

  // Material categories
  const materialBreakdown = filteredTransactions.reduce((acc, t) => {
    const category = t.fabricType || t.fabricCategory || t.category || 'Other';
    const amount = parseFloat(t.amount) || 0;
    if (!acc[category]) {
      acc[category] = { count: 0, amount: 0 };
    }
    acc[category].count += 1;
    acc[category].amount += amount;
    return acc;
  }, {});

  const materialData = useMemo(() => {
    const entries = Object.entries(materialBreakdown);
    const total = entries.reduce((sum, [, data]) => sum + data.count, 0);
    return entries.map(([name, data]) => ({
      name,
      count: data.count,
      amount: data.amount,
      percentage: total > 0 ? (data.count / total) * 100 : 0,
      value: data.amount
    })).sort((a, b) => b.amount - a.amount);
  }, [materialBreakdown]);

  // Order status distribution
  const statusData = useMemo(() => {
    const completed = filteredTransactions.filter(t => t.status === 'completed' || t.status === 'delivered').length;
    const pending = filteredTransactions.filter(t => t.status === 'pending' || t.status === 'processing').length;
    const cancelled = filteredTransactions.filter(t => t.status === 'cancelled').length;
    const total = completed + pending + cancelled || 1;
    
    return [
      { name: 'Completed', count: completed, percentage: (completed / total) * 100, color: '#10b981', value: completed },
      { name: 'Pending', count: pending, percentage: (pending / total) * 100, color: '#f59e0b', value: pending },
      { name: 'Cancelled', count: cancelled, percentage: (cancelled / total) * 100, color: '#ef4444', value: cancelled }
    ].filter(item => item.count > 0);
  }, [filteredTransactions]);

  // Supplier distribution
  const supplierData = useMemo(() => {
    const suppliers = filteredTransactions.reduce((acc, t) => {
      const supplier = t.sellerName || t.factoryName || 'Unknown';
      if (!acc[supplier]) {
        acc[supplier] = { count: 0, amount: 0 };
      }
      acc[supplier].count += 1;
      acc[supplier].amount += parseFloat(t.amount) || 0;
      return acc;
    }, {});
    
    return Object.entries(suppliers)
      .map(([name, data]) => ({
        name,
        orders: data.count,
        spent: data.amount
      }))
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 5);
  }, [filteredTransactions]);

  // Performance metrics radar chart
  const radarData = [
    { subject: 'Orders', value: Math.min((ordersPlaced / 50) * 100, 100), fullMark: 100 },
    { subject: 'Spending', value: Math.min((totalSpent / 100000) * 100, 100), fullMark: 100 },
    { subject: 'Avg Order', value: Math.min((averageOrderValue / 10000) * 100, 100), fullMark: 100 },
    { subject: 'Suppliers', value: Math.min((supplierData.length / 10) * 100, 100), fullMark: 100 },
    { subject: 'Impact', value: Math.min((co2Saved / 100) * 100, 100), fullMark: 100 }
  ];

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
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No Orders Yet</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">Start placing orders to see your analytics</p>
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
           value={`₹${totalSpent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
           subtitle={`₹${avgMonthlySpend.toLocaleString('en-IN', { maximumFractionDigits: 0 })} avg/month`}
           icon={<IndianRupee />}
           trend={spentGrowth}
           color="blue"
        />
        <KPICard
           title="Orders Placed"
           value={ordersPlaced}
           subtitle={`₹${averageOrderValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })} avg order`}
           icon={<ShoppingCart />}
           trend={ordersGrowth}
           color="purple"
        />
        <KPICard
           title="CO₂ Saved"
           value={`${co2Saved.toFixed(1)} kg`}
           subtitle="Environmental impact"
           icon={<Leaf />}
           trend={25}
           color="green"
        />
        <KPICard
           title="Active Suppliers"
           value={supplierData.length}
           subtitle={`${requestsSubmitted} bulk requests`}
           icon={<Factory />}
           trend={15}
           color="amber"
        />
      </div>

      {/* Spending Trend - Line Chart */}
      <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-lg">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <TrendingUp className="text-emerald-600" size={28} /> Spending Trend
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">Monthly procurement expenditure over time</p>
        </div>
        
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={spendingTrend}>
            <defs>
              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" stroke="#64748b" />
            <YAxis stroke="#64748b" tickFormatter={(value) => `₹${(value/1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="amount" stroke="#10b981" fillOpacity={1} fill="url(#colorAmount)" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Orders & Performance */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly Orders Bar Chart */}
        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-lg">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <BarChart3 className="text-blue-600" size={28} /> Monthly Orders
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Order volume and average value</p>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={spendingTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="orders" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                {spendingTrend.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Radar */}
        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-lg">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Activity className="text-purple-600" size={28} /> Performance Metrics
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Overall procurement performance</p>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" stroke="#64748b" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#64748b" />
              <Radar name="Performance" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Material & Status Distribution */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Material Distribution Pie Chart */}
        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-lg">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <PieChart className="text-purple-600" size={28} /> Material Distribution
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm">By fabric type and category</p>
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
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{item.count}</span>
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

        {/* Order Status Donut Chart */}
        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-lg">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Package className="text-blue-600" size={28} /> Order Status
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Distribution by status</p>
          </div>
          
          {ordersPlaced > 0 ? (
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
            <EmptyState message="No order data available" />
          )}
        </div>
      </div>

      {/* Top Suppliers */}
      <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-lg">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <Award className="text-amber-600" size={28} /> Top Suppliers
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">Most frequently ordered from</p>
        </div>
        
        {supplierData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={supplierData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" stroke="#64748b" tickFormatter={(value) => `₹${(value/1000).toFixed(0)}k`} />
              <YAxis dataKey="name" type="category" stroke="#64748b" width={150} />
              <Tooltip content={<CustomSupplierTooltip />} />
              <Bar dataKey="spent" fill="#f59e0b" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState message="No supplier data available" />
        )}
      </div>

      {/* Environmental Impact */}
      <div className="bg-linear-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200 dark:border-emerald-700 rounded-2xl p-8 shadow-lg">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <Leaf className="text-emerald-600" size={28} /> Environmental Impact
          </h2>
          <p className="text-slate-600 dark:text-slate-400">Your contribution to sustainability</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ImpactMetric
            label="CO₂ Emissions Saved"
            value={`${co2Saved.toFixed(1)} kg`}
            description={`${(co2Saved / 21).toFixed(0)} trees equivalent`}
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
            {entry.name === 'amount' ? 'Spent' : entry.name === 'orders' ? 'Orders' : entry.name}: 
            <span className="font-bold ml-1">
              {entry.name === 'amount' ? `₹${entry.value.toLocaleString('en-IN')}` : entry.value}
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
        {data.amount && (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Amount: <span className="font-bold">₹{data.amount.toLocaleString('en-IN')}</span>
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

function CustomSupplierTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 shadow-lg">
        <p className="font-bold text-slate-900 dark:text-white mb-2">{label}</p>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Orders: <span className="font-bold">{data.orders}</span>
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Total Spent: <span className="font-bold">₹{data.spent.toLocaleString('en-IN')}</span>
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
