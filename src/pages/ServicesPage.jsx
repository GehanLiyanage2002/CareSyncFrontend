import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Services from '../components/Services';
import Testimonials from '../components/Testimonials';

const ServicesPage = () => {
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-800">
      <Header />
      
      {/* Content Section */}
      <section className="pt-20 pb-10 bg-white dark:bg-gray-800 relative">
        <Services isPage={true} />
      </section>

      <Testimonials />
      <Footer />
    </div>
  );
};

export default ServicesPage;
