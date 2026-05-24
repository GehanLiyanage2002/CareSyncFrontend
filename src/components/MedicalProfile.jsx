import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { updateUser } from '../features/auth/authSlice';

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

// ── Main MedicalProfile Component ─────────────────────────────────────────────
const MedicalProfile = () => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);

  // Pre-fill form from existing Redux state
  const [bloodGroup, setBloodGroup] = useState(user?.blood_group || '');
  const [allergies, setAllergies] = useState(user?.allergies || '');
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
        { blood_group: bloodGroup || null, allergies: allergies || null },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: token, // token already contains "Bearer ..."
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
    <div className="relative">
      {/* Toast */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={closeToast} />
      )}

      {/* Page header */}
      <div className="mb-8">
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Medical Profile</h2>
        <p className="text-slate-500 mt-1 text-sm font-medium">
          Keep your medical information up to date. This helps your care team provide better support.
        </p>
      </div>

      {/* Profile overview card */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-3xl p-6 mb-8 flex items-center gap-5">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center text-white text-2xl font-extrabold shadow-lg shadow-blue-200 shrink-0">
          {user?.full_name?.charAt(0)?.toUpperCase() || 'P'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-extrabold text-slate-800 text-lg leading-tight truncate">{user?.full_name || 'Patient'}</p>
          <p className="text-slate-500 text-sm mt-0.5 truncate">{user?.email}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
              <span className="w-2 h-2 bg-blue-500 rounded-full inline-block"></span>
              {user?.role || 'Patient'}
            </span>
            {user?.blood_group && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-50 px-3 py-1 rounded-full border border-red-100">
                🩸 {user.blood_group}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Update form card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-8 pt-8 pb-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <span className="text-2xl">🩺</span>
            Update Medical Information
          </h3>
          <p className="text-slate-400 text-sm mt-1">All fields are optional. Changes are saved immediately.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-7">

          {/* Blood Group Dropdown */}
          <div>
            <label htmlFor="blood-group" className="block text-sm font-bold text-slate-700 mb-2">
              Blood Group
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg pointer-events-none">🩸</span>
              <select
                id="blood-group"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full pl-10 pr-10 py-3.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 text-sm font-medium cursor-pointer"
              >
                <option value="">— Select blood group —</option>
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
              {/* Custom arrow */}
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </span>
            </div>
          </div>

          {/* Allergies Textarea */}
          <div>
            <label htmlFor="allergies" className="block text-sm font-bold text-slate-700 mb-2">
              Allergies & Medical Conditions
            </label>
            <textarea
              id="allergies"
              rows={5}
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder="e.g. Penicillin allergy, Asthma, Diabetes Type 2, Lactose intolerant..."
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 text-sm font-medium resize-none leading-relaxed"
            />
            <p className="text-xs text-slate-400 mt-1.5 font-medium">
              List any known allergies or ongoing conditions, separated by commas.
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              id="save-profile-btn"
              disabled={loading}
              className={`flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm text-white shadow-lg transition-all duration-200 ease-out
                ${loading
                  ? 'bg-blue-400 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0'
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

export default MedicalProfile;
