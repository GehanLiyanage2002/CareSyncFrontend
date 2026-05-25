import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import DoctorKanbanBoard from '../components/doctor/DoctorKanbanBoard';

const DoctorKanbanPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-teal-100 flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-10">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Appointments Board</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Drag and drop appointments to manage their status.</p>
        </div>
        
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 min-h-[600px] overflow-hidden">
          <DoctorKanbanBoard />
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

export default DoctorKanbanPage;
