import React, { useState, useEffect, useRef } from 'react';
import { Moon, Sun, User, X, Home, Calendar, Settings, LogOut, HeartPulse, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';

const Header = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Check local storage or system preference on load
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDarkMode(true);
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        <div className="flex items-center">
          <span className="text-2xl font-bold text-blue-700 dark:text-blue-400 cursor-pointer" onClick={() => navigate('/')}>CareSync</span>
        </div>
        <nav className="hidden md:flex space-x-8">
          <button onClick={() => navigate('/#hero')} className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">Home</button>
          <button onClick={() => navigate('/#doctors')} className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">Doctors</button>
          <button onClick={() => navigate('/#services')} className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">Services</button>
          {/* <a href="#login" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">Login portal</a> */}
        </nav>
        <div className="flex items-center space-x-4">
          <button 
            onClick={toggleDarkMode} 
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          {!isAuthenticated ? (
            <>
              <button
                onClick={() => navigate('/login', { state: { role: 'Patient' } })}
                className="bg-blue-600 text-white px-5 py-2 rounded-md font-semibold hover:bg-blue-700 transition"
              >
                Patient Login
              </button>
              <button
                onClick={() => navigate('/login', { state: { role: 'Doctor' } })}
                className="bg-blue-600 text-white px-5 py-2 rounded-md font-semibold hover:bg-blue-700 transition"
              >
                Doctor Login
              </button>
            </>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 border border-blue-600 hover:bg-blue-200 dark:hover:bg-blue-800 transition shadow-sm overflow-hidden ring-2 ring-transparent hover:ring-blue-300 dark:hover:ring-blue-700"
                title="Account Menu"
              >
                {user?.name || user?.full_name ? <span className="font-bold text-lg">{(user?.name || user?.full_name || 'U').charAt(0).toUpperCase()}</span> : <User size={20} />}
              </button>

              {/* Google-Style Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-[-120px] md:right-[-180px] mt-4 w-[360px] bg-[#f8fafc] dark:bg-slate-800 rounded-[28px] shadow-2xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden flex flex-col transform origin-top-right transition-all duration-200 ease-out">
                  
                  {/* Top Bar with Close Button */}
                  <div className="flex justify-between items-center px-6 pt-4 pb-2">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300 truncate w-full text-center">
                      {user?.email || 'user@caresync.com'}
                    </span>
                    <button 
                      onClick={() => setIsDropdownOpen(false)}
                      className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full p-1.5 transition-colors absolute right-4 top-4"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Avatar & Greeting Section */}
                  <div className="flex flex-col items-center pt-2 pb-4 px-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-3xl font-bold shadow-md border-4 border-white dark:border-slate-800 mb-3 relative">
                      {(user?.name || user?.full_name || 'U').charAt(0).toUpperCase()}
                      <div className="absolute bottom-0 right-0 bg-white dark:bg-slate-800 rounded-full p-1 shadow-sm border border-slate-200 dark:border-slate-600">
                        <User size={12} className="text-slate-600 dark:text-slate-300" />
                      </div>
                    </div>
                    <h3 className="text-xl font-medium text-slate-800 dark:text-white mb-4">
                      Hi, {user?.name || user?.full_name || 'User'}!
                    </h3>
                    
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate('/edit-profile');
                      }}
                      className="px-5 py-2 mt-1 rounded-full border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95 w-full sm:w-auto flex items-center justify-center gap-2"
                    >
                      Manage your CareSync Profile
                    </button>
                  </div>

                  {/* Dashboard Sections List */}
                  <div className="bg-white dark:bg-slate-900 mx-2 mb-2 rounded-2xl flex flex-col overflow-hidden shadow-inner border border-slate-100 dark:border-slate-800">
                    
                    <button 
                      onClick={() => { setIsDropdownOpen(false); navigate(user?.role === 'Doctor' ? '/doctor/dashboard' : '/patient/dashboard'); }}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left border-b border-slate-100 dark:border-slate-800"
                    >
                      <Home className="text-slate-500 dark:text-slate-400" size={20} />
                      <span className="font-medium text-slate-700 dark:text-slate-200">Dashboard</span>
                    </button>
                    
                    <button 
                      onClick={() => { setIsDropdownOpen(false); navigate(user?.role === 'Doctor' ? '/doctor/kanban' : '/patient/appointments'); }}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left border-b border-slate-100 dark:border-slate-800"
                    >
                      <Calendar className="text-slate-500 dark:text-slate-400" size={20} />
                      <span className="font-medium text-slate-700 dark:text-slate-200">{user?.role === 'Doctor' ? 'Appointments Board' : 'My Appointments'}</span>
                    </button>

                    <button 
                      onClick={() => { setIsDropdownOpen(false); navigate(user?.role === 'Doctor' ? '/doctor/history' : '/patient/medical-profile'); }}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left border-b border-slate-100 dark:border-slate-800"
                    >
                      {user?.role === 'Doctor' ? <History className="text-slate-500 dark:text-slate-400" size={20} /> : <HeartPulse className="text-slate-500 dark:text-slate-400" size={20} />}
                      <span className="font-medium text-slate-700 dark:text-slate-200">{user?.role === 'Doctor' ? 'Appointment History' : 'Medical Profile'}</span>
                    </button>
                    <button 
                      onClick={() => { setIsDropdownOpen(false); navigate('/edit-profile'); }}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left border-b border-slate-100 dark:border-slate-800"
                    >
                      <Settings className="text-slate-500 dark:text-slate-400" size={20} />
                      <span className="font-medium text-slate-700 dark:text-slate-200">Settings</span>
                    </button>
                    <div className="p-2">
                      <button 
                        onClick={() => {
                          setIsDropdownOpen(false);
                          dispatch(logout());
                          navigate('/login');
                        }}
                        className="flex items-center gap-4 px-4 py-3 w-full hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl transition-colors text-left font-medium"
                      >
                        <LogOut size={20} />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>

                </div>
              )}
            </div>
          )}
          <button onClick={() => navigate('/#doctors')} className="bg-blue-600 text-white px-5 py-2 rounded-md font-semibold hover:bg-blue-700 transition">
            Book Appointment
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;