import React, { useState } from 'react';
import Navbar from './Navbar';
import FactorySidebar from './FactorySidebar';
import { Menu } from 'lucide-react';

export default function FactoryLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <Navbar hideNavigation={true} />
      
      <div className="pt-20 flex relative">
         <FactorySidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
         
         <main className="flex-1 w-full lg:ml-0 p-4 md:p-6 min-h-[calc(100vh-80px)] overflow-x-hidden transition-all duration-300">
            {/* Mobile Sidebar Toggle */}
            <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden mb-4 p-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-2"
            >
                <Menu size={20} />
                <span className="text-sm font-medium">Menu</span>
            </button>

            {children}
         </main>
      </div>
    </div>
  );
}
