import React, { useState, useEffect } from 'react';
import { Search, MoreVertical, ShieldCheck, Mail, AlertTriangle, Factory, ShoppingBag, UserPlus, History, Filter, X, Check, Trash2, Edit2, User, Phone, MapPin, FileText, Briefcase, Zap, Building2, Globe, CheckCircle2, Clock, ChevronDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function ManageUsers() {
  const { users, fetchUsers, setUsers, approvalHistory, logApprovalAction, updateUserStatus, deleteUser, updateUser, addUser, updateVerificationStatus } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Factory'); // 'Factory' or 'Buyer'
  const [statusFilter, setStatusFilter] = useState('All');
  const [verificationFilter, setVerificationFilter] = useState('All'); // All, Verified, Pending, Unverified
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); // For detailed view
  const [editingUser, setEditingUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch users on component mount
  useEffect(() => {
    const loadUsers = async () => {
      // Check if we have cached data
      const hasCachedUsers = sessionStorage.getItem('retex_cache_users');
      
      // Only show loading if no cached data
      if (!hasCachedUsers) {
        setIsLoading(true);
      }

      try {
        await fetchUsers();
        console.log('✅ [ManageUsers] Users loaded from database');
      } catch (error) {
        console.error('❌ [ManageUsers] Failed to load users:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadUsers();
  }, [fetchUsers]);

  // Debouncing Search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms debounce
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Unified Filter Logic - Handle both Factory and Buyer roles
  const filteredUsers = users.filter(u => {
      const userRole = u.role ? u.role.toLowerCase() : 'buyer';
      const tabRole = activeTab.toLowerCase();
      const matchesTab = userRole === tabRole;
      const matchesSearch = (u.name || '').toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || 
                            (u.email || '').toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                            (u.companyName || '').toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || u.status === statusFilter;
      
      let matchesVerification = true;
      if (verificationFilter === 'Verified') {
        matchesVerification = u.isVerified === true;
      } else if (verificationFilter === 'Pending') {
        matchesVerification = u.verificationStatus === 'pending';
      } else if (verificationFilter === 'Unverified') {
        matchesVerification = u.isVerified === false && u.verificationStatus !== 'pending';
      }
      
      return matchesTab && matchesSearch && matchesStatus && matchesVerification;
  });

  const handleStatusChange = async (id, newStatus, userName) => {
     try {
       console.log(`🔄 [ManageUsers] Changing status for user ${id} to ${newStatus}`);
       await updateUserStatus(id, newStatus, userName);
       console.log(`✅ [ManageUsers] Status updated successfully to ${newStatus}`);
     } catch (error) {
       console.error('❌ [ManageUsers] Status update failed:', error);
       alert(`Failed to update status: ${error.message}`);
     }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUserSubmit = async (userData) => {
      setIsSubmitting(true);
      try {
          if (editingUser) {
              await updateUser(editingUser.id, userData);
          } else {
              await addUser(userData);
          }
          setShowAddUserModal(false);
          setEditingUser(null);
      } catch (err) {
          console.error("Submission failed:", err);
          // Alert is handled inside updateUser/addUser
      } finally {
          setIsSubmitting(false);
      }
  };

   const openAddUser = () => {
       setEditingUser(null);
       setShowAddUserModal(true);
   }

   const handleDeleteUser = async (id) => {
       if (window.confirm("Are you sure you want to permanently delete this user profile? This action cannot be undone and they will lose access immediately.")) {
           try {
               await deleteUser(id);
               alert("User deleted successfully"); // Added proper feedback
           } catch (error) {
               console.error("Delete user failed:", error);
               alert("Failed to delete user: " + (error.message || "Unknown error"));
           }
       }
   };

   const handleVerificationStatusChange = async (userId, status) => {
       try {
           console.log(`🔄 [ManageUsers] Updating verification for user ${userId} to ${status}`);
           await updateVerificationStatus(userId, status);
           console.log(`✅ [ManageUsers] Verification updated successfully to ${status}`);
           alert(`User verification status updated to: ${status}`);
       } catch (error) {
           console.error("❌ [ManageUsers] Verification update failed:", error);
           alert("Failed to update verification status: " + (error.message || "Unknown error"));
       }
   };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 transition-colors duration-300">
       {/* Header */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">User Management</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage factories, buyers, and platform access.</p>
          </div>
          <div className="flex gap-3">
             <button 
                onClick={async () => {
                  setIsLoading(true);
                  try {
                    await fetchUsers();
                    console.log('✅ Data refreshed');
                  } catch (error) {
                    console.error('❌ Refresh failed:', error);
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors shadow-sm disabled:opacity-50"
                title="Refresh user data from database"
             >
                <Search size={18} />
                <span className="hidden sm:inline">Refresh</span>
             </button>
             <button 
                onClick={() => setShowHistoryModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors shadow-sm"
             >
                <History size={18} />
                <span className="hidden sm:inline">History</span>
             </button>
             <button 
                onClick={openAddUser}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
             >
                <UserPlus size={18} />
                <span>Add User</span>
             </button>
          </div>
       </div>

       {/* Controls Bar */}
       <div className="flex flex-col md:flex-row gap-4 justify-between bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 backdrop-blur-sm shadow-sm">
          {/* Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-lg self-start">
             <button 
                onClick={() => setActiveTab('Factory')}
                className={`px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-all ${
                   activeTab === 'Factory' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
             >
                <Factory size={16} /> Factories
             </button>
             <button 
                onClick={() => setActiveTab('Buyer')}
                className={`px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-all ${
                   activeTab === 'Buyer' ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
             >
                <ShoppingBag size={16} /> Buyers
             </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
             {/* Status Filter */}
             <div className="relative">
                <select 
                   value={statusFilter}
                   onChange={(e) => setStatusFilter(e.target.value)}
                   className="appearance-none bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 pl-10 pr-8 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none w-full sm:w-40"
                >
                   <option value="All">All Status</option>
                   <option value="Pending">Pending</option>
                   <option value="Verified">Verified</option>
                   <option value="Blocked">Blocked</option>
                   <option value="Rejected">Rejected</option>
                </select>
                <Filter className="absolute left-3 top-3 text-slate-500 w-4 h-4 pointer-events-none" />
             </div>

             {/* Verification Filter */}
             <div className="relative">
                <select 
                   value={verificationFilter}
                   onChange={(e) => setVerificationFilter(e.target.value)}
                   className="appearance-none bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 pl-10 pr-8 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none w-full sm:w-48"
                >
                   <option value="All">All Verification</option>
                   <option value="Verified">✓ Verified Only</option>
                   <option value="Pending">⏳ Pending Verification</option>
                   <option value="Unverified">✗ Unverified</option>
                </select>
                <ShieldCheck className="absolute left-3 top-3 text-amber-500 w-4 h-4 pointer-events-none" />
             </div>

             {/* Search */}
             <div className="relative w-full sm:w-64">
                <input 
                  type="text" 
                  placeholder="Search users..."
                  className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-3 text-slate-500 w-4 h-4" />
             </div>
          </div>
       </div>

       {/* Users Table */}
       <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 uppercase text-xs font-semibold tracking-wider border-b border-slate-200 dark:border-slate-700">
                   <tr>
                      <th className="px-6 py-4 w-1/4">User Details</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4 w-1/6">Status</th>
                      <th className="px-6 py-4 w-1/5">Verification</th>
                      <th className="px-6 py-4">Joined</th>
                      <th className="px-6 py-4 text-right w-1/4">Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                   {filteredUsers.length > 0 ? (
                      filteredUsers.map(user => (
                         <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                            <td className="px-6 py-4 cursor-pointer" onClick={() => setSelectedUser(user)}>
                               <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-inner shrink-0 ${
                                     user.role === 'Factory' ? 'bg-linear-to-br from-emerald-500 to-teal-700' : 'bg-linear-to-br from-blue-500 to-indigo-700'
                                  }`}>
                                     {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                                  </div>
                                  <div className="min-w-0">
                                     <div className="text-slate-900 dark:text-white font-medium group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">{user.name}</div>
                                     <div className="text-xs text-slate-500 flex items-center gap-1 truncate">
                                        <Mail size={10} className="shrink-0" /> {user.email}
                                     </div>
                                  </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-slate-600 dark:text-slate-300 text-sm">
                               {user.type || user.role}
                            </td>
                            <td className="px-6 py-4">
                               <StatusIndicator status={user.status || 'Pending'} />
                            </td>
                            <td className="px-6 py-4">
                               <VerificationBadge status={user.verificationStatus} isVerified={user.isVerified} />
                            </td>
                            <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm whitespace-nowrap">{user.joinDate}</td>
                            <td className="px-6 py-4 text-right">
                               <UserActionsMenu 
                                  user={user} 
                                  onStatusChange={handleStatusChange}
                                  onVerificationChange={handleVerificationStatusChange}
                                  onEdit={() => { setShowAddUserModal(true); setEditingUser(user); }}
                                  onDelete={handleDeleteUser}
                               />
                            </td>
                         </tr>
                      ))
                   ) : (
                      <tr>
                         <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                            <div className="flex flex-col items-center gap-2">
                               {isLoading ? (
                                  <>
                                     <div className="w-8 h-8 border-3 border-emerald-200 dark:border-emerald-800 border-t-emerald-600 dark:border-t-emerald-400 rounded-full animate-spin" />
                                     <p>Loading {activeTab.toLowerCase()}s...</p>
                                  </>
                               ) : (
                                  <>
                                     <Search size={32} className="text-slate-400" />
                                     <p>No {activeTab.toLowerCase()}s found matching your filters.</p>
                                  </>
                               )}
                            </div>
                         </td>
                      </tr>
                   )}
                </tbody>
             </table>
          </div>
       </div>

       {/* Add User Modal */}
       {showAddUserModal && (
          <UserFormModal 
              initialData={editingUser}
              onClose={() => { setShowAddUserModal(false); setEditingUser(null); }} 
              onSubmit={handleUserSubmit}
              isSubmitting={isSubmitting}
          />
       )}

       {/* Approval History Modal (Global) - Kept for reference but User Detail has specific history */}
       {showHistoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
             <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                   <h2 className="text-xl font-bold text-slate-900 dark:text-white">Global Audit Log</h2>
                   <button onClick={() => setShowHistoryModal(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                      <X size={20} />
                   </button>
                </div>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                   {approvalHistory && approvalHistory.length > 0 ? (
                      approvalHistory.map(log => (
                         <div key={log.id} className="flex gap-3 p-3 rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                            <div className={`mt-1 w-2 h-2 rounded-full ${
                               log.action === 'Verified' ? 'bg-emerald-400' : 
                               log.action === 'Rejected' ? 'bg-red-400' : 'bg-amber-400'
                            }`} />
                            <div>
                               <p className="text-sm text-slate-600 dark:text-slate-300">
                                  <span className="font-semibold text-slate-900 dark:text-white">{log.admin}</span> changed status of 
                                  <span className="font-semibold text-slate-900 dark:text-white"> {log.userName}</span> to 
                                  <span className={`font-medium ${
                                     log.action === 'Verified' ? 'text-emerald-600 dark:text-emerald-400' : 
                                     log.action === 'Rejected' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'
                                  }`}> {log.action}</span>
                               </p>
                               <p className="text-xs text-slate-500 mt-1">{log.date}</p>
                            </div>
                         </div>
                      ))
                   ) : (
                      <div className="text-center text-slate-500 py-8">No history available</div>
                   )}
                </div>
             </div>
          </div>
       )}

       {/* User Details Modal */}
       {selectedUser && (
          <UserDetailModal 
            user={selectedUser} 
            onClose={() => setSelectedUser(null)} 
            history={approvalHistory.filter(h => h.userName === selectedUser.name || h.userName === selectedUser.id)} 
          />
       )}
    </div>
  );
}

function UserDetailModal({ user, onClose, history }) {
   const [tab, setTab] = useState('overview'); // overview, history

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl max-w-2xl w-full p-0 overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header/Banner */}
            <div className={`h-24 bg-linear-to-r relative ${
                  user.role === 'Factory' ? 'from-emerald-600 to-teal-700' : 'from-blue-600 to-indigo-700'
               }`}>
               <button onClick={onClose} className="absolute top-4 right-4 bg-black/20 p-2 rounded-full text-white hover:bg-black/40 transition-colors">
                  <X size={20} />
               </button>
               <div className="absolute -bottom-10 left-8 flex items-end gap-4">
                   <div className="w-20 h-20 rounded-xl bg-white dark:bg-slate-800 p-1 shadow-lg">
                      <div className={`w-full h-full rounded-lg flex items-center justify-center text-3xl font-bold text-white ${
                            user.role === 'Factory' ? 'bg-emerald-500' : 'bg-blue-500'
                      }`}>
                         {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                      </div>
                   </div>
                   <div className="mb-2">
                      <h2 className="text-2xl font-bold text-white drop-shadow-md">{user.name}</h2>
                      <span className="text-white/80 text-sm font-medium px-2 py-0.5 rounded-full bg-black/20 backdrop-blur-md border border-white/10">
                         {user.role}
                      </span>
                   </div>
               </div>
            </div>

            <div className="pt-14 px-8 pb-8">
               
               {/* Tabs */}
               <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6">
                  <button onClick={() => setTab('overview')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab==='overview' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                     Overview
                  </button>
                  <button onClick={() => setTab('history')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab==='history' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                     History
                  </button>
               </div>

               {tab === 'overview' ? (
                  <div className="space-y-6">
                     <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                           <Mail size={16} /> {user.email}
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mt-1">
                           <Phone size={16} /> {user.phone || 'N/A'}
                        </div>
                        <StatusIndicator status={user.status} />
                     </div>
                     
                     <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded border border-slate-200 dark:border-slate-700">
                           <p className="text-xs text-slate-500 uppercase">Type</p>
                           <p className="font-semibold text-slate-900 dark:text-white">{user.type}</p>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded border border-slate-200 dark:border-slate-700">
                           <p className="text-xs text-slate-500 uppercase">Location</p>
                           <p className="font-semibold text-slate-900 dark:text-white">{user.location}</p>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded border border-slate-200 dark:border-slate-700">
                           <p className="text-xs text-slate-500 uppercase">Joined</p>
                           <p className="font-semibold text-slate-900 dark:text-white">{user.joinDate}</p>
                        </div>
                     </div>
                  </div>
               ) : (
                  <div className="space-y-4">
                     <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Audit Log</h3>
                     {history && history.length > 0 ? (
                        history.map((h, i) => (
                           <div key={i} className="flex gap-3 pb-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
                               <div className="mt-1"><History size={14} className="text-slate-400"/></div>
                               <div>
                                  <p className="text-sm text-slate-700 dark:text-slate-300">
                                     Status changed to <span className="font-semibold">{h.action}</span> by Admin
                                  </p>
                                  <p className="text-xs text-slate-500">{h.date}</p>
                               </div>
                           </div>
                        ))
                     ) : (
                        <p className="text-slate-500 text-sm italic">No history records found for this user.</p>
                     )}
                  </div>
               )}

            </div>
         </div>
      </div>
   );
}


function UserFormModal({ onClose, onSubmit, initialData, isSubmitting }) {
    const [role, setRole] = useState(initialData?.role || 'Factory');
    const [errors, setErrors] = useState({});

    const validate = (data) => {
        const newErrors = {};
        
        // Name validation
        if (!data.name || data.name.length < 2) {
            newErrors.name = "Name must be at least 2 characters.";
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            newErrors.email = "Please enter a valid email address.";
        }

        // Phone validation (exactly 10 digits for India)
        const phoneRegex = /^\d{10}$/;
        if (data.phone && !phoneRegex.test(data.phone.trim())) {
            newErrors.phone = "Phone number must be exactly 10 digits.";
        }

        // GST Validation (Simplified Indian format)
        if (role === 'Factory' && data.gst) {
            const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
            if (!gstRegex.test(data.gst.toUpperCase())) {
                newErrors.gst = "Invalid GST format (e.g. 22AAAAA0000A1Z5).";
            }
        }

        // Capacity validation
        if (role === 'Factory' && data.capacity) {
            if (isNaN(data.capacity) || parseFloat(data.capacity) < 0) {
                newErrors.capacity = "Capacity must be a positive number.";
            }
        }

        return newErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            role: role,
            location: formData.get('location'),
            address: formData.get('location'), // Map location to address for consistency
            type: formData.get('type') || (role === 'Factory' ? 'Manufacturer' : 'Brand'),
            phone: formData.get('phone'),
            // Specifics
            gst: formData.get('gst'),
            capacity: formData.get('capacity'),
            fabrics: formData.get('fabrics'),
        };

        const validationErrors = validate(data);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        
        onSubmit(data);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
             <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm">
                   <div>
                       <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                           {initialData ? <Edit2 size={20} className="text-blue-500"/> : <UserPlus size={20} className="text-emerald-500"/>}
                           {initialData ? 'Edit User Profile' : 'Register New User'}
                       </h2>
                       <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                           Enter the details below to {initialData ? 'update' : 'create'} a {role.toLowerCase()} account.
                       </p>
                   </div>
                   <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors">
                      <X size={20} />
                   </button>
                </div>
                
                <form id="user-form" onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-8 custom-scrollbar">
                   
                   {/* Role Selection */}
                   <div className="space-y-3">
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Account Type</label>
                       <div className="grid grid-cols-2 gap-4">
                           <button 
                              type="button" 
                              onClick={() => setRole('Factory')}
                              className={`relative group flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${
                                  role === 'Factory' 
                                  ? 'bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-500 ring-4 ring-emerald-500/10' 
                                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-400/50 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                              }`}
                           >
                               <div className={`p-3 rounded-full transition-colors ${role === 'Factory' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 group-hover:text-emerald-500'}`}>
                                   <Factory size={24} />
                               </div>
                               <div className="text-center">
                                   <span className={`block font-bold ${role === 'Factory' ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'}`}>Factory</span>
                                   <span className="text-xs text-slate-500">Manufacturer / Recycler</span>
                               </div>
                               {role === 'Factory' && <div className="absolute top-3 right-3 text-emerald-500"><Check size={16} strokeWidth={3} /></div>}
                           </button>

                           <button 
                              type="button" 
                              onClick={() => setRole('Buyer')}
                              className={`relative group flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${
                                  role === 'Buyer' 
                                  ? 'bg-blue-50/50 dark:bg-blue-900/20 border-blue-500 ring-4 ring-blue-500/10' 
                                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-400/50 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                              }`}
                           >
                               <div className={`p-3 rounded-full transition-colors ${role === 'Buyer' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 group-hover:text-blue-500'}`}>
                                   <ShoppingBag size={24} />
                               </div>
                               <div className="text-center">
                                   <span className={`block font-bold ${role === 'Buyer' ? 'text-blue-700 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300'}`}>Buyer</span>
                                   <span className="text-xs text-slate-500">Brand / Wholesaler</span>
                               </div>
                               {role === 'Buyer' && <div className="absolute top-3 right-3 text-blue-500"><Check size={16} strokeWidth={3} /></div>}
                           </button>
                       </div>
                   </div>

                   {/* Personal / Contact Info */}
                   <div className="space-y-4">
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Contact Information</label>
                       
                       <div className="space-y-4">
                           <div className="relative">
                               <User className="absolute left-3.5 top-3.5 text-slate-400 w-5 h-5" />
                               <input 
                                  name="name" 
                                  defaultValue={initialData?.name} 
                                  required 
                                  className={`w-full bg-slate-50 dark:bg-slate-800/50 border ${errors.name ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl pl-11 pr-4 py-3 text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400`} 
                                  placeholder="Company or Contact Name" 
                               />
                               {errors.name && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.name}</p>}
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <div className="relative">
                                  <Mail className="absolute left-3.5 top-3.5 text-slate-400 w-5 h-5" />
                                  <input 
                                      name="email" 
                                      type="email"
                                      defaultValue={initialData?.email} 
                                      required 
                                      className={`w-full bg-slate-50 dark:bg-slate-800/50 border ${errors.email ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl pl-11 pr-4 py-3 text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400`} 
                                      placeholder="Email Address" 
                                  />
                                  {errors.email && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.email}</p>}
                               </div>
                               <div className="relative">
                                  <Phone className="absolute left-3.5 top-3.5 text-slate-400 w-5 h-5" />
                                  <input 
                                      name="phone" 
                                      type="text"
                                      maxLength="10"
                                      defaultValue={initialData?.phone} 
                                      onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '')}
                                      className={`w-full bg-slate-50 dark:bg-slate-800/50 border ${errors.phone ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl pl-11 pr-4 py-3 text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400`} 
                                      placeholder="Phone Number (10 digits)" 
                                  />
                                  {errors.phone && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.phone}</p>}
                               </div>
                           </div>

                           <div className="relative">
                              <MapPin className="absolute left-3.5 top-3.5 text-slate-400 w-5 h-5" />
                              <input 
                                  name="location" 
                                  defaultValue={initialData?.location} 
                                  required 
                                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-11 pr-4 py-3 text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400" 
                                  placeholder="Full Business Address" 
                              />
                           </div>
                       </div>
                   </div>

                   {/* Role Specific Details */}
                   <div className={`p-6 rounded-2xl border transition-colors duration-300 ${
                       role === 'Factory' 
                       ? 'bg-emerald-50/30 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-500/20' 
                       : 'bg-blue-50/30 dark:bg-blue-900/10 border-blue-100 dark:border-blue-500/20'
                   }`}>
                        <div className="flex items-center gap-2 mb-4">
                            {role === 'Factory' ? <Building2 className="text-emerald-500" size={18}/> : <Briefcase className="text-blue-500" size={18}/>}
                            <label className={`text-xs font-bold uppercase tracking-wider ${role === 'Factory' ? 'text-emerald-700 dark:text-emerald-400' : 'text-blue-700 dark:text-blue-400'}`}>
                                {role} Specifics
                            </label>
                        </div>
                       
                       {role === 'Factory' ? (
                           <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                   <div>
                                      <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">GST/Tax ID</label>
                                      <div className="relative">
                                          <FileText className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                                          <input name="gst" defaultValue={initialData?.gst} className={`w-full bg-white dark:bg-slate-900 border ${errors.gst ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-emerald-500`} placeholder="Tax Identification" />
                                      </div>
                                      {errors.gst && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.gst}</p>}
                                   </div>
                                    <div>
                                      <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">Monthly Capacity</label>
                                      <div className="relative">
                                          <Zap className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                                          <input name="capacity" defaultValue={initialData?.capacity} className={`w-full bg-white dark:bg-slate-900 border ${errors.capacity ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-emerald-500`} placeholder="e.g. 50 Tons" />
                                      </div>
                                      {errors.capacity && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.capacity}</p>}
                                   </div>
                               </div>
                               <div>
                                  <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">Factory Operation Type</label>
                                  <div className="relative">
                                      <Factory className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                                      <select name="type" defaultValue={initialData?.type} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-emerald-500 appearance-none">
                                          <option value="Manufacturer">Manufacturer</option>
                                          <option value="Recycler">Recycler</option>
                                          <option value="Mill">Textile Mill</option>
                                      </select>
                                      <div className="absolute right-3 top-3 pointer-events-none opacity-50"><svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 1L5 5L9 1"/></svg></div>
                                  </div>
                               </div>
                           </div>
                       ) : (
                           <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                               <div>
                                  <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">Business Function</label>
                                  <div className="relative">
                                      <Globe className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                                      <select name="type" defaultValue={initialData?.type} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-blue-500 appearance-none">
                                          <option value="Brand">Fashion Brand</option>
                                          <option value="Designer">Independent Designer</option>
                                          <option value="Wholesaler">Wholesaler</option>
                                      </select>
                                      <div className="absolute right-3 top-3 pointer-events-none opacity-50"><svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 1L5 5L9 1"/></svg></div>
                                  </div>
                               </div>
                               <div>
                                  <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">Fabric Interests</label>
                                  <textarea 
                                    name="fabrics" 
                                    defaultValue={initialData?.fabrics} 
                                    rows="2"
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 resize-none" 
                                    placeholder="e.g. Organic Cotton, Recycled Polyester, Denim" 
                                  />
                               </div>
                           </div>
                       )}
                   </div>
                </form>

                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm flex gap-4">
                     <button onClick={onClose} type="button" className="flex-1 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        Cancel
                     </button>
                      <button 
                        form="user-form"
                        type="submit"
                        disabled={isSubmitting}
                        className={`flex-1 py-3.5 rounded-xl text-white font-bold shadow-lg transition-transform hover:scale-[1.02] flex items-center justify-center gap-2 ${
                          role === 'Factory' 
                          ? 'bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/20' 
                          : 'bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/20'
                      }`}>
                         {isSubmitting ? (
                           <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                         ) : (
                           <Check size={20} />
                         )}
                         {isSubmitting ? 'Processing...' : (initialData ? 'Save Changes' : `Create ${role}`)}
                      </button>
                </div>

             </div>
        </div>
    );
}

function UserActionsMenu({ user, onStatusChange, onVerificationChange, onEdit, onDelete }) {
   const [showMenu, setShowMenu] = useState(false);
   const menuRef = React.useRef(null);

   const statusOptions = [
      { label: 'Verified', color: 'emerald', icon: '✓' },
      { label: 'Pending', color: 'amber', icon: '⏳' },
      { label: 'Rejected', color: 'red', icon: '✕' },
      { label: 'Blocked', color: 'rose', icon: '⛔' }
   ];
   
   const verificationOptions = [
      { label: 'verified', color: 'blue', icon: '✓' },
      { label: 'pending', color: 'cyan', icon: '⏳' },
      { label: 'rejected', color: 'orange', icon: '✕' }
   ];

   // Close menu when clicking outside
   React.useEffect(() => {
      const handleClickOutside = (e) => {
         if (menuRef.current && !menuRef.current.contains(e.target)) {
            setShowMenu(false);
         }
      };
      if (showMenu) {
         document.addEventListener('mousedown', handleClickOutside);
         return () => document.removeEventListener('mousedown', handleClickOutside);
      }
   }, [showMenu]);

   const handleStatusSelect = (status) => {
      onStatusChange(user.id, status, user.name);
      setShowMenu(false);
   };

   const handleVerificationSelect = (status) => {
      onVerificationChange(user.id, status);
      setShowMenu(false);
   };

   const getStatusColor = (status) => {
      const option = statusOptions.find(opt => opt.label === status);
      return option?.color || 'slate';
   };

   const getVerificationColor = (status) => {
      const option = verificationOptions.find(opt => opt.label === status);
      return option?.color || 'slate';
   };

   return (
      <div className="relative inline-block w-full" ref={menuRef}>
         <button 
            onClick={() => setShowMenu(!showMenu)}
            className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-300 dark:border-slate-600 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 group"
            title="User actions menu"
         >
            <MoreVertical size={16} className="group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
            <span className="hidden sm:inline">Actions</span>
            <ChevronDown size={16} className={`transition-transform duration-200 ${showMenu ? 'rotate-180' : ''}`} />
         </button>

         {showMenu && (
            <div className="absolute top-full mt-2 right-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 w-72 overflow-hidden animate-in fade-in slide-in-from-top-2">
               
               {/* User Info Header */}
               <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">Manage</p>
               </div>

               {/* Status Section */}
               <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-3">
                     <CheckCircle2 size={14} className="text-slate-500 dark:text-slate-400" />
                     <p className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Status</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                     {statusOptions.map(option => {
                        const isActive = user.status === option.label;
                        return (
                           <button
                              key={option.label}
                              onClick={() => handleStatusSelect(option.label)}
                              className={`px-3 py-2.5 rounded-lg text-xs font-semibold capitalize transition-all transform hover:scale-105 active:scale-95 ${
                                 isActive
                                    ? `bg-${option.color}-500 dark:bg-${option.color}-600 text-white shadow-lg border-2 border-${option.color}-600 dark:border-${option.color}-500`
                                    : `bg-${option.color}-50 dark:bg-${option.color}-900/20 text-${option.color}-700 dark:text-${option.color}-300 border-2 border-${option.color}-200 dark:border-${option.color}-700 hover:bg-${option.color}-100 dark:hover:bg-${option.color}-900/40`
                              }`}
                           >
                              <span className="inline-block mr-1">{option.icon}</span>
                              {option.label}
                           </button>
                        );
                     })}
                  </div>
               </div>

               {/* Verification Section */}
               <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-3">
                     <ShieldCheck size={14} className="text-slate-500 dark:text-slate-400" />
                     <p className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Verification</p>
                  </div>
                  <div className="space-y-2">
                     {verificationOptions.map(option => {
                        const isActive = user.verificationStatus === option.label;
                        return (
                           <button
                              key={option.label}
                              onClick={() => handleVerificationSelect(option.label)}
                              className={`w-full px-3 py-2.5 rounded-lg text-xs font-semibold capitalize transition-all flex items-center gap-2 ${
                                 isActive
                                    ? `bg-${option.color}-500 dark:bg-${option.color}-600 text-white shadow-md border-2 border-${option.color}-600 dark:border-${option.color}-500`
                                    : `bg-${option.color}-50 dark:bg-${option.color}-900/20 text-${option.color}-700 dark:text-${option.color}-300 border-2 border-${option.color}-200 dark:border-${option.color}-700 hover:bg-${option.color}-100 dark:hover:bg-${option.color}-900/40`
                              }`}
                           >
                              <span>{option.icon}</span>
                              {option.label}
                              {isActive && <Check size={14} className="ml-auto" />}
                           </button>
                        );
                     })}
                  </div>
               </div>

               {/* Actions Section */}
               <div className="p-4 bg-slate-50 dark:bg-slate-900/30 space-y-2">
                  <button
                     onClick={() => { onEdit(); setShowMenu(false); }}
                     className="w-full px-3 py-2.5 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-2 border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all flex items-center justify-center gap-2 hover:shadow-md"
                  >
                     <Edit2 size={14} />
                     Edit User
                  </button>
                  <button
                     onClick={() => { onDelete(); setShowMenu(false); }}
                     className="w-full px-3 py-2.5 rounded-lg text-xs font-semibold bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-2 border-red-200 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all flex items-center justify-center gap-2 hover:shadow-md"
                  >
                     <Trash2 size={14} />
                     Delete User
                  </button>
               </div>
            </div>
         )}
      </div>
   );
}

function StatusIndicator({ status }) {
   const config = {
      Verified: { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-400/10', border: 'border-emerald-200 dark:border-emerald-400/20', icon: ShieldCheck },
      Active: { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-400/10', border: 'border-emerald-200 dark:border-emerald-400/20', icon: ShieldCheck },
      Pending: { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-400/10', border: 'border-amber-200 dark:border-amber-400/20', icon: AlertTriangle },
      Rejected: { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-400/10', border: 'border-red-200 dark:border-red-400/20', icon: AlertTriangle },
      Blocked: { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-400/10', border: 'border-red-200 dark:border-red-400/20', icon: AlertTriangle },
   };

   const { color, bg, border, icon: Icon } = config[status] || config['Pending'];

   return (
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${color} ${bg} ${border}`}>
         <Icon size={12} />
         <span>{status}</span>
      </div>
   );
}

function VerificationBadge({ status, isVerified }) {
   if (isVerified) {
      return (
         <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-400/10 border-green-200 dark:border-green-400/20">
            <CheckCircle2 size={12} />
            <span>Verified</span>
         </div>
      );
   }

   if (status === 'pending') {
      return (
         <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-400/10 border-amber-200 dark:border-amber-400/20">
            <Clock size={12} />
            <span>Pending</span>
         </div>
      );
   }

   return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-400/10 border-slate-200 dark:border-slate-400/20">
         <AlertTriangle size={12} />
         <span>Unverified</span>
      </div>
   );
}
