import React from 'react';
import Navbar from './Navbar';

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen"> 
      <Navbar />
      <div className="pt-20">
        {children}
      </div>
    </div>
  );
}
