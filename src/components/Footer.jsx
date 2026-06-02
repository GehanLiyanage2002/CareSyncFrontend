import React from 'react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();
  return (
    <footer className="bg-[#f8fafc] text-gray-600 py-16 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-24">
          
          {/* Opening Hours */}
          <div>
            <h4 className="text-[#111827] text-xl font-bold mb-6">Opening Hours</h4>
            <div className="flex justify-between py-3 border-b border-gray-200 text-sm text-gray-500">
              <span>Sunday : Closed</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-200 text-sm text-gray-500">
              <span>Monday, Tuesday - Friday</span>
              <span className="font-medium text-gray-700">8:00 AM - 3:30 PM</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-200 text-sm text-gray-500">
              <span>Saturday</span>
              <span className="font-medium text-gray-700">10:30 AM - 5:30 PM</span>
            </div>
          </div>

          {/* Our Clinic */}
          <div>
            <h4 className="text-[#111827] text-xl font-bold mb-6">Our Clinic</h4>
            <p className="text-gray-400 text-sm mb-4 hover:text-blue-500 transition-colors cursor-pointer">
              hello@company.co
            </p>
            <p className="text-gray-400 text-sm leading-relaxed">
              123 Digital Art Street,<br />
              San Diego, CA 92123
            </p>
          </div>

          {/* Socials */}
          <div>
            <h4 className="text-[#111827] text-xl font-bold mb-6">Socials</h4>
            <div className="flex gap-4 mb-6">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-[#3b82f6] hover:text-white transition-colors cursor-pointer text-gray-600">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-[#3b82f6] hover:text-white transition-colors cursor-pointer text-gray-600">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-[#3b82f6] hover:text-white transition-colors cursor-pointer text-gray-600">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-[#3b82f6] hover:text-white transition-colors cursor-pointer text-gray-600">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-400 relative group">
              <p>Copyright &copy; CareSync {new Date().getFullYear()}</p>
              <p>Design: CareSync Team</p>
              <p>Distributed By: IIT 08</p>
              
              <button 
                onClick={() => navigate('/login', { state: { role: 'Admin' } })}
                className="mt-6 opacity-10 hover:opacity-100 transition-opacity flex items-center gap-1 text-xs"
                title="System Administration"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                  <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                </svg>
                <span>Admin</span>
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </footer>
  );
};

export default Footer;