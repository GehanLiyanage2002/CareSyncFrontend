import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { 
  HeartPulse, Ear, Bone, Brain, Activity, 
  Stethoscope, Syringe, Eye, Pill, Microscope, 
  Baby, Sparkles, Search, ChevronLeft, ChevronRight
} from 'lucide-react';

const socket = io('http://localhost:5000');

const Services = ({ isPage }) => {
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = React.useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/services');
        if (response.data.success) {
          setServices(response.data.services);
        }
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();

    const handleServiceAdded = () => {
      fetchServices();
    };

    socket.on('serviceAdded', handleServiceAdded);

    return () => {
      socket.off('serviceAdded', handleServiceAdded);
    };
  }, []);

  const getServiceIcon = (name) => {
    const n = name.toLowerCase();
    if (n.includes('cardio') || n.includes('heart')) return HeartPulse;
    if (n.includes('ent') || n.includes('ear')) return Ear;
    if (n.includes('bone') || n.includes('ortho') || n.includes('osteo')) return Bone;
    if (n.includes('neuro') || n.includes('brain')) return Brain;
    if (n.includes('blood') || n.includes('screen') || n.includes('test')) return Activity;
    if (n.includes('eye') || n.includes('vision') || n.includes('opthal')) return Eye;
    if (n.includes('dent') || n.includes('tooth')) return Sparkles;
    if (n.includes('pediatr') || n.includes('child')) return Baby;
    if (n.includes('pharm') || n.includes('med')) return Pill;
    if (n.includes('lab') || n.includes('patho')) return Microscope;
    
    return Stethoscope;
  };

  const filteredServices = services.filter(service => 
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section id="services" className={`${isPage ? 'pb-24 pt-4' : 'py-24'} bg-white`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#0a192f] tracking-tight mb-8">
            Our Medical Services
          </h2>
          
          {/* Search Bar */}
          <div className="max-w-xl mx-auto relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-blue-500" />
            </div>
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-full bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-[0_5px_15px_rgba(0,0,0,0.05)] transition-all duration-300 font-medium"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredServices.length > 0 ? (
          <div className="relative flex items-center justify-center mt-12">
            
            {/* Left Scroll Button */}
            <button 
              onClick={() => scroll('left')}
              className="hidden md:flex absolute -left-4 lg:-left-8 z-20 w-12 h-12 bg-white shadow-lg rounded-full items-center justify-center text-slate-500 hover:text-blue-600 transition-colors border border-slate-100"
            >
              <ChevronLeft size={28} />
            </button>

            {/* Scrollable Container */}
            <div 
              ref={scrollRef}
              className="flex overflow-x-auto gap-6 pb-12 pt-4 px-4 snap-x snap-mandatory hide-scrollbar w-full"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {filteredServices.map((service) => {
                const IconComponent = getServiceIcon(service.name);
                return (
                  <div
                    key={service.id}
                    className="min-w-[280px] max-w-[320px] flex-shrink-0 snap-center bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] transition-all duration-300 border border-slate-100 dark:border-gray-700/50 flex flex-col items-center text-center group"
                  >
                    <div className="relative mb-6">
                      <div className="w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-[#0ea5e9] transition-colors duration-300 shadow-sm border-2 border-white dark:border-gray-800">
                        <IconComponent className="w-10 h-10 text-[#0ea5e9] dark:text-blue-400 group-hover:text-white transition-colors duration-300" strokeWidth={2} />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-[#1e3a8a] dark:text-white mb-2 transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-[#0ea5e9] font-medium text-sm mb-6">
                      {service.price ? `Starts from LKR ${service.price}` : 'Consult for Pricing'}
                    </p>
                    
                    {/* View Details Button */}
                    <button 
                      className="w-full mt-auto py-2.5 rounded-full font-bold text-sm border-2 border-[#0ea5e9] text-[#0ea5e9] bg-transparent hover:bg-[#0ea5e9] hover:text-white transition-all duration-300"
                    >
                      View Details
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Right Scroll Button */}
            <button 
              onClick={() => scroll('right')}
              className="hidden md:flex absolute -right-4 lg:-right-8 z-20 w-12 h-12 bg-white shadow-lg rounded-full items-center justify-center text-slate-500 hover:text-blue-600 transition-colors border border-slate-100"
            >
              <ChevronRight size={28} />
            </button>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-500 text-lg font-medium">
              No services found matching "{searchTerm}"
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Services;