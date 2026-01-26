import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Upload, Scan, ShoppingBag, Truck, BarChart2 } from 'lucide-react';

export default function HowItWorks() {
  return (
    <>
      <Navbar />
      <div className="pt-24 pb-20 bg-white dark:bg-slate-900 min-h-screen transition-colors duration-300">
        
        <div className="max-w-4xl mx-auto px-4 text-center mb-20">
           <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">How ReTexValue Works</h1>
           <p className="text-xl text-slate-600 dark:text-slate-400">
              A transparent, end-to-end journey from factory floor to recycled product.
           </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="relative">
              {/* Connector Line */}
              <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-1 bg-linear-to-b from-emerald-500/20 via-emerald-500/50 to-emerald-500/20 -translate-x-1/2" />
              
              <Step 
                 title="Factory Uploads Waste" 
                 desc="Textile factories take a photo of their fabric scraps. They input location and quantity details."
                 icon={<Upload className="w-8 h-8 text-white" />}
                 side="left"
              />
              <Step 
                 title="AI Analysis & Grading" 
                 desc="Our proprietary AI analyzes the image to classify fabric type (Cotton, Poly, Blend) and assigns a quality score and estimated market value."
                 icon={<Scan className="w-8 h-8 text-white" />}
                 side="right"
              />
              <Step 
                 title="Listing Goes Live" 
                 desc="Once approved by our admins, the waste is tokenized as a digital asset and listed on the global marketplace."
                 icon={<ShoppingBag className="w-8 h-8 text-white" />}
                 side="left"
              />
              <Step 
                 title="Matching & Logistics" 
                 desc="Verified recyclers purchase the lot. Smart contracts handle the payment held in escrow until pickup is verified."
                 icon={<Truck className="w-8 h-8 text-white" />}
                 side="right"
              />
              <Step 
                 title="Impact Reporting" 
                 desc="Both buyer and seller receive an impact certificate detailing the CO2 emissions averted and water saved."
                 icon={<BarChart2 className="w-8 h-8 text-white" />}
                 side="left"
              />
           </div>
        </div>

      </div>
      <Footer />
    </>
  );
}

function Step({ number, title, desc, icon, side }) {
   const isLeft = side === 'left';
   return (
      <div className={`flex items-center gap-8 mb-16 lg:mb-0 lg:h-64 ${isLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
         
         {/* Content Side */}
         <div className={`flex-1 ${isLeft ? 'lg:text-right' : 'lg:text-left'}`}>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 transition-colors">{title}</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg max-w-md ml-auto mr-auto lg:ml-0 lg:mr-0 inline-block transition-colors">
               {desc}
            </p>
         </div>

         {/* Center Icon */}
         <div className="relative shrink-0 z-10">
            <div className="w-16 h-16 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.3)] flex items-center justify-center">
               {icon}
            </div>
            <div className={`absolute top-0 -mt-10 lg:mt-0 font-black text-6xl text-slate-200 dark:text-slate-800/50 -z-10 select-none transition-colors ${isLeft ? 'right-full mr-4' : 'left-full ml-4'}`}>
               {number}
            </div>
         </div>

         {/* Spacer Side */}
         <div className="flex-1 hidden lg:block" />
      </div>
   );
}
