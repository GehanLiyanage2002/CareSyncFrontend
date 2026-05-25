import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { CalendarDays, Clock, Save, Trash2, Settings, ChevronDown } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const ScheduleManager = () => {
  const { token } = useSelector((state) => state.auth);
  
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + ((1 + 7 - d.getDay()) % 7)); // Next Monday by default
    return d;
  });

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


  const getTimeDate = (timeStr) => {
    const [h, m] = timeStr.split(':');
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d;
  };

  const handleTimeChange = (date, field) => {
    if (!date) return;
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    setFormData({ ...formData, [field]: `${h}:${m}` });
  };

  const CustomTimeInput = React.forwardRef(({ value, onClick, label, isStart }, ref) => (
    <button
      type="button"
      className={`w-full relative flex items-center justify-between px-4 py-2.5 rounded-2xl border-2 transition-all ${isStart ? 'border-blue-500 bg-blue-50/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'border-slate-200 bg-white hover:border-slate-300'}`}
      onClick={onClick}
      ref={ref}
    >
      <div className="flex items-center gap-3">
        <Clock className={isStart ? "text-blue-500" : "text-slate-400"} size={22} strokeWidth={1.5} />
        <div className="flex flex-col items-start">
          <span className={`text-[11px] font-semibold ${isStart ? 'text-blue-500' : 'text-slate-500'}`}>{label}</span>
          <span className="text-base font-medium text-slate-700">{value || '00:00 AM'}</span>
        </div>
      </div>
      <ChevronDown className={isStart ? "text-blue-500" : "text-slate-400"} size={20} />
    </button>
  ));

  return (
    <div id="schedule-manager" className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mt-8 scroll-mt-24">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
        <Settings className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-bold text-slate-800">Weekly Schedule Manager</h3>
      </div>
      
      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form Section */}
        <div className="lg:col-span-1 border-b lg:border-b-0 lg:border-r border-slate-100 pb-8 lg:pb-0 lg:pr-8">
          <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-5">Set Working Hours</h4>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* React DatePicker Component */}
            <div className="space-y-2">
              <div className="flex justify-between items-end mb-1">
                <label className="text-sm font-medium text-slate-700">Select Date</label>
                <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-md">Applies Weekly</span>
              </div>
              <div className="relative">
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => {
                    setSelectedDate(date);
                    setFormData({ ...formData, day_of_week: date.getDay().toString() });
                  }}
                  dateFormat="EEEE, MMMM d"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors shadow-sm text-slate-700 font-medium cursor-pointer"
                  wrapperClassName="w-full"
                  popperPlacement="bottom-start"
                />
              </div>
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <DatePicker
                  selected={getTimeDate(formData.start_time)}
                  onChange={(date) => handleTimeChange(date, 'start_time')}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={30}
                  timeCaption="Time"
                  dateFormat="hh:mm aa"
                  customInput={<CustomTimeInput label="Start with" isStart={true} />}
                  wrapperClassName="w-full"
                  popperClassName="time-picker-popper"
                />
              </div>
              <div className="space-y-1">
                <DatePicker
                  selected={getTimeDate(formData.end_time)}
                  onChange={(date) => handleTimeChange(date, 'end_time')}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={30}
                  timeCaption="Time"
                  dateFormat="hh:mm aa"
                  customInput={<CustomTimeInput label="End with" isStart={false} />}
                  wrapperClassName="w-full"
                  popperClassName="time-picker-popper"
                />
              </div>
            </div>

            {/* Slot Duration */}
            <div className="space-y-1 mt-4">
              <div className="relative w-full">
                <select
                  name="slot_duration_minutes"
                  value={formData.slot_duration_minutes}
                  onChange={handleChange}
                  className="w-full h-full absolute top-0 left-0 opacity-0 cursor-pointer z-10"
                  required
                >
                  <option value="15">15 mins</option>
                  <option value="30">30 mins</option>
                  <option value="45">45 mins</option>
                  <option value="60">60 mins</option>
                </select>
                <div className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl border-2 border-slate-200 bg-white transition-colors relative z-0">
                  <div className="flex items-center gap-3">
                    <Clock className="text-slate-400" size={22} strokeWidth={1.5} />
                    <div className="flex flex-col items-start">
                      <span className="text-[11px] font-semibold text-slate-500">Duration</span>
                      <span className="text-base font-medium text-slate-700">{formData.slot_duration_minutes} mins</span>
                    </div>
                  </div>
                  <ChevronDown className="text-slate-400" size={20} />
                </div>
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
