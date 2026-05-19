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
    <section id="services" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Core Services</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Providing a unified digital experience to enhance operational efficiency and inclusive patient care.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <div key={index} className="p-6 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-xl transition duration-300">
              <div className="text-4xl mb-4">{service.icon}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{service.title}</h3>
              <p className="text-gray-600">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;