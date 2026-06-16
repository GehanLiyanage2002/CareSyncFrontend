import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { X, Calendar, Loader, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const QuickBookModal = ({ patient, onClose, onBookingSuccess }) => {
  const { token } = useSelector((state) => state.auth);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  
  const [dates, setDates] = useState([]);
  const [loadingDates, setLoadingDates] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedTime, setSelectedTime] = useState(null);
  
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToken, setSuccessToken] = useState(null);

  // 1. Fetch Doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/users/doctors');
        if (res.data.success) {
          setDoctors(res.data.doctors);
        }
      } catch (error) {
        console.error('Failed to fetch doctors', error);
        toast.error('Failed to load doctors');
      }
    };
    fetchDoctors();
  }, []);

  // 2. Fetch Dates when Doctor is selected
  useEffect(() => {
    if (selectedDoctor) {
      const fetchDates = async () => {
        setLoadingDates(true);
        setSelectedDate(null);
        setSelectedTime(null);
        try {
          const res = await axios.get(`http://localhost:5000/api/appointments/configured-dates/${selectedDoctor.id}`);
          if (res.data.success && res.data.dates) {
            const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            
            const formatted = res.data.dates.map(dateStr => {
              const d = new Date(dateStr);
              const year = d.getFullYear();
              const monthStr = String(d.getMonth() + 1).padStart(2, '0');
              const dayStr = String(d.getDate()).padStart(2, '0');
              return {
                dayName: daysOfWeek[d.getDay()],
                dayNum: d.getDate(),
                month: months[d.getMonth()],
                year: year,
                formattedDate: `${d.getDate()} ${months[d.getMonth()]} ${year}`,
                valueDate: `${year}-${monthStr}-${dayStr}`
              };
            });
            setDates(formatted);
          }
        } catch (error) {
          console.error("Failed to fetch dates", error);
          setDates([]);
        } finally {
          setLoadingDates(false);
        }
      };
      fetchDates();
    } else {
      setDates([]);
      setSelectedDate(null);
      setSelectedTime(null);
    }
  }, [selectedDoctor]);

  // 3. Fetch Slots when Date is selected
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      const fetchSlots = async () => {
        setLoadingSlots(true);
        setSelectedTime(null);
        try {
          const res = await axios.get(`http://localhost:5000/api/appointments/slots/${selectedDoctor.id}?date=${selectedDate.valueDate}`);
          if (res.data.success) {
            setSlots(res.data.slots);
          }
        } catch (error) {
          console.error("Failed to fetch slots", error);
          setSlots([]);
        } finally {
          setLoadingSlots(false);
        }
      };
      fetchSlots();
    } else {
      setSlots([]);
      setSelectedTime(null);
    }
  }, [selectedDoctor, selectedDate]);

  const formatTimeDisplay = (time24) => {
    const [h, m] = time24.split(':');
    const hours = parseInt(h);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12.toString().padStart(2, '0')}:${m} ${ampm}`;
  };

  const handleBook = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      toast.error('Please complete all selections');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        patient_id: patient.id,
        doctor_id: selectedDoctor.id,
        appointment_date: selectedDate.valueDate,
        start_time: selectedTime,
        patient_name: patient.full_name,
        age: 30, // Default age
        mobile_number: patient.mobile_number || '0000000000',
        gender: patient.gender || 'Other',
        email: patient.email || '',
        payment_method: paymentMethod,
        is_telemedicine: false
      };

      const res = await axios.post('http://localhost:5000/api/appointments', payload, {
        headers: { Authorization: token }
      });

      if (res.data.success) {
        setSuccessToken(res.data.appointment.token_number);
        toast.success('Appointment booked successfully!');
        if (onBookingSuccess) onBookingSuccess();
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(error.response?.data?.message || 'Failed to book appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successToken) {
    return (
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Booking Confirmed!</h3>
          <p className="text-slate-500 text-sm mb-6">Appointment scheduled for {patient.full_name}</p>
          
          <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 mb-6">
            <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-1">Queue Token</p>
            <p className="text-3xl font-black text-emerald-700 font-mono">{successToken}</p>
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

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white z-10">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="text-blue-500" size={20} />
              Quick Book Appointment
            </h2>
            <p className="text-sm font-medium text-slate-500 mt-0.5">Booking for: <span className="text-blue-600 font-bold">{patient.full_name}</span></p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <div className="space-y-6">
            
            {/* 1. Select Doctor */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">1. Select Doctor</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {doctors.map(doc => (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDoctor(doc)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      selectedDoctor?.id === doc.id
                        ? 'bg-blue-50 border-blue-200 shadow-sm ring-1 ring-blue-500'
                        : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden flex-shrink-0">
                      <img 
                        src={`http://localhost:5000/api/users/profile-image/${doc.id}`} 
                        alt={doc.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display='none'; e.target.parentNode.innerHTML = doc.name.charAt(0); }}
                      />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-800 line-clamp-1">{doc.name}</p>
                      <p className="text-xs text-slate-500 line-clamp-1">{doc.specialization}</p>
                    </div>
                  </button>
                ))}
                {doctors.length === 0 && <p className="text-sm text-slate-500 italic p-2">Loading doctors...</p>}
              </div>
            </div>

            {/* 2. Select Date */}
            {selectedDoctor && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                <label className="block text-sm font-bold text-slate-700 mb-3">2. Select Date</label>
                {loadingDates ? (
                  <div className="flex items-center justify-center py-4 text-blue-500"><Loader className="animate-spin" size={24} /></div>
                ) : dates.length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-xl text-center text-sm font-medium text-slate-500 border border-slate-100">
                    No available dates found for this doctor.
                  </div>
                ) : (
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                    {dates.map((date, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedDate(date)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border min-w-[70px] transition-all flex-shrink-0 ${
                          selectedDate?.valueDate === date.valueDate
                            ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-[10px] font-bold uppercase tracking-wider">{date.dayName}</span>
                        <span className="text-xl font-black my-0.5">{date.dayNum}</span>
                        <span className="text-[10px] font-bold uppercase">{date.month}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. Select Time */}
            {selectedDate && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                <label className="block text-sm font-bold text-slate-700 mb-3">3. Select Time Slot</label>
                {loadingSlots ? (
                  <div className="flex items-center justify-center py-4 text-blue-500"><Loader className="animate-spin" size={24} /></div>
                ) : slots.length === 0 ? (
                  <div className="p-4 bg-rose-50 rounded-xl text-center text-sm font-medium text-rose-500 border border-rose-100">
                    No time slots available for this date.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {slots.map((slot, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedTime(slot)}
                        className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all ${
                          selectedTime === slot
                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50'
                        }`}
                      >
                        {formatTimeDisplay(slot)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* 4. Payment Method */}
            {selectedTime && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                <label className="block text-sm font-bold text-slate-700 mb-3">4. Payment Method</label>
                <div className="flex gap-3">
                  {['Cash', 'Card'].map(method => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`flex-1 py-2.5 text-sm font-bold rounded-xl border transition-all ${
                        paymentMethod === method
                          ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm ring-1 ring-blue-500'
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
            disabled={!selectedDoctor || !selectedDate || !selectedTime || isSubmitting}
            className="px-6 py-2.5 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? <Loader className="animate-spin" size={16} /> : null}
            Book Appointment
          </button>
        </div>

      </div>
    </div>
  );
};

export default QuickBookModal;
