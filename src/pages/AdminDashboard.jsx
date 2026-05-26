import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  LayoutDashboard, Users, UserRound, Calendar, DollarSign, 
  LogOut, Activity, TrendingUp, CheckCircle, XCircle 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { logout } from '../features/auth/authSlice';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [stats, setStats] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const fetchStats = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/stats', config);
      setStats(res.data.stats);
    } catch (err) {
      console.error(err);
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
      const res = await axios.get('http://localhost:5000/api/admin/earnings', config);
      setEarnings(res.data.earnings);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (activeTab === 'Overview') await fetchStats();
      if (activeTab === 'Doctors') await fetchDoctors();
      if (activeTab === 'Patients') await fetchPatients();
      if (activeTab === 'Appointments') await fetchAppointments();
      if (activeTab === 'Earnings') await fetchEarnings();
      setLoading(false);
    };
    loadData();
  }, [activeTab]);

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
    } catch (err) {
      toast.error('Failed to update doctor status');
      console.error(err);
    }
  };

  const navItems = [
    { name: 'Overview', icon: <LayoutDashboard size={20} /> },
    { name: 'Doctors', icon: <UserRound size={20} /> },
    { name: 'Patients', icon: <Users size={20} /> },
    { name: 'Appointments', icon: <Calendar size={20} /> },
    { name: 'Earnings', icon: <DollarSign size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-800 shadow-xl flex flex-col z-20">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 p-2 rounded-xl text-white shadow-lg shadow-indigo-200 dark:shadow-none">
              <Activity size={24} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
              Admin Portal
            </h1>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                activeTab === item.name
                  ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {item.icon}
              {item.name}
            </button>
          ))}
        </nav>
        
        <div className="p-4 border-t border-slate-100 dark:border-slate-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors font-medium"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 relative">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-100 dark:bg-indigo-900/20 rounded-full filter blur-3xl opacity-50 -z-10 mix-blend-multiply"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-100 dark:bg-purple-900/20 rounded-full filter blur-3xl opacity-50 -z-10 mix-blend-multiply"></div>

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white">{activeTab}</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage system {activeTab.toLowerCase()} and view reports.</p>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'Overview' && stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { title: 'Total Patients', value: stats.totalPatients, icon: <UserRound size={24} />, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
                  { title: 'Total Doctors', value: stats.totalDoctors, icon: <Users size={24} />, color: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
                  { title: 'Total Appointments', value: stats.totalAppointments, icon: <Calendar size={24} />, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
                  { title: 'Total Revenue', value: `LKR ${stats.totalRevenue.toLocaleString()}`, icon: <TrendingUp size={24} />, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-6 rounded-3xl shadow-lg border border-slate-200/50 dark:border-slate-700/50">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                        {stat.icon}
                      </div>
                      <h3 className="text-slate-500 dark:text-slate-400 font-medium">{stat.title}</h3>
                    </div>
                    <p className="text-3xl font-bold text-slate-800 dark:text-white">{stat.value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* DOCTORS TAB */}
            {activeTab === 'Doctors' && (
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wider">
                        <th className="p-4 font-semibold">Doctor Name</th>
                        <th className="p-4 font-semibold">Email</th>
                        <th className="p-4 font-semibold">Specialization</th>
                        <th className="p-4 font-semibold">Status</th>
                        <th className="p-4 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {doctors.map(doctor => (
                        <tr key={doctor.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="p-4">
                            <p className="font-semibold text-slate-800 dark:text-white">{doctor.full_name}</p>
                            <p className="text-sm text-slate-500">{doctor.mobile_number || 'No phone'}</p>
                          </td>
                          <td className="p-4 text-slate-600 dark:text-slate-300">{doctor.email}</td>
                          <td className="p-4 text-slate-600 dark:text-slate-300">
                            <p>{doctor.specialization}</p>
                            <p className="text-sm text-slate-500">{doctor.experience} Exp.</p>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                              doctor.is_approved 
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                            }`}>
                              {doctor.is_approved ? <CheckCircle size={14} /> : <XCircle size={14} />}
                              {doctor.is_approved ? 'Approved' : 'Pending'}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleApproveDoctor(doctor.id, doctor.is_approved)}
                              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                                doctor.is_approved 
                                  ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40' 
                                  : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40'
                              }`}
                            >
                              {doctor.is_approved ? 'Suspend' : 'Approve'}
                            </button>
                          </td>
                        </tr>
                      ))}
                      {doctors.length === 0 && (
                        <tr><td colSpan="5" className="p-8 text-center text-slate-500">No doctors registered yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* PATIENTS TAB */}
            {activeTab === 'Patients' && (
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wider">
                        <th className="p-4 font-semibold">Patient Name</th>
                        <th className="p-4 font-semibold">Email</th>
                        <th className="p-4 font-semibold">Mobile</th>
                        <th className="p-4 font-semibold">Blood Group</th>
                        <th className="p-4 font-semibold">Joined Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {patients.map(patient => (
                        <tr key={patient.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="p-4 font-semibold text-slate-800 dark:text-white">{patient.full_name}</td>
                          <td className="p-4 text-slate-600 dark:text-slate-300">{patient.email}</td>
                          <td className="p-4 text-slate-600 dark:text-slate-300">{patient.mobile_number || 'N/A'}</td>
                          <td className="p-4">
                            <span className="inline-block px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full text-xs font-bold">
                              {patient.blood_group || 'N/A'}
                            </span>
                          </td>
                          <td className="p-4 text-slate-500 text-sm">
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
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wider">
                        <th className="p-4 font-semibold">Patient</th>
                        <th className="p-4 font-semibold">Doctor</th>
                        <th className="p-4 font-semibold">Date & Time</th>
                        <th className="p-4 font-semibold">Status</th>
                        <th className="p-4 font-semibold">Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {appointments.map(appt => (
                        <tr key={appt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="p-4 font-medium text-slate-800 dark:text-white">{appt.patient_name}</td>
                          <td className="p-4 font-medium text-slate-800 dark:text-white">{appt.doctor_name}</td>
                          <td className="p-4 text-slate-600 dark:text-slate-300">
                            {new Date(appt.date).toLocaleDateString()} at {appt.time}
                          </td>
                          <td className="p-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              appt.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                              appt.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {appt.status}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-slate-500 max-w-xs truncate">{appt.reason || 'N/A'}</td>
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
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-emerald-50 dark:bg-emerald-900/10">
                  <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
                    <DollarSign size={20} /> Doctor Revenue Tracking
                  </h3>
                  <p className="text-sm text-emerald-600 dark:text-emerald-500 mt-1">Based on completed appointments and consultation fees.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wider">
                        <th className="p-4 font-semibold">Doctor Name</th>
                        <th className="p-4 font-semibold">Specialization</th>
                        <th className="p-4 font-semibold text-right">Fee (LKR)</th>
                        <th className="p-4 font-semibold text-right">Completed Appts</th>
                        <th className="p-4 font-semibold text-right">Total Earnings (LKR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {earnings.map(earn => (
                        <tr key={earn.doctor_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="p-4 font-semibold text-slate-800 dark:text-white">{earn.doctor_name}</td>
                          <td className="p-4 text-slate-600 dark:text-slate-300">{earn.specialization}</td>
                          <td className="p-4 text-right text-slate-600 dark:text-slate-300">{parseFloat(earn.consultation_fee).toLocaleString()}</td>
                          <td className="p-4 text-right font-medium text-slate-800 dark:text-white">{earn.completed_appointments}</td>
                          <td className="p-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
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

          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
