import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Users, Search, MapPin, Factory, ShoppingBag, Filter, Bell, Tag, Star, ArrowRight } from 'lucide-react';

export default function Community() {
  const { users, notices, listings } = useApp();
  const [activeTab, setActiveTab] = useState('Members'); // 'Members' or 'Marketplace'
  const [memberFilter, setMemberFilter] = useState('All'); // All, Factory, Buyer
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Members Logic
  const filteredUsers = users.filter(user => {
     const matchesTab = memberFilter === 'All' || user.role === memberFilter;
     const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           user.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.type?.toLowerCase().includes(searchTerm.toLowerCase());
     return matchesTab && matchesSearch && user.role !== 'Admin';
  });

  const stats = {
     factories: users.filter(u => u.role === 'Factory').length,
     buyers: users.filter(u => u.role === 'Buyer').length,
     total: users.filter(u => u.role !== 'Admin').length
  };

  // 2. Marketplace Logic (Community Selling)
  const marketListings = listings.filter(l => l.status === 'Live');
  
  // 3. Featured / Suggested Sellers (Top 3 Factories)
  const featuredSellers = users.filter(u => u.role === 'Factory' && u.status === 'Verified').slice(0, 3);

  return (
    <div className="px-6 pt-6 pb-12 max-w-7xl mx-auto transition-colors duration-300">
      
      {/* Community Notices Section */}
      {notices.length > 0 && (
         <div className="mb-12 grid gap-4">
            {notices.map(notice => (
               <div key={notice.id} className={`p-4 rounded-xl border flex items-start gap-4 ${
                  notice.type === 'alert' 
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-200' 
                  : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-200'
               }`}>
                  <div className={`p-2 rounded-lg ${notice.type === 'alert' ? 'bg-amber-500/20' : 'bg-indigo-500/20'}`}>
                     <Bell size={18} />
                  </div>
                  <div>
                     <h4 className="font-bold text-slate-900 dark:text-white">{notice.title}</h4>
                     <p className="text-sm opacity-90 mt-1">{notice.content}</p>
                     <p className="text-xs opacity-60 mt-2">{notice.date}</p>
                  </div>
               </div>
            ))}
         </div>
      )}

      {/* Main Header */}
      <div className="text-center mb-10 animate-in slide-in-from-top-4 duration-700">
         <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-linear-to-r from-emerald-600 to-teal-400 dark:from-emerald-400 dark:to-teal-200 bg-clip-text text-transparent">
            ReTex Community Hub
         </h1>
         <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            Connect with verified partners, explore the open marketplace, and stay updated.
         </p>
      </div>

      {/* Main Tabs */}
      <div className="flex justify-center mb-8">
         <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 inline-flex transition-colors">
            <button 
               onClick={() => setActiveTab('Members')}
               className={`px-8 py-3 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'Members' 
                  ? 'bg-emerald-600 text-white shadow-lg' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
               }`}
            >
               <Users size={18} /> Network Members
            </button>
            <button 
               onClick={() => setActiveTab('Marketplace')}
               className={`px-8 py-3 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'Marketplace' 
                  ? 'bg-emerald-600 text-white shadow-lg' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
               }`}
            >
               <Tag size={18} /> Community Market
            </button>
         </div>
      </div>

      {activeTab === 'Members' ? (
        <>
          {/* Members Stats & Filters */}
          <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl p-6 mb-12 transition-colors shadow-sm dark:shadow-none">
             <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex gap-8 text-slate-900 dark:text-white">
                   <div className="text-center">
                      <p className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-b from-slate-700 to-slate-500 dark:from-white dark:to-slate-400">{stats.total}</p>
                      <p className="text-xs text-slate-500 uppercase tracking-widest">Members</p>
                   </div>
                   <div className="w-px bg-slate-300 dark:bg-slate-700 h-10 self-center transition-colors"></div>
                   <div className="text-center">
                      <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stats.factories}</p>
                      <p className="text-xs text-slate-500 uppercase tracking-widest">Factories</p>
                   </div>
                   <div className="w-px bg-slate-300 dark:bg-slate-700 h-10 self-center transition-colors"></div>
                   <div className="text-center">
                      <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.buyers}</p>
                      <p className="text-xs text-slate-500 uppercase tracking-widest">Buyers</p>
                   </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                   <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input 
                         type="text" 
                         placeholder="Search..." 
                         value={searchTerm}
                         onChange={(e) => setSearchTerm(e.target.value)}
                         className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none w-full sm:w-64 transition-colors"
                      />
                   </div>
                   <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors">
                      {['All', 'Factory', 'Buyer'].map(filter => (
                         <button
                            key={filter}
                            onClick={() => setMemberFilter(filter)}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                               memberFilter === filter 
                               ? 'bg-emerald-500 text-white shadow-lg' 
                               : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                         >
                            {filter}
                         </button>
                      ))}
                   </div>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Member Grid */}
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                 {filteredUsers.map((user, idx) => (
                    <div 
                       key={user.id} 
                       className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 rounded-xl p-6 transition-all hover:shadow-xl hover:translate-y-[-4px] animate-in fade-in zoom-in-95 duration-500"
                       style={{ animationDelay: `${idx * 50}ms` }}
                    >
                       <div className="flex justify-between items-start mb-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${
                             user.role === 'Factory' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                          }`}>
                             {user.role === 'Factory' ? <Factory size={24} /> : <ShoppingBag size={24} />}
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium border ${
                             user.role === 'Factory' 
                             ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                             : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                          }`}>
                             {user.type || user.role}
                          </span>
                       </div>
                       
                       <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{user.name}</h3>
                       <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm mb-4">
                          <MapPin size={14} className="mr-1" /> {user.location || 'India'}
                       </div>
                       
                       <div className="border-t border-slate-200 dark:border-slate-700 pt-4 flex justify-between items-center text-sm">
                           <div className="text-slate-500">
                              Joined <span className="text-slate-700 dark:text-slate-300">{new Date(user.joinDate).getFullYear()}</span>
                           </div>
                           <button className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline flex items-center gap-1">Connect <ArrowRight size={14}/></button>
                       </div>
                    </div>
                 ))}
                 
                 {filteredUsers.length === 0 && (
                    <div className="col-span-full text-center py-20 text-slate-500 bg-slate-100 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                       <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                       <p className="text-lg">No members found matching your search.</p>
                    </div>
                 )}
              </div>

              {/* Sidebar: Featured Sellers */}
              <div className="lg:col-span-1 space-y-6">
                 <div className="bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm dark:shadow-none">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                       <Star className="text-amber-500 dark:text-amber-400 fill-amber-500 dark:fill-amber-400" size={18} /> Top Sellers
                    </h3>
                    <div className="space-y-4">
                       {featuredSellers.map(seller => (
                          <div key={seller.id} className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-700 last:border-0 last:pb-0">
                             <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
                                {seller.name.charAt(0)}
                             </div>
                             <div>
                                <h4 className="font-medium text-slate-900 dark:text-slate-200 text-sm">{seller.name}</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-500">{seller.location}</p>
                             </div>
                          </div>
                       ))}
                    </div>
                    <button className="w-full mt-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 text-sm font-medium transition-colors">
                       View All Verified
                    </button>
                 </div>
                 
                 <div className="bg-linear-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/50 dark:to-purple-900/50 border border-indigo-100 dark:border-indigo-500/20 rounded-xl p-5">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Join Premium</h3>
                    <p className="text-sm text-indigo-800 dark:text-indigo-200 mb-4">Get verified badge and priority support.</p>
                    <button className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
                       Upgrade Now
                    </button>
                 </div>
              </div>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
           {marketListings.length > 0 ? (
              marketListings.map(item => (
                 <div key={item.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden group hover:border-emerald-500/50 transition-all shadow-sm dark:shadow-none">
                    <div className="h-48 overflow-hidden relative">
                       <img src={item.imageUrl} alt={item.fabricType} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                       <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs text-white font-medium border border-white/10">
                          {item.quantity} Kg
                       </div>
                    </div>
                    <div className="p-5">
                       <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white max-w-[70%] truncate">{item.fabricType} Waste</h3>
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">₹{item.price}/kg</span>
                       </div>
                       <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-4">
                           <Factory size={12} /> {item.shopName}
                       </p>
                       <button className="w-full py-2 bg-slate-100 dark:bg-slate-700 hover:bg-emerald-600 dark:hover:bg-emerald-600 hover:text-white dark:hover:text-white text-slate-600 dark:text-slate-300 rounded-lg transition-colors font-medium">
                          View Details
                       </button>
                    </div>
                 </div>
              ))
           ) : (
              <div className="col-span-full text-center py-20 text-slate-500">
                 No active listings in the marketplace right now.
              </div>
           )}
        </div>
      )}
    </div>
  );
}
