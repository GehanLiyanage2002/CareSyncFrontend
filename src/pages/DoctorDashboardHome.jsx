import React from 'react';
import { useSelector } from 'react-redux';
import Header from '../components/Header';
import { Calendar, CheckCircle, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DoctorDashboardHome = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-teal-100 flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-10">
        
        {/* Welcome Banner */}
        <div className="bg-gradient-to-br from-teal-600 to-teal-400 rounded-3xl p-8 md:p-10 shadow-lg shadow-teal-200 text-white mb-8 relative overflow-hidden group">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3 tracking-tight">
              Welcome back, Dr. {user?.name || user?.full_name || 'Doctor'}! 🩺
            </h2>
            <p className="text-teal-50 text-lg md:text-xl max-w-2xl font-medium leading-relaxed">
              Here is your daily clinical overview. Stay on top of your schedule and manage your patients efficiently.
            </p>
          </div>
          {/* Decorative background shapes */}
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
        </div>

        {/* Summary Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Pending Appointments */}
          <div 
            onClick={() => navigate('/doctor/kanban')}
            className="bg-white rounded-3xl p-7 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 hover:border-teal-100 transition-all duration-300 group cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-300"></div>
            <div className="flex items-center justify-between mb-5 relative z-10">
              <div className="p-3.5 bg-teal-100 text-teal-700 rounded-2xl group-hover:rotate-6 transition-transform duration-300">
                <Calendar className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1.5 rounded-full border border-teal-100 shadow-sm">Today</span>
            </div>
            <h3 className="text-slate-500 text-sm font-semibold mb-1 uppercase tracking-wider">Pending Appointments</h3>
            <p className="text-3xl font-extrabold text-slate-800">5 Scheduled</p>
          </div>

          {/* Card 2: Completed Consultations */}
          <div 
            onClick={() => navigate('/doctor/history')}
            className="bg-white rounded-3xl p-7 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 hover:border-blue-100 transition-all duration-300 group cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-300"></div>
            <div className="flex items-center justify-between mb-5 relative z-10">
              <div className="p-3.5 bg-blue-100 text-blue-700 rounded-2xl group-hover:rotate-6 transition-transform duration-300">
                <CheckCircle className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 shadow-sm">This Week</span>
            </div>
            <h3 className="text-slate-500 text-sm font-semibold mb-1 uppercase tracking-wider">Completed Consultations</h3>
            <p className="text-3xl font-extrabold text-slate-800">12 Patients</p>
          </div>

          {/* Card 3: Total Patients */}
          <div className="bg-white rounded-3xl p-7 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 hover:border-purple-100 transition-all duration-300 group cursor-pointer relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-300"></div>
            <div className="flex items-center justify-between mb-5 relative z-10">
              <div className="p-3.5 bg-purple-100 text-purple-700 rounded-2xl group-hover:rotate-6 transition-transform duration-300">
                <Users className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-full border border-purple-100 shadow-sm">All Time</span>
            </div>
            <h3 className="text-slate-500 text-sm font-semibold mb-1 uppercase tracking-wider">Total Unique Patients</h3>
            <p className="text-3xl font-extrabold text-slate-800">148</p>
          </div>
        </div>
        
        {/* Back Button */}
        <div className="mt-12 flex justify-center">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-6 py-3 bg-white text-slate-600 hover:text-teal-600 font-medium rounded-full shadow-sm hover:shadow-md border border-slate-200 hover:border-teal-200 transition-all duration-300 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:-translate-x-1 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
            </svg>
            Back to Home
          </button>
        </div>
        
      </main>
    </div>
  );
};

export default DoctorDashboardHome;
