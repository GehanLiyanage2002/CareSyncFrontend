import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Calendar, Clock, User, CreditCard, X, Hash, Check, FileText, History } from 'lucide-react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import CreateMedicalReport from './CreateMedicalReport';
import PatientPastRecordsModal from './PatientPastRecordsModal';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

const DoctorKanbanBoard = () => {
  const { token, user } = useSelector((state) => state.auth);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [data, setData] = useState({
    tasks: {},
    columns: {
      'pending': { id: 'pending', title: 'Pending', taskIds: [] },
      'confirmed': { id: 'confirmed', title: 'Confirmed', taskIds: [] },
      'completed': { id: 'completed', title: 'Completed', taskIds: [] },
      'cancelled': { id: 'cancelled', title: 'Cancelled', taskIds: [] },
    },
    columnOrder: ['pending', 'confirmed', 'completed', 'cancelled'],
  });
  const [selectedTask, setSelectedTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [consultationFee, setConsultationFee] = useState(0);

  // State for Medical Report Modal
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedAppointmentForReport, setSelectedAppointmentForReport] = useState(null);

  // State for Past Records Modal
  const [isPastRecordsModalOpen, setIsPastRecordsModalOpen] = useState(false);
  const [selectedPatientForHistory, setSelectedPatientForHistory] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both profile and appointments
        const [profileRes, appointmentsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/doctor/profile', { headers: { Authorization: token } }),
          axios.get('http://localhost:5000/api/doctor/appointments', { headers: { Authorization: token } })
        ]);

        if (profileRes.data.success) {
          setConsultationFee(profileRes.data.profile?.consultation_fee || 0);
        }

        if (appointmentsRes.data.success) {
          const appointments = appointmentsRes.data.appointments;
          
          const newTasks = {};
          const cols = {
            'pending': [],
            'confirmed': [],
            'completed': [],
            'cancelled': []
          };

          appointments.forEach(apt => {
            newTasks[apt.id] = {
              id: apt.id,
              tokenNumber: apt.token_number,
              patientName: apt.patient_name,
              patient_id: apt.patient_id,
              time: apt.start_time,
              date: apt.appointment_date,
              age: apt.patient_age,
              gender: apt.patient_gender,
              contact: apt.patient_contact,
              status: apt.status,
              paymentMethod: apt.payment_method
            };

            const status = apt.status?.toLowerCase() || 'pending';
            if (cols[status]) {
              cols[status].push(apt.id);
            }
          });

          setData(prev => ({
            ...prev,
            tasks: newTasks,
            columns: {
              'pending': { ...prev.columns['pending'], taskIds: cols['pending'] },
              'confirmed': { ...prev.columns['confirmed'], taskIds: cols['confirmed'] },
              'completed': { ...prev.columns['completed'], taskIds: cols['completed'] },
              'cancelled': { ...prev.columns['cancelled'], taskIds: cols['cancelled'] },
            }
          }));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to fetch board data');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (token) fetchData();
  }, [token, refreshTrigger]);

    useEffect(() => {
      const handleSlotBooked = (bookingData) => {
        if (bookingData.doctor_id === user?.id) {
          toast.success('New appointment booked! Updating board...', { icon: '📅' });
          setRefreshTrigger(prev => prev + 1);
        }
      };
  
      const handleStatusChanged = (data) => {
        if (data.doctor_id === user?.id) {
          setRefreshTrigger(prev => prev + 1);
        }
      };

      const handleRescheduled = (data) => {
        if (data.doctor_id === user?.id) {
          toast.success('Appointment rescheduled! Updating board...', { icon: '🔄' });
          setRefreshTrigger(prev => prev + 1);
        }
      };
  
      socket.on('slotBooked', handleSlotBooked);
      socket.on('appointmentStatusChanged', handleStatusChanged);
      socket.on('appointmentRescheduled', handleRescheduled);
  
      return () => {
        socket.off('slotBooked', handleSlotBooked);
        socket.off('appointmentStatusChanged', handleStatusChanged);
        socket.off('appointmentRescheduled', handleRescheduled);
      };
    }, [user]);

  // Derived stats
  const totalAppointments = Object.keys(data.tasks).length;
  const completedCount = data.columns['completed'].taskIds.length;
  const cancelledCount = data.columns['cancelled'].taskIds.length;
  const totalEarnings = completedCount * consultationFee;

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const startColumn = data.columns[source.droppableId];
    const finishColumn = data.columns[destination.droppableId];

    // Optimistic UI update
    if (startColumn === finishColumn) {
      const newTaskIds = Array.from(startColumn.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = { ...startColumn, taskIds: newTaskIds };
      setData({ ...data, columns: { ...data.columns, [newColumn.id]: newColumn } });
      return;
    }

    const startTaskIds = Array.from(startColumn.taskIds);
    startTaskIds.splice(source.index, 1);
    const newStart = { ...startColumn, taskIds: startTaskIds };

    const finishTaskIds = Array.from(finishColumn.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId);
    const newFinish = { ...finishColumn, taskIds: finishTaskIds };

    setData(prev => ({
      ...prev,
      columns: { ...prev.columns, [newStart.id]: newStart, [newFinish.id]: newFinish },
      tasks: {
        ...prev.tasks,
        [draggableId]: { ...prev.tasks[draggableId], status: newFinish.id }
      }
    }));

    // Make API call to update status
    try {
      const newStatus = finishColumn.id; // 'pending', 'confirmed', 'completed', 'cancelled'
      await axios.put(`http://localhost:5000/api/doctor/appointments/${draggableId}/status`, {
        status: newStatus
      }, {
        headers: { Authorization: token }
      });
      toast.success(`Status updated to ${finishColumn.title}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  if (isLoading) {
    return <div className="h-full flex items-center justify-center text-gray-500 animate-pulse text-lg font-semibold">Loading your Kanban Board...</div>;
  }

  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Total Appointments */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-emerald-100 dark:border-gray-700">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest mb-1">Total Appointments</p>
            <h4 className="text-3xl font-extrabold text-slate-800 dark:text-white">{totalAppointments}</h4>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <Calendar size={20} />
          </div>
        </div>

        {/* Total Earnings */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-amber-100 dark:border-gray-700">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest mb-1">Total Earnings</p>
            <h4 className="text-3xl font-extrabold text-slate-800 dark:text-white">Rs. {totalEarnings}</h4>
          </div>
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
            <span className="font-bold text-xl">Rs</span>
          </div>
        </div>

        {/* Completed */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-blue-100 dark:border-gray-700">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest mb-1">Completed</p>
            <h4 className="text-3xl font-extrabold text-slate-800 dark:text-white">{completedCount}</h4>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
            <Check size={20} />
          </div>
        </div>

        {/* Cancelled */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-rose-100 dark:border-gray-700">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest mb-1">Cancelled</p>
            <h4 className="text-3xl font-extrabold text-slate-800 dark:text-white">{cancelledCount}</h4>
          </div>
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
            <X size={20} />
          </div>
        </div>
      </div>

      

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 flex-1 pb-4 items-start">
          {data.columnOrder.map((columnId) => {
            const column = data.columns[columnId];
            const tasks = column.taskIds.map((taskId) => data.tasks[taskId]);

            return (
              <div key={column.id} className="flex flex-col bg-slate-50/50 dark:bg-gray-900/50 rounded-3xl border border-slate-100 dark:border-gray-700 overflow-hidden shadow-sm h-full">
                <div className={`p-5 border-b border-slate-100 dark:border-gray-700 flex justify-between items-center
                  ${column.id === 'pending' ? 'bg-amber-50/80 dark:bg-amber-900/20' : 
                    column.id === 'confirmed' ? 'bg-blue-50/80 dark:bg-blue-900/20' : 
                    column.id === 'completed' ? 'bg-emerald-50/80 dark:bg-emerald-900/20' : 
                    'bg-rose-50/80 dark:bg-rose-900/20'}
                `}>
                  <h3 className="font-extrabold text-slate-800 dark:text-white flex items-center gap-2 text-sm uppercase tracking-widest">
                    <span className={`w-3 h-3 rounded-full shadow-sm ${
                      column.id === 'pending' ? 'bg-amber-500' : 
                      column.id === 'confirmed' ? 'bg-blue-500' : 
                      column.id === 'completed' ? 'bg-emerald-500' : 
                      'bg-rose-500'
                    }`}></span>
                    {column.title}
                  </h3>
                  <span className="bg-white dark:bg-gray-800 text-slate-700 dark:text-gray-200 text-xs font-black px-3 py-1.5 rounded-full shadow-sm border border-slate-100 dark:border-gray-700">
                    {tasks.length}
                  </span>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 p-5 space-y-4 transition-colors min-h-[500px] ${snapshot.isDraggingOver ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                    >
                      {tasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => setSelectedTask(task)}
                              className={`bg-white dark:bg-gray-800 p-5 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md hover:border-blue-200 dark:hover:border-blue-600 transition-all ${
                                snapshot.isDragging ? 'shadow-xl ring-2 ring-blue-500 scale-[1.02] rotate-2 z-50' : ''
                              }`}
                            >
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 mb-3 text-[10px] font-black uppercase tracking-widest bg-slate-100 dark:bg-gray-700 text-slate-500 dark:text-gray-300 rounded-lg">
                                    <Hash size={10} />
                                    {task.tokenNumber || 'NO-TOKEN'}
                                  </span>
                                  <h4 className="font-extrabold text-slate-800 dark:text-white leading-tight text-lg">{task.patientName}</h4>
                                </div>
                                {task.status === 'completed' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation(); // prevent opening the main details modal
                                      setSelectedAppointmentForReport(task);
                                      setIsReportModalOpen(true);
                                    }}
                                    className="px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white rounded-lg text-xs font-black flex items-center gap-1 transition-all border border-emerald-200 dark:border-emerald-800/50 shadow-sm"
                                  >
                                    <FileText size={12} /> Report
                                  </button>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-xs font-bold mt-2">
                                <span className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1.5 rounded-lg border border-blue-100 dark:border-transparent">
                                  <Clock size={12} />
                                  {task.time?.substring(0, 5) || task.time}
                                </span>
                                <span className="flex items-center gap-1.5 text-slate-600 dark:text-gray-400 bg-slate-50 dark:bg-gray-800 px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-transparent">
                                  <Calendar size={12} />
                                  {new Date(task.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </span>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Patient Details Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedTask(null)}>
          <div 
            className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-100 dark:border-gray-700 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800">
              <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                <User className="text-blue-600" /> Patient Info
              </h3>
              <button 
                onClick={() => setSelectedTask(null)}
                className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-full hover:bg-white dark:hover:bg-gray-700 shadow-sm transition-all"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-6 border-b border-slate-100 dark:border-gray-700 pb-6">
                <div className="h-20 w-20 rounded-[1.5rem] bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-3xl font-black shadow-inner">
                  {selectedTask.patientName?.charAt(0) || '?'}
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-[10px] uppercase tracking-widest font-black rounded-lg border border-indigo-100 dark:border-indigo-800">
                    <Hash size={12} />
                    {selectedTask.tokenNumber || 'NO-TOKEN'}
                  </div>
                  <h4 className="text-2xl font-black text-slate-800 dark:text-white">{selectedTask.patientName}</h4>
                  <p className="text-sm font-bold text-slate-500 dark:text-gray-400 mt-1">{selectedTask.age || '-'} Yrs • {selectedTask.gender || '-'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6 bg-slate-50 dark:bg-gray-900/50 p-6 rounded-3xl border border-slate-100 dark:border-gray-700">
                <div>
                  <label className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">Time & Date</label>
                  <p className="text-slate-800 dark:text-white font-black flex items-center gap-1.5 mt-2">
                    <Clock size={16} className="text-blue-500" /> {selectedTask.time?.substring(0, 5) || selectedTask.time}
                  </p>
                  <p className="text-slate-500 dark:text-gray-400 font-bold text-sm mt-1 ml-5">
                    {new Date(selectedTask.date).toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">Contact Details</label>
                  <p className="text-slate-800 dark:text-white font-black mt-2">{selectedTask.contact || 'Not Provided'}</p>
                </div>
                <div className="col-span-2 pt-4 border-t border-slate-200 dark:border-gray-700">
                  <label className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">Payment Method</label>
                  <p className="text-slate-800 dark:text-white font-black flex items-center gap-1.5 mt-2">
                    <CreditCard size={18} className={selectedTask.paymentMethod === 'Online' ? 'text-emerald-500' : 'text-amber-500'} /> 
                    {selectedTask.paymentMethod || 'Cash'}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-5 bg-slate-50 dark:bg-gray-900 border-t border-slate-100 dark:border-gray-700 flex justify-between gap-3">
              <button 
                onClick={() => {
                  setSelectedPatientForHistory({
                    patient_id: selectedTask.patient_id,
                    patientName: selectedTask.patientName
                  });
                  setIsPastRecordsModalOpen(true);
                }}
                className="px-6 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 dark:text-blue-400 font-bold rounded-xl transition-colors border border-blue-200 dark:border-blue-800 flex items-center gap-2"
              >
                <History size={18} />
                View Past Records
              </button>

              {selectedTask.status === 'completed' && (
                <button 
                  onClick={() => {
                    setSelectedAppointmentForReport(selectedTask);
                    setIsReportModalOpen(true);
                    setSelectedTask(null);
                  }}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-2"
                >
                  <FileText size={18} />
                  Write Medical Report
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <CreateMedicalReport 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
        appointment={selectedAppointmentForReport} 
      />

      <PatientPastRecordsModal
        isOpen={isPastRecordsModalOpen}
        onClose={() => setIsPastRecordsModalOpen(false)}
        patient={selectedPatientForHistory}
      />
    </div>
  );
};

export default DoctorKanbanBoard;
