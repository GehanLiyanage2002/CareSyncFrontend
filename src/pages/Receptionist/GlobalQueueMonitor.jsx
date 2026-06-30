import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Users, User, Activity, Maximize, Minimize } from 'lucide-react';
import { io } from 'socket.io-client';

const socket = io('http://127.0.0.1:5000');

const GlobalQueueMonitor = () => {
 const { token } = useSelector((state) => state.auth);
 const [queues, setQueues] = useState([]);
 const [loading, setLoading] = useState(true);
 const [isFullscreen, setIsFullscreen] = useState(false);
 const containerRef = useRef(null);
 const [refreshTrigger, setRefreshTrigger] = useState(0);

 const fetchGlobalQueues = async () => {
 try {
 setLoading(true);
 const res = await axios.get('http://127.0.0.1:5000/api/receptionist/all-queues', {
 headers: { Authorization: token }
 });
 setQueues(res.data?.data || []);
 } catch (error) {
 console.error('Error fetching global queues:', error);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
    if (token) fetchGlobalQueues();
  }, [token, refreshTrigger]);

  useEffect(() => {
    const handleUpdate = () => {
      setRefreshTrigger(prev => prev + 1);
    };

    socket.on('slotBooked', handleUpdate);
    socket.on('appointmentStatusChanged', handleUpdate);
    socket.on('appointmentRescheduled', handleUpdate);

    const interval = setInterval(handleUpdate, 60000);

 const onFullscreenChange = () => {
 setIsFullscreen(!!document.fullscreenElement);
 };
 document.addEventListener('fullscreenchange', onFullscreenChange);

 return () => {
 socket.off('slotBooked', handleUpdate);
 socket.off('appointmentStatusChanged', handleUpdate);
 socket.off('appointmentRescheduled', handleUpdate);
 clearInterval(interval);
 document.removeEventListener('fullscreenchange', onFullscreenChange);
 };
 }, [token]);

 const toggleFullscreen = () => {
 if (!document.fullscreenElement) {
 if (containerRef.current) {
 containerRef.current.requestFullscreen().catch(err => {
 console.error(`Error attempting to enable fullscreen: ${err.message}`);
 });
 }
 } else {
 document.exitFullscreen();
 }
 };

 const sortByTime = (a, b) => {
 const dateA = new Date(a.appointment_date).getTime();
 const dateB = new Date(b.appointment_date).getTime();
 if (!isNaN(dateA) && !isNaN(dateB) && dateA !== dateB) return dateA - dateB;
 const timeA = a.start_time || "";
 const timeB = b.start_time || "";
 return timeA.localeCompare(timeB);
 };

 const formatDisplay = (patient, isNext = false) => {
 if (!patient) return <span className="text-slate-300 text-xl font-black">-</span>;
 const tokenStr = patient.token_number ? `Token ${String(patient.token_number).padStart(2, '0')}` : 'N/A';
 const name = patient.patient_name || patient.user_name || 'Unknown';
 return (
 <div className="flex flex-col items-center justify-center gap-1.5 mt-1">
 <span className={`text-xl font-black tracking-tight ${isNext ? 'text-blue-600' : 'text-emerald-600'}`}>
 {tokenStr}
 </span>
 <span className="text-[12px] font-bold text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-200 shadow-sm flex items-center gap-1.5">
 <User size={12} className={isNext ? "text-blue-500" : "text-emerald-500"} /> 
 <span className="truncate max-w-[120px]">{name}</span>
 </span>
 </div>
 );
 };

 if (loading && queues.length === 0) {
 return (
 <div className="flex flex-col items-center justify-center h-64">
 <Activity className="animate-spin text-blue-500 mb-4" size={32} />
 <p className="text-slate-500 font-bold">Loading Queue Monitor...</p>
 </div>
 );
 }

 if (queues.length === 0) {
 return (
 <div className="bg-white /50 backdrop-blur-sm rounded-3xl border border-dashed border-slate-200 p-12 text-center shadow-sm">
 <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
 <Users size={32} />
 </div>
 <h3 className="text-xl font-bold text-slate-600 mb-2">No Active Queues</h3>
 <p className="text-slate-400 font-medium">There are no doctors with active or upcoming appointments today.</p>
 </div>
 );
 }

 return (
 <div 
 ref={containerRef}
 className={`space-y-4 animate-fadeIn ${isFullscreen ? 'bg-slate-50 p-8 min-h-screen overflow-y-auto' : 'pb-10'}`}
 >
 {/* Top action bar */}
 <div className="flex justify-end mb-2">
 <button 
 onClick={toggleFullscreen}
 className="bg-white border border-slate-200 p-2.5 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
 title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
 >
 {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
 </button>
 </div>

 {/* Grid of Doctor Queues */}
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
 {queues.map((docData) => {
 // Logic for Current, Next, Waiting
 const currentPatientList = docData.upcomingAppointments?.filter(a => a.status?.toLowerCase() === 'in progress') || [];
 
 const inQueuePatients = docData.activeQueue.filter(a => a.status?.toLowerCase() === 'in_queue').sort((a,b) => (parseInt(a.token_number)||0) - (parseInt(b.token_number)||0));
 const pendingPatients = (docData.pendingAppointments || []).sort(sortByTime);
 
 const currentPatient = currentPatientList.length > 0 ? currentPatientList[0] : null;
 
 const nextPatient = inQueuePatients.length > 0 ? inQueuePatients[0] : (pendingPatients.length > 0 ? pendingPatients[0] : null);
 
 const waitingCount = inQueuePatients.length + pendingPatients.length;

 return (
 <div key={docData.doctorId} className="bg-white rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100 overflow-hidden flex flex-col group">
 
 {/* Doctor Header */}
 <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 p-5 border-b border-blue-50/50 flex items-center gap-4 transition-colors group-hover:from-blue-100/50 group-hover:to-indigo-100/50">
 <div className="w-12 h-12 rounded-2xl bg-white border border-blue-100 flex items-center justify-center font-black text-blue-600 shadow-sm text-lg">
 {docData.doctorName ? docData.doctorName.charAt(0).toUpperCase() : <User />}
 </div>
 <div>
 <h3 className="text-lg font-bold text-slate-800 leading-tight">Dr. {docData.doctorName}</h3>
 </div>
 </div>

 {/* Status Display inside Card */}
 <div className="flex-1 flex flex-col">
 <div className="flex justify-around items-center p-6 bg-white ">
 <div className="text-center flex-1">
 <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mb-3">Current Patient</p>
 {formatDisplay(currentPatient, false)}
 </div>
 <div className="w-px h-16 bg-slate-100"></div>
 <div className="text-center flex-1">
 <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mb-3">Next Patient</p>
 {formatDisplay(nextPatient, true)}
 </div>
 </div>
 <div className="bg-slate-50 flex items-center justify-between px-8 py-5 border-t border-slate-100 ">
 <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Waiting in Queue</p>
 <div className="bg-white text-slate-800 font-black text-2xl w-12 h-12 flex items-center justify-center rounded-xl shadow-sm border border-slate-200 ">
 {waitingCount}
 </div>
 </div>
 </div>

 </div>
 );
 })}
 </div>
 </div>
 );
};

export default GlobalQueueMonitor;
