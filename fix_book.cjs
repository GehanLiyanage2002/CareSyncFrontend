const fs = require('fs');

const logicBlock = `
  useEffect(() => {
    const handleFeeChanged = (data) => {
      if (data.doctor_id === doctor.id || data.doctor_id === doctor.doctor_id) {
        setDoctor(prev => ({ ...prev, consultationFee: data.consultation_fee }));
      }
    };
    
    const handleAvailabilityChanged = (data) => {
      if (data.doctor_id === doctor.id || data.doctor_id === doctor.doctor_id) {
        setDoctor(prev => ({ ...prev, is_available: data.is_available }));
      }
    };

    const handleProfileUpdated = (data) => {
      if (data.doctor_id === doctor.id || data.doctor_id === doctor.doctor_id) {
        setDoctor(prev => ({
          ...prev,
          location: data.location,
          specialization: data.specialization,
          experience: data.experience,
          about: data.bio,
        }));
      }
    };

    socket.on('doctorFeeChanged', handleFeeChanged);
    socket.on('doctorAvailabilityChanged', handleAvailabilityChanged);
    socket.on('doctorProfileUpdated', handleProfileUpdated);

    return () => {
      socket.off('doctorFeeChanged', handleFeeChanged);
      socket.off('doctorAvailabilityChanged', handleAvailabilityChanged);
      socket.off('doctorProfileUpdated', handleProfileUpdated);
    };
  }, [doctor.id, doctor.doctor_id]);

  // Fetch configured dates
  useEffect(() => {
    const docId = doctor?.id || doctor?.doctor_id;
    if (docId) {
      const fetchDates = async () => {
        setLoadingDates(true);
        try {
          const res = await axios.get(\`http://localhost:5000/api/appointments/configured-dates/\${docId}\`);
          if (res.data.success && res.data.dates) {
            const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            
            const tempDates = res.data.dates.map(dateStr => {
              const d = new Date(dateStr);
              const year = d.getFullYear();
              const monthStr = String(d.getMonth() + 1).padStart(2, '0');
              const dayStr = String(d.getDate()).padStart(2, '0');
              return {
                dayName: daysOfWeek[d.getDay()],
                dayNum: d.getDate(),
                month: months[d.getMonth()],
                year: year,
                formattedDate: \`\${d.getDate()} \${months[d.getMonth()]} \${year}\`,
                valueDate: \`\${year}-\${monthStr}-\${dayStr}\`
              };
            });
            setDates(tempDates);
          }
        } catch (error) {
          console.error("Failed to fetch configured dates", error);
        } finally {
          setLoadingDates(false);
        }
      };
      fetchDates();
    }
  }, [doctor]);

  useEffect(() => {
    const docId = doctor?.id || doctor?.doctor_id;
    if (selectedDate && docId) {
      const fetchSlots = async () => {
        setLoadingSlots(true);
        try {
          const res = await axios.get(\`http://localhost:5000/api/appointments/slots/\${docId}?date=\${selectedDate.valueDate}\`);
          if (res.data.success) {
            setDynamicSlots(res.data.slots);
          }
        } catch (error) {
          console.error("Failed to fetch slots", error);
          setDynamicSlots([]);
        } finally {
          setLoadingSlots(false);
        }
      };
      fetchSlots();
    }
  }, [selectedDate, doctor, refreshTrigger]);

  useEffect(() => {
    socket.on('slotBooked', (data) => {
      const docId = doctor?.id || doctor?.doctor_id;
      if (data.doctor_id === docId && selectedDate?.valueDate === data.date) {
        setRefreshTrigger(prev => prev + 1);
      }
    });

    return () => {
      socket.off('slotBooked');
    };
  }, [doctor, selectedDate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!formData.age.trim() || isNaN(formData.age) || parseInt(formData.age) <= 0) {
      newErrors.age = 'Provide a valid age';
    }
    if (!formData.mobileNumber.trim() || formData.mobileNumber.length < 9) {
      newErrors.mobileNumber = 'Provide a valid mobile number';
    }
    if (!formData.gender) newErrors.gender = 'Gender is required';
    
    if (!selectedDate) newErrors.date = 'Select a date';
    if (!selectedTime) newErrors.time = 'Select a time slot';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const docId = doctor?.id || doctor?.doctor_id;
        const res = await axios.post('http://localhost:5000/api/appointments', {
          doctor_id: docId,
          appointment_date: selectedDate.valueDate,
          start_time: selectedTime,
          patient_name: formData.fullName,
          age: parseInt(formData.age),
          mobile_number: formData.mobileNumber,
          gender: formData.gender,
          email: formData.email,
          payment_method: paymentMethod
        }, {
          headers: { Authorization: token }
        });
        
        if (res.data.success) {
          setTokenNumber(res.data.appointment.token_number);
          setShowSuccessModal(true);
        }
      } catch (error) {
        console.error("Booking failed", error);
        alert(error.response?.data?.message || 'Booking failed');
      }
    }
  };

  const formatTimeDisplay = (time24) => {
    const [h, m] = time24.split(':');
    const hours = parseInt(h);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return \`\${hours12.toString().padStart(2, '0')}:\${m} \${ampm}\`;
  };

  const printTicket = () => {
    window.print();
  };
`;

let content = fs.readFileSync('src/pages/BookAppointmentPage.jsx', 'utf8');
content = content.replace('  return (\n    <div className="min-h-screen bg-gray-50 dark:bg-gray-900', logicBlock + '\n  return (\n    <div className="min-h-screen bg-gray-50 dark:bg-gray-900');

fs.writeFileSync('src/pages/BookAppointmentPage.jsx', content, 'utf8');
console.log('Successfully added missing logic');
