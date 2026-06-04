import React, { useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { UserPlus, User, Phone, Mail, Droplets, Activity } from 'lucide-react';

const WalkInRegistration = () => {
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    blood_group: '',
    emergency_contact_name: '',
    emergency_contact_number: ''
  });

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone) {
      toast.error('Name and Phone Number are required.');
      return;
    }

    setLoading(true);

    try {
      await axios.post(
        'http://localhost:5000/api/receptionist/register-patient',
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('Patient Registered Successfully! 🎉');
      
      // Clear form
      setFormData({
        name: '',
        phone: '',
        email: '',
        blood_group: '',
        emergency_contact_name: '',
        emergency_contact_number: ''
      });
      
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || 'Failed to register patient.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-blue-50 shadow-sm p-8 lg:p-10 relative overflow-hidden">
      {/* Decorative BG element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
            <UserPlus size={28} />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-800">Walk-in Registration</h3>
            <p className="text-sm font-medium text-slate-500 mt-1">Quickly add a new patient to the system.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Patient Name */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Full Name *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. John Doe"
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Phone size={18} />
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="e.g. 0771234567"
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
                />
              </div>
            </div>

            {/* Email (Optional) */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email Address <span className="text-slate-400 font-normal">(Optional)</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. john@example.com"
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
                />
              </div>
            </div>

            {/* Blood Group */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Blood Group <span className="text-slate-400 font-normal">(Optional)</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Droplets size={18} />
                </div>
                <select
                  name="blood_group"
                  value={formData.blood_group}
                  onChange={handleChange}
                  className="block w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select Blood Group</option>
                  {bloodGroups.map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            {/* Emergency Contact Name */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Emergency Contact Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Activity size={18} />
                </div>
                <input
                  type="text"
                  name="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={handleChange}
                  placeholder="e.g. Jane Doe"
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
                />
              </div>
            </div>

            {/* Emergency Contact Number */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Emergency Contact Phone</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Phone size={18} />
                </div>
                <input
                  type="tel"
                  name="emergency_contact_number"
                  value={formData.emergency_contact_number}
                  onChange={handleChange}
                  placeholder="e.g. 0777654321"
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
                />
              </div>
            </div>

          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white shadow-lg transition-all duration-300 ${
                loading 
                  ? 'bg-blue-400 cursor-not-allowed shadow-none' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:-translate-y-0.5 shadow-blue-200'
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Registering...
                </>
              ) : (
                <>
                  <UserPlus size={20} />
                  Register Patient
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WalkInRegistration;
