import React from 'react';

const Hero = () => {
  return (
    <section id="hero" className="bg-blue-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 mb-10 md:mb-0">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
            Smart Healthcare, <br />
            <span className="text-blue-600">Simplified for You.</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Experience seamless scheduling, secure virtual consultations, and AI-powered support in one centralized digital platform.
          </p>
          <div className="flex space-x-4">
            <a href="#login" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition shadow-lg">
              Book Appointment
            </a>
            <a href="#services" className="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-lg font-semibold text-lg hover:bg-blue-50 transition">
              Explore Services
            </a>
          </div>
        </div>
        <div className="md:w-1/2 flex justify-center">
          {/* Placeholder for a high-contrast, modern healthcare illustration */}
          <div className="w-full max-w-md h-80 bg-blue-200 rounded-2xl shadow-2xl flex items-center justify-center text-blue-800 font-bold">
            [Healthcare System Illustration]
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;