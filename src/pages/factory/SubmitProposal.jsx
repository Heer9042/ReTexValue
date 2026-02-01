import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { FileText, Calendar, IndianRupee, Send, ArrowLeft } from 'lucide-react';

export default function SubmitProposal() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { bulkRequests, submitProposal, user } = useApp();
  const [request, setRequest] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [errors, setErrors] = useState({});

  // Form State
  const [formData, setFormData] = useState({
    pricePerKg: '',
    deliveryDate: '',
    message: '',
  });

  const validateDeliveryDate = (date) => {
    const today = new Date().toISOString().split('T')[0];
    const deadline = request?.deadline ? new Date(request.deadline).toISOString().split('T')[0] : null;
    
    if (date < today) {
      return "Delivery date cannot be in the past";
    }
    if (deadline && date > deadline) {
      return "Delivery date must be before the request deadline";
    }
    return null;
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    const error = validateDeliveryDate(date);
    
    setFormData({...formData, deliveryDate: date});
    setErrors({...errors, deliveryDate: error});
  };

  useEffect(() => {
    const foundRequest = bulkRequests.find(r => r.id === requestId);
    if (foundRequest) {
      setRequest(foundRequest);
    } else {
      // Fallback or redirect if invalid ID
    }
  }, [requestId, bulkRequests]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const dateError = validateDeliveryDate(formData.deliveryDate);
    if (dateError) {
      setErrors({...errors, deliveryDate: dateError});
      return;
    }

    setSubmitting(true);

    try {
      await submitProposal({
         requestId: request.id,
         requestTitle: `${request.fabricType} (${request.fabricCategory})`,
         buyerId: request.buyerId,
         factoryId: user?.id,
         factoryName: user?.company_name || user?.name || 'Verified Factory',
         priceQuoted: formData.pricePerKg,
         totalPrice: Number(formData.pricePerKg) * Number(request.quantity),
         deliveryDate: formData.deliveryDate,
         message: formData.message,
      });
      alert('Proposal Submitted Successfully!');
      navigate('/factory/proposals');
    } catch (error) {
      console.error("Proposal submission failed:", error);
      alert("Failed to submit proposal. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!request) return <div className="p-10 text-center text-slate-500">Loading Request Details...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto min-h-screen">
      <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center gap-2 mb-6 transition-colors">
         <ArrowLeft size={18} /> Back to Dashboard
      </button>

      <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
         <div className="p-6 border-b border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-900/50">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Submit Proposal</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Drafting proposal for <span className="text-emerald-600 dark:text-emerald-400 font-medium">{request.fabricType}</span> Request</p>
         </div>
         
         <div className="p-8">
            {/* Request Summary */}
            <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-4 mb-8 border border-slate-200 dark:border-slate-700/50">
               <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-300 mb-3 uppercase tracking-wider">Buyer Requirements</h3>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                     <p className="text-slate-500">Quantity</p>
                     <p className="text-slate-900 dark:text-white font-medium">{request.quantity} kg</p>
                  </div>
                  <div>
                     <p className="text-slate-500">Target Price</p>
                     <p className="text-slate-900 dark:text-white font-medium">₹{request.targetPrice || 'N/A'} /kg</p>
                  </div>
                  <div>
                     <p className="text-slate-500">Deadline</p>
                     <p className="text-slate-900 dark:text-white font-medium">{request.deadline}</p>
                  </div>
                  <div>
                     <p className="text-slate-500">Buyer</p>
                     <p className="text-slate-900 dark:text-white font-medium">{request.buyerName}</p>
                  </div>
               </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                     <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-2">Offered Price per Kg (₹)</label>
                     <div className="relative">
                        <IndianRupee size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                        <input 
                           type="number" 
                           required
                           value={formData.pricePerKg}
                           onChange={e => setFormData({...formData, pricePerKg: e.target.value})}
                           className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-10 pr-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder-slate-400"
                           placeholder="0.00"
                        />
                     </div>
                  </div>
                  
                  <div>
                     <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-2">
                       Earliest Delivery Date 
                       <span className="text-xs text-slate-500 ml-1">
                         (before {request.deadline ? new Date(request.deadline).toLocaleDateString() : 'deadline'})
                       </span>
                     </label>
                     <div className="relative">
                        <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                        <input 
                           type="date" 
                           required
                           min={new Date().toISOString().split('T')[0]}
                           max={request.deadline ? (() => {
                             try {
                               return new Date(request.deadline).toISOString().split('T')[0];
                             } catch {
                               return undefined;
                             }
                           })() : undefined}
                           value={formData.deliveryDate}
                           onChange={handleDateChange}
                           className={`w-full bg-slate-50 dark:bg-slate-900 border rounded-lg pl-10 pr-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all ${
                             errors.deliveryDate ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                           }`}
                        />
                     </div>
                     {errors.deliveryDate && (
                       <p className="text-red-500 text-xs mt-1">{errors.deliveryDate}</p>
                     )}
                  </div>
               </div>

               <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-2">Proposal Message / Remarks</label>
                  <textarea 
                     rows="4"
                     value={formData.message}
                     onChange={e => setFormData({...formData, message: e.target.value})}
                     className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none placeholder-slate-400"
                     placeholder="Describe your material quality, logistics, or any terms..."
                  />
               </div>

               {/* Summary Calculation */}
               {formData.pricePerKg && (
                  <div className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 p-4 rounded-xl">
                     <span className="text-emerald-700 dark:text-emerald-200 text-sm font-medium">Total Proposal Value</span>
                     <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">₹{(Number(formData.pricePerKg) * Number(request.quantity)).toLocaleString()}</span>
                  </div>
               )}

               <button 
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
               >
                  {submitting ? 'Sending Proposal...' : <><Send size={20} /> Submit Proposal</>}
               </button>
            </form>
         </div>
      </div>
    </div>
  );
}
