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
          {activeTab === 'Patient Queue' && (
            <div className="animate-fadeIn">
              <LiveQueue />
            </div>
          )}

          {activeTab === 'Live Queue' && (
            <div className="animate-fadeIn">
              <GlobalQueueMonitor />
            </div>
          )}

          {activeTab === 'Walk-in' && (
            <div className="animate-fadeIn">
              <WalkInRegistration />
            </div>
          )}

          {activeTab === 'Booking' && (
            <div className="bg-white rounded-3xl p-8 border border-blue-50 shadow-sm min-h-[400px] flex items-center justify-center border-dashed">
              <div className="text-center text-slate-400">
                <Calendar size={48} className="mx-auto mb-4 opacity-50 text-indigo-400" />
                <h4 className="text-lg font-bold text-slate-600 mb-1">Manual Appointment Booking</h4>
                <p className="text-sm font-medium">This module is under construction.</p>
              </div>
            </div>
          )}

          {activeTab === 'Billing' && (
            <div className="bg-white rounded-3xl p-8 border border-blue-50 shadow-sm min-h-[400px] flex items-center justify-center border-dashed">
              <div className="text-center text-slate-400">
                <CreditCard size={48} className="mx-auto mb-4 opacity-50 text-indigo-400" />
                <h4 className="text-lg font-bold text-slate-600 mb-1">Billing & Invoicing</h4>
                <p className="text-sm font-medium">This module is under construction.</p>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default ReceptionistDashboard;
