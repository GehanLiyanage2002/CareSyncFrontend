import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { UserPlus, User, Phone, Mail, Droplets, Activity, CalendarPlus, Stethoscope } from 'lucide-react';
import QuickBookModal from './QuickBookModal';
import QuickBookServiceModal from './QuickBookServiceModal';

const WalkInRegistration = () => {
 const { token } = useSelector((state) => state.auth);
 const [loading, setLoading] = useState(false);
 const [recentlyRegisteredPatient, setRecentlyRegisteredPatient] = useState(null);
 const [formData, setFormData] = useState({
 name: '',
 phone: '',
 email: '',
 blood_group: '',
 emergency_contact_name: '',
 emergency_contact_number: ''
 });

 const [searchResults, setSearchResults] = useState([]);
 const [showDropdown, setShowDropdown] = useState(false);
 const [searchQuery, setSearchQuery] = useState('');
 const [isSearching, setIsSearching] = useState(false);
 const [allPatients, setAllPatients] = useState([]);
 const [patientForBooking, setPatientForBooking] = useState(null);
 const [patientForServiceBooking, setPatientForServiceBooking] = useState(null);
 const dropdownRef = useRef(null);

 useEffect(() => {
 const handleClickOutside = (event) => {
 if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
 setShowDropdown(false);
 }
 };
 document.addEventListener("mousedown", handleClickOutside);
 return () => document.removeEventListener("mousedown", handleClickOutside);
 }, []);

 useEffect(() => {
 const fetchAllPatients = async () => {
 try {
 const response = await axios.get(`https://caresync-backend-api-gl.azurewebsites.net/api/receptionist/all-patients`, {
 headers: { Authorization: token }
 });
 setAllPatients(response.data);
 } catch (error) {
 console.error('Error preloading patients:', error);
 }
 };
 fetchAllPatients();
 }, [token]);

 useEffect(() => {
 if (searchQuery.length >= 2) {
 const q = searchQuery.toLowerCase();
 // Instant local search (0ms network delay)
 const filtered = allPatients.filter(p => 
 (p.full_name && p.full_name.toLowerCase().includes(q)) || 
 (p.email && p.email.toLowerCase().includes(q)) ||
 (p.mobile_number && p.mobile_number.includes(q))
 ).slice(0, 10);
 
 setSearchResults(filtered);
 setShowDropdown(true);
 setIsSearching(false);
 } else {
 setSearchResults([]);
 setShowDropdown(false);
 setIsSearching(false);
 }
 }, [searchQuery, allPatients]);

 const handleSearchChange = (e) => {
 setSearchQuery(e.target.value);
 if (e.target.value.length < 2) {
 setShowDropdown(false);
 }
 };

 const handleSelectPatient = (patient) => {
 setFormData({
 name: patient.full_name || '',
 phone: patient.mobile_number || '',
 email: patient.email || '',
 blood_group: patient.blood_group || '',
 emergency_contact_name: patient.emergency_contact_name || '',
 emergency_contact_number: patient.emergency_contact_number || ''
 });
 setShowDropdown(false);
 setSearchQuery('');
 };

 const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

 const handleChange = (e) => {
 setFormData({
 ...formData,
 [e.target.name]: e.target.value
 });
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 
 if (!formData.name || !formData.phone) {
 toast.error('Name and Phone Number are required.');
 return;
 }

 setLoading(true);

 try {
 const res = await axios.post(
 'https://caresync-backend-api-gl.azurewebsites.net/api/receptionist/register-patient',
 formData,
 {
 headers: { Authorization: token }
 }
 );

 toast.success('Patient Details Saved Successfully!');
 
 const registeredPatient = res.data.patient || formData; // Fallback to formData if patient object is incomplete
 // Format it to match what QuickBookModal expects (it needs at least id, full_name, mobile_number)
 const patientForBooking = {
 ...registeredPatient,
 id: registeredPatient.id,
 full_name: registeredPatient.full_name || registeredPatient.name || formData.name,
 mobile_number: registeredPatient.mobile_number || registeredPatient.phone || formData.phone,
 };
 
 setRecentlyRegisteredPatient(patientForBooking);

 // Clear form
 setFormData({
 name: '',
 phone: '',
 email: '',
 blood_group: '',
 emergency_contact_name: '',
 emergency_contact_number: ''
 });
 
 } catch (error) {
 console.error(error);
 const errorMsg = error.response?.data?.message || 'Failed to register patient.';
 toast.error(errorMsg);
 } finally {
 setLoading(false);
 }
 };

 return (
 <div className="space-y-8 animate-fadeIn">
 {/* Search Bar Section */}
 <div className="relative" ref={dropdownRef}>
 <label className="block text-[15px] font-extrabold text-slate-800 mb-3">Search patients</label>
 <div className="flex items-center gap-4">
 <div className="relative flex-1">
 <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-blue-500">
 <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
 </div>
 <input
 type="text"
 value={searchQuery}
 onChange={handleSearchChange}
 placeholder="Search name / phone / email"
 className="block w-full pl-12 pr-6 py-3.5 bg-white border border-slate-200 text-slate-800 placeholder-slate-400 rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all font-medium text-[15px] shadow-sm"
 />
 </div>
 <button 
 type="button"
 onClick={() => {
 setSearchQuery('');
 setShowDropdown(false);
 }}
 className="px-8 py-3.5 bg-[#3b82f6] hover:bg-blue-600 text-white font-bold rounded-[2rem] transition-colors shadow-md text-[15px]"
 >
 Clear
 </button>
 </div>

 {/* Search Dropdown */}
 {showDropdown && (
 <div className="absolute top-[105px] left-0 w-full md:w-[calc(100%-110px)] z-50 bg-white rounded-2xl shadow-xl border border-slate-100 max-h-[28rem] overflow-y-auto">
 <div className="p-2">
 <p className="text-xs font-bold text-slate-400 px-3 pb-2 pt-1 uppercase tracking-wider">Suggested Patients</p>
 
 {isSearching ? (
 <div className="flex items-center justify-center p-4 text-slate-500 gap-2">
 <Activity className="animate-spin text-blue-500" size={16} />
 <span className="text-sm font-bold">Searching...</span>
 </div>
 ) : searchResults.length > 0 ? (
 searchResults.map((patient) => (
 <div 
 key={patient.id} 
 className="px-4 py-3 hover:bg-slate-50 rounded-xl transition-colors border-b border-slate-50 last:border-0 flex items-center justify-between group"
 >
 <div className="cursor-pointer flex-1" onClick={() => handleSelectPatient(patient)}>
 <p className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">{patient.full_name}</p>
 <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
 <span className="text-xs text-slate-500 flex items-center gap-1"><Phone size={12}/> {patient.mobile_number}</span>
 {patient.email && <span className="text-xs text-slate-500 flex items-center gap-1"><Mail size={12}/> {patient.email}</span>}
 </div>
 </div>
 <div className="flex gap-2 ml-3 shrink-0">
 <button
 type="button"
 onClick={(e) => {
 e.stopPropagation();
 setPatientForBooking(patient);
 setShowDropdown(false);
 }}
 className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-sm"
 >
 <Stethoscope size={14} />
 <span className="hidden sm:inline">Book Doctor</span>
 </button>
 <button
 type="button"
 onClick={(e) => {
 e.stopPropagation();
 setPatientForServiceBooking(patient);
 setShowDropdown(false);
 }}
 className="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-sm"
 >
 <Activity size={14} />
 <span className="hidden sm:inline">Book Service</span>
 </button>
 </div>
 </div>
 ))
 ) : searchQuery.length >= 2 ? (
 <div className="p-4 text-center text-sm font-bold text-slate-500 ">No patients found.</div>
 ) : null}
 </div>
 </div>
 )}
 </div>

 <div className={`bg-white rounded-3xl border border-blue-50 shadow-sm p-8 lg:p-10 relative overflow-hidden transition-all duration-300 ${showDropdown ? 'hidden' : 'block'}`}>
 {/* Decorative BG element */}
 <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60"></div>
 
 <div className="relative z-10">
 <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100 ">
 <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
 <UserPlus size={28} />
 </div>
 <div>
 <h3 className="text-2xl font-extrabold text-slate-800 ">Walk-in Registration</h3>
 <p className="text-sm font-medium text-slate-500 mt-1">Quickly add a new patient to the system.</p>
 </div>
 </div>

 <form onSubmit={handleSubmit} className="space-y-6">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 
 {/* Patient Name */}
 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2">Full Name *</label>
 <div className="relative">
 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
 <User size={18} />
 </div>
 <input
 type="text"
 name="name"
 value={formData.name}
 onChange={handleChange}
 autoComplete="off"
 required
 placeholder="e.g. John Doe"
 className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
 />
 </div>
 </div>

 {/* Phone Number */}
 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number *</label>
 <div className="relative">
 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
 <Phone size={18} />
 </div>
 <input
 type="tel"
 name="phone"
 value={formData.phone}
 onChange={handleChange}
 autoComplete="off"
 required
 placeholder="e.g. 0771234567"
 className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
 />
 </div>
 </div>

 {/* Email (Optional) */}
 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2">Email Address <span className="text-slate-400 font-normal">(Optional)</span></label>
 <div className="relative">
 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
 <Mail size={18} />
 </div>
 <input
 type="email"
 name="email"
 value={formData.email}
 onChange={handleChange}
 autoComplete="off"
 placeholder="e.g. john@example.com"
 className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
 />
 </div>
 </div>

 {/* Blood Group */}
 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2">Blood Group <span className="text-slate-400 font-normal">(Optional)</span></label>
 <div className="relative">
 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
 <Droplets size={18} />
 </div>
 <select
 name="blood_group"
 value={formData.blood_group}
 onChange={handleChange}
 className="block w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium appearance-none cursor-pointer"
 >
 <option value="" disabled>Select Blood Group</option>
 {bloodGroups.map((bg) => (
 <option key={bg} value={bg}>{bg}</option>
 ))}
 </select>
 <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
 </div>
 </div>
 </div>

 {/* Emergency Contact Name */}
 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2">Emergency Contact Name</label>
 <div className="relative">
 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
 <Activity size={18} />
 </div>
 <input
 type="text"
 name="emergency_contact_name"
 value={formData.emergency_contact_name}
 onChange={handleChange}
 placeholder="e.g. Jane Doe"
 className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
 />
 </div>
 </div>

 {/* Emergency Contact Number */}
 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2">Emergency Contact Phone</label>
 <div className="relative">
 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
 <Phone size={18} />
 </div>
 <input
 type="tel"
 name="emergency_contact_number"
 value={formData.emergency_contact_number}
 onChange={handleChange}
 placeholder="e.g. 0777654321"
 className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
 />
 </div>
 </div>

 </div>

 <div className="pt-6 border-t border-slate-100 flex justify-end">
 <button
 type="submit"
 disabled={loading}
 className={`flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white shadow-lg transition-all duration-300 ${
 loading 
 ? 'bg-blue-400 cursor-not-allowed shadow-none' 
 : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:-translate-y-0.5 shadow-blue-200'
 }`}
 >
 {loading ? (
 <>
 <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
 </svg>
 Registering...
 </>
 ) : (
 <>
 <UserPlus size={20} />
 Register Patient
 </>
 )}
 </button>
 </div>
 </form>
 </div>
 
 {/* Post-Registration Action Section */}
 {recentlyRegisteredPatient && (
 <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 lg:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 animate-fadeIn">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
 </div>
 <div>
 <h4 className="text-lg font-bold text-slate-800 ">Registration Successful!</h4>
 <p className="text-sm font-medium text-slate-600 mt-0.5">
 Patient <strong>{recentlyRegisteredPatient.full_name}</strong> is now registered in the system.
 </p>
 </div>
 </div>
 <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
 <button
 onClick={() => setPatientForBooking(recentlyRegisteredPatient)}
 className="flex-1 md:flex-none px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
 >
 <Stethoscope size={18} />
 Book Doctor
 </button>
 <button
 onClick={() => setPatientForServiceBooking(recentlyRegisteredPatient)}
 className="flex-1 md:flex-none px-6 py-3 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
 >
 <Activity size={18} />
 Book Service
 </button>
 </div>
 </div>
 )}
 </div>
 
 {/* Quick Booking Modal */}
 {patientForBooking && (
 <QuickBookModal 
 patient={patientForBooking} 
 onClose={() => setPatientForBooking(null)}
 onBookingSuccess={() => {
 setSearchQuery('');
 setPatientForBooking(null);
 setRecentlyRegisteredPatient(null);
 }}
 />
 )}

 {/* Quick Service Booking Modal */}
 {patientForServiceBooking && (
 <QuickBookServiceModal 
 patient={patientForServiceBooking} 
 onClose={() => setPatientForServiceBooking(null)}
 onBookingSuccess={() => {
 setSearchQuery('');
 setPatientForServiceBooking(null);
 setRecentlyRegisteredPatient(null);
 }}
 />
 )}
 </div>
 );
};

export default WalkInRegistration;
