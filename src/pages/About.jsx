import React from 'react';
import { Target, Leaf, Globe2 } from 'lucide-react';
import SustainabilityHeroImg from '../assets/sustainable_hero.png';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useApp } from '../context/AppContext';

export default function About() {
  const { getStats, users, listings, fetchUsers, fetchListings } = useApp();
  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState({
    totalWasteSold: 0,
    totalFactories: 0,
    totalRevenue: 0,
    co2Saved: 0
  });

  // Fetch real data on component mount
  React.useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchUsers(), fetchListings()]);
      } catch (error) {
        console.error('Failed to load about page data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchUsers, fetchListings]);

  // Update stats when data changes
  React.useEffect(() => {
    if (!loading) {
      const realStats = getStats();
      setStats({
        totalWasteSold: realStats.totalWasteSold || 0,
        totalFactories: users.filter(u => u.role === 'Factory').length || 0,
        totalRevenue: realStats.totalRevenue || 0,
        co2Saved: realStats.co2Saved || 0
      });
    }
  }, [loading, users, listings, getStats]);

  return (
    <>
      <Navbar />
      <div className="pt-20 min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        
        {/* Hero Section */}
        <div className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-emerald-500/5 dark:bg-emerald-500/5 backdrop-blur-[100px]" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
             <span className="text-emerald-600 dark:text-emerald-400 font-semibold tracking-wide uppercase text-sm mb-4 block animate-in fade-in slide-in-from-bottom-3">Our Mission</span>
             <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">Revolutionizing Textile <br className="hidden md:block"/> Waste Management</h1>
             <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
               ReTexValue is more than a marketplace. We are a technology-driven movement to close the loop in the fashion industry, turning waste liabilities into valuable assets.
             </p>
          </div>
        </div>

        {/* Vision & Mission */}
        <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="relative">
                 <div className="absolute -inset-4 bg-linear-to-r from-emerald-500 to-teal-500 opacity-20 blur-xl rounded-full" />
                 <img 
                    src={SustainabilityHeroImg} 
                    alt="Sustainable Textiles" 
                    className="relative rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full object-cover h-[400px] hover:scale-[1.02] transition-transform duration-500"
                 />
              </div>
              <div className="space-y-8">
                 <FeatureBlock 
                   icon={<Target className="text-emerald-600 dark:text-emerald-400" />}
                   title="Our Vision"
                   text="To build a world where zero textile waste goes to landfills. We envision a fully circular ecosystem where every scrap of fabric is accounted for, valued, and reused."
                 />
                 <FeatureBlock 
                   icon={<Globe2 className="text-blue-600 dark:text-blue-400" />}
                   title="Global Impact"
                   text="Connecting local manufacturers in India with global recyclers in Europe, Vietnam, and beyond. We bridge the gap between waste generation and material innovation."
                 />
                 <FeatureBlock 
                   icon={<Leaf className="text-green-600 dark:text-green-400" />}
                   title="Environmental Stewardship"
                   text="Our AI doesn't just categorize; it quantifies environmental savings, helping brands meet their sustainability goals and acquire carbon credits."
                 />
              </div>
           </div>
        </div>



      </div>
      <Footer />
    </>
  );
}

function FeatureBlock({ icon, title, text }) {
  return (
    <div className="flex gap-4">
      <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none">
        {icon}
      </div>
      <div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}


