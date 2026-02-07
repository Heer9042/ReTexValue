import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Send, Package, Calendar, FileText, MapPin, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function FactoryBulkRequests() {
  const { bulkRequests, user, proposals, fetchBulkRequests, fetchProposals } = useApp();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch bulk requests on mount
  useEffect(() => {
    const loadData = async () => {
      // Check if we have cached data - if yes, don't show loader
      const hasData = bulkRequests && bulkRequests.length > 0;
      
      if (!hasData) {
        setLoading(true);
      }
      
      try {
        await Promise.all([
          fetchBulkRequests(),
          fetchProposals()
        ]);
      } catch (error) {
        console.error('Failed to load bulk requests:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchBulkRequests, fetchProposals]);

  // Filter bulk requests that this factory hasn't already responded to
  const availableRequests = bulkRequests.filter(request => {
    // Only show requests that are open/active
    if (request.status !== 'Open' && request.status !== 'Active') return false;

    // Check if factory has already submitted a proposal for this request
    const hasProposed = proposals.some(p =>
      p.requestId === request.id && p.factoryId === user?.id
    );

    return !hasProposed;
  });

  const filteredRequests = availableRequests.filter(request => {
    const matchesFilter = filter === 'All' ||
                         request.fabricCategory === filter ||
                         request.fabricType.toLowerCase().includes(filter.toLowerCase());

    const matchesSearch = request.fabricType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.buyerName?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const categories = ['All', ...new Set(availableRequests.map(r => r.fabricCategory).filter(Boolean))];

  const handleSubmitProposal = (requestId) => {
    navigate(`/factory/proposal/${requestId}`);
  };

  if (loading && (!bulkRequests || bulkRequests.length === 0)) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading bulk requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Bulk Requests</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Browse and respond to bulk material requests from buyers.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>
        <div className="sm:w-48">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none appearance-none cursor-pointer"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-20 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-400 mb-4">
            <Package size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No new requests</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            There are no new bulk requests available at the moment. Check back later for new opportunities.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredRequests.map(request => (
            <div key={request.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all shadow-sm hover:shadow-md">
              <div className="flex flex-col lg:flex-row justify-between gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-4 flex-wrap">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      {request.fabricCategory} - {request.fabricType}
                    </h3>
                    <StatusBadge status={request.status} />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-slate-100 dark:border-slate-700/50">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Quantity</p>
                      <p className="text-slate-900 dark:text-white font-bold text-lg">{request.quantity}kg</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Target Price</p>
                      <p className="text-emerald-600 dark:text-emerald-400 font-bold text-lg">₹{request.targetPrice}/kg</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Deadline</p>
                      <p className="text-slate-900 dark:text-white font-medium">{new Date(request.deadline).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Buyer</p>
                      <p className="text-slate-900 dark:text-white font-medium">{request.buyerName}</p>
                    </div>
                  </div>

                  {request.description && (
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300">
                      {request.description}
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>Posted {new Date(request.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>{Math.ceil((new Date(request.deadline) - new Date()) / (1000 * 60 * 60 * 24))} days left</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center gap-3 min-w-[200px] border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-700 pt-6 lg:pt-0 lg:pl-8">
                  <button
                    onClick={() => handleSubmitProposal(request.id)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-6 rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Send size={18} /> Submit Proposal
                  </button>
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                    Compete with other factories for this opportunity
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Open: "bg-green-100 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20",
    Active: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
    Matched: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  };

  return (
    <span className={`
      ${styles[status] || styles.Open}
      px-2.5 py-0.5 text-xs rounded-full font-bold border flex items-center gap-1.5 w-fit
    `}>
      {status === 'Open' && <CheckCircle size={12} />}
      {status === 'Active' && <Clock size={12} />}
      {status === 'Matched' && <CheckCircle size={12} />}
      {status}
    </span>
  );
}