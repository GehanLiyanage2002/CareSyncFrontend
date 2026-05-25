import React from 'react';
import Header from '../components/Header';
import MedicalProfile from '../components/MedicalProfile';

const PatientMedicalProfilePage = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-blue-100 flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-10">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 min-h-[400px]">
          <MedicalProfile />
        </div>
      </main>
    </div>
  );
};

export default PatientMedicalProfilePage;
