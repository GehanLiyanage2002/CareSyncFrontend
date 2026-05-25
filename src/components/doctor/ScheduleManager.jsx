import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { CalendarDays, Clock, Save, Trash2, Settings } from 'lucide-react';

const ScheduleManager = () => {
  const { token } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    day_of_week: '1', // Default to Monday
    start_time: '08:00',
    end_time: '17:00',
    slot_duration_minutes: '15'
  });

  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const daysOfWeek = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ];

  const fetchSchedules = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/doctor/schedule', {
        headers: { Authorization: token }
      });
      if (res.data.success) {
        setSchedules(res.data.schedule || []);
      }
    } catch (error) {
      console.error("Failed to fetch schedules", error);
      toast.error("Could not load your schedules.");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchSchedules();
    }
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (formData.start_time >= formData.end_time) {
      return toast.error("End time must be after start time");
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/doctor/schedule', {
        day_of_week: parseInt(formData.day_of_week),
        start_time: formData.start_time,
        end_time: formData.end_time,
        slot_duration_minutes: parseInt(formData.slot_duration_minutes)
      }, {
        headers: { Authorization: token }
      });
      
      toast.success('Schedule updated successfully!');
      fetchSchedules(); // Refresh the list
    } catch (error) {
      console.error("Failed to save schedule", error);
      toast.error(error.response?.data?.message || "Failed to update schedule");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mt-8">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
        <Settings className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-bold text-slate-800">Weekly Schedule Manager</h3>
      </div>
      
      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form Section */}
        <div className="lg:col-span-1 border-b lg:border-b-0 lg:border-r border-slate-100 pb-8 lg:pb-0 lg:pr-8">
          <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-5">Set Working Hours</h4>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Day of Week */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Day of the Week</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarDays size={18} className="text-slate-400" />
                </div>
                <select
                  name="day_of_week"
                  value={formData.day_of_week}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors appearance-none"
                  required
                >
                  {daysOfWeek.map(day => (
                    <option key={day.value} value={day.value}>{day.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Start Time</label>
                <input
                  type="time"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">End Time</label>
                <input
                  type="time"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Slot Duration */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Consultation Duration</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock size={18} className="text-slate-400" />
                </div>
                <select
                  name="slot_duration_minutes"
                  value={formData.slot_duration_minutes}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors appearance-none"
                  required
                >
                  <option value="15">15 Minutes</option>
                  <option value="30">30 Minutes</option>
                  <option value="45">45 Minutes</option>
                  <option value="60">60 Minutes</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500/20 transition-all shadow-sm active:scale-95 disabled:opacity-70"
            >
              <Save size={18} />
              {loading ? 'Saving...' : 'Save Schedule'}
            </button>
          </form>
        </div>

        {/* Current Schedule List */}
        <div className="lg:col-span-2">
          <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-5">Your Configured Days</h4>
          
          {fetching ? (
            <div className="flex justify-center py-10 text-slate-400">Loading schedules...</div>
          ) : schedules.length === 0 ? (
            <div className="text-center py-12 px-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
              <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">No schedule configured yet.</p>
              <p className="text-sm text-slate-400 mt-1">Set your working hours for each day using the form to start receiving appointments automatically.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {schedules.map((schedule) => (
                <div key={schedule.id} className="bg-slate-50 rounded-2xl p-5 border border-slate-100 hover:border-indigo-100 hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start mb-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-bold bg-indigo-100 text-indigo-700">
                      {daysOfWeek.find(d => d.value === schedule.day_of_week)?.label}
                    </span>
                    <span className="text-xs font-semibold text-slate-400 bg-white px-2 py-1 rounded border border-slate-200 shadow-sm">
                      {schedule.slot_duration_minutes}m slots
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-slate-700 font-medium mt-2">
                    <Clock size={16} className="text-indigo-400" />
                    <span>{schedule.start_time.substring(0,5)}</span>
                    <span className="text-slate-400">-</span>
                    <span>{schedule.end_time.substring(0,5)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default ScheduleManager;
