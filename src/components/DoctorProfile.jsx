import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, Heart, Award, Users, Check, Printer, Clock, MapPin, CheckCircle, GraduationCap, Calendar, Loader } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import PatientReviewsList from './PatientReviewsList';

const socket = io('http://localhost:5000');

const DoctorProfile = ({ doctor: initialDoctor, onBack }) => {
  const [doctor, setDoctor] = useState(initialDoctor);
  const { user, token } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Cash'); // 'Cash' or 'Online'
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [tokenNumber, setTokenNumber] = useState(null);
  const [showBookingPanel, setShowBookingPanel] = useState(false);
  
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
  // Fetch reviews for this doctor
  const [slotPage, setSlotPage] = useState(0);
  const SLOTS_PER_PAGE = 8;
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ average_rating: 0, total_reviews: 0 });
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [imgKey, setImgKey] = useState(Date.now());

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
          qualifications: data.qualifications
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

  const [loadingDates, setLoadingDates] = useState(false);
  const [dates, setDates] = useState([]);
  useEffect(() => {
    const doctorId = doctor.id || doctor.doctor_id;
    if (!doctorId) return;
    axios.get(`http://localhost:5000/api/reviews/${doctorId}`)
      .then(res => {
        if (res.data.success) {
          setReviews(res.data.reviews);
          setReviewStats({ average_rating: res.data.average_rating, total_reviews: res.data.total_reviews });
        }
      })
      .catch(err => console.error('Failed to load reviews:', err))
      .finally(() => setLoadingReviews(false));
  }, [doctor]);

  // Real-time: listen for new reviews on this doctor's profile
  useEffect(() => {
    const doctorId = doctor.id || doctor.doctor_id;
    const handleReviewAdded = ({ doctor_id, review }) => {
      if (doctor_id !== doctorId) return;
      setReviews(prev => [review, ...prev]);
      setReviewStats(prev => {
        const newTotal = prev.total_reviews + 1;
        const newAvg = ((prev.average_rating * prev.total_reviews) + review.rating) / newTotal;
        return { total_reviews: newTotal, average_rating: Math.round(newAvg * 10) / 10 };
      });
    };

    const handleProfileImageUpdated = ({ user_id }) => {
      setImgKey(Date.now());
    };

    socket.on('reviewAdded', handleReviewAdded);
    socket.on('profileImageUpdated', handleProfileImageUpdated);
    
    return () => {
      socket.off('reviewAdded', handleReviewAdded);
      socket.off('profileImageUpdated', handleProfileImageUpdated);
    };
  }, [doctor]);

  const printTicket = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 dark:text-gray-100 transition-colors duration-300">
      {/* Top Header Bar */}
      <div className="flex justify-between items-center mb-8 border-b border-gray-100 dark:border-gray-800 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold transition shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
        <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-400">Doctor Profile</h1>
        <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 text-amber-600 border border-amber-200 dark:border-amber-900/60 px-3 py-1 rounded-full text-sm font-bold">
          <Star className="h-4 w-4 fill-amber-500 stroke-amber-500" />
          <span>{reviewStats.average_rating > 0 ? reviewStats.average_rating : (doctor.rating || '—')}</span>
          {reviewStats.total_reviews > 0 && (
            <span className="text-xs font-normal text-amber-500/70 ml-0.5">({reviewStats.total_reviews})</span>
          )}
        </div>
      </div>

      {/* Main Profile Info Card */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 shadow-lg border border-blue-50/50 dark:border-gray-700/50 mb-10 transition-colors duration-300">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Profile Left: Image & Stats */}
          <div className="w-full md:w-1/3 flex flex-col items-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500 to-teal-400 opacity-20 blur-md scale-110"></div>
              <img
                src={doctor.image}
                alt={doctor.name}
                className="w-48 h-48 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-xl relative z-10"
              />
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 w-full mt-4">
              <div className="bg-rose-50/60 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-2xl p-3 text-center transition-colors duration-300">
                <Heart className="h-5 w-5 text-rose-500 mx-auto mb-1" />
                <span className="block text-xs text-gray-500 dark:text-gray-400">Success</span>
                <span className="text-sm font-bold text-rose-600 dark:text-rose-400">{doctor.successRate}</span>
              </div>
              <div className="bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-2xl p-3 text-center transition-colors duration-300">
                <Award className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                <span className="block text-xs text-gray-500 dark:text-gray-400">Exp.</span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{doctor.experience}</span>
              </div>
              <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl p-3 text-center transition-colors duration-300">
                <Users className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
                <span className="block text-xs text-gray-500 dark:text-gray-400">Patients</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{doctor.patients}</span>
              </div>
            </div>
          </div>

          {/* Profile Right: Description */}
          <div className="w-full md:w-2/3">
            <h2 className="text-3xl font-extrabold text-blue-950 dark:text-white mb-2 transition-colors">{doctor.name}</h2>
            <span className="inline-block bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 text-xs font-bold px-3 py-1 rounded-full mb-6 transition-colors">
              {doctor.specialization}
            </span>

            {/* Quick Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="border border-gray-100 dark:border-gray-700/60 bg-gray-50/50 dark:bg-gray-900/20 rounded-2xl p-4 flex items-start gap-3 transition-colors duration-300">
                <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
                <div>
                  <span className="block text-xs text-gray-500 dark:text-gray-400 font-semibold">Qualifications</span>
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{doctor.qualifications}</span>
                </div>
              </div>

              <div className="border border-gray-100 dark:border-gray-700/60 bg-gray-50/50 dark:bg-gray-900/20 rounded-2xl p-4 flex items-start gap-3 transition-colors duration-300">
                <MapPin className="h-5 w-5 text-teal-600 dark:text-teal-400 shrink-0" />
                <div>
                  <span className="block text-xs text-gray-500 dark:text-gray-400 font-semibold">Location</span>
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{doctor.location}</span>
                </div>
              </div>

              <div className="border border-gray-100 dark:border-gray-700/60 bg-gray-50/50 dark:bg-gray-900/20 rounded-2xl p-4 flex items-start gap-3 transition-colors duration-300">
                <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <div>
                  <span className="block text-xs text-gray-500 dark:text-gray-400 font-semibold">Consultation Fee</span>
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-200">Rs. {doctor.consultationFee}</span>
                </div>
              </div>

              <div className="border border-gray-100 dark:border-gray-700/60 bg-gray-50/50 dark:bg-gray-900/20 rounded-2xl p-4 flex items-start gap-3 transition-colors duration-300">
                <Check className={`h-5 w-5 shrink-0 ${doctor.is_available === false ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`} />
                <div>
                  <span className="block text-xs text-gray-500 dark:text-gray-400 font-semibold">Availability</span>
                  <span className={`text-sm font-bold flex items-center gap-1.5 ${doctor.is_available === false ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    <span className={`w-2.5 h-2.5 rounded-full ${doctor.is_available === false ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`}></span>
                    {doctor.is_available === false ? 'Unavailable' : 'Available'}
                  </span>
                </div>
              </div>
            </div>

            {/* About Doctor */}
            <div className="border-t border-gray-100 dark:border-gray-700/80 pt-6">
              <h3 className="text-lg font-bold text-blue-900 dark:text-blue-400 mb-2 transition-colors">About Doctor</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed transition-colors">{doctor.about}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <PatientReviewsList 
        reviews={reviews} 
        reviewStats={reviewStats} 
        loadingReviews={loadingReviews} 
        imgKey={imgKey} 
      />

      
      {/* Appointment Booking Button */}
      {doctor.is_available === false ? (
        <div className="bg-rose-50 dark:bg-rose-900/20 rounded-3xl p-8 shadow-sm border border-rose-100 dark:border-rose-800/30 text-center transition-colors duration-300 mt-8 mb-8">
          <Calendar className="h-12 w-12 text-rose-400 dark:text-rose-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-rose-900 dark:text-rose-400 mb-2">Currently Unavailable</h3>
          <p className="text-rose-700 dark:text-rose-300">This doctor is not accepting new appointments at the moment.</p>
        </div>
      ) : (
        <div className="flex justify-center mt-10 mb-10">
          <button
            onClick={() => navigate('/book-appointment', { state: { doctor } })}
            className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white font-extrabold text-lg py-4 px-10 rounded-full shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex items-center gap-2"
          >
            <Calendar className="w-6 h-6" />
            Book Your Appointment
          </button>
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
                    onBack(); // Go back to landing page
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
  );
};

export default DoctorProfile;
