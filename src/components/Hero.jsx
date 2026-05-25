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
        <div className="md:w-1/2 flex justify-center relative mt-10 md:mt-0">
          {/* Decorative background blob */}
          <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-300 dark:bg-blue-600 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-300 dark:bg-purple-600 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-emerald-300 dark:bg-emerald-600 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-4000"></div>
          
          {/* Image Container */}
          <div className="relative w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden group border-4 border-white/50 dark:border-gray-800/50 backdrop-blur-sm transform transition duration-500 hover:scale-[1.02]">
            <img 
              src="/hero-image.png" 
              alt="Modern Healthcare Facility" 
              className="w-full h-full object-cover rounded-[1.75rem] shadow-inner"
              style={{ minHeight: '400px' }}
            />
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition duration-300"></div>
            
            {/* Floating Badge */}
            <div className="absolute bottom-6 left-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md px-5 py-3 rounded-2xl shadow-lg border border-white/20 flex items-center gap-4 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-100">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">Trusted Care</p>
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;