import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Doctors from '../components/Doctors';
import Services from '../components/Services';
import RoleLogin from '../components/RoleLogin';
import Footer from '../components/Footer';
import DoctorProfile from '../components/DoctorProfile';
import About from '../components/About';
import Telemedicine from '../components/Telemedicine';
import Testimonials from '../components/Testimonials';

const LandingPage = () => {
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      // Small timeout to ensure elements are rendered
      setTimeout(() => {
        const element = document.querySelector(location.hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [location]);

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
            <About />
            <Telemedicine />
            <Doctors onBookNow={(doctor) => setSelectedDoctor(doctor)} />
            <Services />
            <Testimonials />
            <RoleLogin />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;