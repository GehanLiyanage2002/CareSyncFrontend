import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Header from '../components/Header';
import { Calendar, CheckCircle, Users, Clock, Check, Kanban } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import ScheduleManager from '../components/doctor/ScheduleManager';
import FeeManager from '../components/doctor/FeeManager';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

const DoctorDashboardHome = () => {
  const { user, token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [isAvailable, setIsAvailable] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch doctor profile to get availability status
        const profileRes = await axios.get('http://localhost:5000/api/users/doctor-profile', {
          headers: { Authorization: token }
        });
        if (profileRes.data.profile) {
          setIsAvailable(profileRes.data.profile.is_available);
        }

        // Fetch today's appointments
        const aptRes = await axios.get('http://localhost:5000/api/appointments/doctor/my-appointments', {
          headers: { Authorization: token }
        });
        
        if (aptRes.data.appointments) {
          // For now, we display all fetched appointments as "Today's" or we could filter by date
          setAppointments(aptRes.data.appointments);
        }
      } catch (error) {
        console.error("Error fetching dashboard data", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token, refreshTrigger]);

  useEffect(() => {
    const handleSlotBooked = (bookingData) => {
      if (bookingData.doctor_id === user?.id) {
        toast.success('New appointment booked! Updating dashboard...', { icon: '🔔' });
        setRefreshTrigger(prev => prev + 1);
      }
    };

    const handleStatusChanged = (data) => {
      if (data.doctor_id === user?.id) {
        setRefreshTrigger(prev => prev + 1);
      }
    };

    socket.on('slotBooked', handleSlotBooked);
    socket.on('appointmentStatusChanged', handleStatusChanged);

    return () => {
      socket.off('slotBooked', handleSlotBooked);
      socket.off('appointmentStatusChanged', handleStatusChanged);
    };
  }, [user]);

  const handleToggleAvailability = async () => {
    // Optimistic UI update
    const newStatus = !isAvailable;
    setIsAvailable(newStatus);
    
    try {
      await axios.put('http://localhost:5000/api/appointments/doctor/availability', {}, {
        headers: { Authorization: token }
      });
      
      if (newStatus) {
        toast.success('Availability Updated: Now accepting patients');
      } else {
        toast('Currently Unavailable', { icon: '⏸️' });
      }
    } catch (error) {
      // Revert on failure
      setIsAvailable(!newStatus);
      toast.error('Failed to update availability');
    }
  };

  const markCompleted = (id) => {
    // We would make an API call here. For now, update local state
    setAppointments(appointments.map(apt => 
      apt.id === id ? { ...apt, status: 'completed' } : apt
    ));
    toast.success('Appointment marked as completed');
  };

  // Calculate stats
  const pendingCount = appointments.filter(a => a.status === 'pending' || a.status === 'confirmed').length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-teal-100 flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-10">
        
        {/* Welcome Banner & Availability Toggle */}
        <div className="bg-gradient-to-br from-teal-600 to-teal-400 rounded-3xl p-8 md:p-10 shadow-lg shadow-teal-200 text-white mb-8 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3 tracking-tight">
              Welcome back, Dr. {user?.name || user?.full_name || 'Doctor'}! 🩺
            </h2>
            <p className="text-teal-50 text-lg md:text-xl max-w-2xl font-medium leading-relaxed">
              Here is your daily clinical overview. Stay on top of your schedule and manage your patients efficiently.
            </p>
          </div>
          
          {/* Availability Toggle */}
          <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="flex flex-col">
              <span className="font-bold text-lg">{isAvailable ? 'Available' : 'Unavailable'}</span>
              <span className="text-teal-50 text-sm">{isAvailable ? 'Accepting new patients' : 'Paused for now'}</span>
            </div>
            
            <button 
              onClick={handleToggleAvailability}
              className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${isAvailable ? 'bg-teal-800' : 'bg-slate-400'}`}
            >
              <div 
                className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${isAvailable ? 'translate-x-6' : 'translate-x-0'}`}
              ></div>
            </button>
          </div>

          {/* Decorative background shapes */}
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-white/10 rounded-full blur-3xl transition-transform duration-700"></div>
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-white/10 rounded-full blur-3xl transition-transform duration-700"></div>
        </div>

        {/* Summary Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Card 1: Pending Appointments */}
          <div 
            onClick={() => navigate('/doctor/kanban')}
            className="bg-white rounded-3xl p-7 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 hover:border-teal-100 transition-all duration-300 group cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-300"></div>
            <div className="flex items-center justify-between mb-5 relative z-10">
              <div className="p-3.5 bg-teal-100 text-teal-700 rounded-2xl group-hover:rotate-6 transition-transform duration-300">
                <Calendar className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1.5 rounded-full border border-teal-100 shadow-sm">Today</span>
            </div>
            <h3 className="text-slate-500 text-sm font-semibold mb-1 uppercase tracking-wider">Pending Appointments</h3>
            <p className="text-3xl font-extrabold text-slate-800">{loading ? '-' : pendingCount} Scheduled</p>
          </div>

          {/* Card 2: Completed Consultations */}
          <div 
            onClick={() => navigate('/doctor/history')}
            className="bg-white rounded-3xl p-7 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 hover:border-blue-100 transition-all duration-300 group cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-300"></div>
            <div className="flex items-center justify-between mb-5 relative z-10">
              <div className="p-3.5 bg-blue-100 text-blue-700 rounded-2xl group-hover:rotate-6 transition-transform duration-300">
                <CheckCircle className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 shadow-sm">This Week</span>
            </div>
            <h3 className="text-slate-500 text-sm font-semibold mb-1 uppercase tracking-wider">Completed Consultations</h3>
            <p className="text-3xl font-extrabold text-slate-800">{loading ? '-' : completedCount} Patients</p>
          </div>

          {/* Card 3: Total Patients */}
          <div className="bg-white rounded-3xl p-7 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 hover:border-purple-100 transition-all duration-300 group cursor-pointer relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-300"></div>
            <div className="flex items-center justify-between mb-5 relative z-10">
              <div className="p-3.5 bg-purple-100 text-purple-700 rounded-2xl group-hover:rotate-6 transition-transform duration-300">
                <Users className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-full border border-purple-100 shadow-sm">All Time</span>
            </div>
            <h3 className="text-slate-500 text-sm font-semibold mb-1 uppercase tracking-wider">Total Unique Patients</h3>
            <p className="text-3xl font-extrabold text-slate-800">148</p>
          </div>
        </div>

        {/* Today's Appointments Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-8">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-teal-600" />
              Today's Appointments
            </h3>
            <button 
              onClick={() => navigate('/doctor/kanban')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95"
            >
              <Kanban className="w-4 h-4" />
              Appointment Board
            </button>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-10 text-center text-slate-500 font-medium animate-pulse">Loading appointments...</div>
            ) : appointments.length === 0 ? (
              <div className="p-10 text-center text-slate-500 font-medium">No appointments scheduled for today. Take a break! ☕</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold">Token Number</th>
                    <th className="px-6 py-4 font-semibold">Patient Name</th>
                    <th className="px-6 py-4 font-semibold">Age/Gender</th>
                    <th className="px-6 py-4 font-semibold">Time</th>
                    <th className="px-6 py-4 font-semibold">Contact</th>
                    <th className="px-6 py-4 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {appointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-teal-700">
                        {apt.token_number || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-800">
                        {apt.patient_name || 'Unknown Patient'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                        {apt.patient_age ? `${apt.patient_age} Yrs` : '-'} {apt.patient_gender ? `/ ${apt.patient_gender}` : ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium">
                        {apt.start_time ? apt.start_time.substring(0, 5) : (apt.appointment_time || '-')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                        {apt.patient_contact || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                          apt.status === 'completed' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : apt.status === 'confirmed'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : apt.status === 'cancelled'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {apt.status ? apt.status.charAt(0).toUpperCase() + apt.status.slice(1) : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Schedule Manager */}
        <ScheduleManager />
        
        {/* Fee Manager */}
        <FeeManager />
        
      </main>
    </div>
  );
};

export default DoctorDashboardHome;
