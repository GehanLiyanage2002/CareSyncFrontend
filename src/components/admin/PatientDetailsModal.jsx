import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { X, Calendar, Activity, CheckCircle, XCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const PatientDetailsModal = ({ token, patient, onClose }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
    
    // Set up real-time listener for appointments
    const socket = io('http://127.0.0.1:5000', { reconnection: true });
    
    socket.on('appointmentStatusChanged', () => {
      fetchAppointments();
    });
    
    socket.on('slotBooked', () => {
      fetchAppointments();
    });

    return () => {
      socket.disconnect();
    };
  }, [patient.id]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://127.0.0.1:5000/api/admin/patients/${patient.id}/appointments`, {
        headers: { Authorization: token }
      });
      setAppointments(res.data.appointments);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load patient appointments');
    } finally {
      setLoading(false);
    }
  };

  const totalAppointments = appointments.length;
  const cancelledAppointments = appointments.filter(a => a.status === 'Cancelled').length;
  const completedAppointments = appointments.filter(a => a.status === 'Completed').length;
  
  // Get unique doctors
  const uniqueDoctors = [...new Set(appointments.map(a => a.doctor_name))];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-white/20">
        
        {/* Header */}
        <div className="p-6 sm:p-8 bg-gradient-to-br from-indigo-50 to-white border-b border-indigo-100 flex items-start justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative z-10 flex gap-5 items-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-200">
              {patient.full_name ? patient.full_name.substring(0, 2).toUpperCase() : 'US'}
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">{patient.full_name}</h2>
              <div className="flex items-center gap-3 mt-1.5 text-sm text-slate-500 font-medium">
                <span>{patient.email?.includes('@caresync.local') ? 'No email provided' : patient.email}</span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span>{patient.mobile_number || 'No Mobile'}</span>
                {patient.blood_group && patient.blood_group !== 'N/A' && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-full text-xs">
                      {patient.blood_group}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="relative z-10 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-slate-50/50">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48">
              <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
              <p className="text-slate-500 font-medium">Loading details...</p>
            </div>
          ) : (
            <div className="space-y-8">
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-2">
                    <Calendar size={20} />
                  </div>
                  <span className="text-2xl font-black text-slate-800">{totalAppointments}</span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Total Bookings</span>
                </div>
                
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mb-2">
                    <CheckCircle size={20} />
                  </div>
                  <span className="text-2xl font-black text-slate-800">{completedAppointments}</span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Completed</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
                  <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 mb-2">
                    <XCircle size={20} />
                  </div>
                  <span className="text-2xl font-black text-slate-800">{cancelledAppointments}</span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Cancelled</span>
                </div>
                
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
                  <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 mb-2">
                    <Activity size={20} />
                  </div>
                  <span className="text-2xl font-black text-slate-800">{uniqueDoctors.length}</span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Doctors Seen</span>
                </div>
              </div>

              {/* Doctors List */}
              {uniqueDoctors.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                    Consulted Doctors
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {uniqueDoctors.map((doc, idx) => (
                      <span key={idx} className="px-4 py-2 bg-white border border-indigo-100 rounded-xl text-sm font-bold text-indigo-900 shadow-sm">
                        Dr. {doc}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Appointments List */}
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  Appointment History
                </h3>
                
                {appointments.length > 0 ? (
                  <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                    <div className="divide-y divide-slate-50">
                      {appointments.map(appt => (
                        <div key={appt.id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="mt-1">
                              {appt.status === 'Completed' ? (
                                <CheckCircle size={18} className="text-emerald-500" />
                              ) : appt.status === 'Cancelled' ? (
                                <XCircle size={18} className="text-rose-500" />
                              ) : (
                                <Clock size={18} className="text-amber-500" />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800">Dr. {appt.doctor_name}</p>
                              <p className="text-xs font-medium text-slate-500 mt-0.5">{appt.doctor_specialization}</p>
                              {appt.reason && (
                                <p className="text-sm text-slate-600 mt-2 bg-slate-100 px-3 py-1.5 rounded-lg inline-block">
                                  {appt.reason}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col sm:items-end text-left sm:text-right bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl sm:rounded-none">
                            <span className="text-sm font-bold text-indigo-900">
                              {new Date(appt.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                            </span>
                            <span className="text-xs font-bold text-slate-500 mt-1">
                              {appt.time.substring(0, 5)}
                            </span>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md mt-2 inline-block ${
                              appt.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                              appt.status === 'Cancelled' ? 'bg-rose-100 text-rose-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {appt.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center shadow-sm">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Calendar className="text-slate-300" size={24} />
                    </div>
                    <h4 className="text-slate-700 font-bold mb-1">No Appointments Found</h4>
                    <p className="text-slate-500 text-sm">This patient hasn't booked any appointments yet.</p>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDetailsModal;
