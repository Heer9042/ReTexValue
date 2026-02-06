import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import AdminSidebar from './AdminSidebar';
import { Menu } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { fetchUsers, fetchListings, fetchTransactions, user } = useApp();

  // Auto-fetch all admin data on mount to cache it
  useEffect(() => {
    if (user?.role?.toLowerCase() !== 'admin') return;
    
    const fetchAdminData = async () => {
      try {
        console.log('📊 [AdminLayout] Auto-fetching admin data to cache...');
        await Promise.all([
          fetchUsers(),
          fetchListings(),
          fetchTransactions()
        ]);
        console.log('✅ [AdminLayout] Admin data cached successfully');
      } catch (error) {
        console.error('Failed to cache admin data:', error);
      }
    };

    fetchAdminData();
  }, [user, fetchUsers, fetchListings, fetchTransactions]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Navbar with handler to ensure it doesn't conflict, although Sidebar is separate */}
      <Navbar hideNavigation={true} />
      
      <div className="pt-20 flex relative">
         {/* Sidebar with mobile state */}
         <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
         
         {/* Main content area */}
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
