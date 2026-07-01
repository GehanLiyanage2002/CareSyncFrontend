import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { Users, ChevronDown, User, Activity, Calendar, Clock, LayoutDashboard, ListFilter, CheckCircle2, XCircle, Search } from 'lucide-react';
import ReceptionistKanbanBoard from './ReceptionistKanbanBoard';
import socket from '../../socket';



const LiveQueue = () => {
 const { token } = useSelector((state) => state.auth);

 const [doctors, setDoctors] = useState([]);
 const [selectedDoctorId, setSelectedDoctorId] = useState('');
 const [activeQueue, setActiveQueue] = useState([]);
 const [upcoming, setUpcoming] = useState([]);
 const [allAppointments, setAllAppointments] = useState([]);
 const [loading, setLoading] = useState(false);
 const [searchQuery, setSearchQuery] = useState('');
 const [isFetchingDoctors, setIsFetchingDoctors] = useState(true);
 const [checkInLoading, setCheckInLoading] = useState(null);
 const [emergencyLoading, setEmergencyLoading] = useState(null);

 useEffect(() => {
 fetchDoctors();
 }, []);

 useEffect(() => {
 if (selectedDoctorId) {
 fetchQueueData(selectedDoctorId);
 } else {
 setActiveQueue([]);
 setUpcoming([]);
 setAllAppointments([]);
 }

 // Real-time Socket.io listeners for the selected doctor
 const handleUpdate = (data) => {
 if (String(data.doctor_id) === String(selectedDoctorId) || String(data.doctorId) === String(selectedDoctorId)) {
 // Refetch queue silently to keep real-time UI smooth
 axios.get(`${import.meta.env.VITE_API_URL}/api/receptionist/queue-dashboard/${selectedDoctorId}`, {
 headers: { Authorization: token }
 }).then(res => {
 setUpcoming(res.data.upcoming || []);
 setActiveQueue(res.data.activeQueue || []);
 setAllAppointments(res.data.allAppointments || []);
 }).catch(err => console.error("Real-time fetch error:", err));
 }
 };

 socket.on('slotBooked', handleUpdate);
 socket.on('appointmentStatusChanged', handleUpdate);
 socket.on('appointmentRescheduled', handleUpdate);
 socket.on('patientUpdated', handleUpdate);

 return () => {
 socket.off('slotBooked', handleUpdate);
 socket.off('appointmentStatusChanged', handleUpdate);
 socket.off('appointmentRescheduled', handleUpdate);
 socket.off('patientUpdated', handleUpdate);
 };
 }, [selectedDoctorId, token]);

 const fetchDoctors = async () => {
 try {
 setIsFetchingDoctors(true);
 // Fetch all available doctors using the public/user endpoint
 const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/doctors`, {
 headers: { Authorization: token }
 });
 setDoctors(res.data.doctors || []);
 } catch (error) {
 console.error('Error fetching doctors:', error);
 toast.error('Failed to load doctors list.');
 } finally {
 setIsFetchingDoctors(false);
 }
 };

 const fetchQueueData = async (doctorId) => {
 try {
 setLoading(true);
 // Fetch using the all-queues API and filter, or use the dedicated endpoint
 const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/receptionist/queue-dashboard/${doctorId}`, {
 headers: { Authorization: token }
 });
 setUpcoming(res.data.upcoming || []);
 setActiveQueue(res.data.activeQueue || []);
 setAllAppointments(res.data.allAppointments || []);
 } catch (error) {
 console.error('Error fetching queue data:', error);
 toast.error('Failed to load queue data.');
 } finally {
 setLoading(false);
 }
 };


 const formatTime = (timeString) => {
 if (!timeString) return '';
 try {
 const date = new Date(timeString);
 if (!isNaN(date)) {
 return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
 }
 const [hours, minutes] = timeString.split(':');
 const hour = parseInt(hours);
 const ampm = hour >= 12 ? 'PM' : 'AM';
 const formattedHour = hour % 12 || 12;
 return `${formattedHour}:${minutes} ${ampm}`;
 } catch (e) {
 return timeString;
 }
 };

 return (
 <div className="space-y-6 animate-fadeIn pb-10">

 {/* Doctor Selection Header */}
 <div className="bg-white dark:bg-gray-800 rounded-3xl border border-blue-50 shadow-sm p-6 relative overflow-hidden flex flex-col gap-6">
 <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60 pointer-events-none"></div>

 <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
 <Users size={24} />
 </div>
 <div>
 <h3 className="text-xl font-extrabold text-slate-800 dark:text-white ">Live Queue Dashboard</h3>
 <p className="text-sm font-medium text-slate-500 dark:text-gray-400 ">Select a doctor to manage their live queue.</p>
 </div>
 </div>

 <div className="relative min-w-[280px] md:max-w-md flex-1">
 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
 <Search size={18} />
 </div>
 <input
 type="text"
 placeholder="Search doctors by name or specialty..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="block w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-600 text-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-bold placeholder-slate-400 shadow-sm"
 />
 </div>
 </div>

 {/* Horizontal Scrollable Doctor Cards */}
 <div className="relative z-10 flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
 {(() => {
 if (isFetchingDoctors) {
 return (
 <div className="flex items-center justify-center w-full py-4 text-slate-500 dark:text-gray-400 gap-2">
 <Activity className="animate-spin text-blue-500" size={20} />
 <span className="text-sm font-bold">Loading doctors...</span>
 </div>
 );
 }

 const filteredDoctors = doctors.filter(doc => 
 (doc.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
 (doc.specialization || '').toLowerCase().includes(searchQuery.toLowerCase())
 );

 if (filteredDoctors.length === 0) {
 return <div className="text-slate-500 dark:text-gray-400 text-sm font-medium py-2">No doctors found matching your search.</div>;
 }

 return filteredDoctors.map(doc => (
 <button
 key={doc.doctor_id}
 onClick={() => setSelectedDoctorId(String(doc.doctor_id))}
 className={`flex-shrink-0 flex items-center gap-3 p-3 pr-5 rounded-2xl border transition-all text-left group ${
 String(selectedDoctorId) === String(doc.doctor_id) 
 ? 'bg-blue-600 border-blue-600 shadow-md transform scale-[1.02]' 
 : 'bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-600 hover:border-blue-300 hover:bg-blue-50 shadow-sm'
 }`}
 >
 <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black shadow-inner transition-colors ${
 String(selectedDoctorId) === String(doc.doctor_id)
 ? 'bg-white dark:bg-gray-800 /20 text-white'
 : 'bg-slate-100 dark:bg-gray-800 text-slate-500 dark:text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600'
 }`}>
 {doc.name ? doc.name.charAt(0).toUpperCase() : <User size={18} />}
 </div>
 <div>
 <h4 className={`font-bold text-sm ${String(selectedDoctorId) === String(doc.doctor_id) ? 'text-white' : 'text-slate-800 dark:text-white '}`}>
 Dr. {doc.name}
 </h4>
 <p className={`text-[11px] font-medium ${String(selectedDoctorId) === String(doc.doctor_id) ? 'text-blue-100' : 'text-slate-500 dark:text-gray-400 '}`}>
 {doc.specialization || 'General'}
 </p>
 </div>
 </button>
 ));
 })()}
 </div>
 </div>

 {!selectedDoctorId ? (
 <div className="bg-white dark:bg-gray-800 /50 backdrop-blur-sm rounded-3xl border border-dashed border-slate-200 dark:border-gray-600 p-12 text-center shadow-sm">
 <div className="w-20 h-20 bg-slate-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
 <Users size={32} />
 </div>
 <h3 className="text-xl font-bold text-slate-600 dark:text-gray-300 mb-2">No Doctor Selected</h3>
 <p className="text-slate-400 font-medium">Please select a doctor from the list above to view their live queue.</p>
 </div>
 ) : (
 <div className="relative">
 {/* Loading Overlay */}
 {loading && (
 <div className="absolute inset-0 bg-white dark:bg-gray-800 /60 backdrop-blur-sm z-10 rounded-3xl flex items-center justify-center">
 <div className="flex flex-col items-center">
 <svg className="animate-spin h-8 w-8 text-blue-600 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
 </svg>
 <p className="font-bold text-slate-600 dark:text-gray-300 ">Syncing Live Queue...</p>
 </div>
 </div>
 )}

 {/* Status Banner */}
 {(() => {
 const sortByTime = (a, b) => {
 const dateA = new Date(a.appointment_date).getTime();
 const dateB = new Date(b.appointment_date).getTime();
 if (!isNaN(dateA) && !isNaN(dateB) && dateA !== dateB) return dateA - dateB;
 const timeA = a.start_time || "";
 const timeB = b.start_time || "";
 return timeA.localeCompare(timeB);
 };

 const currentPatientList = allAppointments.filter(a => a.status?.toLowerCase() === 'in progress');
 
 const inQueuePatients = allAppointments.filter(a => a.status?.toLowerCase() === 'in_queue').sort((a,b) => (parseInt(a.token_number)||0) - (parseInt(b.token_number)||0));
 const pendingPatients = allAppointments.filter(a => a.status?.toLowerCase() === 'pending').sort(sortByTime);

 const currentPatient = currentPatientList.length > 0 ? currentPatientList[0] : null;
 
 const nextPatient = inQueuePatients.length > 0 ? inQueuePatients[0] : (pendingPatients.length > 0 ? pendingPatients[0] : null);
 
 const waitingCount = inQueuePatients.length + pendingPatients.length;

 const formatDisplay = (patient, isNext = false) => {
 if (!patient) return <span className="text-slate-300 text-2xl font-black">-</span>;
 const token = patient.token_number ? `Token ${String(patient.token_number).padStart(2, '0')}` : 'N/A';
 const name = patient.patient_name || patient.user_name || 'Unknown';
 return (
 <div className="flex flex-col items-center justify-center gap-1.5 mt-1">
 <span className={`text-xl font-black tracking-tight ${isNext ? 'text-blue-600' : 'text-emerald-600'}`}>{token}</span>
 <span className="text-[12px] font-bold text-slate-500 dark:text-gray-400 bg-slate-50 dark:bg-gray-900 px-3 py-1 rounded-full border border-slate-200 dark:border-gray-600 shadow-sm flex items-center gap-1.5">
 <User size={12} className={isNext ? "text-blue-500" : "text-emerald-500"} />
 <span className="truncate max-w-[140px]">{name}</span>
 </span>
 </div>
 );
 };

 return (
 <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-slate-100 dark:border-gray-700 mb-8 flex flex-col sm:flex-row items-center justify-between overflow-hidden">
 <div className="flex-1 w-full py-5 px-6 text-center border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-gray-700 hover:bg-slate-50 dark:bg-gray-900 transition-colors">
 <p className="text-slate-500 dark:text-gray-400 text-[13px] font-bold uppercase tracking-wider mb-2">Current Patient</p>
 <div>{formatDisplay(currentPatient, false)}</div>
 </div>
 <div className="flex-1 w-full py-5 px-6 text-center border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-gray-700 hover:bg-slate-50 dark:bg-gray-900 transition-colors">
 <p className="text-slate-500 dark:text-gray-400 text-[13px] font-bold uppercase tracking-wider mb-2">Next</p>
 <div>{formatDisplay(nextPatient, true)}</div>
 </div>
 <div className="flex-1 w-full py-5 px-6 text-center hover:bg-slate-50 dark:bg-gray-900 transition-colors flex flex-col justify-center">
 <p className="text-slate-500 dark:text-gray-400 text-[13px] font-bold uppercase tracking-wider mb-1">Waiting</p>
 <p className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{waitingCount}</p>
 </div>
 </div>
 );
 })()}

 <ReceptionistKanbanBoard allAppointments={allAppointments} doctor={doctors.find(d => String(d.doctor_id) === String(selectedDoctorId))} />

 </div>
 )}
 </div>
 );
};

export default LiveQueue;
