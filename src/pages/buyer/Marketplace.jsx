import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ShoppingCart, MapPin, TrendingUp, Sparkles, Package, Star, Clock, ShieldCheck, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import cottonImg from '../../assets/cotton_fabric.png';
import polyesterImg from '../../assets/polyester_fabric.png';
import blendedImg from '../../assets/blended_fabric.png';

export default function Marketplace() {
  const { user, listings, purchaseListing, settings, initiatePayment, fetchListings } = useApp();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [purchasingId, setPurchasingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('recent'); // recent, price-low, price-high, quantity
  
  // Fetch listings on mount
  useEffect(() => {
    const loadListings = async () => {
      // Check if we have cached data - if yes, don't show loader
      const hasData = listings && listings.length > 0;
      
      if (!hasData) {
        setLoading(true);
      }
      
      try {
        console.log('📥 [Marketplace] Fetching listings...');
        await fetchListings();
        console.log('✅ [Marketplace] Listings fetched successfully');
      } catch (error) {
        console.error('❌ [Marketplace] Failed to load listings:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Load listings when component mounts
    loadListings();
  }, []);
  
  const categories = ['All', ...(settings?.categories || ['Cotton', 'Polyester', 'Silk', 'Wool', 'Blended'])];

  // Strict filtering for valid, live listings from DB
  // Accept listings with 'Live' status OR any truthy status if quantity > 0
  const liveListings = listings.filter(l => {
    const isAvailable = l.quantity > 0;
    const isLive = l.status && (l.status === 'Live' || l.status === 'live' || l.status === 'Pending' || l.status === 'pending');
    return isAvailable && isLive;
  });
  
  // Debug logging
  console.log('📊 [Marketplace] Total listings:', listings.length, 'Live listings:', liveListings.length);

  const filteredListings = liveListings.filter(l => {
    // Safety check for fields
    const type = l.fabricType || '';
    const category = l.fabricCategory || 'Other';
    const location = l.location || '';
    const shop = l.shopName || '';

    const matchesCategory = filter === 'All' || 
                           type.toLowerCase().includes(filter.toLowerCase()) || 
                           category === filter;
                           
    const matchesSearch = type.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          shop.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    switch(sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'quantity':
        return b.quantity - a.quantity;
      default: // recent
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }
  });

  const handleBuy = async (listing) => {
    if (!user) {
        alert("Please log in to purchase listings");
        return;
    }

    if (listing.status === 'Sold') {
      alert("This item has already been sold");
      return;
    }
    
    const totalPrice = Math.round(listing.price * listing.quantity * 100) / 100;
    if (confirm(`Confirm purchase of ${listing.quantity}kg ${listing.fabricType} for ₹${totalPrice.toLocaleString()}?`)) {
        setPurchasingId(listing.id);
        try {
            console.log("💳 [handleBuy] Initiating payment for listing:", listing.id, "Amount:", totalPrice);
            
            // Initialize Razorpay directly
            const options = {
              key: import.meta.env.VITE_RAZORPAY_KEY,
              amount: Math.round(totalPrice * 100), // Convert to paise
              currency: 'INR',
              name: 'ReTexValue',
              description: `Purchase ${listing.quantity}kg ${listing.fabricType}`,
              prefill: {
                name: user.name || user.email || 'Buyer',
                email: user.email || '',
                contact: user.phone || ''
              },
              notes: {
                listingId: listing.id,
                fabricType: listing.fabricType,
                quantity: listing.quantity,
                buyerId: user.id
              },
              theme: {
                color: '#10b981'
              },
              handler: async function(response) {
                try {
                  console.log("✅ Payment successful:", response);
                  console.log("🔐 User info - ID:", user?.id, "Email:", user?.email);
                  
                  // Validate user authentication
                  if (!user?.id || !user?.email) {
                    console.error("❌ User not properly authenticated");
                    alert("⚠️ Payment successful but user session invalid. Please log in again and contact support with ID: " + response.razorpay_payment_id);
                    setPurchasingId(null);
                    return;
                  }

                  // Calculate commission as decimal
                  const platformFee = settings?.platformFee || 5;
                  const commission = parseFloat((totalPrice * platformFee / 100).toFixed(2));
                  
                  console.log("💳 Transaction details:", {
                    listing_id: listing.id,
                    buyer_id: user.id,
                    amount: totalPrice,
                    commission: commission,
                    payment_id: response.razorpay_payment_id
                  });

                  const withTimeout = (promise, ms, label) => Promise.race([
                    promise,
                    new Promise((_, reject) => setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms))
                  ]);

                  console.log("📡 Processing payment in backend...");
                  const { data: rpcData, error: rpcError } = await withTimeout(
                    supabase.rpc('process_payment', {
                      p_listing_id: listing.id,
                      p_payment_id: response.razorpay_payment_id,
                      p_amount: parseFloat(totalPrice.toFixed(2)),
                      p_commission: commission
                    }),
                    20000,
                    "Payment processing"
                  );

                  if (rpcError) {
                    console.error("❌ Backend payment error:", rpcError);
                    let errorMsg = "Payment successful but order processing failed.";
                    if (rpcError.message?.includes('Duplicate payment id')) {
                      errorMsg = "Payment already processed. Please refresh your orders.";
                    } else if (rpcError.message?.includes('Listing not found or not Live')) {
                      errorMsg = "Listing already sold or unavailable.";
                    } else if (rpcError.message?.includes('Not authenticated')) {
                      errorMsg = "Session expired. Please log in again.";
                    }

                    alert(`⚠️ ${errorMsg}\n\nPayment ID: ${response.razorpay_payment_id}`);
                    setPurchasingId(null);
                    return;
                  }

                  console.log("✅ Payment processed in backend", rpcData);

                  // Update context cache by refetching listings
                  await fetchListings();

                  // Clear purchasing state BEFORE navigation
                  setPurchasingId(null);

                  // Show success message
                  alert(`✅ Purchase Successful!\n\nPayment ID: ${response.razorpay_payment_id}\nAmount: ₹${totalPrice.toLocaleString()}\nQuantity: ${listing.quantity}kg`);
                  
                  // Redirect to orders page
                  navigate('/buyer/orders');
                } catch (err) {
                  console.error("❌ Payment handler error:", err);
                  console.error("Error stack:", err.stack);
                  alert("❌ Payment successful but order processing failed.\nPayment ID: " + response.razorpay_payment_id + "\n\nPlease contact support.");
                  setPurchasingId(null);
                }
              },
              modal: {
                ondismiss: function() {
                  console.log("Payment modal closed");
                  setPurchasingId(null);
                }
              }
            };

            // Load and initialize Razorpay
            if (!window.Razorpay) {
              const script = document.createElement('script');
              script.src = 'https://checkout.razorpay.com/v1/checkout.js';
              script.async = true;
              script.onload = () => {
                try {
                  const rzp = new window.Razorpay(options);
                  rzp.on('payment.failed', function(response) {
                    console.error("❌ Payment failed:", response);
                    const errorMsg = response.error?.reason || 'Unknown error';
                    const errorCode = response.error?.code || 'N/A';
                    alert(`❌ Payment Failed\n\nError: ${errorMsg}\nCode: ${errorCode}\n\nPlease try again or use a different payment method.`);
                    setPurchasingId(null);
                  });
                  rzp.open();
                } catch (e) {
                  console.error("❌ Razorpay initialization error:", e);
                  alert("Failed to initialize payment gateway: " + e.message);
                  setPurchasingId(null);
                }
              };
              script.onerror = () => {
                console.error("Failed to load Razorpay script");
                alert("Failed to load payment gateway. Please refresh and try again.");
                setPurchasingId(null);
              };
              document.body.appendChild(script);
            } else {
              try {
                const rzp = new window.Razorpay(options);
                rzp.on('payment.failed', function(response) {
                  console.error("❌ Payment failed:", response);
                  const errorMsg = response.error?.reason || 'Unknown error';
                  const errorCode = response.error?.code || 'N/A';
                  alert(`❌ Payment Failed\n\nError: ${errorMsg}\nCode: ${errorCode}\n\nPlease try again or use a different payment method.`);
                  setPurchasingId(null);
                });
                rzp.open();
              } catch (e) {
                console.error("❌ Razorpay initialization error:", e);
                alert("Failed to open payment gateway: " + e.message);
                setPurchasingId(null);
              }
            }

        } catch (err) {
            console.error("❌ [handleBuy] Purchase error:", err);
            alert("❌ Purchase failed: " + (err.message || "Unknown error"));
            setPurchasingId(null);
        }
    }
  };

  // Debug: Log current state
  useEffect(() => {
    console.log('🔍 [Marketplace] Component state:', {
      loading,
      listingsCount: listings?.length,
      liveListingsCount: liveListings?.length,
      hasData: listings && listings.length > 0
    });
  }, [listings, loading]);

  // Show loader only if we're fetching AND we have no data
  if (loading && (!listings || listings.length === 0)) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 min-h-screen pb-16 px-4">
      {/* Header */}
      <div className="pt-8">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-2">
          Textile <span className="text-emerald-600 dark:text-emerald-400">Marketplace</span>
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg">Discover premium recycled textiles from verified factories</p>
      </div>

      {/* Search & Stats Bar */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Search by material, location, or factory..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button 
              onClick={() => navigate('/buyer/bulk-request')}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-all whitespace-nowrap"
            >
              Bulk Request
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Sparkles size={24} />
            <ShieldCheck size={24} />
          </div>
          <p className="text-3xl font-bold">{liveListings.length}</p>
          <p className="text-emerald-100 text-sm">Active Listings</p>
        </div>
      </div>

      {/* Categories & Sort Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-lg">
         <div className="flex gap-2 overflow-x-auto w-full md:w-auto scrollbar-hide">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                  filter === c 
                    ? 'bg-emerald-600 text-white shadow-md' 
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {c}
              </button>
            ))}
         </div>
         
         <div className="flex items-center gap-2">
           <Filter size={18} className="text-slate-400" />
           <select 
             value={sortBy}
             onChange={(e) => setSortBy(e.target.value)}
             className="px-4 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
           >
             <option value="recent">Recent First</option>
             <option value="price-low">Price: Low to High</option>
             <option value="price-high">Price: High to Low</option>
             <option value="quantity">Highest Quantity</option>
           </select>
         </div>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredListings.map(listing => (
           <div key={listing.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group flex flex-col">
              {/* Image */}
              <div className="relative h-56 overflow-hidden bg-slate-100 dark:bg-slate-900">
                  <img 
                     src={listing.imageUrl || blendedImg} 
                     alt={listing.fabricType} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      onError={(e) => {
                         e.target.onerror = null; 
                         const type = (listing.fabricType || '').toLowerCase();
                         if(type.includes('cotton')) e.target.src = cottonImg;
                         else if(type.includes('poly')) e.target.src = polyesterImg;
                         else e.target.src = blendedImg;
                      }}
                   />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                 
                 {/* Category Badge */}
                 <div className="absolute top-4 left-4">
                    <span className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-slate-900 dark:text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg">
                       {listing.fabricCategory || 'Textile'}
                    </span>
                 </div>

                 {/* AI Confidence Badge */}
                 {listing.aiConfidence && (
                   <div className="absolute top-4 right-4">
                      <span className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold backdrop-blur-sm shadow-lg ${
                         listing.aiConfidence > 80 
                         ? 'bg-emerald-500/90 text-white' 
                         : 'bg-amber-500/90 text-white'
                      }`}>
                         <Star size={12} /> {listing.aiConfidence}%
                      </span>
                   </div>
                 )}

                 {/* Title Overlay */}
                 <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="font-bold text-xl text-white leading-tight">{listing.fabricType}</h3>
                    <div className="flex items-center gap-1 text-xs text-white/90 mt-1">
                       <MapPin size={14} /> {listing.location?.split(',')[0] || 'India'}
                    </div>
                 </div>
              </div>
              
              {/* Details */}
              <div className="p-6 flex-1 flex flex-col">
                 {/* Price & Quantity */}
                 <div className="flex justify-between items-start mb-6">
                    <div>
                       <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Price per kg</p>
                       <p className="text-2xl font-bold text-slate-900 dark:text-white">₹{listing.price}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Available</p>
                       <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{listing.quantity} kg</p>
                    </div>
                 </div>

                 {/* Info Grid */}
                 <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg">
                       <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Quality</p>
                       <p className="text-sm font-semibold text-slate-900 dark:text-white">Grade A</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg">
                       <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                         <Clock size={12} /> Delivery
                       </p>
                       <p className="text-sm font-semibold text-slate-900 dark:text-white">24-48h</p>
                    </div>
                 </div>

                 {/* Action Buttons */}
                 <div className="mt-auto space-y-2">
                    <button
                      onClick={() => handleBuy(listing)}
                      disabled={purchasingId === listing.id || listing.status === 'Sold'}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      {purchasingId === listing.id ? (
                         <>
                           <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                           Processing...
                         </>
                      ) : listing.status === 'Sold' ? (
                         <>
                           <CheckCircle size={18} /> Sold Out
                         </>
                      ) : (
                         <>
                           <ShoppingCart size={18} /> Purchase Now
                         </>
                      )}
                    </button>
                    <button
                      onClick={() => navigate('/buyer/bulk-request')}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      <Package size={18} /> Bulk Request
                    </button>
                 </div>
              </div>
           </div>
        ))}
        
        {filteredListings.length === 0 && (
           <div className="col-span-full py-20 text-center">
             <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
               <Package size={40} className="text-slate-400" />
             </div>
             <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No Listings Found</h3>
             <p className="text-slate-500 dark:text-slate-400 mb-6">Try adjusting your filters or search query</p>
             <button 
               onClick={() => {setFilter('All'); setSearchQuery('');}} 
               className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-all"
             >
                Clear Filters
             </button>
           </div>
        )}
      </div>
    </div>
  );
}
