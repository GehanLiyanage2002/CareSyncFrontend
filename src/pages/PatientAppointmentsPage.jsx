import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import ReviewModal from '../components/patient/ReviewModal';
import { Calendar, Clock, Star, ChevronRight, Stethoscope, Hash, CreditCard, CheckCircle, XCircle, AlertCircle, ClockIcon } from 'lucide-react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

const statusConfig = {
  pending: {
    label: 'Pending',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: ClockIcon,
  },
  confirmed: {
    label: 'Confirmed',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: CheckCircle,
  },
  completed: {
    label: 'Completed',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: XCircle,
  },
};

const PatientAppointmentsPage = () => {
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [reviewTarget, setReviewTarget] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.get(
          'http://localhost:5000/api/appointments/patient/my-appointments',
          { headers: { Authorization: token } }
        );
        if (response.data.success) {
          setAppointments(response.data.appointments);
        }
      } catch (error) {
        console.error('Error fetching appointments:', error);
        toast.error('Failed to load appointments');
      } finally {
        setIsLoading(false);
      }
    };

    if (token) fetchAppointments();
  }, [token]);

  const handleReviewSubmitted = (appointmentId) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === appointmentId ? { ...a, has_review: true } : a))
    );
  };

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  const filtered = filter === 'all' ? appointments : appointments.filter((a) => a.status === filter);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '-';
    const [h, m] = timeStr.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-blue-100 flex flex-col">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-10">

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900">My Appointments</h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">
            Track and manage all your past and upcoming visits.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 text-sm font-bold rounded-xl border transition-all duration-200 ${
                filter === f.key
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              {f.label}
              {f.key !== 'all' && (
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full font-black ${
                  filter === f.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {appointments.filter((a) => a.status === f.key).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4" />
            <p className="font-semibold text-slate-500">Loading your appointments...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <Calendar className="w-16 h-16 text-slate-200 mb-4" />
            <p className="text-lg font-bold text-slate-500">No appointments found</p>
            <p className="text-sm mt-1">
              {filter !== 'all' ? `No ${filter} appointments.` : "Book an appointment to get started."}
            </p>
            <button
              onClick={() => navigate('/patient/dashboard')}
              className="mt-6 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700 transition-colors shadow"
            >
              Book Now
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((apt) => {
              const status = statusConfig[apt.status] || statusConfig.pending;
              const StatusIcon = status.icon;

              return (
                <div
                  key={apt.id}
                  className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group"
                >
                  <div className="p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Doctor Avatar */}
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-extrabold text-xl shadow-md flex-shrink-0">
                      {apt.doctor_name ? apt.doctor_name.charAt(0).toUpperCase() : 'D'}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-extrabold text-slate-800 text-lg leading-tight">
                          {apt.doctor_name || 'Doctor'}
                        </h3>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${status.color}`}>
                          <StatusIcon size={11} />
                          {status.label}
                        </span>
                      </div>

                      {apt.doctor_specialization && (
                        <p className="text-sm text-blue-600 font-semibold flex items-center gap-1.5 mb-2">
                          <Stethoscope size={13} />
                          {apt.doctor_specialization}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-3 text-xs text-slate-500 font-semibold">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-slate-400" />
                          {formatDate(apt.appointment_date)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock size={13} className="text-slate-400" />
                          {formatTime(apt.start_time)}
                        </span>
                        {apt.token_number && (
                          <span className="flex items-center gap-1.5">
                            <Hash size={13} className="text-slate-400" />
                            {apt.token_number}
                          </span>
                        )}
                        {apt.payment_method && (
                          <span className="flex items-center gap-1.5">
                            <CreditCard size={13} className="text-slate-400" />
                            {apt.payment_method}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex-shrink-0">
                      {apt.status === 'completed' && !apt.has_review && (
                        <button
                          onClick={() => setReviewTarget(apt)}
                          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white font-bold rounded-xl text-sm shadow hover:shadow-md transition-all duration-200 whitespace-nowrap"
                        >
                          <Star size={15} className="fill-white" />
                          Write Review
                        </button>
                      )}
                      {apt.status === 'completed' && apt.has_review && (
                        <span className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-50 text-emerald-700 font-bold rounded-xl text-sm border border-emerald-200 whitespace-nowrap">
                          <CheckCircle size={14} />
                          Reviewed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Back Button */}
        <div className="mt-12 flex justify-center pb-8">
          <button
            onClick={() => navigate('/patient/dashboard')}
            className="flex items-center gap-2 px-6 py-3 bg-white text-slate-600 hover:text-blue-600 font-medium rounded-full shadow-sm hover:shadow-md border border-slate-200 hover:border-blue-200 transition-all duration-300 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:-translate-x-1 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
        </div>
      </main>

      {/* Review Modal */}
      {reviewTarget && (
        <ReviewModal
          appointment={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
    </div>
  );
};

export default PatientAppointmentsPage;
