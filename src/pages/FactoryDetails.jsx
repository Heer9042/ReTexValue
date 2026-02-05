import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Building2, MapPin, Phone, FileText, Users, Factory, Loader2, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function FactoryDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, email, fullName } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    companyName: '',
    gstNumber: '',
    companyType: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    capacity: '',
    description: '',
    wasteTypes: [],
    certifications: []
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleWasteTypeChange = (wasteType) => {
    setFormData(prev => ({
      ...prev,
      wasteTypes: prev.wasteTypes.includes(wasteType)
        ? prev.wasteTypes.filter(type => type !== wasteType)
        : [...prev.wasteTypes, wasteType]
    }));
  };

  const handleCertificationChange = (cert) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.includes(cert)
        ? prev.certifications.filter(c => c !== cert)
        : [...prev.certifications, cert]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!formData.companyName.trim()) {
      setError("Company name is required");
      setLoading(false);
      return;
    }
    if (!formData.gstNumber.trim()) {
      setError("GST number is required");
      setLoading(false);
      return;
    }
    if (!formData.companyType) {
      setError("Company type is required");
      setLoading(false);
      return;
    }
    if (!formData.address.trim()) {
      setError("Address is required");
      setLoading(false);
      return;
    }
    if (!formData.city.trim()) {
      setError("City is required");
      setLoading(false);
      return;
    }
    if (!formData.state.trim()) {
      setError("State is required");
      setLoading(false);
      return;
    }
    if (!formData.pincode.trim()) {
      setError("Pincode is required");
      setLoading(false);
      return;
    }
    if (!formData.capacity) {
      setError("Monthly capacity is required");
      setLoading(false);
      return;
    }
    if (formData.wasteTypes.length === 0) {
      setError("Please select at least one waste type");
      setLoading(false);
      return;
    }

    try {
      console.log("Submitting factory details for user:", userId);

      // Update profile with factory details
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          company_name: formData.companyName,
          gst: formData.gstNumber,
          company_type: formData.companyType,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          capacity: parseInt(formData.capacity),
          description: formData.description,
          waste_types: formData.wasteTypes,
          certifications: formData.certifications,
          factory_registration_date: new Date().toISOString(),
          status: 'Factory Pending'
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      // Insert factory registration request
      const { error: factoryError } = await supabase
        .from('factory_registrations')
        .insert({
          user_id: userId,
          company_name: formData.companyName,
          gst_number: formData.gstNumber,
          company_type: formData.companyType,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          capacity: parseInt(formData.capacity),
          description: formData.description,
          waste_types: formData.wasteTypes,
          certifications: formData.certifications,
          status: 'pending',
          submitted_at: new Date().toISOString()
        });

      if (factoryError) throw factoryError;

      console.log("Factory registration submitted successfully");
      navigate('/register/factory-pending');

    } catch (err) {
      console.error("Factory registration error:", err);
      setError(err.message || "Failed to submit factory registration");
    } finally {
      setLoading(false);
    }
  };

  if (!userId) {
    navigate('/register');
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white pt-24 pb-10">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-700 p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Factory className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Factory Registration</h2>
              <p className="text-slate-500 dark:text-slate-400">
                Complete your factory details for admin approval
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-200 dark:border-red-800">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Company Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Company Name *</label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      placeholder="Enter company name"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">GST Number *</label>
                    <input
                      type="text"
                      name="gstNumber"
                      value={formData.gstNumber}
                      onChange={handleChange}
                      placeholder="22AAAAA0000A1Z5"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Company Type *</label>
                  <select
                    name="companyType"
                    value={formData.companyType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    required
                  >
                    <option value="">Select company type</option>
                    <option value="Private Limited">Private Limited</option>
                    <option value="Public Limited">Public Limited</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Proprietorship">Proprietorship</option>
                    <option value="LLP">LLP</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Address Information
                </h3>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Address *</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter complete address"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="City"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">State *</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="State"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Pincode *</label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="110001"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Business Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Factory className="w-5 h-5" />
                  Business Information
                </h3>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Monthly Production Capacity (kg) *</label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    placeholder="10000"
                    min="1"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Business Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your textile waste production process..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Waste Types Produced *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Cotton', 'Polyester', 'Silk', 'Wool', 'Blended', 'Synthetic'].map(type => (
                      <label key={type} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.wasteTypes.includes(type)}
                          onChange={() => handleWasteTypeChange(type)}
                          className="w-4 h-4 text-emerald-600 bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-600 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Certifications (Optional)</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['ISO 9001', 'ISO 14001', 'GOTS', 'Fair Trade', 'OEKO-TEX', 'Other'].map(cert => (
                      <label key={cert} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.certifications.includes(cert)}
                          onChange={() => handleCertificationChange(cert)}
                          className="w-4 h-4 text-emerald-600 bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-600 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300">{cert}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting Registration...
                  </>
                ) : (
                  <>
                    Submit Factory Registration <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}