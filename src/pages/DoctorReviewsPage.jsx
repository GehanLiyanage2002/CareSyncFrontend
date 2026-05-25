import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import DoctorReviews from '../components/doctor/DoctorReviews';

const DoctorReviewsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 font-sans text-slate-800 dark:text-gray-100 flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-10">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">My Reviews</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Patient reviews for your consultations. Reviews are automatically marked as read when you visit this page.
          </p>
        </div>

        <DoctorReviews />

        {/* Back Button */}
        <div className="mt-12 flex justify-center pb-8">
          <button
            onClick={() => navigate('/doctor/dashboard')}
            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-slate-600 dark:text-gray-300 hover:text-amber-600 font-medium rounded-full shadow-sm hover:shadow-md border border-slate-200 dark:border-gray-700 hover:border-amber-200 transition-all duration-300 group"
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

export default DoctorReviewsPage;
