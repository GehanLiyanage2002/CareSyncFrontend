import React, { useState } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Doctors from '../components/Doctors';
import Services from '../components/Services';
import RoleLogin from '../components/RoleLogin';
import Footer from '../components/Footer';
import DoctorProfile from '../components/DoctorProfile';

const LandingPage = () => {
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col font-sans transition-colors duration-300">
      {/* Render Header only if no doctor is selected */}
      {!selectedDoctor && <Header />}
      
      <main className="flex-grow">
        {selectedDoctor ? (
          <DoctorProfile 
            doctor={selectedDoctor} 
            onBack={() => setSelectedDoctor(null)} 
          />
        ) : (
          <>
            <Hero />
            <Doctors onBookNow={(doctor) => setSelectedDoctor(doctor)} />
            <Services />
            <RoleLogin />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;