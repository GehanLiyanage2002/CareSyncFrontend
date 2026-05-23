import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { loginSuccess } from '../features/auth/authSlice';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });

      // Extract JWT token and user details from the response
      const { token, user } = response.data;

      // Dispatch loginSuccess to update Redux store AND persist to localStorage
      dispatch(loginSuccess({ user, token }));

      // Role-based navigation: Patient goes to /patient-dashboard
      if (user?.role === 'Patient') {
        navigate('/patient-dashboard');
      } else if (user?.role === 'Doctor') {
        navigate('/doctor');
      } else if (user?.role === 'Receptionist') {
        navigate('/receptionist');
      } else if (user?.role === 'Admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Invalid email or password. Please try again.');
      } else if (err.response?.status === 404) {
        setError('No account found with this email address.');
      } else {
        setError(
          err.response?.data?.message || 'Something went wrong. Please try again later.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-blue-200/50 p-8 md:p-10 border border-white/60">
          
          {/* Back to Home */}
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

          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-lg shadow-blue-300 mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Welcome Back</h1>
            <p className="mt-2 text-slate-500 text-base font-medium">Sign in to your CareSync account</p>
          </div>

          {/* Error Alert */}
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

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 text-sm font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 text-sm font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors duration-150"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <button type="button" className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-150">
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="login-submit-btn"
              disabled={loading}
              className={`w-full relative flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl text-white text-sm font-bold shadow-lg transition-all duration-200 ease-out
                ${loading
                  ? 'bg-blue-400 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-blue-300/50 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0'
                }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign In to CareSync'
              )}
            </button>
          </form>

          {/* Footer Note */}
          <p className="mt-6 text-center text-xs text-slate-400 font-medium">
            Protected by industry-standard encryption. Your data is safe with us.
          </p>
        </div>

        <p className="text-center mt-6 text-sm text-slate-500">
          Don't have an account?{' '}
          <button type="button" onClick={() => navigate('/register')} className="font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-150">
            Create an account
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
