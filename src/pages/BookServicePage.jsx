import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Printer, Calendar, Loader } from 'lucide-react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PatientReviewsList from '../components/PatientReviewsList';

const BookServicePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialService = location.state?.service;

  const [service] = useState(initialService || {});
  const { user, token } = useSelector(state => state.auth);
  
  const [schedules, setSchedules] = useState([]);
  const [selectedDateObj, setSelectedDateObj] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Cash'); 
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  
  const [errors, setErrors] = useState({});
  const [loadingDates, setLoadingDates] = useState(false);
  
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ average_rating: 0, total_reviews: 0 });
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:5000/api/reviews/public/recent')
      .then(res => {
        if (res.data.success && res.data.reviews) {
          setReviews(res.data.reviews);
          // compute mock stats for clinic
          const total = res.data.reviews.length;
          const avg = total > 0 ? res.data.reviews.reduce((acc, r) => acc + r.rating, 0) / total : 0;
          setReviewStats({ average_rating: (Math.round(avg * 10) / 10).toFixed(1), total_reviews: total });
        }
      })
      .catch(err => console.error('Failed to fetch clinic reviews:', err))
      .finally(() => setLoadingReviews(false));
  }, []);

  // Pagination for slots
  const [slotPage, setSlotPage] = useState(0);
  const SLOTS_PER_PAGE = 12;

  useEffect(() => {
    const fetchSchedules = async () => {
      if (!service.id) return;
      setLoadingDates(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/services/${service.id}/schedules`, {
          headers: { Authorization: token }
        });
        if (res.data.success && res.data.schedules) {
          const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          
          const formattedSchedules = res.data.schedules.map(sch => {
            const d = new Date(sch.schedule_date);
            return {
              ...sch,
              dayName: daysOfWeek[d.getDay()],
              dayNum: d.getDate(),
              month: months[d.getMonth()],
              year: d.getFullYear(),
              formattedDate: `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
            };
          });
          setSchedules(formattedSchedules);
        }
      } catch (error) {
        console.error("Failed to fetch service schedules", error);
      } finally {
        setLoadingDates(false);
      }
    };
    fetchSchedules();
  }, [service, token]);

  // Generate slots for selected schedule
  const generateSlots = (schedule) => {
    if (!schedule) return [];
    const slots = [];
    let [currHour, currMin] = schedule.start_time.split(':').map(Number);
    let [endHour, endMin] = schedule.end_time.split(':').map(Number);
    const duration = Number(schedule.slot_duration_minutes);

    // Handle overnight shifts where end time is on the next day
    if (endHour < currHour || (endHour === currHour && endMin < currMin)) {
      endHour += 24;
    }

    while (currHour < endHour || (currHour === endHour && currMin < endMin)) {
      const displayHour = currHour % 24;
      const hh = displayHour.toString().padStart(2, '0');
      const mm = currMin.toString().padStart(2, '0');
      slots.push(`${hh}:${mm}`);
      
      currMin += duration;
      if (currMin >= 60) {
        currHour += Math.floor(currMin / 60);
        currMin = currMin % 60;
      }
    }
    return slots;
  };

  const dynamicSlots = generateSlots(selectedDateObj);

  const validateForm = () => {
    const newErrors = {};
    if (!selectedDateObj) newErrors.date = 'Select a date';
    if (!selectedTime) newErrors.time = 'Select a time slot';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const res = await axios.post('http://localhost:5000/api/services/book', {
          service_id: service.id,
          date: selectedDateObj.schedule_date,
          time: selectedTime,
          amount_paid: service.price || 0
        }, {
          headers: { Authorization: token }
        });
        
        if (res.data.success) {
          setBookingId(res.data.booking.id);
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

  if (!initialService) {
    return <Navigate to="/services" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="print:hidden">
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

        {service.is_available === false ? (
          <div className="bg-rose-50 dark:bg-rose-900/20 rounded-3xl p-8 shadow-sm border border-rose-100 dark:border-rose-800/30 text-center transition-colors duration-300 mt-8">
            <Calendar className="h-12 w-12 text-rose-400 dark:text-rose-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-rose-900 dark:text-rose-400 mb-2">Currently Unavailable</h3>
            <p className="text-rose-700 dark:text-rose-300">This service is not accepting new bookings at the moment.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 shadow-lg border border-blue-50/50 dark:border-gray-700/50 transition-colors duration-300 mt-8">
            <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-400 mb-8 flex items-center gap-2 transition-colors">
              <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              Book Service: {service.name}
            </h3>

            <form onSubmit={handleBookingSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            
              {/* Left Column: Date & Time Selection */}
              <div className="space-y-8">
                
                {/* Select Date */}
                <div>
                  <h4 className="text-md font-bold text-gray-800 dark:text-gray-200 mb-4 transition-colors">Select Date</h4>
                  {errors.date && <p className="text-rose-500 text-xs mb-2">{errors.date}</p>}
                  {loadingDates ? (
                    <div className="flex justify-center py-4 w-full text-teal-500">
                      <Loader className="animate-spin h-6 w-6" />
                    </div>
                  ) : schedules.length === 0 ? (
                    <div className="text-sm text-gray-500 py-3 italic bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 w-full text-center border border-gray-100 dark:border-gray-700">
                      No availability currently configured for this service.
                    </div>
                  ) : (
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                      {schedules.map((schedule, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setSelectedDateObj(schedule);
                            setSelectedTime(null);
                            setSlotPage(0);
                            if (errors.date) setErrors({ ...errors, date: '' });
                          }}
                          className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all duration-300 min-w-[75px] ${
                            selectedDateObj?.schedule_date === schedule.schedule_date
                              ? 'bg-teal-600 border-teal-600 text-white shadow-md scale-105'
                              : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                        >
                          <span className="text-xs uppercase tracking-wider">{schedule.dayName}</span>
                          <span className="text-2xl font-bold my-1">{schedule.dayNum}</span>
                          <span className="text-xs">{schedule.month}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Available Time Slots */}
                <div>
                  <h4 className="text-md font-bold text-gray-800 dark:text-gray-200 mb-3 transition-colors">Select Time</h4>
                  {errors.time && <p className="text-rose-500 text-xs mb-2">{errors.time}</p>}
                  {!selectedDateObj ? (
                    <p className="text-sm text-gray-400 dark:text-gray-500 italic bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl text-center">
                      Select a date to view available time slots.
                    </p>
                  ) : dynamicSlots.length === 0 ? (
                    <p className="text-sm text-rose-500 italic bg-rose-50 p-4 rounded-2xl text-center">
                      No slots available for this date.
                    </p>
                  ) : (
                    (() => {
                      const totalPages = Math.ceil(dynamicSlots.length / SLOTS_PER_PAGE);
                      const visibleSlots = dynamicSlots.slice(slotPage * SLOTS_PER_PAGE, (slotPage + 1) * SLOTS_PER_PAGE);
                      return (
                        <div className="flex flex-col gap-4">
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
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
                                      ? 'bg-blue-500 border-blue-500 text-white shadow scale-105'
                                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:border-blue-400'
                                  }`}
                                >
                                  {displayTime}
                                </button>
                              );
                            })}
                          </div>

                          {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-2">
                              <button
                                type="button"
                                disabled={slotPage === 0}
                                onClick={() => setSlotPage(p => p - 1)}
                                className="px-4 py-2 text-xs font-bold rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 transition"
                              >
                                Prev
                              </button>
                              <span className="text-xs font-semibold text-gray-500">
                                Page {slotPage + 1} of {totalPages}
                              </span>
                              <button
                                type="button"
                                disabled={slotPage >= totalPages - 1}
                                onClick={() => setSlotPage(p => p + 1)}
                                className="px-4 py-2 text-xs font-bold rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 transition"
                              >
                                Next
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })()
                  )}
                </div>
              </div>

              {/* Right Column: Receipt Summary & Payment */}
              <div>
                <h4 className="text-md font-bold text-gray-800 dark:text-gray-200 mb-4 transition-colors">Booking Summary</h4>
                <div className="bg-gradient-to-br from-teal-50/50 to-blue-50/50 dark:from-gray-900 dark:to-gray-800 border border-teal-100/50 dark:border-gray-700/50 rounded-3xl p-6 space-y-5 transition-colors duration-300 shadow-inner">
                  
                  <div className="border-b border-teal-100 dark:border-gray-700 pb-4">
                    <span className="block text-[10px] font-bold tracking-wider uppercase text-teal-600 dark:text-teal-400">Service</span>
                    <span className="text-lg font-bold text-gray-800 dark:text-white">{service.name}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="block text-[10px] font-bold tracking-wider uppercase text-blue-500 dark:text-blue-400">Date</span>
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {selectedDateObj ? selectedDateObj.formattedDate : '-'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold tracking-wider uppercase text-blue-500 dark:text-blue-400">Time</span>
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {selectedTime ? formatTimeDisplay(selectedTime) : '-'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold tracking-wider uppercase text-blue-500 dark:text-blue-400">Patient Details</span>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 block">{user?.name || user?.full_name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</span>
                  </div>

                  <div className="border-t border-teal-100 dark:border-gray-700 pt-4">
                    <span className="block text-[10px] font-bold tracking-wider uppercase text-gray-500 mb-2">Payment Method</span>
                    <div className="flex bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('Cash')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                          paymentMethod === 'Cash'
                            ? 'bg-teal-500 text-white shadow'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                      >
                        Cash on Arrival
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('Online')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                          paymentMethod === 'Online'
                            ? 'bg-teal-500 text-white shadow'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                      >
                        Pay Online
                      </button>
                    </div>
                  </div>

                  <div className="border-t-2 border-dashed border-teal-200 dark:border-gray-700 pt-4 flex justify-between items-center">
                    <span className="text-sm font-extrabold text-gray-800 dark:text-gray-200 uppercase">Total Amount</span>
                    <span className="text-xl font-black text-teal-600 dark:text-teal-400">Rs. {service.price || 0}</span>
                  </div>

                  {user?.role !== 'Patient' ? (
                    <div className="mt-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-2xl text-center text-sm font-bold border border-red-200 dark:border-red-800/30">
                      Only Patients can book services.
                    </div>
                  ) : (
                    <button
                      type="submit"
                      className="w-full mt-4 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition duration-300 hover:shadow-xl active:scale-95"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Confirm Booking
                    </button>
                  )}
                </div>
              </div>

            </form>
          </div>
        )}
      </div>

      {/* Success Booking Receipt Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:fixed print:inset-0 print:bg-white print:z-50 print:p-0">
            <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 print:shadow-none print:border-none print:m-0 print:w-full print:max-w-none print:h-full print:rounded-none">
              <div className="bg-gradient-to-r from-teal-500 to-blue-600 p-8 text-center text-white">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30">
                  <CheckCircle className="h-10 w-10 text-white" />
                </div>
                <h4 className="text-2xl font-bold">Booking Confirmed!</h4>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-teal-50 dark:bg-teal-950/20 rounded-2xl p-4 text-center border border-teal-100">
                  <span className="block text-xs text-teal-600 font-bold uppercase tracking-widest mb-1">Booking ID</span>
                  <span className="text-3xl font-extrabold text-teal-800 tracking-wider font-mono">#{bookingId}</span>
                </div>

                <div className="space-y-3 bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Service</span>
                    <span className="font-bold text-gray-800 dark:text-white">{service.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date</span>
                    <span className="font-bold text-gray-800 dark:text-white">{selectedDateObj?.formattedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Time</span>
                    <span className="font-bold text-gray-800 dark:text-white">{formatTimeDisplay(selectedTime)}</span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between font-bold">
                    <span className="text-gray-600 dark:text-gray-300">Amount</span>
                    <span className="text-teal-600">Rs. {service.price} ({paymentMethod})</span>
                  </div>
                </div>

                <div className="flex gap-3 p-6 pt-0 mt-4 print:hidden">
                  <button
                    onClick={printTicket}
                    className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-3 rounded-2xl flex items-center justify-center gap-1.5 transition"
                  >
                    <Printer className="h-4 w-4" /> Print
                  </button>
                  <button
                    onClick={() => {
                      setShowSuccessModal(false);
                      navigate('/patient/dashboard');
                    }}
                    className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 rounded-2xl transition"
                  >
                    Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
      
      <div className="max-w-6xl mx-auto px-4 mt-8 mb-12">
        <PatientReviewsList 
          title="Patient Feedback"
          subtitle="What patients say about our clinic"
          reviews={reviews} 
          reviewStats={reviewStats} 
          loadingReviews={loadingReviews} 
        />
      </div>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
};

export default BookServicePage;
