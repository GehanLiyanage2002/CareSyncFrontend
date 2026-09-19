import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { DollarSign, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

const DoctorEarningsPage = () => {
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('All Time');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/doctor/appointments`, {
          headers: { Authorization: token }
        });

        if (response.data.success) {
          // Filter ONLY completed appointments for earnings
          const completedAppointments = response.data.appointments.filter(
            apt => apt.status === 'completed'
          );
          completedAppointments.sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date));
          setAppointments(completedAppointments);
        }
      } catch (error) {
        console.error('Error fetching earnings history:', error);
        toast.error('Failed to load earnings history');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (token) fetchHistory();
  }, [token]);

  // Filter logic
  const filteredAppointments = useMemo(() => {
    let filtered = [...appointments];

    if (dateFilter !== 'All Time') {
      const now = new Date();
      filtered = filtered.filter(apt => {
        const aptDate = new Date(apt.appointment_date);
        
        if (dateFilter === 'Today') {
          return aptDate.toDateString() === now.toDateString();
        } else if (dateFilter === 'This Week') {
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          startOfWeek.setHours(0,0,0,0);
          return aptDate >= startOfWeek && aptDate <= now;
        } else if (dateFilter === 'This Month') {
          return aptDate.getMonth() === now.getMonth() && aptDate.getFullYear() === now.getFullYear();
        } else if (dateFilter === 'Custom' && customDateRange.start && customDateRange.end) {
          const start = new Date(customDateRange.start);
          start.setHours(0,0,0,0);
          const end = new Date(customDateRange.end);
          end.setHours(23,59,59,999);
          return aptDate >= start && aptDate <= end;
        }
        return true;
      });
    }
    
    return filtered;
  }, [appointments, dateFilter, customDateRange]);

  // Calculate totals
  const totalEarnings = useMemo(() => {
    return filteredAppointments.reduce((sum, apt) => sum + (parseFloat(apt.consultation_fee) || 0), 0);
  }, [filteredAppointments]);

  const platformFee = totalEarnings * 0.10;
  const netPayout = totalEarnings * 0.90;

  // Chart Data calculation
  const chartData = useMemo(() => {
    if (dateFilter === 'Today') {
      let revenue = 0;
      filteredAppointments.forEach(apt => revenue += (parseFloat(apt.consultation_fee) || 0));
      return [{ name: 'Today', Revenue: revenue }];
    } 
    
    if (dateFilter === 'This Week') {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const data = days.map(day => ({ name: day, Revenue: 0 }));
      filteredAppointments.forEach(apt => {
        const d = new Date(apt.appointment_date);
        data[d.getDay()].Revenue += (parseFloat(apt.consultation_fee) || 0);
      });
      // Shift array so Monday is first (optional, but looks better)
      const shiftedData = [...data.slice(1), data[0]]; 
      return shiftedData;
    }
    
    if (dateFilter === 'This Month') {
      const data = [
        { name: 'Week 1', Revenue: 0 },
        { name: 'Week 2', Revenue: 0 },
        { name: 'Week 3', Revenue: 0 },
        { name: 'Week 4', Revenue: 0 },
        { name: 'Week 5', Revenue: 0 }
      ];
      filteredAppointments.forEach(apt => {
        const d = new Date(apt.appointment_date);
        const date = d.getDate();
        const week = Math.ceil(date / 7) - 1;
        if (data[week]) data[week].Revenue += (parseFloat(apt.consultation_fee) || 0);
      });
      return data;
    }

    // Default: 'All Time' or 'Custom' -> Group by Month
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = months.map(month => ({ name: month, Revenue: 0 }));

    filteredAppointments.forEach(apt => {
      const d = new Date(apt.appointment_date);
      data[d.getMonth()].Revenue += (parseFloat(apt.consultation_fee) || 0);
    });

    return data;
  }, [filteredAppointments, dateFilter]);


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 font-sans text-slate-800 dark:text-white selection:bg-teal-100 flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-[1400px] w-full mx-auto p-4 md:p-8">
        
        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2.5 rounded-xl text-blue-600 dark:text-blue-400">
                <DollarSign size={28} />
              </div>
              My Earnings
            </h1>
            <p className="text-slate-500 dark:text-gray-400 mt-2 text-lg font-medium">
              Track your total revenue, platform fees, and net payouts.
            </p>
          </div>
          
          {/* Date Filter */}
          <div className="flex flex-col items-end gap-3 w-full md:w-auto">
            <div className="bg-white dark:bg-gray-800 rounded-full p-1.5 border border-slate-200 dark:border-gray-700 shadow-sm flex overflow-x-auto max-w-full hide-scrollbar">
              {['All Time', 'Today', 'This Week', 'This Month', 'Custom'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setDateFilter(filter)}
                  className={`px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                    dateFilter === filter 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
            
            {dateFilter === 'Custom' && (
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm animate-in fade-in slide-in-from-top-2">
                <input 
                  type="date" 
                  value={customDateRange.start}
                  onChange={(e) => setCustomDateRange(prev => ({...prev, start: e.target.value}))}
                  className="bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm text-slate-700 dark:text-gray-200 focus:outline-none focus:border-blue-500"
                />
                <span className="text-slate-400 text-sm font-medium">to</span>
                <input 
                  type="date" 
                  value={customDateRange.end}
                  onChange={(e) => setCustomDateRange(prev => ({...prev, end: e.target.value}))}
                  className="bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm text-slate-700 dark:text-gray-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-[400px] text-slate-400">
            <div className="animate-pulse flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="font-semibold">Loading earnings data...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total Earnings */}
              <div className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-3xl p-6 text-white shadow-lg flex flex-col justify-between">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-slate-300 font-bold text-[11px] uppercase tracking-wider">Total Earnings</h4>
                  <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm"><DollarSign size={20} className="text-slate-200" /></div>
                </div>
                <div>
                  <p className="text-3xl font-black">LKR {totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <p className="text-xs text-slate-400 mt-2 font-medium">Before commission</p>
                </div>
              </div>
              
              {/* Platform Fee */}
              <div className="bg-gradient-to-br from-rose-500 to-red-600 rounded-3xl p-6 text-white shadow-lg shadow-rose-200 flex flex-col justify-between">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-rose-100 font-bold text-[11px] uppercase tracking-wider">Platform Fee (10%)</h4>
                  <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm"><TrendingUp size={20} className="text-white" /></div>
                </div>
                <div>
                  <p className="text-3xl font-black">- LKR {platformFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <p className="text-xs text-rose-100 mt-2 font-medium">CareSync service charge</p>
                </div>
              </div>

              {/* Net Payout */}
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 text-white shadow-lg shadow-emerald-200 flex flex-col justify-between transform transition hover:-translate-y-1 hover:shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-emerald-100 font-bold text-[11px] uppercase tracking-wider">Net Payout</h4>
                  <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm"><DollarSign size={20} className="text-white" /></div>
                </div>
                <div>
                  <p className="text-3xl font-black">LKR {netPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <p className="text-xs text-emerald-100 mt-2 font-medium">Your final balance</p>
                </div>
              </div>
            </div>

            {/* Chart Section */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-gray-700">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Revenue Overview ({dateFilter})</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
                    />
                    <Tooltip 
                      cursor={{ fill: '#f1f5f9' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value) => [`LKR ${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Bar dataKey="Revenue" fill="#4b9a8f" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Compact Recent Transactions Table */}
            {filteredAppointments.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Recent Transactions</h3>
                    <p className="text-xs text-slate-500 mt-1">Based on selected filter</p>
                  </div>
                  <span className="text-sm font-bold text-slate-600 dark:text-gray-300 bg-slate-100 dark:bg-gray-700 px-3 py-1 rounded-lg">
                    {filteredAppointments.length} Total
                  </span>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="text-slate-400 dark:text-gray-500 uppercase tracking-wider font-semibold border-b border-slate-100 dark:border-gray-700">
                      <tr>
                        <th className="pb-3 pr-4">Date</th>
                        <th className="pb-3 px-4">Patient</th>
                        <th className="pb-3 px-4 text-right">Fee (LKR)</th>
                        <th className="pb-3 px-4 text-right">Platform Fee (LKR)</th>
                        <th className="pb-3 pl-4 text-right">Net Amount (LKR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-gray-700/50">
                      {filteredAppointments.slice(0, 5).map((apt) => {
                        const fee = parseFloat(apt.consultation_fee) || 0;
                        const pFee = fee * 0.10;
                        const net = fee * 0.90;
                        return (
                          <tr key={apt.id} className="group hover:bg-slate-50/50 dark:hover:bg-gray-700/30 transition-colors">
                            <td className="py-3 pr-4 text-slate-500 dark:text-gray-400 font-medium text-xs">
                              {new Date(apt.appointment_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-bold text-slate-700 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {apt.patient_name || 'Unknown'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right font-semibold text-slate-700 dark:text-gray-300 text-sm">
                              {fee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="py-3 px-4 text-right font-medium text-rose-500 text-sm">
                              - {pFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="py-3 pl-4 text-right font-black text-emerald-600 dark:text-emerald-400">
                              + {net.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {filteredAppointments.length > 5 && (
                  <div className="mt-4 pt-3 border-t border-slate-50 dark:border-gray-700 text-center">
                    <p className="text-xs font-medium text-slate-400 dark:text-gray-500">
                      Showing the latest 5 out of {filteredAppointments.length} transactions.
                    </p>
                  </div>
                )}
              </div>
            )}



          </div>
        )}
      </main>
    </div>
  );
};

export default DoctorEarningsPage;
