import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Plus, Edit2, CheckCircle, XCircle, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminServices = () => {
  const { token } = useSelector(state => state.auth);
  const [services, setServices] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentService, setCurrentService] = useState({ name: '', price: '' });
  const [showForm, setShowForm] = useState(false);

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

  useEffect(() => {
    fetchServices();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentService.name || !currentService.price) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      if (isEditing) {
        const res = await axios.put(`http://localhost:5000/api/services/${currentService.id}`, {
          name: currentService.name,
          price: Number(currentService.price),
          is_available: currentService.is_available || currentService.isAvailable
        }, { headers: { Authorization: token } });
        
        if (res.data.success) {
          toast.success('Service updated successfully');
          fetchServices();
        }
      } else {
        const res = await axios.post('http://localhost:5000/api/services', {
          name: currentService.name,
          price: Number(currentService.price)
        }, { headers: { Authorization: token } });
        
        if (res.data.success) {
          toast.success('New service added');
          fetchServices();
        }
      }

      setCurrentService({ name: '', price: '' });
      setShowForm(false);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error(error.response?.data?.message || 'Failed to save service');
    }
  };

  const handleEdit = (service) => {
    setCurrentService({
      ...service,
      isAvailable: service.is_available
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const toggleAvailability = async (id, currentStatus) => {
    try {
      // Find the service to get name and price
      const service = services.find(s => s.id === id);
      const res = await axios.put(`http://localhost:5000/api/services/${id}`, {
        name: service.name,
        price: service.price,
        is_available: !currentStatus
      }, { headers: { Authorization: token } });
      
      if (res.data.success) {
        toast.success('Status updated');
        fetchServices();
      }
    } catch (error) {
      console.error('Error toggling availability:', error);
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Settings className="text-indigo-600 dark:text-indigo-400" /> Medical Services Management
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Add, edit and manage availability of medical services.</p>
        </div>
        <button 
          onClick={() => { setShowForm(!showForm); setIsEditing(false); setCurrentService({ name: '', price: '' }); }}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm shadow-indigo-200 dark:shadow-none"
        >
          {showForm ? 'Cancel' : <><Plus size={16} /> Add Service</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700">
          <h4 className="font-semibold text-slate-800 dark:text-white mb-4">{isEditing ? 'Edit Service' : 'Add New Service'}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Service Name</label>
              <input 
                type="text" 
                value={currentService.name}
                onChange={e => setCurrentService({...currentService, name: e.target.value})}
                placeholder="e.g. Blood Test" 
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Price (LKR)</label>
              <input 
                type="number" 
                value={currentService.price}
                onChange={e => setCurrentService({...currentService, price: e.target.value})}
                placeholder="e.g. 1500" 
                min="0"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white transition-colors"
                required
              />
            </div>
          </div>
          <button type="submit" className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-sm transition-colors">
            {isEditing ? 'Update Service' : 'Save Service'}
          </button>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wider">
              <th className="p-4 font-semibold">Service Name</th>
              <th className="p-4 font-semibold text-right">Price (LKR)</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {services.map(service => (
              <tr key={service.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="p-4 font-semibold text-slate-800 dark:text-white">{service.name}</td>
                <td className="p-4 text-right font-medium text-slate-600 dark:text-slate-300">{parseFloat(service.price).toLocaleString()}</td>
                <td className="p-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                    service.is_available 
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {service.is_available ? <CheckCircle size={14} /> : <XCircle size={14} />}
                    {service.is_available ? 'Available' : 'Unavailable'}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <button
                    onClick={() => toggleAvailability(service.id, service.is_available)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      service.is_available 
                        ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40' 
                        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40'
                    }`}
                  >
                    {service.is_available ? 'Mark Unavailable' : 'Mark Available'}
                  </button>
                  <button
                    onClick={() => handleEdit(service)}
                    className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 rounded-lg transition-colors inline-flex align-middle"
                    title="Edit Service"
                  >
                    <Edit2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {services.length === 0 && (
              <tr><td colSpan="4" className="p-8 text-center text-slate-500">No services added yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminServices;
