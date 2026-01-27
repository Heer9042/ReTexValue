import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Bell, Lock, Globe, Palette, Shield, ChevronRight } from 'lucide-react';

export default function BuyerSettings() {
  const { user, updateProfile } = useApp();
  const navigate = useNavigate();
  
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [newListings, setNewListings] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Sync state with user data on load
  useEffect(() => {
    if (user) {
      setEmailNotifications(user.notifications_email ?? true);
      setPushNotifications(user.notifications_push ?? true);
      setNewListings(user.notifications_listings ?? false);
    }
  }, [user]);

  const handleUpdate = async () => {
    setSubmitting(true);
    try {
       await updateProfile({
          notifications_email: emailNotifications,
          notifications_push: pushNotifications,
          notifications_listings: newListings
       });
       alert("Preferences updated successfully!");
    } catch (err) {
       console.error("Failed to update settings:", err);
    } finally {
       setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Settings</h1>
        <p className="text-slate-600 dark:text-slate-400 font-medium text-sm">Configure your platform experience and security protocols.</p>
      </div>

      {/* Settings Overview Header */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 shadow-xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
           <Palette size={120} />
        </div>
        
        <div className="relative w-20 h-20 shrink-0">
           <img 
              src={user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.full_name || 'User'}&background=random`} 
              alt="Profile" 
              className="w-full h-full rounded-2xl object-cover border-4 border-slate-50 dark:border-slate-900 shadow-lg"
           />
        </div>

        <div className="flex-1 text-center md:text-left relative z-10">
           <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Settings Hub</h2>
           <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Hello, {user?.full_name || 'Partner'}. Manage your global preferences here.</p>
           <div className="mt-4">
              <button 
                onClick={() => navigate('/buyer/profile')}
                className="px-5 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-emerald-600 hover:text-white text-slate-900 dark:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm flex items-center gap-2 mx-auto md:mx-0"
              >
                 Identity Portfolio <ChevronRight size={14} />
              </button>
           </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Notifications */}
        <SettingSection title="Notification Logic" icon={<Bell />}>
          <div className="space-y-1">
            <ToggleSetting 
              label="Sync Emails"
              description="Inventory updates and order receipts"
              checked={emailNotifications}
              onChange={setEmailNotifications}
            />
            <ToggleSetting 
              label="Real-time Push"
              description="Instant alerts on marketplace activity"
              checked={pushNotifications}
              onChange={setPushNotifications}
            />
            <ToggleSetting 
              label="Curated Matches"
              description="Notify when relevant materials are listed"
              checked={newListings}
              onChange={setNewListings}
            />
          </div>
          <button 
            onClick={handleUpdate}
            disabled={submitting}
            className="w-full mt-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-2"
          >
            {submitting ? 'Updating Grid...' : 'Deploy Preferences'}
          </button>
        </SettingSection>

        {/* Security */}
        <SettingSection title="Security Protocol" icon={<Lock />}>
          <div className="space-y-4 text-left">
            <SecurityAction 
              label="Change Master Password" 
              description="Security rotation recommended" 
              icon={<Shield size={18} />}
            />
            <SecurityAction 
              label="Two-Factor Control" 
              description="Enhance account integrity" 
              icon={<Lock size={18} />}
            />
            <SecurityAction 
              label="Authorized Devices" 
              description="Manage active sessions" 
              icon={<Globe size={18} />}
            />
          </div>
        </SettingSection>

        {/* Appearance & Prefs */}
        <SettingSection title="Environment" icon={<Palette />}>
          <div className="space-y-6">
            <SelectField 
              label="Native Language" 
              options={['English (Global)', 'Marathi', 'Hindi']} 
            />
            <SelectField 
              label="Accounting Currency" 
              options={['INR (₹)', 'USD ($)']} 
            />
          </div>
        </SettingSection>

        {/* Visibility */}
        <SettingSection title="Privacy Hub" icon={<Shield />}>
          <div className="space-y-1">
             <ToggleSetting 
                label="Public Registry"
                description="Allow sellers to find your business"
                checked={true}
                onChange={() => {}}
             />
             <ToggleSetting 
                label="Analytics Feedback"
                description="Share data to optimize platform AI"
                checked={true}
                onChange={() => {}}
             />
          </div>
        </SettingSection>
      </div>

      {/* Danger Zone */}
      <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
         <SettingSection title="Irreversible Actions" icon={<Shield />} danger>
           <div className="flex flex-col md:flex-row gap-4">
              <button className="flex-1 px-6 py-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-2xl font-bold text-[10px] uppercase tracking-widest border border-red-100 dark:border-red-900/30 hover:bg-red-100 transition-all">
                 Deactivate Account
              </button>
              <button className="flex-1 px-6 py-4 bg-red-600 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg active:scale-95">
                 Permanent Data Wipe
              </button>
           </div>
         </SettingSection>
      </div>
    </div>
  );
}

function SettingSection({ title, icon, children, danger = false }) {
  return (
    <div className={`bg-white dark:bg-slate-800 border ${danger ? 'border-red-100 dark:border-red-900/30' : 'border-slate-100 dark:border-slate-700'} rounded-[2.5rem] p-8 shadow-sm transition-all hover:shadow-md`}>
      <div className="flex items-center gap-3 mb-8">
        <div className={`p-2.5 rounded-xl ${danger ? 'bg-red-50 dark:bg-red-500/10 text-red-600' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600'}`}>
          {icon}
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function SecurityAction({ label, description, icon }) {
  return (
    <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 hover:border-emerald-500/30 transition-all group">
       <div className="flex items-center gap-4 text-left">
          <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl text-slate-400 group-hover:text-emerald-500 transition-colors">
             {icon}
          </div>
          <div>
             <div className="text-sm font-bold text-slate-900 dark:text-white">{label}</div>
             <div className="text-[10px] text-slate-500 font-medium">{description}</div>
          </div>
       </div>
       <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
    </button>
  );
}

function SelectField({ label, options }) {
  return (
    <div className="space-y-2 text-left">
       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
       <div className="relative">
          <select className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white font-bold appearance-none outline-none focus:ring-2 focus:ring-emerald-500/20">
             {options.map(opt => <option key={opt}>{opt}</option>)}
          </select>
          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
             <ChevronRight size={16} className="rotate-90" />
          </div>
       </div>
    </div>
  );
}

function ToggleSetting({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-5 border-b border-slate-50 dark:border-slate-800 last:border-0">
      <div className="flex-1 text-left">
        <div className="font-bold text-slate-900 dark:text-white text-sm">{label}</div>
        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{description}</div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-700'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
