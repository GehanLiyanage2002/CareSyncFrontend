import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { 
  HeartPulse, Ear, Bone, Brain, Activity, 
  Stethoscope, Syringe, Eye, Pill, Microscope, 
  Baby, Sparkles, Search
} from 'lucide-react';

const socket = io('http://localhost:5000');

const Services = ({ isPage }) => {
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

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
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            {filteredServices.map((service, index) => {
              const IconComponent = getServiceIcon(service.name);
              return (
                <div 
                  key={service.id} 
                  className="group w-36 h-36 sm:w-48 sm:h-48 bg-white flex flex-col items-center justify-center p-4 cursor-pointer transition-all duration-300 hover:bg-[#3b82f6] shadow-sm hover:shadow-xl hover:-translate-y-2 border border-gray-100"
                >
                  <IconComponent className="w-12 h-12 text-[#3b82f6] group-hover:text-white mb-4 transition-colors duration-300" strokeWidth={1.5} />
                  <h3 className="text-sm sm:text-base font-semibold text-gray-700 group-hover:text-white text-center transition-colors duration-300">
                    {service.name}
                  </h3>
                </div>
              );
            })}
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