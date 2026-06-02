import React, { useState, useEffect } from 'react';
import { ArrowLeft, Activity, MapPin, Check, Calendar, Star, DollarSign, Info } from 'lucide-react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import Header from '../components/Header';
import Footer from '../components/Footer';

const socket = io('http://localhost:5000');

const ServiceProfilePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const initialService = location.state?.service;

  const [service, setService] = useState(initialService || {});
  const [imgKey, setImgKey] = useState(Date.now());

  useEffect(() => {
    if (!service.id) return;

    const handleServiceUpdated = (data) => {
      if (data.service && data.service.id === service.id) {
        setService(prev => ({
          ...prev,
          ...data.service
        }));
      }
    };

    const handleServiceImageUpdated = (data) => {
      if (data.serviceId === service.id) {
        setImgKey(Date.now());
      }
    };

    const handleServiceDeleted = (data) => {
      if (data.serviceId === service.id) {
        alert("This service has been removed.");
        navigate('/services');
      }
    };

    socket.on('serviceUpdated', handleServiceUpdated);
    socket.on('serviceImageUpdated', handleServiceImageUpdated);
    socket.on('serviceDeleted', handleServiceDeleted);

    return () => {
      socket.off('serviceUpdated', handleServiceUpdated);
      socket.off('serviceImageUpdated', handleServiceImageUpdated);
      socket.off('serviceDeleted', handleServiceDeleted);
    };
  }, [service.id, navigate]);

  if (!initialService) {
    return <Navigate to="/services" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Header />
      
      <div className="pt-28 pb-16 max-w-6xl mx-auto px-4 dark:text-gray-100">
        {/* Top Header Bar */}
        <div className="flex justify-between items-center mb-8 border-b border-gray-100 dark:border-gray-800 pb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-full text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 font-semibold transition shadow-sm bg-white dark:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
          <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-400">Service Profile</h1>
          <div className="flex items-center gap-1 bg-blue-50 dark:bg-blue-950/40 text-blue-600 border border-blue-200 dark:border-blue-900/60 px-3 py-1 rounded-full text-sm font-bold">
            <Activity className="h-4 w-4" />
            <span>Medical Service</span>
          </div>
        </div>

        {/* Main Profile Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 shadow-lg border border-blue-50/50 dark:border-gray-700/50 mb-10 transition-colors duration-300">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Profile Left: Image */}
            <div className="w-full md:w-1/3 flex flex-col items-center">
              <div className="relative mb-6 w-full max-w-sm">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-blue-500 to-teal-400 opacity-20 blur-md scale-105"></div>
                {service.image ? (
                  <img
                    src={`http://localhost:5000/api/services/${service.id}/image?t=${imgKey}`}
                    alt={service.name}
                    className="w-full aspect-square object-cover rounded-2xl border-4 border-white dark:border-gray-800 shadow-xl relative z-10"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className={`w-full aspect-square rounded-2xl bg-blue-50 dark:bg-gray-700 items-center justify-center border-4 border-white dark:border-gray-800 shadow-xl relative z-10 ${service.image ? 'hidden' : 'flex'}`}
                >
                  <Activity className="w-20 h-20 text-blue-300 dark:text-gray-500" />
                </div>
              </div>
            </div>

            {/* Profile Right: Description */}
            <div className="w-full md:w-2/3">
              <h2 className="text-3xl font-extrabold text-blue-950 dark:text-white mb-2 transition-colors">{service.name}</h2>
              <span className="inline-block bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 text-xs font-bold px-3 py-1 rounded-full mb-6 transition-colors uppercase tracking-wider">
                Medical Test / Procedure
              </span>

              {/* Quick Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                
                <div className="border border-gray-100 dark:border-gray-700/60 bg-gray-50/50 dark:bg-gray-900/20 rounded-2xl p-4 flex items-start gap-3 transition-colors duration-300">
                  <DollarSign className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <div>
                    <span className="block text-xs text-gray-500 dark:text-gray-400 font-semibold">Service Fee</span>
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                      {service.price ? `Rs. ${service.price}` : 'Consult for Pricing'}
                    </span>
                  </div>
                </div>

                <div className="border border-gray-100 dark:border-gray-700/60 bg-gray-50/50 dark:bg-gray-900/20 rounded-2xl p-4 flex items-start gap-3 transition-colors duration-300">
                  <MapPin className="h-5 w-5 text-teal-600 dark:text-teal-400 shrink-0" />
                  <div>
                    <span className="block text-xs text-gray-500 dark:text-gray-400 font-semibold">Location / Room</span>
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                      {service.location || 'Main Laboratory'}
                    </span>
                  </div>
                </div>

                <div className="border border-gray-100 dark:border-gray-700/60 bg-gray-50/50 dark:bg-gray-900/20 rounded-2xl p-4 flex items-start gap-3 transition-colors duration-300">
                  <Check className={`h-5 w-5 shrink-0 ${service.is_available === false ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`} />
                  <div>
                    <span className="block text-xs text-gray-500 dark:text-gray-400 font-semibold">Availability</span>
                    <span className={`text-sm font-bold flex items-center gap-1.5 ${service.is_available === false ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      <span className={`w-2.5 h-2.5 rounded-full ${service.is_available === false ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`}></span>
                      {service.is_available === false ? 'Unavailable' : 'Available'}
                    </span>
                  </div>
                </div>

              </div>

              {/* About Service */}
              <div className="border-t border-gray-100 dark:border-gray-700/80 pt-6">
                <h3 className="text-lg font-bold text-blue-900 dark:text-blue-400 mb-2 transition-colors flex items-center gap-2">
                  <Info className="w-5 h-5" /> Description
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed transition-colors">
                  {service.description || "No detailed description provided for this service."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Appointment Booking Button */}
        {service.is_available === false ? (
          <div className="bg-rose-50 dark:bg-rose-900/20 rounded-3xl p-8 shadow-sm border border-rose-100 dark:border-rose-800/30 text-center transition-colors duration-300 mt-8 mb-8">
            <Calendar className="h-12 w-12 text-rose-400 dark:text-rose-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-rose-900 dark:text-rose-400 mb-2">Currently Unavailable</h3>
            <p className="text-rose-700 dark:text-rose-300">This service is temporarily unavailable for new bookings.</p>
          </div>
        ) : (
          <div className="flex justify-center mt-10 mb-10">
            <button
              onClick={() => navigate('/book-service', { state: { service } })}
              className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white font-extrabold text-lg py-4 px-10 rounded-full shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex items-center gap-2"
            >
              <Calendar className="w-6 h-6" />
              Book This Service
            </button>
          </div>
        )}

      </div>
      <Footer />
    </div>
  );
};

export default ServiceProfilePage;
