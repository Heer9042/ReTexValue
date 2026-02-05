import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import { Building2, CheckCircle, XCircle, Eye, MapPin, Phone, FileText, Users, Factory, Loader2 } from 'lucide-react';

export default function ManageFactoryRegistrations() {
  const { users } = useApp();
  const [factoryRegistrations, setFactoryRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchFactoryRegistrations();
  }, []);

  const fetchFactoryRegistrations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('factory_registrations')
        .select('*')
        .eq('status', 'pending')
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setFactoryRegistrations(data || []);
    } catch (error) {
      console.error('Error fetching factory registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (registrationId, userId, action) => {
    try {
      setActionLoading(registrationId);

      // First, fetch the factory registration data
      const { data: registration, error: fetchError } = await supabase
        .from('factory_registrations')
        .select('*')
        .eq('id', registrationId)
        .single();

      if (fetchError) throw fetchError;

      // Update factory registration status
      const { error: regError } = await supabase
        .from('factory_registrations')
        .update({
          status: action,
          reviewed_at: new Date().toISOString(),
          reviewed_by: users.find(u => u.role === 'admin')?.id
        })
        .eq('id', registrationId);

      if (regError) throw regError;

      // Update user profile with factory data if approved
      const profileUpdate = action === 'approved' ? {
        role: 'factory',
        status: 'Verified',
        factory_approved_at: new Date().toISOString(),
        // Copy all factory registration data to profile
        company_name: registration.company_name,
        gst: registration.gst_number,
        company_type: registration.company_type,
        capacity: registration.capacity,
        address: registration.address,
        city: registration.city,
        state: registration.state,
        pincode: registration.pincode,
        location: `${registration.city}, ${registration.state} - ${registration.pincode}`, // Combined location
        waste_types: registration.waste_types,
        certifications: registration.certifications,
        description: registration.description,
        type: 'factory' // Update type field as well
      } : {
        role: 'buyer',
        status: 'Rejected',
        factory_approved_at: null
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', userId);

      if (profileError) throw profileError;

      // Refresh data
      await fetchFactoryRegistrations();

      alert(`Factory registration ${action} successfully!`);
    } catch (error) {
      console.error('Error updating factory registration:', error);
      alert('Failed to update registration status');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Factory Registrations</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm sm:text-base">
            Review and approve factory registration requests
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{factoryRegistrations.length}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Pending Approvals</p>
        </div>
      </div>

      {/* Factory Registration Details Modal */}
      {selectedRegistration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Factory Registration Details</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Submitted on {new Date(selectedRegistration.submitted_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedRegistration(null)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <XCircle size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Company Name</label>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white mt-1">{selectedRegistration.company_name}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400">GST Number</label>
                    <p className="text-slate-700 dark:text-slate-300 mt-1 font-mono">{selectedRegistration.gst_number}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Company Type</label>
                    <p className="text-slate-700 dark:text-slate-300 mt-1">{selectedRegistration.company_type}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Monthly Capacity</label>
                    <p className="text-slate-700 dark:text-slate-300 mt-1">{selectedRegistration.capacity} kg</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Address</label>
                    <p className="text-slate-700 dark:text-slate-300 mt-1">
                      {selectedRegistration.address}<br />
                      {selectedRegistration.city}, {selectedRegistration.state} - {selectedRegistration.pincode}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Waste Types</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedRegistration.waste_types?.map(type => (
                        <span key={type} className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 text-xs rounded-full">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>

                  {selectedRegistration.certifications?.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Certifications</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedRegistration.certifications.map(cert => (
                          <span key={cert} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedRegistration.description && (
                <div>
                  <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Business Description</label>
                  <div className="mt-2 p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                    <p className="text-slate-700 dark:text-slate-300">{selectedRegistration.description}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => handleApproval(selectedRegistration.id, selectedRegistration.user_id, 'rejected')}
                disabled={actionLoading === selectedRegistration.id}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-70"
              >
                {actionLoading === selectedRegistration.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle size={16} />}
                Reject
              </button>
              <button
                onClick={() => handleApproval(selectedRegistration.id, selectedRegistration.user_id, 'approved')}
                disabled={actionLoading === selectedRegistration.id}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-70"
              >
                {actionLoading === selectedRegistration.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle size={16} />}
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Registrations Table */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm dark:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold tracking-wider">
                <th className="p-5">Company</th>
                <th className="p-5">Location</th>
                <th className="p-5">Capacity</th>
                <th className="p-5">Waste Types</th>
                <th className="p-5">Submitted</th>
                <th className="p-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
              {factoryRegistrations.map((reg) => (
                <tr key={reg.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                  <td className="p-5">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{reg.company_name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{reg.gst_number}</p>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-slate-400" />
                      <span className="text-slate-700 dark:text-slate-300">{reg.city}, {reg.state}</span>
                    </div>
                  </td>
                  <td className="p-5 font-medium text-slate-900 dark:text-white">
                    {reg.capacity} kg/month
                  </td>
                  <td className="p-5">
                    <div className="flex flex-wrap gap-1">
                      {reg.waste_types?.slice(0, 2).map(type => (
                        <span key={type} className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 text-xs rounded-full">
                          {type}
                        </span>
                      ))}
                      {reg.waste_types?.length > 2 && (
                        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs rounded-full">
                          +{reg.waste_types.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-5 text-slate-500 dark:text-slate-400">
                    {new Date(reg.submitted_at).toLocaleDateString()}
                  </td>
                  <td className="p-5">
                    <button
                      onClick={() => setSelectedRegistration(reg)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm flex items-center gap-1"
                    >
                      <Eye size={14} />
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {factoryRegistrations.length === 0 && (
        <div className="py-20 text-center animate-in fade-in">
          <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-300">
            <Building2 size={40} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">No Pending Registrations</h3>
          <p className="text-slate-500 mt-2 font-medium">All factory registration requests have been processed.</p>
        </div>
      )}
    </div>
  );
}