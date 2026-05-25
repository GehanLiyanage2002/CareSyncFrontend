import React, { useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { FileText, X, UploadCloud, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateMedicalReport = ({ isOpen, onClose, appointment }) => {
  const { token } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    title: '',
    symptoms: '',
    treatment_plan: '',
  });
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!validTypes.includes(selectedFile.type)) {
        toast.error('Only PDF, JPG, and PNG files are allowed');
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.symptoms || !formData.treatment_plan) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Use FormData to support multipart/form-data with file upload
      const data = new FormData();
      data.append('patient_id', appointment.patient_id);
      data.append('appointment_id', appointment.id); // For reference
      data.append('title', formData.title);
      data.append('symptoms', formData.symptoms);
      data.append('treatment_plan', formData.treatment_plan);
      
      if (file) {
        data.append('attachment', file);
      }

      const res = await axios.post('http://localhost:5000/api/reports', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: token,
        },
      });

      if (res.data.success) {
        toast.success('Medical report created successfully');
        onClose();
      }
    } catch (error) {
      console.error('Error creating report:', error);
      toast.error(error.response?.data?.message || 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-slate-100 dark:border-gray-700 flex justify-between items-center shrink-0 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
          <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <FileText className="text-emerald-600 dark:text-emerald-400" /> 
            Create Medical Report
          </h3>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-full hover:bg-white dark:hover:bg-gray-700 shadow-sm transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5 overflow-y-auto custom-scrollbar">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-2 shrink-0">
            <p className="text-sm font-bold text-blue-800 dark:text-blue-300">
              Patient: {appointment.patientName}
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Diagnosis / Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-600 bg-slate-50 dark:bg-gray-700/50 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              placeholder="e.g. Viral Fever, Routine Checkup"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Symptoms <span className="text-red-500">*</span>
            </label>
            <textarea
              name="symptoms"
              value={formData.symptoms}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-600 bg-slate-50 dark:bg-gray-700/50 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none"
              placeholder="Describe patient's symptoms (Will be encrypted securely)"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Treatment Plan <span className="text-red-500">*</span>
            </label>
            <textarea
              name="treatment_plan"
              value={formData.treatment_plan}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-600 bg-slate-50 dark:bg-gray-700/50 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none"
              placeholder="Prescription and instructions (Will be encrypted securely)"
            ></textarea>
          </div>

          {/* File Upload Section */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Upload PDF or Scanned Photo
            </label>
            <div className="relative border-2 border-dashed border-slate-300 dark:border-gray-600 rounded-2xl p-6 hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors text-center group cursor-pointer">
              <input 
                type="file" 
                accept=".pdf, .jpg, .jpeg, .png" 
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {file ? (
                <div className="flex flex-col items-center text-emerald-600 dark:text-emerald-400">
                  <CheckCircle size={32} className="mb-2" />
                  <p className="font-bold">{file.name}</p>
                  <p className="text-xs opacity-70 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <div className="flex flex-col items-center text-slate-400 dark:text-gray-400 group-hover:text-emerald-500 transition-colors">
                  <UploadCloud size={32} className="mb-2" />
                  <p className="font-bold text-sm">Click or drag file to upload</p>
                  <p className="text-xs mt-1">Supports PDF, JPG, PNG (Max 10MB)</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4 pt-6 mt-4 border-t border-slate-100 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-bold text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg transition-all disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </>
              ) : (
                'Submit Secure Report'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMedicalReport;
