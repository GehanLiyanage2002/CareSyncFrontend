import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import FaceCapture from '../components/FaceCapture';
import { validateFormFields } from '../utils/validation';

// ── Success Toast ─────────────────────────────────────────────────────────────
const SuccessToast = ({ message, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-indigo-500 text-white px-5 py-4 rounded-2xl shadow-2xl shadow-indigo-200 font-semibold text-sm animate-[fadeInDown_0.3s_ease-out]">
      <span className="text-xl">✅</span>
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 opacity-75 hover:opacity-100 text-lg leading-none">×</button>
    </div>
  );
};

// ── Eye Icon (show/hide password) ─────────────────────────────────────────────
const EyeIcon = ({ open }) =>
  open ? (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );

// ── Doctor Register Page ─────────────────────────────────────────────────────────────
const DoctorRegister = () => {
  const navigate = useNavigate();

  const [fullName, setFullName]               = useState('');
  const [email, setEmail]                     = useState('');
  const [mobileNumber, setMobileNumber]       = useState('');
  const [password, setPassword]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Doctor specific fields
  const [specialization, setSpecialization]   = useState('');
  const [experience, setExperience]           = useState('');
  const [bio, setBio]                         = useState('');
  const [idCardFront, setIdCardFront]         = useState(null);
  const [idCardRear, setIdCardRear]           = useState(null);
  
  // Drag and drop states
  const [isDraggingFront, setIsDraggingFront] = useState(false);
  const [isDraggingRear, setIsDraggingRear]   = useState(false);

  const role                                  = 'Doctor'; // default & fixed

  const [showPassword, setShowPassword]           = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [faceDescriptor, setFaceDescriptor] = useState(null);
  const [showBiometric, setShowBiometric] = useState(false);

  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleDragOverFront = (e) => { e.preventDefault(); setIsDraggingFront(true); };
  const handleDragLeaveFront = (e) => { e.preventDefault(); setIsDraggingFront(false); };
  const handleDropFront = (e) => {
    e.preventDefault();
    setIsDraggingFront(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setIdCardFront(e.dataTransfer.files[0]);
    }
  };

  const handleDragOverRear = (e) => { e.preventDefault(); setIsDraggingRear(true); };
  const handleDragLeaveRear = (e) => { e.preventDefault(); setIsDraggingRear(false); };
  const handleDropRear = (e) => {
    e.preventDefault();
    setIsDraggingRear(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setIdCardRear(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // ── Client-side validation ────────────────────────────────────────────────
    if (!fullName.trim() || !/^[a-zA-Z\s]+$/.test(fullName.trim())) {
      setError('Please enter a valid full name (letters and spaces only).');
      return;
    }
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!mobileNumber.trim()) {
      setError('Please enter your mobile number.');
      return;
    }
    if (!/^[0-9]{10}$/.test(mobileNumber.trim())) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please try again.');
      return;
    }
    if (!idCardFront || !idCardRear) {
      setError('Please provide photos for both front and back of your Medical Council ID.');
      return;
    }
    if (!specialization) {
      setError('Please select a specialization.');
      return;
    }
    if (experience === '' || isNaN(experience) || Number(experience) < 0) {
      setError('Please enter valid years of experience.');
      return;
    }
    if (!bio.trim()) {
      setError('Please provide a professional bio.');
      return;
    }

    // SQL Injection validation
    const validation = validateFormFields({ 
      full_name: fullName, 
      email, 
      mobile_number: mobileNumber,
      specialization,
      experience: experience.toString(),
      bio
    });
    
    if (!validation.isValid) {
      setError(validation.message);
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('full_name', fullName.trim());
      formData.append('email', email);
      formData.append('mobile_number', mobileNumber.trim());
      formData.append('password', password);
      formData.append('role', role);
      formData.append('specialization', specialization);
      formData.append('experience', experience.toString() + ' Years');
      formData.append('bio', bio);
      if (faceDescriptor) {
        formData.append('faceDescriptor', JSON.stringify(faceDescriptor));
      }
      if (idCardFront) formData.append('id_card_front', idCardFront);
      if (idCardRear) formData.append('id_card_rear', idCardRear);

      const response = await axios.post('http://127.0.0.1:5000/api/auth/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Since the backend now sends the OTP via email, we can redirect immediately
      navigate('/verify-otp', { state: { email } });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Something went wrong. Please try again later.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4 relative overflow-hidden">


      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />

      {/* Card container */}
      <div className="relative z-10 w-full max-w-md my-8">
        <div className="bg-white dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-indigo-200/50 dark:shadow-none p-8 md:p-10 border border-white/60 dark:border-gray-700/60">

          {/* ── Back to Home ────────────────────────────────────────────── */}
          <div className="flex justify-start mb-2">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-gray-400 hover:text-indigo-600 font-semibold transition-colors duration-150 group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-150">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back to Home
            </button>
          </div>

          {/* ── Logo & Header ────────────────────────────────────────────── */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-300 mb-5">
              {/* Medical cross icon */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Create Account</h1>
            <p className="mt-2 text-slate-500 dark:text-gray-400 text-base font-medium">Join CareSync as a Doctor</p>
          </div>

          {/* ── Error Alert ──────────────────────────────────────────────── */}
          {error && (
            <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 p-4 rounded-2xl">
              <div className="shrink-0 text-red-500 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm text-red-700 font-medium leading-relaxed">{error}</p>
            </div>
          )}

          {/* ── Form ────────────────────────────────────────────────────── */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* Full Name */}
            <div>
              <label htmlFor="reg-fullname" className="block text-sm font-semibold text-slate-700 dark:text-gray-200 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <input
                  id="reg-fullname"
                  name="full_name"
                  type="text"
                  autoComplete="name"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                  placeholder="Dr. John Doe"
                  className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 dark:border-gray-600 text-slate-800 dark:text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white dark:bg-gray-800 transition-all duration-200 text-sm font-medium"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="block text-sm font-semibold text-slate-700 dark:text-gray-200 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 dark:border-gray-600 text-slate-800 dark:text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white dark:bg-gray-800 transition-all duration-200 text-sm font-medium"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label htmlFor="reg-mobile" className="block text-sm font-semibold text-slate-700 dark:text-gray-200 mb-1.5">
                Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 8.25h3" />
                  </svg>
                </div>
                <input
                  id="reg-mobile"
                  name="mobile_number"
                  type="tel"
                  autoComplete="tel"
                  required
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="+94 77 123 4567"
                  className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 dark:border-gray-600 text-slate-800 dark:text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white dark:bg-gray-800 transition-all duration-200 text-sm font-medium"
                />
              </div>
            </div>

            {/* Doctor Specific Fields */}
            <div className="space-y-5 p-5 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-700/40">
              <h3 className="text-sm font-bold text-indigo-800 dark:text-indigo-300">Doctor Professional Details</h3>
              
              {/* Specialization */}
              <div>
                <label htmlFor="reg-specialization" className="block text-sm font-semibold text-slate-700 dark:text-gray-200 mb-1.5">
                  Specialization
                </label>
                <select
                  id="reg-specialization"
                  name="specialization"
                  required
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="block w-full px-4 py-3 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600 text-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm font-medium"
                >
                  <option value="" disabled>Select Specialization</option>
                  <option value="Psychology">Psychology</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="General Practice">General Practice</option>
                </select>
              </div>

              {/* Experience */}
              <div>
                <label htmlFor="reg-experience" className="block text-sm font-semibold text-slate-700 dark:text-gray-200 mb-1.5">
                  Experience (Years)
                </label>
                <input
                  id="reg-experience"
                  name="experience"
                  type="number"
                  min="0"
                  max="60"
                  required
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="e.g. 5"
                  className="block w-full px-4 py-3 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600 text-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm font-medium"
                />
              </div>

              {/* Bio */}
              <div>
                <label htmlFor="reg-bio" className="block text-sm font-semibold text-slate-700 dark:text-gray-200 mb-1.5">
                  Professional Bio
                </label>
                <textarea
                  id="reg-bio"
                  name="bio"
                  rows="3"
                  required
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Brief description of your background..."
                  className="block w-full px-4 py-3 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600 text-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm font-medium resize-none"
                ></textarea>
              </div>
            </div>

            {/* Identity Verification Section */}
            <div className="space-y-4 p-5 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-700/40">
              <div className="flex flex-col">
                <h3 className="text-sm font-bold text-indigo-800 dark:text-indigo-300">Medical Council Verification</h3>
                <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">Please upload clear photos of the front and back of your medical ID.</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                {/* Front ID */}
                <div className="relative group">
                  <label 
                    htmlFor="reg-id-front" 
                    onDragOver={handleDragOverFront}
                    onDragLeave={handleDragLeaveFront}
                    onDrop={handleDropFront}
                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 overflow-hidden ${isDraggingFront ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/40' : 'border-indigo-200 dark:border-indigo-700/50 bg-white dark:bg-gray-800 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/30'}`}
                  >
                    {idCardFront ? (
                      <img src={URL.createObjectURL(idCardFront)} alt="Front ID Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-2 text-indigo-400 dark:text-indigo-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                        </svg>
                        <p className="text-sm font-semibold text-slate-700 dark:text-gray-200">Front Side</p>
                        <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 truncate max-w-[150px] px-2">Click to upload</p>
                      </div>
                    )}
                    <input id="reg-id-front" name="id_card_front" type="file" accept="image/*" required onChange={(e) => setIdCardFront(e.target.files[0])} className="hidden" />
                  </label>
                  {idCardFront && (
                    <div className="absolute top-2 right-2 bg-indigo-500 text-white p-1 rounded-full shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Rear ID */}
                <div className="relative group">
                  <label 
                    htmlFor="reg-id-rear" 
                    onDragOver={handleDragOverRear}
                    onDragLeave={handleDragLeaveRear}
                    onDrop={handleDropRear}
                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 overflow-hidden ${isDraggingRear ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/40' : 'border-indigo-200 dark:border-indigo-700/50 bg-white dark:bg-gray-800 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/30'}`}
                  >
                    {idCardRear ? (
                      <img src={URL.createObjectURL(idCardRear)} alt="Rear ID Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-2 text-indigo-400 dark:text-indigo-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                        </svg>
                        <p className="text-sm font-semibold text-slate-700 dark:text-gray-200">Back Side</p>
                        <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 truncate max-w-[150px] px-2">Click to upload</p>
                      </div>
                    )}
                    <input id="reg-id-rear" name="id_card_rear" type="file" accept="image/*" required onChange={(e) => setIdCardRear(e.target.files[0])} className="hidden" />
                  </label>
                  {idCardRear && (
                    <div className="absolute top-2 right-2 bg-indigo-500 text-white p-1 rounded-full shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-sm font-semibold text-slate-700 dark:text-gray-200 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                <input
                  id="reg-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="block w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 dark:border-gray-600 text-slate-800 dark:text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white dark:bg-gray-800 transition-all duration-200 text-sm font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:text-gray-300 transition-colors duration-150"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="reg-confirm-password" className="block text-sm font-semibold text-slate-700 dark:text-gray-200 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
                <input
                  id="reg-confirm-password"
                  name="confirm_password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className={`block w-full pl-12 pr-12 py-3.5 bg-slate-50 border text-slate-800 dark:text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent focus:bg-white dark:bg-gray-800 transition-all duration-200 text-sm font-medium
                    ${confirmPassword && confirmPassword !== password
                      ? 'border-red-300 focus:ring-red-400'
                      : confirmPassword && confirmPassword === password
                        ? 'border-indigo-300 focus:ring-indigo-500'
                        : 'border-slate-200 dark:border-gray-600 focus:ring-indigo-500'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((p) => !p)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:text-gray-300 transition-colors duration-150"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  <EyeIcon open={showConfirmPassword} />
                </button>
                {/* Live match indicator */}
                {confirmPassword && (
                  <p className={`text-xs mt-1.5 font-semibold ${confirmPassword === password ? 'text-indigo-600' : 'text-red-500'}`}>
                    {confirmPassword === password ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </p>
                )}
              </div>
            </div>

            {/* Role badge (display only, locked to Doctor) */}
            <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-700/50 rounded-xl px-4 py-3">
              <span className="text-indigo-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <p className="text-sm text-indigo-700 dark:text-indigo-300 font-semibold">
                Registering as: <span className="font-extrabold">Doctor</span>
              </p>
            </div>

            {/* Face Capture Section */}
            <div className="mt-6 mb-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-slate-700 dark:text-gray-200">
                  Biometric Verification <span className="text-xs font-normal text-slate-500">(Optional)</span>
                </p>
              </div>
              {showBiometric ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setShowBiometric(false);
                      setFaceDescriptor(null);
                    }}
                    className="absolute -top-10 right-0 z-10 text-xs font-semibold text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-900/50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Remove
                  </button>
                  <FaceCapture onCapture={setFaceDescriptor} mode="register" />
                </div>
              ) : (
                <div className="bg-slate-50 dark:bg-gray-800/50 border border-dashed border-slate-300 dark:border-gray-700 rounded-xl p-6 text-center flex flex-col items-center justify-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-indigo-400 dark:text-indigo-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5M20.25 16.5v1.5A2.25 2.25 0 0118 20.25h-1.5M7.5 20.25H6A2.25 2.25 0 013.75 18v-1.5" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 10h.01M15 10h.01M12 11v3M9 16c1.5 1.5 4.5 1.5 6 0" />
                  </svg>
                  <p className="text-sm text-slate-500 dark:text-gray-400">
                    Use facial recognition for faster and secure login.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowBiometric(true)}
                    className="mt-1 text-sm font-semibold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/40 dark:text-indigo-300 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 px-4 py-2 rounded-lg transition-colors"
                  >
                    Enable Biometrics
                  </button>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="register-submit-btn"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl text-white text-sm font-bold shadow-lg transition-all duration-200 ease-out
                ${loading
                  ? 'bg-indigo-400 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-indigo-300/50 dark:shadow-indigo-900/50 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0'
                }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account...
                </>
              ) : (
                'Create My Account'
              )}
            </button>
          </form>

          {/* Footer Note */}
          <p className="mt-6 text-center text-xs text-slate-400 font-medium">
            By registering, you agree to CareSync's Terms of Service and Privacy Policy.
          </p>
        </div>

        {/* Already have account link */}
        <p className="text-center mt-6 text-sm text-slate-500 dark:text-gray-400">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors duration-150"
          >
            Sign in instead
          </button>
        </p>
      </div>
    </div>
  );
};

export default DoctorRegister;
