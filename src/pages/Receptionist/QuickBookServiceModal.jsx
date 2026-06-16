import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { X, Activity, Loader, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const QuickBookServiceModal = ({ patient, onClose, onBookingSuccess }) => {
  const { token } = useSelector((state) => state.auth);
  
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBookingId, setSuccessBookingId] = useState(null);

  // 1. Fetch Services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:5000/api/services');
        if (res.data.success) {
          // Filter out unavailable services
          setServices(res.data.services.filter(s => s.is_available));
        }
      } catch (error) {
        console.error('Failed to fetch services', error);
        toast.error('Failed to load medical services');
      } finally {
        setLoadingServices(false);
      }
    };
    fetchServices();
  }, []);

  const handleBook = async () => {
    if (!selectedService || !selectedDate || !selectedTime) {
      toast.error('Please complete all selections');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        patient_id: patient.id,
        service_id: selectedService.id,
        date: selectedDate,
        time: selectedTime,
        amount_paid: selectedService.price,
        payment_method: paymentMethod
      };

      const res = await axios.post('http://127.0.0.1:5000/api/services/book', payload, {
        headers: { Authorization: token }
      });

      if (res.data.success) {
        setSuccessBookingId(res.data.booking.id);
        toast.success('Service booked successfully!');
        if (onBookingSuccess) onBookingSuccess();
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(error.response?.data?.message || 'Failed to book service');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successBookingId) {
    return (
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Service Booked!</h3>
          <p className="text-slate-500 text-sm mb-6">Medical Service scheduled for {patient.full_name}</p>
          
          <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 mb-6 text-left">
            <div className="flex justify-between mb-2">
              <span className="text-xs text-slate-500 font-bold">Service:</span>
              <span className="text-xs text-slate-800 font-bold">{selectedService.name}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-xs text-slate-500 font-bold">Date:</span>
              <span className="text-xs text-slate-800 font-bold">{selectedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-slate-500 font-bold">Time:</span>
              <span className="text-xs text-slate-800 font-bold">{selectedTime}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  // Get minimum date (today) for the date picker
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white z-10">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Activity className="text-indigo-500" size={20} />
              Quick Book Service
            </h2>
            <p className="text-sm font-medium text-slate-500 mt-0.5">Booking for: <span className="text-indigo-600 font-bold">{patient.full_name}</span></p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <div className="space-y-6">
            
            {/* 1. Select Service */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">1. Select Medical Service</label>
              {loadingServices ? (
                 <div className="flex items-center justify-center py-4 text-indigo-500"><Loader className="animate-spin" size={24} /></div>
              ) : services.length === 0 ? (
                 <p className="text-sm text-slate-500 italic">No services available right now.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {services.map(service => (
                    <button
                      key={service.id}
                      onClick={() => setSelectedService(service)}
                      className={`flex flex-col text-left p-4 rounded-xl border transition-all ${
                        selectedService?.id === service.id
                          ? 'bg-indigo-50 border-indigo-200 shadow-sm ring-1 ring-indigo-500'
                          : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                      }`}
                    >
                      <span className="font-bold text-sm text-slate-800 line-clamp-1 mb-1">{service.name}</span>
                      <span className="text-xs text-indigo-600 font-bold">Rs. {service.price}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Select Date & Time */}
            {selectedService && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">2. Select Date</label>
                  <input 
                    type="date"
                    min={today}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">3. Select Time</label>
                  <input 
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>
            )}
            
            {/* 4. Payment Method */}
            {selectedDate && selectedTime && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                <label className="block text-sm font-bold text-slate-700 mb-3">4. Payment Method</label>
                <div className="flex gap-3">
                  {['Cash', 'Card'].map(method => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`flex-1 py-2.5 text-sm font-bold rounded-xl border transition-all ${
                        paymentMethod === method
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm ring-1 ring-indigo-500'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-3xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200/50 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleBook}
            disabled={!selectedService || !selectedDate || !selectedTime || isSubmitting}
            className="px-6 py-2.5 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? <Loader className="animate-spin" size={16} /> : null}
            Book Service
          </button>
        </div>

      </div>
    </div>
  );
};

export default QuickBookServiceModal;
