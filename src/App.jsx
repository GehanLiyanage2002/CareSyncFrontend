import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import DoctorRegister from './pages/DoctorRegister';
import OtpVerification from './pages/OtpVerification';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import ReceptionistDashboard from './pages/ReceptionistDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

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
    case 'Patient': return <Navigate to="/patient" replace />;
    case 'Doctor': return <Navigate to="/doctor" replace />;
    case 'Receptionist': return <Navigate to="/receptionist" replace />;
    case 'Admin': return <Navigate to="/admin" replace />;
    default: return <div className="p-8">Welcome to CareSync. Your role is not recognized.</div>;
  }
};

function App() {
  return (
    <div className="antialiased text-gray-900 bg-gray-50 dark:bg-gray-900 dark:text-gray-100 min-h-screen font-sans">
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/doctor-register" element={<DoctorRegister />} />
          <Route path="/verify-otp" element={<OtpVerification />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Generic Dashboard Redirect Route */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <GenericDashboardRedirect />
              </ProtectedRoute>
            } 
          />

          {/* Protected Role-Based Routes */}
          {/* /patient-dashboard is the primary Patient redirect from Login */}
          <Route 
            path="/patient-dashboard"
            element={
              <ProtectedRoute allowedRoles={['Patient']}>
                <PatientDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/patient/*" 
            element={
              <ProtectedRoute allowedRoles={['Patient']}>
                <PatientDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/doctor/*" 
            element={
              <ProtectedRoute allowedRoles={['Doctor']}>
                <DoctorDashboard />
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