import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <>
      <Navbar />
      <div className="pt-20 min-h-screen bg-slate-50 dark:bg-slate-900 grid lg:grid-cols-2 relative transition-colors duration-300">
         
         {/* Background Decoration */}
         <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-100/30 dark:bg-emerald-900/10 hidden lg:block" />

         {/* Left Side - Info */}
         <div className="p-8 lg:p-24 flex flex-col justify-center relative z-10">
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">Let's Clean the Planet Together</h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-12">
               Have questions about platform integration, recycling partnerships, or bulk pricing? We're here to help.
            </p>

            <div className="space-y-8">
               <ContactItem 
                  icon={<Mail className="text-emerald-600 dark:text-emerald-400" />}
                  title="Email Us"
                  detail="hello@retexvalue.com"
               />
               <ContactItem 
                  icon={<Phone className="text-emerald-600 dark:text-emerald-400" />}
                  title="Call Us"
                  detail="+91 (800) 123-4567"
               />
               <ContactItem 
                  icon={<MapPin className="text-emerald-600 dark:text-emerald-400" />}
                  title="Visit HQ"
                  detail="123 Sustainability Ave, Mumbai, India"
               />
            </div>
         </div>

         {/* Right Side - Form */}
         <div className="p-8 lg:p-24 bg-white dark:bg-slate-800/30 backdrop-blur-md flex flex-col justify-center border-l border-slate-200 dark:border-slate-800">
            <form onSubmit={handleSubmit} className="space-y-6 max-w-lg w-full mx-auto">
               <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Send a Message</h2>
               
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="text-sm font-medium text-slate-700 dark:text-slate-400 mb-2 block">First Name</label>
                     <Input placeholder="xxxxx" />
                  </div>
                  <div>
                     <label className="text-sm font-medium text-slate-700 dark:text-slate-400 mb-2 block">Last Name</label>
                     <Input placeholder="xxxxx" />
                  </div>
               </div>

               <div>
                 <label className="text-sm font-medium text-slate-700 dark:text-slate-400 mb-2 block">Email Address</label>
                 <Input type="email" placeholder="xxxx@company.com" />
               </div>

               <div>
                 <label className="text-sm font-medium text-slate-700 dark:text-slate-400 mb-2 block">Message</label>
                 <textarea 
                   rows="4" 
                   className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-none"
                   placeholder="How can we help you today?"
                 ></textarea>
               </div>

               <button 
                  disabled={submitted}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
               >
                  {submitted ? (
                     <>Message Sent!</>
                  ) : (
                     <>Send Message <Send size={18} /></>
                  )}
               </button>
            </form>
         </div>

      </div>
      <Footer />
    </>
  );
}

function ContactItem({ icon, title, detail }) {
   return (
      <div className="flex items-center gap-4 group cursor-pointer">
         <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 group-hover:border-emerald-500 dark:group-hover:border-emerald-500 transition-colors shadow-sm dark:shadow-none">
            {icon}
         </div>
         <div>
            <h3 className="text-slate-900 dark:text-white font-semibold">{title}</h3>
            <p className="text-slate-600 dark:text-slate-400">{detail}</p>
         </div>
      </div>
   );
}

function Input(props) {
   return (
      <input 
         {...props}
         className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
      />
   );
}
