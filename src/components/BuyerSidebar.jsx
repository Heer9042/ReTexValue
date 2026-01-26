import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, FileText, BarChart2, Package, User, Settings } from 'lucide-react';

export default function BuyerSidebar() {
  const links = [
    { name: 'Dashboard', path: '/buyer', icon: <LayoutDashboard size={20} /> },
    { name: 'Marketplace', path: '/buyer/marketplace', icon: <ShoppingCart size={20} /> },
    { name: 'My Orders', path: '/buyer/orders', icon: <Package size={20} /> },
    { name: 'Bulk Request', path: '/buyer/bulk-request', icon: <FileText size={20} /> },
    { name: 'My Proposals', path: '/buyer/proposals', icon: <FileText size={20} /> },
    { name: 'Analytics', path: '/buyer/analytics', icon: <BarChart2 size={20} /> },
    { name: 'Profile', path: '/buyer/profile', icon: <User size={20} /> },
    { name: 'Settings', path: '/buyer/settings', icon: <Settings size={20} /> },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 hidden lg:block fixed left-0 top-20 bottom-0 overflow-y-auto transition-colors duration-300">
      <div className="p-4 space-y-2">
        {links.map((link) => (
          <SidebarLink key={link.path} to={link.path} icon={link.icon}>
            {link.name}
          </SidebarLink>
        ))}
      </div>
      
      <div className="absolute bottom-0 w-full p-4 border-t border-slate-200 dark:border-slate-700">
         <div className="text-xs text-slate-500 text-center">
            Buyer Portal
         </div>
      </div>
    </aside>
  );
}

function SidebarLink({ to, children, icon }) {
  return (
    <NavLink 
      to={to} 
      end={to === '/buyer'} 
      className={({ isActive }) => `
        flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium
        ${isActive 
          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'}
      `}
    >
      {icon}
      {children}
    </NavLink>
  );
}
