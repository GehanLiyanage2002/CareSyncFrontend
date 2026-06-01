import React, { useRef, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const PatientReviewsList = ({ title = "Patient Reviews", subtitle = "What patients say about this doctor", reviews, reviewStats, loadingReviews, imgKey = Date.now(), doctorName = '' }) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (!reviews || reviews.length <= 2) return;
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
        }
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [reviews]);

  return (
    <div className="mt-10 mb-2 print:hidden bg-blue-50/30 dark:bg-gray-800/20 rounded-3xl p-6 md:p-8 border border-blue-100/50 dark:border-gray-700/50">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white">{title}</h3>
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mt-1 uppercase tracking-wider">{subtitle}</p>
        </div>
        {reviewStats?.total_reviews > 0 && (
          <div className="flex items-center gap-4 mt-4 md:mt-0 bg-white dark:bg-gray-800 border border-slate-100 dark:border-gray-700 rounded-2xl px-5 py-3 shadow-sm">
            <span className="text-3xl font-extrabold text-amber-500">{reviewStats.average_rating}</span>
            <div>
              <div className="flex gap-0.5 mb-1">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} size={14} className={s <= Math.round(reviewStats.average_rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200 dark:fill-gray-600 dark:text-gray-600'} />
                ))}
              </div>
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">{reviewStats.total_reviews} review{reviewStats.total_reviews !== 1 ? 's' : ''}</span>
            </div>
          </div>
        )}
      </div>

      {loadingReviews ? (
        <div className="text-center py-16 text-slate-400">
          <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="font-semibold">Loading reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl border border-slate-100 dark:border-gray-700 shadow-sm">
          <Star className="w-14 h-14 text-slate-200 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-lg font-bold text-slate-600 dark:text-gray-300">No reviews yet</p>
          <p className="text-sm text-slate-400 mt-2">Be the first to share your experience!</p>
        </div>
      ) : (
        <div className="relative flex items-center justify-center">
          {reviews.length > 2 && (
            <button 
              onClick={() => scroll('left')}
              className="hidden md:flex absolute -left-4 z-20 w-12 h-12 bg-white dark:bg-gray-800 shadow-lg rounded-full items-center justify-center text-slate-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors border border-slate-100 dark:border-gray-700"
            >
              <ChevronLeft size={28} />
            </button>
          )}

          <div 
            ref={scrollRef}
            className="flex overflow-x-auto gap-6 pb-8 pt-4 px-4 snap-x snap-mandatory hide-scrollbar w-full"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {reviews.map((review, index) => {
              const patientId = review.patient_id;
              const hasImage = !!patientId;
              
              return (
                <div key={review.id || index} className="min-w-[280px] max-w-[320px] flex-shrink-0 snap-center bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)] dark:shadow-none flex flex-col items-center text-center transition-transform duration-300 hover:-translate-y-1 border border-slate-100 dark:border-gray-700 hover:border-blue-100 dark:hover:border-blue-900 group relative">
                  
                  {/* Profile Image with Badge */}
                  <div className="relative mb-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-200 to-blue-400 dark:from-blue-600 dark:to-blue-800 flex items-center justify-center text-white font-bold text-2xl border-4 border-white dark:border-gray-800 shadow-md group-hover:border-blue-50 dark:group-hover:border-gray-700 transition-colors duration-300 overflow-hidden">
                      {hasImage ? (
                        <img 
                          src={`http://localhost:5000/api/users/profile-image/${patientId}?t=${imgKey}`} 
                          alt={review.patient_name} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                      ) : null}
                      <span className={hasImage ? 'hidden' : 'block'}>
                        {review.patient_name ? review.patient_name.charAt(0).toUpperCase() : 'U'}
                      </span>
                    </div>
                    <div className="absolute bottom-0 right-0 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center border-[3px] border-white dark:border-gray-800 shadow-sm transform translate-x-1 translate-y-1">
                      <Quote className="text-white w-3 h-3 fill-current" />
                    </div>
                  </div>

                  {/* Stars Rating */}
                  <div className="flex items-center justify-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={16}
                        className={i < Math.round(review.rating || 5) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200 dark:text-gray-600 dark:fill-gray-600'} 
                      />
                    ))}
                  </div>
                  
                  {/* Testimonial Text */}
                  {review.comment && (
                    <p className="text-slate-600 dark:text-gray-300 text-sm leading-relaxed mb-6 italic">
                      "{review.comment}"
                    </p>
                  )}
                  
                  {/* Patient Info */}
                  <h4 className="text-slate-800 dark:text-white font-bold text-lg mt-auto">
                    {review.patient_name || 'Anonymous User'}
                  </h4>
                  <p className="text-blue-500 text-[10px] font-extrabold tracking-[0.2em] uppercase mt-1">
                    {review.doctor_name || doctorName ? `PATIENT OF ${review.doctor_name || doctorName}` : 'VERIFIED PATIENT'}
                  </p>
                </div>
              );
            })}
          </div>

          {reviews.length > 2 && (
            <button 
              onClick={() => scroll('right')}
              className="hidden md:flex absolute -right-4 z-20 w-12 h-12 bg-white dark:bg-gray-800 shadow-lg rounded-full items-center justify-center text-slate-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors border border-slate-100 dark:border-gray-700"
            >
              <ChevronRight size={28} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PatientReviewsList;
