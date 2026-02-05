import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, BarChart2, Settings, FileText, ShieldAlert, DollarSign, X, LogOut, Package, ShoppingBag, Building2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AdminSidebar({ isOpen, onClose }) {
  const { logout } = useApp();
  const navigate = useNavigate();
  
  const handleLogout = () => {
      logout();
      onClose && onClose();
      navigate('/');
  };

  const links = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Pending Approvals', path: '/admin/pending-approvals', icon: <ShieldAlert size={20} /> },
    { name: 'Factory Registrations', path: '/admin/factory-registrations', icon: <Building2 size={20} /> },
    { name: 'Bulk Requests', path: '/admin/bulk-requests', icon: <FileText size={20} /> },
    { name: 'Manage Users', path: '/admin/users', icon: <Users size={20} /> },
    { name: 'Manage Listings', path: '/admin/listings', icon: <ShoppingBag size={20} /> },
    { name: 'Manage Packages', path: '/admin/packages', icon: <Package size={20} /> },
    { name: 'Analytics', path: '/admin/analytics', icon: <BarChart2 size={20} /> },
    { name: 'Transactions', path: '/admin/transactions', icon: <DollarSign size={20} /> },
    { name: 'Reports & Logs', path: '/admin/reports', icon: <FileText size={20} /> },
    { name: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:block pt-20 lg:pt-0
      `}>
        
        {/* Mobile Header (Close Button) */}
        <div className="flex justify-between items-center p-4 lg:hidden border-b border-slate-200 dark:border-slate-700 mb-2">
            <span className="font-bold text-slate-900 dark:text-white">Menu</span>
            <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white">
                <X size={24} />
            </button>
        </div>

        <div className="p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-80px)]">
          {links.map((link) => (
            <SidebarLink key={link.path} to={link.path} icon={link.icon} onClick={onClose}>
              {link.name}
            </SidebarLink>
          ))}
          <button 
             onClick={handleLogout}
             className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
             <LogOut size={20} />
             Logout
          </button>
        </div>
        
        {/* Bottom section */}
        <div className="absolute bottom-0 w-full p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
           <div className="text-xs text-slate-500 text-center">
              ReTex Admin v1.0
           </div>
        </div>
      </aside>
    </>
  );
}

function SidebarLink({ to, children, icon, onClick }) {
  return (
    <NavLink 
      to={to} 
      end={to === '/admin'} // Only exact match for root dashboard
      onClick={onClick}
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
