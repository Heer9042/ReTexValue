import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import { Lock, Loader2, Check, ArrowRight } from 'lucide-react';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Check if we are actually in a recovery session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
         // If no session, they might have clicked a link but something went wrong, or manually typed URL
         // But for updatePassword to work, they MUST be authenticated. 
         // Supabase magic link for password reset essentially logs the user in.
         // So if we are not logged in, we can't reset.
         setError('Invalid or expired reset link. Please try "Forgot Password" again.');
      }
    });
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    const newFieldErrors = {};

    // Password validation
    if (!password) {
      newFieldErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newFieldErrors.password = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])/.test(password)) {
      newFieldErrors.password = 'Password must contain at least one lowercase letter';
    } else if (!/(?=.*[A-Z])/.test(password)) {
      newFieldErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/(?=.*\d)/.test(password)) {
      newFieldErrors.password = 'Password must contain at least one number';
    }

    // Confirm password validation
    if (!confirmPassword) {
      newFieldErrors.confirmPassword = 'Please confirm your password';
    } else if (password && password !== confirmPassword) {
      newFieldErrors.confirmPassword = 'Passwords do not match';
    }

    setFieldErrors(newFieldErrors);

    if (Object.keys(newFieldErrors).length > 0) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password: password });

      if (error) throw error;

      setSuccess(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
          navigate('/login');
      }, 3000);

    } catch (err) {
      console.error('Error resetting password:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 pt-24">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 animate-in fade-in slide-in-from-bottom-8">
          
          <div className="text-center mb-8">
             <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600 dark:text-emerald-400">
                <Lock size={32} />
             </div>
             <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Set New Password</h2>
             <p className="text-slate-500 dark:text-slate-400 mt-2">Create a strong password for your account.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-200 dark:border-red-800">
                {error}
            </div>
          )}

          {success ? (
             <div className="text-center p-8">
                 <div className="w-16 h-16 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 dark:text-green-400">
                    <Check size={32} />
                 </div>
                 <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Password Updated!</h3>
                 <p className="text-slate-500 dark:text-slate-400">Redirecting to login...</p>
             </div>
          ) : (
             <form onSubmit={handleReset} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">New Password</label>
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (fieldErrors.password) setFieldErrors({...fieldErrors, password: ''});
                        }}
                        className={`w-full px-4 py-3 rounded-xl border ${fieldErrors.password ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-slate-50 dark:bg-slate-900/50 outline-none focus:ring-2 focus:ring-emerald-500 transition-all`}
                        placeholder="••••••••"
                        required
                    />
                    {fieldErrors.password && <p className="text-xs text-red-500 ml-1 mt-1">{fieldErrors.password}</p>}
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Confirm Password</label>
                    <input 
                        type="password" 
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (fieldErrors.confirmPassword) setFieldErrors({...fieldErrors, confirmPassword: ''});
                        }}
                        className={`w-full px-4 py-3 rounded-xl border ${fieldErrors.confirmPassword ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-slate-50 dark:bg-slate-900/50 outline-none focus:ring-2 focus:ring-emerald-500 transition-all`}
                        placeholder="••••••••"
                        required
                    />
                    {fieldErrors.confirmPassword && <p className="text-xs text-red-500 ml-1 mt-1">{fieldErrors.confirmPassword}</p>}
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" /> Updating...
                        </>
                    ) : (
                        <>
                            Reset Password <ArrowRight className="w-5 h-5" />
                        </>
                    )}
                </button>
             </form>
          )}
        </div>
      </div>
    </>
  );
}
