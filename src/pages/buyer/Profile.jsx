import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, MapPin, CreditCard, Bell, Shield, Save, Building, Mail, Phone, Upload, Globe, Award, Zap } from 'lucide-react';

export default function BuyerProfile() {
  const { user } = useApp();
  
  const [formData, setFormData] = useState({
    companyName: user?.name || 'Sustainable Textiles Hub',
    contactPerson: 'Aditya Roy',
    email: user?.email || 'procurement@rethub.io',
    phone: user?.phone || '+91 98765 43210',
    address: user?.location || 'Plot 45, Industrial Zone, Pune, India',
    gst: '27AABCU9603R1ZN',
  });

  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20 animate-in fade-in duration-700">
      {/* Immersive Profile Hero */}
      <div className="relative h-64 rounded-[3rem] bg-slate-900 border border-white/5 overflow-hidden shadow-2xl">
         <div className="absolute inset-0 bg-linear-to-br from-indigo-600/20 to-emerald-600/20 mix-blend-overlay"></div>
         <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-[80px]"></div>
         
         <div className="absolute bottom-10 right-10 flex gap-4">
             <button className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest backdrop-blur-3xl transition-all border border-white/10 shadow-2xl">
                 Update Environment
             </button>
         </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 px-4 mt-8">
         {/* Left Sidebar - Sticky */}
         <div className="lg:col-span-4 space-y-6 -mt-24">
            {/* Profile Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-700 relative">
               <div className="flex flex-col items-center -mt-16 mb-6">
                  <div className="w-24 h-24 rounded-2xl bg-linear-to-br from-emerald-400 to-cyan-500 p-1 shadow-lg shadow-emerald-500/30 rotate-3 hover:rotate-0 transition-transform duration-300">
                     <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center text-3xl font-bold text-white uppercase border-2 border-white/20">
                        {formData.companyName.charAt(0)}
                     </div>
                     <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-xl border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-blue-500 transition-all">
                        <Upload size={16} />
                     </button>
                  </div>
                  
                  <div className="mt-8 text-center">
                     <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{formData.companyName}</h2>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Verified Sourcing Partner</p>
                  </div>
                  
                  <div className="flex gap-3 mt-8">
                     <Badge icon={<Award size={12}/>} label="Certified" />
                     <Badge icon={<Shield size={12}/>} label="Verified" />
                  </div>
               </div>
               
               <div className="mt-12 space-y-2">
                  <NavLink icon={<Building size={18} />} label="Organization Details" active />
                  <NavLink icon={<Globe size={18} />} label="Geospatial Sites" />
                  <NavLink icon={<CreditCard size={18} />} label="Procurement Wallet" />
                  <NavLink icon={<Bell size={18} />} label="Signal Hub" />
               </div>
            </div>

            {/* Performance Impact */}
            <div className="bg-linear-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-blue-500/20 relative overflow-hidden group">
               <Zap className="absolute -right-10 -bottom-10 w-48 h-48 text-white/5 group-hover:scale-125 transition-transform duration-700" />
               <div className="relative z-10">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-100/60 mb-8">Performance Metric</h3>
                  <div className="flex justify-between items-end">
                     <div>
                        <p className="text-5xl font-black tracking-tighter">14.2k</p>
                        <p className="text-[9px] font-black uppercase tracking-widest mt-2">Kg Waste Diverted</p>
                     </div>
                     <div className="text-right">
                        <p className="text-3xl font-black tracking-tighter opacity-60 italic">Elite</p>
                        <p className="text-[9px] font-black uppercase tracking-widest mt-2">Tier Rank</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Configuration Core */}
         <div className="lg:col-span-8 space-y-10">
            <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[3rem] p-12 shadow-2xl shadow-slate-200/50 dark:shadow-none">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-slate-50 dark:border-slate-800 pb-10">
                  <div>
                     <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Operational Identity</h2>
                     <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium">Standardize your legal and commercial identifiers for the grid.</p>
                  </div>
                  <button 
                     type="submit"
                     disabled={saved}
                     className={`
                       px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-2xl
                       ${saved ? 'bg-emerald-600 text-white' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-black dark:hover:bg-slate-200'}
                     `}
                  >
                     {saved ? <><div className="w-2 h-2 bg-white rounded-full animate-ping"></div> Confirmed</> : <><Save size={18} /> Sync Configuration</>}
                  </button>
               </div>

               <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <InputGroup label="Company Name" icon={<Building size={16} />}>
                     <input type="text" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} className="w-full bg-transparent outline-none text-slate-900 dark:text-white font-medium" />
                  </InputGroup>
                  <InputGroup label="GSTIN / Tax ID" icon={<Shield size={16} />}>
                     <input type="text" value={formData.gst} onChange={e => setFormData({...formData, gst: e.target.value})} className="w-full bg-transparent outline-none text-slate-900 dark:text-white font-medium" />
                  </InputGroup>
               </div>
               
               <div className="mb-8">
                  <InputGroup label="Registered Address" icon={<MapPin size={16} />}>
                     <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-transparent outline-none text-slate-900 dark:text-white font-medium" />
                  </InputGroup>
               </div>

               <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Primary Contact</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                     <InputGroup label="Contact Person" icon={<User size={16} />}>
                        <input type="text" value={formData.contactPerson} onChange={e => setFormData({...formData, contactPerson: e.target.value})} className="w-full bg-transparent outline-none text-slate-900 dark:text-white font-medium" />
                     </InputGroup>
                     <InputGroup label="Phone Number" icon={<Phone size={16} />}>
                        <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-transparent outline-none text-slate-900 dark:text-white font-medium" />
                     </InputGroup>
                     <InputGroup label="Email Address" icon={<Mail size={16} />}>
                        <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-transparent outline-none text-slate-900 dark:text-white font-medium" />
                     </InputGroup>
                  </div>
               </div>
            </form>

            {/* Verified Documentation Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-10 rounded-[3rem] flex flex-col md:flex-row gap-8 items-center shadow-2xl shadow-slate-200/50 dark:shadow-none">
               <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-[1.5rem] flex items-center justify-center shrink-0">
                  <Award size={32} />
               </div>
               <div className="flex-1 text-center md:text-left">
                  <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Circular Trust Protocol</h4>
                  <p className="text-sm text-slate-500 font-medium mt-2">Enhance your trust rating by uploading environmental compliance documents (PCB/ISO).</p>
               </div>
               <button className="px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                  Upload Vault
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}

function Badge({ icon, label }) {
   return (
      <span className="px-4 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[9px] font-black uppercase tracking-[0.1em] rounded-full border border-slate-100 dark:border-slate-700 flex items-center gap-2">
         {icon} {label}
      </span>
   );
}

function NavLink({ icon, label, active }) {
   return (
      <button className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-slate-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-100 dark:border-slate-700' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-700 dark:hover:text-slate-200'}`}>
         {icon}
         {label}
      </button>
   );
}

function ConfigField({ label, icon, children, className = "" }) {
   return (
      <div className={`bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800 rounded-3xl p-6 focus-within:border-blue-500/50 transition-all ${className}`}>
         <label className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">
            {icon} {label}
         </label>
         {children}
      </div>
   );
}

