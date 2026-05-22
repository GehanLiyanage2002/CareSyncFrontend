import React from 'react';

const Hero = () => {
  return (
    <section id="hero" className="bg-blue-50 dark:bg-gray-900 py-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 mb-10 md:mb-0">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6 transition-colors duration-300">
            Smart Healthcare, <br />
            <span className="text-blue-600 dark:text-blue-400">Simplified for You.</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 transition-colors duration-300">
            Experience seamless scheduling, secure virtual consultations, and AI-powered support in one centralized digital platform.
          </p>
          <div className="flex space-x-4">
            <a href="#login" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition shadow-lg">
              Book Appointment
            </a>
            <a href="#services" className="bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 px-6 py-3 rounded-lg font-semibold text-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition">
              Explore Services
            </a>
          </div>
        </div>
        <div className="md:w-1/2 flex justify-center">
          {/* Placeholder for a high-contrast, modern healthcare illustration */}
          <div className="w-full max-w-md h-80 bg-blue-200 dark:bg-gray-800 rounded-2xl shadow-2xl flex items-center justify-center text-blue-800 dark:text-blue-300 font-bold transition-colors duration-300">
            [Healthcare System Illustration]
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;