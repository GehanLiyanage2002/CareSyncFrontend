import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Users, UserPlus, Calendar, CreditCard, LogOut, LayoutDashboard 
} from 'lucide-react';
import { logout } from '../../features/auth/authSlice';

const ReceptionistDashboard = () => {
  const [activeTab, setActiveTab] = useState('Live Queue');
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
    { name: 'Live Queue', icon: <Users size={20} /> },
    { name: 'Register Walk-in Patient', icon: <UserPlus size={20} /> },
    { name: 'Manual Booking', icon: <Calendar size={20} /> },
    { name: 'Billing', icon: <CreditCard size={20} /> },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Left Sidebar */}
      <aside className="w-72 bg-white/95 backdrop-blur-md shadow-sm border-r border-blue-50 flex flex-col justify-between hidden md:flex">
        <div>
          {/* Logo */}
          <div className="p-6 border-b border-blue-50 flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-md shadow-blue-200">
              CS
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700 leading-tight">CareSync</h1>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">Reception</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-2 mt-4">
            <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Menu</p>
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  activeTab === item.name
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 font-bold border border-blue-100 shadow-sm'
                    : 'text-slate-500 font-medium hover:bg-slate-50 hover:text-blue-600'
                }`}
              >
                <div className={`${activeTab === item.name ? 'text-blue-600' : 'text-slate-400'}`}>
                  {item.icon}
                </div>
                <span className="text-sm">{item.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* User Info & Logout */}
        <div className="p-6 border-t border-blue-50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'R'}
            </div>
            <div>
              <p className="font-bold text-slate-700 text-sm truncate max-w-[120px]">{user?.name || 'Receptionist'}</p>
              <p className="text-[11px] font-medium text-emerald-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-sm shadow-amber-200 text-sm"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Mobile Header (visible only on small screens) */}
        <header className="md:hidden bg-white shadow-sm border-b border-blue-50 flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
             <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                CS
             </div>
             <h1 className="text-lg font-bold text-indigo-900">Reception</h1>
          </div>
          <button onClick={handleLogout} className="text-slate-400 hover:text-amber-500">
             <LogOut size={20} />
          </button>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header Title */}
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">{activeTab}</h2>
              <p className="text-slate-500 font-medium mt-1">Manage {activeTab.toLowerCase()} efficiently.</p>
            </div>

            {/* Dynamic Content */}
            {activeTab === 'Live Queue' && (
              <div className="space-y-6">
                {/* Welcome Banner */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-lg shadow-blue-200/50 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
                   
                   <div className="relative z-10 w-full">
                      <p className="text-blue-100 font-bold uppercase tracking-wider text-xs mb-2">Welcome Back</p>
                      <h3 className="text-2xl md:text-3xl font-black mb-2">Hello, {user?.name || 'Receptionist'}! 👋</h3>
                      <p className="text-blue-100 font-medium text-sm md:text-base max-w-lg">
                        Have a great day at work. Use the menu on the left to manage the live queue, register walk-in patients, and handle manual bookings.
                      </p>
                   </div>
                   
                   <div className="relative z-10 hidden md:block shrink-0">
                      <div className="w-24 h-24 bg-white/10 rounded-[1.5rem] flex items-center justify-center backdrop-blur-sm border border-white/20">
                         <LayoutDashboard size={40} className="text-white/80" />
                      </div>
                   </div>
                </div>

                {/* Placeholder for Live Queue Content */}
                <div className="bg-white rounded-3xl p-8 border border-blue-50 shadow-sm min-h-[300px] flex items-center justify-center border-dashed">
                  <div className="text-center text-slate-400">
                    <Users size={48} className="mx-auto mb-4 opacity-50 text-indigo-400" />
                    <h4 className="text-lg font-bold text-slate-600 mb-1">Live Queue Area</h4>
                    <p className="text-sm font-medium">This module is under construction.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Register Walk-in Patient' && (
              <div className="bg-white rounded-3xl p-8 border border-blue-50 shadow-sm min-h-[400px] flex items-center justify-center border-dashed">
                  <div className="text-center text-slate-400">
                    <UserPlus size={48} className="mx-auto mb-4 opacity-50 text-indigo-400" />
                    <h4 className="text-lg font-bold text-slate-600 mb-1">Walk-in Patient Registration</h4>
                    <p className="text-sm font-medium">This module is under construction.</p>
                  </div>
              </div>
            )}

            {activeTab === 'Manual Booking' && (
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
        </div>
      </main>
    </div>
  );
};

export default ReceptionistDashboard;
