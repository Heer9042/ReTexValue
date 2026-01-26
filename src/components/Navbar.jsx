import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Globe, User, LogOut, ChevronDown, Sun, Moon } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Navbar({ hideNavigation = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, theme, toggleTheme } = useApp();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const navConfig = {
  admin: [
    { name: 'Dashboard', path: '/admin' },
    { name: 'Pending Approvals', path: '/admin/pending-approvals' },
    { name: 'Bulk Requests', path: '/admin/bulk-requests' },
    { name: 'Manage Users', path: '/admin/users' },
    { name: 'Analytics', path: '/admin/analytics' },
    { name: 'Transactions', path: '/admin/transactions' },
    { name: 'Reports & Logs', path: '/admin/reports' },
    { name: 'Settings', path: '/admin/settings' },
  ],
  factory: [
    { name: 'Dashboard', path: '/factory' },
    { name: 'Inventory', path: '/factory/inventory' },
    { name: 'Upload', path: '/factory/upload' },
    { name: 'Analytics', path: '/factory/analytics' },
    { name: 'My Proposals', path: '/factory/proposals' },
    { name: 'Profile', path: '/factory/profile' },
    { name: 'Settings', path: '/factory/settings' },
  ],
  buyer: [
    { name: 'Dashboard', path: '/buyer' },
    { name: 'Marketplace', path: '/buyer/marketplace' },
    { name: 'Orders', path: '/buyer/orders' },
    { name: 'Proposals', path: '/buyer/proposals' },
    { name: 'Analytics', path: '/buyer/analytics' },
    { name: 'Profile', path: '/buyer/profile' },
  ],
};


  return (
    <nav className="fixed w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/logo.png" alt="Logo" className="h-8 w-8" />
            <span className="text-2xl font-bold bg-linear-to-r from-emerald-600 to-teal-400 dark:from-emerald-400 dark:to-teal-200 bg-clip-text text-transparent ">
              ReTexValue
            </span>
          </Link>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-6">
              {!user ? (
                 <>
                  <NavLink to="/" active={isActive('/')}>Home</NavLink>
                  <NavLink to="/how-it-works" active={isActive('/how-it-works')}>How It Works</NavLink>
                  <NavLink to="/community" active={isActive('/community')}>Community</NavLink>
                  <NavLink to="/about" active={isActive('/about')}>About</NavLink>
                  <NavLink to="/contact" active={isActive('/contact')}>Contact</NavLink>
                  
                  <ThemeToggle theme={theme} toggle={toggleTheme} />
                  
                  <Link to="/login" className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-full font-medium transition-all transform hover:scale-105 shadow-lg shadow-emerald-500/20">
                    Get Started
                  </Link>
                 </>
              ) : (
                <>
                  {!hideNavigation && (
                    <>
                      {user.role === 'factory' && (
                         <>
                            <NavLink to="/factory" active={isActive('/factory')}>Dashboard</NavLink>
                            <NavLink to="/factory/inventory" active={isActive('/factory/inventory')}>Inventory</NavLink>
                            <NavLink to="/factory/upload" active={isActive('/factory/upload')}>Upload</NavLink>
                            <NavLink to="/factory/analytics" active={isActive('/factory/analytics')}>Analytics</NavLink>
                         </>
                      )}
                      {user.role === 'buyer' && (
                         <>
                            <NavLink to="/buyer" active={isActive('/buyer')}>Dashboard</NavLink>
                            <NavLink to="/buyer/marketplace" active={isActive('/buyer/marketplace')}>Marketplace</NavLink>
                            <NavLink to="/buyer/orders" active={isActive('/buyer/orders')}>Orders</NavLink>
                            <NavLink to="/buyer/proposals" active={isActive('/buyer/proposals')}>Proposals</NavLink>
                            <NavLink to="/buyer/analytics" active={isActive('/buyer/analytics')}>Analytics</NavLink>
                            <NavLink to="/buyer/profile" active={isActive('/buyer/profile')}>Profile</NavLink>
                         </>
                      )}
                      
                      <NavLink to="/community" active={isActive('/community')}>Community</NavLink>

                      <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
                    </>
                  )}
                  
                  <ThemeToggle theme={theme} toggle={toggleTheme} />

                  <div className="flex items-center gap-4 ml-4 pl-4 border-l border-slate-200 dark:border-slate-700">
                     <span className="text-slate-700 dark:text-slate-300 text-sm font-medium flex items-center gap-2">
                        <User size={16} /> {user.name}
                     </span>
                     <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition-colors" title="Logout">
                        <LogOut size={18} />
                     </button>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="md:hidden flex items-center gap-4">
            <ThemeToggle theme={theme} toggle={toggleTheme} />
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-700 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-white p-2">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
  <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">

      {!user ? (
        <>
          <MobileNavLink to="/" onClick={() => setIsOpen(false)}>Home</MobileNavLink>
          <MobileNavLink to="/how-it-works" onClick={() => setIsOpen(false)}>How It Works</MobileNavLink>
          <MobileNavLink to="/community" onClick={() => setIsOpen(false)}>Community</MobileNavLink>
          <MobileNavLink to="/about" onClick={() => setIsOpen(false)}>About</MobileNavLink>
          <MobileNavLink to="/contact" onClick={() => setIsOpen(false)}>Contact</MobileNavLink>
          <MobileNavLink to="/login" onClick={() => setIsOpen(false)}>Get Started</MobileNavLink>
        </>
      ) : (
        <>
          <div className="px-3 py-2 text-emerald-600 dark:text-emerald-400 font-bold border-b border-slate-200 dark:border-slate-800 mb-2">
            {user.name} ({user.role})
          </div>

          {navConfig[user.role]?.map(item => (
            <MobileNavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
            >
              {item.name}
            </MobileNavLink>
          ))}

          <MobileNavLink to="/community" onClick={() => setIsOpen(false)}>
            Community
          </MobileNavLink>

          <button
            onClick={handleLogout}
            className="w-full text-left block px-3 py-2 text-base font-medium text-red-500 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
          >
            Logout
          </button>
        </>
      )}

    </div>
  </div>
)}

    </nav>
  );
}

function NavLink({ to, children, active }) {
  return (
    <Link
      to={to}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        active 
          ? 'text-green-600 dark:text-green-400' 
          : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
      }`}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ to, children, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="block px-3 py-4 rounded-md text-base font-medium text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
    >
      {children}
    </Link>
  );
}

function ThemeToggle({ theme, toggle }) {
   return (
      <button 
         onClick={toggle}
         className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-500 dark:hover:text-emerald-400 transition-all"
         title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
         {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </button>
   );
}
