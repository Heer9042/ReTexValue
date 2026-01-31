import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Bell, Lock, Shield, Eye, Smartphone, Mail, Trash2, Globe, LogOut, 
  User, Building, CreditCard, Languages, Check
} from 'lucide-react';

export default function FactorySettings() {
  const { user, updateProfile, uploadFile } = useApp();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // General Profile State
  const [profileData, setProfileData] = useState({
     name: '',
     company: '',
     email: '',
     phone: '',
     address: '',
     location: ''
  });

  // Billing State
  const [billingData, setBillingData] = useState({
     gst: '',
     bankName: '',
     accountNumber: '',
     ifsc: '',
     billingAddress: ''
  });

  // Notifications State
  const [notifications, setNotifications] = useState({
    emailOrderUpdates: true,
    emailMarketing: false,
    smsAlerts: true,
    browserPush: true
  });

  const handleAvatarChange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (file.size > 2 * 1024 * 1024) {
          alert("Image size should be less than 2MB");
          return;
      }

      setUploadingAvatar(true);
      try {
          const publicUrl = await uploadFile(file, 'avatars');
          await updateProfile({ avatar_url: publicUrl });
          alert("Profile picture updated!");
      } catch (error) {
          console.error("Avatar upload failed:", error);
          alert("Failed to upload profile picture");
      } finally {
          setUploadingAvatar(false);
      }
  };

  // Sync User Data
  useEffect(() => {
     if(user) {
        setProfileData({
           name: user.full_name || user.name || '',
           company: user.company_name || '',
           email: user.email || '',
           phone: user.phone || '',
           address: user.address || '',
           location: user.location || ''
        });
        setBillingData({
            gst: user.gst_number || '',
            bankName: user.bank_name || '',
            accountNumber: user.account_number || '',
            ifsc: user.ifsc_code || '',
            billingAddress: user.billing_address || user.address || ''
        });
     }
  }, [user]);

  const handleProfileUpdate = async (e) => {
     e.preventDefault();
     setLoading(true);
     try {
        await updateProfile({
            full_name: profileData.name,
            company_name: profileData.company,
            phone: profileData.phone,
            address: profileData.address,
            location: profileData.location
        });
        alert('Profile updated successfully');
     } catch (error) {
        console.error(error);
        alert('Failed to update profile');
     } finally {
        setLoading(false);
     }
  };

  const handleBillingUpdate = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
         await updateProfile({
             gst_number: billingData.gst,
             bank_name: billingData.bankName,
             account_number: billingData.accountNumber,
             ifsc_code: billingData.ifsc,
             billing_address: billingData.billingAddress
         });
         alert('Billing details saved');
      } catch (error) {
         console.error(error);
      } finally {
         setLoading(false);
      }
  };

  const toggleNotification = (key) => setNotifications(prev => ({ ...prev, [key]: !prev[key] }));

  // Tab Content Components
  const renderContent = () => {
     switch(activeTab) {
        case 'general':
           return (
              <form onSubmit={handleProfileUpdate} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                 
                 {/* Avatar Upload */}
                 <div className="flex items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-700">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl bg-slate-100 dark:bg-slate-700">
                            {user?.avatar_url ? (
                                <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                    <User size={32} />
                                </div>
                            )}
                        </div>
                        <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer text-white font-medium text-xs">
                            {uploadingAvatar ? '...' : 'Change'}
                            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} disabled={uploadingAvatar} />
                        </label>
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">Profile Photo</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">This will be displayed on your listings and profile.</p>
                    </div>
                 </div>

                 <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                       <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
                       <div className="relative">
                          <User className="absolute left-3 top-3 text-slate-400" size={18} />
                          <input 
                             type="text" 
                             value={profileData.name} 
                             onChange={e => setProfileData({...profileData, name: e.target.value})}
                             className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl" 
                          />
                       </div>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Company Name</label>
                       <div className="relative">
                          <Building className="absolute left-3 top-3 text-slate-400" size={18} />
                          <input 
                             type="text" 
                             value={profileData.company} 
                             onChange={e => setProfileData({...profileData, company: e.target.value})}
                             className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl" 
                          />
                       </div>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                       <div className="relative">
                          <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                          <input 
                             type="email" 
                             value={profileData.email} 
                             readOnly
                             className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 cursor-not-allowed" 
                          />
                       </div>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Phone Number</label>
                       <div className="relative">
                          <Smartphone className="absolute left-3 top-3 text-slate-400" size={18} />
                          <input 
                             type="text" 
                             value={profileData.phone} 
                             onChange={e => setProfileData({...profileData, phone: e.target.value})}
                             className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl" 
                          />
                       </div>
                    </div>
                    <div className="col-span-2 space-y-1.5">
                       <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Factory Address</label>
                       <textarea 
                          rows="3"
                          value={profileData.address} 
                          onChange={e => setProfileData({...profileData, address: e.target.value})}
                          className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl resize-none" 
                       />
                    </div>
                 </div>
                 <div className="flex justify-end pt-4">
                    <button type="submit" disabled={loading} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50">
                       {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                 </div>
              </form>
           );
        
        case 'billing':
           return (
              <form onSubmit={handleBillingUpdate} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/20 p-4 rounded-xl flex items-start gap-3">
                     <ShieldCheckIcon className="text-amber-600 mt-0.5 shrink-0" size={18} />
                     <div>
                        <h4 className="font-bold text-amber-800 dark:text-amber-400 text-sm">Sensitive Information</h4>
                        <p className="text-xs text-amber-700 dark:text-amber-500 mt-1">These details are used for invoicing and payouts. Ensure they perfectly match your bank records.</p>
                     </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                     <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">GST Number</label>
                        <input 
                           type="text" 
                           value={billingData.gst} 
                           onChange={e => setBillingData({...billingData, gst: e.target.value})}
                           placeholder="22AAAAA0000A1Z5"
                           className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono" 
                        />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Bank Name</label>
                        <input 
                           type="text" 
                           value={billingData.bankName} 
                           onChange={e => setBillingData({...billingData, bankName: e.target.value})}
                           placeholder="HDFC Bank"
                           className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl" 
                        />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Account Number</label>
                        <input 
                           type="password" 
                           value={billingData.accountNumber} 
                           onChange={e => setBillingData({...billingData, accountNumber: e.target.value})}
                           placeholder="•••• •••• ••••"
                           className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono" 
                        />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">IFSC Code</label>
                        <input 
                           type="text" 
                           value={billingData.ifsc} 
                           onChange={e => setBillingData({...billingData, ifsc: e.target.value})}
                           placeholder="HDFC0001234"
                           className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono uppercase" 
                        />
                     </div>
                     <div className="col-span-2 space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Billing Address</label>
                        <textarea 
                           rows="2"
                           value={billingData.billingAddress} 
                           onChange={e => setBillingData({...billingData, billingAddress: e.target.value})}
                           className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl resize-none" 
                           placeholder="Same as factory address..."
                        />
                     </div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <button type="submit" disabled={loading} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50">
                       Update Billing
                    </button>
                 </div>
              </form>
           );

        case 'notifications':
           return (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                      <div className="divide-y divide-slate-100 dark:divide-slate-700">
                         <ToggleRow 
                            title="Order Updates" 
                            description="Receive immediate emails when a buyer accepts your proposal."
                            icon={<Mail size={18} />}
                            checked={notifications.emailOrderUpdates}
                            onChange={() => toggleNotification('emailOrderUpdates')}
                         />
                         <ToggleRow 
                            title="SMS Alerts" 
                            description="Get text messages for logistics and pickup confirmations."
                            icon={<Smartphone size={18} />}
                            checked={notifications.smsAlerts}
                            onChange={() => toggleNotification('smsAlerts')}
                         />
                         <ToggleRow 
                            title="Browser Push" 
                            description="Receive push notifications on your desktop or mobile."
                            icon={<Bell size={18} />}
                            checked={notifications.browserPush}
                            onChange={() => toggleNotification('browserPush')}
                         />
                      </div>
                  </div>
              </div>
           );

        case 'security':
           return (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                 <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
                     <h3 className="font-bold text-slate-900 dark:text-white mb-4">Change Password</h3>
                     <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-1.5">
                           <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Current Password</label>
                           <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl" />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">New Password</label>
                           <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl" />
                        </div>
                     </div>
                     <button className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm shadow-lg">Update Password</button>
                 </div>
                 
                 <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-2xl p-6 flex justify-between items-center">
                    <div>
                       <h3 className="font-bold text-red-900 dark:text-red-400">Delete Account</h3>
                       <p className="text-sm text-red-700/80 dark:text-red-400/60 mt-1">Permanently remove your organization data.</p>
                    </div>
                    <button className="px-5 py-2.5 bg-white dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl font-bold text-sm shadow-sm">Delete</button>
                 </div>
              </div>
           );

        case 'system':
           return (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                 <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                       <div className="space-y-1.5">
                          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Platform Language</label>
                          <select className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer">
                             <option>English (United Kingdom)</option>
                             <option>Hindi</option>
                             <option>Gujarati</option>
                          </select>
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Time Zone</label>
                          <select className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer">
                             <option>(GMT+05:30) India Standard Time</option>
                          </select>
                       </div>
                    </div>
                 </div>
              </div>
           );

        default: return null;
     }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-700 pb-6 mb-8">
         <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Manage organization profile and system preferences.</p>
         </div>
      </div>

      <div className="grid md:grid-cols-12 gap-8">
         {/* Sidebar Navigation */}
         <div className="md:col-span-3 space-y-2">
            <NavButton active={activeTab === 'general'} onClick={() => setActiveTab('general')} icon={<User size={18} />} label="General" />
            <NavButton active={activeTab === 'billing'} onClick={() => setActiveTab('billing')} icon={<CreditCard size={18} />} label="Billing" />
            <div className="my-4 border-t border-slate-100 dark:border-slate-700 w-full" />
            <NavButton active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} icon={<Bell size={18} />} label="Notifications" />
            <NavButton active={activeTab === 'security'} onClick={() => setActiveTab('security')} icon={<Shield size={18} />} label="Security" />
            <NavButton active={activeTab === 'system'} onClick={() => setActiveTab('system')} icon={<Globe size={18} />} label="Language & Region" />
         </div>

         {/* Content Area */}
         <div className="md:col-span-9">
            {renderContent()}
         </div>
      </div>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }) {
   return (
      <button 
         onClick={onClick}
         className={`w-full text-left px-4 py-3 rounded-xl font-medium flex items-center gap-3 transition-all ${
            active 
            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-lg' 
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
         }`}
      >
         {icon} {label}
      </button>
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

function ShieldCheckIcon({ size, className }) {
   return (
      <svg 
         xmlns="http://www.w3.org/2000/svg" 
         width={size} 
         height={size} 
         viewBox="0 0 24 24" 
         fill="none" 
         stroke="currentColor" 
         strokeWidth="2" 
         strokeLinecap="round" 
         strokeLinejoin="round" 
         className={className}
      >
         <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
         <path d="m9 12 2 2 4-4" />
      </svg>
   );
}

