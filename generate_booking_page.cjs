const fs = require('fs');

const profilePath = 'src/components/DoctorProfile.jsx';
const profileContent = fs.readFileSync(profilePath, 'utf8');

// We will extract parts from profileContent to build BookAppointmentPage

const pageHeader = `import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Printer, Calendar, Loader } from 'lucide-react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const socket = io('http://localhost:5000');

const BookAppointmentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialDoctor = location.state?.doctor;

  if (!initialDoctor) {
    return <Navigate to="/doctors" replace />;
  }

  const [doctor, setDoctor] = useState(initialDoctor);
  const { user, token } = useSelector(state => state.auth);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Cash'); // 'Cash' or 'Online'
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [tokenNumber, setTokenNumber] = useState(null);
  
  const [formData, setFormData] = useState({
    fullName: user?.name || user?.full_name || '',
    age: '',
    mobileNumber: '',
    gender: '',
    email: user?.email || ''
  });

  const [errors, setErrors] = useState({});
  const [dynamicSlots, setDynamicSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [slotPage, setSlotPage] = useState(0);
  const SLOTS_PER_PAGE = 8;
  const [loadingDates, setLoadingDates] = useState(false);
  const [dates, setDates] = useState([]);
`;

// Extract useEffects and functions
const logicRegex = /useEffect\(\(\) => \{\n    const handleFeeChanged[\s\S]*?(?=return \()/;
const logicMatch = profileContent.match(logicRegex);
let extractedLogic = logicMatch ? logicMatch[0] : '';

// Remove reviews logic from extractedLogic
extractedLogic = extractedLogic.replace(/\/\/ Fetch reviews for this doctor[\s\S]*?\} \}, \[doctor\]\);/g, '');

const pageFooter = `

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Header />
      <div className="pt-24 pb-12 max-w-6xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-full text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 font-semibold transition shadow-sm mb-6 bg-white dark:bg-gray-800"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Profile</span>
        </button>

        {/* We place the booking panel here */}
`;

// Extract the booking panel JSX
const bookingPanelRegex = /\{\/\* Appointment Booking Panel \*\/\}[\s\S]*?(?=\{\/\* Success Booking Receipt Overlay Modal \*\/})/;
let bookingPanelJSXMatch = profileContent.match(bookingPanelRegex);
let bookingPanelJSX = bookingPanelJSXMatch ? bookingPanelJSXMatch[0] : '';

// Remove the "showBookingPanel" conditional wrapper from the booking JSX because it's always visible here
// Originally: {doctor.is_available === false ? ( ... ) : !showBookingPanel ? ( ... ) : ( ... )}
// We only want the true and false branch, or just show unavailable if not available, otherwise show form.
// Let's replace the whole condition with a simpler one

// Let's just write the booking panel JSX manually to be safe
const bookingPanelClean = `
      {doctor.is_available === false ? (
        <div className="bg-rose-50 dark:bg-rose-900/20 rounded-3xl p-8 shadow-sm border border-rose-100 dark:border-rose-800/30 text-center transition-colors duration-300 mt-8">
          <Calendar className="h-12 w-12 text-rose-400 dark:text-rose-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-rose-900 dark:text-rose-400 mb-2">Currently Unavailable</h3>
          <p className="text-rose-700 dark:text-rose-300">This doctor is not accepting new appointments at the moment.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 shadow-lg border border-blue-50/50 dark:border-gray-700/50 transition-colors duration-300 mt-8">
          <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-400 mb-8 flex items-center gap-2 transition-colors">
            <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Book Appointment with {doctor.name}
          </h3>

          ` + bookingPanelJSX.substring(bookingPanelJSX.indexOf('<form onSubmit={handleBookingSubmit}'), bookingPanelJSX.lastIndexOf('</form>') + 7) + `
        </div>
      )}
`;

const modalRegex = /\{\/\* Success Booking Receipt Overlay Modal \*\/\}[\s\S]*?(?=\n    <\/div>)/;
const modalMatch = profileContent.match(modalRegex);
let modalJSX = modalMatch ? modalMatch[0] : '';

// Need to update the close button in modal to navigate back
modalJSX = modalJSX.replace('onBack(); // Go back to landing page', 'navigate(-1);');
modalJSX = modalJSX.replace('setShowSuccessModal(false);', 'setShowSuccessModal(false);');

const endFile = `
      </div>
      <Footer />
    </div>
  );
};

export default BookAppointmentPage;
`;

const fullFile = pageHeader + extractedLogic + pageFooter + bookingPanelClean + '\n\n' + modalJSX + endFile;

fs.writeFileSync('src/pages/BookAppointmentPage.jsx', fullFile, 'utf8');
console.log('Successfully created BookAppointmentPage.jsx');
