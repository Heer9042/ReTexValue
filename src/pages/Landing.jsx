import React from "react";
import { Link } from "react-router-dom";
import {
  Recycle,
  TrendingUp,
  ShieldCheck,
  Globe,
  ArrowRight,
  CheckCircle2,
  Activity,
} from "lucide-react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useApp } from "../context/AppContext";


export default function Landing() {
  const { getStats, users, listings, transactions, fetchUsers, fetchListings, fetchTransactions } = useApp();
  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState({
    totalRevenue: 0,
    totalWasteSold: 0,
    co2Saved: 0,
    totalUsers: 0,
    totalListings: 0,
    totalTransactions: 0
  });

  // Fetch real data on component mount
  React.useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchUsers(),
          fetchListings(),
          fetchTransactions()
        ]);
      } catch (error) {
        console.error('Failed to load landing page data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchUsers, fetchListings, fetchTransactions]);

  // Update stats when data changes
  React.useEffect(() => {
    if (!loading) {
      const realStats = getStats();
      setStats({
        totalRevenue: realStats.totalRevenue || 0,
        totalWasteSold: realStats.totalWasteSold || 0,
        co2Saved: realStats.co2Saved || 0,
        totalUsers: users.length || 0,
        totalListings: listings.filter(l => l.status === 'Live').length || 0,
        totalTransactions: transactions.length || 0
      });
    }
  }, [loading, users, listings, transactions, getStats]);

  const [marketRates, setMarketRates] = React.useState([
    { id: 1, type: "Cotton Pure", price: 45, priceStr: "₹45/kg", change: 2.4, positive: true, updatedAt: new Date() },
    { id: 2, type: "Polyester Scrap", price: 30, priceStr: "₹30/kg", change: -0.5, positive: false, updatedAt: new Date() },
    { id: 3, type: "Denim Offcuts", price: 38, priceStr: "₹38/kg", change: 1.2, positive: true, updatedAt: new Date() },
    { id: 4, type: "Silk Blends", price: 120, priceStr: "₹120/kg", change: 5.1, positive: true, updatedAt: new Date() },
  ]);

  const [lastUpdateTime, setLastUpdateTime] = React.useState(new Date());

  // Simulate live market updates every 30 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      setMarketRates((prevRates) =>
        prevRates.map((rate) => {
          // Simulate small price fluctuations (±2%)
          const fluctuation = (Math.random() - 0.5) * 4;
          const newChange = parseFloat((rate.change + fluctuation).toFixed(1));
          const priceVariation = Math.random() * 2 - 1; // ±1
          const newPrice = Math.round((rate.price + priceVariation) * 100) / 100;

          return {
            ...rate,
            price: newPrice,
            priceStr: `₹${newPrice}/kg`,
            change: newChange,
            positive: newChange > 0,
            updatedAt: new Date(),
          };
        })
      );
      setLastUpdateTime(new Date());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white selection:bg-emerald-500/30 transition-colors duration-300">
        {/* Hero Section */}
        <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-32 overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl overflow-hidden pointer-events-none">
            <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-emerald-300/20 dark:bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[0%] right-[10%] w-[600px] h-[600px] bg-indigo-300/20 dark:bg-indigo-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                Live: AI Waste Classification 2.0
              </span>
            </div>

            <h1 className="text-5xl caveat md:text-7xl font-extrabold tracking-tight mb-8 leading-tight text-slate-900 dark:text-white">
              Turn Textile Waste into <br />
              <span className="relative inline-block text-transparent bg-clip-text caveat bg-linear-to-r from-emerald-600 via-teal-500 to-cyan-500 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400">
                Digital Assets
                <img
                  src="/underline.svg"
                  alt=""
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1/2 -bottom-2 -translate-x-1/2 w-[70%] opacity-90"
                />
              </span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-slate-600 dark:text-slate-400 mb-12 leading-relaxed">
              ReTexValue is the first ecosystem connecting factories directly
              with global recyclers. We use AI to value waste, ensuring zero
              landfill and maximum profit.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-5">
              <Link
                to="/login"
                className="group px-8 py-4 bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 dark:hover:bg-emerald-600 rounded-full font-bold text-lg text-white transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transform hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                Start Trading Now{" "}
                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
              <Link
                to="/how-it-works"
                className="px-8 py-4 bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 backdrop-blur-md rounded-full font-bold text-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white transition-all hover:border-slate-300 dark:hover:border-slate-500"
              >
                See How It Works
              </Link>
            </div>

            {/* Trusted By Strip */}
            <div className="mt-20 pt-8 border-t border-slate-200 dark:border-slate-800/50">
              <p className="text-slate-500 text-sm font-medium uppercase tracking-widest mb-6">
                Trusted by 500+ Innovative Companies
              </p>
              <div className="flex flex-wrap justify-center gap-8 opacity-60 dark:opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                {/* Mock logos styled as text for now */}
                <span className="text-xl font-black text-slate-800 dark:text-white">
                  ZARA<span className="font-light">HOME</span>
                </span>
                <span className="text-xl font-bold text-slate-800 dark:text-white">
                  H&M <span className="text-sm font-normal">Conscious</span>
                </span>
                <span className="text-xl font-serif text-slate-800 dark:text-white">
                  Patagonia
                </span>
                <span className="text-xl font-black italic text-slate-800 dark:text-white">
                  ADIDAS
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Value Proposition Grid */}
        <div className="py-24 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={
                  <Recycle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                }
                title="AI Classification"
                desc="Upload an image and let our neural networks identifying fabric composition, weave type, and estimated market value in seconds."
              />
              <FeatureCard
                icon={
                  <Globe className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                }
                title="Global Marketplace"
                desc="Bypass middlemen. Connect directly with certified recyclers in Europe, Southeast Asia, and the Americas."
              />
              <FeatureCard
                icon={
                  <TrendingUp className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
                }
                title="Impact Tracking"
                desc="Real-time environmental dashboards. Track every kg of CO2 averted and water saved for your sustainability reports."
              />
            </div>
          </div>
        </div>

        {/* New 'Why Choose Us' Section */}
        <div className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800/50 skew-y-3 transform origin-bottom-left -z-10 transition-colors" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                  The Old Way vs. <br />
                  <span className="text-emerald-600 dark:text-emerald-400">
                    The ReTex Way
                  </span>
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
                  Stop selling your waste for pennies to local aggregators. Gain
                  transparency, better pricing, and certified impact data.
                </p>

                <div className="space-y-4">
                  <CheckItem text="Direct access to 500+ verified recyclers" />
                  <CheckItem text="Up to 40% higher revenue for factory owners" />
                  <CheckItem text="Audit-ready sustainability certificates" />
                  <CheckItem text="Secure escrow payments & logistics support" />
                </div>

                <Link
                  to="/about"
                  className="inline-block mt-8 text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 font-bold border-b-2 border-emerald-500/30 hover:border-emerald-500 transition-all"
                >
                  Read our Mission Statement
                </Link>
              </div>

              <div className="mt-12 lg:mt-0 relative">
                <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full" />
                <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-2xl">
                  {/* Mock Dashboard UI Snippet */}
                  <div className="flex justify-between items-center mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Activity className="w-4 h-4 text-green-500 animate-pulse" />
                      Live Market Rates
                    </h4>
                    <span className="px-2 py-1 bg-green-500/20 text-green-600 dark:text-green-400 text-xs rounded flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      Live Updates
                    </span>
                  </div>
                  <div className="space-y-4">
                    {marketRates.map((rate) => (
                      <MarketRateRow
                        key={rate.id}
                        type={rate.type}
                        price={rate.priceStr}
                        change={`${rate.change > 0 ? "+" : ""}${rate.change}%`}
                        positive={rate.positive}
                      />
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50 text-xs text-slate-500 dark:text-slate-400">
                    Last updated: {lastUpdateTime.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-24">
          <div className="max-w-5xl mx-auto px-4 text-center bg-linear-to-br from-emerald-800 to-slate-900 dark:from-emerald-900/50 dark:to-slate-900 border border-emerald-500/30 rounded-3xl p-12 relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-4xl font-bold text-white mb-6">
                Ready to monetize your waste?
              </h2>
              <p className="text-lg text-emerald-100 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
                Join thousands of factories and recyclers building a cleaner,
                more profitable future.
              </p>
              
              {/* Real-time Platform Stats */}
              {!loading && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="text-3xl font-bold text-white">{stats.totalUsers}</div>
                    <div className="text-emerald-200 text-sm">Active Users</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="text-3xl font-bold text-white">{stats.totalListings}</div>
                    <div className="text-emerald-200 text-sm">Live Listings</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="text-3xl font-bold text-white">{stats.totalWasteSold.toLocaleString()} kg</div>
                    <div className="text-emerald-200 text-sm">Waste Diverted</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="text-3xl font-bold text-white">₹{stats.totalRevenue.toLocaleString()}</div>
                    <div className="text-emerald-200 text-sm">Total GMV</div>
                  </div>
                </div>
              )}
              
              <Link
                to="/login"
                className="px-10 py-4 bg-white text-emerald-900 font-bold rounded-full hover:bg-emerald-50 transition-colors shadow-lg inline-block"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="p-8 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 backdrop-blur-sm hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all hover:border-emerald-500/30 group hover:-translate-y-2 shadow-sm dark:shadow-none">
      <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-black/5 dark:shadow-black/20">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">
        {title}
      </h3>
      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
        {desc}
      </p>
    </div>
  );
}

function CheckItem({ text }) {
  return (
    <div className="flex items-center gap-3">
      <div className="p-1 rounded-full bg-emerald-500/10 shrink-0">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
      </div>
      <span className="text-slate-700 dark:text-slate-300">{text}</span>
    </div>
  );
}

function MarketRateRow({ type, price, change, positive }) {
  return (
    <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-100 dark:border-transparent hover:border-emerald-500/30 transition-all duration-300 hover:shadow-sm dark:hover:shadow-emerald-500/10">
      <span className="text-slate-700 dark:text-slate-200 font-medium">
        {type}
      </span>
      <div className="flex items-center gap-4">
        <span className="text-slate-900 dark:text-white font-bold text-lg transition-all duration-300 min-w-24 text-right">
          {price}
        </span>
        <span
          className={`text-xs px-2 py-1 rounded font-bold transition-all duration-300 ${
            positive
              ? "bg-green-500/20 text-green-600 dark:text-green-400"
              : "bg-red-500/20 text-red-600 dark:text-red-400"
          }`}
        >
          {change}
        </span>
      </div>
    </div>
  );
}
