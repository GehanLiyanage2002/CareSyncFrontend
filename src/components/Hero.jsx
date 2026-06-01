import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section id="hero" className="relative bg-slate-50 dark:bg-slate-900 min-h-screen flex items-center overflow-hidden pt-20 transition-colors duration-500">
      
      {/* Magic UI Background Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob dark:opacity-20"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 dark:opacity-20"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000 dark:opacity-20"></div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 w-full relative z-10 flex flex-col md:flex-row items-center">
        
        {/* Left Content */}
        <div className="w-full md:w-1/2 md:pr-10 z-20">
          <div className="flex items-center gap-4 mb-6">
            <span className="w-12 h-[2px] bg-[#3b82f6]"></span>
            <span className="text-[#3b82f6] text-[13px] font-bold tracking-[0.2em] uppercase">
              Committed to success
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-[75px] font-extrabold text-slate-900 dark:text-white leading-[1.1] mb-6 tracking-tight drop-shadow-sm">
            WE CARE ABOUT <br />
            YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-400">HEALTH</span>
          </h1>
          
          <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg mb-10 max-w-lg leading-relaxed font-medium">
            Experience the future of healthcare. AI-powered diagnostics, seamless telemedicine, and world-class specialists at your fingertips.
          </p>
          
          <div className="flex gap-4">
            <button 
              onClick={() => navigate('/#doctors')}
              className="relative overflow-hidden group flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-8 py-3.5 rounded-full font-bold text-sm hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all duration-300 hover:-translate-y-1"
            >
              <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></span>
              <span className="relative flex items-center gap-2">Book Appointment <ArrowRight size={16} /></span>
            </button>
          </div>
        </div>

        {/* Right Image with Glassmorphism Float */}
        <div className="w-full md:w-1/2 mt-16 md:mt-0 relative z-10 flex justify-center md:justify-end">
          <div className="relative w-full max-w-lg lg:max-w-none">
            <img 
              src="https://themewagon.github.io/live-doc/v1.0.0/assets/img/gallery/hero.png" 
              alt="Doctor with patients" 
              className="w-full lg:w-[130%] max-w-none transform md:translate-x-10 lg:translate-x-24 drop-shadow-2xl hover:scale-[1.02] transition-transform duration-500"
              style={{ objectFit: 'contain' }}
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1638202993928-7267aad84c31?q=80&w=1000&auto=format&fit=crop' }}
            />
            
            {/* Glassmorphism Floating Card */}
            <div className="absolute top-1/4 -left-10 md:-left-20 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-white/20 dark:border-slate-700/50 p-4 rounded-2xl shadow-xl animate-float" style={{ animationDuration: '3s' }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                  <span className="text-2xl">✨</span>
                </div>
                <div>
                  <p className="text-slate-900 dark:text-white font-bold text-lg">10,000+</p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase">Happy Patients</p>
                </div>
              </div>
            </div>
            
            <div className="absolute bottom-1/4 right-0 lg:-right-10 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-white/20 dark:border-slate-700/50 p-4 rounded-2xl shadow-xl animate-float" style={{ animationDuration: '4s', animationDelay: '1s' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                  24/7
                </div>
                <p className="text-slate-900 dark:text-white font-bold text-sm">Online Support</p>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </section>
  );
};

export default Hero;