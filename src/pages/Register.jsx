import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { validateFormFields } from '../utils/validation';
import FaceCapture from '../components/FaceCapture';

// ── Success Toast ─────────────────────────────────────────────────────────────
const SuccessToast = ({ message, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-emerald-500 text-white px-5 py-4 rounded-2xl shadow-2xl shadow-emerald-200 font-semibold text-sm animate-[fadeInDown_0.3s_ease-out]">
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

// ── Register Page ─────────────────────────────────────────────────────────────
const Register = () => {
  const navigate = useNavigate();

  const [fullName, setFullName]               = useState('');
  const [email, setEmail]                     = useState('');
  const [mobileNumber, setMobileNumber]       = useState('');
  const [address, setAddress]                 = useState('');
  const [dateOfBirth, setDateOfBirth]         = useState('');
  const [gender, setGender]                   = useState('');
  const [password, setPassword]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const role                                  = 'Patient'; // default & fixed

  const [showPassword, setShowPassword]           = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [faceDescriptor, setFaceDescriptor] = useState(null);
  const [showBiometric, setShowBiometric] = useState(false);

  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

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
    if (!/^07[0-9]{8}$/.test(mobileNumber.trim())) {
      setError('Please enter a valid 10-digit mobile number starting with 07.');
      return;
    }
    if (!address.trim()) {
      setError('Please enter your address.');
      return;
    }
    if (!dateOfBirth) {
      setError('Please enter your date of birth.');
      return;
    }
    if (!gender) {
      setError('Please select your gender.');
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

    // SQL Injection validation
    const validation = validateFormFields({ full_name: fullName, email, mobile_number: mobileNumber });
    if (!validation.isValid) {
      setError(validation.message);
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://127.0.0.1:5000/api/auth/register', {
        full_name: fullName.trim(),
        email,
        mobile_number: mobileNumber.trim(),
        address: address.trim(),
        date_of_birth: dateOfBirth,
        gender,
        password,
        role,
        faceDescriptor
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
    <div className="min-h-screen flex">
      {/* Left side: Graphic / Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#edf4fa] dark:bg-gray-900 items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none mix-blend-multiply"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%233b82f6' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            backgroundSize: '400px 400px'
          }}
        ></div>
        <div className="relative z-10 w-full max-w-lg p-12 text-center">
          <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-[2rem] mx-auto mb-10 flex items-center justify-center shadow-xl shadow-blue-200/50 rotate-3 hover:rotate-6 transition-transform duration-500">
            <span className="text-4xl font-black text-blue-600 tracking-tighter">CS</span>
          </div>
          <h2 className="text-5xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight leading-[1.1]">
            Your Health,<br />Our Priority
          </h2>
          <p className="text-lg text-slate-600 dark:text-gray-300 font-medium leading-relaxed max-w-sm mx-auto">
            Connect with top-tier healthcare professionals in a seamless and modern way.
          </p>
        </div>
      </div>

      {/* Right side: Form */}
      <div className="w-full lg:w-1/2 bg-white dark:bg-gray-800 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-20 relative overflow-y-auto">
        <div className="w-full max-w-md">

          {/* ── Back to Home ────────────────────────────────────────────── */}
          <div className="flex justify-start mb-2">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-gray-400 hover:text-blue-600 font-semibold transition-colors duration-150 group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-150">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back to Home
            </button>
          </div>

          {/* ── Header ────────────────────────────────────────────── */}
          <div className="mb-8 mt-4">
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Create Account</h1>
            <p className="mt-2 text-slate-500 dark:text-gray-400 text-base font-medium">Join CareSync as a Patient</p>
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
                  placeholder="John Doe"
                  className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 dark:border-gray-600 text-slate-800 dark:text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white dark:bg-gray-800 transition-all duration-200 text-sm font-medium"
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
                  className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 dark:border-gray-600 text-slate-800 dark:text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white dark:bg-gray-800 transition-all duration-200 text-sm font-medium"
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
                  placeholder="071 234 5678"
                  className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 dark:border-gray-600 text-slate-800 dark:text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white dark:bg-gray-800 transition-all duration-200 text-sm font-medium"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label htmlFor="reg-address" className="block text-sm font-semibold text-slate-700 dark:text-gray-200 mb-1.5">
                Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 pt-3.5 flex items-start pointer-events-none text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                </div>
                <textarea
                  id="reg-address"
                  name="address"
                  rows="2"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main St, City"
                  className="block w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 dark:border-gray-600 text-slate-800 dark:text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white dark:bg-gray-800 transition-all duration-200 text-sm font-medium resize-none"
                />
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label htmlFor="reg-dob" className="block text-sm font-semibold text-slate-700 dark:text-gray-200 mb-1.5">
                Date of Birth
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                </div>
                <input
                  id="reg-dob"
                  name="date_of_birth"
                  type="date"
                  required
                  max={new Date().toISOString().split('T')[0]}
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 dark:border-gray-600 text-slate-800 dark:text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white dark:bg-gray-800 transition-all duration-200 text-sm font-medium"
                />
              </div>
            </div>

            {/* Gender */}
            <div>
              <label htmlFor="reg-gender" className="block text-sm font-semibold text-slate-700 dark:text-gray-200 mb-1.5">
                Gender
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <select
                  id="reg-gender"
                  name="gender"
                  required
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 dark:border-gray-600 text-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white dark:bg-gray-800 transition-all duration-200 text-sm font-medium appearance-none"
                >
                  <option value="" disabled>Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
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
                  className="block w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 dark:border-gray-600 text-slate-800 dark:text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white dark:bg-gray-800 transition-all duration-200 text-sm font-medium"
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
                        ? 'border-emerald-300 focus:ring-emerald-500'
                        : 'border-slate-200 dark:border-gray-600 focus:ring-emerald-500'
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
                  <p className={`text-xs mt-1.5 font-semibold ${confirmPassword === password ? 'text-emerald-600' : 'text-red-500'}`}>
                    {confirmPassword === password ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </p>
                )}
              </div>
            </div>

            {/* Role badge (display only, locked to Patient) */}
            <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-700/50 rounded-xl px-4 py-3">
              <span className="text-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <p className="text-sm text-blue-700 dark:text-blue-300 font-semibold">
                Registering as: <span className="font-extrabold">Patient</span>
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
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-teal-400 dark:text-teal-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5M20.25 16.5v1.5A2.25 2.25 0 0118 20.25h-1.5M7.5 20.25H6A2.25 2.25 0 013.75 18v-1.5" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 10h.01M15 10h.01M12 11v3M9 16c1.5 1.5 4.5 1.5 6 0" />
                  </svg>
                  <p className="text-sm text-slate-500 dark:text-gray-400">
                    Use facial recognition for faster and secure login.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowBiometric(true)}
                    className="mt-1 text-sm font-semibold bg-teal-50 text-teal-600 hover:bg-teal-100 dark:bg-teal-900/40 dark:text-teal-300 dark:hover:bg-teal-900/60 border border-teal-200 dark:border-teal-800 px-4 py-2 rounded-lg transition-colors"
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
                  ? 'bg-emerald-400 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 shadow-emerald-300/50 dark:shadow-emerald-900/50 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0'
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
          <p className="mt-8 text-center text-xs text-slate-400 font-medium">
            By registering, you agree to CareSync's Terms of Service and Privacy Policy.
          </p>

          {/* Already have account link */}
          <p className="text-center mt-6 text-sm text-slate-500 dark:text-gray-400">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-150"
            >
              Sign in instead
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
