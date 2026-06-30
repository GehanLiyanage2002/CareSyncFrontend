import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, CreditCard, X, Hash, Check, Receipt, CheckCircle, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';

const socket = io(`${import.meta.env.VITE_API_URL}`);

const ReceptionistKanbanBoard = ({ allAppointments = [], doctor }) => {
 const { user } = useSelector((state) => state.auth);
 
 const [data, setData] = useState({
 tasks: {},
 columns: {
 'pending': { id: 'pending', title: 'Pending', taskIds: [] },
 'in progress': { id: 'in progress', title: 'In Progress', taskIds: [] },
 'completed': { id: 'completed', title: 'Completed', taskIds: [] },
 'cancelled': { id: 'cancelled', title: 'Cancelled', taskIds: [] },
 },
 columnOrder: ['pending', 'in progress', 'completed', 'cancelled'],
 });
 
 const [selectedTask, setSelectedTask] = useState(null);
 const [billingTask, setBillingTask] = useState(null);

 useEffect(() => {
 if (!allAppointments || allAppointments.length === 0) {
 setData(prev => ({
 ...prev,
 tasks: {},
 columns: {
 'pending': { ...prev.columns['pending'], taskIds: [] },
 'in progress': { ...prev.columns['in progress'], taskIds: [] },
 'completed': { ...prev.columns['completed'], taskIds: [] },
 'cancelled': { ...prev.columns['cancelled'], taskIds: [] },
 }
 }));
 return;
 }

 const newTasks = {};
 const cols = {
 'pending': [],
 'in progress': [],
 'completed': [],
 'cancelled': []
 };

 allAppointments.forEach(apt => {
 newTasks[apt.id] = {
 id: apt.id,
 tokenNumber: apt.token_number,
 patientName: apt.user_name || apt.patient_name || 'Unknown Patient',
 patient_id: apt.patient_id,
 date: new Date(apt.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
 time: apt.start_time.substring(0, 5),
 type: apt.is_telemedicine ? 'Telemedicine' : 'In-person',
 token: apt.token_number,
 age: apt.patient_age,
 gender: apt.patient_gender,
 contact: apt.mobile_number || apt.user_phone,
 status: apt.status,
 paymentMethod: apt.payment_method,
 is_rescheduled: apt.is_rescheduled,
 consultation_fee: apt.consultation_fee,
 raw_date: apt.appointment_date,
 raw_time: apt.start_time
 };

 // Map IN_QUEUE and WITH_DOCTOR to confirmed for the board since the doctor's board doesn't have these columns
 let status = apt.status?.toLowerCase() || 'pending';
 if (status === 'in_queue' || status === 'with_doctor') {
 status = 'in progress';
 }

 if (cols[status]) {
 cols[status].push(apt.id);
 }
 });

 const sortTaskIdsChronologically = (taskIdsToUpdate, currentTasks) => {
 return [...taskIdsToUpdate].sort((aId, bId) => {
 const a = currentTasks[aId];
 const b = currentTasks[bId];
 
 const dateA = new Date(a.raw_date).getTime();
 const dateB = new Date(b.raw_date).getTime();
 
 if (!isNaN(dateA) && !isNaN(dateB) && dateA !== dateB) {
 return dateA - dateB;
 }
 
 const timeA = a.raw_time || a.time || "";
 const timeB = b.raw_time || b.time || "";
 
 return timeA.localeCompare(timeB);
 });
 };

 setData(prev => ({
 ...prev,
 tasks: newTasks,
 columns: {
 'pending': { ...prev.columns['pending'], taskIds: sortTaskIdsChronologically(cols['pending'], newTasks) },
 'in progress': { ...prev.columns['in progress'], taskIds: sortTaskIdsChronologically(cols['in progress'], newTasks) },
 'completed': { ...prev.columns['completed'], taskIds: sortTaskIdsChronologically(cols['completed'], newTasks) },
 'cancelled': { ...prev.columns['cancelled'], taskIds: sortTaskIdsChronologically(cols['cancelled'], newTasks) },
 }
 }));

 }, [allAppointments]);

 // Derived stats
 const totalAppointments = Object.keys(data.tasks).length;
 const completedCount = data.columns['completed'].taskIds.length;
 const cancelledCount = data.columns['cancelled'].taskIds.length;

 return (
 <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
 
 {/* Kanban Board Columns (Read-Only) */}
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 flex-1 pb-4 items-start">
 {data.columnOrder.map((columnId) => {
 const column = data.columns[columnId];
 const tasks = column.taskIds.map((taskId) => data.tasks[taskId]);

 return (
 <div key={column.id} className="flex flex-col bg-slate-50/50 /50 rounded-3xl border border-slate-100 overflow-hidden shadow-sm h-full">
 <div className={`p-5 border-b border-slate-100 flex justify-between items-center
 ${column.id === 'pending' ? 'bg-amber-50/80 /20' : 
 column.id === 'in progress' ? 'bg-blue-50/80 /20' : 
 column.id === 'completed' ? 'bg-emerald-50/80 /20' : 
 'bg-rose-50/80 /20'}
 `}>
 <h3 className="font-extrabold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-widest">
 <span className={`w-3 h-3 rounded-full shadow-sm ${
 column.id === 'pending' ? 'bg-amber-500' : 
 column.id === 'in progress' ? 'bg-blue-500' : 
 column.id === 'completed' ? 'bg-emerald-500' : 
 'bg-rose-500'
 }`}></span>
 {column.title}
 </h3>
 <span className="bg-white text-slate-700 text-xs font-black px-3 py-1.5 rounded-full shadow-sm border border-slate-100 ">
 {tasks.length}
 </span>
 </div>

 <div className="flex-1 p-5 space-y-4 min-h-[500px]">
 {tasks.map((task) => (
 <div
 key={task.id}
 onClick={() => setSelectedTask(task)}
 className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm cursor-pointer hover:shadow-md hover:border-blue-200 :border-blue-600 transition-all"
 >
 <div className="flex justify-between items-start mb-4">
 <div>
 <span className="inline-flex items-center gap-1 px-2.5 py-1 mb-3 text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 rounded-lg">
 <Hash size={10} />
 {task.tokenNumber || 'NO-TOKEN'}
 </span>
 {task.status === 'IN_QUEUE' && (
 <span className="inline-flex items-center gap-1 px-2.5 py-1 ml-2 mb-3 text-[10px] font-black uppercase tracking-widest bg-blue-100 text-blue-600 rounded-lg shadow-sm">
 Waiting
 </span>
 )}
 {task.is_rescheduled && (
 <span className="inline-flex items-center gap-1 px-2.5 py-1 ml-2 mb-3 text-[10px] font-black uppercase tracking-widest bg-amber-100 /30 text-amber-600 rounded-lg border border-amber-200 /50 shadow-sm">
 🔄 Rescheduled
 </span>
 )}
 <h4 className="font-extrabold text-slate-800 leading-tight text-lg">{task.patientName}</h4>
 </div>
 {column.id === 'completed' && (
 <button 
 onClick={(e) => {
 e.stopPropagation();
 setBillingTask(task);
 }}
 className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 /30 text-emerald-600 rounded-xl hover:bg-emerald-100 :bg-emerald-800/50 transition-all border border-emerald-100 /30 shadow-sm hover:scale-105 active:scale-95"
 title="Generate Bill"
 >
 <Receipt size={16} strokeWidth={2.5} />
 <span className="text-xs font-black uppercase tracking-wider">Billing</span>
 </button>
 )}
 </div>
 <div className="flex items-center gap-3 text-xs font-bold mt-2">
 <span className="flex items-center gap-1.5 text-blue-700 bg-blue-50 /30 px-2.5 py-1.5 rounded-lg border border-blue-100 ">
 <Clock size={12} />
 {task.time?.substring(0, 5) || task.time}
 </span>
 <span className="flex items-center gap-1.5 text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 ">
 <Calendar size={12} />
 {new Date(task.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
 </span>
 </div>
 </div>
 ))}
 </div>
 </div>
 );
 })}
 </div>

 {/* Patient Details Modal */}
 {selectedTask && (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedTask(null)}>
 <div 
 className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200"
 onClick={(e) => e.stopPropagation()}
 >
 <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 ">
 <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
 <User className="text-blue-600" /> Patient Info
 </h3>
 <button 
 onClick={() => setSelectedTask(null)}
 className="p-2 text-slate-400 hover:text-slate-800 :text-white rounded-full hover:bg-white :bg-gray-700 shadow-sm transition-all"
 >
 <X size={20} />
 </button>
 </div>
 <div className="p-8 space-y-6">
 <div className="flex items-center gap-6 border-b border-slate-100 pb-6">
 <div className="h-20 w-20 rounded-[1.5rem] bg-blue-100 /30 flex items-center justify-center text-blue-600 text-3xl font-black shadow-inner overflow-hidden border border-blue-200">
 <img 
 src={`http://127.0.0.1:5000/api/users/profile-image/${selectedTask.patient_id}`}
 alt={selectedTask.patientName}
 className="w-full h-full object-cover"
 onError={(e) => {
 e.target.onerror = null;
 e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedTask.patientName || 'Patient')}&background=0D8ABC&color=fff&size=128`;
 }}
 />
 </div>
 <div>
 <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-2 bg-indigo-50 /30 text-indigo-700 text-[10px] uppercase tracking-widest font-black rounded-lg border border-indigo-100 ">
 <Hash size={12} />
 {selectedTask.tokenNumber || 'NO-TOKEN'}
 </div>
 <h4 className="text-2xl font-black text-slate-800 ">{selectedTask.patientName}</h4>
 </div>
 </div>
 
 <div className="grid grid-cols-2 gap-6 bg-slate-50 /50 p-6 rounded-3xl border border-slate-100 ">
 <div>
 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time & Date</label>
 <p className="text-slate-800 font-black flex items-center gap-1.5 mt-2">
 <Clock size={16} className="text-blue-500" /> {selectedTask.time?.substring(0, 5) || selectedTask.time}
 </p>
 <p className="text-slate-500 font-bold text-sm mt-1 ml-5">
 {new Date(selectedTask.date).toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric' })}
 </p>
 </div>
 <div>
 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Details</label>
 <p className="text-slate-800 font-black mt-2">{selectedTask.contact || 'Not Provided'}</p>
 </div>
 <div className="col-span-2 pt-4 border-t border-slate-200 ">
 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Method</label>
 <p className="text-slate-800 font-black flex items-center gap-1.5 mt-2">
 <CreditCard size={18} className={selectedTask.paymentMethod === 'Online' ? 'text-emerald-500' : 'text-amber-500'} /> 
 {selectedTask.paymentMethod || 'Cash'}
 </p>
 </div>
 </div>
 </div>
 </div>
 </div>
 )}
 {/* Billing Receipt Modal */}
 {billingTask && (
 <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setBillingTask(null)}>
 <style>{`
 @media print {
 body * { visibility: hidden !important; }
 #billing-receipt-modal, #billing-receipt-modal * { visibility: visible !important; }
 #billing-receipt-modal {
 position: absolute !important;
 left: 50% !important;
 top: 20px !important;
 width: 100% !important;
 max-width: 450px !important;
 margin: 0 !important;
 padding: 20px !important;
 box-shadow: none !important;
 border: none !important;
 background: white !important;
 transform: translateX(-50%) !important;
 }
 }
 `}</style>
 <div 
 id="billing-receipt-modal"
 className="bg-white rounded-[2rem] max-w-md w-full max-h-[95vh] overflow-y-auto shadow-2xl border border-gray-100 /80 animate-in zoom-in-95 duration-200 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
 onClick={(e) => e.stopPropagation()}
 >
 <div className="bg-gradient-to-r from-emerald-600 to-teal-500 p-5 text-center text-white relative print:bg-white print:text-black print:border-b print:border-gray-200 print:from-white print:to-white">
 <div className="w-12 h-12 bg-white /20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-3 border border-white/30 animate-bounce print:animate-none print:bg-gray-100 print:border-gray-300">
 <CheckCircle className="h-6 w-6 text-white print:text-emerald-600" />
 </div>
 <h4 className="text-xl font-black print:text-slate-800 ">Billing Receipt</h4>
 <p className="text-xs text-emerald-100 font-bold uppercase tracking-widest mt-1 print:text-slate-500 ">CareSync Consultation Bill</p>
 </div>

 <div className="p-6 space-y-4">
 <div className="bg-teal-50 /20 border border-teal-100 /60 rounded-2xl py-3 px-4 text-center shadow-sm print:shadow-none print:border-gray-200 print:bg-gray-50">
 <span className="block text-[10px] text-teal-600 font-black uppercase tracking-widest mb-1 print:text-gray-500">Queue Token</span>
 <span className="text-3xl font-black text-teal-800 tracking-wider font-mono print:text-black">{billingTask.tokenNumber || 'N/A'}</span>
 </div>

 <div className="border-2 border-dashed border-gray-100 p-5 rounded-3xl space-y-3 bg-gray-50/50 /20 print:border-gray-300 print:bg-white print:rounded-xl">
 {doctor && (
 <>
 <div className="flex justify-between items-center text-sm">
 <span className="text-gray-400 font-black uppercase text-[10px] tracking-widest">Doctor</span>
 <span className="text-gray-800 font-black text-base print:text-black">Dr. {doctor.name || doctor.doctor_name}</span>
 </div>
 <div className="flex justify-between items-center text-sm">
 <span className="text-gray-400 font-black uppercase text-[10px] tracking-widest">Specialization</span>
 <span className="text-gray-800 font-bold print:text-black">{doctor.specialization || 'General'}</span>
 </div>
 </>
 )}
 <div className="flex justify-between items-center text-sm">
 <span className="text-gray-400 font-black uppercase text-[10px] tracking-widest">Patient Name</span>
 <span className="text-gray-800 font-black text-base print:text-black">{billingTask.patientName}</span>
 </div>
 <div className="flex justify-between items-center text-sm">
 <span className="text-gray-400 font-black uppercase text-[10px] tracking-widest">Contact</span>
 <span className="text-gray-800 font-bold print:text-black">{billingTask.contact || 'N/A'}</span>
 </div>
 <div className="flex justify-between items-center text-sm">
 <span className="text-gray-400 font-black uppercase text-[10px] tracking-widest">Date & Time</span>
 <span className="text-gray-800 font-bold print:text-black">{billingTask.date} @ {billingTask.time}</span>
 </div>
 <div className="flex justify-between items-center text-sm">
 <span className="text-gray-400 font-black uppercase text-[10px] tracking-widest">Type</span>
 <span className="text-gray-800 font-bold print:text-black">{billingTask.type}</span>
 </div>
 <div className="flex justify-between items-center text-sm">
 <span className="text-gray-400 font-black uppercase text-[10px] tracking-widest">Payment</span>
 <span className="text-emerald-600 font-black print:text-black">
 {billingTask.paymentMethod === 'Cash' ? 'Pay Cash at Counter' : 'Online Paid'}
 </span>
 </div>
 <div className="border-t border-gray-200 pt-4 mt-2 flex justify-between items-center text-base">
 <span className="text-gray-500 font-black uppercase tracking-widest text-xs">Amount Due</span>
 <span className="text-2xl font-black text-slate-800 tracking-tight print:text-black">
 Rs. {billingTask.consultation_fee ? billingTask.consultation_fee.toLocaleString() : (doctor?.consultation_fee?.toLocaleString() || doctor?.consultationFee?.toLocaleString() || '3,000')}
 </span>
 </div>
 </div>

 <div className="flex gap-3 mt-6 print:hidden">
 <button
 type="button"
 onClick={() => window.print()}
 className="flex-1 border border-slate-200 hover:bg-slate-50 :bg-gray-800 text-slate-700 font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transition-all text-sm shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
 >
 <Printer className="h-5 w-5" />
 <span>Print Bill</span>
 </button>
 <button
 type="button"
 onClick={() => setBillingTask(null)}
 className="flex-1 bg-slate-900 hover:bg-slate-800 :bg-gray-100 text-white font-bold py-3 rounded-2xl transition-all text-sm shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
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

export default ReceptionistKanbanBoard;
