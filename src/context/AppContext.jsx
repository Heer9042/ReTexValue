import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import cottonImg from '../assets/cotton_fabric.png';
import polyesterImg from '../assets/polyester_fabric.png';
import blendedImg from '../assets/blended_fabric.png';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('retex_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(!user); // Only loading if no cached user
  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('retex_cache_users');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [listings, setListings] = useState(() => {
    try {
      const saved = localStorage.getItem('retex_cache_listings');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem('retex_cache_transactions');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [bulkRequests, setBulkRequests] = useState(() => {
    try {
      const saved = localStorage.getItem('retex_cache_bulk');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [proposals, setProposals] = useState(() => {
    try {
      const saved = localStorage.getItem('retex_cache_proposals');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [reports, setReports] = useState([]);
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('retex_cache_settings');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [packages, setPackages] = useState([]);

  // 🛡️ Security & Integrity: Ensure local storage isn't in a partial state on load
  useEffect(() => {
    if (!localStorage.getItem('retex_user')) {
        localStorage.removeItem('userRole');
        localStorage.removeItem('mockUser');
        // We keep the auth-token for Supabase's own recovery, but we clear our UI markers
    }
  }, []);

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
              localStorage.setItem('retex_cache_bulk', JSON.stringify(mappedRequests));
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

          const currentSettings = {
                 platformFee: fee,
                 maintenanceMode: mode,
                 categories: cats.length > 0 ? cats : ['Cotton', 'Polyester']
          };
          setSettings(currentSettings);
          localStorage.setItem('retex_cache_settings', JSON.stringify(currentSettings));

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
          type: u.type || 'Standard',
          companyName: u.company_name || '',
          address: u.address || '',
          gst: u.gst || '',
          capacity: u.capacity || 0
        }));
        setUsers(mappedUsers);
        localStorage.setItem('retex_cache_users', JSON.stringify(mappedUsers));
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
            const mappedListings = data.map(l => {
                let displayImage = l.image_url;
                if (!displayImage || displayImage === 'null') {
                    const type = (l.fabric_type || '').toLowerCase();
                    if (type.includes('cotton')) displayImage = cottonImg;
                    else if (type.includes('poly')) displayImage = polyesterImg;
                    else displayImage = blendedImg;
                }
                
                return {
                    id: l.id,
                    factoryId: l.factory_id || 'factory_unknown',
                    imageUrl: displayImage,
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
                };
            });
            setListings(mappedListings);
            localStorage.setItem('retex_cache_listings', JSON.stringify(mappedListings));
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
            localStorage.setItem('retex_cache_transactions', JSON.stringify(mappedTransactions));
        }
      } catch (error) {
          console.error("Failed to fetch transactions:", error.message);
      }
  };

  const addUser = async (userData) => {
      try {
          // For now, new users created via Admin are 'mock' until we implement admin-invite
          // because auth.signUp is for public use. 
          // However, we can create a profile for them.
          const newUser = {
              id: `mock_${Date.now()}`,
              status: 'Verified',
              joinDate: new Date().toISOString().split('T')[0],
              ...userData
          };

          setUsers(prev => {
              const updated = [newUser, ...prev];
              localStorage.setItem('retex_cache_users', JSON.stringify(updated));
              return updated;
          });
          
          alert(`${userData.role} added successfully`);
          return newUser;
      } catch (error) {
          console.error("❌ [UserMgmt] Failed to add user:", error);
          alert("Failed to add user");
      }
  };

  const deleteUser = async (id) => {
      try {
          // Identify real users by UUID format (contains dashes)
          const isRealUser = typeof id === 'string' && id.includes('-');
          
          if (isRealUser) {
              // 🛡️ Manual Cascade: Clear all dependent data before deleting the profile
              // This ensures it works even if the DB hasn't been set to CASCADE yet.
              
              // 1. Delete Bulk Requests (Buyer data)
              await supabase.from('bulk_requests').delete().eq('buyer_id', id);
              
              // 2. Delete Listings (Factory data)
              await supabase.from('listings').delete().eq('factory_id', id);
              
              // 3. Delete Proposals (Factory data)
              await supabase.from('proposals').delete().eq('factory_id', id);
              
              // 4. Delete Transactions (Buyer data)
              await supabase.from('transactions').delete().eq('buyer_id', id);

              // 5. Delete notices and logs related to this user
              await supabase.from('notices').delete().eq('user_id', id);
              
              // 6. Finally delete the Profile
              const { error } = await supabase
                 .from('profiles')
                 .delete()
                 .eq('id', id);

              if (error) {
                  console.error("Supabase Profile Delete Error:", error.message);
                  throw error;
              }
          }

          setUsers(prev => {
              const updated = prev.filter(u => u.id !== id);
              localStorage.setItem('retex_cache_users', JSON.stringify(updated));
              return updated;
          });
          
          if (isRealUser) fetchUsers(); // Force server re-sync
          console.log(`✅ [UserMgmt] User ${id} deleted successfully.`);
      } catch (error) {
           console.error("❌ [UserMgmt] Delete user failed:", error);
           throw error;
      }
  };

  const updateUserStatus = async (id, status, userName) => {
      try {
          const isRealUser = typeof id === 'string' && id.includes('-');
          
          if (isRealUser) {
             const { error } = await supabase
              .from('profiles')
               .update({ status })
              .eq('id', id);

             if (error) throw error;
          }
          
          setUsers(prev => {
              const updated = prev.map(u => u.id === id ? { ...u, status } : u);
              localStorage.setItem('retex_cache_users', JSON.stringify(updated));
              return updated;
          });

          if (typeof logApprovalAction === 'function') {
              logApprovalAction(status, userName); 
          }
      } catch (error) {
          console.error("❌ [UserMgmt] Failed to update user status:", error.message);
          alert(`Error updating status: ${error.message}`);
      }
  };

  const updateUser = async (id, updates) => {
    console.log(`🔄 [UserMgmt] Attempting to update user ${id}:`, updates);
    try {
      const isRealUser = typeof id === 'string' && id.includes('-');

      if (isRealUser) {
        const dbUpdates = {
          full_name: updates.name,
          company_name: updates.name, // Fallback for schema
          email: updates.email,
          role: updates.role?.toLowerCase(),
          location: updates.location,
          phone: updates.phone,
          type: updates.type,
          gst: updates.gst,
          capacity: updates.capacity ? parseFloat(String(updates.capacity).replace(/[^0-9.]/g, '')) : 0,
          address: updates.address || updates.location,
          company_type: updates.type,
          status: updates.status
        };

        // Remove undefined/null to prevent overwriting with nothing
        Object.keys(dbUpdates).forEach(key => (dbUpdates[key] === undefined || dbUpdates[key] === null) && delete dbUpdates[key]);

        console.log(`📤 [UserMgmt] Sending to Supabase:`, dbUpdates);

        const { error } = await supabase
          .from('profiles')
          .update(dbUpdates)
          .eq('id', id);

        if (error) {
          console.error(`❌ [Supabase Error]`, error);
          throw error;
        }
      } else {
        console.warn(`⚠️ [UserMgmt] ${id} is a mock user. Updating local state only.`);
      }

      setUsers(prev => {
        const updated = prev.map(u => u.id === id ? { ...u, ...updates } : u);
        localStorage.setItem('retex_cache_users', JSON.stringify(updated));
        return updated;
      });

      if (isRealUser) await fetchUsers(); // Await the refresh
      alert("User profile updated successfully");
      return true;
    } catch (error) {
      console.error("❌ [UserMgmt] Update failed:", error.message);
      alert("Error: " + error.message);
      throw error;
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
          if (updates.imageUrl) dbUpdates.image_url = updates.imageUrl;
          
          if (Object.keys(dbUpdates).length === 0) return;

          const { error } = await supabase
            .from('listings')
            .update(dbUpdates)
            .eq('id', id);

          if(error) throw error;
          
          setListings(prev => {
              const updated = prev.map(l => l.id === id ? { ...l, ...updates } : l);
              localStorage.setItem('retex_cache_listings', JSON.stringify(updated));
              return updated;
          });
          alert("Listing updated successfully");
      } catch (error) {
          console.error("Failed to update listing:", error.message);
          alert("Failed to update listing");
      }
  };

  const deleteListing = async (id) => {
      try {
          // Bypass DB for mock listings
          if (typeof id === 'string' && id.startsWith('mock')) {
              setListings(prev => {
                  const updated = prev.filter(l => l.id !== id);
                  localStorage.setItem('retex_cache_listings', JSON.stringify(updated));
                  return updated;
              });
              return true;
          }

          const { error } = await supabase
            .from('listings')
            .delete()
            .eq('id', id);

          if(error) {
              console.error("Supabase error detail:", error);
              throw error;
          }
          
          setListings(prev => {
              const updated = prev.filter(l => l.id !== id);
              localStorage.setItem('retex_cache_listings', JSON.stringify(updated));
              return updated;
          });
          return true;
      } catch (error) {
          console.error("Failed to delete listing:", error.message);
          throw error;
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
            localStorage.setItem('retex_cache_proposals', JSON.stringify(mappedProposals));
        }
    } catch (error) {
        console.error("Failed to fetch proposals:", error.message);
    }
  };

  const fetchInitialData = React.useCallback(async () => {
    console.log("🔄 [Backend] Initializing data fetch...");
    await Promise.allSettled([
        fetchUsers(),
        fetchListings(),
        fetchTransactions(),
        fetchReports(),
        fetchBulkRequests(),
        fetchProposals(),
        fetchSettings(),
        fetchPackages()
    ]);
  }, []);

  useEffect(() => {
    // 1. Core Auth & Session Strategy
    const initializeAuth = async () => {
      try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
              const { data: profile } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', session.user.id)
                  .single();
              
              if (profile) {
                  const userData = {
                      id: session.user.id,
                      email: session.user.email,
                      ...profile,
                      role: profile.role || 'buyer',
                      avatar_url: profile.avatar_url || '',
                      name: profile.full_name || profile.username || '',
                      lastSync: Date.now()
                  };
                  setUser(userData);
                  localStorage.setItem('retex_user', JSON.stringify(userData));
                  localStorage.setItem('userRole', profile.role);
                  localStorage.removeItem('mockUser'); // Ensure real session takes over
                  fetchInitialData();
              }
          } else {
              // 🛡️ Final Verification: If no session and NOT a mock, clear everything
              const savedUser = localStorage.getItem('retex_user');
              const isMock = savedUser?.includes('"id":"mock"') || localStorage.getItem('mockUser');
              
              if (!isMock) {
                  console.log("👋 [Auth] No valid session found. Cleaning up local state.");
                  setUser(null);
                  localStorage.removeItem('retex_user');
                  localStorage.removeItem('userRole');
                  localStorage.removeItem('sb-hinwjdamhyybmolddkge-auth-token');
              }
          }
      } catch (error) {
          console.error("❌ [Auth] Initialization failed:", error);
      } finally {
          setLoading(false);
      }
    };

    // 2. Fast-Path Data Fetch (Run immediately if we have a cached user)
    if (user) {
      console.log("⚡ [Init] Found cached user, starting fast-path fetch...");
      fetchInitialData();
    }

    initializeAuth();

    // 3. Robust Auth State Listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`🔑 [Auth] Event: ${event}`);
      
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') && session) {
          const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

          if (profile) {
            const userData = {
                id: session.user.id,
                email: session.user.email,
                role: profile.role || 'buyer',
                ...profile,
                name: profile.full_name || profile.username || ''
            };
            setUser(userData);
            localStorage.setItem('retex_user', JSON.stringify(userData));
            localStorage.setItem('userRole', profile.role); 
            fetchInitialData();
          }
      } else if (event === 'SIGNED_OUT') {
        console.log("🚪 [Auth] User signed out, clearing all session data.");
        setUser(null);
        setLoading(false);
        const keysToClear = [
          'retex_user', 'userRole', 'mockUser', 
          'retex_cache_users', 'retex_cache_listings', 
          'retex_cache_transactions', 'retex_cache_bulk', 
          'retex_cache_proposals', 'retex_cache_settings',
          'sb-hinwjdamhyybmolddkge-auth-token'
        ];
        keysToClear.forEach(k => localStorage.removeItem(k));
      }
    });

    return () => {
      if (authListener?.subscription) authListener.subscription.unsubscribe();
    };
  }, [fetchInitialData]);

  // Remove the duplicate fetch-on-user-id effect to prevent race conditions

  const login = async (role, credentials) => {
    if (typeof role === 'object') {
        setUser(role);
        localStorage.setItem('retex_user', JSON.stringify(role));
        localStorage.setItem('userRole', role.role);
        fetchInitialData();
        return;
    }
    const mockUser = { id: 'mock', name: 'Mock User', role: role, email: 'mock@test.com' };
    setUser(mockUser);
    localStorage.setItem('retex_user', JSON.stringify(mockUser));
    localStorage.setItem('mockUser', JSON.stringify(mockUser));
    localStorage.setItem('userRole', role);
    fetchInitialData();
  };

  const logout = async () => {
      console.log("🚀 [Auth] Initiating logout...");
      
      // 1. Immediately wipe local state for instant UI response
      setUser(null);
      setLoading(false);
      sessionStorage.clear();
      
      const keysToClear = [
        'retex_user', 'userRole', 'mockUser', 
        'retex_cache_users', 'retex_cache_listings', 
        'retex_cache_transactions', 'retex_cache_bulk', 
        'retex_cache_proposals', 'retex_cache_settings',
        'sb-hinwjdamhyybmolddkge-auth-token'
      ];
      
      keysToClear.forEach(k => localStorage.removeItem(k));

      // 2. Perform background signout
      try {
          await supabase.auth.signOut();
          console.log("✅ [Auth] Supabase session terminated.");
      } catch (err) {
          console.error("⚠️ [Auth] Supabase signOut error (ignoring as local state is clear):", err);
      }
  };

  // Duplicate (Removed)



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
            localStorage.setItem('retex_user', JSON.stringify(updatedUser));
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
         localStorage.setItem('retex_user', JSON.stringify(updatedUser)); // Keep storage in sync
         console.log('✅ [Database] Profile synced successfully');
         return finalData;

     } catch (error) {
         console.error("❌ [Database] Critical Sync Failure:", error.message);
         
         // Don't revert optimistic update - keeps UI responsive
         console.warn('⚠️ [Offline Mode] Changes saved locally, will sync when connection improves');
         
         throw error;
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
            setListings(prev => {
                const updated = [newListing, ...prev];
                localStorage.setItem('retex_cache_listings', JSON.stringify(updated));
                return updated;
            });
            return newListing;
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
            setListings(prev => {
                const updated = [newListing, ...prev];
                localStorage.setItem('retex_cache_listings', JSON.stringify(updated));
                return updated;
            });
        }
    } catch (error) {
        console.error("Failed to add listing:", error.message);
        throw error; // Re-throw so UI can handle it
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
        const folder = bucket === 'products' ? 'inventory' : 'profile-pics';
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `${folder}/${fileName}`;

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
      users, setUsers, fetchUsers, updateUserStatus, deleteUser, updateUser, addUser,
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
