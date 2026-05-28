import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const About = () => {
  const navigate = useNavigate();

  return (
    <section id="about" className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          
          {/* Left Content */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center">
            <div className="flex items-center gap-4 mb-4">
              <span className="w-10 h-[2px] bg-blue-600"></span>
              <span className="text-blue-600 text-sm font-bold tracking-widest uppercase">
                About Our Company
              </span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-6">
              Welcome To Our <br className="hidden md:block" />
              Medical Clinic
            </h2>
            
            <p className="text-slate-500 text-lg leading-relaxed mb-8 max-w-lg">
              There are many variations of passages of lorem ipsum available, 
              but the majority have suffered alteration in some form, by injected 
              humour, or randomised words which don't look even slightly believable.
            </p>
            
            <div className="flex flex-col gap-4 max-w-xs w-full sm:w-auto">
              <button 
                onClick={() => {
                  if (window.location.pathname !== '/') {
                    navigate('/#doctors');
                  } else {
                    document.getElementById('doctors')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-lg font-bold shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between gap-3 group w-full"
              >
                Find Doctors
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button 
                onClick={() => {
                  if (window.location.pathname !== '/') {
                    navigate('/#services');
                  } else {
                    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="bg-slate-500 hover:bg-slate-600 text-white px-8 py-3.5 rounded-lg font-bold shadow-lg shadow-slate-500/30 hover:shadow-slate-500/50 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between gap-3 group w-full"
              >
                Find Services
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Images */}
          <div className="w-full lg:w-1/2 relative">
            {/* Background Image (Male Doctor) */}
            <div className="relative w-[85%] rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                alt="Doctor working" 
                className="w-full h-auto object-cover aspect-[4/5]"
              />
              <div className="absolute inset-0 bg-blue-900/10 mix-blend-multiply"></div>
            </div>

            {/* Foreground Image (Female Doctor) */}
            <div className="absolute -bottom-10 right-0 w-[60%] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.2)] border-8 border-white bg-white">
              <img 
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Female doctor" 
                className="w-full h-auto object-cover aspect-[3/4]"
              />
            </div>
            
            {/* Decorative Dots */}
            <div className="absolute -z-10 -top-6 -right-6 w-32 h-32 opacity-20" style={{
              backgroundImage: 'radial-gradient(#3b82f6 2px, transparent 2px)',
              backgroundSize: '16px 16px'
            }}></div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default About;
