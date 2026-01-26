import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, Mail, Phone, MapPin, Building, Save, Camera, CreditCard, Award, Share2 } from 'lucide-react';

export default function FactoryProfile() {
  const { user, updateProfile } = useApp();
  const [formData, setFormData] = useState({
     name: user?.name || 'Factory Admin',
     email: user?.email || 'admin@texfactory.com',
     phone: '+91 98765 43210',
     company: 'TexFactory Solutions Ltd.',
     address: 'Plot 45, MIDC, Andheri East, Mumbai, Maharashtra',
     gst: '27AABCU9603R1Z2',
     capacity: '5000',
     location: 'Mumbai, India'
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      {/* Header with Background */}
      <div className="relative h-28 rounded-2xl bg-linear-to-r from-slate-900 to-slate-800 overflow-hidden">
         <div className="absolute inset-0 bg-grid-white/[0.05]" style={{ backgroundSize: '20px 20px' }}></div>
         <div className="absolute top-4 sm:top-6 right-4 sm:right-6 flex flex-col sm:flex-row gap-2 sm:gap-3 w-auto">
             <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium backdrop-blur-sm transition-colors whitespace-nowrap">
                 <Share2 size={16} /> Share
             </button>
             <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium shadow-lg shadow-emerald-500/20 transition-all">
                 <Save size={16} /> Save Changes
             </button>
         </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 px-4 mt-8">
         {/* Left Sidebar - sticky */}
         <div className="lg:col-span-4 space-y-6 -mt-24">
            {/* Profile Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-700 relative">
               <div className="flex flex-col items-center -mt-16 mb-4">
                  <div className="relative group cursor-pointer">
                     <div className="w-32 h-32 rounded-2xl bg-white dark:bg-slate-700 p-1 shadow-2xl rotate-3 transition-transform group-hover:rotate-0">
                        <div className="w-full h-full bg-slate-100 dark:bg-slate-600 rounded-xl flex items-center justify-center overflow-hidden">
                           <User size={48} className="text-slate-400" />
                        </div>
                     </div>
                     <div className="absolute -bottom-2 -right-2 p-2 bg-emerald-500 dark:bg-emerald-600 text-white rounded-full shadow-lg border-4 border-white dark:border-slate-800">
                        <Camera size={16} />
                     </div>
                  </div>
                  <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white text-center leading-tight">
                     {formData.company}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                     <MapPin size={12} /> Mumbai, India
                  </p>
                  
                  <div className="mt-6 flex gap-2">
                     <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-full uppercase tracking-wider border border-blue-100 dark:border-blue-700">Factory</span>
                     <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full uppercase tracking-wider border border-emerald-100 dark:border-emerald-700">Verified</span>
                  </div>
               </div>

               <div className="pt-6 border-t border-slate-100 dark:border-slate-700/50 grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700/30">
                     <p className="text-2xl font-bold text-slate-900 dark:text-white">12</p>
                     <p className="text-xs text-slate-500 font-medium">Listings</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700/30">
                     <p className="text-2xl font-bold text-slate-900 dark:text-white">4.8</p>
                     <p className="text-xs text-slate-500 font-medium">Rating</p>
                  </div>
               </div>
            </div>

            {/* Badges / Certifications (Mock) */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
               <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-sm uppercase tracking-wide flex items-center gap-2">
                  <Award size={16} className="text-amber-500" /> Certifications
               </h3>
               <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/20">
                     <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-500 font-bold text-xs">ISO</div>
                     <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">ISO 14001</p>
                        <p className="text-xs text-slate-500">Environmental Mgmt</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/20">
                     <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-500 font-bold text-xs">GRS</div>
                     <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Global Recycled</p>
                        <p className="text-xs text-slate-500">Standard Certified</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Right Column - Forms */}
         <div className="lg:col-span-8 space-y-6">
            {/* Company Info */}
            <section className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
               <div className="p-6 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50">
                   <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                       <Building size={20} className="text-blue-500" /> Organization Details
                   </h3>
                   <p className="text-sm text-slate-500 mt-1">Official details used for billing and verification.</p>
               </div>
               
               <div className="p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  <div className="md:col-span-2">
                     <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Company Legal Name</label>
                     <input 
                        type="text" 
                        value={formData.company}
                        onChange={e => setFormData({...formData, company: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all"
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">GST / Tax ID</label>
                     <div className="relative">
                        <CreditCard className="absolute left-4 top-3.5 text-slate-400" size={18} />
                        <input 
                           type="text" 
                           value={formData.gst}
                           onChange={e => setFormData({...formData, gst: e.target.value})}
                           className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all font-mono"
                        />
                     </div>
                  </div>
                  <div>
                     <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Monthly Capacity (kg)</label>
                     <input 
                        type="text" 
                        value={formData.capacity}
                        onChange={e => setFormData({...formData, capacity: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all"
                     />
                  </div>
                  <div className="md:col-span-2">
                     <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Registered Address</label>
                     <textarea 
                        rows="3"
                        value={formData.address}
                        onChange={e => setFormData({...formData, address: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all resize-none"
                     ></textarea>
                  </div>
               </div>
            </section>

            {/* Contact Info */}
            <section className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
               <div className="p-6 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50">
                   <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                       <User size={20} className="text-emerald-500" /> Primary Contact
                   </h3>
                   <p className="text-sm text-slate-500 mt-1">Person responsible for platform communications.</p>
               </div>
               
               <div className="p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  <div>
                     <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                     <div className="relative">
                        <User className="absolute left-4 top-3.5 text-slate-400" size={18} />
                        <input 
                           type="text" 
                           value={formData.name}
                           onChange={e => setFormData({...formData, name: e.target.value})}
                           className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white transition-all"
                        />
                     </div>
                  </div>
                  <div>
                     <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Phone Number</label>
                     <div className="relative">
                        <Phone className="absolute left-4 top-3.5 text-slate-400" size={18} />
                        <input 
                           type="text" 
                           value={formData.phone}
                           onChange={e => setFormData({...formData, phone: e.target.value})}
                           className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white transition-all"
                        />
                     </div>
                  </div>
                  <div className="md:col-span-2">
                     <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                     <div className="relative">
                        <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
                        <input 
                           type="email" 
                           value={formData.email}
                           onChange={e => setFormData({...formData, email: e.target.value})}
                           className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white transition-all"
                        />
                     </div>
                  </div>
               </div>
            </section>
         </div>
      </div>
    </div>
  );
}

