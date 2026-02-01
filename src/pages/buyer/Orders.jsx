import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Filter, ShoppingBag, Clock, CheckCircle, ArrowUpRight, Receipt, Package, MapPin, Truck } from 'lucide-react';

export default function BuyerOrders() {
  const { transactions, listings, user } = useApp();
  // Filter for current authenticated buyer
  const myOrders = transactions.filter(t => t.buyerId === user?.id);
  const [filter, setFilter] = useState('All');

  const filteredOrders = filter === 'All' ? myOrders : myOrders.filter(t => t.status === filter);

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-10 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
         <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Procurement <span className="text-emerald-600">Ledger</span></h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Verified transaction history for your sustainable supply chain.</p>    
         </div>

         <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-inner">
            {['All', 'Completed', 'Processing', 'Shipped'].map(status => (
               <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                     filter === status 
                     ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xl' 
                     : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
               >
                  {status}
               </button>
            ))}
         </div>
      </div>
      
      {/* Desktop Table View / Mobile Card View */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden shadow-sm">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
             <thead>
                <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50/50 dark:bg-slate-900/30">
                   <th className="px-8 py-6">Reference ID</th>
                   <th className="px-8 py-6">Date of Entry</th>
                   <th className="px-8 py-6">Commercial Details</th>
                   <th className="px-8 py-6">Total Value</th>
                   <th className="px-8 py-6 text-right">Documentation</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                {filteredOrders.length > 0 ? filteredOrders.map(t => {
                   const listing = listings.find(l => l.id === t.listingId) || {};
                   return (
                      <tr key={t.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-700/10 transition-colors">
                         <td className="px-8 py-6">
                            <span className="font-mono text-[10px] text-slate-400 group-hover:text-emerald-600 transition-colors tracking-tighter">#{t.id.substring(0, 12).toUpperCase()}</span>
                         </td>
                         <td className="px-8 py-6">
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                               {new Date(t.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                            </p>
                         </td>
                         <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                               <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-900 overflow-hidden border border-slate-50 dark:border-slate-800 group-hover:scale-105 transition-transform">
                                  {listing.imageUrl ? (
                                     <img src={listing.imageUrl} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                     <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <Package size={20} />
                                     </div>
                                  )}
                               </div>
                               <div>
                                  <div className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-tight">{listing.fabricType || 'Legacy Item'}</div>
                                  <div className="flex items-center gap-2 text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-widest">
                                     <Truck size={10} /> {listing.quantity || 0} kg <span className="text-slate-300">|</span> <MapPin size={10} /> {listing.location?.split(',')[0] || 'N/A'}
                                  </div>
                               </div>
                            </div>
                         </td>
                         <td className="px-8 py-6 whitespace-nowrap">
                            <span className="font-black text-slate-900 dark:text-white text-lg">₹{t.amount.toLocaleString()}</span>
                         </td>
                         <td className="px-8 py-6 text-right font-black uppercase tracking-widest text-[9px]">
                            <button 
                               onClick={() => handlePrintInvoice(t, listing)}
                               className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 hover:scale-110 transition-all"
                            >
                               <Receipt size={14} /> PDF Invoice <ArrowUpRight size={12} />
                            </button>
                         </td>
                      </tr>
                   );
                }) : (
                   <tr>
                      <td colSpan="5" className="py-32 text-center">
                         <EmptyOrders />
                      </td>
                   </tr>
                )}
             </tbody>
          </table>
        </div>

        {/* Mobile View - Card Based */}
        <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-700/50">
           {filteredOrders.length > 0 ? filteredOrders.map(t => {
              const listing = listings.find(l => l.id === t.listingId) || {};
              return (
                 <div key={t.id} className="p-4 space-y-4">
                    <div className="flex justify-between items-start">
                       <div>
                          <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1">ID: #{t.id.substring(0, 8).toUpperCase()}</p>
                          <p className="text-xs font-bold text-slate-500">{new Date(t.date).toLocaleDateString()}</p>
                       </div>
                       <button 
                          onClick={() => handlePrintInvoice(t, listing)}
                          className="p-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-500/20 shadow-sm"
                       >
                          <Receipt size={16} />
                       </button>
                    </div>

                    <div className="flex gap-4 items-center">
                       <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-900 overflow-hidden border border-slate-50 dark:border-slate-800">
                          <img src={listing.imageUrl || 'https://via.placeholder.com/150'} alt="" className="w-full h-full object-cover" />
                       </div>
                       <div className="flex-1">
                          <h4 className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-tight mb-1">{listing.fabricType || 'Legacy Item'}</h4>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                             <Package size={10} /> {listing.quantity || 0} kg 
                          </p>
                       </div>
                       <div className="text-right">
                          <p className="font-black text-slate-900 dark:text-white text-sm">₹{t.amount.toLocaleString()}</p>
                          <p className="text-[8px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mt-1">Paid</p>
                       </div>
                    </div>
                 </div>
              );
           }) : (
              <div className="py-20 px-8 text-center bg-slate-50/50 dark:bg-slate-900/30">
                 <EmptyOrders />
              </div>
           )}
        </div>
      </div>
    </div>
  );
}

function EmptyOrders() {
   return (
      <div className="flex flex-col items-center justify-center text-slate-400 gap-4 opacity-30">
         <ShoppingBag size={64} />
         <p className="text-sm font-black uppercase tracking-widest text-center">No Acquisitions Recorded</p>
      </div>
   );
}

function handlePrintInvoice(transaction, listing) {
   const printWindow = window.open('', '', 'width=800,height=600');
   const invoiceContent = `
      <html>
        <head>
          <title>Invoice #${transaction.id}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #333; }
            .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
            .logo { font-size: 24px; font-weight: 900; color: #059669; }
            .invoice-details { text-align: right; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; }
            .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .table th { text-align: left; border-bottom: 2px solid #eee; padding: 10px 0; font-size: 12px; text-transform: uppercase; color: #666; }
            .table td { padding: 15px 0; border-bottom: 1px solid #eee; }
            .total { text-align: right; font-size: 24px; font-weight: bold; color: #111; }
            .footer { margin-top: 60px; text-align: center; font-size: 12px; color: #999; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">ReTex Value</div>
            <div class="invoice-details">
              <h1>INVOICE</h1>
              <p>#${transaction.id.slice(0, 8).toUpperCase()}</p>
              <p>Date: ${new Date(transaction.date).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div class="grid">
            <div>
              <strong>Bill To:</strong><br/>
              Buyer ID: ${transaction.buyerId}<br/>
              Platform User
            </div>
            <div>
               <strong>Ship From:</strong><br/>
               ${listing.shopName || 'Verified Factory'}<br/>
               ${listing.location || 'Warehouse A'}
            </div>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${listing.fabricType || 'Textile Waste Stock'} (${listing.fabricCategory || 'General'})</td>
                <td>${listing.quantity} kg</td>
                <td>₹${listing.price}</td>
                <td>₹${transaction.amount.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <div class="total">
            Total Paid: ₹${transaction.amount.toLocaleString()}
          </div>

          <div class="footer">
            <p>Thank you for using ReTex Value. This is a computer-generated invoice.</p>
          </div>
          <script>
             window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
   `;
   
   printWindow.document.write(invoiceContent);
   printWindow.document.close();
}

function StatusBadge({ status }) {
   const styles = {
      Completed: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
      Processing: "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
      Shipped: "bg-violet-50 text-violet-600 border-violet-100 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20",
      Pending: "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
   };

   return (
      <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border flex items-center justify-center gap-2 w-fit ${styles[status] || styles.Pending}`}>
         {status === 'Completed' ? <CheckCircle size={10} /> : <Clock size={10} />}
         {status}
      </span>
   );
}
