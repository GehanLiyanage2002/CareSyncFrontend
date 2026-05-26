import React, { useState, useEffect } from 'react';
import { LayoutDashboard, UserCircle, History, LogOut, Star } from 'lucide-react';
import DoctorProfileEdit from '../components/doctor/DoctorProfileEdit';
import DoctorKanbanBoard from '../components/doctor/DoctorKanbanBoard';
import AppointmentHistory from '../components/doctor/AppointmentHistory';
import DoctorReviews from '../components/doctor/DoctorReviews';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { useNavigate, useLocation } from 'react-router-dom';

const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState('kanban');
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Support navigating directly to a specific tab via location state (e.g. from Header dropdown)
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const navItems = [
    { id: 'kanban', label: 'Appointments Board', icon: LayoutDashboard },
    { id: 'history', label: 'Appointment History', icon: History },
    { id: 'reviews', label: 'My Reviews', icon: Star },
    { id: 'profile', label: 'My Profile', icon: UserCircle },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden font-sans text-gray-900 dark:text-gray-100">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 shadow-sm z-10">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md shadow-blue-200 dark:shadow-none">
              CS
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              CareSync
            </h1>
          </div>
        </div>

        <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Doctor Menu</p>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <item.icon size={20} className={activeTab === item.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 font-medium"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
        <header className="h-16 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md flex items-center px-8 z-10 sticky top-0 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {navItems.find(item => item.id === activeTab)?.label}
          </h2>
          <div className="ml-auto flex items-center gap-4">
            <div className="text-sm text-right hidden sm:block">
              <p className="font-semibold text-gray-900 dark:text-white">
                {user ? `Dr. ${user.full_name}` : 'Doctor'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">CareSync</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 border-2 border-white dark:border-gray-700 shadow-sm flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
              {user?.full_name ? user.full_name.charAt(0) : <UserCircle size={24} />}
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto h-full">
            {activeTab === 'profile' && <DoctorProfileEdit />}
            {activeTab === 'kanban' && <DoctorKanbanBoard />}
            {activeTab === 'history' && <AppointmentHistory />}
            {activeTab === 'reviews' && <DoctorReviews />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DoctorDashboard;
