import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Calendar, Clock, FileText, CheckCircle, Activity, Pill, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const PatientMedicalHistoryPage = () => {
  const { token, user } = useSelector((state) => state.auth);
  
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/reports/my-history`, {
          headers: { Authorization: token }
        });
        if (res.data.success) {
          setReports(res.data.reports || []);
        }
      } catch (error) {
        console.error('Error fetching medical history:', error);
        toast.error('Failed to load medical history');
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchHistory();
      
      // Real-time polling every 10 seconds
      const interval = setInterval(fetchHistory, 10000);
      return () => clearInterval(interval);
    }
  }, [token]);

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

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[500px] text-slate-400">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <p className="font-semibold text-slate-600">Loading your medical history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-blue-100 flex flex-col dark:bg-gray-900">
      <Header />
      
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-10">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-slate-100 dark:border-gray-700 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-[600px] flex flex-col">
          
          {/* Header */}
      <div className="p-6 md:p-8 border-b border-slate-100 dark:border-gray-700 bg-slate-50/50 dark:bg-gray-900/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl">
              <FileText size={24} />
            </div>
            My Medical History
          </h2>
          <p className="text-sm font-medium text-slate-500 dark:text-gray-400 mt-2 max-w-2xl">
            Review your complete medical record timeline. All reports from your doctors are securely stored and encrypted here.
          </p>
        </div>
        
        {/* Date Filter Dropdown */}
        {sortedDates.length > 0 && (
          <div className="flex flex-col items-start gap-1 shrink-0">
            <label className="text-xs font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest ml-1">Select Date</label>
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-gray-700 shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <Calendar size={18} className="text-blue-500" />
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                includeDates={availableDatesObj}
                placeholderText="All Dates"
                dateFormat="eeee, MMMM d"
                className="bg-transparent border-none text-sm font-bold text-slate-700 dark:text-gray-200 focus:ring-0 cursor-pointer outline-none w-full min-w-[150px] placeholder:text-slate-400"
                isClearable
                clearButtonClassName="after:bg-slate-200 after:text-slate-600 dark:after:bg-gray-700 dark:after:text-gray-300"
              />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 md:p-8 flex-1 bg-slate-50/30 dark:bg-gray-800/50">
        {reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
            <div className="w-20 h-20 bg-slate-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-5">
              <FileText size={40} className="text-slate-300 dark:text-gray-500" />
            </div>
            <h4 className="text-xl font-bold text-slate-700 dark:text-gray-300 mb-2">No Medical Records</h4>
            <p className="text-slate-500 dark:text-gray-400 max-w-sm">
              You haven't received any medical reports yet. Once a doctor issues a report after your consultation, it will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-10 relative py-4">
            {/* Timeline line */}
            <div className="absolute left-4 md:left-[1.3rem] top-6 bottom-6 w-0.5 bg-slate-200 dark:bg-gray-700 rounded-full"></div>

            {datesToRender.map((date, index) => (
              <div key={index} className="relative pl-10 md:pl-16 animate-in slide-in-from-right-8 duration-500" style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'both' }}>
                {/* Timeline Dot */}
                <div className="absolute left-2.5 md:left-4 top-2 w-3.5 h-3.5 bg-blue-500 rounded-full shadow-[0_0_0_4px_white] dark:shadow-[0_0_0_4px_#1f2937]"></div>
                
                {/* Date Header */}
                <h4 className="text-sm font-black text-slate-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-6">
                  <Calendar size={16} />
                  {date}
                </h4>

                {/* Reports for this date */}
                <div className="space-y-6">
                  {groupedReports[date].map((report) => (
                    <div key={report.id} className="bg-white dark:bg-gray-900 rounded-[1.5rem] p-6 shadow-sm border border-slate-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-5">
                        <h5 className="text-xl font-bold text-slate-800 dark:text-white">{report.title || 'General Consultation'}</h5>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-400 text-xs font-bold rounded-xl">
                          <Clock size={14} />
                          {new Date(report.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="space-y-5">
                        <div className="bg-orange-50 dark:bg-orange-900/10 p-5 rounded-2xl border border-orange-100 dark:border-orange-900/30">
                          <h6 className="text-xs font-bold text-orange-800 dark:text-orange-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <Activity size={16} /> Symptoms
                          </h6>
                          <p className="text-slate-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{report.symptoms}</p>
                        </div>

                        <div className="bg-emerald-50 dark:bg-emerald-900/10 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                          <h6 className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <Pill size={16} /> Treatment Plan
                          </h6>
                          <p className="text-slate-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{report.treatment_plan}</p>
                        </div>

                        {/* Render Attached Photo/PDF if exists */}
                        {report.attachment_base64 && (
                          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-gray-800">
                            <h6 className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-4">
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
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 dark:text-blue-400 text-sm font-bold rounded-xl transition-colors border border-blue-200 dark:border-blue-800 shadow-sm"
                              >
                                <CheckCircle size={18} />
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
      </main>
    </div>
  );
};

export default PatientMedicalHistoryPage;
