import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import { Download, FileText, Activity, AlertCircle, Plus, X, Search, Clock, ShieldCheck, History, Trash2 } from 'lucide-react';

export default function Reports() {
  const { reports, generateReport, listings, approvalHistory, fetchListings, fetchReports, user } = useApp();
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('Reports');
  const [dataLoading, setDataLoading] = useState(true);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loadingDelete, setLoadingDelete] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Try to load from cache first - populate state immediately
  useEffect(() => {
    try {
      const cached = sessionStorage.getItem('retex_cache_listings');
      const cachedReports = sessionStorage.getItem('retex_cache_reports');
      const cachedActivity = localStorage.getItem('retex_activity_logs');
      if (cached && cachedReports) {
        setDataLoading(false);
      } else {
        setDataLoading(true);
      }
    } catch (e) {
      console.warn('Cache read error:', e);
      setDataLoading(true);
    }
  }, []);

  // Fetch fresh data and activity logs
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch reports
        await fetchReports();
        
        // Fetch activity logs from Supabase
        const { data: logs, error } = await supabase
          .from('admin_activity_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
          
        if (!error && logs) {
          setActivityLogs(logs);
        }
        
        await fetchListings();
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setDataLoading(false);
      }
    };
    loadData();
  }, [fetchListings, fetchReports]);

  if (dataLoading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  // Calculate KPIs from real data
  const totalReports = reports?.length || 0;
  const pendingAudits = listings?.filter(l => l.status === 'Pending').length || 0;
  const todaysReports = reports?.filter(r => {
    const reportDate = new Date(r.created_at).toLocaleDateString();
    const today = new Date().toLocaleDateString();
    return reportDate === today;
  }).length || 0; 

  const handleGenerate = async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const name = formData.get('name');
      const type = formData.get('type');
      
      try {
        // Generate report
        await generateReport(name, type);
        
        // Log activity
        await supabase.from('admin_activity_logs').insert([{
          action: 'REPORT_GENERATED',
          admin_id: user?.id,
          admin_name: user?.name || 'Unknown',
          details: `Generated ${type} report: ${name}`,
          resource_type: 'REPORT',
          created_at: new Date().toISOString()
        }]);
        
        setShowGenerateModal(false);
        setSuccessMsg('✅ Report generated successfully');
        setTimeout(() => setSuccessMsg(''), 3000);
        await fetchReports();
      } catch (error) {
        console.error('Failed to generate report:', error);
      }
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Delete this report? This action cannot be undone.')) return;
    
    setLoadingDelete(reportId);
    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId);
        
      if (error) throw error;
      
      // Log activity
      await supabase.from('admin_activity_logs').insert([{
        action: 'REPORT_DELETED',
        admin_id: user?.id,
        admin_name: user?.name || 'Unknown',
        details: `Deleted report ID: ${reportId}`,
        resource_type: 'REPORT',
        created_at: new Date().toISOString()
      }]);
      
      setSuccessMsg('✅ Report deleted successfully');
      setTimeout(() => setSuccessMsg(''), 3000);
      await fetchReports();
    } catch (error) {
      console.error('Failed to delete report:', error);
      alert('Failed to delete report');
    } finally {
      setLoadingDelete(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Success Message */}
      {successMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 px-6 py-3 rounded-xl">
          {successMsg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <History className="text-blue-500" /> Platform Audit & Reports
           </h1>
           <p className="text-slate-500 dark:text-slate-400 mt-1">Review and manage system reports, audit logs, and administrative activities.</p>
        </div>
        <button 
           onClick={() => setShowGenerateModal(true)}
           className="bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-xl shadow-indigo-500/20 transition-all hover:scale-105 font-bold text-sm"
        >
           <Activity size={18} /> Generate Report
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <MetricCard 
            title="Total Reports" 
            value={totalReports} 
            icon={<FileText className="text-blue-500" />} 
            subtitle="All time"
         />
         <MetricCard 
            title="Today's Reports" 
            value={todaysReports} 
            icon={<Activity className="text-emerald-500" />} 
            subtitle="Generated"
         />
         <MetricCard 
            title="Pending Items" 
            value={pendingAudits} 
            icon={<AlertCircle className="text-amber-500" />} 
            subtitle="Require Review"
         />
      </div>

      {/* Main Container */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none">
         <div className="flex border-b border-slate-100 dark:border-slate-700 p-2 gap-2 bg-slate-50/50 dark:bg-slate-900/50">
            {['Reports', 'Activity Logs'].map(tab => (
               <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                     activeTab === tab 
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-700' 
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
               >
                  {tab}
               </button>
            ))}
         </div>

         <div className="min-h-[500px]">
            {activeTab === 'Reports' ? (
               <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {reports && reports.length > 0 ? (
                      reports.map((report) => (
                          <div key={report.id} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/10 transition-colors group">
                              <div className="flex items-center gap-6 flex-1">
                                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-500 transition-transform group-hover:scale-110">
                                      <FileText size={20} />
                                  </div>
                                  <div>
                                      <h4 className="font-bold text-slate-900 dark:text-white">{report.title || report.name}</h4>
                                      <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-tighter text-slate-400 mt-1">
                                          <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-md border border-blue-100 dark:border-blue-500/20">{report.type}</span>
                                          <div className="flex items-center gap-1">
                                             <Clock size={12} /> {new Date(report.created_at).toLocaleDateString()}
                                          </div>
                                      </div>
                                  </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <button 
                                   onClick={() => {
                                     const reportContent = `Report: ${report.title || report.name}\nType: ${report.type}\nGenerated: ${new Date(report.created_at).toLocaleString()}\n\nThis is a generated ${report.type} report from the ReTexValue platform.`;
                                     const blob = new Blob([reportContent], { type: 'text/plain' });
                                     const url = window.URL.createObjectURL(blob);
                                     const a = document.createElement('a');
                                     a.href = url;
                                     a.download = `${report.title || report.name}-${new Date(report.created_at).toISOString().split('T')[0]}.txt`;
                                     a.click();
                                     window.URL.revokeObjectURL(url);
                                   }}
                                   className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0"
                                >
                                   <Download size={14} /> Download
                                </button>
                                <button
                                  onClick={() => handleDeleteReport(report.id)}
                                  disabled={loadingDelete === report.id}
                                  className="flex items-center gap-2 px-3 py-2 border border-red-200 dark:border-red-500/30 rounded-xl text-[10px] font-black uppercase text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all shadow-sm opacity-0 group-hover:opacity-100 disabled:opacity-50 cursor-not-allowed"
                                >
                                   <Trash2 size={14} /> {loadingDelete === report.id ? 'Deleting...' : 'Delete'}
                                </button>
                              </div>
                          </div>
                      ))
                  ) : (
                      <EmptyState icon={<FileText size={48} />} text="No reports generated. Click above to create one." />
                  )}
               </div>
            ) : (
               <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {activityLogs && activityLogs.length > 0 ? (
                      activityLogs.map((log) => (
                          <div key={log.id} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/10 transition-colors group">
                              <div className="flex items-center gap-6 flex-1">
                                  <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-500">
                                      <Activity size={20} />
                                  </div>
                                  <div>
                                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                         {log.action.replace(/_/g, ' ')}: <span className="text-slate-900 dark:text-white">{log.details}</span>
                                      </p>
                                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                         By <span className="font-bold">{log.admin_name}</span>
                                      </p>
                                  </div>
                              </div>
                              <div className="text-[10px] font-black text-slate-400 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 uppercase tracking-widest">
                                 {new Date(log.created_at).toLocaleDateString()}
                              </div>
                          </div>
                      ))
                  ) : (
                      <EmptyState icon={<History size={48} />} text="No administrative actions logged yet." />
                  )}
               </div>
            )}
         </div>
      </div>

      {/* Modal */}
      {showGenerateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
             <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-250">
                <div className="flex justify-between items-center mb-8">
                   <h2 className="text-2xl font-black text-slate-900 dark:text-white">Create Report</h2>
                   <button onClick={() => setShowGenerateModal(false)} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors">
                      <X size={20} />
                   </button>
                </div>
                <form onSubmit={handleGenerate} className="space-y-6">
                   <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Internal Report Label</label>
                      <input name="name" required placeholder="e.g. FY24 Q3 Compliance" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-medium" />
                   </div>
                   <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Data Vertical</label>
                      <select name="type" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-bold appearance-none">
                         <option value="Financial">Financial Audit</option>
                         <option value="Operational">Operational Analytics</option>
                         <option value="Security">Security Profile</option>
                         <option value="Audit">Legal Compliance</option>
                      </select>
                   </div>
                   <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-2xl border border-blue-100 dark:border-blue-500/20">
                      <p className="text-[10px] leading-relaxed text-blue-600 font-bold uppercase tracking-tight">
                         Note: Report generation may take up to 60 seconds depending on dataset volume.
                      </p>
                   </div>
                   <button type="submit" className="w-full bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-indigo-500/10 tracking-widest uppercase text-xs">
                      Initiate Generation
                   </button>
                </form>
             </div>
          </div>
      )}
    </div>
  );
}

function MetricCard({ title, value, icon, subtitle }) {
   return (
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/40 dark:shadow-none transition-transform hover:-translate-y-1">
         <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-2xl ring-1 ring-slate-100 dark:ring-slate-700 bg-slate-50 dark:bg-slate-900/50">
               {React.cloneElement(icon, { size: 22 })}
            </div>
         </div>
         <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{title}</p>
         <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{value}</h3>
         <p className="text-[11px] font-bold text-slate-500 mt-1 uppercase opacity-60 tracking-tight">{subtitle}</p>
      </div>
   );
}

function EmptyState({ icon, text }) {
   return (
      <div className="p-20 text-center flex flex-col items-center gap-4 text-slate-400">
         <div className="opacity-10">{icon}</div>
         <p className="text-sm font-bold">{text}</p>
      </div>
   );
}

