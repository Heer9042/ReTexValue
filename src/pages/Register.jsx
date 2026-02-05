import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Loader2, ArrowRight, Factory } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    email: '',
    username: '',
    phone: '',
    location: '',
    password: '',
    confirmPassword: '',
    role: 'buyer',
    wantsToBeFactory: false
  });

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/(?=.*[a-z])/.test(password)) strength++;
    if (/(?=.*[A-Z])/.test(password)) strength++;
    if (/(?=.*\d)/.test(password)) strength++;
    if (/(?=.*[@$!%*?&#])/.test(password)) strength++;
    
    if (strength <= 2) return { strength, label: 'Weak', color: 'bg-red-500' };
    if (strength === 3) return { strength, label: 'Fair', color: 'bg-yellow-500' };
    if (strength === 4) return { strength, label: 'Good', color: 'bg-blue-500' };
    return { strength, label: 'Strong', color: 'bg-green-500' };
  };

  const validateField = (name, value) => {
    let error = '';
    
    switch(name) {
      case 'fullName':
        if (!value.trim()) {
          error = 'Full name is required';
        } else if (value.trim().length < 2) {
          error = 'Full name must be at least 2 characters';
        } else if (!/^[a-zA-Z\s]+$/.test(value)) {
          error = 'Full name should only contain letters and spaces';
        }
        break;
      
      case 'email':
        if (!value) {
          error = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Invalid email format';
        }
        break;
      
      case 'username':
        if (!value) {
          error = 'Username is required';
        } else if (value.length < 3) {
          error = 'Username must be at least 3 characters';
        } else if (value.length > 20) {
          error = 'Username must be less than 20 characters';
        } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          error = 'Username can only contain letters, numbers, and underscores';
        }
        break;

      case 'companyName':
        if (!value.trim()) {
          error = 'Company name is required';
        } else if (value.trim().length < 2) {
          error = 'Company name must be at least 2 characters';
        }
        break;
      
      case 'password':
        if (!value) {
          error = 'Password is required';
        } else if (value.length < 8) {
          error = 'Password must be at least 8 characters';
        } else if (!/(?=.*[a-z])/.test(value)) {
          error = 'Password must contain at least one lowercase letter';
        } else if (!/(?=.*[A-Z])/.test(value)) {
          error = 'Password must contain at least one uppercase letter';
        } else if (!/(?=.*\d)/.test(value)) {
          error = 'Password must contain at least one number';
        }
        break;
      
      case 'confirmPassword':
        if (!value) {
          error = 'Please confirm your password';
        } else if (value !== formData.password) {
          error = 'Passwords do not match';
        }
        break;
      
      case 'phone': {
        const phoneDigits = value.replace(/\D/g, '');
        if (!value) {
          error = 'Phone number is required';
        } else if (phoneDigits.length !== 10) {
          error = 'Phone number must be exactly 10 digits';
        }
        break;
      }
      
      case 'location':
        if (!value.trim()) {
          error = 'Location is required';
        } else if (value.trim().length < 2) {
          error = 'Location must be at least 2 characters';
        }
        break;
    }
    
    return error;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === 'checkbox' ? checked : value;
    
    // For phone field, only allow digits and limit to 10 digits
    if (name === 'phone') {
      newValue = value.replace(/\D/g, '').slice(0, 10);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Clear field error on change
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear general error
    if (error) setError('');
  };
  
  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    
    if (error) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Trim inputs
    const fullName = formData.fullName.trim();
    const companyName = formData.companyName.trim();
    const email = formData.email.trim();
    const username = formData.username.trim();
    const phone = formData.phone.trim();
    const location = formData.location.trim();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    // Comprehensive Validation
    const errors = {};
    
    // Full Name validation
    if (!fullName.trim()) {
      errors.fullName = 'Full name is required';
    } else if (fullName.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(fullName)) {
      errors.fullName = 'Full name should only contain letters and spaces';
    }
    
    // Email validation
    if (!email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Invalid email format';
    }
    
    // Username validation
    if (!username) {
      errors.username = 'Username is required';
    } else if (username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    } else if (username.length > 20) {
      errors.username = 'Username must be less than 20 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      errors.username = 'Username can only contain letters, numbers, and underscores';
    }

    // Company Name validation
    if (!companyName) {
      errors.companyName = 'Company name is required';
    } else if (companyName.length < 2) {
      errors.companyName = 'Company name must be at least 2 characters';
    }
    
    // Password validation
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])/.test(password)) {
      errors.password = 'Password must contain at least one lowercase letter';
    } else if (!/(?=.*[A-Z])/.test(password)) {
      errors.password = 'Password must contain at least one uppercase letter';
    } else if (!/(?=.*\d)/.test(password)) {
      errors.password = 'Password must contain at least one number';
    }
    
    // Confirm Password validation
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    // Phone validation
    const phoneDigits = phone.replace(/\D/g, '');
    if (!phone) {
      errors.phone = 'Phone number is required';
    } else if (phoneDigits.length !== 10) {
      errors.phone = 'Phone number must be exactly 10 digits';
    }
    
    // Location validation
    if (!location.trim()) {
      errors.location = 'Location is required';
    } else if (location.trim().length < 2) {
      errors.location = 'Location must be at least 2 characters';
    }
    
    // If there are any validation errors, show them and stop
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Please fix all validation errors before submitting');
      setLoading(false);
      return;
    }

    try {
        console.log("Proceeding with registration for:", email);
        
        // Supabase auth will handle duplicate email check automatically
        const { data, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
              company_name: companyName,
                    username: username,
                    role: formData.role, 
                    phone: phone,
                    location: location,
                    status: 'Pending'
                },
                emailRedirectTo: `${window.location.origin}/login`
            }
        });

        if (authError) {
            // Handle specific auth errors
            if (authError.message.includes('User already registered') || 
                authError.message.includes('already registered') ||
                authError.status === 422) {
                setError("This email is already registered. Please log in or use a different email.");
            } else {
                throw authError;
            }
            setLoading(false);
            return;
        }

        console.log("Supabase Auth success:", data);
        console.log("User confirmation required:", !data.session);
        console.log("User identities:", data.user?.identities);

        if (data?.user) {
            // If session exists, email confirmation is disabled in Supabase
            // Create profile immediately
            if (data.session) {
                console.log("Auto-login enabled - creating profile");
                
                // Determine role and verification status based on seller registration
                const userRole = formData.wantsToBeFactory ? 'factory' : formData.role;
                const verificationStatus = formData.wantsToBeFactory ? 'unverified' : 'verified';
                const accountStatus = formData.wantsToBeFactory ? 'Pending' : 'Active';
                
                const { error: profileError } = await supabase
                    .from('profiles')
                    .upsert({
                        id: data.user.id,
                        email: email,
                        full_name: fullName,
                        company_name: companyName,
                        username: username,
                        role: userRole,
                        phone: phone,
                        location: location,
                        status: accountStatus,
                        verification_status: verificationStatus,
                        is_verified: !formData.wantsToBeFactory
                    });
                
                if (profileError) console.warn("Profile creation warning:", profileError.message);
                
                // If user wants to be a factory (seller), show pending approval message
                if (formData.wantsToBeFactory) {
                    setVerificationSent(true);
                    // Store message type for showing correct verification screen
                    sessionStorage.setItem('pendingApprovalType', 'factory');
                } else {
                    // Auto-login successful, redirect to login or dashboard
                    navigate('/login');
                }
            } else {
                // Email confirmation required - show verification message
                console.log("Email confirmation required");
                setVerificationSent(true);
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

  const handleResendEmail = async () => {
    setResendLoading(true);
    setResendSuccess(false);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: formData.email,
        options: {
          emailRedirectTo: `${window.location.origin}/login`
        }
      });
      
      if (error) throw error;
      
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (err) {
      console.error("Resend error:", err);
      setError(err.message);
    } finally {
      setResendLoading(false);
    }
  };

  if (verificationSent) {
      const isFactoryPending = sessionStorage.getItem('pendingApprovalType') === 'factory';
      
      return (
        <>
            <Navbar />
            <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 shadow-xl text-center animate-in fade-in zoom-in duration-300">
                    <div className={`w-16 h-16 ${isFactoryPending ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30'} rounded-full flex items-center justify-center mx-auto mb-6`}>
                        {isFactoryPending ? (
                            <Factory className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                        ) : (
                            <Mail className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                        )}
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        {isFactoryPending ? 'Pending Admin Approval' : 'Check Your Email'}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                        {isFactoryPending ? (
                            <>
                                Your seller registration request has been submitted successfully! 
                                Our admin team will review your application and notify you at{' '}
                                <span className="font-semibold text-slate-900 dark:text-white">{formData.email}</span>{' '}
                                once approved. You'll be able to login once your account is verified.
                            </>
                        ) : (
                            <>
                                We've sent a verification link to <span className="font-semibold text-slate-900 dark:text-white">{formData.email}</span>. 
                                Please click the link to verify your account.
                            </>
                        )}
                    </p>
                    
                    {resendSuccess && (
                      <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm border border-green-200 dark:border-green-800">
                        Verification email sent successfully! Check your inbox.
                      </div>
                    )}
                    
                    <div className="space-y-3 mb-6">
                      <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-sm">
                        <p className="text-slate-700 dark:text-slate-300 font-medium mb-2">⚠️ Important Steps:</p>
                        <ol className="text-left text-slate-600 dark:text-slate-400 space-y-1 ml-4 list-decimal">
                          <li>Check your inbox for email from Supabase</li>
                          <li>If not found, check your spam/junk folder</li>
                          <li>Click the verification link in the email</li>
                          <li>After verification, return to login</li>
                        </ol>
                      </div>
                      
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        Didn't receive the email?
                        <button
                          onClick={handleResendEmail}
                          disabled={resendLoading || isFactoryPending}
                          className="ml-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold disabled:opacity-50"
                        >
                          {resendLoading ? 'Sending...' : 'Resend Email'}
                        </button>
                      </div>
                    </div>
                    
                    {!isFactoryPending && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 mb-6">
                            Tip: Check your spam folder if you don't see it in a few minutes.
                        </p>
                    )}
                    
                    <Link 
                        to="/login" 
                        className="block w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-colors"
                        onClick={() => sessionStorage.removeItem('pendingApprovalType')}
                    >
                        {isFactoryPending ? 'Back to Login' : 'Proceed to Login'}
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
        <div className="absolute top-[-10%] left-[-10%] w-125 h-125 bg-emerald-300/20 dark:bg-emerald-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-125 h-125 bg-indigo-300/20 dark:bg-indigo-500/10 rounded-full blur-[100px]" />

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
                        onBlur={handleBlur}
                        placeholder="Enter your full name"
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                          fieldErrors.fullName 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-slate-200 dark:border-slate-700 focus:ring-emerald-500'
                        } bg-slate-50 dark:bg-slate-900/50 focus:ring-2 outline-none transition-all placeholder:text-slate-400`}
                        required
                    />
                </div>
                {fieldErrors.fullName && (
                  <p className="text-xs text-red-500 ml-1 mt-1">{fieldErrors.fullName}</p>
                )}
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
                        onBlur={handleBlur}
                        placeholder="Enter your email address"
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                          fieldErrors.email 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-slate-200 dark:border-slate-700 focus:ring-emerald-500'
                        } bg-slate-50 dark:bg-slate-900/50 focus:ring-2 outline-none transition-all placeholder:text-slate-400`}
                        required
                    />
                </div>
                {fieldErrors.email && (
                  <p className="text-xs text-red-500 ml-1 mt-1">{fieldErrors.email}</p>
                )}
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
                        onBlur={handleBlur}
                        placeholder="Enter your username"
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                          fieldErrors.username 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-slate-200 dark:border-slate-700 focus:ring-emerald-500'
                        } bg-slate-50 dark:bg-slate-900/50 focus:ring-2 outline-none transition-all placeholder:text-slate-400`}
                        required
                        autoComplete="username"
                    />
                </div>
                {fieldErrors.username && (
                  <p className="text-xs text-red-500 ml-1 mt-1">{fieldErrors.username}</p>
                )}
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Company Name</label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                        type="text" 
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Enter your company name"
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                          fieldErrors.companyName 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-slate-200 dark:border-slate-700 focus:ring-emerald-500'
                        } bg-slate-50 dark:bg-slate-900/50 focus:ring-2 outline-none transition-all placeholder:text-slate-400`}
                        required
                    />
                </div>
                {fieldErrors.companyName && (
                  <p className="text-xs text-red-500 ml-1 mt-1">{fieldErrors.companyName}</p>
                )}
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
                        onBlur={handleBlur}
                        placeholder="Min 8 chars, 1 uppercase, 1 lowercase, 1 number"
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                          fieldErrors.password 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-slate-200 dark:border-slate-700 focus:ring-emerald-500'
                        } bg-slate-50 dark:bg-slate-900/50 focus:ring-2 outline-none transition-all placeholder:text-slate-400`}
                        required
                        autoComplete="new-password"
                    />
                </div>
                {formData.password && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div 
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            level <= getPasswordStrength(formData.password).strength 
                              ? getPasswordStrength(formData.password).color 
                              : 'bg-slate-200 dark:bg-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs ml-1 ${
                      getPasswordStrength(formData.password).strength <= 2 ? 'text-red-500' :
                      getPasswordStrength(formData.password).strength === 3 ? 'text-yellow-500' :
                      getPasswordStrength(formData.password).strength === 4 ? 'text-blue-500' :
                      'text-green-500'
                    }`}>
                      Password Strength: {getPasswordStrength(formData.password).label}
                    </p>
                  </div>
                )}
                {fieldErrors.password && (
                  <p className="text-xs text-red-500 ml-1 mt-1">{fieldErrors.password}</p>
                )}
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Confirm Password</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                        type="password" 
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Confirm your password"
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                          fieldErrors.confirmPassword 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-slate-200 dark:border-slate-700 focus:ring-emerald-500'
                        } bg-slate-50 dark:bg-slate-900/50 focus:ring-2 outline-none transition-all placeholder:text-slate-400`}
                        required
                        autoComplete="new-password"
                    />
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="text-xs text-red-500 ml-1 mt-1">{fieldErrors.confirmPassword}</p>
                )}
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
                        onBlur={handleBlur}
                        placeholder="Enter 10 digit number"
                        inputMode="numeric"
                        maxLength="10"
                        className={`w-full px-4 py-3 rounded-xl border ${
                          fieldErrors.phone 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-slate-200 dark:border-slate-700 focus:ring-emerald-500'
                        } bg-slate-50 dark:bg-slate-900/50 focus:ring-2 outline-none transition-all placeholder:text-slate-400`}
                        required
                    />
                    {fieldErrors.phone && (
                      <p className="text-xs text-red-500 ml-1 mt-1">{fieldErrors.phone}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Location (City)</label>
                    <input 
                        type="text" 
                        name="location"
                        value={formData.location || ''}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Enter your location"
                        className={`w-full px-4 py-3 rounded-xl border ${
                          fieldErrors.location 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-slate-200 dark:border-slate-700 focus:ring-emerald-500'
                        } bg-slate-50 dark:bg-slate-900/50 focus:ring-2 outline-none transition-all placeholder:text-slate-400`}
                        required
                    />
                    {fieldErrors.location && (
                      <p className="text-xs text-red-500 ml-1 mt-1">{fieldErrors.location}</p>
                    )}
                </div>

                {/* Factory Registration Option */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            name="wantsToBeFactory"
                            checked={formData.wantsToBeFactory}
                            onChange={(e) => setFormData({ ...formData, wantsToBeFactory: e.target.checked })}
                            className="mt-1 w-4 h-4 text-emerald-600 bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-600 rounded focus:ring-emerald-500 focus:ring-2"
                        />
                        <div className="flex-1">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                I want to register as a Seller
                            </span>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Register as a textile waste producer and start selling your inventory. Requires admin approval.
                            </p>
                        </div>
                    </label>
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
