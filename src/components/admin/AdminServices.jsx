import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Plus, Edit2, CheckCircle, XCircle, Settings, Calendar, Clock, MapPin, AlignLeft, Trash2, AlertTriangle, PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminServices = () => {
  const { token } = useSelector(state => state.auth);
  const [services, setServices] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentService, setCurrentService] = useState({ name: '', price: '', description: '', location: '' });
  const [showForm, setShowForm] = useState(false);
  
  // Avatar state
  const fileInputRef = React.useRef(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Schedule Manager State
  const [schedules, setSchedules] = useState([]);
  const [newSchedule, setNewSchedule] = useState({ schedule_date: '', start_time: '', end_time: '', slot_duration_minutes: '15' });

  const fetchServices = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/services', {
        headers: { Authorization: token }
      });
      if (res.data.success) {
        setServices(res.data.services);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to load services');
    }
  };

  const fetchSchedules = async (serviceId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/services/${serviceId}/schedules`, {
        headers: { Authorization: token }
      });
      if (res.data.success) {
        setSchedules(res.data.schedules);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [token]);

  const handleAvatarPick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('Image must be less than 10MB'); return; }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const uploadAvatar = async (serviceId) => {
    if (!avatarFile) return;
    const fd = new FormData();
    fd.append('image', avatarFile);
    setUploadingImage(true);
    try {
      await axios.put(`http://localhost:5000/api/services/${serviceId}/image`, fd, {
        headers: { Authorization: token, 'Content-Type': 'multipart/form-data' }
      });
    } catch (err) {
      toast.error('Service photo upload failed.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveInfo = async (e) => {
    e.preventDefault();
    if (!currentService.name) {
      toast.error('Please provide a service name');
      return;
    }

    try {
      if (isEditing) {
        const res = await axios.put(`http://localhost:5000/api/services/${currentService.id}`, {
          name: currentService.name,
          description: currentService.description,
          location: currentService.location,
          price: Number(currentService.price || 0),
          is_available: currentService.is_available !== undefined ? currentService.is_available : currentService.isAvailable
        }, { headers: { Authorization: token } });
        
        if (res.data.success) {
          toast.success('Service info updated');
          fetchServices();
        }
      } else {
        const res = await axios.post('http://localhost:5000/api/services', {
          name: currentService.name,
          description: currentService.description,
          location: currentService.location,
          price: 0
        }, { headers: { Authorization: token } });
        
        if (res.data.success) {
          toast.success('Service info created. You can now set the fee and schedule.');
          fetchServices();
          setCurrentService({
            ...res.data.service,
            isAvailable: res.data.service.is_available
          });
          setIsEditing(true);
          
          if (avatarFile) {
            await uploadAvatar(res.data.service.id);
            fetchServices();
          }
        }
      }
    } catch (error) {
      console.error('Error saving service info:', error);
      toast.error(error.response?.data?.message || 'Failed to save info');
    }
  };

  const handleSaveFee = async (e) => {
    e.preventDefault();
    if (!isEditing) return;
    
    try {
      const res = await axios.put(`http://localhost:5000/api/services/${currentService.id}`, {
        name: currentService.name,
        description: currentService.description,
        location: currentService.location,
        price: Number(currentService.price || 0),
        is_available: currentService.is_available !== undefined ? currentService.is_available : currentService.isAvailable
      }, { headers: { Authorization: token } });
      
      if (res.data.success) {
        toast.success('Fee updated successfully');
        fetchServices();
        closeForm();
      }
    } catch (error) {
      console.error('Error saving fee:', error);
      toast.error('Failed to save fee');
    }
  };

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    if (!newSchedule.schedule_date || !newSchedule.start_time || !newSchedule.end_time || !newSchedule.slot_duration_minutes) {
      toast.error('Please fill all schedule fields');
      return;
    }
    try {
      const res = await axios.post(`http://localhost:5000/api/services/${currentService.id}/schedules`, newSchedule, {
        headers: { Authorization: token }
      });
      if (res.data.success) {
        toast.success('Schedule added successfully');
        fetchSchedules(currentService.id);
        setNewSchedule({ schedule_date: '', start_time: '', end_time: '', slot_duration_minutes: '15' });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add schedule');
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    try {
      const res = await axios.delete(`http://localhost:5000/api/services/schedules/${scheduleId}`, {
        headers: { Authorization: token }
      });
      if (res.data.success) {
        toast.success('Schedule removed');
        fetchSchedules(currentService.id);
      }
    } catch (error) {
      toast.error('Failed to remove schedule');
    }
  };

  const handleEdit = (service) => {
    setCurrentService({
      ...service,
      isAvailable: service.is_available,
      description: service.description || '',
      location: service.location || '',
      price: service.price || ''
    });
    setAvatarPreview(`http://localhost:5000/api/services/${service.id}/image?t=${Date.now()}`);
    setAvatarFile(null);
    setIsEditing(true);
    setShowForm(true);
    fetchSchedules(service.id);
  };

  const closeForm = () => {
    setShowForm(false);
    setIsEditing(false);
    setCurrentService({ name: '', price: '', description: '', location: '' });
    setSchedules([]);
    setNewSchedule({ schedule_date: '', start_time: '', end_time: '', slot_duration_minutes: '15' });
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const toggleAvailability = async (id, currentStatus) => {
    try {
      const service = services.find(s => s.id === id);
      const res = await axios.put(`http://localhost:5000/api/services/${id}`, {
        name: service.name,
        description: service.description,
        location: service.location,
        price: service.price,
        is_available: !currentStatus
      }, { headers: { Authorization: token } });
      
      if (res.data.success) {
        toast.success('Status updated');
        fetchServices();
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-6">
      {!showForm && (
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Settings className="text-indigo-600 dark:text-indigo-400" /> Medical Services Management
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Add, edit and manage availability & schedules of medical services.</p>
          </div>
          <button 
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm shadow-indigo-200 dark:shadow-none"
          >
            <Plus size={16} /> Add Service
          </button>
        </div>
      )}

      {showForm && (
        <div className="mb-10 space-y-8 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
          
          <div className="flex justify-between items-start mb-2">
            <div>
              <h2 className="text-[22px] font-extrabold text-slate-800">{isEditing ? 'Edit Service' : 'Add New Service'}</h2>
              <p className="text-[13px] text-slate-500 mt-1">Fill in the service's profile, schedule, and consultation fee details.</p>
            </div>
            <button 
              onClick={closeForm}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-full text-[13px] font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <XCircle size={15} className="text-slate-400" /> Cancel
            </button>
          </div>

          {/* GENERAL INFO FORM */}
          <form onSubmit={handleSaveInfo} className="bg-white p-6 rounded-[20px] border border-slate-200 shadow-sm">
            <h3 className="text-[16px] font-bold text-[#1f2937] mb-6">Basic Information</h3>
            
            <div className="flex items-center gap-4 mb-8">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-bold shadow-inner overflow-hidden border-2 border-white">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.parentNode.innerHTML = '<span>' + (currentService.name ? currentService.name.charAt(0).toUpperCase() : 'S') + '</span>'; }} />
                  ) : (
                    <span>{currentService.name ? currentService.name.charAt(0).toUpperCase() : 'S'}</span>
                  )}
                </div>
                <button type="button"
                  className="absolute bottom-0 right-[-4px] p-1.5 bg-white rounded-full shadow-md border border-slate-200 text-slate-600 hover:text-blue-600 transition-colors"
                  title="Upload Photo">
                  {uploadingImage ? <svg className="animate-spin h-3.5 w-3.5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>}
                </button>
                <input type="file" ref={fileInputRef} onChange={handleAvatarPick}
                  accept="image/png, image/jpeg" className="hidden" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-[14px]">{currentService.name || 'New Service'}</h4>
                <p className="text-[12px] text-slate-400 font-medium">Service Account</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Click the camera icon to upload a photo</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Service Name *</label>
                  <input 
                    type="text" 
                    value={currentService.name}
                    onChange={e => setCurrentService({...currentService, name: e.target.value})}
                    placeholder="e.g. Full Body Checkup" 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-[14px]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Clinic Location</label>
                  <input 
                    type="text" 
                    value={currentService.location}
                    onChange={e => setCurrentService({...currentService, location: e.target.value})}
                    placeholder="e.g. Ground Floor, Room 102" 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-[14px]"
                  />
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">About this Service</label>
                  <textarea 
                    value={currentService.description}
                    onChange={e => setCurrentService({...currentService, description: e.target.value})}
                    placeholder="Describe the medical service..." 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-[14px] h-[106px] resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button type="submit" className="px-6 py-2.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-xl text-[14px] font-semibold shadow-sm transition-colors">
                {isEditing ? 'Save Details' : 'Create Service Account'}
              </button>
            </div>
          </form>

          {/* SCHEDULE MANAGER */}
          <div className="bg-white p-6 rounded-[20px] border border-slate-200 shadow-sm">
            <h3 className="text-[18px] font-bold text-[#1f2937] mb-5">Schedule Manager</h3>
            
            {!isEditing && (
              <div className="bg-[#fffbeb] border border-[#fef08a] rounded-xl p-3 mb-6 flex items-center gap-2">
                <AlertTriangle size={18} className="text-[#f59e0b]" />
                <span className="text-[13px] font-medium text-[#b45309]">Create the service account above first, then save the schedule.</span>
              </div>
            )}
            
            <form onSubmit={handleAddSchedule}>
              <div className="bg-[#f8fafc] border border-slate-100 rounded-xl p-5 mb-5">
                <h5 className="flex items-center gap-2 text-[14px] font-bold text-slate-700 mb-4">
                  <Calendar size={16} className="text-blue-500" /> Working Day 1
                </h5>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Date</label>
                    <input 
                      type="date" 
                      value={newSchedule.schedule_date}
                      onChange={e => setNewSchedule({...newSchedule, schedule_date: e.target.value})}
                      className="w-full max-w-xl px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-[14px]"
                      required
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-6 max-w-xl">
                    <div className="flex-1">
                      <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Start Time</label>
                      <input 
                        type="time" 
                        value={newSchedule.start_time}
                        onChange={e => setNewSchedule({...newSchedule, start_time: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-[14px]"
                        required
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">End Time</label>
                      <input 
                        type="time" 
                        value={newSchedule.end_time}
                        onChange={e => setNewSchedule({...newSchedule, end_time: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-[14px]"
                        required
                      />
                    </div>
                  </div>

                  <div className="max-w-xl">
                    <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Appointment Slot Duration</label>
                    <select 
                      value={newSchedule.slot_duration_minutes}
                      onChange={e => setNewSchedule({...newSchedule, slot_duration_minutes: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-[14px] bg-white"
                      required
                    >
                      <option value="5">5 minutes per slot</option>
                      <option value="10">10 minutes per slot</option>
                      <option value="15">15 minutes per slot</option>
                      <option value="20">20 minutes per slot</option>
                      <option value="30">30 minutes per slot</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-center mb-6">
                <button type="submit" className="w-full border border-dashed border-slate-300 text-slate-500 hover:text-blue-600 hover:border-blue-400 py-3 rounded-xl flex items-center justify-center gap-2 text-[14px] font-semibold transition-colors bg-white">
                  <Plus size={16} /> Add Schedule Day
                </button>
              </div>
            </form>

            {schedules.length > 0 && (
              <div className="mt-6 mb-6">
                <h5 className="font-bold text-slate-700 text-sm mb-3">Saved Schedules</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {schedules.map(sch => (
                    <div key={sch.id} className="p-4 bg-[#f8fafc] border border-slate-200 rounded-xl flex justify-between items-center group">
                      <div>
                        <p className="font-bold text-slate-800 text-[14px]">{sch.schedule_date}</p>
                        <p className="text-[13px] text-slate-500 font-medium">{sch.start_time} - {sch.end_time}</p>
                        <span className="text-[11px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full mt-1 inline-block">{sch.slot_duration_minutes}m slots</span>
                      </div>
                      <button 
                        onClick={() => handleDeleteSchedule(sch.id)}
                        className="p-2 text-rose-500 hover:bg-rose-100 rounded-lg transition-colors"
                        title="Delete Schedule"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
          </div>

          {/* FEE MANAGER */}
          <div className="bg-white p-6 rounded-[20px] border border-slate-200 shadow-sm">
            <h3 className="text-[18px] font-bold text-[#1f2937] mb-5">Consultation Fee Manager</h3>
            
            {!isEditing && (
              <div className="bg-[#fffbeb] border border-[#fef08a] rounded-xl p-3 mb-6 flex items-center gap-2">
                <AlertTriangle size={18} className="text-[#f59e0b]" />
                <span className="text-[13px] font-medium text-[#b45309]">Create the service account above first, then set the fee.</span>
              </div>
            )}

            <form onSubmit={handleSaveFee}>
              <div className="max-w-md">
                <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Service Fee (Rs.)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[14px]">Rs.</span>
                  <input 
                    type="number"
                    value={currentService.price}
                    onChange={e => setCurrentService({...currentService, price: e.target.value})}
                    placeholder="1500"
                    min="0"
                    className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-200 bg-[#f8fafc] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-[15px] font-bold text-slate-700 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-between items-center mt-10 pt-4 border-t border-slate-100">
                <button type="button" onClick={closeForm} className="text-[14px] font-bold text-slate-500 hover:text-slate-800 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-xl text-[14px] font-semibold shadow-sm transition-colors">
                  Save Fee & Complete Setup
                </button>
              </div>
            </form>
          </div>

        </div>
      )}

      {/* SERVICES TABLE */}
      {!showForm && (
        <div className="overflow-x-auto bg-white rounded-[20px] border border-slate-100 shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-slate-100 text-slate-500 text-[11px] uppercase tracking-wider">
                <th className="p-4 font-bold">Service Details</th>
                <th className="p-4 font-bold text-right">Fee (LKR)</th>
                <th className="p-4 font-bold text-center">Status</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {services.map(service => (
                <tr key={service.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-[1rem] bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 font-black overflow-hidden shadow-sm flex-shrink-0">
                        <img 
                          src={`http://localhost:5000/api/services/${service.id}/image?t=${Date.now()}`} 
                          alt={service.name} 
                          className="w-full h-full object-cover" 
                          onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.parentNode.innerHTML = service.name.charAt(0).toUpperCase(); }} 
                        />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-[14px]">{service.name}</p>
                        <p className="text-[12px] text-slate-500 mt-0.5 max-w-md truncate">{service.description || 'No description'}</p>
                        <p className="text-[10px] font-bold text-indigo-500 mt-1 uppercase tracking-wider flex items-center gap-1">
                          <MapPin size={10}/> {service.location || 'Location Not Set'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-right font-black text-emerald-600">
                    {parseFloat(service.price).toLocaleString()}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      service.is_available 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {service.is_available ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(service)}
                      className="px-4 py-1.5 bg-[#f8fafc] text-blue-600 hover:bg-blue-50 border border-slate-200 rounded-lg transition-colors inline-flex items-center gap-1.5 font-bold text-xs shadow-sm"
                    >
                      <Edit2 size={13} /> Edit Details
                    </button>
                    <button
                      onClick={() => toggleAvailability(service.id, service.is_available)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm border ${
                        service.is_available 
                          ? 'bg-white text-rose-600 border-rose-200 hover:bg-rose-50' 
                          : 'bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                      }`}
                    >
                      {service.is_available ? 'Hide' : 'Show'}
                    </button>
                  </td>
                </tr>
              ))}
              {services.length === 0 && (
                <tr><td colSpan="4" className="p-12 text-center text-slate-500 font-medium">No medical services configured yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminServices;
