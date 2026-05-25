import React from 'react';
import Header from '../components/Header';
import GeneralProfileTab from '../components/profile/GeneralProfileTab';
import { useNavigate } from 'react-router-dom';

const EditProfilePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Profile Settings</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Manage your personal information, security preferences, and account settings.</p>
        </div>

        <GeneralProfileTab />

        {/* Back Button */}
        <div className="mt-12 flex justify-center pb-8">
          <button 
            onClick={() => navigate(-1)} // Navigate back to the previous page
            className="flex items-center gap-2 px-6 py-3 bg-white text-slate-600 hover:text-blue-600 font-medium rounded-full shadow-sm hover:shadow-md border border-slate-200 hover:border-blue-200 transition-all duration-300 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:-translate-x-1 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Go Back
          </button>
        </div>
      </main>
    </div>
  );
};

export default EditProfilePage;
