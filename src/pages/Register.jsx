import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { loginSuccess } from '../features/auth/authSlice';

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
  const dispatch = useDispatch();

  const [fullName, setFullName]               = useState('');
  const [email, setEmail]                     = useState('');
  const [mobileNumber, setMobileNumber]       = useState('');
  const [password, setPassword]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole]                       = useState('Patient');

  // Doctor specific fields
  const [specialization, setSpecialization]   = useState('');
  const [experience, setExperience]           = useState('');
  const [bio, setBio]                         = useState('');

  const [showPassword, setShowPassword]           = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast]     = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // ── Client-side validation ────────────────────────────────────────────────
    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!mobileNumber.trim()) {
      setError('Please enter your mobile number.');
      return;
    }
    if (!/^[0-9+\-\s]{7,15}$/.test(mobileNumber.trim())) {
      setError('Please enter a valid mobile number.');
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

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        full_name: fullName.trim(),
        email,
        mobile_number: mobileNumber.trim(),
        password,
        role,
        ...(role === 'Doctor' && {
          specialization,
          experience: experience.toString() + ' Years',
          bio
        })
      });

      const { token, user } = response.data;

      // Auto-login: persist token & user in Redux + localStorage
      dispatch(loginSuccess({ user, token }));

      setToast(true);

      // Brief pause to show the success toast, then go straight to dashboard
      setTimeout(() => navigate(role === 'Doctor' ? '/doctor' : '/patient-dashboard'), 1800);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Success Toast */}
      {toast && (
        <SuccessToast
          message="Account created! Taking you to your dashboard..."
          onClose={() => setToast(false)}
        />
      )}

      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />

      {/* Card container */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-blue-200/50 p-8 md:p-10 border border-white/60">

          {/* ── Back to Home ────────────────────────────────────────────── */}
          <div className="flex justify-start mb-2">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 font-semibold transition-colors duration-150 group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-150">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back to Home
            </button>
          </div>

          {/* ── Logo & Header ────────────────────────────────────────────── */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg shadow-emerald-300 mb-5">
              {/* Medical cross icon */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Create Account</h1>
            <p className="mt-2 text-slate-500 text-base font-medium">Join CareSync as a {role}</p>
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

            {/* Role Selection */}
            <div className="flex gap-4 mb-4">
              <label className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-xl cursor-pointer transition-all ${role === 'Patient' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold shadow-sm' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                <input type="radio" name="role" value="Patient" checked={role === 'Patient'} onChange={(e) => setRole(e.target.value)} className="hidden" />
                Patient
              </label>
              <label className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-xl cursor-pointer transition-all ${role === 'Doctor' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold shadow-sm' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                <input type="radio" name="role" value="Doctor" checked={role === 'Doctor'} onChange={(e) => setRole(e.target.value)} className="hidden" />
                Doctor
              </label>
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="reg-fullname" className="block text-sm font-semibold text-slate-700 mb-1.5">
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
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white transition-all duration-200 text-sm font-medium"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="block text-sm font-semibold text-slate-700 mb-1.5">
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
                  className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white transition-all duration-200 text-sm font-medium"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label htmlFor="reg-mobile" className="block text-sm font-semibold text-slate-700 mb-1.5">
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
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="+94 77 123 4567"
                  className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white transition-all duration-200 text-sm font-medium"
                />
              </div>
            </div>

            {/* Doctor Specific Fields */}
            {role === 'Doctor' && (
              <div className="space-y-5 p-5 bg-blue-50/50 rounded-xl border border-blue-100">
                <h3 className="text-sm font-bold text-blue-800">Doctor Professional Details</h3>
                
                {/* Specialization */}
                <div>
                  <label htmlFor="reg-specialization" className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Specialization
                  </label>
                  <select
                    id="reg-specialization"
                    name="specialization"
                    required
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="block w-full px-4 py-3 bg-white border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-sm font-medium"
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
                  <label htmlFor="reg-experience" className="block text-sm font-semibold text-slate-700 mb-1.5">
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
                    className="block w-full px-4 py-3 bg-white border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-sm font-medium"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label htmlFor="reg-bio" className="block text-sm font-semibold text-slate-700 mb-1.5">
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
                    className="block w-full px-4 py-3 bg-white border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-sm font-medium resize-none"
                  ></textarea>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="reg-password" className="block text-sm font-semibold text-slate-700 mb-1.5">
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
                  className="block w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white transition-all duration-200 text-sm font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors duration-150"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="reg-confirm-password" className="block text-sm font-semibold text-slate-700 mb-1.5">
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
                  className={`block w-full pl-12 pr-12 py-3.5 bg-slate-50 border text-slate-800 placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent focus:bg-white transition-all duration-200 text-sm font-medium
                    ${confirmPassword && confirmPassword !== password
                      ? 'border-red-300 focus:ring-red-400'
                      : confirmPassword && confirmPassword === password
                        ? 'border-emerald-300 focus:ring-emerald-500'
                        : 'border-slate-200 focus:ring-emerald-500'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((p) => !p)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors duration-150"
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

            {/* Role badge */}
            <div className={`flex items-center gap-2 border rounded-xl px-4 py-3 ${
              role === 'Doctor' ? 'bg-indigo-50 border-indigo-100' : 'bg-blue-50 border-blue-100'
            }`}>
              <span className={role === 'Doctor' ? 'text-indigo-500' : 'text-blue-500'}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <p className={`text-sm font-semibold ${role === 'Doctor' ? 'text-indigo-700' : 'text-blue-700'}`}>
                Registering as: <span className="font-extrabold">{role}</span>
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="register-submit-btn"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl text-white text-sm font-bold shadow-lg transition-all duration-200 ease-out
                ${loading
                  ? 'bg-emerald-400 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 shadow-emerald-300/50 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0'
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
        <p className="text-center mt-6 text-sm text-slate-500">
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
  );
};

export default Register;
