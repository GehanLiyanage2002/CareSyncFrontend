import React from 'react';
import { Home, Smartphone, Mail } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Content Section */}
      <section className="pt-24 pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#0a192f] tracking-tight">
              Contact Us
            </h2>
          </div>

          {/* Google Map Section */}
          <div className="w-full h-[400px] mb-16 rounded-lg overflow-hidden shadow-sm border border-gray-100">
            <iframe 
              src="https://maps.google.com/maps?q=Colombo,%20Sri%20Lanka&t=&z=13&ie=UTF8&iwloc=&output=embed" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Google Maps"
            ></iframe>
          </div>

          {/* Form and Info Layout */}
          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Left Side: Contact Form */}
            <div className="w-full lg:w-2/3">
              <h3 className="text-2xl font-bold text-[#0a192f] mb-6">Get in Touch</h3>
              <form className="space-y-6">
                <div>
                  <textarea 
                    rows="6" 
                    placeholder="Enter Message" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y text-sm text-gray-700"
                  ></textarea>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="w-full sm:w-1/2">
                    <input 
                      type="text" 
                      placeholder="Enter your name" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-700"
                    />
                  </div>
                  <div className="w-full sm:w-1/2">
                    <input 
                      type="email" 
                      placeholder="Email" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-700"
                    />
                  </div>
                </div>
                
                <div>
                  <input 
                    type="text" 
                    placeholder="Enter Subject" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-700"
                  />
                </div>
                
                <button 
                  type="button" 
                  className="mt-4 px-8 py-3 border-2 border-blue-600 text-blue-600 font-bold text-sm tracking-wider hover:bg-blue-600 hover:text-white transition-colors duration-300 uppercase"
                >
                  Send
                </button>
              </form>
            </div>
            
            {/* Right Side: Contact Info */}
            <div className="w-full lg:w-1/3 flex flex-col gap-8 pt-4 lg:pl-8">
              
              <div className="flex items-start gap-4">
                <div className="text-gray-400 mt-1">
                  <Home size={32} strokeWidth={1} />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-[#0a192f]">Colombo, Sri Lanka.</h4>
                  <p className="text-sm text-gray-500">123 Health Ave, Colombo 00100</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="text-gray-400 mt-1">
                  <Smartphone size={32} strokeWidth={1} />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-[#0a192f]">+94 11 234 5678</h4>
                  <p className="text-sm text-gray-500">Mon to Fri 9am to 6pm</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="text-gray-400 mt-1">
                  <Mail size={32} strokeWidth={1} />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-[#0a192f]">support@caresync.com</h4>
                  <p className="text-sm text-gray-500">Send us your query anytime!</p>
                </div>
              </div>

            </div>
            
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactPage;
