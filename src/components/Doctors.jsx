import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDoctors, updateDoctorAvailability, updateDoctorFee } from '../features/doctors/doctorsSlice';
import axios from 'axios';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

const Doctors = ({ onBookNow, hideHeader, defaultSearchTerm = '' }) => {
  const navigate = useNavigate();
  const [selectedSpecialization, setSelectedSpecialization] = useState(defaultSearchTerm === 'Psychology' ? 'Psychology' : 'All');
  const [searchTerm, setSearchTerm] = useState(defaultSearchTerm === 'Psychology' ? '' : defaultSearchTerm);
  const dispatch = useDispatch();
  const { doctors, loading, error } = useSelector((state) => state.doctors);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (doctors.length === 0) {
      dispatch(fetchDoctors());
    }
  }, [dispatch, doctors.length]);

  useEffect(() => {
    const handleAvailability = (data) => dispatch(updateDoctorAvailability(data));
    const handleFee = (data) => dispatch(updateDoctorFee(data));

    socket.on('doctorAvailabilityChanged', handleAvailability);
    socket.on('doctorFeeChanged', handleFee);

    return () => {
      socket.off('doctorAvailabilityChanged', handleAvailability);
      socket.off('doctorFeeChanged', handleFee);
    };
  }, [dispatch]);

  const specializations = ['All', ...new Set(doctors.map(d => d.specialization || 'General Practitioner'))];

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = (doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                          (doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesSpec = selectedSpecialization === 'All' || (doctor.specialization || 'General Practitioner') === selectedSpecialization;
    return matchesSearch && matchesSpec;
  });

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 350; // roughly card width + gap
      if (direction === 'left') {
        scrollRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  return (
    <section id="doctors" className={`${hideHeader ? 'pb-24 pt-4' : 'py-24'} bg-white relative overflow-hidden transition-colors duration-300`}>
      
      {/* Decorative Dots - Left */}
      <div className="absolute top-1/4 left-10 hidden lg:block opacity-30 z-0">
        <svg width="80" height="100" viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <pattern id="dots-left" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="2" fill="#3b82f6" />
          </pattern>
          <rect x="0" y="0" width="80" height="100" fill="url(#dots-left)" />
        </svg>
      </div>

      {/* Decorative Dots - Right Bottom */}
      <div className="absolute bottom-10 right-10 hidden lg:block opacity-20 z-0">
        <svg width="120" height="150" viewBox="0 0 120 150" fill="none" xmlns="http://www.w3.org/2000/svg">
          <pattern id="dots-right" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="3" fill="transparent" stroke="#3b82f6" strokeWidth="1" />
          </pattern>
          <rect x="0" y="0" width="120" height="150" fill="url(#dots-right)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Title Section */}
        {!hideHeader && (
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-8">
              Our Doctors
            </h2>
          </div>
        )}

        {/* Search & Filter Section */}
        <div className="max-w-4xl mx-auto mb-12 flex flex-col gap-6">
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto w-full">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-blue-500" />
            </div>
            <input
              type="text"
              placeholder="Search doctors by name or specialization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-14 pr-6 py-4 border border-slate-200 dark:border-gray-700 rounded-full bg-white dark:bg-gray-800 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xl transition-all duration-300 font-medium text-lg"
            />
          </div>

          {/* Specialization Filter Pills */}
          <div className="flex gap-3 justify-start md:justify-center overflow-x-auto pb-4 hide-scrollbar snap-x px-2">
            {specializations.map((spec, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedSpecialization(spec)}
                className={`snap-center whitespace-nowrap px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 shadow-sm border-2 ${
                  selectedSpecialization === spec
                    ? 'bg-blue-600 text-white border-blue-600 shadow-blue-500/40'
                    : 'bg-white dark:bg-gray-800 text-slate-600 dark:text-gray-300 border-slate-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-gray-500 hover:bg-blue-50 dark:hover:bg-gray-700'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>

        {/* Carousel / Doctors Grid */}
        {filteredDoctors.length > 0 ? (
          <div className="relative flex items-center justify-center">
            
            {/* Left Scroll Button */}
            <button 
              onClick={() => scroll('left')}
              className="hidden md:flex absolute -left-4 lg:-left-12 z-20 w-10 h-10 bg-white shadow-md rounded-full items-center justify-center text-slate-500 hover:text-blue-600 transition-colors"
            >
              <ChevronLeft size={24} />
            </button>

            {/* Scrollable Container */}
            <div 
              ref={scrollRef}
              className="flex overflow-x-auto gap-6 pb-12 pt-4 px-4 snap-x snap-mandatory hide-scrollbar w-full"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {filteredDoctors.map((doctor, index) => (
                <div
                  key={index}
                  className="magic-border-card min-w-[280px] max-w-[320px] flex-shrink-0 snap-center bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] transition-all duration-300 flex flex-col items-center text-center group"
                >
                  {/* Image & Badge */}
                  <div className="relative mb-6">
                    <img
                      src={doctor.image || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=200&q=80'}
                      alt={doctor.name}
                      className="w-28 h-28 rounded-full object-cover shadow-md"
                    />
                    <div className="absolute bottom-1 right-1 bg-[#0ea5e9] rounded-full w-6 h-6 flex items-center justify-center border-2 border-white shadow-sm">
                      <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                    </div>
                  </div>

                  {/* Info */}
                  <h3 className="text-xl font-bold text-[#1e3a8a] dark:text-white mb-1 transition-colors">
                    {doctor.name}
                  </h3>
                  <p className="text-[#0ea5e9] font-medium text-sm mb-2">
                    {doctor.specialization || 'General Practitioner'}
                  </p>
                  
                  <div className="text-slate-500 dark:text-slate-400 text-xs font-medium space-y-1 mb-8">
                    <p>CareSync Medical Center</p>
                    <p>{doctor.experience || '5'} years experience</p>
                  </div>

                  <div className="w-full space-y-3 mt-auto">
                    {/* View Profile Button */}
                    <button 
                      onClick={() => onBookNow && onBookNow(doctor)}
                      className="w-full py-2.5 rounded-full font-bold text-sm border-2 border-[#0ea5e9] text-[#0ea5e9] bg-transparent hover:bg-[#0ea5e9] hover:text-white transition-all duration-300"
                    >
                      View Profile
                    </button>
                    {/* Book Now Button */}
                    <button 
                      onClick={() => navigate('/book-appointment', { state: { doctor } })}
                      className="magic-shine w-full py-2.5 rounded-full font-bold text-sm bg-gradient-to-r from-blue-600 to-teal-500 text-white hover:from-blue-700 hover:to-teal-600 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-none"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Scroll Button */}
            <button 
              onClick={() => scroll('right')}
              className="hidden md:flex absolute -right-4 lg:-right-12 z-20 w-10 h-10 bg-white shadow-md rounded-full items-center justify-center text-slate-500 hover:text-blue-600 transition-colors"
            >
              <ChevronRight size={24} />
            </button>
            
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-500 text-lg font-medium">
              No doctors found matching "{searchTerm}"
            </p>
          </div>
        )}
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};

export default Doctors;
