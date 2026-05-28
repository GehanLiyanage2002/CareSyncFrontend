import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Doctors from '../components/Doctors';

const DoctorsPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Content Section */}
      <section className="pt-20 pb-10 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-4">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="w-12 h-[1px] bg-blue-500"></span>
            <span className="text-[#3b82f6] text-sm font-bold tracking-[0.1em] uppercase">
              OUR DOCTORS
            </span>
            <span className="w-12 h-[1px] bg-blue-500"></span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#0a192f] tracking-tight mb-8">
            Our Specialist
          </h2>
        </div>
        
        {/* We pass hideHeader=true so it doesn't render its own "Our Doctors" title */}
        <Doctors hideHeader={true} />
      </section>

      <Footer />
    </div>
  );
};

export default DoctorsPage;
