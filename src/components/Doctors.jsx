import React, { useState } from 'react';
import { Search, GraduationCap, Calendar, ChevronRight } from 'lucide-react';

const Doctors = ({ onBookNow }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const doctors = [
    {
      name: "Dr. David Kim",
      specialization: "Oncologist",
      experience: "7 Years",
      successRate: "97%",
      patients: "3.2k+",
      qualifications: "MBBS, MD (Oncology)",
      location: "CareSync Hospital, Block C",
      consultationFee: 1500,
      about: "Specialized in advanced cancer therapy, precision oncology, and early cancer detection.",
      rating: "4.9",
      image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400"
    },
    {
      name: "Dr. Emily Rodriguez",
      specialization: "Pediatrician",
      experience: "8 Years",
      successRate: "99%",
      patients: "5k+",
      qualifications: "MBBS, MD (Pediatrics)",
      location: "CareSync Hospital, Block B",
      consultationFee: 1200,
      about: "Dedicated pediatrician focusing on adolescent health, early child development, and preventative care.",
      rating: "5.0",
      image: "https://images.unsplash.com/photo-1594824813573-246434e33963?auto=format&fit=crop&q=80&w=400"
    },
    {
      name: "Dr. Kabir Malhotra",
      specialization: "Nephrologist",
      experience: "7 Years",
      successRate: "94%",
      patients: "2.1k+",
      qualifications: "MBBS, MD (Nephrology)",
      location: "CareSync Hospital, Block A",
      consultationFee: 1300,
      about: "Expert in kidney disease management, dialysis therapy, and post-transplant follow-up care.",
      rating: "4.8",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400"
    },
    {
      name: "Dr. Rahul Sharma",
      specialization: "Cardiologist",
      experience: "10 Years",
      successRate: "98%",
      patients: "8k+",
      qualifications: "MBBS, MD (Cardiology)",
      location: "CareSync Hospital, Block D",
      consultationFee: 1800,
      about: "Cardiology expert specialized in heart valve disorders, coronary interventions, and preventative cardiac care.",
      rating: "5.0",
      image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400"
    },
    {
      name: "Dr. Rohan Mehta",
      specialization: "ENT Specialist",
      experience: "12 Years",
      successRate: "96%",
      patients: "6.2k+",
      qualifications: "MBBS, MS (ENT)",
      location: "CareSync Hospital, Block B",
      consultationFee: 1000,
      about: "Experienced ENT specialist diagnosing and treating ear, nose, throat, and complex sinus disorders.",
      rating: "4.9",
      image: "https://images.unsplash.com/photo-1638202993928-7267aad84c31?auto=format&fit=crop&q=80&w=400"
    },
    {
      name: "Dr. Sarah Johnson",
      specialization: "Psychiatrist",
      experience: "9 Years",
      successRate: "95%",
      patients: "4.1k+",
      qualifications: "MBBS, MD (Psychiatry)",
      location: "CareSync Hospital, Block A",
      consultationFee: 1400,
      about: "Providing expert mental health care, mood disorders therapy, and cognitive behavioral treatments.",
      rating: "4.9",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400"
    }
  ];

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
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

                {/* Experience Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 text-xs font-semibold text-blue-700 dark:text-blue-300 mb-6 transition-colors">
                  <GraduationCap className="h-4 w-4" />
                  <span>{doctor.experience}</span>
                </div>

                {/* Book Now Button */}
                <button 
                  onClick={() => onBookNow && onBookNow(doctor)}
                  className="w-full mt-auto bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-1.5 transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 group-hover:gap-2.5"
                >
                  <span>Book Now</span>
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
