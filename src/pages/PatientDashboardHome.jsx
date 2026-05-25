import React from 'react';
import { useSelector } from 'react-redux';
import Header from '../components/Header';

const CalendarIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
  </svg>
);
const HeartIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
);
const ClipboardIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
  </svg>
);

const PatientDashboardHome = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-blue-100 flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-10">
        
        {/* Welcome Banner */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-400 rounded-3xl p-8 md:p-10 shadow-lg shadow-blue-200 text-white mb-8 relative overflow-hidden group">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3 tracking-tight">
              Welcome back, {user?.name || user?.firstName || 'Patient'}! 👋
            </h2>
            <p className="text-blue-50 text-lg md:text-xl max-w-2xl font-medium leading-relaxed">
              Here is your daily health summary. Stay on track with your upcoming appointments and wellness goals.
            </p>
          </div>
          {/* Decorative background shapes */}
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
        </div>

        {/* Summary Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Upcoming Appointments */}
          <div className="bg-white rounded-3xl p-7 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 hover:border-blue-100 transition-all duration-300 group cursor-pointer relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-300"></div>
            <div className="flex items-center justify-between mb-5 relative z-10">
              <div className="p-3.5 bg-blue-100 text-blue-700 rounded-2xl group-hover:rotate-6 transition-transform duration-300">
                <CalendarIcon className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 shadow-sm">Next 7 Days</span>
            </div>
            <h3 className="text-slate-500 text-sm font-semibold mb-1 uppercase tracking-wider">Upcoming Appointments</h3>
            <p className="text-3xl font-extrabold text-slate-800">2 Scheduled</p>
          </div>

          {/* Card 2: Recent Diagnoses */}
          <div className="bg-white rounded-3xl p-7 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 hover:border-emerald-100 transition-all duration-300 group cursor-pointer relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-300"></div>
            <div className="flex items-center justify-between mb-5 relative z-10">
              <div className="p-3.5 bg-emerald-100 text-emerald-700 rounded-2xl group-hover:rotate-6 transition-transform duration-300">
                <ClipboardIcon className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 shadow-sm">New Updates</span>
            </div>
            <h3 className="text-slate-500 text-sm font-semibold mb-1 uppercase tracking-wider">Recent Diagnoses</h3>
            <p className="text-3xl font-extrabold text-slate-800">1 Added</p>
          </div>

          {/* Card 3: Medical Profile Status */}
          <div className="bg-white rounded-3xl p-7 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 hover:border-purple-100 transition-all duration-300 group cursor-pointer relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-300"></div>
            <div className="flex items-center justify-between mb-5 relative z-10">
              <div className="p-3.5 bg-purple-100 text-purple-700 rounded-2xl group-hover:rotate-6 transition-transform duration-300">
                <HeartIcon className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-full border border-purple-100 shadow-sm">Looking Good</span>
            </div>
            <h3 className="text-slate-500 text-sm font-semibold mb-1 uppercase tracking-wider">Medical Profile Status</h3>
            <p className="text-3xl font-extrabold text-slate-800">95% Complete</p>
          </div>
        </div>
        
      </main>
    </div>
  );
};

export default PatientDashboardHome;
