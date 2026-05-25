import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { updateUser } from '../../features/auth/authSlice';
import { HeartPulse, Droplets, AlertCircle, Phone, User as UserIcon } from 'lucide-react';

// ── Toast notification component ──────────────────────────────────────────────
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isSuccess = type === 'success';
  return (
    <div
      className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-white font-semibold text-sm
        transition-all duration-500 animate-[slide-in-from-top_0.3s_ease-out]
        ${isSuccess ? 'bg-emerald-500 shadow-emerald-200' : 'bg-red-500 shadow-red-200'}`}
    >
      <span className="text-lg">{isSuccess ? '✅' : '❌'}</span>
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 opacity-75 hover:opacity-100 text-white text-lg leading-none">×</button>
    </div>
  );
};

// ── Blood group options ────────────────────────────────────────────────────────
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

// ── Main MedicalProfileTab Component ─────────────────────────────────────────────
const MedicalProfileTab = () => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);

  // Pre-fill form from existing Redux state
  const [bloodGroup, setBloodGroup] = useState(user?.blood_group || '');
  const [allergies, setAllergies] = useState(user?.allergies || '');
  const [chronicConditions, setChronicConditions] = useState(user?.chronic_conditions || '');
  const [emergencyContactName, setEmergencyContactName] = useState(user?.emergency_contact_name || '');
  const [emergencyContactNumber, setEmergencyContactNumber] = useState(user?.emergency_contact_number || '');

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null); // { message, type }

  const showToast = (message, type) => setToast({ message, type });
  const closeToast = () => setToast(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.put(
        'http://localhost:5000/api/users/profile',
        { 
          blood_group: bloodGroup || null, 
          allergies: allergies || null,
          chronic_conditions: chronicConditions || null,
          emergency_contact_name: emergencyContactName || null,
          emergency_contact_number: emergencyContactNumber || null
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: token, 
          },
        }
      );

      // Update Redux state + localStorage with the updated user data
      dispatch(updateUser(response.data.user));
      showToast('Medical profile updated successfully!', 'success');
    } catch (err) {
      const message =
        err.response?.data?.message || 'Failed to update profile. Please try again.';
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Toast */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={closeToast} />
      )}

      {/* Page header */}
      <div className="mb-8">
        <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">Medical Profile</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm font-medium">
          Keep your medical information up to date. This helps your care team provide better support.
        </p>
      </div>

      {/* Update form card */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="px-8 pt-8 pb-6 border-b border-slate-100 dark:border-slate-700">
          <h3 className="font-bold text-slate-800 dark:text-white text-lg flex items-center gap-2">
            <HeartPulse className="text-blue-500" size={24} />
            Update Medical Information
          </h3>
          <p className="text-slate-400 text-sm mt-1">All fields are optional. Changes are saved immediately.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">

          {/* Blood Group Dropdown */}
          <div className="max-w-md">
            <label htmlFor="blood-group" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Blood Group
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Droplets size={18} className="text-red-400" />
              </div>
              <select
                id="blood-group"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm font-medium cursor-pointer"
              >
                <option value="">— Select blood group —</option>
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-slate-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Allergies Textarea */}
            <div>
              <label htmlFor="allergies" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <AlertCircle size={16} className="text-amber-500" />
                Allergies & Reactions
              </label>
              <textarea
                id="allergies"
                rows={4}
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="e.g. Penicillin allergy, Peanut allergy..."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm font-medium resize-none leading-relaxed"
              />
              <p className="text-xs text-slate-400 mt-1.5 font-medium">
                List any known allergies, separated by commas.
              </p>
            </div>

            {/* Chronic Conditions Textarea */}
            <div>
              <label htmlFor="chronicConditions" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <HeartPulse size={16} className="text-blue-500" />
                Chronic Conditions
              </label>
              <textarea
                id="chronicConditions"
                rows={4}
                value={chronicConditions}
                onChange={(e) => setChronicConditions(e.target.value)}
                placeholder="e.g. Diabetes Type 2, Hypertension, Asthma..."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm font-medium resize-none leading-relaxed"
              />
              <p className="text-xs text-slate-400 mt-1.5 font-medium">
                List ongoing medical conditions.
              </p>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-700 pt-8">
            <h4 className="font-bold text-slate-800 dark:text-white mb-4">Emergency Contact</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Emergency Contact Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Contact Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon size={18} className="text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors dark:text-white"
                    placeholder="Jane Doe (Spouse)"
                  />
                </div>
              </div>

              {/* Emergency Contact Number */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Contact Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone size={18} className="text-slate-400" />
                  </div>
                  <input
                    type="tel"
                    value={emergencyContactNumber}
                    onChange={(e) => setEmergencyContactNumber(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors dark:text-white"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-sm text-white shadow-lg transition-all duration-200 ease-out
                ${loading
                  ? 'bg-blue-400 cursor-not-allowed shadow-none'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 active:translate-y-0 active:scale-95'
                }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Save Medical Profile
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MedicalProfileTab;
