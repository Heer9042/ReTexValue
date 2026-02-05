import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, CheckCircle, Mail, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function FactoryPending() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center p-4 pt-24">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 shadow-xl text-center animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Registration Submitted</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Your factory registration has been submitted for review. Our admin team will review your application within 2-3 business days.
          </p>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 mb-2">
              <Mail className="w-4 h-4" />
              <span className="text-sm font-medium">What happens next?</span>
            </div>
            <ul className="text-sm text-amber-700 dark:text-amber-300 text-left space-y-1">
              <li>• Admin reviews your company details</li>
              <li>• Verification of GST and business documents</li>
              <li>• Approval notification via email</li>
              <li>• Account activation for selling</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Link
              to="/login"
              className="block w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              Proceed to Login <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/"
              className="block w-full text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium py-2 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}