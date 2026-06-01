import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Header from '../components/Header';
import { Video, Calendar, Clock, X, ChevronUp, ChevronDown } from 'lucide-react';

const CalendarIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
  </svg>
);
const HeartIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
);
const ClipboardIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
  </svg>
);

const PatientDashboardHome = () => {
  const { user, token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [upcomingTelemedicine, setUpcomingTelemedicine] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [configuredDates, setConfiguredDates] = useState([]);
  const [slotPage, setSlotPage] = useState(1);
  const slotsPerPage = 8;

  const formatTimeAMPM = (timeStr) => {
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedH = h % 12 || 12;
    return `${formattedH.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  };

  useEffect(() => {
    if (isRescheduleModalOpen && selectedAppointment) {
      const fetchDates = async () => {
        try {
          const res = await axios.get(`http://localhost:5000/api/appointments/configured-dates/${selectedAppointment.doctor_id}`);
          if (res.data.success) {
            setConfiguredDates(res.data.dates.map(d => new Date(d).toDateString()));
          }
        } catch (error) {
          console.error('Error fetching configured dates:', error);
        }
      };
      fetchDates();
    }
  }, [isRescheduleModalOpen, selectedAppointment]);

  useEffect(() => {
    if (newDate && selectedAppointment) {
      setNewTime(''); // Reset selected time when date changes
      setSlotPage(1);
      const fetchSlots = async () => {
        setLoadingSlots(true);
        try {
          const res = await axios.get(`http://localhost:5000/api/appointments/slots/${selectedAppointment.doctor_id}?date=${newDate}`);
          if (res.data.success) {
            setAvailableSlots(res.data.slots || []);
          }
        } catch (error) {
          console.error('Error fetching slots:', error);
        } finally {
          setLoadingSlots(false);
        }
      };
      fetchSlots();
    }
  }, [newDate, selectedAppointment]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.get(
          'http://localhost:5000/api/appointments/patient/my-appointments',
          { headers: { Authorization: token } }
        );
        if (response.data.success) {
          const upcoming = response.data.appointments.find(a => 
            (a.status === 'pending' || a.status === 'confirmed') && a.is_telemedicine
          );
          setUpcomingTelemedicine(upcoming);
          setAppointments(response.data.appointments || []);
        }
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    };
    if (token) fetchAppointments();
  }, [token]);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment? Cancellations are only allowed up to 1 hour before.')) return;
    try {
      const res = await axios.put(`http://localhost:5000/api/appointments/${id}/cancel`, {}, {
        headers: { Authorization: token }
      });
      if (res.data.success) {
        setAppointments(appointments.map(a => a.id === id ? { ...a, status: 'cancelled' } : a));
      }
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      alert(err.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  const openRescheduleModal = (app) => {
    setSelectedAppointment(app);
    const d = new Date(app.appointment_date);
    const localDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    setNewDate(localDateStr);
    setNewTime(app.start_time);
    setIsRescheduleModalOpen(true);
  };

  const handleReschedule = async () => {
    if (!newDate || !newTime) return alert('Please select a new date and time');
    try {
      const res = await axios.put(`http://localhost:5000/api/appointments/${selectedAppointment.id}/reschedule`, {
        new_date: newDate,
        new_time: newTime
      }, {
        headers: { Authorization: token }
      });
      if (res.data.success) {
        setAppointments(appointments.map(a => a.id === selectedAppointment.id ? { ...a, appointment_date: newDate, start_time: newTime } : a));
        setIsRescheduleModalOpen(false);
        setSelectedAppointment(null);
        toast.success('Appointment Rescheduled Successfully');
      }
    } catch (err) {
      console.error('Error rescheduling appointment:', err);
      alert(err.response?.data?.message || 'Failed to reschedule appointment');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-blue-100 flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-10">
        
        {/* Welcome Banner */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-400 rounded-3xl p-8 md:p-10 shadow-lg shadow-blue-200 text-white mb-8 relative overflow-hidden group">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3 tracking-tight">
              Welcome back, {user?.name || user?.firstName || 'Patient'}! 👋
            </h2>
            <p className="text-blue-50 text-lg md:text-xl max-w-2xl font-medium leading-relaxed">
              Here is your daily health summary. Stay on track with your upcoming appointments and wellness goals.
            </p>
          </div>
          {/* Decorative background shapes */}
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
        </div>

        {upcomingTelemedicine && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 mb-8 text-white flex flex-col md:flex-row items-center justify-between shadow-xl">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <div className="bg-white/20 p-4 rounded-full">
                <Video className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Upcoming Telemedicine Consultation</h3>
                <p className="text-blue-100">
                  With {upcomingTelemedicine.doctor_name} on {new Date(upcomingTelemedicine.appointment_date).toLocaleDateString()} at {upcomingTelemedicine.start_time}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate(`/telemedicine/${upcomingTelemedicine.id}`)}
              className="px-6 py-3 bg-white text-blue-600 hover:bg-blue-50 font-bold rounded-xl shadow-lg transition"
            >
              Join Video Call
            </button>
          </div>
        )}

        {/* Summary Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Upcoming Appointments */}
          <div className="bg-white rounded-3xl p-7 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 hover:border-blue-100 transition-all duration-300 group cursor-pointer relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-300"></div>
            <div className="flex items-center justify-between mb-5 relative z-10">
              <div className="p-3.5 bg-blue-100 text-blue-700 rounded-2xl group-hover:rotate-6 transition-transform duration-300">
                <CalendarIcon className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 shadow-sm">Next 7 Days</span>
            </div>
            <h3 className="text-slate-500 text-sm font-semibold mb-1 uppercase tracking-wider">Upcoming Appointments</h3>
            <p className="text-3xl font-extrabold text-slate-800">2 Scheduled</p>
          </div>

          {/* Card 2: Recent Diagnoses */}
          <div className="bg-white rounded-3xl p-7 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 hover:border-emerald-100 transition-all duration-300 group cursor-pointer relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-300"></div>
            <div className="flex items-center justify-between mb-5 relative z-10">
              <div className="p-3.5 bg-emerald-100 text-emerald-700 rounded-2xl group-hover:rotate-6 transition-transform duration-300">
                <ClipboardIcon className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 shadow-sm">New Updates</span>
            </div>
            <h3 className="text-slate-500 text-sm font-semibold mb-1 uppercase tracking-wider">Recent Diagnoses</h3>
            <p className="text-3xl font-extrabold text-slate-800">1 Added</p>
          </div>

          {/* Card 3: Medical Profile Status */}
          <div className="bg-white rounded-3xl p-7 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 hover:border-purple-100 transition-all duration-300 group cursor-pointer relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-300"></div>
            <div className="flex items-center justify-between mb-5 relative z-10">
              <div className="p-3.5 bg-purple-100 text-purple-700 rounded-2xl group-hover:rotate-6 transition-transform duration-300">
                <HeartIcon className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-full border border-purple-100 shadow-sm">Looking Good</span>
            </div>
            <h3 className="text-slate-500 text-sm font-semibold mb-1 uppercase tracking-wider">Medical Profile Status</h3>
            <p className="text-3xl font-extrabold text-slate-800">95% Complete</p>
          </div>
        </div>

        {/* Your Appointments Section */}
        <div className="mt-12 bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            Your Appointments
          </h3>
          {appointments.filter(app => app.status !== 'completed').length > 0 ? (
            <div className="space-y-4">
              {appointments.filter(app => app.status !== 'completed').map(app => (
                <div key={app.id} className="flex flex-col md:flex-row items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow">
                  <div className="flex-1 mb-4 md:mb-0">
                    <p className="font-bold text-lg text-slate-800">Dr. {app.doctor_name}</p>
                    <p className="text-slate-500 text-sm">{app.doctor_specialization}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-600 font-medium">
                      <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(app.appointment_date).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {app.start_time}</span>
                      <span className={`px-2 py-1 rounded-md text-xs font-bold capitalize ${app.status === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{app.status}</span>
                    </div>
                  </div>
                  <div className="flex gap-3 w-full md:w-auto">
                    {app.status === 'pending' && (
                      <button onClick={() => openRescheduleModal(app)} className="flex-1 md:flex-none px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold rounded-xl transition-colors">Reschedule</button>
                    )}
                    {(app.status === 'pending' || app.status === 'confirmed') && (
                      <button onClick={() => handleCancel(app.id)} className="flex-1 md:flex-none px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-semibold rounded-xl transition-colors">Cancel</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-6">You have no upcoming appointments.</p>
          )}
        </div>
        
        {/* Back Button */}
        <div className="mt-12 flex justify-center">
          <button 
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2 px-6 py-3 bg-white text-slate-600 hover:text-blue-600 font-medium rounded-full shadow-sm hover:shadow-md border border-slate-200 hover:border-blue-200 transition-all duration-300 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:-translate-x-1 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
            </svg>
            Back to Home
          </button>
        </div>
        
      </main>

      {/* Reschedule Modal */}
      {isRescheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
            <button onClick={() => setIsRescheduleModalOpen(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-bold text-slate-800 mb-6">Reschedule Appointment</h3>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">New Date</label>
                <div className="relative w-full">
                  <DatePicker 
                    selected={newDate ? new Date(newDate) : null} 
                    onChange={(date) => {
                      if (date) {
                        const formatted = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split('T')[0];
                        setNewDate(formatted);
                      } else {
                        setNewDate('');
                      }
                    }}
                    minDate={new Date(Date.now() + 86400000)}
                    filterDate={(date) => configuredDates.includes(date.toDateString())}
                    dayClassName={(date) => configuredDates.includes(date.toDateString()) ? "font-bold text-blue-700 bg-blue-100 rounded-full" : "text-slate-500"}
                    wrapperClassName="w-full"
                    className="w-full p-3 pr-10 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                    placeholderText="Select a date"
                    renderCustomHeader={({
                      date,
                      decreaseMonth,
                      increaseMonth,
                      prevMonthButtonDisabled,
                      nextMonthButtonDisabled,
                    }) => (
                      <div className="flex justify-between items-center px-2 py-1 bg-white">
                        <span className="font-bold text-slate-800 text-sm ml-1">
                          {date.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </span>
                        <div className="flex gap-1">
                          <button onClick={decreaseMonth} disabled={prevMonthButtonDisabled} type="button" className={`p-1.5 rounded-md ${prevMonthButtonDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-100 text-slate-700'}`}>
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button onClick={increaseMonth} disabled={nextMonthButtonDisabled} type="button" className={`p-1.5 rounded-md ${nextMonthButtonDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-100 text-slate-700'}`}>
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">New Time</label>
                {loadingSlots ? (
                  <p className="text-sm text-slate-500">Loading slots...</p>
                ) : availableSlots.length > 0 ? (
                  <>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {availableSlots.slice((slotPage - 1) * slotsPerPage, slotPage * slotsPerPage).map((slot, idx) => (
                        <button 
                          key={idx}
                          onClick={() => setNewTime(slot)}
                          className={`p-3 rounded-xl border text-sm font-bold transition-all duration-200 ${
                            newTime === slot 
                              ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-[1.02]' 
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                          }`}
                        >
                          {formatTimeAMPM(slot)}
                        </button>
                      ))}
                    </div>
                    {Math.ceil(availableSlots.length / slotsPerPage) > 1 && (
                      <div className="flex items-center justify-between px-2 text-sm font-bold text-slate-500">
                        <button 
                          type="button"
                          disabled={slotPage === 1}
                          onClick={() => setSlotPage(p => p - 1)}
                          className={`flex items-center px-4 py-2 rounded-xl border transition-colors ${slotPage === 1 ? 'opacity-40 cursor-not-allowed border-slate-100 bg-slate-50' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'}`}
                        >
                          &lt; Prev
                        </button>
                        <span>{slotPage} / {Math.ceil(availableSlots.length / slotsPerPage)}</span>
                        <button 
                          type="button"
                          disabled={slotPage === Math.ceil(availableSlots.length / slotsPerPage)}
                          onClick={() => setSlotPage(p => p + 1)}
                          className={`flex items-center px-4 py-2 rounded-xl border transition-colors ${slotPage === Math.ceil(availableSlots.length / slotsPerPage) ? 'opacity-40 cursor-not-allowed border-slate-100 bg-slate-50' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'}`}
                        >
                          Next &gt;
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-red-500 font-medium bg-red-50 p-3 rounded-xl border border-red-100">No slots available for this date.</p>
                )}
              </div>
              <button onClick={handleReschedule} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PatientDashboardHome;
