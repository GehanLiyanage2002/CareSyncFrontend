import React from 'react';
import LandingPage from './pages/LandingPage';

// For future routing (when you build the specific dashboards), 
// you will want to install react-router-dom and set it up like this:
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import PatientDashboard from './pages/PatientDashboard';
// import DoctorDashboard from './pages/DoctorDashboard';
// import ReceptionistDashboard from './pages/ReceptionistDashboard';
// import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <div className="antialiased text-gray-900 bg-gray-50 dark:bg-gray-900 dark:text-gray-100 min-h-screen font-sans">
      {/* Current Setup: Just rendering the Landing Page */}
      <LandingPage />

      {/* Future Setup with React Router:
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/patient/*" element={<PatientDashboard />} />
          <Route path="/doctor/*" element={<DoctorDashboard />} />
          <Route path="/receptionist/*" element={<ReceptionistDashboard />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
        </Routes>
      </Router>
      */}
    </div>
  );
}

export default App;