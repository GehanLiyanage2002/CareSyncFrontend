import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { X, Clock, FileText, CheckCircle, Activity, Pill, Edit3, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const ViewSingleMedicalReportModal = ({ isOpen, onClose, appointment, onEditClick }) => {
  const { token } = useSelector((state) => state.auth);
  
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && appointment?.id) {
      const fetchReport = async () => {
        setIsLoading(true);
        try {
          const res = await axios.get(`http://localhost:5000/api/reports/appointment/${appointment.id}`, {
            headers: { Authorization: token }
          });
          if (res.data.success && res.data.report) {
            setReport(res.data.report);
          } else {
            setReport(null); // No report found
          }
        } catch (error) {
          console.error('Error fetching report:', error);
          toast.error('Failed to load the medical report');
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchReport();
    }
  }, [isOpen, appointment?.id, token]);

  if (!isOpen || !appointment) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-gray-700 flex justify-between items-center shrink-0 bg-slate-50 dark:bg-gray-900/50">
          <div>
            <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
              <FileText className="text-blue-500" /> 
              Medical Report Details
            </h3>
            <p className="text-sm text-slate-500 dark:text-gray-400 font-medium mt-1">
              Patient: <span className="font-bold text-slate-700 dark:text-gray-300">{appointment.patient_name || 'Unknown'}</span>
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Edit Button */}
            {!isLoading && report && (
              <button 
                onClick={onEditClick}
                className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:hover:bg-emerald-800/50 dark:text-emerald-400 text-sm font-bold rounded-xl transition-colors border border-emerald-200 dark:border-emerald-800 flex items-center gap-2"
              >
                <Edit3 size={16} />
                Edit Report
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-full hover:bg-white dark:hover:bg-gray-700 shadow-sm transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50 dark:bg-gray-800">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[300px]">
              <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="text-slate-500 font-semibold">Loading report details...</p>
            </div>
          ) : !report ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <FileText size={32} className="text-slate-300 dark:text-gray-500" />
              </div>
              <h4 className="text-lg font-bold text-slate-700 dark:text-gray-300 mb-2">No Report Found</h4>
              <p className="text-slate-500 dark:text-gray-400 text-sm max-w-sm mb-6">
                A medical report has not been created for this appointment yet.
              </p>
              <button
                onClick={onEditClick}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-2"
              >
                <Plus size={18} />
                Create Medical Report
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-gray-700">
              <div className="flex justify-between items-start mb-6">
                <h5 className="text-xl font-bold text-slate-800 dark:text-white">{report.title || 'General Consultation'}</h5>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-400 text-sm font-bold rounded-xl border border-slate-200 dark:border-gray-700">
                  <Clock size={14} />
                  {new Date(report.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} at {new Date(report.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className="space-y-6">
                <div className="bg-orange-50 dark:bg-orange-900/10 p-5 rounded-2xl border border-orange-100 dark:border-orange-900/30">
                  <h6 className="text-sm font-bold text-orange-800 dark:text-orange-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Activity size={16} /> Symptoms
                  </h6>
                  <p className="text-slate-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{report.symptoms}</p>
                </div>

                <div className="bg-emerald-50 dark:bg-emerald-900/10 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                  <h6 className="text-sm font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Pill size={16} /> Treatment Plan
                  </h6>
                  <p className="text-slate-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{report.treatment_plan}</p>
                </div>

                {/* Render Attached Photo/PDF if exists */}
                {report.attachment_base64 && (
                  <div className="mt-6 pt-6 border-t border-slate-100 dark:border-gray-800">
                    <h6 className="text-sm font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                      Attached File
                    </h6>
                    {report.file_mimetype?.startsWith('image/') ? (
                      <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-gray-700 inline-block bg-slate-100 dark:bg-gray-800">
                        <img 
                          src={report.attachment_base64} 
                          alt={report.file_name} 
                          className="max-h-64 object-contain cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(report.attachment_base64, '_blank')}
                        />
                      </div>
                    ) : (
                      <a 
                        href={report.attachment_base64}
                        download={report.file_name}
                        className="inline-flex items-center gap-2 px-5 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 dark:text-blue-400 font-bold rounded-xl transition-colors border border-blue-200 dark:border-blue-800 shadow-sm"
                      >
                        <CheckCircle size={18} />
                        Download {report.file_name || 'Attached PDF'}
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewSingleMedicalReportModal;
