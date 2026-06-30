import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { X, Calendar, Loader, CheckCircle, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCleanImageUrl } from '../../utils/urlHelper';


const QuickBookModal = ({ patient, onClose, onBookingSuccess }) => {
 const { token } = useSelector((state) => state.auth);
 
 // 1. Date State (Defaults to Today)
 const todayStr = new Date().toISOString().split('T')[0];
 const [selectedDate, setSelectedDate] = useState(todayStr);

 // 2. Doctors State
 const [doctors, setDoctors] = useState([]);
 const [loadingDoctors, setLoadingDoctors] = useState(true);
 const [selectedDoctor, setSelectedDoctor] = useState(null);

 // Filters State
 const [searchQuery, setSearchQuery] = useState('');
 const [selectedSpecialization, setSelectedSpecialization] = useState('All');
 
 // 3. Slots State
 const [slots, setSlots] = useState([]);
 const [loadingSlots, setLoadingSlots] = useState(false);
 const [selectedTime, setSelectedTime] = useState(null);
 
 // Wizard State
 const [step, setStep] = useState(1);

 const [paymentMethod, setPaymentMethod] = useState('Cash');
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [successToken, setSuccessToken] = useState(null);

 // Pagination for slots
 const [slotPage, setSlotPage] = useState(0);
 const slotsPerPage = 8;
 const totalSlotPages = Math.ceil(slots.length / slotsPerPage);

 const [allDoctors, setAllDoctors] = useState([]);

 // Fetch Doctors
 useEffect(() => {
 const fetchDoctors = async () => {
 setLoadingDoctors(true);
 try {
 const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/doctors`);
 if (res.data.success) {
 setAllDoctors(res.data.doctors);
 }
 } catch (error) {
 console.error('Failed to fetch doctors', error);
 toast.error('Failed to load doctors');
 } finally {
 setLoadingDoctors(false);
 }
 };
 fetchDoctors();
 }, []);

 // Filter doctors by selectedDate locally
 useEffect(() => {
 setSelectedDoctor(null);
 setSelectedTime(null);
 setSlots([]);
 if (allDoctors.length > 0 && selectedDate) {
 const availableDocs = allDoctors.filter(doc => 
 doc.schedule_dates && doc.schedule_dates.includes(selectedDate)
 );
 setDoctors(availableDocs);
 } else {
 setDoctors([]);
 }
 }, [selectedDate, allDoctors]);

 // Fetch Slots when Doctor is selected (since Date is already selected)
 useEffect(() => {
 if (selectedDoctor && selectedDate) {
 const fetchSlots = async () => {
 setLoadingSlots(true);
 setSelectedTime(null);
 setSlotPage(0);
 try {
 const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/appointments/slots/${selectedDoctor.doctor_id}?date=${selectedDate}`);
 if (res.data.success) {
 let validSlots = res.data.slots;
 
 // Filter out past slots if booking for today
 const isToday = selectedDate === todayStr;
 if (isToday && validSlots.length > 0) {
 const now = new Date();
 const currentMinutes = now.getHours() * 60 + now.getMinutes();
 
 validSlots = validSlots.filter(slotObj => {
 const [h, m] = slotObj.time.split(':');
 return (parseInt(h) * 60 + parseInt(m)) > currentMinutes;
 });
 }

 setSlots(validSlots);
 
 // Auto-select nearest future time slot (which is now the first element)
 if (validSlots.length > 0) {
 setSelectedTime(validSlots[0].time);
 } else {
 setSelectedTime(null);
 }
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
 doctor_id: selectedDoctor.doctor_id,
 appointment_date: selectedDate,
 start_time: selectedTime,
 patient_name: patient.full_name,
 age: 30, // Default age
 mobile_number: patient.mobile_number || '0000000000',
 gender: patient.gender || '',
 email: patient.email || '',
 payment_method: paymentMethod,
 is_telemedicine: false
 };

 const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/appointments`, payload, {
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

 const handleSelectDoctor = (doc) => {
 setSelectedDoctor(doc);
 setStep(2);
 };

 // Derived state for filtering doctors
 const specializations = ['All', ...new Set(doctors.map(d => d.specialization || 'General'))];
 const filteredDoctors = doctors.filter(doc => {
 const formattedName = doc.name.startsWith('Dr.') ? doc.name : `Dr. ${doc.name}`;
 const searchLower = searchQuery.toLowerCase();
 const docSpec = doc.specialization || 'General';
 
 const matchesSearch = doc.name.toLowerCase().includes(searchLower) || 
 formattedName.toLowerCase().includes(searchLower) ||
 docSpec.toLowerCase().includes(searchLower);
 const matchesSpec = selectedSpecialization === 'All' || docSpec === selectedSpecialization;
 return matchesSearch && matchesSpec;
 });

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
 <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
 
 {/* Header */}
 <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white z-10 shrink-0">
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
 <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-50 /30">
 
 {step === 1 && (
 <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
 {/* 1. Select Doctor & Date */}
 <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
 
 {/* Search */}
 <div className="flex-1">
 <label className="block text-sm font-bold text-slate-700 mb-2">Select Doctor</label>
 <div className="relative max-w-md">
 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
 <Search size={18} />
 </div>
 <input
 type="text"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="Search doctors by name or specialization..."
 className="block w-full pl-11 pr-4 py-3 bg-white border border-slate-200 text-slate-800 placeholder-slate-400 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium text-sm shadow-sm"
 />
 </div>
 </div>

 {/* Date Picker */}
 <div className="shrink-0">
 <label className="block text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wider text-right">Appointment Date</label>
 <input 
 type="date"
 min={todayStr}
 value={selectedDate}
 onChange={(e) => setSelectedDate(e.target.value)}
 className="w-48 border border-slate-200 rounded-full px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm"
 />
 </div>
 </div>

 {/* Filters */}
 <div className="mb-6">
 <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
 {specializations.map(spec => (
 <button
 key={spec}
 onClick={() => setSelectedSpecialization(spec)}
 className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 border ${
 selectedSpecialization === spec
 ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
 : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-slate-50'
 }`}
 >
 {spec}
 </button>
 ))}
 </div>
 </div>

 {/* Doctor Cards */}
 {loadingDoctors ? (
 <div className="flex flex-col items-center justify-center py-12 text-blue-500 gap-3">
 <Loader className="animate-spin" size={32} />
 <p className="text-sm font-bold text-slate-500 ">Finding available doctors...</p>
 </div>
 ) : filteredDoctors.length === 0 ? (
 <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl">
 <p className="text-sm font-bold text-slate-500 ">No doctors available matching your criteria on this date.</p>
 </div>
 ) : (
 <div className="flex gap-4 overflow-x-auto pb-6 pt-2 px-2 snap-x snap-mandatory scrollbar-thin">
 {filteredDoctors.map(doc => (
 <button
 key={doc.doctor_id}
 onClick={() => handleSelectDoctor(doc)}
 className="flex flex-col items-center p-6 rounded-3xl border min-w-[240px] max-w-[240px] shrink-0 snap-center transition-all bg-white text-center shadow-sm hover:shadow-md border-slate-100 hover:border-blue-300 relative group"
 >
 {/* Profile Image */}
 <div className="relative mb-4 mt-2">
 <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center text-blue-300 overflow-hidden ring-4 ring-white shadow-sm mx-auto">
 <img 
 src={getCleanImageUrl(doc.image)}
 alt={doc.name}
 className="w-full h-full object-cover"
 onError={(e) => { e.target.style.display='none'; e.target.parentNode.innerHTML = '<span class="text-2xl font-bold uppercase">'+doc.name.substring(0,2)+'</span>'; }}
 />
 </div>
 <div className="absolute bottom-0 right-1 bg-blue-500 border-2 border-white rounded-full p-1 text-white shadow-sm">
 <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
 </svg>
 </div>
 </div>

 <h3 className="font-bold text-slate-800 text-lg mb-1">{doc.name.startsWith('Dr.') ? doc.name : `Dr. ${doc.name}`}</h3>
 <p className="text-blue-500 text-xs font-bold uppercase tracking-wider mb-2">{doc.specialization}</p>
 
 <p className="text-slate-400 text-[11px] font-medium mt-auto">{doc.location || 'CareSync Medical Center'}</p>
 <p className="text-slate-400 text-[11px] font-medium">{doc.experience}</p>
 
 <div className="mt-5 w-full py-2.5 rounded-xl font-bold text-sm transition-colors bg-blue-600 text-white shadow-md hover:bg-blue-700">
 Book Now
 </div>
 </button>
 ))}
 </div>
 )}
 </div>
 </div>
 )}

 {step === 2 && selectedDoctor && (
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-right-4 duration-300 max-w-4xl mx-auto">
 
 {/* Left Column: Time Slots */}
 <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col h-full">
 <h3 className="text-lg font-bold text-slate-800 mb-6">Available Time Slots</h3>
 
 {loadingSlots ? (
 <div className="flex flex-col items-center justify-center flex-1 py-12 text-blue-500 gap-3">
 <Loader className="animate-spin" size={32} />
 <p className="text-sm font-medium text-slate-500 ">Loading slots...</p>
 </div>
 ) : slots.length === 0 ? (
 <div className="py-12 text-center flex-1 border-2 border-dashed border-rose-100 rounded-2xl bg-rose-50/50 flex flex-col justify-center">
 <p className="text-sm font-bold text-rose-500">No time slots available for this date.</p>
 </div>
 ) : (
 <div className="flex flex-col flex-1">
 <div className="grid grid-cols-2 gap-3">
 {slots.slice(slotPage * slotsPerPage, (slotPage + 1) * slotsPerPage).map((slotObj, idx) => (
 <button
 key={idx}
 onClick={() => setSelectedTime(slotObj.time)}
 className={`py-2 px-2 text-sm rounded-2xl border transition-all flex flex-col items-center justify-center gap-0.5 ${
 selectedTime === slotObj.time
 ? 'bg-blue-600 border-blue-600 text-white shadow-md scale-[1.02]'
 : slotObj.isBuffer
 ? 'bg-amber-50 border-amber-200 text-amber-700 hover:border-amber-400 hover:bg-amber-100'
 : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50'
 }`}
 >
 <span className="font-bold">{formatTimeDisplay(slotObj.time)}</span>
 {slotObj.isBuffer && <span className="text-[9px] font-bold uppercase tracking-wider opacity-90">Walk-in</span>}
 </button>
 ))}
 </div>

 {totalSlotPages > 1 && (
 <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
 <button
 disabled={slotPage === 0}
 onClick={() => setSlotPage(p => p - 1)}
 className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 text-slate-500 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
 >
 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
 </svg>
 Prev
 </button>
 <span className="text-xs font-bold text-slate-400">
 {slotPage + 1} / {totalSlotPages}
 </span>
 <button
 disabled={slotPage >= totalSlotPages - 1}
 onClick={() => setSlotPage(p => p + 1)}
 className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 text-slate-500 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
 >
 Next
 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
 </svg>
 </button>
 </div>
 )}
 </div>
 )}
 </div>

 {/* Right Column: Order Summary */}
 <div className="bg-blue-50/40 border border-blue-100/50 rounded-3xl p-6 space-y-5 flex flex-col h-full">
 <div className="border-b border-blue-100 pb-4">
 <span className="block text-[10px] font-bold tracking-wider uppercase text-blue-500 mb-1">Selected Doctor</span>
 <span className="text-lg font-bold text-slate-800 ">{selectedDoctor.name.startsWith('Dr.') ? selectedDoctor.name : `Dr. ${selectedDoctor.name}`}</span>
 </div>

 <div>
 <span className="block text-[10px] font-bold tracking-wider uppercase text-blue-500 mb-1">Doctor Speciality</span>
 <span className="text-sm font-semibold text-slate-700 ">{selectedDoctor.specialization}</span>
 </div>

 <div>
 <span className="block text-[10px] font-bold tracking-wider uppercase text-blue-500 mb-1">Selected Date</span>
 <span className="text-sm font-semibold text-slate-700 ">
 {new Date(selectedDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
 </span>
 </div>

 <div>
 <span className="block text-[10px] font-bold tracking-wider uppercase text-blue-500 mb-1">Selected Time</span>
 <span className="text-sm font-semibold text-slate-700 ">
 {selectedTime ? formatTimeDisplay(selectedTime) : 'Not selected'}
 </span>
 </div>

 <div className="border-t border-blue-100 pt-4 flex justify-between items-center">
 <span className="text-xs font-bold text-slate-500 uppercase">Consultation Fee</span>
 <span className="text-lg font-bold text-blue-900">Rs. {selectedDoctor.consultationFee || 1500}</span>
 </div>

 {/* Payment Methods */}
 <div className="mt-2 bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
 <span className="text-xs font-bold text-blue-700">Cash Payment Only (Pay at Counter)</span>
 </div>

 {/* Footer Buttons */}
 <div className="pt-4 flex flex-col gap-3 mt-auto">
 <button
 onClick={handleBook}
 disabled={!selectedTime || isSubmitting}
 className="w-full bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {isSubmitting ? <Loader className="animate-spin" size={16} /> : null}
 Confirm Booking
 </button>
 <button
 onClick={() => setStep(1)}
 className="w-full py-3 text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-2xl transition-colors"
 >
 Cancel / Go Back
 </button>
 </div>
 </div>
 </div>
 )}

 </div>

 </div>
 </div>
 );
};

export default QuickBookModal;
