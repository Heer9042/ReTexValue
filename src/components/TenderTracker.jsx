
import React from 'react';
import { Clock, CheckCircle, Search, Cpu, Bell, ArrowRight } from 'lucide-react';

export default function TenderTracker({ requests = [] }) {
  if (requests.length === 0) return null;

  // We'll show the most recent request's tracking
  const latestRequest = requests[0];
  
  const steps = [
    { id: 1, name: 'Submission', status: 'completed', icon: <CheckCircle size={16} />, desc: 'Request received' },
    { id: 2, name: 'Verification', status: latestRequest.status === 'Pending' ? 'current' : 'completed', icon: <Search size={16} />, desc: 'AI & Admin review' },
    { id: 3, name: 'Factory Match', status: latestRequest.status === 'Verified' ? 'current' : (latestRequest.status === 'Pending' ? 'upcoming' : 'completed'), icon: <Cpu size={16} />, desc: 'Network matching' },
    { id: 4, name: 'Bidding', status: latestRequest.status === 'Matched' ? 'current' : (['Pending', 'Verified'].includes(latestRequest.status) ? 'upcoming' : 'completed'), icon: <Bell size={16} />, desc: 'Active quotes' },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden relative group">
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors"></div>
      
      <div className="flex justify-between items-center mb-10">
         <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Live Tender Protocol</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Tracing: {latestRequest.fabricType} ({latestRequest.quantity}kg)</p>
         </div>
         <div className="px-4 py-1.5 bg-blue-50 dark:bg-blue-500/10 rounded-full border border-blue-100 dark:border-blue-500/20">
            <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Active Request</span>
         </div>
      </div>

      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-5 right-5 h-0.5 bg-slate-100 dark:bg-slate-700">
           <div 
             className="h-full bg-blue-600 transition-all duration-1000" 
             style={{ width: `${(steps.filter(s => s.status === 'completed').length / (steps.length - 1)) * 100}%` }}
           ></div>
        </div>

        <div className="relative flex justify-between">
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center gap-3">
              <div className={`
                w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 z-10
                ${step.status === 'completed' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 
                  step.status === 'current' ? 'bg-white dark:bg-slate-900 border-2 border-blue-600 text-blue-600 animate-pulse' : 
                  'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400'}
              `}>
                {step.icon}
              </div>
              <div className="text-center">
                <p className={`text-[10px] font-black uppercase tracking-tight ${step.status === 'upcoming' ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}>{step.name}</p>
                <p className="text-[8px] text-slate-400 font-bold uppercase mt-1 opacity-60 leading-tight">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 pt-8 border-t border-slate-50 dark:border-slate-700/50 flex justify-between items-center text-right">
         <div className="flex -space-x-3">
            {[1,2,3].map(i => (
               <div key={i} className={`w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-400 overflow-hidden`}>
                  <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="factory" />
               </div>
            ))}
            <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-blue-600 flex items-center justify-center text-[8px] font-black text-white">
               +12
            </div>
         </div>
         <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Factories currently reviewing specs</p>
      </div>
    </div>
  );
}
