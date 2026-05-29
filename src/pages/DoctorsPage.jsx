import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Doctors from '../components/Doctors';
import DoctorProfile from '../components/DoctorProfile';

const DoctorsPage = () => {
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Content Section */}
      <section className="pt-20 pb-10 bg-white relative">
        {selectedDoctor ? (
          <DoctorProfile 
            doctor={selectedDoctor} 
            onBack={() => setSelectedDoctor(null)} 
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
            />
          </>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default DoctorsPage;
