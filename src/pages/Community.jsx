import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Users, Search, MapPin, Factory, ShoppingBag, Filter, Bell, Tag, Star, ArrowRight, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Community() {
   const { users, listings, fetchCommunityMembers, fetchListings } = useApp();
   const [activeTab, setActiveTab] = useState('Members');
   const [memberFilter, setMemberFilter] = useState('All');
   const [searchTerm, setSearchTerm] = useState('');
   const [memberLoading, setMemberLoading] = useState(false);
   const [memberError, setMemberError] = useState('');
   const [verificationFilter, setVerificationFilter] = useState('All'); // All, Verified, Pending, Unverified

  // Fetch community members on mount
   useEffect(() => {
      const loadMembers = async () => {
         const hasCachedUsers = sessionStorage.getItem('retex_cache_users');
         const hasCachedListings = sessionStorage.getItem('retex_cache_listings');

         if (!hasCachedUsers && !hasCachedListings) setMemberLoading(true);
         setMemberError('');
         console.log('🔄 [Community Page] Fetching community members...');
         try {
            await Promise.all([
               fetchCommunityMembers(),
               fetchListings()
            ]);
         } catch (error) {
            console.error('❌ [Community Page] Error fetching members:', error);
            setMemberError('Unable to load community data. Please refresh and try again.');
         } finally {
            setMemberLoading(false);
         }
      };
      loadMembers();
   }, [fetchCommunityMembers, fetchListings]);

  // 1. Members Logic with Verification Filter
  const filteredUsers = users.filter(user => {
     const isBuyerOrFactory = user.role === 'Buyer' || user.role === 'Factory';
     const matchesTab = memberFilter === 'All' || user.role === memberFilter;
     const matchesSearch = (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                           (user.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (user.companyName || '').toLowerCase().includes(searchTerm.toLowerCase());
     
     let matchesVerification = true;
     if (verificationFilter === 'Verified') {
       matchesVerification = user.isVerified === true;
     } else if (verificationFilter === 'Pending') {
       matchesVerification = user.verificationStatus === 'pending';
     } else if (verificationFilter === 'Unverified') {
       matchesVerification = user.isVerified === false && user.verificationStatus !== 'pending';
     }
     
     return isBuyerOrFactory && matchesTab && matchesSearch && matchesVerification;
  });

  const stats = {
     factories: users.filter(u => u.role === 'Factory').length,
     buyers: users.filter(u => u.role === 'Buyer').length,
     verified: users.filter(u => (u.role === 'Buyer' || u.role === 'Factory') && u.isVerified === true).length,
     total: users.filter(u => u.role === 'Buyer' || u.role === 'Factory').length
  };

  // 2. Marketplace Logic (Community Selling)
  const marketListings = listings.filter(l => l.status === 'Live');
  
  // 3. Featured / Suggested Sellers (Top 3 Verified Factories)
  const featuredSellers = users.filter(u => u.role === 'Factory' && u.isVerified === true).sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0)).slice(0, 3);

  return (
    <>
         <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors duration-300">
            <div className="px-4 md:px-8 pt-8 pb-16 max-w-7xl mx-auto">
      
      {/* Main Header */}
      <div className="text-center mb-10 animate-in slide-in-from-top-4 duration-700">
         <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-semibold mb-4">
            <Users size={16} /> Community
         </div>
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
          <div className="bg-white dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl p-6 mb-10 transition-colors shadow-sm dark:shadow-none">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-4 text-center">
                   <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
                   <p className="text-xs text-slate-500 uppercase tracking-widest">Members</p>
                </div>
                <div className="rounded-xl border border-emerald-200/60 dark:border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-900/20 p-4 text-center">
                   <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.factories}</p>
                   <p className="text-xs text-emerald-700/70 dark:text-emerald-300/70 uppercase tracking-widest">Factories</p>
                </div>
                <div className="rounded-xl border border-blue-200/60 dark:border-blue-500/30 bg-blue-50/60 dark:bg-blue-900/20 p-4 text-center">
                   <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.buyers}</p>
                   <p className="text-xs text-blue-700/70 dark:text-blue-300/70 uppercase tracking-widest">Buyers</p>
                </div>
                <div className="rounded-xl border border-amber-200/60 dark:border-amber-500/30 bg-amber-50/60 dark:bg-amber-900/20 p-4 text-center">
                   <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.verified}</p>
                   <p className="text-xs text-amber-700/70 dark:text-amber-300/70 uppercase tracking-widest">Verified</p>
                </div>
             </div>

             <div className="mt-6 flex flex-col lg:flex-row gap-4 items-stretch">
                <div className="relative flex-1">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                   <input 
                      type="text" 
                      placeholder="Search by name, company, or location..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white pl-10 pr-4 py-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none w-full transition-colors"
                   />
                </div>
                <div className="flex flex-wrap gap-2">
                   {['All', 'Factory', 'Buyer'].map(filter => (
                      <button
                         key={filter}
                         onClick={() => setMemberFilter(filter)}
                         className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                            memberFilter === filter 
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                         }`}
                      >
                         {filter}
                      </button>
                   ))}
                </div>
                <div className="flex flex-wrap gap-2">
                   {['All', 'Verified', 'Pending', 'Unverified'].map(filter => (
                      <button
                         key={`verify-${filter}`}
                         onClick={() => setVerificationFilter(filter)}
                         className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                            verificationFilter === filter 
                            ? 'bg-amber-500 text-white border-amber-500 shadow-sm' 
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400'
                         }`}
                      >
                         {filter}
                      </button>
                   ))}
                </div>
             </div>
          </div>

               {memberLoading && (
                  <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[40vh]">
                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                  </div>
               )}

               {!memberLoading && memberError && (
                  <div className="max-w-3xl mx-auto bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-8 text-center">
                     {memberError}
                  </div>
               )}

               {!memberLoading && !memberError && (
               <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Member Grid */}
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                 {filteredUsers.map((user, idx) => (
                    <div 
                       key={user.id} 
                       className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 rounded-xl p-6 transition-all hover:shadow-xl hover:-translate-y-1 animate-in fade-in zoom-in-95 duration-500"
                       style={{ animationDelay: `${idx * 50}ms` }}
                    >
                       <div className="flex justify-between items-start mb-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${
                             user.role === 'Factory' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                          }`}>
                             {user.role === 'Factory' ? <Factory size={24} /> : <ShoppingBag size={24} />}
                          </div>
                          <div className="flex gap-2 flex-col items-end">
                            <span className={`px-2 py-1 rounded text-xs font-medium border ${
                               user.role === 'Factory' 
                               ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                               : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                            }`}>
                               {user.role}
                            </span>
                            {user.isVerified && (
                              <span className="px-2 py-1 rounded text-xs font-medium border bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 flex items-center gap-1">
                                <CheckCircle2 size={12} /> Verified
                              </span>
                            )}
                            {user.verificationStatus === 'pending' && (
                              <span className="px-2 py-1 rounded text-xs font-medium border bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 flex items-center gap-1">
                                <Clock size={12} /> Pending
                              </span>
                            )}
                            {!user.isVerified && user.verificationStatus !== 'pending' && (
                              <span className="px-2 py-1 rounded text-xs font-medium border bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20 flex items-center gap-1">
                                <AlertCircle size={12} /> Unverified
                              </span>
                            )}
                          </div>
                       </div>
                       
                                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{user.name}</h3>
                                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                                     Company: <span className="text-slate-700 dark:text-slate-300">{user.companyName || 'N/A'}</span>
                                  </p>
                       <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm mb-4">
                          <MapPin size={14} className="mr-1" /> {user.location || 'India'}
                       </div>
                       
                       {user.averageRating > 0 && (
                         <div className="flex items-center gap-1 text-sm mb-4 text-amber-600 dark:text-amber-400">
                           <Star size={14} className="fill-current" />
                           <span className="font-medium">{user.averageRating.toFixed(1)}</span>
                           <span className="text-slate-500">({user.totalReviews} reviews)</span>
                         </div>
                       )}
                       
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
                             <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium text-slate-900 dark:text-slate-200 text-sm truncate">{seller.name}</h4>
                                  {seller.isVerified && <CheckCircle2 size={14} className="text-green-600 dark:text-green-400 shrink-0 fill-green-600 dark:fill-green-400" />}
                                </div>
                                                <div className="flex items-center gap-2">
                                                   <p className="text-xs text-slate-500 dark:text-slate-500">{seller.companyName || 'N/A'}</p>
                                  {seller.averageRating > 0 && (
                                    <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                                      <Star size={10} className="fill-current" /> {seller.averageRating.toFixed(1)}
                                    </span>
                                  )}
                                </div>
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
          )}
        </>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4">
           <div className="flex items-center justify-between mb-6">
              <div>
                 <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Community Marketplace</h2>
                 <p className="text-slate-500 dark:text-slate-400 text-sm">Live listings from verified factories</p>
              </div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
                 {marketListings.length} Listings
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {marketListings.length > 0 ? (
                 marketListings.map(item => (
                    <div key={item.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden group hover:border-emerald-500/50 transition-all shadow-sm dark:shadow-none">
                       <div className="h-48 overflow-hidden relative">
                          <img src={item.imageUrl} alt={item.fabricType} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-2.5 py-1 rounded-full text-xs text-slate-700 dark:text-slate-200 font-semibold">
                             {item.fabricType}
                          </div>
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
                          <button className="w-full py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-emerald-600 dark:hover:bg-emerald-600 hover:text-white dark:hover:text-white text-slate-700 dark:text-slate-200 rounded-xl transition-colors font-semibold">
                             View Details
                          </button>
                       </div>
                    </div>
                 ))
              ) : (
                 <div className="col-span-full text-center py-20 text-slate-500 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                    No active listings in the marketplace right now.
                 </div>
              )}
           </div>
        </div>
      )}
        </div>
      </div>
      <Footer />
    </>
  );
}
