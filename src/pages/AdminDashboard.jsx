import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { 
  LayoutDashboard, Users, UserRound, Calendar, DollarSign, 
  LogOut, Activity, TrendingUp, CheckCircle, XCircle, Stethoscope,
  Search, X, Filter, Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { logout } from '../features/auth/authSlice';
import AdminServices from '../components/admin/AdminServices';
import AddDoctorModal from '../components/admin/AddDoctorModal';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [stats, setStats] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [doctorSearchQuery, setDoctorSearchQuery] = useState('');
  const [doctorStatusFilter, setDoctorStatusFilter] = useState('All');

  
  // Filtering and Real-time state
  const [dateFilter, setDateFilter] = useState('All Time');
  const [customDates, setCustomDates] = useState({ start: '', end: '' });
  const [socketConnected, setSocketConnected] = useState(false);
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctorToDelete, setDoctorToDelete] = useState(null);

  const { token, user } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!token || user?.role !== 'Admin') {
      navigate('/login');
    }
  }, [token, user, navigate]);

  const config = {
    headers: { Authorization: token }
  };

  const getFilterDates = () => {
    const today = new Date();
    let startDate = '';
    let endDate = format(today, 'yyyy-MM-dd');

    switch (dateFilter) {
      case 'Today':
        startDate = format(today, 'yyyy-MM-dd');
        break;
      case 'This Week':
        startDate = format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
        endDate = format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
        break;
      case 'This Month':
        startDate = format(startOfMonth(today), 'yyyy-MM-dd');
        endDate = format(endOfMonth(today), 'yyyy-MM-dd');
        break;
      case 'Custom':
        return { startDate: customDates.start, endDate: customDates.end };
      default:
        return { startDate: '', endDate: '' };
    }
    return { startDate, endDate };
  };

  const fetchStats = async () => {
    try {
      let url = 'http://localhost:5000/api/admin/stats';
      const { startDate, endDate } = getFilterDates();
      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }
      const res = await axios.get(url, { headers: { Authorization: token } });
      console.log('[AdminDashboard] Stats received:', res.data.stats);
      setStats(res.data.stats);
    } catch (err) {
      console.error('[AdminDashboard] fetchStats error:', err.response?.status, err.response?.data || err.message);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/doctors', config);
      setDoctors(res.data.doctors);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/patients', config);
      setPatients(res.data.patients);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/appointments', config);
      setAppointments(res.data.appointments);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEarnings = async () => {
    try {
      let url = 'http://localhost:5000/api/admin/earnings';
      const { startDate, endDate } = getFilterDates();
      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }
      const res = await axios.get(url, { headers: { Authorization: token } });
      console.log('[AdminDashboard] Earnings received:', res.data.earnings?.length, 'records');
      setEarnings(res.data.earnings);
    } catch (err) {
      console.error('[AdminDashboard] fetchEarnings error:', err.response?.status, err.response?.data || err.message);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (activeTab === 'Overview') {
        await fetchStats();
        await fetchEarnings(); // For the doctors table in overview
      }
      if (activeTab === 'Doctors') await fetchDoctors();
      if (activeTab === 'Patients') await fetchPatients();
      if (activeTab === 'Appointments') await fetchAppointments();
      if (activeTab === 'Earnings') await fetchEarnings();
      setLoading(false);
    };
    loadData();
  }, [activeTab, dateFilter, customDates]);

  useEffect(() => {
    const socket = io('http://localhost:5000', { reconnection: true, reconnectionDelay: 1000 });
    socket.on('connect', () => {
      setSocketConnected(true);
      // Refresh data on reconnect (e.g. after server restart)
      if (activeTab === 'Overview') { fetchStats(); fetchEarnings(); }
      if (activeTab === 'Appointments') fetchAppointments();
    });
    socket.on('disconnect', () => setSocketConnected(false));
    
    const refreshData = () => {
      if (activeTab === 'Overview') {
        fetchStats();
        fetchEarnings();
      }
      if (activeTab === 'Appointments') fetchAppointments();
    };

    socket.on('appointmentStatusChanged', refreshData);
    socket.on('slotBooked', refreshData);
    
    // Listen for doctor updates to refresh the doctors list
    const refreshDoctors = () => {
      if (activeTab === 'Doctors') {
        fetchDoctors();
      }
      refreshData();
    };

    socket.on('doctorProfileUpdated', refreshDoctors);
    socket.on('doctorFeeChanged', refreshDoctors);
    socket.on('doctorAvailabilityChanged', refreshDoctors);
    
    return () => socket.disconnect();
  }, [activeTab, dateFilter, customDates]);


  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleApproveDoctor = async (id, currentStatus) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/admin/doctors/${id}/approve`, {
        is_approved: !currentStatus
      }, config);
      toast.success(res.data.message);
      fetchDoctors(); // Refresh list
      if (selectedDoctor && selectedDoctor.id === id) {
         setSelectedDoctor({ ...selectedDoctor, is_approved: !currentStatus });
      }
    } catch (err) {
      toast.error('Failed to update doctor status');
      console.error(err);
    }
  };

  const handleDeleteDoctor = (doctor) => {
    setDoctorToDelete(doctor);
  };

  const confirmDeleteDoctor = async () => {
    if (!doctorToDelete) return;
    try {
      const res = await axios.delete(`http://localhost:5000/api/admin/doctors/${doctorToDelete.id}`, config);
      toast.success(res.data.message);
      setDoctorToDelete(null);
      setSelectedDoctor(null);
      fetchDoctors();
    } catch (err) {
      toast.error('Failed to delete doctor');
      console.error(err);
    }
  };

  const navItems = [
    { name: 'Overview', icon: <LayoutDashboard /> },
    { name: 'Doctors', icon: <UserRound /> },
    { name: 'Patients', icon: <Users /> },
    { name: 'Appointments', icon: <Calendar /> },
    { name: 'Medical Services', icon: <Stethoscope /> },
    { name: 'Earnings', icon: <DollarSign /> },
  ];

  const filteredEarnings = earnings.filter(earn => {
    const query = searchQuery.toLowerCase();
    return (
      earn.doctor_name.toLowerCase().includes(query) ||
      earn.specialization.toLowerCase().includes(query) ||
      earn.consultation_fee.toString().includes(query)
    );
  });

  const filteredDoctors = doctors.filter(doc => {
    // Status Filter based on is_available (Accepting patients or not)
    if (doctorStatusFilter === 'Available' && !doc.is_available) return false;
    if (doctorStatusFilter === 'Unavailable' && doc.is_available) return false;

    // Search Query Filter
    const trimmedQuery = doctorSearchQuery.trim().toLowerCase();
    if (!trimmedQuery) return true;
    
    const nameMatch = String(doc.full_name || '').toLowerCase().includes(trimmedQuery);
    const specMatch = String(doc.specialization || '').toLowerCase().includes(trimmedQuery);
    const emailMatch = String(doc.email || '').toLowerCase().includes(trimmedQuery);
    const phoneMatch = String(doc.mobile_number || '').toLowerCase().includes(trimmedQuery);
    
    return nameMatch || specMatch || emailMatch || phoneMatch;
  });

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Header Navbar */}
      <header className="bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50 flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-md shadow-blue-200">
            CS
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700 leading-tight">CareSync</h1>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">Healthcare Solutions</p>
          </div>
        </div>

        {/* Navigation Pills */}
        <nav className="hidden md:flex bg-blue-50/50 rounded-full p-1.5 border border-blue-100 shadow-inner">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`flex items-center flex-col px-5 py-1.5 rounded-full transition-all duration-300 min-w-[90px] ${
                activeTab === item.name
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-blue-600 hover:bg-blue-100/50'
              }`}
            >
              {React.cloneElement(item.icon, { size: 18, className: 'mb-0.5' })}
              <span className="text-[10px] font-bold uppercase tracking-wider">{item.name}</span>
            </button>
          ))}
        </nav>

        {/* Sign Out */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-full font-bold transition-all shadow-sm shadow-amber-200 text-sm hover:-translate-y-0.5"
        >
          Sign Out
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 relative">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* OVERVIEW TAB */}
              {activeTab === 'Overview' && stats && (
                <>
                  <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
                    <div>
                      <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight">DASHBOARD</h2>
                      <p className="text-slate-500 font-medium mt-1">Overview of doctors & appointments</p>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <div className="flex bg-white border border-slate-200 rounded-full p-1 shadow-sm overflow-x-auto max-w-full">
                        {['All Time', 'Today', 'This Week', 'This Month', 'Custom'].map(f => (
                          <button
                            key={f}
                            onClick={() => setDateFilter(f)}
                            className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all whitespace-nowrap ${
                              dateFilter === f ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                            }`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                      
                      {dateFilter === 'Custom' && (
                        <div className="flex gap-2 items-center bg-white border border-slate-200 p-1.5 rounded-full shadow-sm animate-in fade-in slide-in-from-top-2">
                          <input type="date" value={customDates.start} onChange={e => setCustomDates({...customDates, start: e.target.value})} className="text-xs px-3 py-1 bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:border-blue-400" />
                          <span className="text-slate-400 text-xs font-bold">TO</span>
                          <input type="date" value={customDates.end} onChange={e => setCustomDates({...customDates, end: e.target.value})} className="text-xs px-3 py-1 bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:border-blue-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    {[
                      { 
                        title: 'Total Doctors', 
                        value: stats.totalDoctors, 
                        icon: <UserRound size={24} />, 
                        iconColor: 'bg-teal-100 text-teal-600', 
                        tagColor: 'bg-teal-50 text-teal-700 border-teal-100', 
                        tag: 'Platform' 
                      },
                      { 
                        title: 'Registered Users', 
                        value: stats.totalPatients, 
                        icon: <Users size={24} />, 
                        iconColor: 'bg-purple-100 text-purple-600', 
                        tagColor: 'bg-purple-50 text-purple-700 border-purple-100', 
                        tag: 'Overall' 
                      },
                      { 
                        title: 'Total Appointments', 
                        value: stats.totalAppointments, 
                        icon: <Calendar size={24} />, 
                        iconColor: 'bg-amber-100 text-amber-600', 
                        tagColor: 'bg-amber-50 text-amber-700 border-amber-100', 
                        tag: 'All Time' 
                      },
                      { 
                        title: 'Completed Consultations', 
                        value: stats.totalCompleted || 0, 
                        icon: <CheckCircle size={24} />, 
                        iconColor: 'bg-blue-100 text-blue-600', 
                        tagColor: 'bg-blue-50 text-blue-700 border-blue-100', 
                        tag: 'Success' 
                      },
                      { 
                        title: 'Canceled Appointments', 
                        value: stats.totalCancelled || 0, 
                        icon: <XCircle size={24} />, 
                        iconColor: 'bg-rose-100 text-rose-600', 
                        tagColor: 'bg-rose-50 text-rose-700 border-rose-100', 
                        tag: 'Failed' 
                      },
                      { 
                        title: 'Total Earnings', 
                        value: `LKR ${(stats.totalRevenue || 0).toLocaleString()}`, 
                        icon: <DollarSign size={24} />, 
                        iconColor: 'bg-emerald-100 text-emerald-600', 
                        tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-100', 
                        tag: 'Revenue' 
                      },
                    ].map((stat, i) => (
                      <div key={i} className="bg-white border border-slate-100 shadow-sm rounded-[2rem] p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-8">
                          <div className={`w-12 h-12 rounded-[1rem] flex items-center justify-center ${stat.iconColor}`}>
                            {stat.icon}
                          </div>
                          <div className={`px-4 py-1.5 text-[10px] uppercase tracking-widest font-bold rounded-full border ${stat.tagColor}`}>
                            {stat.tag}
                          </div>
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{stat.title}</p>
                          <p className="text-3xl font-black text-slate-800">{stat.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Search Bar */}
                  <div className="mb-6">
                    <h3 className="text-[15px] font-bold text-slate-700 mb-2">Search doctors</h3>
                    <div className="flex items-center gap-3">
                      <div className="relative w-full max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
                        <input 
                          type="text" 
                          placeholder="Search name / specialization / fee"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 rounded-full border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-sm text-sm font-medium text-slate-700 placeholder-slate-400 bg-white"
                        />
                      </div>
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full font-bold text-sm shadow-sm shadow-blue-200 transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Doctors Table */}
                  <div className="bg-white rounded-3xl shadow-md shadow-blue-100/50 border border-blue-50 overflow-hidden">
                     <div className="p-5 border-b border-blue-50 flex justify-between items-center bg-white">
                        <h3 className="text-xl font-extrabold text-slate-800">Doctors</h3>
                        <span className="text-xs font-semibold text-slate-400">Showing {filteredEarnings.length} of {earnings.length}</span>
                     </div>
                     <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-blue-50/50 border-b border-blue-100 text-blue-800 text-[11px] uppercase tracking-widest">
                              <th className="p-4 px-6 font-bold">Doctor</th>
                              <th className="p-4 font-bold">Specialization</th>
                              <th className="p-4 font-bold">Fee</th>
                              <th className="p-4 font-bold text-center">Appointments</th>
                              <th className="p-4 font-bold text-center">Completed</th>
                              <th className="p-4 font-bold text-center">Canceled</th>
                              <th className="p-4 px-6 font-bold text-right">Total Earnings</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-blue-50">
                            {filteredEarnings.map(earn => (
                              <tr key={earn.doctor_id} className="hover:bg-blue-50/30 transition-colors group">
                                <td className="p-4 px-6">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold overflow-hidden shadow-sm">
                                      <img src={`http://localhost:5000/api/users/profile-image/${earn.doctor_id}?t=${Date.now()}`} alt={earn.doctor_name} className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.parentNode.innerHTML = earn.doctor_name.charAt(0); }} />
                                    </div>
                                    <div>
                                      <p className="font-bold text-slate-700">Dr. {earn.doctor_name}</p>
                                      <p className="text-[11px] text-slate-400 font-medium">ID: {earn.doctor_id.split('-')[0]}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4 text-sm font-semibold text-slate-600">{earn.specialization}</td>
                                <td className="p-4 text-sm font-semibold text-slate-600">LKR {parseFloat(earn.consultation_fee).toLocaleString()}</td>
                                <td className="p-4 text-sm font-bold text-slate-700 text-center">{earn.total_appointments || 0}</td>
                                <td className="p-4 text-sm font-bold text-blue-600 text-center">{earn.completed_appointments || 0}</td>
                                <td className="p-4 text-sm font-bold text-rose-500 text-center">{earn.canceled_appointments || 0}</td>
                                <td className="p-4 px-6 text-sm font-black text-slate-800 text-right">LKR {parseFloat(earn.total_earnings).toLocaleString()}</td>
                              </tr>
                            ))}
                            {filteredEarnings.length === 0 && (
                              <tr><td colSpan="7" className="p-10 text-center text-slate-500 font-medium">No doctors match your search.</td></tr>
                            )}
                          </tbody>
                        </table>
                     </div>
                  </div>
                </>
              )}

              {/* DOCTORS TAB */}
              {activeTab === 'Doctors' && (
                <>
                  {/* Search and Filter for Doctors Tab */}
                  <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                      <h3 className="text-[15px] font-bold text-slate-700 mb-2">
                        Search doctors
                        {doctorSearchQuery && (
                          <span className="ml-2 text-xs font-normal text-blue-500">
                            — {filteredDoctors.length} result{filteredDoctors.length !== 1 ? 's' : ''} found
                          </span>
                        )}
                      </h3>
                      <div className="flex items-center gap-3">
                        <div className="relative w-full md:w-[380px]">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
                          <input 
                            type="text" 
                            placeholder="Search name / specialization / email"
                            value={doctorSearchQuery}
                            onChange={(e) => setDoctorSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-10 py-3 rounded-full border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-sm text-sm font-medium text-slate-700 placeholder-slate-400 bg-white"
                          />
                          {doctorSearchQuery && (
                            <button
                              onClick={() => setDoctorSearchQuery('')}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-white p-1.5 rounded-full border border-slate-200 shadow-sm">
                      <button 
                        onClick={() => setDoctorStatusFilter('All')}
                        className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                          doctorStatusFilter === 'All' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        All
                      </button>
                      <button 
                        onClick={() => setDoctorStatusFilter('Available')}
                        className={`px-5 py-2 rounded-full text-sm font-bold transition-all border ${
                          doctorStatusFilter === 'Available' 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm' 
                            : 'border-transparent text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        Available
                      </button>
                      <button 
                        onClick={() => setDoctorStatusFilter('Unavailable')}
                        className={`px-5 py-2 rounded-full text-sm font-bold transition-all border ${
                          doctorStatusFilter === 'Unavailable' 
                            ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-sm' 
                            : 'border-transparent text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        Unavailable
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-sm border border-blue-100 overflow-hidden">
                    <div className="p-5 border-b border-blue-50 flex items-center justify-between">
                      <h3 className="text-xl font-extrabold text-slate-800">Doctor Management</h3>
                      <button
                        onClick={() => setShowAddDoctor(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                        Add Doctor
                      </button>
                    </div>
                  <div className="bg-[#f2fcf8]/50 p-6 rounded-3xl border border-emerald-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-5">
                      {filteredDoctors.map(doctor => (
                        <div 
                          key={doctor.id} 
                          onClick={() => setSelectedDoctor(doctor)}
                          className="bg-[#eafff5] rounded-[1.2rem] p-5 shadow-sm border border-emerald-100/50 hover:shadow-md hover:border-emerald-300 hover:bg-[#e0fcf0] cursor-pointer transition-all flex flex-col gap-4 relative"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex gap-4">
                              <div className="w-[70px] h-[70px] rounded-2xl bg-white flex items-center justify-center text-teal-700 font-bold overflow-hidden border border-emerald-100 flex-shrink-0 shadow-inner">
                                 <img src={`http://localhost:5000/api/users/profile-image/${doctor.id}?t=${Date.now()}`} alt={doctor.full_name} className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.parentNode.innerHTML = doctor.full_name.charAt(0); }} />
                              </div>
                              <div className="flex flex-col justify-center">
                                <div className="flex items-center gap-3 mb-1 flex-wrap">
                                  <h4 className="font-extrabold text-[#1a5b4c] text-[17px]">Dr. {doctor.full_name}</h4>
                                  <span className={`flex items-center gap-1.5 text-[11px] font-bold ${doctor.is_available ? 'text-emerald-600' : 'text-rose-500'}`}>
                                    <span className={`w-2 h-2 rounded-full ${doctor.is_available ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                    {doctor.is_available ? 'Available' : 'Unavailable'}
                                  </span>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${doctor.is_approved ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'}`}>
                                    {doctor.is_approved ? 'APPROVED' : 'SUSPENDED'}
                                  </span>
                                </div>
                                <p className="text-[#2c7a65] text-[13px] font-semibold">{doctor.specialization} • {parseInt(doctor.experience) || 0} years</p>
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-end gap-1">
                              <div className="flex items-center gap-1 text-[#1a5b4c] font-bold text-sm mt-1">
                                 <span className="text-emerald-500">⭐</span> {doctor.average_rating ? Number(doctor.average_rating).toFixed(1) : '0.0'}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center flex-wrap justify-between mt-1 ml-[86px]">
                            <div className="flex items-center gap-2 text-teal-600/80 text-[13px] font-bold">
                              <span>Patients</span>
                              <span className="flex items-center gap-1 text-[#1a5b4c]">
                                <Users size={14} className="text-[#2c7a65]" /> {doctor.total_patients || 0}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-[#1a5b4c] font-extrabold text-[14px]">
                              <span className="text-[#1a5b4c] font-bold">Fees :</span>
                              <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-emerald-100 shadow-sm text-[#2c7a65]">
                                LKR {doctor.consultation_fee ? parseFloat(doctor.consultation_fee).toLocaleString() : '0'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {filteredDoctors.length === 0 && (
                        <div className="col-span-full p-10 text-center text-[#2c7a65] font-medium bg-white rounded-2xl border border-emerald-100 border-dashed">
                          No doctors match your search.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                </>
              )}

              {/* PATIENTS TAB */}
              {activeTab === 'Patients' && (
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-sm border border-blue-100 overflow-hidden">
                  <div className="p-5 border-b border-blue-50">
                    <h3 className="text-xl font-extrabold text-slate-800">Registered Patients</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-blue-50/50 border-b border-blue-100 text-blue-800 text-[11px] uppercase tracking-widest">
                          <th className="p-4 px-6 font-bold">Patient Name</th>
                          <th className="p-4 font-bold">Email</th>
                          <th className="p-4 font-bold">Mobile</th>
                          <th className="p-4 font-bold">Blood Group</th>
                          <th className="p-4 px-6 font-bold">Joined Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-blue-50">
                        {patients.map(patient => (
                          <tr key={patient.id} className="hover:bg-blue-50/30 transition-colors">
                            <td className="p-4 px-6 font-bold text-slate-700">{patient.full_name}</td>
                            <td className="p-4 text-sm text-slate-600 font-medium">{patient.email}</td>
                            <td className="p-4 text-sm text-slate-600 font-medium">{patient.mobile_number || 'N/A'}</td>
                            <td className="p-4">
                              <span className="inline-block px-3 py-1 bg-rose-50 text-rose-600 border border-rose-100 rounded-full text-xs font-bold">
                                {patient.blood_group || 'N/A'}
                              </span>
                            </td>
                            <td className="p-4 px-6 text-slate-500 text-xs font-medium uppercase tracking-wider">
                              {new Date(patient.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                        {patients.length === 0 && (
                          <tr><td colSpan="5" className="p-8 text-center text-slate-500">No patients registered yet.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* APPOINTMENTS TAB */}
              {activeTab === 'Appointments' && (
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-sm border border-blue-100 overflow-hidden">
                  <div className="p-5 border-b border-blue-50">
                    <h3 className="text-xl font-extrabold text-slate-800">All Appointments</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-blue-50/50 border-b border-blue-100 text-blue-800 text-[11px] uppercase tracking-widest">
                          <th className="p-4 px-6 font-bold">Patient</th>
                          <th className="p-4 font-bold">Doctor</th>
                          <th className="p-4 font-bold">Date & Time</th>
                          <th className="p-4 font-bold">Status</th>
                          <th className="p-4 px-6 font-bold">Reason</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-blue-50">
                        {appointments.map(appt => (
                          <tr key={appt.id} className="hover:bg-blue-50/30 transition-colors">
                            <td className="p-4 px-6 font-bold text-slate-700">{appt.patient_name}</td>
                            <td className="p-4 font-bold text-slate-700">{appt.doctor_name}</td>
                            <td className="p-4 text-sm text-slate-600 font-medium">
                              {new Date(appt.date).toLocaleDateString()} at {appt.time}
                            </td>
                            <td className="p-4">
                              <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                appt.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                                appt.status === 'Cancelled' ? 'bg-rose-100 text-rose-700' :
                                'bg-amber-100 text-amber-700'
                              }`}>
                                {appt.status}
                              </span>
                            </td>
                            <td className="p-4 px-6 text-sm text-slate-500 font-medium max-w-xs truncate">{appt.reason || 'N/A'}</td>
                          </tr>
                        ))}
                        {appointments.length === 0 && (
                          <tr><td colSpan="5" className="p-8 text-center text-slate-500">No appointments scheduled yet.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* EARNINGS TAB */}
              {activeTab === 'Earnings' && (
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-sm border border-blue-100 overflow-hidden">
                  <div className="p-6 border-b border-blue-100 bg-blue-50/30">
                    <h3 className="text-xl font-extrabold text-blue-800 flex items-center gap-2">
                      <DollarSign size={24} /> Detailed Revenue Tracking
                    </h3>
                    <p className="text-sm font-medium text-blue-600 mt-1">Based on completed appointments and consultation fees.</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-white border-b border-blue-100 text-blue-800 text-[11px] uppercase tracking-widest">
                          <th className="p-4 px-6 font-bold">Doctor Name</th>
                          <th className="p-4 font-bold">Specialization</th>
                          <th className="p-4 font-bold text-right">Fee (LKR)</th>
                          <th className="p-4 font-bold text-right">Completed Appts</th>
                          <th className="p-4 px-6 font-bold text-right">Total Earnings (LKR)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-blue-50">
                        {earnings.map(earn => (
                          <tr key={earn.doctor_id} className="hover:bg-blue-50/30 transition-colors">
                            <td className="p-4 px-6 font-bold text-slate-700">{earn.doctor_name}</td>
                            <td className="p-4 text-sm text-slate-600 font-medium">{earn.specialization}</td>
                            <td className="p-4 text-right text-sm text-slate-600 font-medium">{parseFloat(earn.consultation_fee).toLocaleString()}</td>
                            <td className="p-4 text-right font-bold text-slate-700">{earn.completed_appointments}</td>
                            <td className="p-4 px-6 text-right font-black text-blue-600">
                              {parseFloat(earn.total_earnings).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                        {earnings.length === 0 && (
                          <tr><td colSpan="5" className="p-8 text-center text-slate-500">No earning data available.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* MEDICAL SERVICES TAB */}
              {activeTab === 'Medical Services' && (
                <AdminServices />
              )}

            </div>
          )}
        </div>
      </main>
      {showAddDoctor && (
        <AddDoctorModal
          token={token}
          onClose={() => setShowAddDoctor(false)}
          onSuccess={() => { fetchDoctors(); setShowAddDoctor(false); }}
        />
      )}

      {/* Selected Doctor Details Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="relative h-32 bg-gradient-to-r from-emerald-500 to-teal-600">
              <button 
                onClick={() => setSelectedDoctor(null)}
                className="absolute top-4 right-4 text-white hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="px-8 pb-8">
              <div className="flex justify-between items-start mb-6">
                <div className="w-24 h-24 rounded-2xl bg-white border-4 border-white shadow-lg overflow-hidden flex-shrink-0 flex items-center justify-center text-teal-700 font-bold text-3xl -mt-12 relative z-10">
                  <img src={`http://localhost:5000/api/users/profile-image/${selectedDoctor.id}?t=${Date.now()}`} alt={selectedDoctor.full_name} className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.parentNode.innerHTML = selectedDoctor.full_name.charAt(0); }} />
                </div>
                
                {/* Toggle Switch */}
                <div className="flex flex-col items-end gap-2 mt-4">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Account Status</span>
                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleApproveDoctor(selectedDoctor.id, selectedDoctor.is_approved)}>
                    <div className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${selectedDoctor.is_approved ? 'bg-blue-500' : 'bg-rose-200'}`}>
                      <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-300 ${selectedDoctor.is_approved ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </div>
                    <span className={`text-sm font-black uppercase tracking-wider ${selectedDoctor.is_approved ? 'text-blue-600' : 'text-rose-500'}`}>
                      {selectedDoctor.is_approved ? 'Approved' : 'Suspended'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-black text-slate-800">Dr. {selectedDoctor.full_name}</h3>
                <p className="text-teal-600 font-bold text-sm mt-1">{selectedDoctor.specialization}</p>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Experience</p>
                    <p className="text-slate-800 font-semibold">{parseInt(selectedDoctor.experience) || 0} Years</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Consultation Fee</p>
                    <p className="text-slate-800 font-semibold">LKR {selectedDoctor.consultation_fee ? parseFloat(selectedDoctor.consultation_fee).toLocaleString() : '0'}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Email</p>
                    <p className="text-slate-800 font-semibold text-sm truncate" title={selectedDoctor.email}>{selectedDoctor.email}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Phone</p>
                    <p className="text-slate-800 font-semibold text-sm">{selectedDoctor.mobile_number || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={() => handleDeleteDoctor(selectedDoctor)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-bold transition-colors"
                >
                  <Trash2 size={18} />
                  Remove Doctor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {doctorToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Remove Doctor?</h3>
            <p className="text-slate-500 font-medium text-sm mb-6">
              Are you sure you want to permanently delete <strong>Dr. {doctorToDelete.full_name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDoctorToDelete(null)}
                className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteDoctor}
                className="flex-1 px-4 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold transition-colors shadow-sm shadow-rose-200"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
