import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import cottonImg from '../assets/cotton_fabric.png';
import polyesterImg from '../assets/polyester_fabric.png';
import blendedImg from '../assets/blended_fabric.png';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { id, name, role: 'factory' | 'buyer' | 'admin' }
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [bulkRequests, setBulkRequests] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [reports, setReports] = useState([]);
  const [settings, setSettings] = useState(null);
  const [packages, setPackages] = useState([]);

  // New States for Features
  const [approvalHistory, setApprovalHistory] = useState([]);
  
  const [notices, setNotices] = useState([
     { id: 1, title: 'Welcome to ReTexValue!', content: 'We are thrilled to launch our beta platform. Connect, trade, and recycle!', date: '2023-11-20', type: 'info' },
     { id: 2, title: 'Maintenance Update', content: 'Scheduled maintenance on Dec 1st from 2AM to 4AM.', date: '2023-11-28', type: 'alert' }
  ]);
  
  // Theme Management
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const fetchBulkRequests = async () => {
      try {
          const { data, error } = await supabase
            .from('bulk_requests')
            .select('*')
            .order('created_at', { ascending: false });

          if(error) throw error;

          if(data) {
              const mappedRequests = data.map(r => ({
                  id: r.id,
                  fabricCategory: r.fabric_type || 'Unknown', 
                  fabricType: r.fabric_type || 'Unknown',
                  quantity: r.quantity,
                  targetPrice: r.target_price,
                  deadline: r.deadline,
                  description: r.description,
                  buyerName: r.buyer_id ? `Buyer ${r.buyer_id.slice(0,4)}` : 'Guest Buyer',
                  status: r.status,
                  buyerId: r.buyer_id
              }));
              setBulkRequests(mappedRequests);
          }
      } catch (error) {
          console.error("Failed to fetch bulk requests:", error.message);
      }
  };

  const fetchSettings = async () => {
      try {
          const { data, error } = await supabase
            .from('settings')
            .select('*');
            
          if (error) throw error;
          
          const fee = data.find(s => s.key === 'platform_fee')?.value || 1.5;
          const mode = data.find(s => s.key === 'maintenance_mode')?.value === 'true';
          const cats = data.find(s => s.key === 'supported_categories')?.value?.split(',') || [];

          setSettings({
                 platformFee: fee,
                 maintenanceMode: mode,
                 categories: cats.length > 0 ? cats : ['Cotton', 'Polyester']
          });

      } catch (error) {
          console.error("Failed to fetch settings:", error.message);
          setSettings({ platformFee: 1.5, maintenanceMode: false, categories: [] });
      }
  };

  const updateSettings = async (newSettings) => {
      try {
          const updates = [
              { key: 'platform_fee', value: String(newSettings.platformFee) },
              { key: 'maintenance_mode', value: String(newSettings.maintenanceMode) },
          ];
          
          const { error } = await supabase.from('settings').upsert(updates, { onConflict: 'key' });
          if(error) throw error;

          setSettings(newSettings);
          alert("Settings updated successfully!");
      } catch (error) {
          console.error("Failed to update settings:", error.message);
      }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const mappedUsers = data.map(u => ({
          id: u.id,
          name: u.full_name || u.username || 'Unknown',
          email: u.email,
          role: u.role ? u.role.charAt(0).toUpperCase() + u.role.slice(1) : 'Buyer',
          status: u.status || 'Pending',
          joinDate: u.created_at ? new Date(u.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          location: u.location || 'N/A',
          phone: u.phone || 'N/A',
          type: u.type || 'Standard'
        }));
        setUsers(mappedUsers);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error.message);
    }
  };

  const fetchReports = async () => {
    try {
        const { data, error } = await supabase.from('reports').select('*').order('created_at', { ascending: false });
        if(error) throw error;
        setReports(data);
    } catch (error) {
        console.error("Failed to fetch reports:", error.message);
    }
  };
  
  const generateReport = async (name, type) => {
      try {
          const { data, error } = await supabase.from('reports').insert([{
              title: name,
              type: type,
              link: '#', 
              generated_by: user?.id
          }]).select().single();

          if(error) throw error;
          setReports([data, ...reports]);
      } catch (error) {
          console.error("Failed to generate report:", error.message);
      }
  };
  
  const fetchListings = async () => {
      try {
        const { data, error } = await supabase
            .from('listings')
            .select('*')
            .order('created_at', { ascending: false });

        if(error) throw error;

        if(data) {
            const mappedListings = data.map(l => ({
                id: l.id,
                factoryId: l.factory_id || 'factory_unknown',
                imageUrl: l.image_url || 'https://via.placeholder.com/150',
                fabricType: l.fabric_type || 'Unknown',
                shopName: l.shop_name || 'Unknown',
                contact: l.contact || 'N/A',
                email: l.email || 'N/A',
                quantity: l.quantity || 0,
                price: l.price || 0,
                location: l.location || 'N/A',
                date: l.created_at ? new Date(l.created_at).toISOString().split('T')[0] : 'N/A',
                status: l.status || 'Pending',
                aiConfidence: l.ai_confidence || 0,
                description: l.description
            }));
            setListings(mappedListings);
        }
      } catch (error) {
          console.error("Failed to fetch listings:", error.message);
      }
  };

  const fetchTransactions = async () => {
      try {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if(data) {
            const mappedTransactions = data.map(t => ({
                id: t.id,
                listingId: t.listing_id,
                buyerId: t.buyer_id,
                sellerId: t.seller_id, 
                amount: t.amount,
                commission: t.commission || (t.amount * (settings?.platformFee || 5) / 100),
                date: t.created_at ? new Date(t.created_at).toISOString().split('T')[0] : 'N/A',
                status: t.status || 'Completed'
            }));
            setTransactions(mappedTransactions);
        }
      } catch (error) {
          console.error("Failed to fetch transactions:", error.message);
      }
  };

  const deleteUser = async (id) => {
      if(!window.confirm("Are you sure? This will delete the user profile. They won't be able to log in.")) return;
      try {
          // Bypass DB for mock users
          if (typeof id === 'string' && !id.includes('-')) {
              setUsers(users.filter(u => u.id !== id));
              return;
          }

          const { error } = await supabase
             .from('profiles')
             .delete()
             .eq('id', id);

          if(error) throw error;
          setUsers(users.filter(u => u.id !== id));
      } catch (error) {
           console.error("Delete user failed:", error);
           alert("Could not delete user. It may be linked to transaction history.");
      }
  };

  const updateUserStatus = async (id, status, userName) => {
      try {
          // If Mock User (ID is number or doesnt look like UUID), skip DB
          if (typeof id === 'string' && id.includes('-')) {
             const { error } = await supabase
              .from('profiles')
              .update({ status })
              .eq('id', id);

             if(error) throw error;
          }
          
          setUsers(users.map(u => u.id === id ? { ...u, status } : u));
          logApprovalAction(userName, 'System', status); // Log action
      } catch (error) {
          console.error("Failed to update user status:", error.message);
          alert("Failed to update status in database");
      }
  };

  const updateUser = async (id, updates) => {
      try {
           // If Mock User, skip DB
           if (typeof id === 'string' && id.includes('-')) {
               const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', id);

               if(error) throw error;
           }

           setUsers(users.map(u => u.id === id ? { ...u, ...updates } : u));
      } catch (error) {
          console.error("Failed to update user:", error.message);
          alert("Failed to update user details");
      }
  };

  const updateListingStatus = async (id, status) => {
      try {
          // Bypass DB for mock listings
          if (typeof id === 'string' && id.startsWith('mock')) {
              setListings(listings.map(l => l.id === id ? { ...l, status } : l));
              return;
          }

          const { error } = await supabase
            .from('listings')
            .update({ status })
            .eq('id', id);

          if(error) throw error;
          setListings(listings.map(l => l.id === id ? { ...l, status } : l));
      } catch (error) {
          console.error("Failed to update listing status:", error.message);
      }
  };

  const updateListing = async (id, updates) => {
      try {
          // Bypass DB for mock listings
          if (typeof id === 'string' && id.startsWith('mock')) {
              setListings(listings.map(l => l.id === id ? { ...l, ...updates } : l));
              alert("Listing updated successfully (Local)");
              return;
          }

          // Map frontend keys to DB keys if necessary
          const dbUpdates = {};
          if (updates.fabricType) dbUpdates.fabric_type = updates.fabricType;
          if (updates.quantity) dbUpdates.quantity = updates.quantity;
          if (updates.price) dbUpdates.price = updates.price;
          if (updates.description) dbUpdates.description = updates.description;
          if (updates.location) dbUpdates.location = updates.location;
          
          if (Object.keys(dbUpdates).length === 0) return;

          const { error } = await supabase
            .from('listings')
            .update(dbUpdates)
            .eq('id', id);

          if(error) throw error;
          
          setListings(listings.map(l => l.id === id ? { ...l, ...updates } : l));
          alert("Listing updated successfully");
      } catch (error) {
          console.error("Failed to update listing:", error.message);
          alert("Failed to update listing");
      }
  };

  const deleteListing = async (id) => {
      if(!window.confirm("Are you sure you want to permanently delete this listing?")) return;
      
      try {
          // Bypass DB for mock listings
          if (typeof id === 'string' && id.startsWith('mock')) {
              setListings(listings.filter(l => l.id !== id));
              return;
          }

          const { error } = await supabase
            .from('listings')
            .delete()
            .eq('id', id);

          if(error) throw error;
          
          setListings(listings.filter(l => l.id !== id));
      } catch (error) {
          console.error("Failed to delete listing:", error.message);
          alert("Failed to delete listing");
      }
  };

  const fetchProposals = async () => {
    try {
        const { data, error } = await supabase
            .from('proposals')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if(data) {
            const mappedProposals = data.map(p => ({
                id: p.id,
                requestId: p.request_id,
                fabricType: p.request_title || 'Unknown',
                requestTitle: p.request_title,
                quantity: Math.round(p.total_price / (p.price_per_kg || 1)), 
                priceQuoted: p.price_per_kg,
                totalPrice: p.total_price,
                deliveryDate: p.delivery_date,
                buyer: `Buyer ${p.buyer_id.slice(0,4)}`, 
                buyerId: p.buyer_id,
                factoryId: p.factory_id,
                factoryName: p.factory_name || 'Factory',
                status: p.status,
                message: p.message,
                date: new Date(p.created_at).toISOString().split('T')[0]
            }));
            setProposals(mappedProposals);
        }
    } catch (error) {
        console.error("Failed to fetch proposals:", error.message);
    }
  };

  useEffect(() => {
    // specific auth check function
    const checkUser = async () => {
      try {
          const storedMock = localStorage.getItem('mockUser');
          if (storedMock) {
              const mu = JSON.parse(storedMock);
              setUser(mu);
              setLoading(false);
              fetchInitialData();
              return;
          }

          // ⏱️ Add timeout to prevent infinite loading
          const timeoutPromise = new Promise((_, reject) => {
              setTimeout(() => reject(new Error('Auth check timed out')), 10000);
          });

          const authCheckPromise = (async () => {
              const { data: { session } } = await supabase.auth.getSession();

              if (session?.user) {
                const { data: profile } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', session.user.id)
                  .single();
                  
                if (profile) {
                    // ✨ Enhanced avatar URL handling with cache-busting for Supabase Storage
                    let avatarUrl = profile.avatar_url || '';
                    if (avatarUrl && avatarUrl.startsWith('http') && avatarUrl.includes('supabase') && !avatarUrl.includes('?t=')) {
                        avatarUrl = `${avatarUrl}?t=${Date.now()}`;
                        console.log('🖼️ [Avatar] Cache-busted avatar URL on initial load:', avatarUrl);
                    }
                    
                    const userData = {
                        id: session.user.id,
                        email: session.user.email,
                        full_name: profile.full_name || '',
                        username: profile.username || '',
                        phone: profile.phone || '',
                        address: profile.address || '',
                        location: profile.location || '',
                        company_name: profile.company_name || '',
                        gst_number: profile.gst_number || '',
                        role: profile.role || 'buyer',
                        avatar_url: avatarUrl,
                        notifications_email: profile.notifications_email ?? true,
                        notifications_push: profile.notifications_push ?? true,
                        notifications_listings: profile.notifications_listings ?? false,
                        ...profile,
                        name: profile.full_name || profile.username || ''
                    };
                    
                    console.log('👤 [Auth] User profile loaded:', {
                        id: userData.id,
                        name: userData.full_name,
                        avatar: userData.avatar_url ? '✅ Has Avatar' : '❌ No Avatar',
                        role: userData.role
                    });
                    
                    setUser(userData);
                    localStorage.setItem('userRole', profile.role);
                    fetchInitialData();
                } else {
                 localStorage.removeItem('userRole');
                }
              }
          })();

          // Race between auth check and timeout
          await Promise.race([authCheckPromise, timeoutPromise]);

      } catch (error) {
          if (error.message === 'Auth check timed out') {
              console.warn('⚠️ [Auth] Supabase connection timed out - showing login');
              
              // Check if we have a stored role - if so, create mock user to let them in
              const storedRole = localStorage.getItem('userRole');
              if (storedRole) {
                  console.log('🔓 [Offline] Using cached session');
                  const offlineUser = {
                      id: 'offline-' + Date.now(),
                      name: 'Offline User',
                      role: storedRole,
                      email: 'offline@retexvalue.com',
                      full_name: 'Offline Mode',
                      isOffline: true
                  };
                  setUser(offlineUser);
              }
          } else {
              console.error("❌ [Auth] Check failed:", error);
          }
      } finally {
          setLoading(false);
      }
    };

    const fetchInitialData = () => {
        fetchUsers();
        fetchListings();
        fetchTransactions();
        fetchReports();
        fetchBulkRequests();
        fetchProposals();
        fetchSettings();
        fetchPackages();
    };

    checkUser();

    // Listen for changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
          const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

          if (profile) {
            // ✨ Enhanced avatar URL handling with cache-busting
            let avatarUrl = profile.avatar_url || '';
            if (avatarUrl && avatarUrl.startsWith('http') && avatarUrl.includes('supabase') && !avatarUrl.includes('?t=')) {
                avatarUrl = `${avatarUrl}?t=${Date.now()}`;
            }
            
            const userData = {
                id: session.user.id,
                email: session.user.email,
                full_name: profile.full_name || '',
                username: profile.username || '',
                phone: profile.phone || '',
                address: profile.address || '',
                location: profile.location || '',
                company_name: profile.company_name || '',
                gst_number: profile.gst_number || '',
                role: profile.role || 'buyer',
                avatar_url: avatarUrl,
                notifications_email: profile.notifications_email ?? true,
                notifications_push: profile.notifications_push ?? true,
                notifications_listings: profile.notifications_listings ?? false,
                ...profile,
                name: profile.full_name || profile.username || ''
            };
            setUser(userData);
            localStorage.setItem('userRole', profile.role); 
            localStorage.removeItem('mockUser');
            fetchInitialData();
          }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('mockUser');
        localStorage.removeItem('userRole');
      }
    });

    return () => {
      if (authListener?.subscription) authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (role, credentials) => {
    if (typeof role === 'object') {
        setUser(role);
        localStorage.setItem('userRole', role.role);
        return;
    }
    const mockUser = { id: 'mock', name: 'Mock User', role: role, email: 'mock@test.com' };
    setUser(mockUser);
    localStorage.setItem('mockUser', JSON.stringify(mockUser));
    localStorage.setItem('userRole', role);
  };

  const logout = async () => {
      try {
          setUser(null);
          localStorage.removeItem('mockUser');
          localStorage.removeItem('userRole');
          await supabase.auth.signOut();
      } catch (err) {
          console.error("Logout error:", err);
      } finally {
          localStorage.clear();
          sessionStorage.clear();
          setUser(null);
      }
  };

  const addListing = async (listing) => {
    try {
        const factoryId = listing.factoryId || user?.id;
        
        // Handle Mock User Persistence (bypassing DB for 'mock' ID)
        if (factoryId === 'mock') {
            const newListing = {
                id: `mock_lot_${Date.now()}`,
                factoryId: 'mock',
                imageUrl: listing.imageUrl,
                fabricType: listing.fabricType,
                shopName: listing.shopName || 'Mock Facility',
                email: listing.email || 'mock@factory.com',
                quantity: listing.quantity,
                price: listing.price,
                location: listing.location,
                date: new Date().toISOString().split('T')[0],
                status: 'Pending',
                aiConfidence: listing.aiConfidence
            };
            setListings([newListing, ...listings]);
            return;
        }

        const { data, error } = await supabase.from('listings').insert([{
            factory_id: factoryId,
            image_url: listing.imageUrl, 
            fabric_type: listing.fabricType,
            quantity: listing.quantity,
            price: listing.price,
            description: listing.description,
            shop_name: listing.shopName,
            email: listing.email,
            location: listing.location,
            ai_confidence: listing.aiConfidence,
            status: 'Pending'
        }]).select().single();

        if (error) throw error;

        if (data) {
            const l = data;
            const newListing = {
                id: l.id,
                factoryId: l.factory_id,
                imageUrl: l.image_url,
                fabricType: l.fabric_type,
                shopName: l.shop_name,
                email: l.email,
                quantity: l.quantity,
                price: l.price,
                location: l.location,
                date: new Date(l.created_at).toISOString().split('T')[0],
                status: l.status,
                aiConfidence: l.ai_confidence
            };
            setListings([newListing, ...listings]);
        }
    } catch (error) {
        console.error("Failed to add listing:", error.message);
    }
  };

  const purchaseListing = async (listing) => {
    try {
        const amount = listing.quantity * listing.price;
        const commission = amount * (settings?.platformFee || 5) / 100;
        const buyerId = user?.id;

        if(!buyerId) return;

        // Mock Transaction
        if (buyerId === 'mock') {
            const newTxn = {
                id: `mock_txn_${Date.now()}`,
                listingId: listing.id,
                buyerId: 'mock',
                amount,
                commission,
                date: new Date().toISOString().split('T')[0],
                status: 'Completed'
            };
            setTransactions([newTxn, ...transactions]);
            setListings(listings.map(l => l.id === listing.id ? { ...l, status: 'Sold' } : l));
            return;
        }

        const { data, error } = await supabase.from('transactions').insert([{
             listing_id: listing.id,
             buyer_id: buyerId,
             amount,
             commission,
             status: 'Completed'
        }]).select().single();

        if (error) throw error;
        
        await updateListingStatus(listing.id, 'Sold');

        if(data) {
            const newTxn = {
                id: data.id,
                listingId: listing.id,
                buyerId,
                amount,
                commission,
                date: new Date().toISOString().split('T')[0],
                status: 'Completed'
            };
            setTransactions([newTxn, ...transactions]);
        }
    } catch (error) {
        console.error("Failed to purchase listing:", error.message);
    }
  };

  const addBulkRequest = async (request) => {
    try {
        const buyerId = user?.id;
        
        // Mock Bulk Request
        if (buyerId === 'mock') {
            const newRequest = {
                id: `mock_req_${Date.now()}`,
                fabricType: request.fabricType,
                quantity: request.quantity,
                targetPrice: request.targetPrice,
                deadline: request.deadline,
                description: request.description,
                status: 'Open',
                buyerName: user?.name || 'Mock Buyer',
                buyerId: 'mock'
            };
            setBulkRequests([newRequest, ...bulkRequests]);
            return;
        }

        const { data, error } = await supabase.from('bulk_requests').insert([{
             buyer_id: buyerId,
             fabric_type: request.fabricType,
             quantity: request.quantity,
             target_price: request.targetPrice,
             deadline: request.deadline,
             description: request.description,
             status: 'Open'
        }]).select().single();

        if (error) throw error;

        if(data) {
            const r = data;
            const newRequest = {
                id: r.id,
                fabricType: r.fabric_type,
                quantity: r.quantity,
                targetPrice: r.target_price,
                deadline: r.deadline,
                description: r.description,
                status: r.status,
                buyerName: user?.name || 'Me',
                buyerId: user?.id
            };
            setBulkRequests([newRequest, ...bulkRequests]);
        }
    } catch (error) {
        console.error("Failed to add bulk request:", error.message);
    }
  };

  const submitProposal = async (proposal) => {
    try {
        const factoryId = user?.id;

        // Mock Proposal
        if (factoryId === 'mock') {
            const newProposal = {
                id: `mock_prop_${Date.now()}`,
                requestId: proposal.requestId,
                fabricType: proposal.requestTitle,
                requestTitle: proposal.requestTitle,
                quantity: proposal.quantity,
                priceQuoted: proposal.priceQuoted,
                totalPrice: proposal.totalPrice,
                deliveryDate: proposal.deliveryDate,
                buyer: proposal.buyer,
                buyerId: proposal.buyerId,
                factoryId: 'mock',
                factoryName: user?.name || 'Mock Factory',
                status: 'Pending',
                message: proposal.message,
                date: new Date().toISOString().split('T')[0]
            };
            setProposals([newProposal, ...proposals]);
            return;
        }

        const { error } = await supabase.from('proposals').insert([{
            request_id: proposal.requestId,
            request_title: proposal.requestTitle,
            buyer_id: proposal.buyerId,
            factory_id: factoryId,
            factory_name: user?.name,
            price_per_kg: proposal.priceQuoted,
            total_price: proposal.totalPrice,
            delivery_date: proposal.deliveryDate,
            message: proposal.message,
            status: 'Pending'
        }]); 
        
        if (error) throw error;
        
        fetchProposals(); 
    } catch (error) {
         console.error("Failed to submit proposal:", error.message);
    }
  };

  const updateProposalStatus = async (id, status) => {
      try {
          const { error } = await supabase
            .from('proposals')
            .update({ status })
            .eq('id', id);

          if (error) throw error;
          setProposals(proposals.map(p => p.id === id ? { ...p, status } : p));
      } catch (error) {
          console.error("Failed to update proposal status:", error.message);
      }
  };

  const getStats = () => {
    // 1. Totals
    const totalWasteUploaded = listings.reduce((acc, curr) => acc + Number(curr.quantity || 0), 0);
    const soldListings = listings.filter(l => l.status === 'Sold');
    const totalWasteSold = soldListings.reduce((acc, curr) => acc + Number(curr.quantity || 0), 0);
    const totalRevenue = transactions.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const totalPlatformFees = transactions.reduce((acc, curr) => acc + (Number(curr.commission) || 0), 0);
    const co2Saved = totalWasteSold * 15; // Est. 15kg CO2 per kg recycled (textile industry avg)

    // 2. Fabric Distribution (Analytics)
    const fabricDistribution = listings.reduce((acc, curr) => {
      const type = curr.fabricType || 'Other';
      acc[type] = (acc[type] || 0) + Number(curr.quantity || 0);
      return acc;
    }, {});

    // 3. Trend Calculations & Growth Data
    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Get last 6 months labels and structures
    const growthData = [];
    for(let i=5; i>=0; i--) {
        const d = new Date();
        d.setMonth(now.getMonth() - i);
        const mIndex = d.getMonth();
        const year = d.getFullYear();
        
        const count = users.filter(u => {
            if(!u.joinDate) return false;
            const jd = new Date(u.joinDate);
            return jd.getMonth() === mIndex && jd.getFullYear() === year;
        }).length;

        growthData.push({ month: months[mIndex], count });
    }

    // Previous Month Comparison (for Trend %)
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonthRaw = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const filterByMonth = (items, dateField, month, year) => {
        return items.filter(item => {
            if (!item[dateField]) return false;
            const d = new Date(item[dateField]);
            return d.getMonth() === month && d.getFullYear() === year;
        });
    };

    const currentMonthRevenue = filterByMonth(transactions, 'date', currentMonth, currentYear)
        .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const lastMonthRevenue = filterByMonth(transactions, 'date', lastMonthRaw, lastMonthYear)
        .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    const currentMonthUsers = filterByMonth(users, 'joinDate', currentMonth, currentYear).length;
    const lastMonthUsers = filterByMonth(users, 'joinDate', lastMonthRaw, lastMonthYear).length;

    const currentMonthListings = filterByMonth(listings, 'date', currentMonth, currentYear).length;
    const lastMonthListings = filterByMonth(listings, 'date', lastMonthRaw, lastMonthYear).length;

    const calcGrowth = (curr, prev) => {
        if (prev === 0) return curr > 0 ? 100 : 0;
        return ((curr - prev) / prev) * 100;
    };

    return { 
        totalWasteUploaded, 
        totalWasteSold, 
        totalRevenue, 
        totalPlatformFees, 
        co2Saved,
        fabricDistribution,
        growthData,
        trends: {
            revenue: calcGrowth(currentMonthRevenue, lastMonthRevenue),
            users: calcGrowth(currentMonthUsers, lastMonthUsers),
            listings: calcGrowth(currentMonthListings, lastMonthListings),
        }
    };
  };

  const logApprovalAction = (action, userName) => {
    const newLog = {
      id: Date.now().toString(),
      action,
      userName,
      date: new Date().toISOString().split('T')[0],
      admin: user ? user.name : 'Admin' 
    };
    setApprovalHistory([newLog, ...approvalHistory]);
  };
  
  const addNotice = (notice) => {
     setNotices([{ id: Date.now(), date: new Date().toISOString().split('T')[0], ...notice }, ...notices]);
  };

  const updateProfile = async (profileData) => {
     try {
         const id = user?.id;
         if(!id) return;

         if (id === 'mock') {
            const updatedUser = { ...user, ...profileData };
            setUser(updatedUser);
            localStorage.setItem('mockUser', JSON.stringify(updatedUser)); 
            return;
         }

         // 🎯 Optimistic Update: Update UI immediately for better UX
         const optimisticUser = { ...user, ...profileData };
         setUser(optimisticUser);
         console.log('⚡ [Optimistic] UI updated immediately, syncing to database...');

          // Increased timeout to 30 seconds for slow connections
          const timeoutPromise = new Promise((_, reject) => 
             setTimeout(() => reject(new Error("Database Sync Timed Out")), 30000)
          );

         const performUpdate = async (dataToSync) => {
            const { data, error } = await supabase
               .from('profiles')
               .update(dataToSync)
               .eq('id', id)
               .select()
               .single();
            
            if (error) {
                // Self-Healing Strategy: If a column is missing, remove it and retry ONCE
                if (error.message.includes('column') && error.message.includes('not find')) {
                    const missingColumn = error.message.match(/'([^']+)'/)?.[1];
                    if (missingColumn && dataToSync[missingColumn] !== undefined) {
                        console.warn(`🔔 [Self-Healing] Column "${missingColumn}" missing in DB. Stripping and retrying...`);
                        const strippedData = { ...dataToSync };
                        delete strippedData[missingColumn];
                        return performUpdate(strippedData); // Recursive retry
                    }
                }
                throw error;
            }
            return data;
         };

         const finalData = await Promise.race([performUpdate(profileData), timeoutPromise]);

         // Cache busting for images
         if (finalData.avatar_url && typeof finalData.avatar_url === 'string' && !finalData.avatar_url.includes('?t=') && finalData.avatar_url.startsWith('http')) {
            finalData.avatar_url = `${finalData.avatar_url}?t=${Date.now()}`;
         }

         const updatedUser = { ...user, ...finalData }; 
         setUser(updatedUser);
         console.log('✅ [Database] Profile synced successfully');
         return finalData;

     } catch (error) {
         console.error("❌ [Database] Critical Sync Failure:", error.message);
         
         // Don't revert optimistic update - keeps UI responsive
         console.warn('⚠️ [Offline Mode] Changes saved locally, will sync when connection improves');
         
         throw error;
     }
  };

  const uploadFile = async (file, bucket = 'avatars') => {
    try {
        const isMock = user?.id === 'mock';
        
        if (isMock) {
            console.log("Mock Mode: Converting to DataURL...");
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `profile-pics/${fileName}`;

        // Add 20s timeout for storage
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Storage Sync Timed Out")), 20000)
        );

        console.log(`📡 [Storage] Attempting upload to bucket: "${bucket}"...`);

        try {
            const uploadPromise = supabase.storage
                .from(bucket)
                .upload(filePath, file, { 
                    upsert: true,
                    contentType: file.type 
                });

            const { data, error: uploadError } = await Promise.race([uploadPromise, timeoutPromise]);

            if (uploadError) {
                console.warn("⚠️ [Storage] Supabase Upload failed. Falling back to local persistence.", uploadError);
                throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);

            console.log("✅ [Storage] Cloud sync successful:", publicUrl);
            return publicUrl;

        } catch (innerErr) {
            // FALLBACK: If Supabase Storage is not set up, don't crash the UI.
            // Use DataURL so the profile still works for the current user session.
            console.info("💡 [Storage] Using Local DataURL Fallback...");
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    console.log("✅ [Storage] Local fallback ready.");
                    resolve(reader.result);
                };
                reader.readAsDataURL(file);
            });
        }
    } catch (error) {
        console.error("❌ [Storage] Fatal Failure:", error.message);
        throw error;
    }
  };

  const initiatePayment = async (amount, metadata = {}) => {
    return new Promise((resolve, reject) => {
      if (!window.Razorpay) {
        alert("Razorpay SDK failed to load. Please check your internet connection.");
        return reject(new Error("Razorpay SDK not loaded"));
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_demo_key', // Replace with real key in .env
        amount: Math.round(amount * 100), // convert to paise
        currency: "INR",
        name: "ReTexValue",
        description: metadata.description || "Textile Waste Acquisition",
        // Removed image: "/logo.png" - causes CORS issues from localhost
        // If you need a logo, host it on a public CDN or use Razorpay's merchant logo settings
        handler: function (response) {
          console.log("Payment Successful:", response);
          resolve({
            success: true,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature
          });
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || ""
        },
        notes: {
          ...metadata,
          userId: user?.id
        },
        theme: {
          color: "#10b981", // Emerald-500
        },
        modal: {
          ondismiss: function() {
            reject(new Error("Payment cancelled"));
          }
        }
      };

      try {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (err) {
        console.error("Razorpay error:", err);
        reject(err);
      }
    });
  };

  // ===== PACKAGE MANAGEMENT FUNCTIONS =====
  
  const fetchPackages = async () => {
    console.log('🔄 [fetchPackages] Starting to fetch packages...');
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('price', { ascending: true });

      console.log('📊 [fetchPackages] Supabase response:', { data, error });

      if (error) {
        console.error('❌ [fetchPackages] Supabase error:', error);
        throw error;
      }

      if (data) {
        console.log(`✅ [fetchPackages] Fetched ${data.length} packages from Supabase`);
        const mappedPackages = data.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          durationDays: p.duration_days,
          features: p.features || [],
          maxListings: p.max_listings,
          maxBulkRequests: p.max_bulk_requests,
          prioritySupport: p.priority_support,
          aiCredits: p.ai_credits,
          status: p.status,
          badgeColor: p.badge_color,
          isFeatured: p.is_featured,
          createdAt: p.created_at,
          updatedAt: p.updated_at
        }));
        console.log('📦 [fetchPackages] Mapped packages:', mappedPackages);
        setPackages(mappedPackages);
      } else {
        console.warn('⚠️ [fetchPackages] No data returned from Supabase');
      }
    } catch (error) {
      console.error('❌ [fetchPackages] Failed to fetch packages:', error.message);
      console.error('❌ [fetchPackages] Full error:', error);
    }
  };

  const addPackage = async (packageData) => {
    try {
      const { data, error } = await supabase
        .from('packages')
        .insert([{
          name: packageData.name,
          description: packageData.description,
          price: packageData.price,
          duration_days: packageData.durationDays,
          features: packageData.features,
          max_listings: packageData.maxListings,
          max_bulk_requests: packageData.maxBulkRequests,
          priority_support: packageData.prioritySupport,
          ai_credits: packageData.aiCredits,
          status: packageData.status || 'active',
          badge_color: packageData.badgeColor || 'blue',
          is_featured: packageData.isFeatured || false
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newPackage = {
          id: data.id,
          name: data.name,
          description: data.description,
          price: data.price,
          durationDays: data.duration_days,
          features: data.features || [],
          maxListings: data.max_listings,
          maxBulkRequests: data.max_bulk_requests,
          prioritySupport: data.priority_support,
          aiCredits: data.ai_credits,
          status: data.status,
          badgeColor: data.badge_color,
          isFeatured: data.is_featured,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        };
        setPackages([...packages, newPackage]);
      }
    } catch (error) {
      console.error("Failed to add package:", error.message);
      throw error;
    }
  };

  const updatePackage = async (id, updates) => {
    try {
      const dbUpdates = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.price !== undefined) dbUpdates.price = updates.price;
      if (updates.durationDays !== undefined) dbUpdates.duration_days = updates.durationDays;
      if (updates.features !== undefined) dbUpdates.features = updates.features;
      if (updates.maxListings !== undefined) dbUpdates.max_listings = updates.maxListings;
      if (updates.maxBulkRequests !== undefined) dbUpdates.max_bulk_requests = updates.maxBulkRequests;
      if (updates.prioritySupport !== undefined) dbUpdates.priority_support = updates.prioritySupport;
      if (updates.aiCredits !== undefined) dbUpdates.ai_credits = updates.aiCredits;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.badgeColor !== undefined) dbUpdates.badge_color = updates.badgeColor;
      if (updates.isFeatured !== undefined) dbUpdates.is_featured = updates.isFeatured;

      const { error } = await supabase
        .from('packages')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;

      setPackages(packages.map(p => p.id === id ? { ...p, ...updates } : p));
    } catch (error) {
      console.error("Failed to update package:", error.message);
      throw error;
    }
  };

  const deletePackage = async (id) => {
    if (!window.confirm("Are you sure you want to delete this package?")) return;

    try {
      const { error } = await supabase
        .from('packages')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPackages(packages.filter(p => p.id !== id));
    } catch (error) {
      console.error("Failed to delete package:", error.message);
      throw error;
    }
  };

  return (
    <AppContext.Provider value={{ 
      user, loading, login, logout, 
      users, setUsers, fetchUsers, updateUserStatus, deleteUser, updateUser,
      listings, addListing, updateListingStatus, updateListing, deleteListing, setListings, fetchListings,
      transactions, purchaseListing, fetchTransactions, initiatePayment,
      reports, generateReport,
      bulkRequests, addBulkRequest,
      settings, updateSettings,
      proposals, submitProposal, updateProposalStatus, fetchProposals,
      packages, addPackage, updatePackage, deletePackage, fetchPackages,
      getStats,
      approvalHistory, logApprovalAction,
      notices, addNotice,
      theme, toggleTheme,
      updateProfile, uploadFile
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
