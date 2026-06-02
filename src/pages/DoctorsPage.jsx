import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Doctors from '../components/Doctors';
import DoctorProfile from '../components/DoctorProfile';
import Testimonials from '../components/Testimonials';

const DoctorsPage = () => {
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const location = useLocation();
  const service = location.state?.service;
  const isTelemedicine = service === 'Telemedicine';

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Content Section */}
      <section className="pt-20 pb-10 bg-white relative">
        {selectedDoctor ? (
          <DoctorProfile 
            doctor={selectedDoctor} 
            onBack={() => setSelectedDoctor(null)} 
            isTelemedicine={isTelemedicine}
          />
        ) : (
          <>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-10">
              <h2 className="text-4xl md:text-5xl font-extrabold text-[#0a192f] tracking-tight mb-8">
                Our Specialist
              </h2>
            </div>
            
            {/* We pass hideHeader=true so it doesn't render its own "Our Doctors" title */}
            <Doctors 
              hideHeader={true} 
              onBookNow={(doctor) => setSelectedDoctor(doctor)} 
              defaultSearchTerm={isTelemedicine ? 'Psychology' : ''}
            />
          </>
        )}
      </section>

      <Testimonials />
      <Footer />
    </div>
  );
};

export default DoctorsPage;
