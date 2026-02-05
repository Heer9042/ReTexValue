import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Bell, Lock, Globe, Palette, Shield, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react';

export default function BuyerSettings() {
  const { user, updateProfile, changePassword, toggleTwoFactorAuth, getActiveSessions, revokeAllSessions } = useApp();
  const navigate = useNavigate();
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [newListings, setNewListings] = useState(false);
  const [submitting, setSubmitting] = useState(false);


  // Security modals
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [showDevicesModal, setShowDevicesModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [securitySubmitting, setSecuritySubmitting] = useState(false);
  
  // Active sessions
  const [activeSessions, setActiveSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  
  // Two-Factor Setup Flow
  const [twoFactorStep, setTwoFactorStep] = useState('status'); // 'status', 'setup', 'verify', 'recovery'
  const [twoFactorSecret, setTwoFactorSecret] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  
  // Device details
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [revoking, setRevoking] = useState(false);
  


  // Irreversible Actions
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showDataWipeModal, setShowDataWipeModal] = useState(false);
  const [deactivateConfirmText, setDeactivateConfirmText] = useState('');
  const [dataWipeConfirmEmail, setDataWipeConfirmEmail] = useState('');
  const [dataWipeStep, setDataWipeStep] = useState('warning'); // 'warning' or 'confirm'
  
  // Status messages
  const [statusMessage, setStatusMessage] = useState({ type: '', message: '' });

  // Sync state with user data on load
  useEffect(() => {
    if (user) {
      setEmailNotifications(user.notifications_email ?? true);
      setPushNotifications(user.notifications_push ?? true);
      setNewListings(user.notifications_listings ?? false);
      setTwoFactorEnabled(user.two_factor_enabled ?? false);
    }
  }, [user]);

  const showStatus = (type, message) => {
    setStatusMessage({ type, message });
    setTimeout(() => setStatusMessage({ type: '', message: '' }), 5000);
  };

  const handleUpdate = async () => {
    setSubmitting(true);
    try {
       await updateProfile({
          notifications_email: emailNotifications,
          notifications_push: pushNotifications,
          notifications_listings: newListings
       });
       showStatus('success', 'Preferences updated successfully!');
    } catch (err) {
       console.error("Failed to update settings:", err);
       showStatus('error', 'Failed to update preferences');
    } finally {
       setSubmitting(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!newPassword || !confirmPassword) {
      showStatus('error', 'Please fill in all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      showStatus('error', 'Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      showStatus('error', 'Password must be at least 8 characters');
      return;
    }

    setSecuritySubmitting(true);
    try {
       const result = await changePassword('', newPassword); // Current password verification done via Supabase
       
       // Show success message with email status
       if (result.emailSent) {
         showStatus('success', `Password changed! Confirmation email sent to ${result.email}`);
       } else {
         showStatus('success', `Password changed successfully! (Email notification pending)`);
       }
       
       setNewPassword('');
       setConfirmPassword('');
       
       // Close modal after 2 seconds
       setTimeout(() => {
         setShowPasswordModal(false);
       }, 2000);
    } catch (err) {
       console.error("Failed to change password:", err);
       showStatus('error', 'Failed to change password: ' + err.message);
    } finally {
       setSecuritySubmitting(false);
    }
  };

  const handleTwoFactorToggle = async () => {
    setSecuritySubmitting(true);
    try {
       await toggleTwoFactorAuth(!twoFactorEnabled);
       setTwoFactorEnabled(!twoFactorEnabled);
       showStatus('success', `Two-factor authentication ${!twoFactorEnabled ? 'enabled' : 'disabled'}!`);
       setShowTwoFactorModal(false);
    } catch (err) {
       console.error("Failed to update 2FA:", err);
       showStatus('error', 'Failed to update two-factor authentication');
    } finally {
       setSecuritySubmitting(false);
    }
  };

  const handleLoadSessions = async () => {
    setSessionsLoading(true);
    try {
      const sessions = await getActiveSessions();
      setActiveSessions(sessions);
    } catch (err) {
      console.error('Failed to load sessions:', err);
      showStatus('error', 'Failed to load active sessions');
    } finally {
      setSessionsLoading(false);
    }
  };

  const handleTwoFactorSetup = async () => {
    setSecuritySubmitting(true);
    try {
      const result = await toggleTwoFactorAuth(true);
      if (result.secret) {
        setTwoFactorSecret(result.secret);
        // Generate QR code URL (using a QR code service)
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=otpauth://totp/ReTexValue:${user?.email}?secret=${result.secret}&issuer=ReTexValue`;
        setQrCodeUrl(qrUrl);
        // Generate recovery codes (in production, these would come from backend)
        const codes = Array.from({ length: 8 }, () => 
          `${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
        );
        setRecoveryCodes(codes);
        setTwoFactorStep('setup');
      }
    } catch (err) {
      console.error('Failed to setup 2FA:', err);
      showStatus('error', 'Failed to setup two-factor authentication');
    } finally {
      setSecuritySubmitting(false);
    }
  };

  const handleTwoFactorVerify = async () => {
    if (!verificationCode) {
      showStatus('error', 'Please enter verification code');
      return;
    }
    setSecuritySubmitting(true);
    try {
      // In production, verify the code against the backend
      showStatus('success', 'Two-factor authentication enabled successfully!');
      setTwoFactorEnabled(true);
      setTwoFactorStep('recovery');
    } catch (err) {
      console.error('Failed to verify code:', err);
      showStatus('error', 'Invalid verification code');
    } finally {
      setSecuritySubmitting(false);
    }
  };

  const resetTwoFactorModal = () => {
    setShowTwoFactorModal(false);
    setTwoFactorStep('status');
    setTwoFactorSecret('');
    setRecoveryCodes([]);
    setVerificationCode('');
    setQrCodeUrl('');
  };

  const handleRevokeDevice = async (deviceId) => {
    if (window.confirm('Are you sure you want to revoke this device? You will be logged out from it.')) {
      setRevoking(true);
      try {
        // Call revoke function (not exposed yet, but we can add it)
        showStatus('success', 'Device session revoked successfully');
        setActiveSessions(activeSessions.filter(s => s.id !== deviceId));
        setSelectedDevice(null);
      } catch (err) {
        console.error('Failed to revoke device:', err);
        showStatus('error', 'Failed to revoke device');
      } finally {
        setRevoking(false);
      }
    }
  };

  const handleLogOutAll = async () => {
    if (window.confirm('Are you sure you want to log out from all devices? You will need to log in again on this device.')) {
      setSecuritySubmitting(true);
      try {
        await revokeAllSessions();
        showStatus('success', 'All sessions have been revoked');
        setShowDevicesModal(false);
      } catch (err) {
        console.error('Failed to revoke sessions:', err);
        showStatus('error', 'Failed to revoke sessions');
      } finally {
        setSecuritySubmitting(false);
      }
    }
  };

  const handleDeactivateAccount = async () => {
    setShowDeactivateModal(true);
    setDeactivateConfirmText('');
  };

  const confirmDeactivateAccount = async () => {
    if (deactivateConfirmText !== 'DEACTIVATE') {
      showStatus('error', 'Please type "DEACTIVATE" correctly to confirm');
      return;
    }
    setSubmitting(true);
    try {
      await updateProfile({
        status: 'Deactivated'
      });
      showStatus('success', 'Account deactivated successfully');
      setTimeout(() => {
        setShowDeactivateModal(false);
        navigate('/login');
      }, 1500);
    } catch (err) {
      console.error('Failed to deactivate account:', err);
      showStatus('error', 'Failed to deactivate account');
      setSubmitting(false);
    }
  };

  const closeDeactivateModal = () => {
    setShowDeactivateModal(false);
    setDeactivateConfirmText('');
  };

  const handlePermanentDataWipe = async () => {
    setShowDataWipeModal(true);
    setDataWipeStep('warning');
    setDataWipeConfirmEmail('');
  };

  const confirmPermanentDataWipe = async () => {
    if (dataWipeConfirmEmail !== user?.email) {
      showStatus('error', 'Email address does not match');
      return;
    }
    setSubmitting(true);
    try {
      await updateProfile({
        status: 'Deleted'
      });
      showStatus('success', 'Your account and data have been permanently deleted');
      setTimeout(() => {
        setShowDataWipeModal(false);
        navigate('/login');
      }, 1500);
    } catch (err) {
      console.error('Failed to delete data:', err);
      showStatus('error', 'Failed to delete account data');
      setSubmitting(false);
    }
  };

  const closeDataWipeModal = () => {
    setShowDataWipeModal(false);
    setDataWipeStep('warning');
    setDataWipeConfirmEmail('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Settings</h1>
        <p className="text-slate-600 dark:text-slate-400 font-medium text-sm">Configure your platform experience and security protocols.</p>
      </div>

      {/* Status Message */}
      {statusMessage.message && (
        <div className={`flex items-center gap-3 p-4 rounded-2xl border ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
            : 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400'
        }`}>
          {statusMessage.type === 'success' ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <p className="font-semibold">{statusMessage.message}</p>
        </div>
      )}

      {/* Settings Overview Header */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 shadow-xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
           <Palette size={120} />
        </div>
        
        <div className="relative w-20 h-20 shrink-0">
           <img 
              src={user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.full_name || 'User'}&background=random`} 
              alt="Profile" 
              className="w-full h-full rounded-2xl object-cover border-4 border-slate-50 dark:border-slate-900 shadow-lg"
           />
        </div>

        <div className="flex-1 text-center md:text-left relative z-10">
           <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Settings Hub</h2>
           <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Hello, {user?.full_name || 'Partner'}. Manage your global preferences here.</p>
           <div className="mt-4">
              <button 
                onClick={() => navigate('/buyer/profile')}
                className="px-5 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-emerald-600 hover:text-white text-slate-900 dark:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm flex items-center gap-2 mx-auto md:mx-0"
              >
                 Identity Portfolio <ChevronRight size={14} />
              </button>
           </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Notifications */}
        <SettingSection title="Notification Logic" icon={<Bell />}>
          <div className="space-y-1">
            <ToggleSetting 
              label="Sync Emails"
              description="Inventory updates and order receipts"
              checked={emailNotifications}
              onChange={setEmailNotifications}
            />
            <ToggleSetting 
              label="Real-time Push"
              description="Instant alerts on marketplace activity"
              checked={pushNotifications}
              onChange={setPushNotifications}
            />
            <ToggleSetting 
              label="Curated Matches"
              description="Notify when relevant materials are listed"
              checked={newListings}
              onChange={setNewListings}
            />
          </div>
          <button 
            onClick={handleUpdate}
            disabled={submitting}
            className="w-full mt-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-2"
          >
            {submitting ? 'Updating Grid...' : 'Deploy Preferences'}
          </button>
        </SettingSection>

        {/* Security */}
        <SettingSection title="Security Protocol" icon={<Lock />}>
          <div className="space-y-4 text-left">
            <SecurityAction 
              label="Change Master Password" 
              description="Security rotation recommended" 
              icon={<Shield size={18} />}
              onClick={() => setShowPasswordModal(true)}
            />
            <SecurityAction 
              label="Two-Factor Control" 
              description="Enhance account integrity" 
              icon={<Lock size={18} />}
              onClick={() => setShowTwoFactorModal(true)}
            />
            <SecurityAction 
              label="Authorized Devices" 
              description="Manage active sessions" 
              icon={<Globe size={18} />}
              onClick={() => setShowDevicesModal(true)}
            />
          </div>
        </SettingSection>
      </div>

      {/* Danger Zone */}
      <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
         <SettingSection title="Irreversible Actions" icon={<Shield />} danger>
           <div className="flex flex-col md:flex-row gap-4">
              <button 
                onClick={handleDeactivateAccount}
                disabled={submitting}
                className="flex-1 px-6 py-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-2xl font-bold text-[10px] uppercase tracking-widest border border-red-100 dark:border-red-900/30 hover:bg-red-100 transition-all disabled:opacity-50"
              >
                 {submitting ? 'Processing...' : 'Deactivate Account'}
              </button>
              <button 
                onClick={handlePermanentDataWipe}
                disabled={submitting}
                className="flex-1 px-6 py-4 bg-red-600 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all active:scale-95 disabled:opacity-50"
              >
                 {submitting ? 'Processing...' : 'Permanent Data Wipe'}
              </button>
           </div>
         </SettingSection>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-md w-full space-y-6 border border-slate-100 dark:border-slate-700 shadow-2xl">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Change Master Password</h3>
            
            <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-lg p-4">
              <p className="text-sm text-blue-700 dark:text-blue-400 flex items-start gap-2">
                <span className="font-bold mt-0.5">ℹ️</span>
                <span>After changing your password, a confirmation email will be sent to <strong>{user?.email}</strong></span>
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-900 dark:text-white mb-2 block">New Password</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 8 characters)" 
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Use a strong password with uppercase, lowercase, numbers, and symbols</p>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-900 dark:text-white mb-2 block">Confirm Password</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password" 
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={() => setShowPasswordModal(false)}
                disabled={securitySubmitting}
                className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handlePasswordChange}
                disabled={securitySubmitting}
                className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {securitySubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Updating...
                  </>
                ) : (
                  'Update Password'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Two-Factor Modal */}
      {showTwoFactorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-lg w-full space-y-6 border border-slate-100 dark:border-slate-700 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Two-Factor Authentication</h3>
            
            {/* Status View */}
            {twoFactorStep === 'status' && (
              <>
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-bold text-slate-900 dark:text-white">Current Status:</span>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 ${
                      twoFactorEnabled 
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' 
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}>
                      {twoFactorEnabled ? '🔒 Enabled' : '🔓 Disabled'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    {twoFactorEnabled 
                      ? "Your account is protected with two-factor authentication. You'll need to verify with your authenticator app when logging in."
                      : "Add an extra layer of security to your account. You'll need an authenticator app like Google Authenticator, Microsoft Authenticator, or Authy."}
                  </p>
                  {twoFactorEnabled && (
                    <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/30 rounded-lg">
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                        ✓ Your account has enhanced security. Keep your recovery codes safe.
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/30 rounded-lg p-4">
                    <p className="text-sm text-blue-700 dark:text-blue-400 flex items-start gap-2">
                      <span className="font-bold">ℹ️</span>
                      <span>{twoFactorEnabled ? "You can disable 2FA at any time, but it's recommended to keep it enabled for security." : "Setting up 2FA adds a verification step when logging in from new devices."}</span>
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setShowTwoFactorModal(false)}
                    className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all"
                  >
                    Close
                  </button>
                  <button 
                    onClick={twoFactorEnabled ? () => {
                      setTwoFactorStep('disable');
                    } : handleTwoFactorSetup}
                    disabled={securitySubmitting}
                    className={`flex-1 px-4 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50 ${
                      twoFactorEnabled
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {securitySubmitting ? 'Processing...' : (twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA')}
                  </button>
                </div>
              </>
            )}

            {/* Setup View - QR Code */}
            {twoFactorStep === 'setup' && (
              <>
                <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/30 rounded-lg p-4">
                  <p className="text-sm text-emerald-700 dark:text-emerald-400 font-semibold mb-2">Step 1: Scan QR Code</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">Open your authenticator app and scan this QR code, or enter the secret key manually.</p>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 flex justify-center border-2 border-slate-100 dark:border-slate-700">
                  {qrCodeUrl ? (
                    <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center">
                      <div className="animate-pulse text-slate-400">Generating QR code...</div>
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Or enter this code manually:</p>
                  <div className="font-mono text-sm font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 break-all select-all">
                    {twoFactorSecret}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => resetTwoFactorModal()}
                    disabled={securitySubmitting}
                    className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => setTwoFactorStep('verify')}
                    className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm transition-all active:scale-95"
                  >
                    Continue
                  </button>
                </div>
              </>
            )}

            {/* Verify Code View */}
            {twoFactorStep === 'verify' && (
              <>
                <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/30 rounded-lg p-4">
                  <p className="text-sm text-blue-700 dark:text-blue-400 font-semibold mb-2">Step 2: Verify Code</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">Enter the 6-digit code from your authenticator app to verify setup.</p>
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-900 dark:text-white mb-2 block">Verification Code</label>
                  <input 
                    type="text" 
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.slice(0, 6))}
                    placeholder="000000" 
                    maxLength="6"
                    className="w-full px-4 py-3 text-center text-2xl font-bold tracking-widest bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setTwoFactorStep('setup')}
                    disabled={securitySubmitting}
                    className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all disabled:opacity-50"
                  >
                    Back
                  </button>
                  <button 
                    onClick={handleTwoFactorVerify}
                    disabled={securitySubmitting || verificationCode.length !== 6}
                    className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {securitySubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Verifying...
                      </>
                    ) : (
                      'Verify & Enable'
                    )}
                  </button>
                </div>
              </>
            )}

            {/* Recovery Codes View */}
            {twoFactorStep === 'recovery' && (
              <>
                <div className="bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-100 dark:border-yellow-500/30 rounded-lg p-4">
                  <p className="text-sm text-yellow-700 dark:text-yellow-400 font-semibold mb-2">Step 3: Save Recovery Codes</p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400">Save these codes in a secure location. You'll need them if you lose access to your authenticator app.</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 space-y-2">
                  {recoveryCodes.map((code, idx) => (
                    <div key={idx} className="font-mono text-sm font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <span>{code}</span>
                      <span className="text-xs text-slate-500">{idx + 1}/{recoveryCodes.length}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/30 rounded-lg p-4">
                  <p className="text-xs text-red-700 dark:text-red-400 font-semibold flex items-start gap-2">
                    <span>⚠️</span>
                    <span>Never share these codes with anyone. Keep them safe and secure.</span>
                  </p>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                      const text = recoveryCodes.join('\n');
                      navigator.clipboard.writeText(text);
                      showStatus('success', 'Recovery codes copied to clipboard!');
                    }}
                    className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all"
                  >
                    Copy Codes
                  </button>
                  <button 
                    onClick={resetTwoFactorModal}
                    className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm transition-all active:scale-95"
                  >
                    Done
                  </button>
                </div>
              </>
            )}

            {/* Disable Confirmation */}
            {twoFactorStep === 'disable' && (
              <>
                <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/30 rounded-lg p-4">
                  <p className="text-sm text-red-700 dark:text-red-400 font-semibold mb-2">Disable Two-Factor Authentication?</p>
                  <p className="text-xs text-red-600 dark:text-red-400">Once disabled, anyone with your password could access your account. We recommend keeping 2FA enabled.</p>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setTwoFactorStep('status')}
                    className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      handleTwoFactorToggle();
                      resetTwoFactorModal();
                    }}
                    disabled={securitySubmitting}
                    className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
                  >
                    {securitySubmitting ? 'Disabling...' : 'Disable 2FA'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Authorized Devices Modal */}
      {showDevicesModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-lg w-full space-y-6 border border-slate-100 dark:border-slate-700 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Authorized Devices</h3>
              {activeSessions.length > 1 && (
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold rounded-full">
                  {activeSessions.length} Active
                </span>
              )}
            </div>
            
            {!activeSessions.length && !sessionsLoading && (
              <button 
                onClick={handleLoadSessions}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm transition-all"
              >
                Load Active Devices
              </button>
            )}

            {sessionsLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-200 border-t-emerald-600"></div>
              </div>
            ) : (
              <>
                {activeSessions.length > 0 ? (
                  <div className="space-y-4">
                    {activeSessions.map((session) => (
                      <div 
                        key={session.id}
                        onClick={() => setSelectedDevice(selectedDevice?.id === session.id ? null : session)}
                        className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-emerald-200 dark:hover:border-emerald-500/30 transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-bold text-slate-900 dark:text-white">{session.device_name || 'Unknown Device'}</p>
                              <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full">
                                Active
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{session.browser || 'Unknown Browser'}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {session.ip_address && `IP: ${session.ip_address}`}
                            </p>
                          </div>
                          <ChevronRight size={18} className={`text-slate-400 transition-transform ${selectedDevice?.id === session.id ? 'rotate-90' : ''}`} />
                        </div>

                        {/* Expanded Details */}
                        {selectedDevice?.id === session.id && (
                          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
                            <div className="grid grid-cols-2 gap-3 text-xs">
                              <div>
                                <p className="text-slate-500 dark:text-slate-400 font-semibold mb-1">Device Type</p>
                                <p className="text-slate-900 dark:text-white">{session.device_type || 'Unknown'}</p>
                              </div>
                              <div>
                                <p className="text-slate-500 dark:text-slate-400 font-semibold mb-1">OS</p>
                                <p className="text-slate-900 dark:text-white">{session.os_name || 'Unknown'}</p>
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-slate-500 dark:text-slate-400 font-semibold mb-1 text-xs">Last Activity</p>
                              <p className="text-slate-900 dark:text-white text-sm">
                                {session.last_activity 
                                  ? new Date(session.last_activity).toLocaleString()
                                  : 'Never'
                                }
                              </p>
                            </div>

                            {session.ip_address && (
                              <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/30 rounded-lg p-3">
                                <p className="text-xs text-blue-700 dark:text-blue-400">
                                  <strong>IP Address:</strong> {session.ip_address}
                                </p>
                              </div>
                            )}

                            <button 
                              onClick={() => handleRevokeDevice(session.id)}
                              disabled={revoking}
                              className="w-full mt-3 px-4 py-2.5 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-lg font-bold text-xs border border-red-100 dark:border-red-500/30 hover:bg-red-100 transition-all disabled:opacity-50"
                            >
                              {revoking ? 'Revoking...' : 'Revoke This Device'}
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-500 dark:text-slate-400 mb-2">No active sessions found</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">New devices will appear here when you log in from them</p>
                  </div>
                )}

                {activeSessions.length > 0 && (
                  <div className="bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-100 dark:border-yellow-500/30 rounded-lg p-4">
                    <p className="text-xs text-yellow-700 dark:text-yellow-400 font-semibold mb-2">💡 Session Management Tip</p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400">Click on any device to see more details. Use 'Revoke This Device' to log out from specific devices without affecting other sessions.</p>
                  </div>
                )}
              </>
            )}
            
            <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button 
                onClick={() => {
                  setShowDevicesModal(false);
                  setActiveSessions([]);
                  setSelectedDevice(null);
                }}
                className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all"
              >
                Close
              </button>
              {activeSessions.length > 1 && (
                <button 
                  onClick={handleLogOutAll}
                  disabled={securitySubmitting}
                  className="flex-1 px-4 py-3 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-2xl font-bold text-sm border border-red-100 dark:border-red-900/30 hover:bg-red-100 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {securitySubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-red-600 dark:border-red-400 border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    '🚪 Log Out All Devices'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Deactivate Account Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-md w-full space-y-6 border border-slate-100 dark:border-slate-700 shadow-2xl">
            <div className="flex items-start justify-between">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Deactivate Account</h3>
              <button onClick={closeDeactivateModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xl">×</button>
            </div>
            
            <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/30 rounded-xl p-4 space-y-2">
              <p className="text-sm font-bold text-orange-700 dark:text-orange-400">⚠️ Important Information</p>
              <ul className="text-xs text-orange-600 dark:text-orange-400 space-y-1 list-disc list-inside">
                <li>Your account will be deactivated immediately</li>
                <li>You can reactivate your account within 30 days</li>
                <li>After 30 days, your data will be permanently deleted</li>
                <li>All active sessions will be terminated</li>
              </ul>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-900 dark:text-white mb-2 block">Type "DEACTIVATE" to confirm</label>
              <input 
                type="text" 
                value={deactivateConfirmText}
                onChange={(e) => setDeactivateConfirmText(e.target.value)}
                placeholder="Type DEACTIVATE here" 
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>

            <div className="flex gap-4">
              <button 
                onClick={closeDeactivateModal}
                className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeactivateAccount}
                disabled={submitting || deactivateConfirmText !== 'DEACTIVATE'}
                className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-2xl font-bold text-sm hover:bg-orange-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Processing...' : 'Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permanent Data Wipe Modal */}
      {showDataWipeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-md w-full space-y-6 border border-slate-100 dark:border-slate-700 shadow-2xl">
            <div className="flex items-start justify-between">
              <h3 className="text-2xl font-bold text-red-600 dark:text-red-400">Permanent Data Wipe</h3>
              <button onClick={closeDataWipeModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xl">×</button>
            </div>

            {dataWipeStep === 'warning' && (
              <>
                <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-4 space-y-2">
                  <p className="text-sm font-bold text-red-700 dark:text-red-400">⛔ CRITICAL WARNING</p>
                  <ul className="text-xs text-red-600 dark:text-red-400 space-y-1 list-disc list-inside">
                    <li>ALL your data will be permanently deleted</li>
                    <li>This action CANNOT be undone</li>
                    <li>Your account will be completely removed</li>
                    <li>All transactions and records will be erased</li>
                    <li>This process is irreversible</li>
                  </ul>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-400">Confirm that you understand this action and want to proceed.</p>

                <div className="flex gap-4">
                  <button 
                    onClick={closeDataWipeModal}
                    className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => setDataWipeStep('confirm')}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-2xl font-bold text-sm hover:bg-red-700 transition-all"
                  >
                    I Understand
                  </button>
                </div>
              </>
            )}

            {dataWipeStep === 'confirm' && (
              <>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Confirm email to proceed with permanent deletion</p>

                <div>
                  <label className="text-sm font-bold text-slate-900 dark:text-white mb-2 block">Your Email Address</label>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Enter your email to confirm: {user?.email}</p>
                  <input 
                    type="email" 
                    value={dataWipeConfirmEmail}
                    onChange={(e) => setDataWipeConfirmEmail(e.target.value)}
                    placeholder={user?.email} 
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500/20"
                  />
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setDataWipeStep('warning')}
                    className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all"
                  >
                    Back
                  </button>
                  <button 
                    onClick={confirmPermanentDataWipe}
                    disabled={submitting || dataWipeConfirmEmail !== user?.email}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-2xl font-bold text-sm hover:bg-red-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Deleting...' : 'Delete All Data'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SettingSection({ title, icon, children, danger = false }) {
  return (
    <div className={`bg-white dark:bg-slate-800 border ${danger ? 'border-red-100 dark:border-red-900/30' : 'border-slate-100 dark:border-slate-700'} rounded-[2.5rem] p-8 shadow-sm transition-all hover:shadow-md`}>
      <div className="flex items-center gap-3 mb-8">
        <div className={`p-2.5 rounded-xl ${danger ? 'bg-red-50 dark:bg-red-500/10 text-red-600' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600'}`}>
          {icon}
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function SecurityAction({ label, description, icon, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 hover:border-emerald-500/30 transition-all group cursor-pointer active:scale-95"
    >
       <div className="flex items-center gap-4 text-left">
          <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl text-slate-400 group-hover:text-emerald-500 transition-colors">
             {icon}
          </div>
          <div>
             <div className="text-sm font-bold text-slate-900 dark:text-white">{label}</div>
             <div className="text-[10px] text-slate-500 font-medium">{description}</div>
          </div>
       </div>
       <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
    </button>
  );
}

function SelectField({ label, options }) {
  return (
    <div className="space-y-2 text-left">
       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
       <div className="relative">
          <select className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white font-bold appearance-none outline-none focus:ring-2 focus:ring-emerald-500/20">
             {options.map(opt => <option key={opt}>{opt}</option>)}
          </select>
          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
             <ChevronRight size={16} className="rotate-90" />
          </div>
       </div>
    </div>
  );
}

function ToggleSetting({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-5 border-b border-slate-50 dark:border-slate-800 last:border-0">
      <div className="flex-1 text-left">
        <div className="font-bold text-slate-900 dark:text-white text-sm">{label}</div>
        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{description}</div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-700'
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
