import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { DollarSign, Save } from 'lucide-react';

const FeeManager = () => {
  const { token } = useSelector((state) => state.auth);
  const [fee, setFee] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchFee = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/doctor/profile', {
          headers: { Authorization: token }
        });
        if (res.data.success) {
          setFee(res.data.profile.consultation_fee || 1500);
        }
      } catch (error) {
        console.error("Failed to fetch profile", error);
      } finally {
        setFetching(false);
      }
    };
    if (token) {
      fetchFee();
    }
  }, [token]);

  const handleSave = async () => {
    if (!fee || isNaN(fee) || fee <= 0) {
      toast.error('Please enter a valid consultation fee');
      return;
    }
    
    setLoading(true);
    try {
      const res = await axios.put('http://localhost:5000/api/doctor/fee', 
        { fee: Number(fee) },
        { headers: { Authorization: token } }
      );
      if (res.data.success) {
        toast.success('Consultation fee updated successfully!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update consultation fee');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-gray-700/60 mt-8 transition-colors">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl">
          <DollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Consultation Fee Manager</h3>
      </div>

      <div className="flex flex-col sm:flex-row items-end gap-4 max-w-lg">
        <div className="w-full">
          <label className="block text-sm font-semibold text-slate-600 dark:text-gray-300 mb-2 uppercase tracking-wider">
            Consultation Fee (Rs.)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-slate-400 font-bold">Rs.</span>
            </div>
            <input
              type="number"
              min="0"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              className="block w-full pl-14 pr-4 py-3.5 bg-slate-50 dark:bg-gray-700/50 border border-slate-200 dark:border-gray-600 rounded-2xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-bold text-lg"
              placeholder="1500"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-md hover:shadow-lg disabled:opacity-70 active:scale-95 whitespace-nowrap text-lg"
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          ) : (
            <Save className="h-5 w-5" />
          )}
          <span>Save Fee</span>
        </button>
      </div>
    </div>
  );
};

export default FeeManager;
