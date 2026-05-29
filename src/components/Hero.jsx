import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section id="hero" className="relative bg-[#edf4fa] min-h-screen flex items-center overflow-hidden pt-20">
      {/* Faint topographical background pattern */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%233b82f6' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: '400px 400px'
        }}
      ></div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 w-full relative z-10 flex flex-col md:flex-row items-center">
        
        {/* Left Content */}
        <div className="w-full md:w-1/2 md:pr-10 z-20">
          <div className="flex items-center gap-4 mb-6">
            <span className="w-12 h-[2px] bg-[#3b82f6]"></span>
            <span className="text-[#3b82f6] text-[13px] font-bold tracking-[0.2em] uppercase">
              Committed to success
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-[75px] font-extrabold text-[#111827] leading-[1.1] mb-6 tracking-tight">
            WE CARE ABOUT <br />
            YOUR <span className="text-[#1e3a8a]">HEALTH</span>
          </h1>
          
          <p className="text-gray-600 text-base md:text-lg mb-10 max-w-lg leading-relaxed font-medium">
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat is aute irure.
          </p>
          
          <button 
            onClick={() => navigate('/#doctors')}
            className="flex items-center justify-center gap-3 bg-[#3b82f6] text-white px-8 py-3.5 rounded-md font-semibold text-sm hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30"
          >
            Appointment <ArrowRight size={16} />
          </button>
        </div>

        {/* Right Image */}
        <div className="w-full md:w-1/2 mt-16 md:mt-0 relative z-10 flex justify-end">
          <img 
            src="https://themewagon.github.io/live-doc/v1.0.0/assets/img/gallery/hero.png" 
            alt="Doctor with patients" 
            className="w-[130%] max-w-none transform md:translate-x-20 lg:translate-x-32"
            style={{ objectFit: 'contain' }}
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1638202993928-7267aad84c31?q=80&w=1000&auto=format&fit=crop' }}
          />
        </div>
        
      </div>
    </section>
  );
};

export default Hero;