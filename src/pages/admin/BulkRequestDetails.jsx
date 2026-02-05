import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, FileText, User, Calendar, Package, IndianRupee, ClipboardList, ArrowRight } from 'lucide-react';

export default function AdminBulkRequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { bulkRequests, proposals, fetchBulkRequests, fetchProposals } = useApp();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchBulkRequests(), fetchProposals()]);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchBulkRequests, fetchProposals]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const req = bulkRequests.find(r => String(r.id) === String(id));
  const relatedProposals = proposals.filter(p => String(p.requestId) === String(id));

  if (!req) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <button
          onClick={() => navigate('/admin/bulk-requests')}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={18} /> Back to Bulk Requests
        </button>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-10 text-center">
          <FileText size={44} className="mx-auto text-slate-300 mb-4" />
          <h1 className="text-xl font-black text-slate-900 dark:text-white">Request not found</h1>
          <p className="text-slate-500 mt-2">This bulk request may have been removed or is not loaded yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <button
            onClick={() => navigate('/admin/bulk-requests')}
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={18} /> Back to Bulk Requests
          </button>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Bulk Request <span className="text-blue-600">Details</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            Request ID: <span className="font-mono">{String(req.id).slice(0, 12)}</span>
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            to={`/admin/bulk-requests/${req.id}/match`}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
          >
            Match Factory <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-900 text-slate-500">
                <Package size={18} />
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Material Requirements</h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <InfoTile label="Fabric Type" value={req.fabricType || 'N/A'} icon={<Package size={14} />} />
              <InfoTile label="Category" value={req.fabricCategory || 'N/A'} icon={<ClipboardList size={14} />} />
              <InfoTile label="Quantity" value={`${req.quantity ?? 0} kg`} icon={<Package size={14} />} />
              <InfoTile
                label="Target Price"
                value={req.targetPrice ? `₹${req.targetPrice}/kg` : 'Market'}
                icon={<IndianRupee size={14} />}
              />
              <InfoTile label="Deadline" value={req.deadline || 'N/A'} icon={<Calendar size={14} />} />
              <InfoTile label="Buyer" value={req.buyerName || 'N/A'} icon={<User size={14} />} />
            </div>

            <div className="mt-6 p-5 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700/50 rounded-2xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Description</p>
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                {req.description || 'No description provided.'}
              </p>
            </div>
          </section>

          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-500">
                <FileText size={18} />
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Proposals</h2>
              <span className="ml-auto text-xs font-black text-slate-400 bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-full">
                {relatedProposals.length}
              </span>
            </div>

            {relatedProposals.length === 0 ? (
              <div className="p-10 text-center text-slate-400">
                <FileText size={44} className="mx-auto opacity-10 mb-3" />
                <p className="text-sm font-bold">No proposals received yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {relatedProposals.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-500/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-black text-slate-900 dark:text-white">{p.factoryName || 'Factory'}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          Price: <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{p.pricePerKg}/kg</span> • Total:{' '}
                          <span className="font-bold">₹{Number(p.totalPrice || 0).toLocaleString()}</span>
                        </p>
                        {p.message && <p className="text-xs text-slate-500 mt-2 italic">“{p.message}”</p>}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-500">
                        {p.status || 'Pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-slate-900 text-white rounded-3xl p-8 shadow-2xl shadow-slate-900/20 border border-white/5">
            <h3 className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-3">Next action</h3>
            <p className="text-2xl font-black tracking-tight">Match factories</p>
            <p className="text-[11px] text-slate-300 mt-3 leading-relaxed">
              Use the matching workflow to shortlist verified factories, assign the request, and log the action for audit.
            </p>
            <Link
              to={`/admin/bulk-requests/${req.id}/match`}
              className="mt-6 inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
            >
              Open matching <ArrowRight size={16} />
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}

function InfoTile({ label, value, icon }) {
  return (
    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700/50">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
        <span className="opacity-70">{icon}</span>
        {label}
      </div>
      <div className="text-sm font-black text-slate-900 dark:text-white">{value}</div>
    </div>
  );
}


