import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Services from '../components/Services';

const ServicesPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Content Section */}
      <section className="pt-20 pb-10 bg-white relative">
        <Services />
      </section>

      <Footer />
    </div>
  );
};

export default ServicesPage;
