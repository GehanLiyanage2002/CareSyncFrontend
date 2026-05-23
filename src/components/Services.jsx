import React from 'react';

const Services = () => {
  const services = [
    {
      title: "Smart Scheduling & Queueing",
      description: "Real-time availability, token-based queues, and self-rescheduling options.",
      icon: "📅"
    },
    {
      title: "Secure Telemedicine",
      description: "Virtual video consultations specifically tailored for psychology and nutrology.",
      icon: "💻"
    },
    {
      title: "Digital Accessibility",
      description: "Dynamic UI customization and sensory controls for visual and cognitive inclusivity.",
      icon: "👁️"
    },
    {
      title: "AI-Powered Assistance",
      description: "24/7 virtual chatbot support for instant patient inquiries and guidance.",
      icon: "🤖"
    }
  ];

  return (
    <section id="services" className="py-20 bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 transition-colors">Our Core Services</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto transition-colors">Providing a unified digital experience to enhance operational efficiency and inclusive patient care.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <div key={index} className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-xl dark:hover:shadow-2xl transition duration-300">
              <div className="text-4xl mb-4">{service.icon}</div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2 transition-colors">{service.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 transition-colors">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;