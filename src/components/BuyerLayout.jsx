import React from 'react';
import Navbar from './Navbar';
import BuyerSidebar from './BuyerSidebar';

export default function BuyerLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* We use the Navbar but hide the top navigation links since we have a sidebar */}
      <Navbar hideNavigation={true} />
      
      <div className="pt-20 flex">
         {/* Sidebar fixed on the left */}
         <BuyerSidebar />
         
         {/* Main content area with left margin to accommodate sidebar */}
         <main className="flex-1 lg:ml-64 p-6 min-h-[calc(100vh-80px)] overflow-x-hidden">
            {children}
         </main>
      </div>
    </div>
  );
}
