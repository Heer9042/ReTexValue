import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Factory, ShoppingBag, ShieldCheck, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';

export default function Login() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
      email: '',
      password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [error, setError] = useState('');

  // Check Supabase Connection on Mount
  useEffect(() => {
    const checkConnection = async () => {
        try {
            console.log("Checking Supabase connection...");
            const { error } = await supabase.auth.getSession();
            if (error) {
                console.error("Supabase session check error:", error);
                // If session check fails deeply, maybe clear stale data
                localStorage.clear();
            } else {
                console.log("Supabase connection: OK");
            }
        } catch (err) {
            console.error("Supabase unreachable:", err);
        }
    };
    checkConnection();
  }, []);
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    const email = formData.email.trim();
    const password = formData.password;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError("Please enter a valid email address");
        setLoading(false);
        return;
    }
    if (!password) {
        setError("Password is required");
        setLoading(false);
        return;
    }

    try {
        // Timeout wrapper for Supabase Auth
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Connection timed out. Check your internet.")), 15000)
        );

        const { data, error: authError } = await Promise.race([
            supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password
            }),
            timeoutPromise
        ]);

        if (authError) {
             throw authError;
        }

        const { user } = data;
        
        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        // Priority: Profile (DB) > User Metadata (Auth) > Default
        const userRole = profile?.role || user.user_metadata?.role || 'buyer';
        
        // ✨ Enhanced user object with ALL profile fields including avatar
        let avatarUrl = profile?.avatar_url || '';
        if (avatarUrl && avatarUrl.startsWith('http') && avatarUrl.includes('supabase') && !avatarUrl.includes('?t=')) {
            avatarUrl = `${avatarUrl}?t=${Date.now()}`;
            console.log('🖼️ [Login] Cache-busted avatar URL:', avatarUrl);
        }
        
        const appUser = {
            id: user.id,
            email: user.email,
            role: userRole,
            // Full profile data
            full_name: profile?.full_name || user.user_metadata?.full_name || 'User',
            name: profile?.full_name || user.user_metadata?.full_name || 'User',
            username: profile?.username || user.user_metadata?.username || '',
            phone: profile?.phone || '',
            address: profile?.address || '',
            location: profile?.location || '',
            company_name: profile?.company_name || '',
            gst_number: profile?.gst_number || '',
            avatar_url: avatarUrl, // ✅ Include avatar URL
            notifications_email: profile?.notifications_email ?? true,
            notifications_push: profile?.notifications_push ?? true,
            notifications_listings: profile?.notifications_listings ?? false,
            ...profile // Include any additional profile fields
        };

        console.log("✅ Login successful:", {
            email: appUser.email,
            role: appUser.role,
            avatar: appUser.avatar_url ? '✅ Has Avatar' : '❌ No Avatar'
        });
        
        login(appUser);
        navigate(userRole === 'admin' ? '/admin' : `/${userRole}`);

    } catch (err) {
        console.error("Login error:", err);
        let msg = err.message;
        if (msg.includes('rate limit')) {
             msg = "Too many attempts. Please try again later.";
        } else if (msg.includes('Invalid login credentials')) {
             msg = "Invalid email or password.";
        }
        setError(msg);
    } finally {
        setLoading(false);
    }
  };

  const handleDemoLogin = (role) => {
    setLoading(true);
    setTimeout(() => {
      login(role);
      setLoading(false);
      navigate(role === 'admin' ? '/admin' : `/${role}`);
    }, 800);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white flex items-center justify-center p-4 relative overflow-hidden pt-24 transition-colors duration-300">
        
        {/* Background Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-300/20 dark:bg-emerald-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-300/20 dark:bg-indigo-500/10 rounded-full blur-[100px]" />

        <div className="max-w-md w-full bg-white dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-700 p-8 shadow-2xl relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
          <h2 className="text-3xl font-bold text-center mb-2 text-slate-900 dark:text-white">Welcome Back</h2>
          <p className="text-center text-slate-500 dark:text-slate-400 mb-8">Sign in to your account</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-200 dark:border-red-800">
                {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
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
                        autoComplete="email"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                    <a href="#" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline">Forgot password?</a>
                </div>
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
                        autoComplete="current-password"
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
                        Signing In...
                    </>
                ) : (
                    <>
                        Sign In <ArrowRight className="w-5 h-5" />
                    </>
                )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

