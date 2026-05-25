import React from 'react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="relative w-full h-[600px] md:h-[700px] flex items-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/hero-bg.png')" }}
      >
        {/* Dark Gradient Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-transparent"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-2xl text-left">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight animate-[fadeInUp_0.8s_ease-out]">
            Compassionate Care, <br />
            <span className="text-blue-400">Exceptional Results</span>
          </h1>
          
          <p className="mt-6 text-lg sm:text-xl text-slate-200 leading-relaxed max-w-xl animate-[fadeInUp_1s_ease-out]">
            Welcome to CareSync. We are dedicated to providing accessible, high-quality medical services for you and your family.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row gap-4 animate-[fadeInUp_1.2s_ease-out]">
            <Link 
              to="/book-appointment" 
              className="inline-flex justify-center items-center px-8 py-3.5 border border-transparent text-base font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
            >
              Book an Appointment
            </Link>
            
            <Link 
              to="/services" 
              className="inline-flex justify-center items-center px-8 py-3.5 border-2 border-white/80 text-base font-bold rounded-xl text-white hover:bg-white hover:text-slate-900 shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
            >
              Our Services
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
