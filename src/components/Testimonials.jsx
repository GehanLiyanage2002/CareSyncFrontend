import React, { useState, useEffect, useRef } from 'react';
import { Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Marquee } from './magicui/Marquee';

const socket = io('http://localhost:5000');

const Testimonials = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imgKey, setImgKey] = useState(Date.now());
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    // We removed manual JS auto-scroll in favor of Magic UI CSS Marquee!
  }, [reviews]);

  const fallbackTestimonials = [
    {
      id: 1,
      patient_name: "Jeff Freshman",
      doctor_name: "Dr. Smith",
      rating: 5,
      comment: "Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts.",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80"
    },
    {
      id: 2,
      patient_name: "Sarah Jenkins",
      doctor_name: "Dr. Allen",
      rating: 5,
      comment: "The doctors here are amazing. They listen carefully and provide the best care. I highly recommend this clinic.",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80"
    },
    {
      id: 3,
      patient_name: "Michael Robert",
      doctor_name: "Dr. Peterson",
      rating: 4,
      comment: "Booking an appointment was seamless, and the consultation was very professional. Excellent service all around.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
    }
  ];

  const placeholderImages = [
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
  ];

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/reviews/public/recent');
        if (response.data.success && response.data.reviews.length > 0) {
          setReviews(response.data.reviews);
        } else {
          setReviews(fallbackTestimonials);
        }
      } catch (error) {
        console.error("Error fetching recent reviews:", error);
        setReviews(fallbackTestimonials);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReviews();

    const handleNewReview = () => {
      fetchReviews();
    };

    const handleProfileImageUpdated = ({ user_id }) => {
      setImgKey(Date.now());
    };

    socket.on('reviewAdded', handleNewReview);
    socket.on('profileImageUpdated', handleProfileImageUpdated);

    return () => {
      socket.off('reviewAdded', handleNewReview);
      socket.off('profileImageUpdated', handleProfileImageUpdated);
    };
  }, []);

  return (
    <section id="testimonials" className="relative py-24 bg-[#edf4fa] overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=2000&q=80" 
          alt="Doctors Background" 
          className="w-full h-full object-cover object-center opacity-[0.03] mix-blend-multiply"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#edf4fa]/50 to-[#edf4fa]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[#3b82f6] text-sm font-bold tracking-[0.2em] uppercase mb-3">
            Read Testimonials
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#111827] tracking-tight">
            Our Patient Says
          </h2>
        </div>

        {/* Magic UI Marquee Carousel */}
        <div className="relative flex items-center min-h-[350px] overflow-hidden w-full max-w-[100vw] [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
          {loading ? (
            <div className="w-full flex justify-center items-center min-h-[300px]">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <Marquee pauseOnHover className="py-4" repeat={4}>
              {reviews.map((testimonial, index) => {
                const profileImg = testimonial.patient_id 
                  ? `http://localhost:5000/api/users/profile-image/${testimonial.patient_id}?t=${imgKey}`
                  : (testimonial.image || placeholderImages[index % placeholderImages.length]);

                return (
                  <div key={`${testimonial.id || index}-${index}`} className="magic-border-card min-w-[300px] max-w-[350px] flex-shrink-0 bg-white rounded-3xl p-8 shadow-[0_15px_40px_rgba(0,0,0,0.04)] flex flex-col items-center text-center transition-transform duration-300 hover:-translate-y-2 group relative">
                    
                    {/* Profile Image with Badge */}
                    <div className="relative mb-6">
                      <img 
                        src={profileImg} 
                        alt={testimonial.patient_name} 
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md group-hover:border-blue-50 transition-colors duration-300"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = placeholderImages[index % placeholderImages.length];
                        }}
                      />
                      <div className="absolute bottom-0 right-0 w-8 h-8 bg-[#3b82f6] rounded-full flex items-center justify-center border-4 border-white shadow-md transform translate-x-1 translate-y-1">
                        <Quote className="text-white w-3 h-3 fill-current" />
                      </div>
                    </div>

                    {/* Stars Rating */}
                    <div className="flex items-center justify-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${i < Math.round(testimonial.rating || 5) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} 
                        />
                      ))}
                    </div>
                    
                    {/* Testimonial Text */}
                    <p className="text-slate-500 text-sm md:text-base leading-relaxed mb-6 px-2 italic">
                      "{testimonial.comment}"
                    </p>
                    
                    {/* Patient Info */}
                    <h4 className="text-[#111827] font-bold text-lg mt-auto">
                      {testimonial.patient_name}
                    </h4>
                    <p className="text-[#3b82f6] text-[10px] font-bold tracking-[0.2em] uppercase mt-1">
                      PATIENT OF {testimonial.doctor_name ? testimonial.doctor_name.toUpperCase() : 'OUR CLINIC'}
                    </p>
                  </div>
                );
              })}
            </Marquee>
          )}
        </div>

      </div>
    </section>
  );
};

export default Testimonials;
