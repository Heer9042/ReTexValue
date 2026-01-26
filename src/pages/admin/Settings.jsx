import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Save, Plus, Trash2, Sliders, AlertTriangle, Percent, ShieldCheck, Database, Globe, BellRing } from 'lucide-react';

export default function Settings() {
  const { settings, updateSettings } = useApp();

  const [platformFee, setPlatformFee] = useState(5);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Sync with global settings when loaded
  useEffect(() => {
     if (settings) {
        setPlatformFee(settings.platformFee || 5);
        setMaintenanceMode(settings.maintenanceMode || false);
        setCategories(settings.categories || []);
     }
  }, [settings]);

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

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-500">
      {/* Top Navigation / Actions */}
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Platform Configuration</h1>
           <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Global parameters and marketplace business logic.</p>
        </div>
        <button 
           onClick={handleSave}
           className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-2xl flex items-center gap-2 shadow-2xl shadow-emerald-500/30 transition-all hover:scale-105 font-black text-sm uppercase tracking-widest"
        >
           <Save size={18} /> Apply Changes
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
         {/* Sidebar Navigation */}
         <div className="lg:col-span-1 space-y-4">
            <nav className="space-y-1">
               <SettingsNavButton active icon={<Sliders size={18} />} label="General Settings" />
               <SettingsNavButton icon={<BellRing size={18} />} label="System Alerts" />
               <SettingsNavButton icon={<Database size={18} />} label="Database Health" />
               <SettingsNavButton icon={<Globe size={18} />} label="Market Regions" />
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
                        <div className="w-12 h-6.5 bg-slate-200 peer-focus:outline-none dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-rose-500"></div>
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
                     className="flex-1 px-6 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-900 dark:text-white text-sm font-bold"
                  />
                  <button onClick={handleAddCategory} className="bg-slate-900 dark:bg-slate-700 text-white w-14 rounded-2xl hover:bg-slate-800 dark:hover:bg-slate-600 transition-all flex items-center justify-center">
                     <Plus size={24} />
                  </button>
               </div>

               <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                     <div key={cat} className="flex items-center gap-3 px-5 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50 rounded-xl group transition-all hover:border-slate-300">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">{cat}</span>
                        <button onClick={() => handleRemoveCategory(cat)} className="text-slate-300 hover:text-rose-500 transition-colors">
                           <Trash2 size={14} />
                        </button>
                     </div>
                  ))}
               </div>
            </section>
         </div>
      </div>
    </div>
  );
}

function SettingsNavButton({ icon, label, active = false }) {
   return (
      <button className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${
         active 
            ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xl shadow-slate-200/50 dark:shadow-none ring-1 ring-slate-200 dark:ring-slate-700' 
            : 'text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
      }`}>
         {icon}
         <span>{label}</span>
      </button>
   );
}

