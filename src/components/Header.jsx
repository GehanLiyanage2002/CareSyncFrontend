import React from 'react';

const Header = () => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        <div className="flex items-center">
          <span className="text-2xl font-bold text-blue-700">CareSync</span>
        </div>
        <nav className="hidden md:flex space-x-8">
          <a href="#hero" className="text-gray-700 hover:text-blue-600 font-medium">Home</a>
          <a href="#services" className="text-gray-700 hover:text-blue-600 font-medium">Services</a>
          <a href="#login" className="text-gray-700 hover:text-blue-600 font-medium">Login portal</a>
        </nav>
        <div>
          <a href="#login" className="bg-blue-600 text-white px-5 py-2 rounded-md font-semibold hover:bg-blue-700 transition">
            Get Started
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;