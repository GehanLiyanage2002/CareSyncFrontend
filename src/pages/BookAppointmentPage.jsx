import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Printer, Calendar, Loader } from 'lucide-react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const socket = io('http://localhost:5000');

const BookAppointmentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialDoctor = location.state?.doctor;

  const [doctor, setDoctor] = useState(initialDoctor || {});
  const { user, token } = useSelector(state => state.auth);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Cash'); // 'Cash' or 'Online'
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [tokenNumber, setTokenNumber] = useState(null);
  
  const [formData, setFormData] = useState({
    fullName: user?.name || user?.full_name || '',
    age: '',
    mobileNumber: '',
    gender: '',
    email: user?.email || ''
  });

  const [errors, setErrors] = useState({});
  const [dynamicSlots, setDynamicSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [slotPage, setSlotPage] = useState(0);
  const SLOTS_PER_PAGE = 8;
  const [loadingDates, setLoadingDates] = useState(false);
  const [dates, setDates] = useState([]);



  useEffect(() => {
    const handleFeeChanged = (data) => {
      if (data.doctor_id === doctor.id || data.doctor_id === doctor.doctor_id) {
        setDoctor(prev => ({ ...prev, consultationFee: data.consultation_fee }));
      }
    };
    
    const handleAvailabilityChanged = (data) => {
      if (data.doctor_id === doctor.id || data.doctor_id === doctor.doctor_id) {
        setDoctor(prev => ({ ...prev, is_available: data.is_available }));
      }
    };

    const handleProfileUpdated = (data) => {
      if (data.doctor_id === doctor.id || data.doctor_id === doctor.doctor_id) {
        setDoctor(prev => ({
          ...prev,
          location: data.location,
          specialization: data.specialization,
          experience: data.experience,
          about: data.bio,
        }));
      }
    };

    socket.on('doctorFeeChanged', handleFeeChanged);
    socket.on('doctorAvailabilityChanged', handleAvailabilityChanged);
    socket.on('doctorProfileUpdated', handleProfileUpdated);

    return () => {
      socket.off('doctorFeeChanged', handleFeeChanged);
      socket.off('doctorAvailabilityChanged', handleAvailabilityChanged);
      socket.off('doctorProfileUpdated', handleProfileUpdated);
    };
  }, [doctor.id, doctor.doctor_id]);

  // Fetch configured dates
  useEffect(() => {
    const docId = doctor?.id || doctor?.doctor_id;
    if (docId) {
      const fetchDates = async () => {
        setLoadingDates(true);
        try {
          const res = await axios.get(`http://localhost:5000/api/appointments/configured-dates/${docId}`);
          if (res.data.success && res.data.dates) {
            const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            
            const tempDates = res.data.dates.map(dateStr => {
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
            setDates(tempDates);
          }
        } catch (error) {
          console.error("Failed to fetch configured dates", error);
        } finally {
          setLoadingDates(false);
        }
      };
      fetchDates();
    }
  }, [doctor]);

  useEffect(() => {
    const docId = doctor?.id || doctor?.doctor_id;
    if (selectedDate && docId) {
      const fetchSlots = async () => {
        setLoadingSlots(true);
        try {
          const res = await axios.get(`http://localhost:5000/api/appointments/slots/${docId}?date=${selectedDate.valueDate}`);
          if (res.data.success) {
            setDynamicSlots(res.data.slots);
          }
        } catch (error) {
          console.error("Failed to fetch slots", error);
          setDynamicSlots([]);
        } finally {
          setLoadingSlots(false);
        }
      };
      fetchSlots();
    }
  }, [selectedDate, doctor, refreshTrigger]);

  useEffect(() => {
    socket.on('slotBooked', (data) => {
      const docId = doctor?.id || doctor?.doctor_id;
      if (data.doctor_id === docId && selectedDate?.valueDate === data.date) {
        setRefreshTrigger(prev => prev + 1);
      }
    });

    return () => {
      socket.off('slotBooked');
    };
  }, [doctor, selectedDate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!formData.age.trim() || isNaN(formData.age) || parseInt(formData.age) <= 0) {
      newErrors.age = 'Provide a valid age';
    }
    if (!formData.mobileNumber.trim() || formData.mobileNumber.length < 9) {
      newErrors.mobileNumber = 'Provide a valid mobile number';
    }
    if (!formData.gender) newErrors.gender = 'Gender is required';
    
    if (!selectedDate) newErrors.date = 'Select a date';
    if (!selectedTime) newErrors.time = 'Select a time slot';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const docId = doctor?.id || doctor?.doctor_id;
        const res = await axios.post('http://localhost:5000/api/appointments', {
          doctor_id: docId,
          appointment_date: selectedDate.valueDate,
          start_time: selectedTime,
          patient_name: formData.fullName,
          age: parseInt(formData.age),
          mobile_number: formData.mobileNumber,
          gender: formData.gender,
          email: formData.email,
          payment_method: paymentMethod
        }, {
          headers: { Authorization: token }
        });
        
        if (res.data.success) {
          setTokenNumber(res.data.appointment.token_number);
          setShowSuccessModal(true);
        }
      } catch (error) {
        console.error("Booking failed", error);
        alert(error.response?.data?.message || 'Booking failed');
      }
    }
  };

  const formatTimeDisplay = (time24) => {
    const [h, m] = time24.split(':');
    const hours = parseInt(h);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12.toString().padStart(2, '0')}:${m} ${ampm}`;
  };

  const printTicket = () => {
    window.print();
  };

  if (!initialDoctor) {
    return <Navigate to="/doctors" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Header />
      <div className="pt-24 pb-12 max-w-6xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-full text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 font-semibold transition shadow-sm mb-6 bg-white dark:bg-gray-800"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Profile</span>
        </button>

        {/* We place the booking panel here */}

      {doctor.is_available === false ? (
        <div className="bg-rose-50 dark:bg-rose-900/20 rounded-3xl p-8 shadow-sm border border-rose-100 dark:border-rose-800/30 text-center transition-colors duration-300 mt-8">
          <Calendar className="h-12 w-12 text-rose-400 dark:text-rose-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-rose-900 dark:text-rose-400 mb-2">Currently Unavailable</h3>
          <p className="text-rose-700 dark:text-rose-300">This doctor is not accepting new appointments at the moment.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 shadow-lg border border-blue-50/50 dark:border-gray-700/50 transition-colors duration-300 mt-8">
          <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-400 mb-8 flex items-center gap-2 transition-colors">
            <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Book Appointment with {doctor.name}
          </h3>

          <form onSubmit={handleBookingSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Columns: Date Selection & Patient Details */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Select Date */}
            <div>
              <h4 className="text-md font-bold text-gray-800 dark:text-gray-200 mb-4 transition-colors">Select Date</h4>
              {errors.date && <p className="text-rose-500 text-xs mb-2">{errors.date}</p>}
              {loadingDates ? (
                <div className="flex justify-center py-4 w-full text-blue-500">
                  <Loader className="animate-spin h-6 w-6" />
                </div>
              ) : dates.length === 0 ? (
                <div className="text-sm text-gray-500 py-3 italic bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 w-full text-center border border-gray-100 dark:border-gray-700">
                  No availability currently configured.
                </div>
              ) : (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                  {dates.map((date, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedDate(date);
                        setSelectedTime(null); // Reset selected time slot
                        setSlotPage(0); // Reset pagination to first page
                        if (errors.date) setErrors({ ...errors, date: '' });
                      }}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all duration-300 min-w-[70px] ${
                        selectedDate?.formattedDate === date.formattedDate
                          ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                          : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <span className="text-xs uppercase tracking-wider">{date.dayName}</span>
                      <span className="text-xl font-bold my-1">{date.dayNum}</span>
                      <span className="text-xs">{date.month}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Patient Details Form */}
            <div>
              <h4 className="text-md font-bold text-gray-800 dark:text-gray-200 mb-4 transition-colors">Patient Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter Patient's Full Name"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  />
                  {errors.fullName && <p className="text-rose-500 text-xs mt-1">{errors.fullName}</p>}
                </div>

                {/* Age */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Age</label>
                  <input
                    type="text"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    placeholder="Patient's Age"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  />
                  {errors.age && <p className="text-rose-500 text-xs mt-1">{errors.age}</p>}
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Mobile Number (10 digits)</label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    placeholder="e.g. 0771234567"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  />
                  {errors.mobileNumber && <p className="text-rose-500 text-xs mt-1">{errors.mobileNumber}</p>}
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.gender && <p className="text-rose-500 text-xs mt-1">{errors.gender}</p>}
                </div>

                {/* Email */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Email (Optional - for receipt)</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="email@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Time Slots & Live Receipt Summary */}
          <div className="space-y-6 lg:border-l lg:border-gray-100 dark:lg:border-gray-700 lg:pl-8">
            
            {/* Available Time Slots */}
            <div>
              <h4 className="text-md font-bold text-gray-800 dark:text-gray-200 mb-3 transition-colors">Available Time Slots</h4>
              {errors.time && <p className="text-rose-500 text-xs mb-2">{errors.time}</p>}
              {!selectedDate ? (
                <p className="text-sm text-gray-400 dark:text-gray-500 italic bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl text-center">
                  Select a date to view available time slots.
                </p>
              ) : loadingSlots ? (
                <div className="flex justify-center py-4">
                  <Loader className="w-6 h-6 animate-spin text-blue-500" />
                </div>
              ) : dynamicSlots.length === 0 ? (
                <p className="text-sm text-rose-500 italic bg-rose-50 p-4 rounded-2xl text-center">
                  No slots available for this date.
                </p>
              ) : (
                (() => {
                  const totalPages = Math.ceil(dynamicSlots.length / SLOTS_PER_PAGE);
                  const visibleSlots = dynamicSlots.slice(slotPage * SLOTS_PER_PAGE, (slotPage + 1) * SLOTS_PER_PAGE);
                  return (
                    <div className="flex flex-col gap-3">
                      {/* Slots Grid - exactly 8 slots */}
                      <div className="grid grid-cols-2 gap-2">
                        {visibleSlots.map((slot24, idx) => {
                          const displayTime = formatTimeDisplay(slot24);
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setSelectedTime(slot24);
                                if (errors.time) setErrors({ ...errors, time: '' });
                              }}
                              className={`py-2 px-3 text-xs rounded-xl font-bold border transition-all duration-200 ${
                                selectedTime === slot24
                                  ? 'bg-teal-500 border-teal-500 text-white shadow'
                                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-teal-950/20 hover:border-teal-400'
                              }`}
                            >
                              {displayTime}
                            </button>
                          );
                        })}
                      </div>

                      {/* Pagination Controls */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-1">
                          <button
                            type="button"
                            disabled={slotPage === 0}
                            onClick={() => setSlotPage(p => p - 1)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:bg-teal-50 hover:border-teal-300 hover:text-teal-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                            Prev
                          </button>

                          <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">
                            {slotPage + 1} / {totalPages}
                          </span>

                          <button
                            type="button"
                            disabled={slotPage >= totalPages - 1}
                            onClick={() => setSlotPage(p => p + 1)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:bg-teal-50 hover:border-teal-300 hover:text-teal-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                          >
                            Next
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()
              )}
            </div>

            {/* Summary Box */}
            <div className="bg-blue-50/40 dark:bg-gray-900/40 border border-blue-100/50 dark:border-gray-700/50 rounded-3xl p-5 space-y-4 transition-colors duration-300">
              <div className="border-b border-blue-100 dark:border-gray-700 pb-3">
                <span className="block text-[10px] font-bold tracking-wider uppercase text-blue-500 dark:text-blue-400">Selected Doctor</span>
                <span className="text-md font-bold text-gray-800 dark:text-white">{doctor.name}</span>
              </div>

              <div>
                <span className="block text-[10px] font-bold tracking-wider uppercase text-blue-500 dark:text-blue-400">Doctor Speciality</span>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{doctor.specialization}</span>
              </div>

              <div>
                <span className="block text-[10px] font-bold tracking-wider uppercase text-blue-500 dark:text-blue-400">Selected Date</span>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {selectedDate ? `${selectedDate.dayName}, ${selectedDate.dayNum} ${selectedDate.month} ${selectedDate.year}` : 'Not selected'}
                </span>
              </div>

              <div>
                <span className="block text-[10px] font-bold tracking-wider uppercase text-blue-500 dark:text-blue-400">Selected Time</span>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {selectedTime ? formatTimeDisplay(selectedTime) : 'Not selected'}
                </span>
              </div>

              <div className="border-t border-blue-100 dark:border-gray-700 pt-3 flex justify-between items-center">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Consultation Fee</span>
                <span className="text-md font-bold text-blue-900 dark:text-blue-400">Rs. {doctor.consultationFee}</span>
              </div>

              {/* Payment Methods */}
              <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-xl transition-colors duration-300">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Cash')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                    paymentMethod === 'Cash'
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow'
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Cash
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Online')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                    paymentMethod === 'Online'
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow'
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Online
                </button>
              </div>

              {/* Confirm Booking Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-1.5 shadow-md transition duration-300 hover:shadow-lg active:scale-98"
              >
                Confirm Booking
              </button>
            </div>

          </div>

        </form>
        </div>
      )}


{/* Success Booking Receipt Overlay Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700/80 animate-in fade-in zoom-in-95 duration-200">
            {/* Header / Success Animation */}
            <div className="bg-gradient-to-r from-blue-600 to-teal-500 p-6 text-center text-white relative">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30 animate-bounce">
                <CheckCircle className="h-9 w-9 text-white" />
              </div>
              <h4 className="text-xl font-bold">Booking Confirmed!</h4>
              <p className="text-xs text-blue-100 mt-1">Your appointment is scheduled successfully.</p>
            </div>

            {/* Ticket Content */}
            <div className="p-6 space-y-4">
              {/* Token Number */}
              <div className="bg-teal-50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/60 rounded-2xl p-4 text-center">
                <span className="block text-xs text-teal-600 dark:text-teal-400 font-bold uppercase tracking-widest mb-1">Queue Token</span>
                <span className="text-4xl font-extrabold text-teal-800 dark:text-teal-400 tracking-wider font-mono">{tokenNumber}</span>
              </div>

              {/* Receipt Body */}
              <div className="border-2 border-dashed border-gray-100 dark:border-gray-700 p-4 rounded-2xl space-y-3 bg-gray-50/50 dark:bg-gray-900/20">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400 font-semibold">Doctor</span>
                  <span className="text-gray-800 dark:text-gray-200 font-bold">{doctor.name}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400 font-semibold">Speciality</span>
                  <span className="text-gray-800 dark:text-gray-200 font-bold">{doctor.specialization}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400 font-semibold">Date & Time</span>
                  <span className="text-gray-800 dark:text-gray-200 font-bold">{selectedDate?.formattedDate} @ {selectedTime}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400 font-semibold">Patient Name</span>
                  <span className="text-gray-800 dark:text-gray-200 font-bold">{formData.fullName} (Age: {formData.age})</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400 font-semibold">Mobile</span>
                  <span className="text-gray-800 dark:text-gray-200 font-bold">{formData.mobileNumber}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400 font-semibold">Payment Status</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    {paymentMethod === 'Cash' ? 'Pay Cash at Counter' : 'Online Paid'}
                  </span>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-700 pt-3 flex justify-between text-sm font-bold">
                  <span className="text-gray-500">Paid Amount</span>
                  <span className="text-blue-900 dark:text-blue-400">Rs. {doctor.consultationFee}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={printTicket}
                  className="flex-1 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold py-3 rounded-2xl flex items-center justify-center gap-1.5 transition"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSuccessModal(false);
                    navigate(-1);
                  }}
                  className="flex-1 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold py-3 rounded-2xl transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
      <Footer />
    </div>
  );
};

export default BookAppointmentPage;
