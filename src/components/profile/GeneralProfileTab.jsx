import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { CheckCircle2, ScanFace, Lock, Camera, Mail, User, Phone, Stethoscope, Clock, FileText, MapPin } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { updateUser } from '../../features/auth/authSlice';
import FaceCapture from '../FaceCapture';
import { validateFormFields } from '../../utils/validation';

const GeneralProfileTab = () => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    fullName: user?.full_name || user?.name || '',
    contactNumber: user?.mobile_number || user?.phone || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
  });

  const [doctorData, setDoctorData] = useState({
    specialization: '',
    experience: '',
    bio: '',
    location: '',
    qualifications: ''
  });

  const [loading, setLoading] = useState({
    general: false,
    password: false,
    doctor: false,
    faceId: false
  });

  const [showFaceScanner, setShowFaceScanner] = useState(false);

  const handleFaceCapture = async (faceDescriptor) => {
    setLoading(prev => ({ ...prev, faceId: true }));
    try {
      await axios.put(
        'http://localhost:5000/api/users/face-id',
        { faceDescriptor },
        {
          headers: {
            Authorization: token,
          },
        }
      );
      toast.success('Face ID successfully enrolled!');
      setShowFaceScanner(false);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to enroll Face ID.');
    } finally {
      setLoading(prev => ({ ...prev, faceId: false }));
    }
  };

  // Fetch doctor profile if user is a doctor
  useEffect(() => {
    const fetchDoctorProfile = async () => {
      if (user?.role === 'Doctor') {
        try {
          const res = await axios.get('http://localhost:5000/api/users/doctor-profile', {
            headers: { Authorization: token }
          });
          if (res.data.profile) {
            setDoctorData({
              specialization: res.data.profile.specialization || '',
              experience: res.data.profile.experience || '',
              bio: res.data.profile.bio || '',
              location: res.data.profile.location || '',
              qualifications: res.data.profile.qualifications || ''
            });
          }
        } catch (error) {
          console.error("Failed to fetch doctor profile", error);
        }
      }
    };
    fetchDoctorProfile();
  }, [user?.role, token]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handlePasswordChange = (e) => setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  const handleDoctorChange = (e) => setDoctorData({ ...doctorData, [e.target.name]: e.target.value });

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    // SQL Injection validation
    const validation = validateFormFields({
      full_name: formData.fullName,
      mobile_number: formData.contactNumber
    });

    if (!validation.isValid) {
      return toast.error(validation.message);
    }

    setLoading(prev => ({ ...prev, general: true }));
    try {
      const res = await axios.put('http://localhost:5000/api/users/general', {
        full_name: formData.fullName,
        mobile_number: formData.contactNumber
      }, {
        headers: { Authorization: token }
      });
      
      dispatch(updateUser(res.data.user));
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(prev => ({ ...prev, general: false }));
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      return toast.error('Please fill in both password fields');
    }
    setLoading(prev => ({ ...prev, password: true }));
    try {
      await axios.put('http://localhost:5000/api/users/password', passwordData, {
        headers: { Authorization: token }
      });
      toast.success('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(prev => ({ ...prev, password: false }));
    }
  };

  const handleSaveDoctorProfile = async (e) => {
    e.preventDefault();

    // SQL Injection validation
    const validation = validateFormFields({
      specialization: doctorData.specialization,
      experience: doctorData.experience.toString(),
      bio: doctorData.bio,
      location: doctorData.location,
      qualifications: doctorData.qualifications
    });

    if (!validation.isValid) {
      return toast.error(validation.message);
    }

    setLoading(prev => ({ ...prev, doctor: true }));
    try {
      await axios.put('http://localhost:5000/api/users/doctor-profile', doctorData, {
        headers: { Authorization: token }
      });
      toast.success('Professional details updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update professional details');
    } finally {
      setLoading(prev => ({ ...prev, doctor: false }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      
      {/* Basic Information Section */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-6">Basic Information</h2>
        
        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-700">
            <div className="relative group cursor-pointer">
              <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 text-3xl font-bold shadow-inner">
                {(user?.full_name || user?.name || 'U').charAt(0).toUpperCase()}
              </div>
              <button 
                type="button"
                className="absolute bottom-0 right-0 p-2 bg-white dark:bg-slate-700 rounded-full shadow-md border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                title="Change Avatar"
              >
                <Camera size={18} />
              </button>
            </div>
            <div>
              <h3 className="font-medium text-slate-800 dark:text-white text-lg">{user?.full_name || user?.name || 'User'}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">{user?.role} Account</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-slate-400" />
                </div>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors dark:text-white"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            {/* Contact Number */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Contact Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone size={18} className="text-slate-400" />
                </div>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors dark:text-white"
                  placeholder="+1 (555) 000-0000"
                  required
                />
              </div>
            </div>

            {/* Email Address (Read-only) */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-slate-400" />
                </div>
                <input
                  type="email"
                  value={user?.email || ''}
                  readOnly
                  className="w-full pl-10 pr-28 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 cursor-not-allowed focus:outline-none"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-md text-xs font-semibold border border-emerald-200 dark:border-emerald-800/50">
                    <CheckCircle2 size={14} />
                    Verified
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Email address cannot be changed. Contact support for assistance.</p>
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading.general}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20 transition-all shadow-sm active:scale-95 disabled:opacity-70"
            >
              {loading.general ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Professional Details Section (Doctor Only) */}
      {user?.role === 'Doctor' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-6">Professional Details</h2>
          
          <form onSubmit={handleSaveDoctorProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Specialization */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Specialization</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Stethoscope size={18} className="text-slate-400" />
                  </div>
                  <input
                    type="text"
                    name="specialization"
                    value={doctorData.specialization}
                    onChange={handleDoctorChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors dark:text-white"
                    placeholder="Cardiologist"
                    required
                  />
                </div>
              </div>

              {/* Experience */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Years of Experience</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock size={18} className="text-slate-400" />
                  </div>
                  <input
                    type="number"
                    name="experience"
                    value={doctorData.experience}
                    onChange={handleDoctorChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors dark:text-white"
                    placeholder="10"
                    min="0"
                    required
                  />
                </div>
              </div>

              {/* Qualifications */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Qualifications</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CheckCircle2 size={18} className="text-slate-400" />
                  </div>
                  <input
                    type="text"
                    name="qualifications"
                    value={doctorData.qualifications}
                    onChange={handleDoctorChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors dark:text-white"
                    placeholder="e.g. MBBS, MD"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Professional Bio</label>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none">
                    <FileText size={18} className="text-slate-400" />
                  </div>
                  <textarea
                    name="bio"
                    value={doctorData.bio}
                    onChange={handleDoctorChange}
                    rows="4"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors dark:text-white resize-none"
                    placeholder="Brief description of your professional background and expertise..."
                    required
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Clinic Location</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin size={18} className="text-slate-400" />
                  </div>
                  <input
                    type="text"
                    name="location"
                    value={doctorData.location}
                    onChange={handleDoctorChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors dark:text-white"
                    placeholder="e.g. CareSync Hospital, Colombo"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading.doctor}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20 transition-all shadow-sm active:scale-95 disabled:opacity-70"
              >
                {loading.doctor ? 'Saving...' : 'Save Professional Details'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Security Settings Section */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-6">Security Settings</h2>
        
        {/* Face ID Enrollment (Doctors Only) */}
        {user?.role === 'Doctor' && (
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row items-center justify-between p-5 bg-blue-50/80 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/50">
              <div className="flex items-center gap-4 mb-4 sm:mb-0">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-800/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <ScanFace size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-white">Face ID Authentication</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Use facial recognition for faster, secure logins.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowFaceScanner(!showFaceScanner)}
                className="w-full sm:w-auto px-5 py-2.5 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-slate-600 rounded-xl font-medium hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-slate-700 transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <ScanFace size={18} />
                {showFaceScanner ? 'Cancel' : 'Enroll Face ID'}
              </button>
            </div>
            
            {showFaceScanner && (
              <div className="mt-4 animate-fadeIn flex flex-col items-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                <FaceCapture 
                  onCapture={handleFaceCapture} 
                  mode="register" 
                  buttonText={loading.faceId ? "Saving..." : "Save Face ID"} 
                />
              </div>
            )}
          </div>
        )}

        <div className="border-t border-slate-100 dark:border-slate-700 pt-8">
          <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-4">Change Password</h3>
          <form onSubmit={handleSavePassword} className="space-y-5 max-w-lg">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Current Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-slate-400" />
                </div>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors dark:text-white"
                  placeholder="Enter current password"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-slate-400" />
                </div>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors dark:text-white"
                  placeholder="Create new password"
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading.password}
              className="px-6 py-2.5 mt-2 bg-slate-800 dark:bg-slate-700 text-white rounded-xl font-medium hover:bg-slate-900 dark:hover:bg-slate-600 focus:ring-4 focus:ring-slate-500/20 transition-all shadow-sm active:scale-95 disabled:opacity-70"
            >
              {loading.password ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GeneralProfileTab;
