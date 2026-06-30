import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { X, Activity, Droplets, AlertTriangle, Phone, HeartPulse } from 'lucide-react';
import toast from 'react-hot-toast';

const PatientMedicalProfileModal = ({ patient, onClose }) => {
  const { token } = useSelector(state => state.auth);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/doctor/patient/${patient.patient_id}/profile`, {
          headers: { Authorization: token }
        });
        if (res.data.success) {
          setProfile(res.data.profile);
        }
      } catch (error) {
        console.error('Error fetching patient profile:', error);
        // Only show toast if it's the initial load
        if (isLoading) {
          toast.error('Failed to load patient medical profile');
        }
      } finally {
        setIsLoading(false);
      }
    };
    if (patient && patient.patient_id) {
      fetchProfile();
      
      // Real-time polling every 5 seconds
      const interval = setInterval(fetchProfile, 5000);
      return () => clearInterval(interval);
    }
  }, [patient, token]);

  if (!patient) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-100 dark:border-gray-700 flex justify-between items-center bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-800">
          <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <Activity className="text-emerald-600" /> Medical Profile - {patient.patientName}
          </h3>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white rounded-full hover:bg-white dark:bg-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
          ) : !profile || Object.keys(profile).length === 0 ? (
            <div className="text-center py-12">
              <HeartPulse className="w-16 h-16 text-slate-300 dark:text-gray-600 mx-auto mb-4" />
              <h4 className="text-lg font-bold text-slate-700 dark:text-gray-300">No Profile Data Found</h4>
              <p className="text-slate-500 dark:text-gray-400 mt-2">This patient hasn't filled out their medical profile yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {/* Blood Group */}
              <div className="bg-rose-50 dark:bg-rose-900/10 p-5 rounded-2xl border border-rose-100 dark:border-rose-900/30">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-rose-100 dark:bg-rose-800/50 rounded-lg text-rose-600 dark:text-rose-400">
                    <Droplets size={20} />
                  </div>
                  <h4 className="font-bold text-slate-700 dark:text-gray-200">Blood Group</h4>
                </div>
                <p className="text-xl font-black text-rose-700 dark:text-rose-400 mt-2 ml-12">
                  {profile.blood_group || 'Not Specified'}
                </p>
              </div>

              {/* Allergies */}
              <div className="bg-amber-50 dark:bg-amber-900/10 p-5 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-amber-100 dark:bg-amber-800/50 rounded-lg text-amber-600 dark:text-amber-400">
                    <AlertTriangle size={20} />
                  </div>
                  <h4 className="font-bold text-slate-700 dark:text-gray-200">Allergies</h4>
                </div>
                <p className="text-slate-700 dark:text-gray-300 mt-2 ml-12 font-medium">
                  {profile.allergies || 'None reported'}
                </p>
              </div>

              {/* Chronic Conditions */}
              <div className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-800/50 rounded-lg text-blue-600 dark:text-blue-400">
                    <Activity size={20} />
                  </div>
                  <h4 className="font-bold text-slate-700 dark:text-gray-200">Chronic Conditions</h4>
                </div>
                <p className="text-slate-700 dark:text-gray-300 mt-2 ml-12 font-medium">
                  {profile.chronic_conditions || 'None reported'}
                </p>
              </div>

              {/* Emergency Contact */}
              <div className="bg-slate-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-slate-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-slate-200 dark:bg-gray-700 rounded-lg text-slate-600 dark:text-gray-300">
                    <Phone size={20} />
                  </div>
                  <h4 className="font-bold text-slate-700 dark:text-gray-200">Emergency Contact</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-12">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Name</span>
                    <p className="font-bold text-slate-800 dark:text-white mt-1">{profile.emergency_contact_name || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Number</span>
                    <p className="font-bold text-slate-800 dark:text-white mt-1">{profile.emergency_contact_number || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientMedicalProfileModal;
