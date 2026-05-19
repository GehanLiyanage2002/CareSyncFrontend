import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-2xl font-bold text-white mb-4">CareSync</h3>
          <p className="text-sm">
            A Smart Healthcare Management System developed to digitize core clinical operations and provide seamless patient-doctor interactions.
          </p>
        </div>
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#hero" className="hover:text-blue-400">Home</a></li>
            <li><a href="#services" className="hover:text-blue-400">Services</a></li>
            <li><a href="#login" className="hover:text-blue-400">Login Portals</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Contact & Support</h4>
          <ul className="space-y-2 text-sm">
            <li>Uva Wellassa University of Sri Lanka</li>
            <li>Group: IIT 08</li>
            <li>Email: support@caresync.local</li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-gray-800 text-sm text-center">
        &copy; {new Date().getFullYear()} CareSync - Smart Healthcare Management System. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;