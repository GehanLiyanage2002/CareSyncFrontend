import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Users, UserPlus, Calendar, CreditCard, LayoutDashboard, Monitor
} from 'lucide-react';
import { logout } from '../../features/auth/authSlice';
import WalkInRegistration from './WalkInRegistration';
import LiveQueue from './LiveQueue';
import GlobalQueueMonitor from './GlobalQueueMonitor';

const ReceptionistDashboard = () => {
  const [activeTab, setActiveTab] = useState('Patient Queue');
  const { token, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!token || user?.role !== 'Receptionist') {
      navigate('/login');
    }
  }, [token, user, navigate]);

  const handleLogout = () => {
    navigate('/login', { state: { role: 'Receptionist' }, replace: true });
    setTimeout(() => {
      dispatch(logout());
    }, 10);
  };

  const navItems = [
    { name: 'Patient Queue', icon: <Users /> },
    { name: 'Live Queue', icon: <Monitor /> },
    { name: 'Walk-in', icon: <UserPlus /> },
    { name: 'Booking', icon: <Calendar /> },
    { name: 'Billing', icon: <CreditCard /> },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Header Navbar */}
      <header className="bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50 flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-md shadow-blue-200">
            CS
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700 leading-tight">CareSync</h1>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">Reception</p>
          </div>
        </div>

        {/* Navigation Pills */}
        <nav className="hidden md:flex bg-blue-50/50 rounded-full p-1.5 border border-blue-100 shadow-inner">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`flex items-center flex-col px-5 py-1.5 rounded-full transition-all duration-300 min-w-[90px] ${activeTab === item.name
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-blue-600 hover:bg-blue-100/50'
                }`}
            >
              {React.cloneElement(item.icon, { size: 18, className: 'mb-0.5' })}
              <span className="text-[10px] font-bold uppercase tracking-wider">{item.name}</span>
            </button>
          ))}
        </nav>

        {/* Sign Out */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-full font-bold transition-all shadow-sm shadow-amber-200 text-sm hover:-translate-y-0.5"
        >
          Sign Out
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 relative">
        <div className="max-w-7xl mx-auto">


          {/* Dynamic Content */}
          <div className={`${activeTab === 'Patient Queue' ? 'block animate-fadeIn' : 'hidden'}`}>
            <LiveQueue />
          </div>

          <div className={`${activeTab === 'Live Queue' ? 'block animate-fadeIn' : 'hidden'}`}>
            <GlobalQueueMonitor />
          </div>

          <div className={`${activeTab === 'Walk-in' ? 'block animate-fadeIn' : 'hidden'}`}>
            <WalkInRegistration />
          </div>

          <div className={`${activeTab === 'Booking' ? 'block animate-fadeIn' : 'hidden'}`}>
            <div className="bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-slate-200 p-12 text-center shadow-sm">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <Calendar size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-600 mb-2">Booking System</h3>
              <p className="text-slate-400 font-medium">Under Construction</p>
            </div>
          </div>

          <div className={`${activeTab === 'Billing' ? 'block animate-fadeIn' : 'hidden'}`}>
            <div className="bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-slate-200 p-12 text-center shadow-sm">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <CreditCard size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-600 mb-2">Billing System</h3>
              <p className="text-slate-400 font-medium">Under Construction</p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default ReceptionistDashboard;
