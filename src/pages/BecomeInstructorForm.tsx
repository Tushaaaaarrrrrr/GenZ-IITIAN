import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function BecomeInstructorForm() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    phone: '',
    subject: '',
    cgpa: '',
    hasLaptop: false,
    hasTablet: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const dbPayload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        cgpa: formData.cgpa,
        devices: [
          formData.hasLaptop ? 'Laptop' : '',
          formData.hasTablet ? 'Tablet' : ''
        ].filter(Boolean).join(', '),
      };

      const res = await fetch('/api/submit-instructor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dbPayload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to submit application');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border-[4px] border-[#0b1120] rounded-[2.5rem] p-10 lg:p-16 max-w-2xl w-full text-center shadow-[15px_15px_0px_#0b1120]"
        >
          <div className="w-24 h-24 bg-[#d1fae5] rounded-full border-[4px] border-[#0b1120] flex items-center justify-center mx-auto mb-8 shadow-[6px_6px_0px_#0b1120]">
            <ShieldCheck className="w-12 h-12 text-[#10b981]" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-[#0b1120] mb-6">Application Received!</h1>
          <p className="text-xl text-gray-600 font-bold mb-10">
            Thank you for applying to become an instructor. Our team will review your details and get back to you shortly.
          </p>
          <a href="/" className="inline-block px-10 py-5 bg-[#10b981] text-white rounded-2xl font-black text-xl border-[4px] border-[#0b1120] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0px_#0b1120] transition-all">
            Return to Home
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Banner */}
      <div className="bg-[#10b981] pt-32 pb-20 px-6 border-b-[4px] border-[#0b1120] relative overflow-hidden">
        {/* Abstract Pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(#0b1120 2px, transparent 2px), linear-gradient(90deg, #0b1120 2px, transparent 2px)',
            backgroundSize: '40px 40px'
          }}
        ></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-5xl lg:text-6xl font-black text-[#0b1120] mb-6 tracking-tight">Become an Instructor</h1>
          <p className="text-xl text-[#0b1120] font-bold max-w-2xl mx-auto">
            Share your expertise, reach thousands of students, and earn revenue by teaching with Gen-Z IITian.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-16 -mt-16 relative z-20">
        <div className="bg-white border-[4px] border-[#0b1120] rounded-[2.5rem] p-8 lg:p-12 shadow-[12px_12px_0px_#0b1120]">
          
          <div className="mb-10 pb-6 border-b-[3px] border-dashed border-gray-200">
            <h2 className="text-3xl font-black text-[#0b1120]">Basic Information</h2>
            <p className="text-gray-500 font-bold mt-2">Please provide your details below.</p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-100 border-[3px] border-red-500 text-red-700 font-bold rounded-2xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-sm font-black text-[#0b1120] uppercase tracking-widest pl-1">Full Name *</label>
                <input 
                  required
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe" 
                  className="w-full px-6 py-4 bg-gray-50 border-[3px] border-[#0b1120] rounded-2xl font-bold text-lg outline-none focus:bg-white focus:ring-[6px] ring-blue-100 transition-all" 
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-black text-[#0b1120] uppercase tracking-widest pl-1">Email Address *</label>
                <input 
                  required
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com" 
                  className="w-full px-6 py-4 bg-gray-50 border-[3px] border-[#0b1120] rounded-2xl font-bold text-lg outline-none focus:bg-white focus:ring-[6px] ring-blue-100 transition-all" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-sm font-black text-[#0b1120] uppercase tracking-widest pl-1">Phone Number *</label>
                <input 
                  required
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 9876543210" 
                  className="w-full px-6 py-4 bg-gray-50 border-[3px] border-[#0b1120] rounded-2xl font-bold text-lg outline-none focus:bg-white focus:ring-[6px] ring-blue-100 transition-all" 
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-black text-[#0b1120] uppercase tracking-widest pl-1">Subject of Expertise *</label>
                <input 
                  required
                  type="text" 
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="e.g. Data Science, Maths" 
                  className="w-full px-6 py-4 bg-gray-50 border-[3px] border-[#0b1120] rounded-2xl font-bold text-lg outline-none focus:bg-white focus:ring-[6px] ring-blue-100 transition-all" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              <div className="space-y-3">
                <label className="text-sm font-black text-[#0b1120] uppercase tracking-widest pl-1">Current CGPA (Optional)</label>
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  max="10"
                  name="cgpa"
                  value={formData.cgpa}
                  onChange={handleChange}
                  placeholder="e.g. 8.5" 
                  className="w-full px-6 py-4 bg-gray-50 border-[3px] border-[#0b1120] rounded-2xl font-bold text-lg outline-none focus:bg-white focus:ring-[6px] ring-blue-100 transition-all" 
                />
              </div>

              <div className="space-y-4">
                <label className="text-sm font-black text-[#0b1120] uppercase tracking-widest pl-1">Available Devices</label>
                <div className="flex gap-6 mt-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center w-8 h-8 rounded-lg border-[3px] border-[#0b1120] bg-white group-hover:bg-blue-50 transition-colors">
                      <input 
                        type="checkbox" 
                        name="hasLaptop"
                        checked={formData.hasLaptop}
                        onChange={handleChange}
                        className="peer sr-only"
                      />
                      <ShieldCheck className="w-5 h-5 text-[#10b981] opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                    <span className="font-bold text-[#0b1120] text-lg select-none">Laptop</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center w-8 h-8 rounded-lg border-[3px] border-[#0b1120] bg-white group-hover:bg-blue-50 transition-colors">
                      <input 
                        type="checkbox" 
                        name="hasTablet"
                        checked={formData.hasTablet}
                        onChange={handleChange}
                        className="peer sr-only"
                      />
                      <ShieldCheck className="w-5 h-5 text-[#10b981] opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                    <span className="font-bold text-[#0b1120] text-lg select-none">Tablet</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t-[3px] border-dashed border-gray-200 mt-10 text-center">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full md:w-auto min-w-[280px] px-10 py-5 bg-[#0b1120] text-white rounded-2xl font-black text-xl border-[4px] border-[#0b1120] hover:bg-white hover:text-[#0b1120] shadow-[8px_8px_0px_#10b981] hover:shadow-none hover:translate-y-1 hover:translate-x-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
              >
                {loading ? (
                  <><Loader2 className="w-6 h-6 mr-3 animate-spin" /> Submitting...</>
                ) : (
                  "Submit Application"
                )}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
