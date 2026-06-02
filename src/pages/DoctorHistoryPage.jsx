import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import AppointmentHistory from '../components/doctor/AppointmentHistory';

const DoctorHistoryPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-teal-100 flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-10">
        <div className="min-h-[600px]">
          <AppointmentHistory />
        </div>

        {/* Back Button */}
        <div className="mt-12 flex justify-center pb-8">
          <button 
            onClick={() => navigate('/doctor/dashboard')}
            className="flex items-center gap-2 px-6 py-3 bg-white text-slate-600 hover:text-teal-600 font-medium rounded-full shadow-sm hover:shadow-md border border-slate-200 hover:border-teal-200 transition-all duration-300 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:-translate-x-1 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
        </div>
      </main>
    </div>
  );
};

export default DoctorHistoryPage;
