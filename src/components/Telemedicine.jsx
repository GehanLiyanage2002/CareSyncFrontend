import React from 'react';
import { Video, FileText, Shield, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Telemedicine = () => {
  const navigate = useNavigate();

  return (
    <section id="telemedicine" className="py-24 bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-16 lg:gap-20">
          
          {/* Left Side: Images & Graphics */}
          <div className="w-full lg:w-1/2 relative">
            {/* Background Graphic */}
            <div className="absolute -inset-4 bg-blue-100 rounded-[3rem] transform -rotate-3 scale-105 opacity-50 z-0"></div>
            
            {/* Main Image */}
            <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white">
              <img 
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                alt="Telemedicine Consultation" 
                className="w-full h-auto object-cover aspect-[4/3] hover:scale-105 transition-transform duration-700"
              />
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 to-transparent mix-blend-multiply pointer-events-none"></div>
            </div>

            {/* Floating Badge */}
            <div className="absolute -bottom-6 -right-6 md:bottom-8 md:-right-8 z-20 bg-white p-5 rounded-2xl shadow-[0_15px_30px_rgba(0,0,0,0.1)] flex items-center gap-4 animate-[bounce_3s_infinite]">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Video className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-slate-800 font-extrabold text-lg">24/7</p>
                <p className="text-slate-500 text-sm font-medium">Available Online</p>
              </div>
            </div>
          </div>

          {/* Right Side: Content */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center">
            <div className="flex items-center gap-4 mb-4">
              <span className="w-10 h-[2px] bg-blue-600"></span>
              <span className="text-blue-600 text-sm font-bold tracking-widest uppercase">
                Telemedicine
              </span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-6">
              Consult Top Doctors <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
                From Anywhere
              </span>
            </h2>
            
            <p className="text-slate-600 text-lg leading-relaxed mb-8 max-w-lg">
              Skip the waiting room. Connect with specialized medical professionals via secure, high-quality video consultations from the comfort of your home.
            </p>
            
            <div className="space-y-6 mb-10">
              {/* Feature 1 */}
              <div className="flex items-start gap-4">
                <div className="mt-1 bg-blue-100 p-2.5 rounded-xl shrink-0">
                  <Video className="text-blue-600" size={20} />
                </div>
                <div>
                  <h4 className="text-slate-800 font-bold text-lg mb-1">HD Video Consultations</h4>
                  <p className="text-slate-500 font-medium">Crystal clear communication with your doctor, as if you were in the clinic.</p>
                </div>
              </div>
              

              {/* Feature 2 */}
              <div className="flex items-start gap-4">
                <div className="mt-1 bg-emerald-100 p-2.5 rounded-xl shrink-0">
                  <Shield className="text-emerald-600" size={20} />
                </div>
                <div>
                  <h4 className="text-slate-800 font-bold text-lg mb-1">100% Secure & Private</h4>
                  <p className="text-slate-500 font-medium">End-to-end encrypted calls ensuring your medical data remains completely confidential.</p>
                </div>
              </div>
            </div>
            
            <div className="flex">
              <button 
                onClick={() => navigate('/login')}
                className="bg-slate-900 hover:bg-blue-600 text-white px-8 py-4 rounded-xl font-bold shadow-xl shadow-slate-900/20 hover:shadow-blue-600/40 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 group w-full sm:w-auto"
              >
                Start Consultation
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Telemedicine;
