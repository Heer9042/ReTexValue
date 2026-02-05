import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Package, Plus, Edit2, Trash2, Check, X, Star, DollarSign, Calendar, Zap, Shield, TrendingUp } from 'lucide-react';

const BADGE_COLORS = {
  slate: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  rose: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
};

export default function ManagePackages() {
  const { packages, addPackage, updatePackage, deletePackage, fetchPackages } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // Fetch packages on mount (only once)
  useEffect(() => {
    const loadPackages = async () => {
      try {
        setPageLoading(true);
        await fetchPackages();
      } catch (error) {
        console.error('Failed to load packages:', error);
      } finally {
        setPageLoading(false);
      }
    };
    loadPackages();
  }, []); // ✅ Empty dependency array - fetch only once on mount

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    durationDays: '30',
    maxListings: '',
    maxBulkRequests: '',
    prioritySupport: false,
    aiCredits: '',
    badgeColor: 'blue',
    isFeatured: false,
    status: 'active',
    features: ['']
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      durationDays: '30',
      maxListings: '',
      maxBulkRequests: '',
      prioritySupport: false,
      aiCredits: '',
      badgeColor: 'blue',
      isFeatured: false,
      status: 'active',
      features: ['']
    });
    setEditingPackage(null);
  };

  const handleEdit = (pkg) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description,
      price: pkg.price,
      durationDays: pkg.durationDays,
      maxListings: pkg.maxListings,
      maxBulkRequests: pkg.maxBulkRequests,
      prioritySupport: pkg.prioritySupport,
      aiCredits: pkg.aiCredits,
      badgeColor: pkg.badgeColor,
      isFeatured: pkg.isFeatured,
      status: pkg.status,
      features: pkg.features.length > 0 ? pkg.features : ['']
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const packageData = {
        ...formData,
        price: parseFloat(formData.price),
        durationDays: parseInt(formData.durationDays),
        maxListings: parseInt(formData.maxListings),
        maxBulkRequests: parseInt(formData.maxBulkRequests),
        aiCredits: parseInt(formData.aiCredits),
        features: formData.features.filter(f => f.trim() !== '')
      };

      if (editingPackage) {
        await updatePackage(editingPackage.id, packageData);
      } else {
        await addPackage(packageData);
      }

      setShowModal(false);
      resetForm();
    } catch (error) {
      alert('Failed to save package: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deletePackage(id);
    } catch (error) {
      alert('Failed to delete package: ' + error.message);
    }
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  const updateFeature = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const removeFeature = (index) => {
    setFormData({ ...formData, features: formData.features.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-700 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-sm">
            <Package size={24} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Manage Packages</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm sm:text-base">Create and manage subscription plans</p>
          </div>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
        >
          <Plus size={20} /> Add Package
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.filter(p => p.status === 'active').map((pkg) => (
          <PackageCard 
            key={pkg.id} 
            pkg={pkg} 
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {packages.filter(p => p.status === 'active').length === 0 && (
        <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
          <Package className="w-16 h-16 mx-auto text-slate-400 dark:text-slate-600 mb-4" />
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No Packages Yet</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Create your first package to get started</p>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-lg transition-all"
          >
            Create Package
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-8 py-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {editingPackage ? 'Edit Package' : 'Create New Package'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">
                <X size={24} className="text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <InputGroup label="Package Name" required>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="e.g., Professional"
                    required
                  />
                </InputGroup>

                <InputGroup label="Price (₹)" required>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="999"
                    required
                  />
                </InputGroup>

                <InputGroup label="Duration (Days)" required>
                  <input
                    type="number"
                    value={formData.durationDays}
                    onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="30"
                    required
                  />
                </InputGroup>

                <InputGroup label="Badge Color" required>
                  <select
                    value={formData.badgeColor}
                    onChange={(e) => setFormData({ ...formData, badgeColor: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none appearance-none cursor-pointer"
                  >
                    {Object.keys(BADGE_COLORS).map(color => (
                      <option key={color} value={color}>{color.charAt(0).toUpperCase() + color.slice(1)}</option>
                    ))}
                  </select>
                </InputGroup>

                <InputGroup label="Max Listings" required>
                  <input
                    type="number"
                    value={formData.maxListings}
                    onChange={(e) => setFormData({ ...formData, maxListings: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="50"
                    required
                  />
                </InputGroup>

                <InputGroup label="Max Bulk Requests" required>
                  <input
                    type="number"
                    value={formData.maxBulkRequests}
                    onChange={(e) => setFormData({ ...formData, maxBulkRequests: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="10"
                    required
                  />
                </InputGroup>

                <InputGroup label="AI Credits" required>
                  <input
                    type="number"
                    value={formData.aiCredits}
                    onChange={(e) => setFormData({ ...formData, aiCredits: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="100"
                    required
                  />
                </InputGroup>

                <InputGroup label="Status" required>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none appearance-none cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </InputGroup>
              </div>

              <InputGroup label="Description">
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                  rows="3"
                  placeholder="Brief description of the package"
                />
              </InputGroup>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.prioritySupport}
                    onChange={(e) => setFormData({ ...formData, prioritySupport: e.target.checked })}
                    className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Priority Support</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Featured Package</span>
                </label>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Features</label>
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="Feature description"
                    />
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="px-4 py-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addFeature}
                  className="w-full px-4 py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 hover:border-emerald-500 hover:text-emerald-500 transition-colors font-medium"
                >
                  + Add Feature
                </button>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? 'Saving...' : (editingPackage ? 'Update Package' : 'Create Package')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function PackageCard({ pkg, onEdit, onDelete }) {
  const badgeClass = BADGE_COLORS[pkg.badgeColor] || BADGE_COLORS.blue;

  return (
    <div className={`relative bg-white dark:bg-slate-800 border-2 ${pkg.isFeatured ? 'border-amber-400 dark:border-amber-600' : 'border-slate-200 dark:border-slate-700'} rounded-2xl p-6 hover:shadow-xl transition-all`}>
      {pkg.isFeatured && (
        <div className="absolute -top-3 -right-3 bg-amber-400 text-amber-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
          <Star size={14} fill="currentColor" /> FEATURED
        </div>
      )}

      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${badgeClass} text-xs font-bold mb-4`}>
        <Package size={14} /> {pkg.name}
      </div>

      <div className="mb-4">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-black text-slate-900 dark:text-white">₹{pkg.price}</span>
          <span className="text-slate-500 dark:text-slate-400 text-sm">/{pkg.durationDays} days</span>
        </div>
        <p className="text-slate-600 dark:text-slate-400 text-sm">{pkg.description}</p>
      </div>

      <div className="space-y-2 mb-6">
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
          <TrendingUp size={14} className="text-emerald-500" />
          <span>{pkg.maxListings === 999999 ? 'Unlimited' : pkg.maxListings} Listings</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
          <Zap size={14} className="text-blue-500" />
          <span>{pkg.aiCredits === 999999 ? 'Unlimited' : pkg.aiCredits} AI Credits</span>
        </div>
        {pkg.prioritySupport && (
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <Shield size={14} className="text-purple-500" />
            <span>Priority Support</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onEdit(pkg)}
          className="flex-1 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl font-semibold hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors flex items-center justify-center gap-2"
        >
          <Edit2 size={16} /> Edit
        </button>
        <button
          onClick={() => onDelete(pkg.id)}
          className="flex-1 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl font-semibold hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center justify-center gap-2"
        >
          <Trash2 size={16} /> Delete
        </button>
      </div>
    </div>
  );
}

function InputGroup({ label, required, children }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
