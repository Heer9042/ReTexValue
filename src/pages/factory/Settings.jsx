import React, { useState } from 'react';
import { Bell, Lock, Shield, Eye, Smartphone, Mail, Trash2, Globe, LogOut } from 'lucide-react';

export default function FactorySettings() {
  const [notifications, setNotifications] = useState({
    emailOrderUpdates: true,
    emailMarketing: false,
    smsAlerts: true,
    browserPush: true
  });

  const toggle = (key) => setNotifications(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Settings Header */}
      <div className="mb-8 border-b border-slate-200 dark:border-slate-700 pb-6">
         <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
         <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Control your profile configuraton and preferences.</p>
         
         <div className="flex gap-6 mt-6">
            <button className="text-emerald-600 dark:text-emerald-400 font-semibold border-b-2 border-emerald-500 pb-2">General</button>
            <button className="text-slate-500 dark:text-slate-400 font-medium hover:text-slate-700 dark:hover:text-slate-200 pb-2 transition-colors">Billing</button>
            <button className="text-slate-500 dark:text-slate-400 font-medium hover:text-slate-700 dark:hover:text-slate-200 pb-2 transition-colors">Team Members</button>
         </div>
      </div>

      <div className="grid md:grid-cols-12 gap-10">
         {/* Navigation/Sidebar - hidden on mobile, visible on desktop */}
         <div className="hidden md:block col-span-3 space-y-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-3">System</h3>
            <button className="w-full text-left px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-2">
               <Bell size={16} /> Notifications
            </button>
            <button className="w-full text-left px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2">
               <Shield size={16} /> Security
            </button>
            <button className="w-full text-left px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2">
               <Globe size={16} /> Language & Region
            </button>
            
            <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
               <button className="w-full text-left px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex items-center gap-2">
                  <LogOut size={16} /> Sign Out
               </button>
            </div>
         </div>

         {/* Main Content */}
         <div className="col-span-12 md:col-span-9 space-y-8">
            
            {/* Notifications Section */}
            <section>
               <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                     <Bell size={20} />
                  </div>
                  <div>
                     <h2 className="text-xl font-bold text-slate-900 dark:text-white">Notification Preferences</h2>
                     <p className="text-sm text-slate-500">Manage how we communicate with you.</p>
                  </div>
               </div>
               
               <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
                  <div className="divide-y divide-slate-100 dark:divide-slate-700">
                     <ToggleRow 
                        title="Order Updates" 
                        description="Receive immediate emails when a buyer accepts your proposal."
                        icon={<Mail size={18} />}
                        checked={notifications.emailOrderUpdates}
                        onChange={() => toggle('emailOrderUpdates')}
                     />
                     <ToggleRow 
                        title="SMS Alerts" 
                        description="Get text messages for logistics and pickup confirmations."
                        icon={<Smartphone size={18} />}
                        checked={notifications.smsAlerts}
                        onChange={() => toggle('smsAlerts')}
                     />
                     <ToggleRow 
                        title="Browser Push" 
                        description="Receive push notifications on your desktop or mobile."
                        icon={<Bell size={18} />}
                        checked={notifications.browserPush}
                        onChange={() => toggle('browserPush')}
                     />
                  </div>
               </div>
            </section>

            {/* Security Section */}
            <section>
               <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                     <Lock size={20} />
                  </div>
                  <div>
                     <h2 className="text-xl font-bold text-slate-900 dark:text-white">Password & Security</h2>
                     <p className="text-sm text-slate-500">Update your password to keep your account safe.</p>
                  </div>
               </div>

               <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
                  <div className="grid md:grid-cols-2 gap-6">
                     <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Current Password</label>
                        <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white transition-all" />
                     </div>
                     <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">New Password</label>
                        <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white transition-all" />
                     </div>
                     <div className="md:col-span-2 pt-2 flex justify-end">
                        <button className="px-6 py-2.5 bg-slate-900 dark:bg-slate-700 text-white rounded-xl font-bold text-sm hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors shadow-lg shadow-slate-900/10">
                           Change Password
                        </button>
                     </div>
                  </div>
               </div>
            </section>

            {/* Danger Zone */}
            <section className="pt-6 border-t border-slate-200 dark:border-slate-700">
               <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                     <h3 className="font-bold text-red-900 dark:text-red-400 mb-1">Delete Account</h3>
                     <p className="text-sm text-red-700/80 dark:text-red-400/60 max-w-lg">
                        Permanently remove your account and all of its contents from the ReTex platform. This action is not reversible.
                     </p>
                  </div>
                  <button className="whitespace-nowrap px-5 py-2.5 bg-white dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-xl font-bold text-sm transition-colors shadow-sm">
                     Delete Account
                  </button>
               </div>
            </section>

         </div>
      </div>
    </div>
  );
}

function ToggleRow({ title, description, icon, checked, onChange }) {
   return (
      <div className="flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
         <div className="flex items-center gap-4">
            <div className={`p-2.5 rounded-full ${checked ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
               {icon}
            </div>
            <div>
               <h4 className="font-semibold text-slate-900 dark:text-white text-sm">{title}</h4>
               <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
            </div>
         </div>
         <button 
            onClick={onChange}
            className={`w-12 h-7 rounded-full transition-all duration-300 relative focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${checked ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
         >
            <span className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
         </button>
      </div>
   );
}

