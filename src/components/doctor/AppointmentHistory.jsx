import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { useSelector } from 'react-redux';

const AppointmentHistory = () => {
  const { token } = useSelector((state) => state.auth);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/doctor/appointments', {
          headers: { Authorization: token }
        });

        if (response.data.success) {
          // Filter only completed appointments
          const completed = response.data.appointments.filter(apt => apt.status === 'Completed');
          setHistory(completed);
        }
      } catch (error) {
        console.error('Error fetching appointment history:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (token) fetchHistory();
  }, [token]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64 text-gray-500">Loading history...</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Appointment History</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Review your past completed appointments.</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-300 font-medium border-b border-gray-100 dark:border-gray-700">
            <tr>
              <th className="px-6 py-4">Patient</th>
              <th className="px-6 py-4">Date & Time</th>
              <th className="px-6 py-4">Reason</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {history.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No completed appointments found.
                </td>
              </tr>
            ) : (
              history.map((apt) => (
                <tr key={apt.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <User size={14} />
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">{apt.patient_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                        <Calendar size={14} className="text-gray-400" />
                        <span>{new Date(apt.appointment_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-xs">
                        <Clock size={12} />
                        <span>{apt.appointment_time}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                    {apt.reason || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      <CheckCircle size={12} />
                      {apt.status}
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
