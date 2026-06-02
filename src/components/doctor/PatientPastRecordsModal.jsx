import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { X, Calendar, Clock, FileText, CheckCircle, Activity, Pill, User } from 'lucide-react';
import toast from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const PatientPastRecordsModal = ({ isOpen, onClose, patient }) => {
  const { token } = useSelector((state) => state.auth);
  
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    if (isOpen && patient?.patient_id) {
      const fetchReports = async () => {
        setIsLoading(true);
        try {
          const res = await axios.get(`http://localhost:5000/api/reports/patient/${patient.patient_id}`, {
            headers: { Authorization: token }
          });
          if (res.data.success) {
            setReports(res.data.reports || []);
          }
        } catch (error) {
          console.error('Error fetching past reports:', error);
          toast.error('Failed to load past medical records');
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchReports();
    }
  }, [isOpen, patient?.patient_id, token]);

  if (!isOpen || !patient) return null;

  // Group reports by date
  const groupedReports = reports.reduce((acc, report) => {
    const date = new Date(report.created_at);
    const dateString = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    if (!acc[dateString]) acc[dateString] = [];
    acc[dateString].push(report);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedReports).sort((a, b) => new Date(b) - new Date(a));
  
  const availableDatesObj = sortedDates.map(dateStr => new Date(dateStr));

  let datesToRender = sortedDates;
  if (selectedDate) {
    const selectedDateStr = selectedDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    datesToRender = sortedDates.includes(selectedDateStr) ? [selectedDateStr] : [];
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-gray-700 flex justify-between items-start md:items-center shrink-0 bg-slate-50 dark:bg-gray-900/50 flex-col md:flex-row gap-4">
          <div>
            <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
              <FileText className="text-blue-500" /> 
              Past Medical Records
            </h3>
            <p className="text-sm text-slate-500 dark:text-gray-400 font-medium mt-1">
              Patient: <span className="font-bold text-slate-700 dark:text-gray-300">{patient.patientName}</span>
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Date Filter Dropdown */}
            {sortedDates.length > 0 && (
              <div className="flex flex-col items-start gap-1 shrink-0">
                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-100 transition-all">
                  <Calendar size={16} className="text-blue-500" />
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    includeDates={availableDatesObj}
                    placeholderText="All Dates"
                    dateFormat="eeee, MMM d"
                    className="bg-transparent border-none text-sm font-bold text-slate-700 dark:text-gray-200 focus:ring-0 cursor-pointer outline-none w-full min-w-[120px] placeholder:text-slate-400"
                    isClearable
                    clearButtonClassName="after:bg-slate-200 after:text-slate-600 dark:after:bg-gray-700 dark:after:text-gray-300"
                  />
                </div>
              </div>
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
              <p className="text-slate-500 font-semibold">Loading history...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <FileText size={32} className="text-slate-300 dark:text-gray-500" />
              </div>
              <h4 className="text-lg font-bold text-slate-700 dark:text-gray-300 mb-2">No Records Found</h4>
              <p className="text-slate-500 dark:text-gray-400 text-sm max-w-sm">
                There are no previous medical reports available for this patient.
              </p>
            </div>
          ) : (
            <div className="space-y-8 relative">
              {/* Timeline line */}
              <div className="absolute left-4 md:left-[1.3rem] top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-gray-700 rounded-full"></div>

            {datesToRender.map((date, index) => (
              <div key={index} className="relative pl-10 md:pl-12 animate-in slide-in-from-right-8 duration-500" style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}>
                  {/* Timeline Dot */}
                  <div className="absolute left-2.5 md:left-4 top-2 w-3.5 h-3.5 bg-blue-500 rounded-full shadow-[0_0_0_4px_white] dark:shadow-[0_0_0_4px_#1f2937]"></div>
                  
                  {/* Date Header */}
                  <h4 className="text-sm font-black text-slate-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                    <Calendar size={14} />
                    {date}
                  </h4>

                  {/* Reports for this date */}
                  <div className="space-y-4">
                    {groupedReports[date].map((report) => (
                      <div key={report.id} className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-gray-700">
                        <div className="flex justify-between items-start mb-4">
                          <h5 className="text-lg font-bold text-slate-800 dark:text-white">{report.title || 'General Consultation'}</h5>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-400 text-xs font-bold rounded-lg">
                            <Clock size={12} />
                            {new Date(report.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div className="space-y-4">
                          <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-xl border border-orange-100 dark:border-orange-900/30">
                            <h6 className="text-xs font-bold text-orange-800 dark:text-orange-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                              <Activity size={14} /> Symptoms
                            </h6>
                            <p className="text-sm text-slate-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{report.symptoms}</p>
                          </div>

                          <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                            <h6 className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                              <Pill size={14} /> Treatment Plan
                            </h6>
                            <p className="text-sm text-slate-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{report.treatment_plan}</p>
                          </div>

                          {/* Render Attached Photo/PDF if exists */}
                          {report.attachment_base64 && (
                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-gray-800">
                              <h6 className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                                Attached File
                              </h6>
                              {report.file_mimetype?.startsWith('image/') ? (
                                <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-gray-700 inline-block bg-slate-100 dark:bg-gray-800">
                                  <img 
                                    src={report.attachment_base64} 
                                    alt={report.file_name} 
                                    className="max-h-48 object-contain cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => window.open(report.attachment_base64, '_blank')}
                                  />
                                </div>
                              ) : (
                                <a 
                                  href={report.attachment_base64}
                                  download={report.file_name}
                                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 dark:text-blue-400 text-sm font-bold rounded-xl transition-colors border border-blue-200 dark:border-blue-800"
                                >
                                  <CheckCircle size={16} />
                                  Download {report.file_name || 'Attached PDF'}
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
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

export default PatientPastRecordsModal;
