import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Calendar, Clock, CreditCard, Download, Activity, CheckCircle2, ChevronRight, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const PatientServices = () => {
  const { user, token } = useSelector(state => state.auth);
  const [activeTab, setActiveTab] = useState('book'); // 'book' or 'history'
  
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  
  const [selectedService, setSelectedService] = useState(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  
  // Payment state
  const [isPaying, setIsPaying] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const fetchServicesAndBookings = async () => {
    try {
      const [servicesRes, bookingsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/services', { headers: { Authorization: token } }),
        axios.get('http://localhost:5000/api/services/bookings', { headers: { Authorization: token } })
      ]);
      
      if (servicesRes.data.success) {
        setServices(servicesRes.data.services);
      }
      if (bookingsRes.data.success) {
        setBookings(bookingsRes.data.bookings);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load services data');
    }
  };

  useEffect(() => {
    fetchServicesAndBookings();
  }, [token]);

  const handleBook = (e) => {
    e.preventDefault();
    if (!selectedService || !date || !time) {
      toast.error('Please select service, date and time');
      return;
    }
    setIsPaying(true);
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    const amount = selectedService.price;
    const order_id = `PSRV-${Date.now()}`;
    
    try {
      const hashRes = await axios.post('http://localhost:5000/api/payment/generate-hash', {
        order_id: order_id,
        amount: amount,
        currency: 'LKR'
      });

      if (hashRes.data) {
        const { hash, merchant_id, amount: formattedAmount } = hashRes.data;

        const payment = {
          sandbox: true,
          merchant_id: merchant_id,
          return_url: window.location.href,
          cancel_url: window.location.href,
          notify_url: "http://localhost:5000/api/payment/notify",
          order_id: order_id,
          items: `Service: ${selectedService.name}`,
          amount: formattedAmount,
          currency: 'LKR',
          hash: hash,
          first_name: user?.full_name || user?.name || 'Patient',
          last_name: '',
          email: user?.email || 'test@example.com',
          phone: '0000000000',
          address: 'Sri Lanka',
          city: 'Colombo',
          country: 'Sri Lanka'
        };

        window.payhere.onCompleted = async function onCompleted(orderId) {
          console.log("Payment completed. OrderID:" + orderId);
          try {
            const res = await axios.post('http://localhost:5000/api/services/book', {
              service_id: selectedService.id,
              date,
              time,
              amount_paid: amount
            }, { headers: { Authorization: token } });

            if (res.data.success) {
              toast.success('Service booked and paid successfully!');
              fetchServicesAndBookings();
              
              const pdfBooking = {
                id: res.data.booking.id,
                patientName: user?.full_name || user?.name || 'Patient',
                serviceName: selectedService.name,
                price: amount,
                date,
                time,
                status: 'Confirmed'
              };
              generatePDF(pdfBooking);
              
              setIsPaying(false);
              setSelectedService(null);
              setDate('');
              setTime('');
              setActiveTab('history');
            }
          } catch (error) {
            console.error('Error booking service:', error);
            toast.error(error.response?.data?.message || 'Failed to complete booking');
          }
        };

        window.payhere.onDismissed = function onDismissed() {
          console.log("Payment dismissed");
          toast.error("Payment was dismissed.");
        };

        window.payhere.onError = function onError(error) {
          console.log("Error:"  + error);
          toast.error("Payment error occurred.");
        };

        window.payhere.startPayment(payment);
      }
    } catch (error) {
      console.error("Hash generation failed", error);
      toast.error("Failed to initialize payment gateway");
    }
  };

  const generatePDF = (booking) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235); // Blue-600
    doc.text('CareSync Medical Services', 14, 20);
    
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42); // Slate-900
    doc.text('Payment Receipt & Service Details', 14, 30);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text(`Receipt No: ${booking.id}`, 14, 40);
    doc.text(`Date Issued: ${new Date().toLocaleDateString()}`, 14, 45);

    // Details Table
    doc.autoTable({
      startY: 55,
      head: [['Description', 'Details']],
      body: [
        ['Patient Name', booking.patientName],
        ['Service Name', booking.serviceName],
        ['Appointment Date', booking.date],
        ['Appointment Time', booking.time],
        ['Status', booking.status],
        ['Amount Paid', `LKR ${parseFloat(booking.price).toLocaleString()}`]
      ],
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] }
    });

    // Footer
    const finalY = doc.lastAutoTable.finalY || 100;
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('Thank you for choosing CareSync.', 14, finalY + 20);
    doc.text('Please present this receipt at the reception.', 14, finalY + 25);

    doc.save(`CareSync_Receipt_${booking.id}.pdf`);
  };

  const availableServices = services.filter(s => s.is_available);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-700 pb-2">
        <button 
          onClick={() => setActiveTab('book')}
          className={`pb-2 px-2 font-semibold text-sm transition-colors relative ${activeTab === 'book' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Book a Service
          {activeTab === 'book' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`pb-2 px-2 font-semibold text-sm transition-colors relative ${activeTab === 'history' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          My Bookings
          {activeTab === 'history' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>}
        </button>
      </div>

      {activeTab === 'book' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Booking Form */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <Activity className="text-blue-500" /> Book Medical Service
            </h3>
            
            {!isPaying ? (
              <form onSubmit={handleBook} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Select Service</label>
                  <select 
                    value={selectedService?.id || ''}
                    onChange={(e) => setSelectedService(services.find(s => s.id === parseInt(e.target.value)))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-white"
                    required
                  >
                    <option value="">-- Choose a service --</option>
                    {services.map(service => (
                      <option key={service.id} value={service.id} disabled={!service.is_available}>
                        {service.name} - LKR {parseFloat(service.price).toLocaleString()} {!service.is_available && '(Unavailable)'}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Preferred Date</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Calendar size={18} /></div>
                      <input 
                        type="date" 
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-white"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Preferred Time</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Clock size={18} /></div>
                      <input 
                        type="time" 
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-white"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button type="submit" disabled={!selectedService} className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 disabled:opacity-50 disabled:shadow-none flex justify-center items-center gap-2">
                    Proceed to Payment <ChevronRight size={18} />
                  </button>
                </div>
              </form>
            ) : (
              <div className="animate-in slide-in-from-right-4 duration-300">
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-500 text-sm">Service:</span>
                    <span className="font-semibold text-slate-800 dark:text-white">{selectedService.name}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-500 text-sm">Date & Time:</span>
                    <span className="font-semibold text-slate-800 dark:text-white">{date} at {time}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-slate-800 dark:text-white font-bold">Total Amount:</span>
                    <span className="font-bold text-blue-600 text-lg">LKR {parseFloat(selectedService.price).toLocaleString()}</span>
                  </div>
                </div>

                <form onSubmit={handlePayment} className="space-y-4">
                  <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setIsPaying(false)} className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-white font-bold rounded-xl transition-colors">
                      Back
                    </button>
                    <button type="submit" className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 transition-colors flex items-center justify-center gap-2">
                      <CreditCard size={18} /> Pay via PayHere
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Available Services List */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/80 rounded-3xl p-6 border border-blue-100 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Available Services</h3>
            <div className="space-y-3">
              {availableServices.length > 0 ? availableServices.map(service => (
                <div key={service.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl flex justify-between items-center shadow-sm border border-slate-100 dark:border-slate-700">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white">{service.name}</h4>
                    <span className="text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-md font-semibold mt-1 inline-block">Available Now</span>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-blue-600 text-lg">LKR {parseFloat(service.price).toLocaleString()}</p>
                  </div>
                </div>
              )) : (
                <p className="text-slate-500 text-center py-8">No services currently available.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <FileText className="text-blue-500" /> My Service Bookings
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wider">
                  <th className="p-4 font-semibold rounded-tl-xl">Receipt No.</th>
                  <th className="p-4 font-semibold">Service</th>
                  <th className="p-4 font-semibold">Date & Time</th>
                  <th className="p-4 font-semibold">Price</th>
                  <th className="p-4 font-semibold text-right rounded-tr-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {bookings.length > 0 ? bookings.map(booking => (
                  <tr key={booking.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">{booking.id}</td>
                    <td className="p-4 font-bold text-slate-800 dark:text-white">{booking.serviceName}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">
                      {booking.date} <br/><span className="text-xs text-slate-400">{booking.time}</span>
                    </td>
                    <td className="p-4 font-semibold text-emerald-600">LKR {parseFloat(booking.price).toLocaleString()}</td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => generatePDF(booking)}
                        className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1 ml-auto"
                      >
                        <Download size={14} /> Receipt
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-500">
                      You haven't booked any services yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientServices;
