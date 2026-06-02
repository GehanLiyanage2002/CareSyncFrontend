import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-6 z-40 p-3 bg-white text-blue-600 border border-blue-100 rounded-full shadow-lg hover:bg-blue-50 hover:-translate-y-1 hover:shadow-blue-500/20 transition-all duration-300 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-300"
          aria-label="Scroll to top"
        >
          <ArrowUp size={24} strokeWidth={3} />
        </button>
      )}
    </>
  );
};

export default ScrollToTop;
