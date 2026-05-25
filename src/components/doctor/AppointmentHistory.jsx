import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, User, Check, X, Search, Phone, Hash } from 'lucide-react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

const AppointmentHistory = () => {
  const { token } = useSelector((state) => state.auth);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/doctor/appointments', {
          headers: { Authorization: token }
        });

        if (response.data.success) {
          // Filter both completed and cancelled appointments (case-sensitive fix)
          const pastAppointments = response.data.appointments.filter(
            apt => apt.status === 'completed' || apt.status === 'cancelled'
          );
          // Sort by newest first
          pastAppointments.sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date));
          setHistory(pastAppointments);
        }
      } catch (error) {
        console.error('Error fetching appointment history:', error);
        toast.error('Failed to load appointment history');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (token) fetchHistory();
  }, [token]);

  // Search filter
  const filteredHistory = useMemo(() => {
    return history.filter((apt) => {
      const query = searchQuery.toLowerCase();
      const nameMatch = apt.patient_name?.toLowerCase().includes(query);
      const tokenMatch = apt.token_number?.toString().includes(query);
      return nameMatch || tokenMatch;
    });
  }, [history, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[500px] text-slate-400">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin mb-4"></div>
          <p className="font-semibold text-slate-600">Loading your history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-slate-100 dark:border-gray-700 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col h-full">
      
      {/* Header & Search */}
      <div className="p-6 md:p-8 border-b border-slate-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            History Records
          </h2>
          <p className="text-sm font-medium text-slate-500 dark:text-gray-400 mt-1">
            Review your past completed and cancelled consultations.
          </p>
        </div>
        
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-gray-900/50 border border-slate-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-slate-800 dark:text-gray-200"
            placeholder="Search by name or token..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {/* Table Content */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 dark:bg-gray-900/50 text-slate-500 dark:text-gray-400 uppercase tracking-wider font-semibold border-b border-slate-100 dark:border-gray-700">
            <tr>
              <th className="px-6 py-4">Token</th>
              <th className="px-6 py-4">Patient Details</th>
              <th className="px-6 py-4">Age / Gender</th>
              <th className="px-6 py-4">Date & Time</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-gray-700">
            {filteredHistory.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <Calendar className="w-12 h-12 mb-3 text-slate-300" />
                    <p className="text-lg font-bold text-slate-500">No records found</p>
                    <p className="text-sm mt-1">
                      {searchQuery ? "No history matches your search." : "You have no completed or cancelled appointments yet."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredHistory.map((apt) => (
                <tr key={apt.id} className="hover:bg-slate-50/80 dark:hover:bg-gray-700/50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300 rounded-lg font-bold text-xs border border-slate-200 dark:border-gray-600">
                      <Hash size={12} />
                      {apt.token_number || '-'}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400 font-bold border border-teal-200 dark:border-teal-800">
                        {apt.patient_name ? apt.patient_name.charAt(0).toUpperCase() : <User size={16} />}
                      </div>
                      <span className="font-bold text-slate-800 dark:text-white">{apt.patient_name || 'Unknown'}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-slate-600 dark:text-gray-300 font-medium">
                     {apt.patient_age ? `${apt.patient_age} Yrs` : '-'} {apt.patient_gender ? `/ ${apt.patient_gender}` : ''}
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-gray-300">
                        <Calendar size={14} className="text-teal-500" />
                        <span>{new Date(apt.appointment_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-gray-400 text-xs font-semibold">
                        <Clock size={12} />
                        <span>{apt.start_time ? apt.start_time.substring(0, 5) : apt.appointment_time}</span>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 text-slate-600 dark:text-gray-300 font-medium flex items-center gap-2 mt-2">
                     <Phone size={14} className="text-slate-400" />
                     {apt.patient_contact || 'N/A'}
                  </td>
                  
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border shadow-sm ${
                      apt.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
                        : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800'
                    }`}>
                      {apt.status === 'completed' ? <Check size={14} /> : <X size={14} />}
                      {apt.status === 'completed' ? 'Completed' : 'Cancelled'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AppointmentHistory;
