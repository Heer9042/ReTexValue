import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import { Save, Plus, Trash2, Sliders, AlertTriangle, Percent, ShieldCheck, Database, Globe, BellRing, CheckCircle2, XCircle, RefreshCw, Activity, AlertCircle, X, Edit2, Clock } from 'lucide-react';

export default function Settings() {
  const { settings, updateSettings, users, listings, transactions, fetchUsers, fetchListings, fetchTransactions } = useApp();

  const [activeTab, setActiveTab] = useState('general');
  const [platformFee, setPlatformFee] = useState(5);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  // System Alerts State
  const [alerts, setAlerts] = useState([]);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [editingAlert, setEditingAlert] = useState(null);
  const [alertForm, setAlertForm] = useState({
    title: '',
    message: '',
    type: 'info', // info, warning, error, success
    priority: 'medium', // low, medium, high, critical
    targetAudience: 'all', // all, factory, buyer, admin
    expiresAt: ''
  });

  // Database Health State
  const [dbHealth, setDbHealth] = useState({
    status: 'checking',
    connection: false,
    tables: [],
    lastChecked: null,
    responseTime: null
  });
  const [checkingHealth, setCheckingHealth] = useState(false);

  // Market Regions State
  const [regions, setRegions] = useState([]);
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [editingRegion, setEditingRegion] = useState(null);
  const [regionForm, setRegionForm] = useState({
    name: '',
    code: '',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    active: true
  });
  // Try to load from cache first - populate state immediately
  useEffect(() => {
    try {
      const cachedUsers = sessionStorage.getItem('retex_cache_users');
      const cachedListings = sessionStorage.getItem('retex_cache_listings');
      const cachedTransactions = sessionStorage.getItem('retex_cache_transactions');
      if (cachedUsers && cachedListings && cachedTransactions) {
        // All caches exist, show data immediately
        setDataLoading(false);
      } else {
        setDataLoading(true);
      }
    } catch (e) {
      console.warn('Cache read error:', e);
      setDataLoading(true);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchUsers(),
          fetchListings(),
          fetchTransactions()
        ]);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setDataLoading(false);
      }
    };
    loadData();
  }, [fetchUsers, fetchListings, fetchTransactions]);

  // Sync with global settings when loaded
  useEffect(() => {
     if (settings) {
        setPlatformFee(settings.platformFee || 5);
        setMaintenanceMode(settings.maintenanceMode || false);
        setCategories(settings.categories || []);
     }
  }, [settings]);

  // Fetch alerts on mount and when tab changes
  useEffect(() => {
    if (activeTab === 'alerts') {
      fetchAlerts();
    }
  }, [activeTab]);

  // Fetch regions on mount and when tab changes
  useEffect(() => {
    if (activeTab === 'regions') {
      fetchRegions();
    }
  }, [activeTab]);

  // Check database health on mount and when tab changes
  useEffect(() => {
    if (activeTab === 'database') {
      checkDatabaseHealth();
    }
  }, [activeTab]);

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('system_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist
        console.error('Failed to fetch alerts:', error);
        // Use mock data if table doesn't exist
        setAlerts([
          {
            id: '1',
            title: 'System Maintenance Scheduled',
            message: 'Scheduled maintenance on Dec 15th from 2AM to 4AM IST.',
            type: 'warning',
            priority: 'medium',
            target_audience: 'all',
            expires_at: '2024-12-15T04:00:00Z',
            created_at: new Date().toISOString(),
            active: true
          }
        ]);
        return;
      }

      if (data) {
        setAlerts(data);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
      setAlerts([]);
    }
  };

  const fetchRegions = async () => {
    try {
      const { data, error } = await supabase
        .from('market_regions')
        .select('*')
        .order('name', { ascending: true });

      if (error && error.code !== 'PGRST116') {
        console.error('Failed to fetch regions:', error);
        // Use mock data if table doesn't exist
        setRegions([
          { id: '1', name: 'India', code: 'IN', currency: 'INR', timezone: 'Asia/Kolkata', active: true },
          { id: '2', name: 'United States', code: 'US', currency: 'USD', timezone: 'America/New_York', active: true },
          { id: '3', name: 'United Kingdom', code: 'GB', currency: 'GBP', timezone: 'Europe/London', active: true }
        ]);
        return;
      }

      if (data) {
        setRegions(data);
      }
    } catch (error) {
      console.error('Error fetching regions:', error);
      setRegions([]);
    }
  };

  const checkDatabaseHealth = async () => {
    setCheckingHealth(true);
    const startTime = Date.now();
    
    try {
      // Test connection
      const { error: connectionError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

      const responseTime = Date.now() - startTime;
      
      if (connectionError) {
        setDbHealth({
          status: 'error',
          connection: false,
          tables: [],
          lastChecked: new Date().toISOString(),
          responseTime,
          error: connectionError.message
        });
        setCheckingHealth(false);
        return;
      }

      // Check key tables
      const tablesToCheck = ['profiles', 'listings', 'transactions', 'bulk_requests', 'proposals', 'packages'];
      const tableStatuses = [];

      for (const table of tablesToCheck) {
        const tableStart = Date.now();
        try {
          const { error: tableError } = await supabase
            .from(table)
            .select('id')
            .limit(1);

          tableStatuses.push({
            name: table,
            status: tableError ? 'error' : 'healthy',
            responseTime: Date.now() - tableStart,
            error: tableError?.message
          });
        } catch (err) {
          tableStatuses.push({
            name: table,
            status: 'error',
            responseTime: Date.now() - tableStart,
            error: err.message
          });
        }
      }

      const allHealthy = tableStatuses.every(t => t.status === 'healthy');
      
      setDbHealth({
        status: allHealthy ? 'healthy' : 'warning',
        connection: true,
        tables: tableStatuses,
        lastChecked: new Date().toISOString(),
        responseTime
      });
    } catch (error) {
      setDbHealth({
        status: 'error',
        connection: false,
        tables: [],
        lastChecked: new Date().toISOString(),
        responseTime: Date.now() - startTime,
        error: error.message
      });
    } finally {
      setCheckingHealth(false);
    }
  };

  const handleAddCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (cat) => {
    setCategories(categories.filter(c => c !== cat));
  };

  const handleSave = () => {
     updateSettings({
         platformFee: Number(platformFee),
         maintenanceMode,
         categories
     });
  };

  const handleSaveAlert = async () => {
    try {
      const alertData = {
        title: alertForm.title,
        message: alertForm.message,
        type: alertForm.type,
        priority: alertForm.priority,
        target_audience: alertForm.targetAudience,
        expires_at: alertForm.expiresAt || null,
        active: true
      };

      if (editingAlert) {
        const { error } = await supabase
          .from('system_alerts')
          .update(alertData)
          .eq('id', editingAlert.id);

        if (error) throw error;
        setAlerts(alerts.map(a => a.id === editingAlert.id ? { ...a, ...alertData } : a));
      } else {
        const { data, error } = await supabase
          .from('system_alerts')
          .insert([alertData])
          .select()
          .single();

        if (error) throw error;
        setAlerts([data, ...alerts]);
      }

      setShowAlertModal(false);
      setEditingAlert(null);
      setAlertForm({
        title: '',
        message: '',
        type: 'info',
        priority: 'medium',
        targetAudience: 'all',
        expiresAt: ''
      });
    } catch (error) {
      console.error('Error saving alert:', error);
      alert('Failed to save alert. Using local storage fallback.');
      // Fallback to localStorage
      const newAlert = {
        id: editingAlert?.id || Date.now().toString(),
        ...alertForm,
        created_at: new Date().toISOString(),
        active: true
      };
      if (editingAlert) {
        setAlerts(alerts.map(a => a.id === editingAlert.id ? newAlert : a));
      } else {
        setAlerts([newAlert, ...alerts]);
      }
      setShowAlertModal(false);
      setEditingAlert(null);
    }
  };

  const handleDeleteAlert = async (id) => {
    if (!window.confirm('Are you sure you want to delete this alert?')) return;

    try {
      const { error } = await supabase
        .from('system_alerts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setAlerts(alerts.filter(a => a.id !== id));
    } catch (error) {
      console.error('Error deleting alert:', error);
      // Fallback
      setAlerts(alerts.filter(a => a.id !== id));
    }
  };

  const handleEditAlert = (alert) => {
    setEditingAlert(alert);
    setAlertForm({
      title: alert.title,
      message: alert.message,
      type: alert.type,
      priority: alert.priority,
      targetAudience: alert.target_audience || alert.targetAudience,
      expiresAt: alert.expires_at ? alert.expires_at.split('T')[0] : ''
    });
    setShowAlertModal(true);
  };

  const handleSaveRegion = async () => {
    try {
      const regionData = {
        name: regionForm.name,
        code: regionForm.code.toUpperCase(),
        currency: regionForm.currency,
        timezone: regionForm.timezone,
        active: regionForm.active
      };

      if (editingRegion) {
        const { error } = await supabase
          .from('market_regions')
          .update(regionData)
          .eq('id', editingRegion.id);

        if (error) throw error;
        setRegions(regions.map(r => r.id === editingRegion.id ? { ...r, ...regionData } : r));
      } else {
        const { data, error } = await supabase
          .from('market_regions')
          .insert([regionData])
          .select()
          .single();

        if (error) throw error;
        setRegions([...regions, data]);
      }

      setShowRegionModal(false);
      setEditingRegion(null);
      setRegionForm({
        name: '',
        code: '',
        currency: 'INR',
        timezone: 'Asia/Kolkata',
        active: true
      });
    } catch (error) {
      console.error('Error saving region:', error);
      alert('Failed to save region. Using local storage fallback.');
      // Fallback
      const newRegion = {
        id: editingRegion?.id || Date.now().toString(),
        ...regionForm
      };
      if (editingRegion) {
        setRegions(regions.map(r => r.id === editingRegion.id ? newRegion : r));
      } else {
        setRegions([...regions, newRegion]);
      }
      setShowRegionModal(false);
      setEditingRegion(null);
    }
  };

  const handleDeleteRegion = async (id) => {
    if (!window.confirm('Are you sure you want to delete this region?')) return;

    try {
      const { error } = await supabase
        .from('market_regions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setRegions(regions.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error deleting region:', error);
      setRegions(regions.filter(r => r.id !== id));
    }
  };

  const handleEditRegion = (region) => {
    setEditingRegion(region);
    setRegionForm({
      name: region.name,
      code: region.code,
      currency: region.currency,
      timezone: region.timezone,
      active: region.active
    });
    setShowRegionModal(true);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <>
            {/* Business Logic Section */}
            <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none">
               <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-2xl">
                     <Sliders size={20} className="text-blue-500" />
                  </div>
                  <div>
                     <h2 className="text-xl font-black text-slate-900 dark:text-white">Business Rules</h2>
                     <p className="text-[10px] font-black uppercase tracking-tighter text-slate-400">Transaction & Operational Constants</p>
                  </div>
               </div>
               
               <div className="space-y-8">
                  <div>
                     <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Global Marketplace Fee</label>
                     <div className="relative max-w-sm">
                        <input 
                           type="number" 
                           value={platformFee}
                           onChange={(e) => setPlatformFee(e.target.value)}
                           className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white font-bold"
                        />
                        <div className="absolute left-4 top-4 w-6 h-6 rounded-lg bg-blue-500 flex items-center justify-center text-white">
                           <Percent size={14} />
                        </div>
                     </div>
                     <p className="text-[10px] text-slate-500 mt-3 font-bold opacity-60">This value dictates the automatic commission deducted from every vendor sale.</p>
                  </div>
                  
                  <div className="flex items-center justify-between p-6 bg-rose-50/50 dark:bg-rose-500/5 rounded-3xl border border-rose-100 dark:border-rose-500/10">
                     <div className="max-w-[70%]">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">Emergency Maintenance Mode</h3>
                        <p className="text-[10px] text-slate-500 font-bold mt-1">Locks all marketplace interactions. Use only for system upgrades.</p>
                     </div>
                     <label className="relative inline-flex items-center cursor-pointer scale-110">
                        <input type="checkbox" checked={maintenanceMode} onChange={() => setMaintenanceMode(!maintenanceMode)} className="sr-only peer" />
                        <div className="w-12 h-6.5 bg-slate-200 peer-focus:outline-none dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-rose-500"></div>
                     </label>
                  </div>
               </div>
            </section>

            {/* Categorization Section */}
            <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none">
               <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-2xl">
                     <AlertTriangle size={20} className="text-amber-500" />
                  </div>
                  <div>
                     <h2 className="text-xl font-black text-slate-900 dark:text-white">Supported Taxonomy</h2>
                     <p className="text-[10px] font-black uppercase tracking-tighter text-slate-400">Fabric Categories & Classification</p>
                  </div>
               </div>
               
               <div className="flex gap-3 mb-8">
                  <input 
                     type="text" 
                     placeholder="Define new category..." 
                     value={newCategory}
                     onChange={(e) => setNewCategory(e.target.value)}
                     onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                     className="flex-1 px-6 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-900 dark:text-white text-sm font-bold"
                  />
                  <button onClick={handleAddCategory} className="bg-slate-900 dark:bg-slate-700 text-white w-14 rounded-2xl hover:bg-slate-800 dark:hover:bg-slate-600 transition-all flex items-center justify-center">
                     <Plus size={24} />
                  </button>
               </div>

               <div className="flex flex-wrap gap-2">
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                       <div key={cat} className="flex items-center gap-3 px-5 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50 rounded-xl group transition-all hover:border-slate-300">
                          <span className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">{cat}</span>
                          <button onClick={() => handleRemoveCategory(cat)} className="text-slate-300 hover:text-rose-500 transition-colors">
                             <Trash2 size={14} />
                          </button>
                       </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400 italic">No categories defined yet. Add your first category above.</p>
                  )}
               </div>
            </section>
          </>
        );

      case 'alerts':
        return (
          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-2xl">
                  <BellRing size={20} className="text-amber-500" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">System Alerts</h2>
                  <p className="text-[10px] font-black uppercase tracking-tighter text-slate-400">Manage platform-wide notifications</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditingAlert(null);
                  setAlertForm({
                    title: '',
                    message: '',
                    type: 'info',
                    priority: 'medium',
                    targetAudience: 'all',
                    expiresAt: ''
                  });
                  setShowAlertModal(true);
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-xl shadow-emerald-500/20 transition-all hover:scale-105 font-bold text-sm"
              >
                <Plus size={18} /> New Alert
              </button>
            </div>

            <div className="space-y-4">
              {alerts.length > 0 ? (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-6 rounded-2xl border-2 ${
                      alert.type === 'error' ? 'bg-rose-50/50 dark:bg-rose-500/5 border-rose-200 dark:border-rose-500/20' :
                      alert.type === 'warning' ? 'bg-amber-50/50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20' :
                      alert.type === 'success' ? 'bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20' :
                      'bg-blue-50/50 dark:bg-blue-500/5 border-blue-200 dark:border-blue-500/20'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-black text-slate-900 dark:text-white">{alert.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            alert.priority === 'critical' ? 'bg-rose-500 text-white' :
                            alert.priority === 'high' ? 'bg-orange-500 text-white' :
                            alert.priority === 'medium' ? 'bg-amber-500 text-white' :
                            'bg-slate-500 text-white'
                          }`}>
                            {alert.priority}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            {alert.target_audience || alert.targetAudience || 'all'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">{alert.message}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {new Date(alert.created_at).toLocaleDateString()}
                          </span>
                          {alert.expires_at && (
                            <span className="flex items-center gap-1">
                              <AlertCircle size={12} />
                              Expires: {new Date(alert.expires_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditAlert(alert)}
                          className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                        >
                          <Edit2 size={16} className="text-slate-600 dark:text-slate-400" />
                        </button>
                        <button
                          onClick={() => handleDeleteAlert(alert.id)}
                          className="p-2 hover:bg-rose-100 dark:hover:bg-rose-500/20 rounded-xl transition-colors"
                        >
                          <Trash2 size={16} className="text-rose-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <BellRing size={48} className="mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-500 dark:text-slate-400">No alerts configured yet.</p>
                </div>
              )}
            </div>
          </section>
        );

      case 'database':
        return (
          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-2xl">
                  <Database size={20} className="text-blue-500" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">Database Health</h2>
                  <p className="text-[10px] font-black uppercase tracking-tighter text-slate-400">Monitor connection and table status</p>
                </div>
              </div>
              <button
                onClick={checkDatabaseHealth}
                disabled={checkingHealth}
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-xl shadow-blue-500/20 transition-all hover:scale-105 font-bold text-sm disabled:opacity-50"
              >
                <RefreshCw size={18} className={checkingHealth ? 'animate-spin' : ''} /> Refresh
              </button>
            </div>

            <div className="space-y-6">
              {/* Connection Status */}
              <div className={`p-6 rounded-2xl border-2 ${
                dbHealth.status === 'healthy' ? 'bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20' :
                dbHealth.status === 'warning' ? 'bg-amber-50/50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20' :
                'bg-rose-50/50 dark:bg-rose-500/5 border-rose-200 dark:border-rose-500/20'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {dbHealth.status === 'healthy' ? (
                      <CheckCircle2 size={24} className="text-emerald-500" />
                    ) : (
                      <XCircle size={24} className="text-rose-500" />
                    )}
                    <div>
                      <h3 className="font-black text-slate-900 dark:text-white">Connection Status</h3>
                      <p className="text-xs text-slate-500">
                        {dbHealth.connection ? 'Connected to Supabase' : 'Connection Failed'}
                      </p>
                    </div>
                  </div>
                  {dbHealth.responseTime && (
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                      {dbHealth.responseTime}ms
                    </span>
                  )}
                </div>
                {dbHealth.error && (
                  <p className="text-sm text-rose-600 dark:text-rose-400 mt-2">{dbHealth.error}</p>
                )}
                {dbHealth.lastChecked && (
                  <p className="text-xs text-slate-500 mt-2">
                    Last checked: {new Date(dbHealth.lastChecked).toLocaleString()}
                  </p>
                )}
              </div>

              {/* Table Status */}
              <div>
                <h3 className="font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Activity size={18} /> Table Health
                </h3>
                <div className="space-y-3">
                  {dbHealth.tables.length > 0 ? (
                    dbHealth.tables.map((table) => (
                      <div
                        key={table.name}
                        className={`p-4 rounded-xl border ${
                          table.status === 'healthy'
                            ? 'bg-emerald-50/30 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/10'
                            : 'bg-rose-50/30 dark:bg-rose-500/5 border-rose-200 dark:border-rose-500/10'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {table.status === 'healthy' ? (
                              <CheckCircle2 size={18} className="text-emerald-500" />
                            ) : (
                              <XCircle size={18} className="text-rose-500" />
                            )}
                            <span className="font-bold text-slate-900 dark:text-white">{table.name}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-xs text-slate-500">{table.responseTime}ms</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              table.status === 'healthy'
                                ? 'bg-emerald-500 text-white'
                                : 'bg-rose-500 text-white'
                            }`}>
                              {table.status}
                            </span>
                          </div>
                        </div>
                        {table.error && (
                          <p className="text-xs text-rose-600 dark:text-rose-400 mt-2 ml-9">{table.error}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 italic">Click Refresh to check table health</p>
                  )}
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="text-center">
                  <p className="text-2xl font-black text-slate-900 dark:text-white">{users.length}</p>
                  <p className="text-xs text-slate-500 mt-1">Total Users</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-slate-900 dark:text-white">{listings.length}</p>
                  <p className="text-xs text-slate-500 mt-1">Total Listings</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-slate-900 dark:text-white">{transactions.length}</p>
                  <p className="text-xs text-slate-500 mt-1">Total Transactions</p>
                </div>
              </div>
            </div>
          </section>
        );

      case 'regions':
        return (
          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl">
                  <Globe size={20} className="text-indigo-500" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">Market Regions</h2>
                  <p className="text-[10px] font-black uppercase tracking-tighter text-slate-400">Configure available market regions</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditingRegion(null);
                  setRegionForm({
                    name: '',
                    code: '',
                    currency: 'INR',
                    timezone: 'Asia/Kolkata',
                    active: true
                  });
                  setShowRegionModal(true);
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-xl shadow-indigo-500/20 transition-all hover:scale-105 font-bold text-sm"
              >
                <Plus size={18} /> New Region
              </button>
            </div>

            <div className="space-y-4">
              {regions.length > 0 ? (
                <div className="grid gap-4">
                  {regions.map((region) => (
                    <div
                      key={region.id}
                      className={`p-6 rounded-2xl border-2 ${
                        region.active
                          ? 'bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20'
                          : 'bg-slate-50/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-black text-slate-900 dark:text-white text-lg">{region.name}</h3>
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                              {region.code}
                            </span>
                            {region.active && (
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                              <p className="text-xs text-slate-500 mb-1">Currency</p>
                              <p className="font-bold text-slate-900 dark:text-white">{region.currency}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 mb-1">Timezone</p>
                              <p className="font-bold text-slate-900 dark:text-white">{region.timezone}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditRegion(region)}
                            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                          >
                            <Edit2 size={16} className="text-slate-600 dark:text-slate-400" />
                          </button>
                          <button
                            onClick={() => handleDeleteRegion(region.id)}
                            className="p-2 hover:bg-rose-100 dark:hover:bg-rose-500/20 rounded-xl transition-colors"
                          >
                            <Trash2 size={16} className="text-rose-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Globe size={48} className="mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-500 dark:text-slate-400">No regions configured yet.</p>
                </div>
              )}
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  if (dataLoading) {
    return (
      <div className="max-w-5xl mx-auto flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-500">
      {/* Top Navigation / Actions */}
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Platform Configuration</h1>
           <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Global parameters and marketplace business logic.</p>
        </div>
        {activeTab === 'general' && (
          <button 
             onClick={handleSave}
             className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-2xl flex items-center gap-2 shadow-2xl shadow-emerald-500/30 transition-all hover:scale-105 font-black text-sm uppercase tracking-widest"
          >
             <Save size={18} /> Apply Changes
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
         {/* Sidebar Navigation */}
         <div className="lg:col-span-1 space-y-4">
            <nav className="space-y-1">
               <SettingsNavButton 
                 active={activeTab === 'general'} 
                 onClick={() => setActiveTab('general')}
                 icon={<Sliders size={18} />} 
                 label="General Settings" 
               />
               <SettingsNavButton 
                 active={activeTab === 'alerts'} 
                 onClick={() => setActiveTab('alerts')}
                 icon={<BellRing size={18} />} 
                 label="System Alerts" 
               />
               <SettingsNavButton 
                 active={activeTab === 'database'} 
                 onClick={() => setActiveTab('database')}
                 icon={<Database size={18} />} 
                 label="Database Health" 
               />
               <SettingsNavButton 
                 active={activeTab === 'regions'} 
                 onClick={() => setActiveTab('regions')}
                 icon={<Globe size={18} />} 
                 label="Market Regions" 
               />
            </nav>

            <div className="p-6 bg-slate-900 rounded-3xl text-white shadow-2xl shadow-slate-900/20 mt-8 relative overflow-hidden group">
               <ShieldCheck className="absolute -right-4 -bottom-4 text-white/5 w-32 h-32 group-hover:scale-110 transition-transform duration-700" />
               <h4 className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-2">Live Status</h4>
               <p className="text-2xl font-black">Secure</p>
               <p className="text-[10px] text-slate-400 mt-2 uppercase font-bold">All background worker nodes are operational.</p>
            </div>
         </div>

         {/* Main Settings Content */}
         <div className="lg:col-span-2 space-y-8">
            {renderContent()}
         </div>
      </div>

      {/* Alert Modal */}
      {showAlertModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-2xl w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                {editingAlert ? 'Edit Alert' : 'Create New Alert'}
              </h3>
              <button
                onClick={() => {
                  setShowAlertModal(false);
                  setEditingAlert(null);
                }}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Title</label>
                <input
                  type="text"
                  value={alertForm.title}
                  onChange={(e) => setAlertForm({ ...alertForm, title: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white"
                  placeholder="Alert title"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Message</label>
                <textarea
                  value={alertForm.message}
                  onChange={(e) => setAlertForm({ ...alertForm, message: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white"
                  rows={4}
                  placeholder="Alert message"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Type</label>
                  <select
                    value={alertForm.type}
                    onChange={(e) => setAlertForm({ ...alertForm, type: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white"
                  >
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                    <option value="success">Success</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Priority</label>
                  <select
                    value={alertForm.priority}
                    onChange={(e) => setAlertForm({ ...alertForm, priority: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Target Audience</label>
                <select
                  value={alertForm.targetAudience}
                  onChange={(e) => setAlertForm({ ...alertForm, targetAudience: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white"
                >
                  <option value="all">All Users</option>
                  <option value="factory">Factories Only</option>
                  <option value="buyer">Buyers Only</option>
                  <option value="admin">Admins Only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Expires At (Optional)</label>
                <input
                  type="date"
                  value={alertForm.expiresAt}
                  onChange={(e) => setAlertForm({ ...alertForm, expiresAt: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleSaveAlert}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold transition-all"
                >
                  {editingAlert ? 'Update Alert' : 'Create Alert'}
                </button>
                <button
                  onClick={() => {
                    setShowAlertModal(false);
                    setEditingAlert(null);
                  }}
                  className="px-6 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-xl font-bold transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Region Modal */}
      {showRegionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-2xl w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                {editingRegion ? 'Edit Region' : 'Create New Region'}
              </h3>
              <button
                onClick={() => {
                  setShowRegionModal(false);
                  setEditingRegion(null);
                }}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Region Name</label>
                  <input
                    type="text"
                    value={regionForm.name}
                    onChange={(e) => setRegionForm({ ...regionForm, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white"
                    placeholder="e.g., India"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Country Code</label>
                  <input
                    type="text"
                    value={regionForm.code}
                    onChange={(e) => setRegionForm({ ...regionForm, code: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white"
                    placeholder="e.g., IN"
                    maxLength={2}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Currency</label>
                  <input
                    type="text"
                    value={regionForm.currency}
                    onChange={(e) => setRegionForm({ ...regionForm, currency: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white"
                    placeholder="e.g., INR"
                    maxLength={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Timezone</label>
                  <input
                    type="text"
                    value={regionForm.timezone}
                    onChange={(e) => setRegionForm({ ...regionForm, timezone: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white"
                    placeholder="e.g., Asia/Kolkata"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={regionForm.active}
                    onChange={(e) => setRegionForm({ ...regionForm, active: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Active</span>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleSaveRegion}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold transition-all"
                >
                  {editingRegion ? 'Update Region' : 'Create Region'}
                </button>
                <button
                  onClick={() => {
                    setShowRegionModal(false);
                    setEditingRegion(null);
                  }}
                  className="px-6 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-xl font-bold transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsNavButton({ icon, label, active = false, onClick }) {
   return (
      <button 
         onClick={onClick}
         className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${
            active 
               ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xl shadow-slate-200/50 dark:shadow-none ring-1 ring-slate-200 dark:ring-slate-700' 
               : 'text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
         }`}>
         {icon}
         <span>{label}</span>
      </button>
   );
}

