import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, Factory, Search, CheckCircle2, ShieldCheck, MapPin, ArrowRight, XCircle } from 'lucide-react';

const ASSIGNMENTS_KEY = 'bulkRequestAssignments';

function loadAssignments() {
  try {
    const raw = localStorage.getItem(ASSIGNMENTS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function saveAssignments(assignments) {
  localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments));
}

export default function AdminMatchFactory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { bulkRequests, users, logApprovalAction } = useApp();

  const req = bulkRequests.find(r => String(r.id) === String(id));

  const [search, setSearch] = useState('');
  const [selectedFactoryIds, setSelectedFactoryIds] = useState([]);
  const [assignedFactoryIds, setAssignedFactoryIds] = useState([]);

  useEffect(() => {
    const assignments = loadAssignments();
    const existing = assignments[String(id)] || [];
    setAssignedFactoryIds(existing);
  }, [id]);

  const factories = useMemo(() => {
    const verifiedFactories = users.filter(u => u.role === 'Factory' && u.status === 'Verified');
    const q = search.trim().toLowerCase();
    const filtered = q
      ? verifiedFactories.filter(f =>
          (f.name || '').toLowerCase().includes(q) ||
          (f.email || '').toLowerCase().includes(q) ||
          (f.location || '').toLowerCase().includes(q) ||
          (f.type || '').toLowerCase().includes(q)
        )
      : verifiedFactories;

    // Simple heuristic ranking: location match first, then name.
    const wanted = `${req?.fabricType || ''} ${req?.fabricCategory || ''}`.trim(); // placeholder for future matching logic
    void wanted;
    return filtered.sort((a, b) => {
      const aLoc = (a.location || '').toLowerCase();
      const bLoc = (b.location || '').toLowerCase();
      const hasReqLocation = Boolean(req?.location);
      const reqLoc = hasReqLocation ? String(req.location).toLowerCase() : '';
      const aScore = hasReqLocation && reqLoc ? (aLoc.includes(reqLoc) ? 1 : 0) : 0;
      const bScore = hasReqLocation && reqLoc ? (bLoc.includes(reqLoc) ? 1 : 0) : 0;
      if (bScore !== aScore) return bScore - aScore;
      return (a.name || '').localeCompare(b.name || '');
    });
  }, [users, search, req]);

  const toggleSelect = (factoryId) => {
    setSelectedFactoryIds((prev) =>
      prev.includes(factoryId) ? prev.filter((x) => x !== factoryId) : [...prev, factoryId]
    );
  };

  const assignSelected = () => {
    if (selectedFactoryIds.length === 0) {
      alert('Please select at least one factory to assign.');
      return;
    }

    const assignments = loadAssignments();
    const existing = new Set(assignments[String(id)] || []);
    selectedFactoryIds.forEach(fid => existing.add(fid));
    const updated = Array.from(existing);
    assignments[String(id)] = updated;
    saveAssignments(assignments);
    setAssignedFactoryIds(updated);
    setSelectedFactoryIds([]);

    logApprovalAction('Factory Matched', `BulkRequest:${String(id).slice(0, 8)}`);
    alert('Factories assigned successfully (saved locally).');
  };

  const unassignFactory = (factoryId) => {
    const assignments = loadAssignments();
    const current = (assignments[String(id)] || []).filter(fid => fid !== factoryId);
    assignments[String(id)] = current;
    saveAssignments(assignments);
    setAssignedFactoryIds(current);
    logApprovalAction('Factory Unassigned', `BulkRequest:${String(id).slice(0, 8)}`);
  };

  if (!req) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <button
          onClick={() => navigate('/admin/bulk-requests')}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={18} /> Back to Bulk Requests
        </button>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-10 text-center">
          <Factory size={44} className="mx-auto text-slate-300 mb-4" />
          <h1 className="text-xl font-black text-slate-900 dark:text-white">Request not found</h1>
          <p className="text-slate-500 mt-2">This bulk request may have been removed or is not loaded yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <button
            onClick={() => navigate(`/admin/bulk-requests/${req.id}`)}
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={18} /> Back to Details
          </button>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Match <span className="text-blue-600">Factories</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            {req.fabricType} • {req.fabricCategory} • {req.quantity} kg
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            to={`/admin/bulk-requests/${req.id}`}
            className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            View Details
          </Link>
          <button
            onClick={assignSelected}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
          >
            <CheckCircle2 size={16} /> Assign Selected ({selectedFactoryIds.length})
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search factories by name, email, location..."
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white"
                />
              </div>
              <div className="text-xs font-black text-slate-400 bg-slate-100 dark:bg-slate-900 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                {factories.length} verified factories
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {factories.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-12 text-center text-slate-500">
                <Factory size={44} className="mx-auto opacity-20 mb-4" />
                <p className="font-bold">No verified factories found.</p>
                <p className="text-sm mt-1">Try adjusting your search or verify factories in “Manage Users”.</p>
              </div>
            ) : (
              factories.map((f) => {
                const isSelected = selectedFactoryIds.includes(f.id);
                const isAssigned = assignedFactoryIds.includes(f.id);
                return (
                  <div
                    key={f.id}
                    className={`p-5 rounded-3xl border transition-colors bg-white dark:bg-slate-800 ${
                      isSelected ? 'border-blue-500' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-100 dark:border-emerald-500/20">
                            <Factory size={18} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-black text-slate-900 dark:text-white truncate">{f.name}</p>
                            <p className="text-xs text-slate-500 truncate">{f.email}</p>
                          </div>
                          <span className="ml-auto sm:ml-0 inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
                            <ShieldCheck size={12} /> Verified
                          </span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1">
                            <MapPin size={12} className="opacity-70" /> {f.location || 'N/A'}
                          </span>
                          <span className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-700 font-bold">
                            {f.type || 'Factory'}
                          </span>
                          {isAssigned && (
                            <span className="px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20 font-bold">
                              Assigned
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 sm:justify-end">
                        <button
                          onClick={() => toggleSelect(f.id)}
                          className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-colors ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          {isSelected ? 'Selected' : 'Select'}
                        </button>
                        {isAssigned && (
                          <button
                            onClick={() => unassignFactory(f.id)}
                            className="px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/20 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors"
                            title="Unassign"
                          >
                            <XCircle size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Assigned factories</h3>
            {assignedFactoryIds.length === 0 ? (
              <p className="text-sm text-slate-500">No assignments yet.</p>
            ) : (
              <div className="space-y-2">
                {assignedFactoryIds.map((fid) => {
                  const f = users.find(u => u.id === fid);
                  return (
                    <div
                      key={fid}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700/50 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-black text-slate-900 dark:text-white truncate">{f?.name || `Factory ${String(fid).slice(0, 6)}`}</p>
                        <p className="text-xs text-slate-500 truncate">{f?.location || 'N/A'}</p>
                      </div>
                      <button
                        onClick={() => unassignFactory(fid)}
                        className="p-2 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors text-rose-500"
                        title="Unassign"
                      >
                        <XCircle size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-2xl shadow-slate-900/20 border border-white/5">
            <h3 className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-3">Tip</h3>
            <p className="text-lg font-black tracking-tight">Want better matching?</p>
            <p className="text-[11px] text-slate-300 mt-3 leading-relaxed">
              If you store factory specialties (supported fabrics / capacity / region) in the database, this page can rank factories automatically.
            </p>
            <button
              onClick={() => navigate(`/admin/bulk-requests/${req.id}`)}
              className="mt-6 inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-white/10 hover:bg-white/15 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
            >
              Back to request <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


