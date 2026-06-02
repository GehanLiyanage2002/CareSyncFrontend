import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Award, Clock } from 'lucide-react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { updateUser } from '../../features/auth/authSlice';
import { validateFormFields } from '../../utils/validation';

const DoctorProfileEdit = () => {
  const { token, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [profile, setProfile] = useState({
    firstName: user?.full_name?.split(' ')[0] || '',
    lastName: user?.full_name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: user?.mobile_number || '',
    specialization: '',
    qualifications: '',
    experience: '',
    bio: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/doctor/profile', {
          headers: { Authorization: token }
        });
        
        if (response.data.success) {
          const fetchedProfile = response.data.profile;
          const fetchedUser = response.data.user;
          
          setProfile({
            firstName: fetchedUser?.full_name?.split(' ')[0] || user?.full_name?.split(' ')[0] || '',
            lastName: fetchedUser?.full_name?.split(' ').slice(1).join(' ') || user?.full_name?.split(' ').slice(1).join(' ') || '',
            email: fetchedUser?.email || user?.email || '',
            phone: fetchedUser?.mobile_number || user?.mobile_number || '',
            specialization: fetchedProfile?.specialization || '',
            qualifications: fetchedProfile?.qualifications || '',
            experience: fetchedProfile?.experience || '',
            bio: fetchedProfile?.bio || '',
          });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data.');
      } finally {
        setIsLoading(false);
      }
    };
    if (token) {
      fetchProfile();
    }
  }, [token, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    // SQL Injection validation
    const validation = validateFormFields({
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone,
      specialization: profile.specialization,
      qualifications: profile.qualifications,
      experience: profile.experience,
      bio: profile.bio
    });

    if (!validation.isValid) {
      setError(validation.message);
      return;
    }
    
    try {
      const response = await axios.put('http://localhost:5000/api/doctor/profile', {
        full_name: `${profile.firstName} ${profile.lastName}`.trim(),
        mobile_number: profile.phone,
        specialization: profile.specialization,
        qualifications: profile.qualifications,
        experience: profile.experience,
        bio: profile.bio
      }, {
        headers: { Authorization: token }
      });

      if (response.data.success) {
        setIsEditing(false);
        // Update Redux state with new name/phone if changed
        dispatch(updateUser({ 
          full_name: `${profile.firstName} ${profile.lastName}`.trim(),
          mobile_number: profile.phone
        }));
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile. Please try again.');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64 text-gray-500">Loading profile...</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Doctor Profile</h2>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200 dark:shadow-none"
        >
          {isEditing ? 'Cancel Edit' : 'Edit Profile'}
        </button>
      </div>
      
      {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg">{error}</p>}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center pb-6 border-b border-gray-100 dark:border-gray-700">
          <div className="h-24 w-24 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 border-4 border-white dark:border-gray-800 shadow-md">
            <User size={40} />
          </div>
          <div className="flex-1 w-full space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">First Name</label>
                {isEditing ? (
                  <input type="text" name="firstName" value={profile.firstName} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:text-white" />
                ) : (
                  <p className="text-gray-900 dark:text-white font-medium">{profile.firstName || '-'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Last Name</label>
                {isEditing ? (
                  <input type="text" name="lastName" value={profile.lastName} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:text-white" />
                ) : (
                  <p className="text-gray-900 dark:text-white font-medium">{profile.lastName || '-'}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-gray-400 dark:text-gray-500"><Mail size={18} /></div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Email</label>
                {isEditing ? (
                  <input type="email" name="email" value={profile.email} disabled className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none text-gray-500 cursor-not-allowed text-sm" />
                ) : (
                  <p className="text-gray-800 dark:text-gray-200">{profile.email || '-'}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-gray-400 dark:text-gray-500"><Phone size={18} /></div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Phone Number</label>
                {isEditing ? (
                  <input type="tel" name="phone" value={profile.phone} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white text-sm" />
                ) : (
                  <p className="text-gray-800 dark:text-gray-200">{profile.phone || '-'}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-gray-400 dark:text-gray-500"><Award size={18} /></div>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Specialization</label>
                  {isEditing ? (
                    <input type="text" name="specialization" value={profile.specialization} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white text-sm" />
                  ) : (
                    <p className="text-gray-800 dark:text-gray-200">{profile.specialization || 'Not specified'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Qualifications</label>
                  {isEditing ? (
                    <input type="text" name="qualifications" value={profile.qualifications} onChange={handleChange} placeholder="e.g. MBBS, MD" className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white text-sm" />
                  ) : (
                    <p className="text-gray-800 dark:text-gray-200">{profile.qualifications || 'Not specified'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Experience</label>
                  {isEditing ? (
                    <input type="text" name="experience" value={profile.experience} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white text-sm" />
                  ) : (
                    <p className="text-gray-800 dark:text-gray-200">{profile.experience || 'Not specified'}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-2">
              <div className="flex-1 ml-7">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Bio</label>
                {isEditing ? (
                  <textarea name="bio" value={profile.bio} onChange={handleChange} rows="3" className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white text-sm resize-none"></textarea>
                ) : (
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{profile.bio || 'No bio provided.'}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={() => setIsEditing(false)}
              className="px-5 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200 dark:shadow-none"
            >
              Save Changes
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default DoctorProfileEdit;
