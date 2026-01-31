import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';

// Public Pages
import Landing from './pages/Landing';
import About from './pages/About';
import Contact from './pages/Contact';
import HowItWorks from './pages/HowItWorks';
import Login from './pages/Login';
import Register from './pages/Register';
import Packages from './pages/Packages';
import ResetPassword from './pages/ResetPassword';

// App Pages
import FactoryDashboard from './pages/factory/Dashboard';
import FactoryUpload from './pages/factory/Upload';
import FactoryInventory from './pages/factory/Inventory';
import FactoryAnalytics from './pages/factory/Analytics';
import Marketplace from './pages/buyer/Marketplace';
import BuyerDashboard from './pages/buyer/Dashboard';
import BuyerOrders from './pages/buyer/Orders';
import BuyerProfile from './pages/buyer/Profile';
import BulkRequest from './pages/buyer/BulkRequest';
import BuyerProposals from './pages/buyer/Proposals';
import BuyerAnalytics from './pages/buyer/Analytics';
import AdminDashboard from './pages/admin/Dashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageListings from './pages/admin/ManageListings';
import AdminAnalytics from './pages/admin/Analytics';
import PendingApprovals from './pages/admin/PendingApprovals';
import BulkRequests from './pages/admin/BulkRequests';
import AdminBulkRequestDetails from './pages/admin/BulkRequestDetails';
import AdminMatchFactory from './pages/admin/MatchFactory';
import AdminSettings from './pages/admin/Settings';
import AdminReports from './pages/admin/Reports';
import AdminTransactions from './pages/admin/Transactions';
import ManagePackages from './pages/admin/ManagePackages';
import SubmitProposal from './pages/factory/SubmitProposal';
import FactoryProposals from './pages/factory/Proposals';
import FactorySettings from './pages/factory/Settings';
import FactoryProfile from './pages/factory/Profile';
import BuyerSettings from './pages/buyer/Settings';
import Community from './pages/Community';
import DashboardLayout from './components/DashboardLayout';
import AdminLayout from './components/AdminLayout';
import FactoryLayout from './components/FactoryLayout';
import BuyerLayout from './components/BuyerLayout';

// Protected Route Logic
const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useApp();
  const storedRole = localStorage.getItem('userRole');

  // If App is still verifying auth, but we have a persisted role, keep loading
  if (loading || (storedRole && !user)) {
     return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Restoring Session...</p>
          </div>
      </div>
     );
  }

  if (!user) return <Navigate to="/login" replace />;
  
  if (role && user.role !== role) {
      // Redirect to their dashboard instead of home if they have a role but wrong one
      if(user.role === 'admin') return <Navigate to="/admin" replace />;
      if(user.role === 'factory') return <Navigate to="/factory" replace />;
      if(user.role === 'buyer') return <Navigate to="/buyer" replace />;
      return <Navigate to="/" replace />;
  }
  return children;
};

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppContent() {
  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-200 outfit selection:bg-emerald-500/30 transition-colors duration-300">
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/packages" element={<Packages />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Public Community Page - Accessible to all */}
        <Route path="/community" element={
          <DashboardLayout>
            <Community />
          </DashboardLayout>
        } />
        
        {/* Protected Routes */}
        <Route path="/factory" element={
          <ProtectedRoute role="factory">
            <FactoryLayout>
               <FactoryDashboard />
            </FactoryLayout>
          </ProtectedRoute>
        } />
        <Route path="/factory/upload" element={
          <ProtectedRoute role="factory">
            <FactoryLayout>
               <FactoryUpload />
            </FactoryLayout>
          </ProtectedRoute>
        } />

        <Route path="/factory/inventory" element={
          <ProtectedRoute role="factory">
            <FactoryLayout>
               <FactoryInventory />
            </FactoryLayout>
          </ProtectedRoute>
        } />
        <Route path="/factory/proposal/:requestId" element={
          <ProtectedRoute role="factory">
            <FactoryLayout>
               <SubmitProposal />
            </FactoryLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/factory/analytics" element={
          <ProtectedRoute role="factory">
            <FactoryLayout>
               <FactoryAnalytics />
            </FactoryLayout>
          </ProtectedRoute>
        } />
        <Route path="/factory/proposals" element={
          <ProtectedRoute role="factory">
            <FactoryLayout>
               <FactoryProposals />
            </FactoryLayout>
          </ProtectedRoute>
        } />
        <Route path="/factory/settings" element={
          <ProtectedRoute role="factory">
            <FactoryLayout>
               <FactorySettings />
            </FactoryLayout>
          </ProtectedRoute>
        } />
        <Route path="/factory/profile" element={
          <ProtectedRoute role="factory">
            <FactoryLayout>
               <FactoryProfile />
            </FactoryLayout>
          </ProtectedRoute>
        } />

        <Route path="/buyer" element={
          <ProtectedRoute role="buyer">
            <BuyerLayout>
               <BuyerDashboard />
            </BuyerLayout>
          </ProtectedRoute>
        } />
        <Route path="/buyer/marketplace" element={
          <ProtectedRoute role="buyer">
            <BuyerLayout>
               <Marketplace />
            </BuyerLayout>
          </ProtectedRoute>
        } />
         <Route path="/buyer/orders" element={
          <ProtectedRoute role="buyer">
            <BuyerLayout>
               <BuyerOrders />
            </BuyerLayout>
          </ProtectedRoute>
        } />
         <Route path="/buyer/profile" element={
          <ProtectedRoute role="buyer">
            <BuyerLayout>
               <BuyerProfile />
            </BuyerLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/buyer/bulk-request" element={
          <ProtectedRoute role="buyer">
            <BuyerLayout>
               <BulkRequest />
            </BuyerLayout>
          </ProtectedRoute>
        } />

        <Route path="/buyer/proposals" element={
          <ProtectedRoute role="buyer">
             <BuyerLayout>
                 <BuyerProposals />
             </BuyerLayout>
          </ProtectedRoute>
        } />
        <Route path="/buyer/analytics" element={
          <ProtectedRoute role="buyer">
             <BuyerLayout>
                 <BuyerAnalytics />
             </BuyerLayout>
          </ProtectedRoute>
        } />
        <Route path="/buyer/settings" element={
          <ProtectedRoute role="buyer">
             <BuyerLayout>
                 <BuyerSettings />
             </BuyerLayout>
          </ProtectedRoute>
        } />

        <Route path="/admin" element={
          <ProtectedRoute role="admin">
            <AdminLayout>
               <AdminDashboard />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute role="admin">
            <AdminLayout>
               <ManageUsers />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/listings" element={
          <ProtectedRoute role="admin">
            <AdminLayout>
               <ManageListings />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/analytics" element={
          <ProtectedRoute role="admin">
            <AdminLayout>
               <AdminAnalytics />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/pending-approvals" element={
          <ProtectedRoute role="admin">
            <AdminLayout>
               <PendingApprovals />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/bulk-requests" element={
          <ProtectedRoute role="admin">
            <AdminLayout>
               <BulkRequests />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/bulk-requests/:id" element={
          <ProtectedRoute role="admin">
            <AdminLayout>
               <AdminBulkRequestDetails />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/bulk-requests/:id/match" element={
          <ProtectedRoute role="admin">
            <AdminLayout>
               <AdminMatchFactory />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/settings" element={
          <ProtectedRoute role="admin">
            <AdminLayout>
               <AdminSettings />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/reports" element={
          <ProtectedRoute role="admin">
            <AdminLayout>
               <AdminReports />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/transactions" element={
          <ProtectedRoute role="admin">
            <AdminLayout>
               <AdminTransactions />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/packages" element={
          <ProtectedRoute role="admin">
            <AdminLayout>
               <ManagePackages />
            </AdminLayout>
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
function App() {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
}

export default App;
