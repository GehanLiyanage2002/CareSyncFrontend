import React from 'react';
import { useNavigate } from 'react-router-dom';

const RoleLogin = () => {
  const navigate = useNavigate();
  const roles = [
    { name: 'Patient', desc: 'Book appointments & access medical records.', color: 'bg-green-100 text-green-700' },
    { name: 'Doctor', desc: 'Manage schedule & conduct virtual consultations.', color: 'bg-blue-100 text-blue-700' },
    { name: 'Receptionist', desc: 'Coordinate walk-ins & manage manual bookings.', color: 'bg-purple-100 text-purple-700' },
    { name: 'Major Admin', desc: 'System oversight & doctor performance tracking.', color: 'bg-red-100 text-red-700' }
  ];

  return (
    <section id="login" className="py-20 bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Secure System Access</h2>
          <p className="text-slate-400">Select your role to log in. CareSync supports standard credentials and biometric facial recognition.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((role, index) => (
            <div 
              key={index} 
              onClick={() => navigate('/login')}
              className="bg-slate-800 p-8 rounded-2xl flex flex-col items-center text-center hover:bg-slate-700 transition cursor-pointer border border-slate-700"
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl mb-4 ${role.color}`}>
                {role.name.charAt(0)}
              </div>
              <h3 className="text-xl font-semibold mb-2">{role.name} Login</h3>
              <p className="text-sm text-slate-400 mb-6">{role.desc}</p>
              <button className="w-full bg-slate-600 hover:bg-blue-600 text-white py-2 rounded-lg font-medium transition">
                Access Portal
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RoleLogin;