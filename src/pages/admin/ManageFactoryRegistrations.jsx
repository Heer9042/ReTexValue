import React, { useState, useEffect } from 'react';
import { Search, Check, X, Loader2, Factory, Mail, Phone, MapPin, Building2, FileText, Clock, CheckCircle2, AlertTriangle, Filter, MoreVertical, ChevronDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function ManageFactoryRegistrations() {
  const { users, fetchUsers, updateVerificationStatus, updateUserStatus } = useApp();
  console.log('📊 [ManageFactoryRegistrations] Users loaded:', users.length);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // All, Unverified, Verified
  const [selectedFactory, setSelectedFactory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [approvalNote, setApprovalNote] = useState('');
  const [rejectionNote, setRejectionNote] = useState('');
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState(null); // 'approve' or 'reject'

  // Fetch users on component mount
  useEffect(() => {
    const loadUsers = async () => {
      const hasCachedUsers = sessionStorage.getItem('retex_cache_users');
      if (!hasCachedUsers) {
        setIsLoading(true);
      }

      try {
        await fetchUsers();
        console.log('✅ [FactoryRegistrations] Factories loaded');
      } catch (error) {
        console.error('❌ [FactoryRegistrations] Failed to load factories:', error);
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
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Filter factories by verification status
  const filteredFactories = users
    .filter(u => u.role === 'factory' || u.role === 'Factory')
    .filter(u => {
      const matchesSearch = 
        (u.name || '').toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || 
        (u.email || '').toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        (u.companyName || '').toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      
      const matchesStatus = 
        statusFilter === 'All' || 
        (statusFilter === 'Unverified' && u.verificationStatus === 'unverified') ||
        (statusFilter === 'Verified' && u.verificationStatus === 'verified');
      
      return matchesSearch && matchesStatus;
    });

  const handleApprove = async () => {
    if (!selectedFactory) return;
    
    try {
      console.log(`✅ Approving factory: ${selectedFactory.id}`);
      
      // Update verification status to verified
      await updateVerificationStatus(selectedFactory.id, 'verified');
      
      // Update account status to Verified (so they can login)
      await updateUserStatus(selectedFactory.id, 'Verified', selectedFactory.name);
      
      // Refresh the users list to show updated status
      await fetchUsers();
      
      alert(`✅ ${selectedFactory.name} has been approved! They can now login.`);
      setShowActionModal(false);
      setSelectedFactory(null);
      setApprovalNote('');
    } catch (error) {
      console.error('❌ Approval failed:', error);
      alert(`Failed to approve: ${error.message}`);
    }
  };

  const handleReject = async () => {
    if (!selectedFactory) return;
    
    try {
      console.log(`❌ Rejecting factory: ${selectedFactory.id}`);
      
      // Update verification status to rejected
      await updateVerificationStatus(selectedFactory.id, 'rejected');
      
      // Update account status to show rejection
      await updateUserStatus(selectedFactory.id, 'Rejected', selectedFactory.name);
      
      // Refresh the users list
      await fetchUsers();
      
      alert(`❌ ${selectedFactory.name}'s registration was not approved. They will be notified at their email.`);
      setShowActionModal(false);
      setSelectedFactory(null);
      setRejectionNote('');
    } catch (error) {
      console.error('❌ Rejection failed:', error);
      alert(`Failed to reject: ${error.message}`);
    }
  };

  const VerificationBadge = ({ status }) => {
    if (status === 'verified') {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CheckCircle2 size={14} />
          <span>Verified</span>
        </div>
      );
    }

    if (status === 'rejected') {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <AlertTriangle size={14} />
          <span>Rejected</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
        <Clock size={14} />
        <span>Pending Approval</span>
      </div>
    );
  };

  const pendingCount = users.filter(u => (u.role === 'factory' || u.role === 'Factory') && u.verificationStatus === 'unverified').length;
  const approvedCount = users.filter(u => (u.role === 'factory' || u.role === 'Factory') && u.verificationStatus === 'verified').length;
  const rejectedCount = users.filter(u => (u.role === 'factory' || u.role === 'Factory') && u.verificationStatus === 'rejected').length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Factory className="text-emerald-600" size={32} />
            Factory Registrations
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and approve new seller registrations</p>
        </div>

        {/* Stats */}
        <div className="flex gap-4 flex-wrap">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <p className="text-amber-600 dark:text-amber-400 text-sm font-semibold">Pending Approval</p>
            <p className="text-2xl font-bold text-amber-700 dark:text-amber-300 mt-1">{pendingCount}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-green-600 dark:text-green-400 text-sm font-semibold">Approved</p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300 mt-1">{approvedCount}</p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400 text-sm font-semibold">Rejected</p>
            <p className="text-2xl font-bold text-red-700 dark:text-red-300 mt-1">{rejectedCount}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Status Filter */}
          <div className="relative">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 pl-10 pr-8 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none w-full sm:w-40"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending Approval</option>
              <option value="Verified">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
            <Filter className="absolute left-3 top-3 text-slate-500 w-4 h-4 pointer-events-none" />
          </div>

          {/* Search */}
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="Search by name, email, or company..."
              className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-3 text-slate-500 w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Factories List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin w-8 h-8 text-emerald-500" />
          </div>
        ) : filteredFactories.length === 0 ? (
          <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-12 text-center">
            <Factory className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400 text-lg">No factories found</p>
          </div>
        ) : (
          filteredFactories.map(factory => (
            <div 
              key={factory.id}
              className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-6 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all group"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Factory Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-bold text-sm">
                      {factory.name ? factory.name.charAt(0).toUpperCase() : 'F'}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {factory.name}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {factory.companyName}
                      </p>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Mail size={16} className="text-slate-400" />
                      <a href={`mailto:${factory.email}`} className="hover:text-emerald-600 dark:hover:text-emerald-400 truncate">
                        {factory.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Phone size={16} className="text-slate-400" />
                      <span>{factory.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <MapPin size={16} className="text-slate-400" />
                      <span>{factory.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <VerificationBadge status={factory.verificationStatus} />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {factory.verificationStatus === 'unverified' && (
                  <div className="flex gap-2 md:flex-col">
                    <button
                      onClick={() => {
                        setSelectedFactory(factory);
                        setActionType('approve');
                        setShowActionModal(true);
                      }}
                      className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Check size={16} />
                      <span className="hidden md:inline">Approve</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedFactory(factory);
                        setActionType('reject');
                        setShowActionModal(true);
                      }}
                      className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                      <X size={16} />
                      <span className="hidden md:inline">Reject</span>
                    </button>
                  </div>
                )}

                {factory.verificationStatus === 'verified' && (
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <CheckCircle2 size={18} className="text-green-600 dark:text-green-400" />
                    <span className="text-sm font-semibold text-green-700 dark:text-green-300">Approved</span>
                  </div>
                )}

                {factory.verificationStatus === 'rejected' && (
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <AlertTriangle size={18} className="text-red-600 dark:text-red-400" />
                    <span className="text-sm font-semibold text-red-700 dark:text-red-300">Rejected</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Action Modal */}
      {showActionModal && selectedFactory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in scale-95 duration-200">
            <div className="flex items-center gap-3">
              {actionType === 'approve' ? (
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Check className="text-green-600 dark:text-green-400" size={24} />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <X className="text-red-600 dark:text-red-400" size={24} />
                </div>
              )}
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">
                  {actionType === 'approve' ? 'Approve Factory' : 'Reject Application'}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{selectedFactory.name}</p>
              </div>
            </div>

            <p className="text-slate-600 dark:text-slate-300">
              {actionType === 'approve' 
                ? 'This factory will be able to login and start selling.' 
                : 'This factory will not be able to login until approved.'}
            </p>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                {actionType === 'approve' ? 'Approval Notes (Optional)' : 'Rejection Reason (Optional)'}
              </label>
              <textarea
                value={actionType === 'approve' ? approvalNote : rejectionNote}
                onChange={(e) => actionType === 'approve' 
                  ? setApprovalNote(e.target.value) 
                  : setRejectionNote(e.target.value)}
                placeholder="Add any notes..."
                rows="3"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setShowActionModal(false);
                  setSelectedFactory(null);
                  setApprovalNote('');
                  setRejectionNote('');
                }}
                className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={actionType === 'approve' ? handleApprove : handleReject}
                className={`flex-1 px-4 py-2.5 text-white font-semibold rounded-lg transition-all ${
                  actionType === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {actionType === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}