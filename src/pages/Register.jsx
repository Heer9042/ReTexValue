import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { User, Mail, Lock, AtSign, Loader2, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false); // New state for OTP/Link sent
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    phone: '',
    location: '',
    password: '',
    role: 'buyer'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Trim inputs
    const fullName = formData.fullName.trim();
    const email = formData.email.trim();
    const username = formData.username.trim();
    const phone = formData.phone.trim();
    const location = formData.location.trim();
    const password = formData.password;

    // Validation
    if (!fullName) { setError("Full Name is required"); setLoading(false); return; }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Invalid email address"); setLoading(false); return; }
    if (!username || username.length < 3) { setError("Username must be at least 3 characters"); setLoading(false); return; }
    if (!password || password.length < 6) { setError("Password must be at least 6 characters"); setLoading(false); return; }
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) { setError("Please enter a valid phone number (at least 10 digits)"); setLoading(false); return; }
    if (!location) { setError("Location is required"); setLoading(false); return; }

    try {
        console.log("Starting registration for:", email);
        const { data, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    username: username,
                    role: formData.role, 
                    phone: phone,
                    location: location,
                    status: 'Pending'
                },
                emailRedirectTo: window.location.origin + '/login'
            }
        });

        if (authError) throw authError;

        console.log("Supabase Auth success:", data);

        if (data?.user) {
            // Manual Fallback: Try to update profile immediately if session is auto-created
            if (data.session) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .upsert({
                        id: data.user.id,
                        email: email,
                        full_name: fullName,
                        username: username,
                        role: formData.role,
                        phone: phone,
                        location: location,
                        status: 'Pending'
                    });
                
                if (profileError) console.warn("Background profile sync warning:", profileError.message);
            }

            if (data.user.identities?.length === 0 || !data.user.email_confirmed_at) {
                setVerificationSent(true);
            } else {
                navigate('/login');
            }
        }

    } catch (err) {
        console.error("Registration error:", err);
        let msg = err.message;
        if (msg.includes('rate limit')) {
             msg = "Supabase 3 signups/hr limit reached. Please wait or use a different email/IP.";
        }
        setError(msg);
    } finally {
        setLoading(false);
    }
  };

  if (verificationSent) {
      return (
        <>
            <Navbar />
            <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 shadow-xl text-center animate-in fade-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Mail className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Check Your Email</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                        We've sent a verification link to <span className="font-semibold text-slate-900 dark:text-white">{formData.email}</span>. 
                        Please click the link to verify your account and log in.
                    </p>
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-sm text-slate-500 dark:text-slate-400 mb-6">
                        <p>Didn't receive it? Check your spam folder.</p>
                    </div>
                    <Link to="/login" className="block w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-colors">
                        Proceed to Login
                    </Link>
                </div>
            </div>
        </>
      );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white flex items-center justify-center p-4 relative overflow-hidden pt-24 transition-colors duration-300">
        
        {/* Background Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-300/20 dark:bg-emerald-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-300/20 dark:bg-indigo-500/10 rounded-full blur-[100px]" />

        <div className="max-w-md w-full bg-white dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-700 p-8 shadow-2xl relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
          <h2 className="text-3xl font-bold text-center mb-2 text-slate-900 dark:text-white">Create Account</h2>
          <p className="text-center text-slate-500 dark:text-slate-400 mb-8">Join the circular economy revolution</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-200 dark:border-red-800">
                {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Full Name</label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                        type="text" 
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-400"
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Email Address</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email address"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-400"
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Username</label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                        type="text" 
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Enter your username"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-400"
                        required
                        autoComplete="username"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Password</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                        type="password" 
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-400"
                        required
                        autoComplete="new-password"
                    />
                </div>
            </div>

            <div className="space-y-4 pt-2">
                {/* Common Fields */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Phone Number</label>
                    <input 
                        type="text" 
                        name="phone"
                        value={formData.phone || ''}
                        onChange={handleChange}
                        placeholder="9876543210"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-400"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Location (City)</label>
                    <input 
                        type="text" 
                        name="location"
                        value={formData.location || ''}
                        onChange={handleChange}
                        placeholder="Enter your location"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-400"
                        required
                    />
                </div>
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating Account...
                    </>
                ) : (
                    <>
                        Sign Up <ArrowRight className="w-5 h-5" />
                    </>
                )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
              Log in
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}
