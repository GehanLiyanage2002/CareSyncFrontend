import React, { useState, useEffect } from 'react';
import { Search, GraduationCap, Calendar, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

const Doctors = ({ onBookNow }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/users/doctors');
        if (response.data.success) {
          setDoctors(response.data.doctors);
        }
      } catch (error) {
        console.error("Error fetching doctors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  useEffect(() => {
    socket.on('doctorAvailabilityChanged', (data) => {
      setDoctors(prevDoctors => 
        prevDoctors.map(doc => 
          (doc.doctor_id === data.doctor_id || doc.id === data.doctor_id)
            ? { ...doc, is_available: data.is_available }
            : doc
        )
      );
    });

    socket.on('doctorFeeChanged', (data) => {
      setDoctors(prevDoctors => 
        prevDoctors.map(doc => 
          (doc.doctor_id === data.doctor_id || doc.id === data.doctor_id)
            ? { ...doc, consultationFee: data.consultation_fee }
            : doc
        )
      );
    });

    return () => {
      socket.off('doctorAvailabilityChanged');
      socket.off('doctorFeeChanged');
    };
  }, []);

  const filteredDoctors = doctors.filter(doctor =>
    (doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    (doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
  );

  return (
    <section id="doctors" className="py-20 bg-blue-50/30 dark:bg-gray-900/30 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-blue-900 dark:text-blue-400 mb-4 transition-colors">
            Our Medical Experts
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto transition-colors">
            Find your ideal doctor by name or specialization
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-16 relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-blue-500 dark:text-blue-400" />
          </div>
          <input
            type="text"
            placeholder="Search doctors by name or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-12 pr-4 py-3 border border-blue-100 dark:border-gray-700 rounded-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-md transition-all duration-300"
          />
        </div>

        {/* Doctors Grid */}
        {filteredDoctors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredDoctors.map((doctor, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-blue-50/50 dark:border-gray-700/50 flex flex-col items-center text-center group"
              >
                {/* Image Container with pulsing circular border */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 rounded-full border-2 border-blue-500/30 dark:border-blue-400/30 group-hover:scale-110 transition-transform duration-300 pointer-events-none"></div>
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-md group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Info */}
                <h3 className="text-xl font-bold text-blue-950 dark:text-white mb-1 transition-colors">
                  {doctor.name}
                </h3>
                <p className="text-blue-600 dark:text-blue-400 font-semibold text-sm mb-4 transition-colors">
                  {doctor.specialization}
                </p>

                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  {/* Experience Badge */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 text-xs font-semibold text-blue-700 dark:text-blue-300 transition-colors">
                    <GraduationCap className="h-4 w-4" />
                    <span>{doctor.experience}</span>
                  </div>
                  {/* Availability Badge */}
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-colors ${
                    doctor.is_available === false 
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-100 dark:border-rose-900/60 text-rose-600 dark:text-rose-400' 
                    : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/60 text-emerald-600 dark:text-emerald-400'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${doctor.is_available === false ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                    <span>{doctor.is_available === false ? 'Unavailable' : 'Available'}</span>
                  </div>
                </div>

                {/* Book Now Button */}
                <button 
                  onClick={() => onBookNow && onBookNow(doctor)}
                  className={`w-full mt-auto py-3 rounded-2xl font-bold flex items-center justify-center gap-1.5 transition-all duration-300 shadow-sm ${
                    doctor.is_available === false
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 hover:shadow-md'
                    : 'bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white hover:shadow-lg active:scale-95 group-hover:gap-2.5'
                  }`}
                >
                  <span>{doctor.is_available === false ? 'View Profile' : 'Book Now'}</span>
                  <ChevronRight className="h-4 w-4 transition-transform" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No doctors found matching "{searchTerm}"
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Doctors;
