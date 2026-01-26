import React from 'react';
import { Link } from 'react-router-dom';
import { Recycle, Twitter, Linkedin, Facebook, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-white/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2 w-fit">
              <Recycle className="h-7 w-7 text-emerald-500" />
              <span className="text-xl font-bold bg-linear-to-r from-emerald-600 to-teal-400 dark:from-emerald-400 dark:to-teal-200 bg-clip-text text-transparent">
                ReTexValue
              </span>
            </Link>

            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              AI-powered marketplace transforming textile waste into verified digital value.
            </p>

            <div className="flex gap-3">
              <SocialIcon><Twitter size={18} /></SocialIcon>
              <SocialIcon><Linkedin size={18} /></SocialIcon>
              <SocialIcon><Facebook size={18} /></SocialIcon>
            </div>
          </div>

          {/* Platform */}
          <FooterColumn title="Platform">
            <FooterLink to="/" text="Home" />
            <FooterLink to="/how-it-works" text="How It Works" />
            <FooterLink to="/community" text="Community" />
            <FooterLink to="/contact" text="Contact" />
          </FooterColumn>

          {/* Legal */}
          <FooterColumn title="Legal">
            <FooterLink to="#" text="Privacy Policy" />
            <FooterLink to="#" text="Terms of Service" />
            <FooterLink to="#" text="Compliance" />
            <FooterLink to="#" text="Factory Verification" />
          </FooterColumn>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4 text-slate-800 dark:text-white">Contact</h3>
            <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex gap-3">
                <MapPin className="w-5 h-5 text-emerald-500" />
                Surat, Gujarat, India
              </li>
              <li className="flex gap-3">
                <Mail className="w-5 h-5 text-emerald-500" />
                support@retexvalue.com
              </li>
              <li className="flex gap-3">
                <Phone className="w-5 h-5 text-emerald-500" />
                +91 98765 43210
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-200 dark:border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <span>© {new Date().getFullYear()} ReTexValue</span>
          <div className="flex gap-6">
            <span className="hover:text-emerald-500 cursor-pointer">Privacy</span>
            <span className="hover:text-emerald-500 cursor-pointer">Terms</span>
            <span className="hover:text-emerald-500 cursor-pointer">Sitemap</span>
          </div>
        </div>

      </div>
    </footer>
  );
}

/* Helpers */

function FooterColumn({ title, children }) {
  return (
    <div>
      <h3 className="font-semibold mb-4 text-slate-800 dark:text-white">{title}</h3>
      <ul className="space-y-3">{children}</ul>
    </div>
  );
}

function FooterLink({ to, text }) {
  return (
    <li>
      <Link
        to={to}
        className="text-slate-600 dark:text-slate-400 hover:text-emerald-500 transition-colors text-sm"
      >
        {text}
      </Link>
    </li>
  );
}

function SocialIcon({ children }) {
  return (
    <a
      href="#"
      className="w-9 h-9 rounded-full border border-slate-200 dark:border-white/10
                 flex items-center justify-center
                 text-slate-500 dark:text-slate-400
                 hover:bg-emerald-500 hover:text-white
                 hover:border-emerald-500 transition-all"
    >
      {children}
    </a>
  );
}
