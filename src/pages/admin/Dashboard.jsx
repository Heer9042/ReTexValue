import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, BarChart, User, FileText, ArrowRight, TrendingUp, Activity, IndianRupee, ShoppingBag, Factory } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { listings, transactions, getStats, bulkRequests, users, fetchListings, fetchTransactions, fetchBulkRequests, fetchUsers } = useApp();
  const [loading, setLoading] = useState(false); // Start with false if we have cached data

  useEffect(() => {
    const loadData = async () => {
      // Check if we have cached data
      const hasCachedData = 
        sessionStorage.getItem('retex_cache_users') ||
        sessionStorage.getItem('retex_cache_listings') ||
        sessionStorage.getItem('retex_cache_transactions') ||
        sessionStorage.getItem('retex_cache_bulkRequests');

      // Only show loading if no cached data exists
      if (!hasCachedData) {
        setLoading(true);
      }

      try {
        await Promise.all([
          fetchListings(),
          fetchTransactions(),
          fetchBulkRequests(),
          fetchUsers()
        ]);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchListings, fetchTransactions, fetchBulkRequests, fetchUsers]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = getStats();

  const pendingListings = listings.filter(l => l.status === 'Pending');
  const activeListings = listings.filter(l => l.status === 'Live');
  
  // Real Transaction Activity (Last 7 Days)
  const getLast7DaysActivity = () => {
     const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
     const today = new Date();
     const last7 = [];
     
     for(let i=6; i>=0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        last7.push({ 
           dateStr: d.toISOString().split('T')[0], 
           dayName: days[d.getDay()] 
        });
     }

     const counts = last7.map(day => {
        return transactions.filter(t => t.date === day.dateStr).length;
     });

     const max = Math.max(...counts, 1); // Avoid div by zero
     // Return normalized percentages for the CSS height, plus labels
     return {
        series: counts.map(c => (c / max) * 100),
        labels: last7.map(d => d.dayName)
     };
  };

  const { series: activityData, labels: activityLabels } = getLast7DaysActivity();

  // Detailed User Stats
  const totalFactories = users.filter(u => u.role === 'Factory').length;
  const totalBuyers = users.filter(u => u.role === 'Buyer').length;
  const totalAdmins = users.filter(u => u.role === 'Admin').length;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Welcome back, Administrator. Here's what's happening today.</p>
        </div>
        <div className="flex gap-2">
           <Link to="/admin/analytics" className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
              <BarChart size={16} /> Reports
           </Link>
           <button className="bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-slate-900/10 dark:shadow-indigo-500/20 transition-colors text-sm font-medium">
              <Activity size={16} /> System Status: Healthy
           </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
            title="Total Revenue" 
            value={`₹${stats.totalRevenue.toLocaleString()}`} 
            icon={<IndianRupee size={20} className="text-emerald-500" />}
            trend={`${stats.trends?.revenue.toFixed(1)}%`}
            isPositive={stats.trends?.revenue >= 0}
        />
         <StatCard 
            title="Avg Order Value" 
            value={`₹${transactions.length ? Math.round(stats.totalRevenue / transactions.length).toLocaleString() : 0}`} 
            icon={<ShoppingBag size={20} className="text-purple-500" />}
            subtitle="Per Transaction"
            trend="+2.4%"
            isPositive={true}
        />
        <StatCard 
            title="Live Listings" 
            value={activeListings.length} 
            icon={<Activity size={20} className="text-indigo-500" />}
            trend={`${stats.trends?.listings.toFixed(1)}%`}
            isPositive={stats.trends?.listings >= 0}
        />
        <StatCard 
            title="Pending Actions" 
            value={pendingListings.length + bulkRequests.length} 
            icon={<ShieldAlert size={20} className="text-amber-500" />}
            trend="Needs Attention"
            isPositive={false}
            trendColor="text-amber-500"
        />
      </div>

      {/* User Demographics Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between shadow-sm">
             <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Users</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{users.length}</h3>
                <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md font-medium">{totalAdmins} Admin(s)</span>
                </div>
             </div>
             <div className="p-3 bg-blue-50 dark:bg-slate-700/50 rounded-lg text-blue-600 dark:text-blue-400">
                <User size={24} />
             </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between shadow-sm">
             <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Factories (Sellers)</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalFactories}</h3>
                <p className="text-xs text-emerald-600 mt-2 font-medium">Verified sources</p>
             </div>
             <div className="p-3 bg-emerald-50 dark:bg-slate-700/50 rounded-lg text-emerald-600 dark:text-emerald-400">
                <Factory size={24} />
             </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between shadow-sm">
             <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Buyers</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalBuyers}</h3>
                <p className="text-xs text-purple-600 mt-2 font-medium">Active purchasers</p>
             </div>
             <div className="p-3 bg-purple-50 dark:bg-slate-700/50 rounded-lg text-purple-600 dark:text-purple-400">
                <ShoppingBag size={24} />
             </div>
          </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
         {/* Main Content Area */}
         <div className="lg:col-span-2 space-y-8">
            
            {/* Quick Actions / pending summary */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm dark:shadow-none">
               <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                     <ShieldAlert size={18} className="text-amber-500" /> Action Required
                  </h2>
                  <Link to="/admin/pending-approvals" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">View All</Link>
               </div>
               
               {pendingListings.length > 0 ? (
                  <div className="space-y-4">
                     {pendingListings.slice(0, 3).map(l => (
                        <div key={l.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-700/50">
                           <div className="flex items-center gap-4">
                              <img src={l.imageUrl} alt="" className="w-12 h-12 rounded-md object-cover bg-slate-200" />
                              <div>
                                 <h4 className="font-semibold text-slate-900 dark:text-white">{l.fabricType}</h4>
                                 <p className="text-xs text-slate-500 dark:text-slate-400">{l.quantity} kg • {l.location}</p>
                              </div>
                           </div>
                           <Link to="/admin/pending-approvals" className="text-xs font-medium px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                              Review
                           </Link>
                        </div>
                     ))}
                  </div>
               ) : (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
                     No pending approvals. Good job!
                  </div>
               )}
            </div>

             {/* Bulk Request Summary */}
             <div className="bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg shadow-indigo-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                   <FileText size={100} />
                </div>
                <div className="relative z-10">
                   <h2 className="text-xl font-bold mb-2">Bulk Requests</h2>
                   <p className="text-indigo-100 mb-6 max-w-md">
                      There are <strong className="text-white text-lg">{bulkRequests.length}</strong> bulk procurement requests from buyers waiting to be matched with factories.
                   </p>
                   <Link to="/admin/bulk-requests" className="inline-flex items-center gap-2 bg-white text-indigo-600 px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-indigo-50 transition-colors">
                      Manage Requests <ArrowRight size={16} />
                   </Link>
                </div>
             </div>

         </div>

         {/* Sidebar / Analytics Summary */}
         <div className="space-y-8">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm dark:shadow-none">
               <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Traffic Overview</h3>
               <div className="h-40 flex items-end justify-between gap-2 px-2">
                  {activityData.map((h, i) => (
                     <div key={i} className="w-full bg-slate-100 dark:bg-slate-700 rounded-t-sm relative group">
                        <div 
                           style={{ height: `${h}%` }} 
                           className="absolute bottom-0 w-full bg-emerald-500 dark:bg-emerald-500 rounded-t-sm transition-all duration-500 group-hover:bg-emerald-400"
                        ></div>
                     </div>
                  ))}
               </div>
               <div className="flex justify-between mt-4 text-xs text-slate-500 dark:text-slate-400">
                  {activityLabels.map((day, i) => (
                     <span key={i}>{day}</span>
                  ))}
               </div>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm dark:shadow-none">
               <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Recent Transactions</h3>
               <div className="space-y-4">
                  {transactions.slice(0, 4).map((t) => (
                     <div key={t.id} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                        <div>
                           <p className="text-sm font-medium text-slate-900 dark:text-white">Payment Received</p>
                           <p className="text-xs text-slate-500 dark:text-slate-400">{t.date}</p>
                        </div>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                           +₹{t.amount.toLocaleString()}
                        </span>
                     </div>
                  ))}
                  <Link to="/admin/transactions" className="block text-center text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2">
                     View All Transactions
                  </Link>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, isPositive, trendColor }) {
   return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-xl hover:border-slate-300 dark:hover:border-slate-600 transition-colors shadow-sm dark:shadow-none">
         <div className="flex justify-between items-start mb-4">
            <div>
               <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</p>
               <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</h3>
            </div>
            <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">{icon}</div>
         </div>
         <div className={`text-xs font-medium flex items-center gap-1 ${trendColor ? trendColor : (isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400')}`}>
            {isPositive ? <TrendingUp size={14} /> : null} {trend}
         </div>
      </div>
   );
}
