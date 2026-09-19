import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { X, Activity, Loader, CheckCircle, Calendar, Clock, DollarSign, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  generateAvailableDates,
  generateSlots,
  filterPastSlotsIfToday,
  formatTimeDisplay
} from '../../utils/serviceBookingHelper';

const QuickBookServiceModal = ({ patient, onClose, onBookingSuccess }) => {
  const { token } = useSelector((state) => state.auth);

  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [selectedService, setSelectedService] = useState(null);

  const [availableDates, setAvailableDates] = useState([]);
  const [loadingDates, setLoadingDates] = useState(false);
  const [selectedDateObj, setSelectedDateObj] = useState(null);

  const [bookedSlots, setBookedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');

  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBooking, setSuccessBooking] = useState(null);

  // 1. Fetch available services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/services`);
        if (res.data.success) {
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

  // 2. Fetch service schedules and available dates when service changes
  useEffect(() => {
    if (!selectedService) {
      setAvailableDates([]);
      setSelectedDateObj(null);
      setSelectedTime('');
      return;
    }

    const fetchSchedules = async () => {
      setLoadingDates(true);
      setSelectedDateObj(null);
      setSelectedTime('');
      setBookedSlots([]);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/services/${selectedService.id}/schedules`,
          { headers: token ? { Authorization: token } : {} }
        );
        if (res.data.success) {
          let dates = [];
          if (res.data.available_dates && res.data.available_dates.length > 0) {
            dates = res.data.available_dates;
          } else if (res.data.schedules) {
            dates = generateAvailableDates(res.data.schedules);
          }
          setAvailableDates(dates);
          if (dates.length > 0) {
            setSelectedDateObj(dates[0]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch schedules', error);
        toast.error('Failed to load available dates');
      } finally {
        setLoadingDates(false);
      }
    };

    fetchSchedules();
  }, [selectedService, token]);

  // 3. Fetch booked slots when selected date changes
  useEffect(() => {
    if (!selectedService || !selectedDateObj?.schedule_date) {
      setBookedSlots([]);
      return;
    }

    const fetchBookedSlots = async () => {
      setLoadingSlots(true);
      setSelectedTime('');
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/services/${selectedService.id}/booked-slots?date=${selectedDateObj.schedule_date}`
        );
        if (res.data.success && res.data.booked_slots) {
          setBookedSlots(res.data.booked_slots);
        }
      } catch (err) {
        console.error('Failed to fetch booked slots:', err);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchBookedSlots();
  }, [selectedService, selectedDateObj]);

  // Compute dynamic slots
  const allSlots = generateSlots(selectedDateObj);
  const dynamicSlots = filterPastSlotsIfToday(allSlots, selectedDateObj?.schedule_date);

  const handleBook = async () => {
    if (!selectedService || !selectedDateObj?.schedule_date || !selectedTime) {
      toast.error('Please select service, available date, and time slot');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        patient_id: patient.id,
        service_id: selectedService.id,
        date: selectedDateObj.schedule_date,
        time: selectedTime,
        amount_paid: Number(selectedService.price) || 0,
        payment_method: paymentMethod
      };

      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/services/book`, payload, {
        headers: { Authorization: token }
      });

      if (res.data.success) {
        setSuccessBooking({
          id: res.data.booking.id,
          serviceName: selectedService.name,
          date: selectedDateObj.formattedDate || selectedDateObj.schedule_date,
          time: formatTimeDisplay(selectedTime),
          amount: selectedService.price,
          patientName: patient.full_name || patient.name,
          paymentMethod: paymentMethod
        });
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

  const handlePrint = () => {
    window.print();
  };

  // Success view
  if (successBooking) {
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 print:p-0 print:bg-white">
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl relative animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-gray-700">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
            <CheckCircle size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">Service Booked Successfully!</h3>
          <p className="text-slate-500 dark:text-gray-400 text-sm mb-5">
            Appointment confirmed for <span className="font-semibold text-indigo-600 dark:text-indigo-400">{successBooking.patientName}</span>
          </p>

          <div className="bg-slate-50 dark:bg-gray-900 rounded-2xl p-5 border border-slate-100 dark:border-gray-700 mb-6 text-left space-y-2.5">
            <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200 dark:border-gray-800">
              <span className="text-slate-400 font-bold uppercase tracking-wider">Booking ID</span>
              <span className="font-mono font-extrabold text-indigo-600 dark:text-indigo-400 text-sm">#{successBooking.id}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 dark:text-gray-400 font-semibold">Service:</span>
              <span className="text-slate-800 dark:text-white font-bold">{successBooking.serviceName}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 dark:text-gray-400 font-semibold">Date:</span>
              <span className="text-slate-800 dark:text-white font-bold">{successBooking.date}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 dark:text-gray-400 font-semibold">Time:</span>
              <span className="text-slate-800 dark:text-white font-bold">{successBooking.time}</span>
            </div>
            <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-200 dark:border-gray-800">
              <span className="text-slate-500 dark:text-gray-400 font-semibold">Amount Paid:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-black text-sm">Rs. {successBooking.amount} ({successBooking.paymentMethod})</span>
            </div>
          </div>

          <div className="flex gap-3 print:hidden">
            <button
              onClick={handlePrint}
              className="flex-1 py-3 border border-slate-200 dark:border-gray-600 hover:bg-slate-50 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-200 font-bold rounded-xl transition flex items-center justify-center gap-2 text-sm"
            >
              <Printer size={16} /> Print Receipt
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition shadow-md text-sm"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200 border border-slate-100 dark:border-gray-700">

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Activity className="text-indigo-600" size={20} />
              Book Medical Service
            </h2>
            <p className="text-xs font-medium text-slate-500 dark:text-gray-400 mt-0.5">
              Patient: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{patient?.full_name || patient?.name}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-full text-slate-400 hover:text-slate-600 dark:text-gray-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">

          {/* 1. Select Service */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-gray-300 mb-3">
              1. Select Medical Service
            </label>
            {loadingServices ? (
              <div className="flex items-center justify-center py-6 text-indigo-500">
                <Loader className="animate-spin" size={24} />
              </div>
            ) : services.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-gray-400 italic">No available services found.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {services.map(service => {
                  const isSelected = selectedService?.id === service.id;
                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => setSelectedService(service)}
                      className={`text-left p-3.5 rounded-2xl border transition-all duration-200 ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm'
                          : 'bg-slate-50 dark:bg-gray-900 border-slate-200 dark:border-gray-700 hover:border-indigo-300 hover:bg-white dark:hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-sm text-slate-800 dark:text-white line-clamp-1">{service.name}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 dark:text-gray-400 truncate max-w-[150px]">{service.location || 'Clinic'}</span>
                        <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">Rs. {service.price}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. Select Available Date */}
          {selectedService && (
            <div className="animate-in fade-in slide-in-from-top-3 duration-200">
              <div className="flex justify-between items-center mb-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-gray-300 flex items-center gap-1.5">
                  <Calendar size={14} className="text-indigo-500" />
                  2. Select Available Date
                </label>
                {availableDates.length > 0 && (
                  <span className="text-[11px] font-semibold text-slate-400">
                    {availableDates.length} upcoming days
                  </span>
                )}
              </div>

              {loadingDates ? (
                <div className="flex items-center justify-center py-6 text-indigo-500">
                  <Loader className="animate-spin" size={24} />
                </div>
              ) : availableDates.length === 0 ? (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-2xl text-center">
                  <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
                    No schedules configured for this service.
                  </p>
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">
                    Please contact admin to add recurring or specific date schedules for this service.
                  </p>
                </div>
              ) : (
                <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
                  {availableDates.map((item, idx) => {
                    const isSelected = selectedDateObj?.schedule_date === item.schedule_date;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSelectedDateObj(item);
                          setSelectedTime('');
                        }}
                        className={`flex flex-col items-center justify-center min-w-[70px] py-2.5 px-3 rounded-2xl border transition-all duration-200 shrink-0 ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200 scale-105'
                            : 'bg-slate-50 dark:bg-gray-900 border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-300 hover:border-indigo-300 hover:bg-white dark:hover:bg-gray-800'
                        }`}
                      >
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                          {item.dayName}
                        </span>
                        <span className="text-xl font-extrabold my-0.5">{item.dayNum}</span>
                        <span className={`text-[10px] font-semibold ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                          {item.month}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 3. Select Available Time Slot */}
          {selectedService && selectedDateObj && (
            <div className="animate-in fade-in slide-in-from-top-3 duration-200">
              <div className="flex justify-between items-center mb-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-gray-300 flex items-center gap-1.5">
                  <Clock size={14} className="text-indigo-500" />
                  3. Select Time Slot
                </label>
                <div className="text-[11px] font-semibold text-slate-500 dark:text-gray-400">
                  {selectedDateObj.formattedDate || selectedDateObj.schedule_date}
                </div>
              </div>

              {loadingSlots ? (
                <div className="flex items-center justify-center py-6 text-indigo-500">
                  <Loader className="animate-spin" size={24} />
                </div>
              ) : dynamicSlots.length === 0 ? (
                <div className="p-4 bg-slate-50 dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-700 text-center">
                  <p className="text-xs font-medium text-slate-500 dark:text-gray-400">
                    No slots available for this date.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {dynamicSlots.map((slot24, idx) => {
                    const isBooked = bookedSlots.includes(slot24);
                    const isSelected = selectedTime === slot24;
                    const displayTime = formatTimeDisplay(slot24);

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={isBooked}
                        onClick={() => setSelectedTime(slot24)}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all duration-200 flex flex-col items-center justify-center gap-0.5 ${
                          isBooked
                            ? 'bg-slate-100 dark:bg-gray-800/40 border-slate-200 dark:border-gray-700 text-slate-400 dark:text-gray-600 cursor-not-allowed opacity-60'
                            : isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100 scale-105'
                            : 'bg-white dark:bg-gray-900 border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-300 hover:border-indigo-400 hover:bg-indigo-50/50'
                        }`}
                      >
                        <span>{displayTime}</span>
                        {isBooked && (
                          <span className="text-[9px] uppercase tracking-wider text-rose-500 font-black">
                            Booked
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 4. Payment Method */}
          {selectedService && selectedDateObj && selectedTime && (
            <div className="animate-in fade-in slide-in-from-top-3 duration-200">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-gray-300 mb-2.5">
                4. Payment Method
              </label>
              <div className="grid grid-cols-2 gap-3">
                {['Cash', 'Card'].map(method => {
                  const isSelected = paymentMethod === method;
                  return (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2.5 text-xs font-bold rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-indigo-500'
                          : 'bg-slate-50 dark:bg-gray-900 border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-300 hover:bg-white'
                      }`}
                    >
                      {method} Payment
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/60 flex items-center justify-between shrink-0">
          <div>
            {selectedService && (
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Fee</span>
                <span className="text-base font-black text-indigo-600 dark:text-indigo-400">
                  Rs. {selectedService.price}
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 dark:text-gray-400 hover:bg-slate-200/50 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleBook}
              disabled={!selectedService || !selectedDateObj || !selectedTime || isSubmitting}
              className="px-6 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? <Loader className="animate-spin" size={14} /> : null}
              Confirm Booking
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default QuickBookServiceModal;
