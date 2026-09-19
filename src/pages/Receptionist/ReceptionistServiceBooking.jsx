import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import {
  Activity,
  Calendar,
  Clock,
  User,
  Search,
  CheckCircle,
  CreditCard,
  DollarSign,
  Loader,
  RefreshCw,
  Printer,
  ChevronRight,
  Info,
  MapPin,
  CalendarCheck,
  ClipboardList
} from 'lucide-react';
import toast from 'react-hot-toast';
import socket from '../../socket';
import {
  generateAvailableDates,
  generateSlots,
  filterPastSlotsIfToday,
  formatTimeDisplay
} from '../../utils/serviceBookingHelper';

const ReceptionistServiceBooking = () => {
  const { token } = useSelector((state) => state.auth);

  // Active view: 'book' or 'bookings'
  const [activeSubTab, setActiveSubTab] = useState('book');

  // Services State
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');

  // Schedule & Available Dates State
  const [availableDates, setAvailableDates] = useState([]);
  const [loadingDates, setLoadingDates] = useState(false);
  const [selectedDateObj, setSelectedDateObj] = useState(null);

  // Time Slots State
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');

  // Patient Selection State
  const [allPatients, setAllPatients] = useState([]);
  const [patientSearch, setPatientSearch] = useState('');
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const patientDropdownRef = useRef(null);

  // Booking Form State
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Bookings List State
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingFilterQuery, setBookingFilterQuery] = useState('');
  const [receiptToPrint, setReceiptToPrint] = useState(null);

  // Close patient dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (patientDropdownRef.current && !patientDropdownRef.current.contains(e.target)) {
        setShowPatientDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 1. Fetch Services
  const fetchServices = async () => {
    setLoadingServices(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/services`);
      if (res.data.success) {
        const availableOnly = res.data.services.filter(s => s.is_available);
        setServices(availableOnly);
        if (availableOnly.length > 0 && !selectedService) {
          setSelectedService(availableOnly[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch services', error);
      toast.error('Failed to load medical services');
    } finally {
      setLoadingServices(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // 2. Fetch Patients for Search
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/receptionist/all-patients`, {
          headers: { Authorization: token }
        });
        if (res.data.data) {
          setAllPatients(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch patients list', err);
      }
    };
    if (token) {
      fetchPatients();
    }
  }, [token]);

  // Handle Patient Search Filtering
  useEffect(() => {
    if (patientSearch.trim().length >= 2) {
      const q = patientSearch.toLowerCase();
      const matched = allPatients.filter(p =>
        (p.full_name && p.full_name.toLowerCase().includes(q)) ||
        (p.email && p.email.toLowerCase().includes(q)) ||
        (p.mobile_number && p.mobile_number.toString().includes(q))
      ).slice(0, 8);
      setFilteredPatients(matched);
      setShowPatientDropdown(true);
    } else {
      setFilteredPatients([]);
      setShowPatientDropdown(false);
    }
  }, [patientSearch, allPatients]);

  // 3. Fetch Service Schedules whenever Selected Service Changes
  useEffect(() => {
    if (!selectedService?.id) {
      setAvailableDates([]);
      setSelectedDateObj(null);
      setSelectedTime('');
      return;
    }

    const fetchSchedules = async () => {
      setLoadingDates(true);
      setSelectedDateObj(null);
      setSelectedTime('');
      setBookedSlots([]);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/services/${selectedService.id}/schedules`,
          { headers: token ? { Authorization: token } : {} }
        );
        if (res.data.success) {
          let dates = [];
          if (res.data.available_dates && res.data.available_dates.length > 0) {
            dates = res.data.available_dates;
          } else if (res.data.schedules) {
            dates = generateAvailableDates(res.data.schedules);
          }
          setAvailableDates(dates);
          if (dates.length > 0) {
            setSelectedDateObj(dates[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load service schedules', err);
        toast.error('Failed to load schedule for ' + selectedService.name);
      } finally {
        setLoadingDates(false);
      }
    };

    fetchSchedules();
  }, [selectedService?.id, token]);

  // 4. Fetch Booked Slots when Selected Date Changes
  useEffect(() => {
    if (!selectedService?.id || !selectedDateObj?.schedule_date) {
      setBookedSlots([]);
      return;
    }

    const fetchBooked = async () => {
      setLoadingSlots(true);
      setSelectedTime('');
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/services/${selectedService.id}/booked-slots?date=${selectedDateObj.schedule_date}`
        );
        if (res.data.success && res.data.booked_slots) {
          setBookedSlots(res.data.booked_slots);
        }
      } catch (err) {
        console.error('Failed to fetch booked slots', err);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchBooked();
  }, [selectedService?.id, selectedDateObj?.schedule_date]);

  // Compute time slots for selected schedule
  const allSlots = generateSlots(selectedDateObj);
  const dynamicSlots = filterPastSlotsIfToday(allSlots, selectedDateObj?.schedule_date);

  // 5. Fetch All Bookings
  const fetchAllBookings = async () => {
    setLoadingBookings(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/services/bookings`, {
        headers: { Authorization: token }
      });
      if (res.data.success) {
        setBookings(res.data.bookings || []);
      }
    } catch (err) {
      console.error('Failed to fetch service bookings', err);
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAllBookings();
    }
  }, [token]);

  // Listen for real-time bookings
  useEffect(() => {
    if (!socket) return;
    const handleServiceBooked = (newBooking) => {
      fetchAllBookings();
      // If current service and date match, refresh booked slots
      if (
        selectedService?.id === newBooking.service_id &&
        selectedDateObj?.schedule_date === newBooking.date
      ) {
        setBookedSlots(prev => [...prev, newBooking.time]);
      }
    };

    socket.on('serviceBooked', handleServiceBooked);
    return () => {
      socket.off('serviceBooked', handleServiceBooked);
    };
  }, [selectedService?.id, selectedDateObj?.schedule_date]);

  // Handle Booking Submission
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedService) {
      toast.error('Please select a service');
      return;
    }
    if (!selectedPatient) {
      toast.error('Please select a patient to book for');
      return;
    }
    if (!selectedDateObj?.schedule_date) {
      toast.error('Please select an available date');
      return;
    }
    if (!selectedTime) {
      toast.error('Please select a time slot');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        patient_id: selectedPatient.id,
        service_id: selectedService.id,
        date: selectedDateObj.schedule_date,
        time: selectedTime,
        amount_paid: Number(selectedService.price) || 0,
        payment_method: paymentMethod
      };

      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/services/book`, payload, {
        headers: { Authorization: token }
      });

      if (res.data.success) {
        const bookingData = {
          id: res.data.booking.id,
          serviceName: selectedService.name,
          date: selectedDateObj.formattedDate || selectedDateObj.schedule_date,
          time: formatTimeDisplay(selectedTime),
          amount: selectedService.price,
          patientName: selectedPatient.full_name,
          patientPhone: selectedPatient.mobile_number,
          paymentMethod: paymentMethod
        };
        setConfirmedBooking(bookingData);
        toast.success(`Booked ${selectedService.name} for ${selectedPatient.full_name}!`);

        // Refresh slots and bookings list
        setBookedSlots(prev => [...prev, selectedTime]);
        setSelectedTime('');
        fetchAllBookings();
      }
    } catch (err) {
      console.error('Booking failed', err);
      toast.error(err.response?.data?.message || 'Failed to book service');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Filtered services based on search query
  const filteredServices = services.filter(s =>
    s.name.toLowerCase().includes(serviceSearchQuery.toLowerCase()) ||
    (s.location && s.location.toLowerCase().includes(serviceSearchQuery.toLowerCase()))
  );

  // Filtered bookings based on query
  const filteredBookingsList = bookings.filter(b =>
    (b.patientName && b.patientName.toLowerCase().includes(bookingFilterQuery.toLowerCase())) ||
    (b.serviceName && b.serviceName.toLowerCase().includes(bookingFilterQuery.toLowerCase())) ||
    (b.date && b.date.includes(bookingFilterQuery))
  );

  return (
    <div className="space-y-6">
      {/* Top Banner & Sub-Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 rounded-xl">
              <Activity size={22} />
            </div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">
              Medical Service Booking & Schedules
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-gray-400">
            Check live schedules, available dates, time slots, and schedule appointments for patients.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-100 dark:bg-gray-700 p-1 rounded-2xl shrink-0">
          <button
            onClick={() => setActiveSubTab('book')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'book'
                ? 'bg-white dark:bg-gray-800 text-indigo-600 shadow-sm'
                : 'text-slate-600 dark:text-gray-300 hover:text-slate-900'
            }`}
          >
            <CalendarCheck size={16} />
            Book Service
          </button>
          <button
            onClick={() => {
              setActiveSubTab('bookings');
              fetchAllBookings();
            }}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'bookings'
                ? 'bg-white dark:bg-gray-800 text-indigo-600 shadow-sm'
                : 'text-slate-600 dark:text-gray-300 hover:text-slate-900'
            }`}
          >
            <ClipboardList size={16} />
            Bookings Log ({bookings.length})
          </button>
        </div>
      </div>

      {/* VIEW 1: BOOK MEDICAL SERVICE */}
      {activeSubTab === 'book' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT COLUMN: Service Selector (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                  1. Select Service
                </h3>
                <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-0.5 rounded-full">
                  {services.length} Services
                </span>
              </div>

              {/* Service Search Box */}
              <div className="relative mb-3">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter services..."
                  value={serviceSearchQuery}
                  onChange={(e) => setServiceSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

              {/* Services List */}
              {loadingServices ? (
                <div className="flex justify-center py-12 text-indigo-500">
                  <Loader className="animate-spin" size={24} />
                </div>
              ) : filteredServices.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8 italic">No matching services found.</p>
              ) : (
                <div className="space-y-2.5 max-h-[580px] overflow-y-auto custom-scrollbar pr-1">
                  {filteredServices.map((srv) => {
                    const isSelected = selectedService?.id === srv.id;
                    return (
                      <button
                        key={srv.id}
                        onClick={() => setSelectedService(srv)}
                        className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-200 flex flex-col gap-1.5 ${
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 shadow-sm ring-1 ring-indigo-500'
                            : 'bg-slate-50/70 dark:bg-gray-900 border-slate-200/80 dark:border-gray-700 hover:border-indigo-300 hover:bg-white dark:hover:bg-gray-800'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <span className={`font-bold text-xs ${isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-800 dark:text-white'}`}>
                            {srv.name}
                          </span>
                          <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 shrink-0 ml-2">
                            Rs. {srv.price}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <MapPin size={11} className="text-slate-400" />
                            {srv.location || 'Clinic Unit'}
                          </span>
                        </div>

                        {srv.description && (
                          <p className="text-[11px] text-slate-400 line-clamp-1">
                            {srv.description}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Available Dates, Times, Patient & Booking (8 cols) */}
          <div className="lg:col-span-8 space-y-5">

            {/* Selected Service Banner */}
            {selectedService ? (
              <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-200">
                    Selected Medical Service
                  </span>
                  <h2 className="text-lg font-extrabold">{selectedService.name}</h2>
                  <p className="text-xs text-indigo-100 flex items-center gap-2 mt-1">
                    <MapPin size={13} /> {selectedService.location || 'Consultation Clinic'}
                  </p>
                </div>
                <div className="sm:text-right shrink-0">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-200 block">Service Fee</span>
                  <span className="text-2xl font-black">Rs. {selectedService.price}</span>
                </div>
              </div>
            ) : null}

            {/* Schedule Section: Available Dates & Time Slots */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-gray-700 space-y-6">

              {/* 2. Available Dates */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-700 dark:text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar size={15} className="text-indigo-600" />
                    2. Available Scheduled Dates
                  </h3>
                  {availableDates.length > 0 && (
                    <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-0.5 rounded-full">
                      {availableDates.length} days open for booking
                    </span>
                  )}
                </div>

                {loadingDates ? (
                  <div className="flex items-center justify-center py-8 text-indigo-500">
                    <Loader className="animate-spin" size={24} />
                  </div>
                ) : availableDates.length === 0 ? (
                  <div className="p-6 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-2xl text-center">
                    <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
                      No live schedules configured for this service yet.
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                      Admins configure service schedules in the Service Management panel.
                    </p>
                  </div>
                ) : (
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                    {availableDates.map((item, idx) => {
                      const isSelected = selectedDateObj?.schedule_date === item.schedule_date;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setSelectedDateObj(item);
                            setSelectedTime('');
                          }}
                          className={`flex flex-col items-center justify-center min-w-[76px] py-3 px-3.5 rounded-2xl border transition-all duration-200 shrink-0 ${
                            isSelected
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200 scale-105'
                              : 'bg-slate-50 dark:bg-gray-900 border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-300 hover:border-indigo-300 hover:bg-white dark:hover:bg-gray-800'
                          }`}
                        >
                          <span className={`text-[11px] font-bold uppercase tracking-wider ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                            {item.dayName}
                          </span>
                          <span className="text-2xl font-black my-0.5">{item.dayNum}</span>
                          <span className={`text-[11px] font-semibold ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                            {item.month}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 3. Available Time Slots */}
              {selectedDateObj && (
                <div className="pt-4 border-t border-slate-100 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold text-slate-700 dark:text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock size={15} className="text-indigo-600" />
                      3. Available Time Slots for {selectedDateObj.formattedDate || selectedDateObj.schedule_date}
                    </h3>
                    {dynamicSlots.length > 0 && (
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-gray-400">
                        {dynamicSlots.filter(s => !bookedSlots.includes(s)).length} of {dynamicSlots.length} slots available
                      </span>
                    )}
                  </div>

                  {loadingSlots ? (
                    <div className="flex items-center justify-center py-6 text-indigo-500">
                      <Loader className="animate-spin" size={20} />
                    </div>
                  ) : dynamicSlots.length === 0 ? (
                    <div className="p-4 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-2xl text-center">
                      <p className="text-xs text-slate-500 dark:text-gray-400">No time slots remaining for this date.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                      {dynamicSlots.map((slot24, idx) => {
                        const isBooked = bookedSlots.includes(slot24);
                        const isSelected = selectedTime === slot24;
                        const displayTime = formatTimeDisplay(slot24);

                        return (
                          <button
                            key={idx}
                            type="button"
                            disabled={isBooked}
                            onClick={() => setSelectedTime(slot24)}
                            className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all duration-200 flex flex-col items-center justify-center ${
                              isBooked
                                ? 'bg-slate-100 dark:bg-gray-800/40 border-slate-200 dark:border-gray-700 text-slate-400 dark:text-gray-600 cursor-not-allowed opacity-60'
                                : isSelected
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100 scale-105'
                                : 'bg-white dark:bg-gray-900 border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-300 hover:border-indigo-400 hover:bg-indigo-50/50'
                            }`}
                          >
                            <span>{displayTime}</span>
                            {isBooked ? (
                              <span className="text-[9px] uppercase tracking-wider text-rose-500 font-black">
                                Booked
                              </span>
                            ) : (
                              <span className="text-[9px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold">
                                Open
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* 4. Select Patient & Payment & Submit */}
              {selectedDateObj && (
                <div className="pt-4 border-t border-slate-100 dark:border-gray-700 space-y-4">
                  <h3 className="text-xs font-bold text-slate-700 dark:text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
                    <User size={15} className="text-indigo-600" />
                    4. Select Patient & Confirm Booking
                  </h3>

                  {/* Patient Selector */}
                  <div className="relative" ref={patientDropdownRef}>
                    {selectedPatient ? (
                      <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center font-bold text-sm">
                            {selectedPatient.full_name?.charAt(0) || 'P'}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-800 dark:text-white block">
                              {selectedPatient.full_name}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-gray-400">
                              Phone: {selectedPatient.mobile_number || 'N/A'} • {selectedPatient.email || 'No email'}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPatient(null);
                            setPatientSearch('');
                          }}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-xl border border-slate-200 shadow-sm"
                        >
                          Change Patient
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="relative">
                          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Search registered patient by name, mobile, or email..."
                            value={patientSearch}
                            onChange={(e) => setPatientSearch(e.target.value)}
                            onFocus={() => {
                              if (filteredPatients.length > 0) setShowPatientDropdown(true);
                            }}
                            className="w-full bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                          />
                        </div>

                        {showPatientDropdown && filteredPatients.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-slate-200 dark:border-gray-700 z-50 overflow-hidden max-h-56 overflow-y-auto">
                            {filteredPatients.map((p) => (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => {
                                  setSelectedPatient(p);
                                  setShowPatientDropdown(false);
                                  setPatientSearch('');
                                }}
                                className="w-full text-left px-4 py-2.5 hover:bg-indigo-50 dark:hover:bg-gray-700 border-b border-slate-100 dark:border-gray-700 last:border-0 flex items-center justify-between transition-colors"
                              >
                                <div>
                                  <div className="text-xs font-bold text-slate-800 dark:text-white">
                                    {p.full_name}
                                  </div>
                                  <div className="text-[11px] text-slate-400">
                                    {p.mobile_number} • {p.email}
                                  </div>
                                </div>
                                <ChevronRight size={14} className="text-slate-400" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Payment Method & Confirm */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider block mb-2">
                        Payment Method
                      </label>
                      <div className="flex gap-2">
                        {['Cash', 'Card'].map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setPaymentMethod(m)}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                              paymentMethod === m
                                ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500'
                                : 'bg-slate-50 dark:bg-gray-900 border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-300 hover:bg-white'
                            }`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col justify-end">
                      <button
                        type="button"
                        onClick={handleBookingSubmit}
                        disabled={!selectedPatient || !selectedTime || isSubmitting}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? <Loader className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                        Confirm Booking ({selectedTime ? formatTimeDisplay(selectedTime) : 'Select Slot'})
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
      )}

      {/* VIEW 2: SERVICE BOOKINGS LOG */}
      {activeSubTab === 'bookings' && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-gray-700 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-white">Service Bookings History</h2>
              <p className="text-xs text-slate-500 dark:text-gray-400">All medical service reservations placed by patients & reception</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter by patient, service, date..."
                  value={bookingFilterQuery}
                  onChange={(e) => setBookingFilterQuery(e.target.value)}
                  className="bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 w-64"
                />
              </div>

              <button
                onClick={fetchAllBookings}
                className="p-2 border border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700 rounded-xl text-slate-600 dark:text-gray-300 transition"
                title="Refresh Bookings"
              >
                <RefreshCw size={15} className={loadingBookings ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {loadingBookings ? (
            <div className="flex justify-center py-16 text-indigo-500">
              <Loader className="animate-spin" size={28} />
            </div>
          ) : filteredBookingsList.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-xs italic">
              No service bookings found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-gray-700 text-slate-400 uppercase tracking-wider font-bold">
                    <th className="py-3 px-3">Booking ID</th>
                    <th className="py-3 px-3">Patient</th>
                    <th className="py-3 px-3">Service</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Time</th>
                    <th className="py-3 px-3">Amount</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-gray-700">
                  {filteredBookingsList.map((bk) => (
                    <tr key={bk.id} className="hover:bg-slate-50/60 dark:hover:bg-gray-750 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        #{bk.id}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800 dark:text-white">
                        <div>{bk.patientName}</div>
                        <div className="text-[10px] text-slate-400">
                          {(!bk.patientPhone || bk.patientPhone.length > 20) ? 'No Contact Number' : bk.patientPhone}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-700 dark:text-gray-200">
                        {bk.serviceName}
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-gray-300">
                        {bk.date}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-700 dark:text-gray-200">
                        {formatTimeDisplay(bk.time)}
                      </td>
                      <td className="py-3 px-3 font-black text-slate-800 dark:text-white">
                        Rs. {bk.price}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          bk.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : bk.status === 'Cancelled'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                            : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                        }`}>
                          {bk.status || 'In Progress'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setReceiptToPrint(bk)}
                          className="px-2.5 py-1 text-slate-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 border border-slate-200 dark:border-gray-600 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 hover:bg-white transition"
                        >
                          <Printer size={12} /> Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SUCCESS CONFIRMATION MODAL */}
      {confirmedBooking && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 print:p-0 print:bg-white">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl relative animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-gray-700">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">Booking Confirmed!</h3>
            <p className="text-slate-500 dark:text-gray-400 text-xs mb-5">
              Appointment scheduled for <span className="font-bold text-indigo-600 dark:text-indigo-400">{confirmedBooking.patientName}</span>
            </p>

            <div className="bg-slate-50 dark:bg-gray-900 rounded-2xl p-5 border border-slate-100 dark:border-gray-700 mb-6 text-left space-y-2 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-gray-800">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Booking Reference</span>
                <span className="font-mono font-extrabold text-indigo-600 dark:text-indigo-400 text-sm">#{confirmedBooking.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-gray-400">Service:</span>
                <span className="font-bold text-slate-800 dark:text-white">{confirmedBooking.serviceName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-gray-400">Date:</span>
                <span className="font-bold text-slate-800 dark:text-white">{confirmedBooking.date}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-gray-400">Time:</span>
                <span className="font-bold text-slate-800 dark:text-white">{confirmedBooking.time}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-gray-800">
                <span className="text-slate-500 dark:text-gray-400">Amount Paid:</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                  Rs. {confirmedBooking.amount} ({confirmedBooking.paymentMethod})
                </span>
              </div>
            </div>

            <div className="flex gap-3 print:hidden">
              <button
                onClick={handlePrint}
                className="flex-1 py-3 border border-slate-200 dark:border-gray-600 hover:bg-slate-50 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-200 font-bold rounded-xl transition flex items-center justify-center gap-2 text-xs"
              >
                <Printer size={15} /> Print Receipt
              </button>
              <button
                onClick={() => setConfirmedBooking(null)}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition text-xs shadow-md"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECEIPT MODAL FOR EXISTING BOOKING */}
      {receiptToPrint && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 print:p-0 print:bg-white">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full shadow-2xl relative border border-slate-100 dark:border-gray-700">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-2 font-black text-lg">
                CS
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">CareSync Medical Center</h3>
              <p className="text-[11px] text-slate-400">Official Service Appointment Receipt</p>
            </div>

            <div className="bg-slate-50 dark:bg-gray-900 rounded-2xl p-5 border border-slate-100 dark:border-gray-700 space-y-2.5 text-xs mb-6">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-gray-800">
                <span className="text-slate-400 uppercase font-bold text-[10px]">Booking ID</span>
                <span className="font-mono font-bold text-indigo-600">#{receiptToPrint.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-gray-400">Patient:</span>
                <span className="font-bold text-slate-800 dark:text-white">{receiptToPrint.patientName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-gray-400">Service:</span>
                <span className="font-bold text-slate-800 dark:text-white">{receiptToPrint.serviceName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-gray-400">Date:</span>
                <span className="font-bold text-slate-800 dark:text-white">{receiptToPrint.date}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-gray-400">Time:</span>
                <span className="font-bold text-slate-800 dark:text-white">{formatTimeDisplay(receiptToPrint.time)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-gray-800">
                <span className="text-slate-500 dark:text-gray-400">Amount:</span>
                <span className="font-black text-emerald-600 text-sm">Rs. {receiptToPrint.price}</span>
              </div>
            </div>

            <div className="flex gap-3 print:hidden">
              <button
                onClick={handlePrint}
                className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition flex items-center justify-center gap-2 text-xs"
              >
                <Printer size={15} /> Print
              </button>
              <button
                onClick={() => setReceiptToPrint(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 rounded-xl transition text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ReceptionistServiceBooking;
