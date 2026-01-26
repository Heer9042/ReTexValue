import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { classifyImage } from '../../lib/ai';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, Check, AlertCircle, Loader2, Image as ImageIcon, Scale, Tag, MapPin, Building, Mail, X, Sparkles, Wand2 } from 'lucide-react';

const FABRIC_DATA = {
  'Cotton': ['Organic Cotton', 'Pima Cotton', 'Egyptian Cotton', 'Recycled Cotton', 'Denim', 'Canvas', 'Poplin'],
  'Polyester': ['Virgin Polyester', 'Recycled Polyester (rPET)', 'Microfiber', 'Fleece', 'Satin', 'Chiffon'],
  'Silk': ['Mulberry Silk', 'Tussar Silk', 'Eri Silk', 'Muga Silk', 'Raw Silk', 'Crepe'],
  'Wool': ['Merino Wool', 'Cashmere', 'Lambswool', 'Tweed', 'Worsted', 'Felt'],
  'Linen': ['Pure Linen', 'Damask', 'Cambric', 'Butcher Linen'],
  'Blended': ['Cotton-Polyester', 'Wool-Silk', 'Cotton-Spandex', 'Poly-Viscose', 'Cotton-Linen'],
  'Other': ['Hemp', 'Bamboo', 'Rayon/Viscose', 'Nylon', 'Acrylic', 'Spandex']
};

export default function FactoryUpload() {
  const { addListing, user, settings } = useApp();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    fabricCategory: 'Cotton',
    fabricType: 'Organic Cotton',
    quantity: '',
    location: user?.location || 'Mumbai, India',
    price: '',
    shopName: user?.name || '',
    email: user?.email || '',
    description: '',
  });

  // Sync with user details when loaded
  useEffect(() => {
     if (user) {
        setFormData(prev => ({
            ...prev,
            location: user.location || prev.location,
            shopName: user.name || prev.shopName,
            email: user.email || prev.email
        }));
     }
  }, [user]);

  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    setFormData(prev => ({
      ...prev,
      fabricCategory: newCategory,
      fabricType: FABRIC_DATA[newCategory] ? FABRIC_DATA[newCategory][0] : 'Specific'
    }));
  };

  const processFile = async (selectedFile) => {
    if (!selectedFile) return;

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setAnalyzing(true);

    try {
      // Run AI Analysis Protocol
      const aiResult = await classifyImage(selectedFile);
      setResult(aiResult);
      
      // Synchronize Form Data with Intelligence Core
      setFormData(prev => ({
        ...prev,
        fabricCategory: aiResult.fabricCategory,
        fabricType: aiResult.fabricType,
        price: aiResult.estimatedValue 
      }));
    } catch (error) {
      console.error("AI Analysis Failed", error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFileChange = (e) => {
    processFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const clearImage = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
        await addListing({
          ...formData,
          factoryId: user?.id,
          imageUrl: preview,
          aiConfidence: result?.confidence || 0,
          aiMetadata: result // Store full analysis
        });
        navigate('/factory');
    } catch (err) {
        console.error("Transmission failed", err);
    } finally {
        setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Deploy <span className="text-indigo-600">New Inventory</span></h1>
           <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Capture, analyze, and list your textile waste in seconds.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-12">
        
        {/* Left Aspect: Vision Analysis */}
        <div className="lg:col-span-2 space-y-8">
          <div 
             className={`
               relative border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center h-[32rem] transition-all duration-700 overflow-hidden
               ${dragOver ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'}
               ${preview ? 'border-none shadow-2xl' : ''}
             `}
             onDrop={handleDrop}
             onDragOver={handleDragOver}
             onDragLeave={handleDragLeave}
          >
             {preview ? (
               <div className="relative w-full h-full group">
                 <img src={preview} alt="Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                 
                 <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 
                 <button 
                    onClick={clearImage}
                    className="absolute top-6 right-6 p-3 bg-rose-500/90 text-white rounded-2xl shadow-xl hover:bg-rose-600 z-20 transition-all hover:rotate-90 active:scale-95"
                    title="Remove Image"
                 >
                    <X size={20} />
                 </button>

                 {analyzing && (
                   <div className="absolute inset-0 bg-indigo-900/80 flex flex-col items-center justify-center backdrop-blur-xl z-20 p-8 text-center animate-in fade-in">
                      <div className="relative w-24 h-24 mb-6">
                         <div className="absolute inset-0 border-4 border-white/20 rounded-full"></div>
                         <div className="absolute inset-0 border-4 border-white rounded-full border-t-transparent animate-spin"></div>
                         <Sparkles className="absolute inset-0 m-auto text-white w-8 h-8 animate-pulse" />
                      </div>
                      <h3 className="text-white font-black text-2xl mb-2 tracking-tight">Spectral Analysis</h3>
                      <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest">Identifying Fiber Composition</p>
                   </div>
                 )}
               </div>
             ) : (
                <div className="p-10 text-center flex flex-col items-center justify-center h-full">
                  <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                  <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-8 border border-white dark:border-slate-700 shadow-xl transition-transform hover:scale-110 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <UploadIcon className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">Drop Textile Media</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed font-semibold">
                     High-resolution imagery enables precision AI classification.
                  </p>
                  <button 
                     onClick={() => fileInputRef.current?.click()}
                     className="px-8 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 shadow-2xl"
                  >
                     Select File
                  </button>
                </div>
             )}
          </div>

          {/* AI Result Card */}
          {result && !analyzing && (
            <div className="bg-indigo-600 rounded-[2rem] p-8 text-white shadow-2xl shadow-indigo-500/20 animate-in slide-in-from-bottom-8 duration-700 text-left">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                   <Sparkles className="w-6 h-6" />
                </div>
                <div>
                   <h3 className="font-black text-lg tracking-tighter">INTELLIGENCE REPORT</h3>
                   <p className="text-[10px] uppercase font-bold text-indigo-200 tracking-[0.2em]">Signal Version v4.2</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                 <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                    <p className="text-[9px] uppercase font-black text-indigo-200 mb-1 tracking-widest">Fiber Match</p>
                    <p className="font-bold text-sm truncate">{result.fabricType}</p>
                 </div>
                 <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                    <p className="text-[9px] uppercase font-black text-indigo-200 mb-1 tracking-widest">Trust Index</p>
                    <p className="font-bold text-sm text-lime-400">{result.confidence}%</p>
                 </div>
              </div>

              <div className="space-y-4">
                 <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-indigo-200">Industrial Grade</span>
                    <span className="text-white">{result.grade}</span>
                 </div>
                 <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-indigo-200">Contamination</span>
                    <span className="text-white">{result.contamination}</span>
                 </div>
              </div>

              {/* Spectral Visualization */}
              <div className="mt-8 flex gap-1 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                 {result.spectralSignature?.map((color, i) => (
                    <div key={i} style={{ backgroundColor: color }} className="flex-1 animate-pulse" />
                 ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Aspect: Operational Data */}
        <div className="lg:col-span-3">
           <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[3rem] p-10 space-y-10 shadow-2xl shadow-slate-200/50 dark:shadow-none">
              
              {/* Product Hierarchy */}
              <div className="space-y-8">
                 <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-600">
                       <Tag size={20} />
                    </div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">Commercial Specs</h2>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-1.5">
                     <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Category</label>
                     <select
                       value={formData.fabricCategory}
                       onChange={handleCategoryChange}
                       className="w-full bg-slate-50 dark:bg-slate-900/50 border-none rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
                     >
                       {Object.keys(FABRIC_DATA).map(category => (
                         <option key={category} value={category}>{category}</option>
                       ))}
                     </select>
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Refined Classification</label>
                     <select
                       value={formData.fabricType}
                       onChange={e => setFormData({...formData, fabricType: e.target.value})}
                       className="w-full bg-slate-50 dark:bg-slate-900/50 border-none rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
                     >
                         {FABRIC_DATA[formData.fabricCategory]?.map(type => (
                           <option key={type} value={type}>{type}</option>
                         ))}
                     </select>
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Unit Pricing (₹/kg)</label>
                     <div className="relative">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black">₹</span>
                        <input 
                           type="number" 
                           required
                           value={formData.price}
                           onChange={(e) => setFormData({...formData, price: e.target.value})}
                           className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-none rounded-2xl text-slate-900 dark:text-white font-black outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                           placeholder="0.00"
                        />
                     </div>
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Available Stock Bulk (kg)</label>
                     <input 
                        type="number" 
                        required
                        value={formData.quantity}
                        onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                        className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-none rounded-2xl text-slate-900 dark:text-white font-black outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                        placeholder="0"
                     />
                   </div>
                 </div>
                 
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Industrial Description</label>
                    <textarea 
                       rows="3"
                       value={formData.description}
                       onChange={(e) => setFormData({...formData, description: e.target.value})}
                       className="w-full p-6 bg-slate-50 dark:bg-slate-900/50 border-none rounded-[2rem] text-slate-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                       placeholder="Specify grade, contamination level, and current storage status..."
                    ></textarea>
                 </div>
              </div>

              {/* Section 2: Seller Information */}
              <div className="space-y-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                 <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Building size={20} className="text-purple-500" /> Seller Information
                 </h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5 md:col-span-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Operating Facility</label>
                       <div className="relative">
                          <Building className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input 
                             type="text" 
                             required
                             value={formData.shopName}
                             onChange={e => setFormData({...formData, shopName: e.target.value})}
                             className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-none rounded-2xl text-slate-900 dark:text-white font-bold outline-none"
                             placeholder="Factory Name"
                             readOnly
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Dispatch Location</label>
                       <div className="relative">
                          <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input 
                             type="text" 
                             required
                             value={formData.location}
                             onChange={e => setFormData({...formData, location: e.target.value})}
                             className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-none rounded-2xl text-slate-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-purple-500/20"
                             placeholder="City, State"
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Business Email</label>
                       <div className="relative">
                          <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input 
                             type="email" 
                             required
                             value={formData.email}
                             className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-none rounded-2xl text-slate-900 dark:text-white font-bold outline-none opacity-60"
                             placeholder="email@factory.com"
                             readOnly
                          />
                       </div>
                    </div>
                 </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                 <button 
                    type="button"
                    onClick={() => navigate('/factory')}
                    className="flex-1 px-8 py-5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-all shadow-sm active:scale-95"
                 >
                    Abort
                 </button>
                 <button 
                    type="submit"
                    disabled={!result || analyzing || submitting}
                    className="flex-2 px-10 py-5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 dark:disabled:bg-slate-900 disabled:text-slate-400 text-white rounded-[1.25rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-emerald-500/30 transition-all flex items-center justify-center gap-3 active:scale-95"
                 >
                    {submitting ? (
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <UploadIcon size={18} />
                    )}
                    Deploy to Marketplace
                 </button>
              </div>
           </form>
        </div>
      </div>
    </div>
  );
}

