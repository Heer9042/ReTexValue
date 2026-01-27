import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Check, Loader2, Send, Info, Package, DollarSign, Calendar, FileText } from 'lucide-react';

const FABRIC_DATA = {
  'Cotton': ['Organic Cotton', 'Pima Cotton', 'Egyptian Cotton', 'Recycled Cotton', 'Denim', 'Canvas', 'Poplin'],
  'Polyester': ['Virgin Polyester', 'Recycled Polyester (rPET)', 'Microfiber', 'Fleece', 'Satin', 'Chiffon'],
  'Silk': ['Mulberry Silk', 'Tussar Silk', 'Eri Silk', 'Muga Silk', 'Raw Silk', 'Crepe'],
  'Wool': ['Merino Wool', 'Cashmere', 'Lambswool', 'Tweed', 'Worsted', 'Felt'],
  'Linen': ['Pure Linen', 'Damask', 'Cambric', 'Butcher Linen'],
  'Blended': ['Cotton-Polyester', 'Wool-Silk', 'Cotton-Spandex', 'Poly-Viscose', 'Cotton-Linen'],
  'Other': ['Hemp', 'Bamboo', 'Rayon/Viscose', 'Nylon', 'Acrylic', 'Spandex']
};

export default function BulkRequest() {
  const { user, addBulkRequest } = useApp();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fabricCategory: 'Cotton',
    fabricType: 'Organic Cotton',
    quantity: '',
    targetPrice: '',
    deadline: '',
    description: '',
    requirements: 'Standard',
  });

  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    setFormData(prev => ({
      ...prev,
      fabricCategory: newCategory,
      fabricType: FABRIC_DATA[newCategory][0] // Reset type
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
       await addBulkRequest({
          ...formData,
          buyerId: user?.id || 'guest',
          buyerName: user?.name || 'Guest Buyer'
       });
       setSuccess(true);
       setTimeout(() => {
          navigate('/buyer/proposals'); 
       }, 2000);
    } catch (err) {
       console.error("Failed to submit bulk request:", err);
       alert("Submission failed. Please try again.");
    } finally {
       setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-700 pb-6">
         <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
            <ShoppingCart size={24} />
         </div>
         <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Post Bulk Request</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm sm:text-base">Describe your raw material requirements and connect with verified factories.</p>
         </div>
      </div>

      {success ? (
         <div className="bg-white dark:bg-slate-800 border-2 border-emerald-500/50 rounded-3xl p-16 text-center animate-in zoom-in-95 shadow-xl">
            <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
               <Check className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Request Submitted!</h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-lg mx-auto">
               We have sent your requirements to our top-rated partner factories. Expect quotes within 24-48 hours.
            </p>
         </div>
      ) : (
         <div className="grid md:grid-cols-12 gap-8">
            {/* Left: Form */}
            <div className="md:col-span-8">
               <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-8 rounded-2xl space-y-8 shadow-sm">
                 
                 <div className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                       <Package size={20} className="text-blue-500" /> Material Specifications
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                       <InputGroup label="Fabric Category">
                          <select
                            value={formData.fabricCategory}
                            onChange={handleCategoryChange}
                            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none cursor-pointer"
                          >
                            {Object.keys(FABRIC_DATA).map(category => (
                              <option key={category} value={category}>{category}</option>
                            ))}
                          </select>
                       </InputGroup>

                       <InputGroup label="Fabric Type">
                          <select
                            value={formData.fabricType}
                            onChange={e => setFormData({...formData, fabricType: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none cursor-pointer"
                          >
                              {FABRIC_DATA[formData.fabricCategory].map(type => (
                                <option key={type} value={type}>{type}</option>
                              ))}
                          </select>
                       </InputGroup>

                       <InputGroup label="Required Quantity (kg)">
                          <input 
                            type="number" 
                            required
                            value={formData.quantity}
                            onChange={e => setFormData({...formData, quantity: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-400"
                            placeholder="e.g. 5000"
                          />
                       </InputGroup>

                       <InputGroup label="Target Price / kg (₹)">
                          <div className="relative">
                             <input 
                               type="number" 
                               required
                               value={formData.targetPrice}
                               onChange={e => setFormData({...formData, targetPrice: e.target.value})}
                               className="w-full pl-10 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-400"
                               placeholder="Optional"
                             />
                             <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          </div>
                       </InputGroup>
                    </div>
                 </div>

                 <div className="h-px bg-slate-100 dark:bg-slate-700 w-full"></div>

                 <div className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                       <FileText size={20} className="text-purple-500" /> Request Details
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                       <InputGroup label="Expected Deadline">
                          <div className="relative">
                             <input 
                               type="date" 
                               required
                               min={new Date().toISOString().split('T')[0]}
                               value={formData.deadline}
                               onChange={e => setFormData({...formData, deadline: e.target.value})}
                               className="w-full pl-10 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                             />
                             <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          </div>
                       </InputGroup>
                    </div>

                    <InputGroup label="Additional Specifications">
                       <textarea 
                         rows="4"
                         value={formData.description}
                         onChange={e => setFormData({...formData, description: e.target.value})}
                         className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none placeholder:text-slate-400"
                         placeholder="Describe specific quality requirements, color codes, end-usage, or packaging needs..."
                       />
                    </InputGroup>
                 </div>

                 <button 
                   type="submit"
                   disabled={submitting}
                   className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.99] flex items-center justify-center gap-2 mt-8"
                 >
                   {submitting ? (
                      <><Loader2 className="animate-spin" /> Sending...</>
                   ) : (
                      <><Send size={20} /> Submit Request</>
                   )}
                 </button>
               </form>
            </div>

            {/* Right: Info Card */}
            <div className="md:col-span-4 space-y-6">
               <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 p-6 rounded-2xl sticky top-6">
                  <h3 className="text-emerald-900 dark:text-emerald-400 font-bold mb-4 flex items-center gap-2">
                     <Info size={20} /> Why use Bulk Requests?
                  </h3>
                  <ul className="space-y-4">
                     <BenefitItem 
                        number="1" 
                        text="Compare quotes from multiple verified factories instantly."
                     />
                     <BenefitItem 
                        number="2" 
                        text="Access unlisted inventory before it hits the public marketplace."
                     />
                     <BenefitItem 
                        number="3" 
                        text="Secure volume discounts (typically 15-20% lower)."
                     />
                  </ul>
                  
                  <div className="mt-6 pt-6 border-t border-emerald-200 dark:border-emerald-800/30">
                     <p className="text-xs text-emerald-700 dark:text-emerald-500 font-medium text-center">
                        Need help defining specs? <br />
                        <span className="underline cursor-pointer hover:text-emerald-900 dark:hover:text-white">Chat with support</span>
                     </p>
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}

function InputGroup({ label, children }) {
   return (
      <div className="space-y-2">
         <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</label>
         {children}
      </div>
   );
}

function BenefitItem({ number, text }) {
   return (
      <li className="flex gap-4 items-start">
         <div className="w-6 h-6 rounded-full bg-emerald-200 dark:bg-emerald-500/30 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
            {number}
         </div>
         <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            {text}
         </p>
      </li>
   );
}
