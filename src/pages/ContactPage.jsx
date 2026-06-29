import React from 'react';
import { Home, Smartphone, Mail } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-800">
      <Header />
      
      {/* Content Section */}
      <section className="pt-24 pb-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#0a192f] dark:text-white tracking-tight">
              Contact Us
            </h2>
          </div>

          {/* Google Map Section */}
          <div className="w-full h-[400px] mb-16 rounded-lg overflow-hidden shadow-sm border border-gray-100">
            <iframe 
              src="https://maps.google.com/maps?q=Hidagoda,%20Badulla&t=&z=14&ie=UTF8&iwloc=&output=embed" 
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
              <h3 className="text-2xl font-bold text-[#0a192f] dark:text-white mb-6">Get in Touch</h3>
              <form className="space-y-6">
                <div>
                  <textarea 
                    rows="6" 
                    placeholder="Enter Message" 
                    className="block w-full px-4 py-3.5 bg-slate-50 border border-slate-200 dark:border-gray-600 text-slate-800 dark:text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white dark:bg-gray-800 transition-all duration-200 text-sm font-medium resize-y"
                  ></textarea>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="w-full sm:w-1/2">
                    <input 
                      type="text" 
                      placeholder="Enter your name" 
                      className="block w-full px-4 py-3.5 bg-slate-50 border border-slate-200 dark:border-gray-600 text-slate-800 dark:text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white dark:bg-gray-800 transition-all duration-200 text-sm font-medium"
                    />
                  </div>
                  <div className="w-full sm:w-1/2">
                    <input 
                      type="email" 
                      placeholder="Email" 
                      className="block w-full px-4 py-3.5 bg-slate-50 border border-slate-200 dark:border-gray-600 text-slate-800 dark:text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white dark:bg-gray-800 transition-all duration-200 text-sm font-medium"
                    />
                  </div>
                </div>
                
                <div>
                  <input 
                    type="text" 
                    placeholder="Enter Subject" 
                    className="block w-full px-4 py-3.5 bg-slate-50 border border-slate-200 dark:border-gray-600 text-slate-800 dark:text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white dark:bg-gray-800 transition-all duration-200 text-sm font-medium"
                  />
                </div>
                
                <button 
                  type="button" 
                  className="mt-4 w-full sm:w-auto px-10 py-3.5 border border-transparent rounded-xl shadow-lg shadow-blue-600/20 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 uppercase tracking-wide"
                >
                  Send Message
                </button>
              </form>
            </div>
            
            {/* Right Side: Contact Info */}
            <div className="w-full lg:w-1/3 flex flex-col gap-8 pt-4 lg:pl-8">
              
              <div className="flex items-start gap-4">
                <div className="text-blue-500 mt-1 bg-blue-50 dark:bg-gray-700 p-3 rounded-xl">
                  <Home size={28} strokeWidth={2} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">Dr Samantha Medical Center</h4>
                  <p className="text-sm font-medium text-slate-500 dark:text-gray-400">Hidagoda, Badulla</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="text-blue-500 mt-1 bg-blue-50 dark:bg-gray-700 p-3 rounded-xl">
                  <Smartphone size={28} strokeWidth={2} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">071 8021528</h4>
                  <p className="text-sm font-medium text-slate-500 dark:text-gray-400">Mon to Fri 9am to 6pm</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="text-blue-500 mt-1 bg-blue-50 dark:bg-gray-700 p-3 rounded-xl">
                  <Mail size={28} strokeWidth={2} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">support@caresync.com</h4>
                  <p className="text-sm font-medium text-slate-500 dark:text-gray-400">Send us your query anytime!</p>
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
