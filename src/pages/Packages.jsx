import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Check, Star, Zap, TrendingUp, Shield, Sparkles, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const BADGE_COLORS = {
  slate: 'from-slate-500 to-slate-600',
  blue: 'from-blue-500 to-indigo-600',
  emerald: 'from-emerald-500 to-teal-600',
  purple: 'from-purple-500 to-pink-600',
  rose: 'from-rose-500 to-red-600',
  amber: 'from-amber-500 to-orange-600',
};

const BADGE_GLOW = {
  slate: 'shadow-slate-500/20',
  blue: 'shadow-blue-500/30',
  emerald: 'shadow-emerald-500/30',
  purple: 'shadow-purple-500/30',
  rose: 'shadow-rose-500/30',
  amber: 'shadow-amber-500/30',
};

export default function Packages() {
  const { packages, user, loading } = useApp();
  const navigate = useNavigate();

  // Debug: Log packages to console
  console.log('📦 [Packages Page] Total packages from context:', packages?.length || 0);
  console.log('📦 [Packages Page] All packages:', packages);

  const activePackages = packages.filter(p => p.status === 'active');
  const featuredPackages = activePackages.filter(p => p.isFeatured);
  const regularPackages = activePackages.filter(p => !p.isFeatured);

  console.log('✅ [Packages Page] Active packages:', activePackages.length);
  console.log('⭐ [Packages Page] Featured packages:', featuredPackages.length);

  const handleChoosePackage = (pkg) => {
    if (!user) {
      navigate('/register');
    } else {
      // TODO: Implement subscription flow
      alert(`Subscribing to ${pkg.name} package. Payment integration coming soon!`);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors duration-300">
        
        {/* Hero Section */}
        <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-32 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl overflow-hidden pointer-events-none">
            <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-emerald-300/20 dark:bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[0%] right-[10%] w-[600px] h-[600px] bg-purple-300/20 dark:bg-purple-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 mb-8">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                Flexible Pricing for Every Business
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight text-slate-900 dark:text-white">
              Choose Your <br />
              <span className="relative inline-block text-transparent bg-clip-text bg-linear-to-r from-emerald-600 via-teal-500 to-cyan-500 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400 caveat">
                Perfect Plan
              </span>
            </h1>

            <p className="mt-6 max-w-2xl mx-auto text-xl text-slate-600 dark:text-slate-400 mb-12 leading-relaxed">
              Scale your textile waste management with plans designed for factories, buyers, and enterprises
            </p>
          </div>
        </div>

        {/* Featured Packages */}
        {featuredPackages.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                ⭐ Most Popular
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Our best-selling plans trusted by industry leaders
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredPackages.map((pkg) => (
                <PricingCard 
                  key={pkg.id} 
                  pkg={pkg} 
                  onChoose={handleChoosePackage}
                  featured
                />
              ))}
            </div>
          </div>
        )}

        {/* All Packages */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {regularPackages.length > 0 && featuredPackages.length > 0 && (
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                All Plans
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Find the perfect fit for your business needs
              </p>
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularPackages.map((pkg) => (
              <PricingCard 
                key={pkg.id} 
                pkg={pkg} 
                onChoose={handleChoosePackage}
              />
            ))}
          </div>

          {activePackages.length === 0 && (
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                <Sparkles className="w-12 h-12 text-slate-400 dark:text-slate-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-4">
                Packages Coming Soon
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
                We're preparing exciting subscription plans for you. Check back soon!
              </p>
            </div>
          )}
        </div>

        {/* FAQ or Additional Info Section */}
        <div className="bg-slate-50 dark:bg-slate-800/50 py-20 border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
              Still have questions?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
              Our team is here to help you choose the right plan for your needs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded-full font-bold transition-all shadow-lg shadow-emerald-500/25">
                Contact Sales
              </button>
              <button className="px-8 py-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-full font-bold transition-all">
                View FAQ
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

function PricingCard({ pkg, onChoose, featured = false }) {
  const badgeGradient = BADGE_COLORS[pkg.badgeColor] || BADGE_COLORS.blue;
  const badgeGlow = BADGE_GLOW[pkg.badgeColor] || BADGE_GLOW.blue;

  return (
    <div className={`relative bg-white dark:bg-slate-800 rounded-3xl p-8 transition-all hover:scale-105 ${
      featured 
        ? 'border-2 border-emerald-500 dark:border-emerald-600 shadow-2xl shadow-emerald-500/20' 
        : 'border border-slate-200 dark:border-slate-700 hover:shadow-xl'
    }`}>
      {featured && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
          <Star size={12} fill="currentColor" /> POPULAR CHOICE
        </div>
      )}

      <div className={`inline-flex bg-linear-to-r ${badgeGradient} text-white px-4 py-2 rounded-xl font-bold text-sm mb-6 shadow-lg ${badgeGlow}`}>
        {pkg.name}
      </div>

      <div className="mb-6">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-5xl font-black text-slate-900 dark:text-white">
            ₹{pkg.price.toLocaleString()}
          </span>
          <span className="text-slate-500 dark:text-slate-400 text-sm">
            /{pkg.durationDays} days
          </span>
        </div>
        <p className="text-slate-600 dark:text-slate-400">{pkg.description}</p>
      </div>

      <button
        onClick={() => onChoose(pkg)}
        className={`w-full py-4 rounded-xl font-bold transition-all mb-8 flex items-center justify-center gap-2 ${
          featured
            ? 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
            : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white'
        }`}
      >
        Get Started <ArrowRight size={18} />
      </button>

      <div className="space-y-4">
        <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
          <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
            <TrendingUp size={14} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="text-sm">
            <strong>{pkg.maxListings === 999999 ? 'Unlimited' : pkg.maxListings}</strong> Listings per month
          </span>
        </div>

        <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
          <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
            <Zap size={14} className="text-blue-600 dark:text-blue-400" />
          </div>
          <span className="text-sm">
            <strong>{pkg.aiCredits === 999999 ? 'Unlimited' : pkg.aiCredits}</strong> AI Classification Credits
          </span>
        </div>

        {pkg.prioritySupport && (
          <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
            <div className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
              <Shield size={14} className="text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-sm">
              <strong>Priority</strong> Support
            </span>
          </div>
        )}

        {pkg.features && pkg.features.length > 0 && (
          <>
            <div className="h-px bg-slate-200 dark:bg-slate-700 my-4" />
            {pkg.features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3 text-slate-600 dark:text-slate-400">
                <Check size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
