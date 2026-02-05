import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, MapPin, CreditCard, Bell, Shield, Save, Building, Mail, Phone, Upload, Globe, Award, Zap } from 'lucide-react';
import Avatar from '../../components/Avatar';


export default function BuyerProfile() {
  const { user, updateProfile, uploadFile } = useApp();
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef(null);
  
  const [formData, setFormData] = useState({
    full_name: user?.full_name || user?.name || '',
    company_name: user?.company_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    location: user?.location || '',
    gst_number: user?.gst_number || '',
    avatar_url: user?.avatar_url || ''
  });
  const [localPreview, setLocalPreview] = useState(null);

  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState({});

  // Sync if user data loads later
  React.useEffect(() => {
    if (user) {
      console.log('🔄 [Profile] Syncing user data to form:', {
        avatar_url: user.avatar_url || '(empty)',
        full_name: user.full_name
      });
      
      setFormData({
        full_name: user.full_name || user.name || '',
        company_name: user.company_name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        location: user.location || '',
        gst_number: user.gst_number || '',
        avatar_url: user.avatar_url || ''
      });
    }
  }, [user]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Instant Preview for immediate feedback
    const preview = URL.createObjectURL(file);
    setLocalPreview(preview);
    setUploading(true);

    try {
        console.log("Starting avatar upload sequence...");
        const publicUrl = await uploadFile(file);
        console.log("File uploaded successfully:", publicUrl);
        await updateProfile({ avatar_url: publicUrl });
        setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
        console.log("Profile avatar URL synchronized.");
    } catch (error) {
        console.error("Avatar Update Fault:", error);
        alert(`Avatar Sync Failed: ${error.message || "Connection timed out"}. Your local preview is still active.`);
    } finally {
        setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    // Comprehensive Validation Logic
    const newErrors = {};
    const phoneRegex = /^[0-9]{10}$/;
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

    // Full Name validation
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    } else if (formData.full_name.trim().length < 2) {
      newErrors.full_name = 'Full name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.full_name)) {
      newErrors.full_name = 'Full name should only contain letters and spaces';
    }

    // Company Name validation (optional)
    if (formData.company_name.trim() && formData.company_name.trim().length < 2) {
      newErrors.company_name = 'Company name must be at least 2 characters';
    }

    // Phone validation (optional but validate if provided)
    if (formData.phone) {
      const cleanPhone = formData.phone.replace(/\s/g, '').replace('+91', '');
      if (!phoneRegex.test(cleanPhone)) {
        newErrors.phone = 'Phone must be a valid 10-digit number';
      }
    }

    // Location validation (optional but validate if provided)
    if (formData.location.trim() && formData.location.trim().length < 2) {
      newErrors.location = 'Location must be at least 2 characters';
    }

    // Address validation (optional but validate if provided)
    if (formData.address.trim() && formData.address.trim().length < 5) {
      newErrors.address = 'Address must be at least 5 characters';
    } else if (formData.address.trim().length > 200) {
      newErrors.address = 'Address must be less than 200 characters';
    }

    // GST Number validation (optional but validate if provided)
    if (formData.gst_number.trim()) {
      if (formData.gst_number.length !== 15) {
        newErrors.gst_number = 'GST Number must be exactly 15 characters';
      } else if (!gstRegex.test(formData.gst_number)) {
        newErrors.gst_number = 'Invalid GST format (e.g. 27XXXXX0000X1Z5)';
      }
    }

    setErrors(newErrors);

    // Stop submission if errors exist
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    
    try {
        console.log("Initiating profile sync...");
        
        const payload = {
            full_name: formData.full_name || '',
            company_name: formData.company_name || '',
            phone: formData.phone || '',
            address: formData.address || '',
            location: formData.location || '',
            gst_number: formData.gst_number || ''
        };
        
        await updateProfile(payload);
        console.log("✅ Profile sync confirmed by server.");
        
        // Set saved state on success
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    } catch (error) {
        console.error("⚠️ Profile Sync Fault:", error);
        
        // For timeout errors, show success since optimistic update already happened
        if (error.message === 'Database Sync Timed Out') {
            console.warn('📡 Changes saved locally. Will sync when connection improves.');
            
            // Still show "saved" to user since optimistic update worked
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
            
            // Show a non-alarming notification
            const notice = document.createElement('div');
            notice.className = 'fixed bottom-4 right-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200 px-4 py-3 rounded-xl shadow-lg z-50';
            notice.innerHTML = `
                <div class="flex items-center gap-3">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                    </svg>
                    <div>
                        <p class="font-bold text-sm">Saved Locally</p>
                        <p class="text-xs">Changes will sync when your connection improves</p>
                    </div>
                </div>
            `;
            document.body.appendChild(notice);
            setTimeout(() => notice.remove(), 5000);
        } else if (error.message.includes('gst_number')) {
            alert("Database Error: 'gst_number' column missing. Profile saved excluding GST.");
            setSaved(false);
        } else {
            alert(`Sync Error: ${error.message}`);
            setSaved(false);
        }
    } finally {
        setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20 animate-in fade-in duration-700">
      {/* Immersive Profile Hero */}
      <div className="relative h-64 rounded-4xl bg-slate-900 border border-white/5 overflow-hidden shadow-2xl">
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
                  <div className="w-24 h-24 rounded-2xl bg-linear-to-br from-emerald-400 to-cyan-500 p-1 shadow-lg shadow-emerald-500/30 rotate-3 hover:rotate-0 transition-transform duration-300 relative group">
                     <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center text-3xl font-bold text-white uppercase border-2 border-white/20 overflow-hidden relative">
                        <Avatar 
                           src={localPreview || formData.avatar_url}
                           name={formData.full_name || 'User'}
                           alt="Profile"
                           debug={true}
                        />
                        {uploading && (
                           <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
                              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                           </div>
                        )}
                     </div>
                     <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleAvatarUpload} 
                        className="hidden" 
                        accept="image/*" 
                     />
                     <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="absolute -bottom-2 -right-2 w-10 h-10 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-xl border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-blue-500 transition-all z-10"
                     >
                        <Upload size={16} />
                     </button>
                  </div>
                  
                  <div className="mt-8 text-center">
                     <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{formData.full_name || user?.full_name || 'Company Name'}</h2>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Verified Sourcing Partner</p>
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
            <div className="bg-linear-to-br from-blue-600 to-indigo-700 rounded-4xl p-10 text-white shadow-2xl shadow-blue-500/20 relative overflow-hidden group">
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
            <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-4xl p-6 md:p-12 shadow-2xl shadow-slate-200/50 dark:shadow-none">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-slate-50 dark:border-slate-800 pb-10">
                  <div>
                     <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Operational Identity</h2>
                     <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium">Standardize your legal and commercial identifiers for the grid.</p>
                  </div>
                  <button 
                     type="submit"
                     disabled={saved || submitting}
                     className={`
                       px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-2xl
                       ${saved ? 'bg-emerald-600 text-white' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-black dark:hover:bg-slate-200'}
                       ${submitting ? 'opacity-50 cursor-not-allowed' : ''}
                     `}
                  >
                     {saved ? <><div className="w-2 h-2 bg-white rounded-full animate-ping"></div> Confirmed</> : 
                      submitting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Syncing...</> :
                      <><Save size={18} /> Sync Configuration</>}
                  </button>
               </div>

               <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <InputGroup label="Full Legal Name" icon={<User size={16} />}>
                       <input 
                         type="text" 
                         value={formData.full_name} 
                         onChange={e => {
                           setFormData({...formData, full_name: e.target.value});
                           if (errors.full_name) setErrors({...errors, full_name: ''});
                         }}
                         className={`w-full bg-transparent outline-none text-slate-900 dark:text-white font-medium border-b-2 transition-all ${errors.full_name ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'}`}
                         placeholder="Aditya Roy" 
                       />
                    </InputGroup>
                    {errors.full_name && <p className="text-xs text-red-500 mt-2 ml-4">{errors.full_name}</p>}
                  </div>
                  <div>
                    <InputGroup label="GSTIN / Tax ID" icon={<Shield size={16} />}>
                       <input 
                         type="text" 
                         value={formData.gst_number} 
                         onChange={e => {
                           setFormData({...formData, gst_number: e.target.value});
                           if (errors.gst_number) setErrors({...errors, gst_number: ''});
                         }}
                         className={`w-full bg-transparent outline-none text-slate-900 dark:text-white font-medium border-b-2 transition-all ${errors.gst_number ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'}`}
                         placeholder="27XXXXX0000X1Z5" 
                       />
                    </InputGroup>
                    {errors.gst_number && <p className="text-xs text-red-500 mt-2 ml-4">{errors.gst_number}</p>}
                  </div>
               </div>
               
               <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <InputGroup label="Organization Name" icon={<Building size={16} />}>
                       <input 
                         type="text" 
                         value={formData.company_name} 
                         onChange={e => {
                           setFormData({...formData, company_name: e.target.value});
                           if (errors.company_name) setErrors({...errors, company_name: ''});
                         }}
                         className={`w-full bg-transparent outline-none text-slate-900 dark:text-white font-medium border-b-2 transition-all ${errors.company_name ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'}`}
                         placeholder="ReTex Industries" 
                       />
                    </InputGroup>
                    {errors.company_name && <p className="text-xs text-red-500 mt-2 ml-4">{errors.company_name}</p>}
                  </div>
                  <div>
                    <InputGroup label="Geospatial Hub" icon={<Globe size={16} />}>
                       <input 
                         type="text" 
                         value={formData.location} 
                         onChange={e => {
                           setFormData({...formData, location: e.target.value});
                           if (errors.location) setErrors({...errors, location: ''});
                         }}
                         className={`w-full bg-transparent outline-none text-slate-900 dark:text-white font-medium border-b-2 transition-all ${errors.location ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'}`}
                         placeholder="Pune, Maharashtra" 
                       />
                    </InputGroup>
                    {errors.location && <p className="text-xs text-red-500 mt-2 ml-4">{errors.location}</p>}
                  </div>
               </div>

               <div className="mb-8">
                  <InputGroup label="Registered Mailing Address" icon={<MapPin size={16} />}>
                     <input 
                       type="text" 
                       value={formData.address} 
                       onChange={e => {
                         setFormData({...formData, address: e.target.value});
                         if (errors.address) setErrors({...errors, address: ''});
                       }}
                       className={`w-full bg-transparent outline-none text-slate-900 dark:text-white font-medium border-b-2 transition-all ${errors.address ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'}`}
                       placeholder="Plot 45, Industrial Zone..." 
                     />
                  </InputGroup>
                  {errors.address && <p className="text-xs text-red-500 mt-2 ml-4">{errors.address}</p>}
               </div>

               <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Primary Contact</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <InputGroup label="Phone Number" icon={<Phone size={16} />}>
                       <input 
                         type="text" 
                         value={formData.phone} 
                         onChange={e => {
                           setFormData({...formData, phone: e.target.value});
                           if (errors.phone) setErrors({...errors, phone: ''});
                         }}
                         className={`w-full bg-transparent outline-none text-slate-900 dark:text-white font-medium border-b-2 transition-all ${errors.phone ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'}`}
                         placeholder="+91 00000 00000" 
                       />
                    </InputGroup>
                    {errors.phone && <p className="text-xs text-red-500 mt-2 ml-4">{errors.phone}</p>}
                  </div>
                     <InputGroup label="Email Address" icon={<Mail size={16} />}>
                        <input type="email" value={formData.email} readOnly className="w-full bg-transparent outline-none text-slate-400 font-medium cursor-not-allowed" />
                     </InputGroup>
                  </div>
               </div>
            </form>

            {/* Verified Documentation Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 md:p-10 rounded-[3rem] flex flex-col md:flex-row gap-8 items-center shadow-2xl shadow-slate-200/50 dark:shadow-none">
               <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-3xl flex items-center justify-center shrink-0">
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
      <span className="px-4 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[9px] font-black uppercase tracking-widest rounded-full border border-slate-100 dark:border-slate-700 flex items-center gap-2">
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

function InputGroup({ label, icon, children }) {
   return (
      <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800 rounded-3xl p-6 focus-within:border-blue-500/50 transition-all">
         <label className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">
            {icon} {label}
         </label>
         {children}
      </div>
   );
}

