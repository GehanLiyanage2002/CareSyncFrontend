import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage';
import DoctorsPage from './pages/DoctorsPage';
import ServicesPage from './pages/ServicesPage';
import ContactPage from './pages/ContactPage';
import Login from './pages/Login';
import Register from './pages/Register';
import DoctorRegister from './pages/DoctorRegister';
import OtpVerification from './pages/OtpVerification';
import PatientDashboardHome from './pages/PatientDashboardHome';
import PatientAppointmentsPage from './pages/PatientAppointmentsPage';
import PatientMedicalProfilePage from './pages/PatientMedicalProfilePage';
import PatientMedicalHistoryPage from './pages/PatientMedicalHistoryPage';
import DoctorDashboardHome from './pages/DoctorDashboardHome';
import DoctorKanbanPage from './pages/DoctorKanbanPage';
import DoctorHistoryPage from './pages/DoctorHistoryPage';
import DoctorReviewsPage from './pages/DoctorReviewsPage';
import ReceptionistDashboard from './pages/ReceptionistDashboard';
import AdminDashboard from './pages/AdminDashboard';
import EditProfilePage from './pages/EditProfilePage';
import BookAppointmentPage from './pages/BookAppointmentPage';
import ServiceProfilePage from './pages/ServiceProfilePage';
import BookServicePage from './pages/BookServicePage';
import TelemedicineVideoRoom from './pages/TelemedicineVideoRoom';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';

const Unauthorized = () => (
  <div className="flex h-screen items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-4xl font-extrabold text-red-600 mb-4">403 - Unauthorized</h1>
      <p className="text-gray-600">You do not have permission to view this page.</p>
    </div>
  </div>
);

// A simple generic dashboard that redirects based on user role 
// (or just shows a generic message if role isn't handled here)
import { useSelector } from 'react-redux';
const GenericDashboardRedirect = () => {
  const { user } = useSelector((state) => state.auth);
  
  if (!user) return <Navigate to="/login" replace />;
  
  switch (user.role) {
    case 'Patient': return <Navigate to="/patient/dashboard" replace />;
    case 'Doctor': return <Navigate to="/doctor/dashboard" replace />;
    case 'Receptionist': return <Navigate to="/receptionist" replace />;
    case 'Admin': return <Navigate to="/admin" replace />;
    default: return <div className="p-8">Welcome to CareSync. Your role is not recognized.</div>;
  }
};

function App() {
  return (
    <div className="antialiased text-gray-900 bg-gray-50 dark:bg-gray-900 dark:text-gray-100 min-h-screen font-sans">
      <Toaster position="top-right" />
      <ScrollToTop />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/doctors" element={<DoctorsPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/doctor-register" element={<DoctorRegister />} />
          <Route path="/verify-otp" element={<OtpVerification />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Book Appointment Route */}
          <Route 
            path="/book-appointment" 
            element={
              <ProtectedRoute>
                <BookAppointmentPage />
              </ProtectedRoute>
            } 
          />

          <Route path="/service-profile" element={<ServiceProfilePage />} />
          
          <Route 
            path="/book-service" 
            element={
              <ProtectedRoute>
                <BookServicePage />
          <Route 
            path="/telemedicine/:id" 
            element={
              <ProtectedRoute allowedRoles={['Patient', 'Doctor']}>
                <TelemedicineVideoRoom />
              </ProtectedRoute>
            } 
          />

          {/* Generic Dashboard Redirect Route */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <GenericDashboardRedirect />
              </ProtectedRoute>
            } 
          />

          {/* Profile Route - accessible by any authenticated user */}
          <Route 
            path="/edit-profile" 
            element={
              <ProtectedRoute>
                <EditProfilePage />
              </ProtectedRoute>
            } 
          />

          {/* Protected Role-Based Routes */}
          {/* /patient-dashboard is the primary Patient redirect from Login */}
          <Route 
            path="/patient-dashboard"
            element={
              <ProtectedRoute allowedRoles={['Patient']}>
                <Navigate to="/patient/dashboard" replace />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/patient/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['Patient']}>
                <PatientDashboardHome />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/patient/appointments" 
            element={
              <ProtectedRoute allowedRoles={['Patient']}>
                <PatientAppointmentsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/patient/medical-profile" 
            element={
              <ProtectedRoute allowedRoles={['Patient']}>
                <PatientMedicalProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/patient/medical-history" 
            element={
              <ProtectedRoute allowedRoles={['Patient']}>
                <PatientMedicalHistoryPage />
              </ProtectedRoute>
            } 
          />
          {/* Doctor Routes */}
          <Route 
            path="/doctor/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['Doctor']}>
                <DoctorDashboardHome />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/doctor/kanban" 
            element={
              <ProtectedRoute allowedRoles={['Doctor']}>
                <DoctorKanbanPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/doctor/history" 
            element={
              <ProtectedRoute allowedRoles={['Doctor']}>
                <DoctorHistoryPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/doctor/reviews" 
            element={
              <ProtectedRoute allowedRoles={['Doctor']}>
                <DoctorReviewsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/receptionist/*" 
            element={
              <ProtectedRoute allowedRoles={['Receptionist']}>
                <ReceptionistDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;