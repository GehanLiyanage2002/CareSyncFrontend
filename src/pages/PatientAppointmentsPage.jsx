import React from 'react';
import Header from '../components/Header';

const PatientAppointmentsPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-blue-100 flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-10">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 min-h-[400px]">
          <h3 className="text-2xl font-bold text-slate-800 mb-6">My Appointments</h3>
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <p className="text-lg font-medium">Content for My Appointments will be displayed here.</p>
            <p className="text-sm mt-2">You have no upcoming appointments.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientAppointmentsPage;
