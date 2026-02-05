import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: ''
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // First Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.firstName)) {
      newErrors.firstName = 'First name should only contain letters';
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.lastName)) {
      newErrors.lastName = 'Last name should only contain letters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    } else if (formData.message.trim().length > 1000) {
      newErrors.message = 'Message must be less than 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setSubmitted(true);
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        message: ''
      });
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  return (
    <>
      <Navbar />
      <div className="pt-20 min-h-screen bg-slate-50 dark:bg-slate-900 grid lg:grid-cols-2 relative transition-colors duration-300">
         
         {/* Background Decoration */}
         <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-100/30 dark:bg-emerald-900/10 hidden lg:block" />

         {/* Left Side - Info */}
         <div className="p-8 lg:p-24 flex flex-col justify-center relative z-10">
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">Let's Clean the Planet Together</h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-12">
               Have questions about platform integration, recycling partnerships, or bulk pricing? We're here to help.
            </p>

            <div className="space-y-8">
               <ContactItem 
                  icon={<Mail className="text-emerald-600 dark:text-emerald-400" />}
                  title="Email Us"
                  detail="hello@retexvalue.com"
               />
               <ContactItem 
                  icon={<Phone className="text-emerald-600 dark:text-emerald-400" />}
                  title="Call Us"
                  detail="+91 (800) 123-4567"
               />
               <ContactItem 
                  icon={<MapPin className="text-emerald-600 dark:text-emerald-400" />}
                  title="Visit HQ"
                  detail="123 Sustainability Ave, Mumbai, India"
               />
            </div>
         </div>

         {/* Right Side - Form */}
         <div className="p-8 lg:p-24 bg-white dark:bg-slate-800/30 backdrop-blur-md flex flex-col justify-center border-l border-slate-200 dark:border-slate-800">
            <form onSubmit={handleSubmit} className="space-y-6 max-w-lg w-full mx-auto">
               <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Send a Message</h2>
               
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="text-sm font-medium text-slate-700 dark:text-slate-400 mb-2 block">First Name</label>
                     <Input 
                       type="text"
                       name="firstName"
                       value={formData.firstName}
                       onChange={handleChange}
                       placeholder="John"
                       className={errors.firstName ? 'border-red-500' : ''}
                     />
                     {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                     <label className="text-sm font-medium text-slate-700 dark:text-slate-400 mb-2 block">Last Name</label>
                     <Input 
                       type="text"
                       name="lastName"
                       value={formData.lastName}
                       onChange={handleChange}
                       placeholder="Doe"
                       className={errors.lastName ? 'border-red-500' : ''}
                     />
                     {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
                  </div>
               </div>

               <div>
                 <label className="text-sm font-medium text-slate-700 dark:text-slate-400 mb-2 block">Email Address</label>
                 <Input 
                   type="email" 
                   name="email"
                   value={formData.email}
                   onChange={handleChange}
                   placeholder="xxxx@company.com"
                   className={errors.email ? 'border-red-500' : ''}
                 />
                 {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
               </div>

               <div>
                 <label className="text-sm font-medium text-slate-700 dark:text-slate-400 mb-2 block">Message</label>
                 <textarea 
                   name="message"
                   rows="4" 
                   value={formData.message}
                   onChange={handleChange}
                   className={`w-full bg-slate-50 dark:bg-slate-900 border ${errors.message ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-none`}
                   placeholder="How can we help you today?"
                 ></textarea>
                 {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
                 <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{formData.message.length}/1000</p>
               </div>

               <button 
                  disabled={submitted}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                  {submitted ? (
                     <>Message Sent!</>
                  ) : (
                     <>Send Message <Send size={18} /></>
                  )}
               </button>
            </form>
         </div>

      </div>
      <Footer />
    </>
  );
}

function ContactItem({ icon, title, detail }) {
   return (
      <div className="flex items-center gap-4 group cursor-pointer">
         <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 group-hover:border-emerald-500 dark:group-hover:border-emerald-500 transition-colors shadow-sm dark:shadow-none">
            {icon}
         </div>
         <div>
            <h3 className="text-slate-900 dark:text-white font-semibold">{title}</h3>
            <p className="text-slate-600 dark:text-slate-400">{detail}</p>
         </div>
      </div>
   );
}

function Input(props) {
   return (
      <input 
         {...props}
         className={`w-full bg-slate-50 dark:bg-slate-900 border ${props.className || ''} border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600`.replace('border border-slate-200', 'border border-slate-200')}
      />
   );
}
