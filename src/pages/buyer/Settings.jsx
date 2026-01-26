import React, { useState } from 'react';
import { Bell, Lock, User, Globe, Palette, Shield, Mail, MessageSquare } from 'lucide-react';

export default function BuyerSettings() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [newListings, setNewListings] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Settings</h1>
        <p className="text-slate-600 dark:text-slate-400">Manage your account preferences and settings</p>
      </div>

      {/* Account Settings */}
      <SettingSection title="Account Settings" icon={<User />}>
        <SettingItem 
          label="Full Name" 
          value="John Doe"
          type="text"
        />
        <SettingItem 
          label="Email Address" 
          value="john@example.com"
          type="email"
        />
        <SettingItem 
          label="Phone Number" 
          value="+91 98765 43210"
          type="tel"
        />
        <button className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors">
          Update Profile
        </button>
      </SettingSection>

      {/* Notifications */}
      <SettingSection title="Notifications" icon={<Bell />}>
        <ToggleSetting 
          label="Email Notifications"
          description="Receive email updates about your orders and proposals"
          checked={emailNotifications}
          onChange={setEmailNotifications}
        />
        <ToggleSetting 
          label="Push Notifications"
          description="Get push notifications on your device"
          checked={pushNotifications}
          onChange={setPushNotifications}
        />
        <ToggleSetting 
          label="Order Updates"
          description="Get notified when your order status changes"
          checked={orderUpdates}
          onChange={setOrderUpdates}
        />
        <ToggleSetting 
          label="New Listings Alert"
          description="Get alerted when new materials matching your interests are listed"
          checked={newListings}
          onChange={setNewListings}
        />
      </SettingSection>

      {/* Security */}
      <SettingSection title="Security" icon={<Lock />}>
        <div className="space-y-4">
          <div>
            <button className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg font-medium transition-colors">
              Change Password
            </button>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Last changed 3 months ago</p>
          </div>
          <div>
            <button className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg font-medium transition-colors">
              Enable Two-Factor Authentication
            </button>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Add an extra layer of security to your account</p>
          </div>
        </div>
      </SettingSection>

      {/* Preferences */}
      <SettingSection title="Preferences" icon={<Palette />}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Language
            </label>
            <select className="w-full md:w-64 px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
              <option>English</option>
              <option>Hindi</option>
              <option>Marathi</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Currency
            </label>
            <select className="w-full md:w-64 px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
              <option>INR (₹)</option>
              <option>USD ($)</option>
              <option>EUR (€)</option>
            </select>
          </div>
        </div>
      </SettingSection>

      {/* Privacy */}
      <SettingSection title="Privacy" icon={<Shield />}>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <input 
              type="checkbox" 
              id="dataSharing"
              className="mt-1 w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
            <label htmlFor="dataSharing" className="flex-1 cursor-pointer">
              <div className="font-medium text-slate-900 dark:text-white">Data Sharing</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Allow us to share anonymized data to improve our services</div>
            </label>
          </div>
          <div className="flex items-start gap-3">
            <input 
              type="checkbox" 
              id="profileVisibility"
              className="mt-1 w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              defaultChecked
            />
            <label htmlFor="profileVisibility" className="flex-1 cursor-pointer">
              <div className="font-medium text-slate-900 dark:text-white">Profile Visibility</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Make your profile visible to verified sellers</div>
            </label>
          </div>
        </div>
      </SettingSection>

      {/* Danger Zone */}
      <SettingSection title="Danger Zone" icon={<Shield />} danger>
        <div className="space-y-4">
          <div>
            <button className="px-4 py-2 bg-red-100 dark:bg-red-500/10 hover:bg-red-200 dark:hover:bg-red-500/20 text-red-700 dark:text-red-400 rounded-lg font-medium transition-colors">
              Deactivate Account
            </button>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Temporarily disable your account</p>
          </div>
          <div>
            <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">
              Delete Account
            </button>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Permanently delete your account and all data</p>
          </div>
        </div>
      </SettingSection>
    </div>
  );
}

function SettingSection({ title, icon, children, danger = false }) {
  return (
    <div className={`bg-white dark:bg-slate-800 border ${danger ? 'border-red-200 dark:border-red-500/30' : 'border-slate-200 dark:border-slate-700'} rounded-2xl p-6 shadow-sm`}>
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2 rounded-lg ${danger ? 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400' : 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}`}>
          {icon}
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function SettingItem({ label, value, type = "text" }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
        {label}
      </label>
      <input 
        type={type}
        defaultValue={value}
        className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
      />
    </div>
  );
}

function ToggleSetting({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700 last:border-0">
      <div className="flex-1">
        <div className="font-medium text-slate-900 dark:text-white">{label}</div>
        <div className="text-sm text-slate-500 dark:text-slate-400">{description}</div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
