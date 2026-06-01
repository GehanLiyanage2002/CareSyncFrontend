import React from 'react';
import { Star } from 'lucide-react';

const PatientReviewsList = ({ title = "Patient Reviews", subtitle = "What patients say about this doctor", reviews, reviewStats, loadingReviews, imgKey = Date.now() }) => {
  return (
    <div className="mt-10 mb-2 print:hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-extrabold text-slate-800 dark:text-white">{title}</h3>
          <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
        </div>
        {reviewStats?.total_reviews > 0 && (
          <div className="flex flex-col items-center bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-2xl px-5 py-3">
            <span className="text-3xl font-extrabold text-amber-500">{reviewStats.average_rating}</span>
            <div className="flex gap-0.5 my-1">
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} size={14} className={s <= Math.round(reviewStats.average_rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200 dark:fill-gray-600 dark:text-gray-600'} />
              ))}
            </div>
            <span className="text-xs text-slate-500 font-semibold">{reviewStats.total_reviews} review{reviewStats.total_reviews !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {loadingReviews ? (
        <div className="text-center py-10 text-slate-400">
          <div className="w-8 h-8 border-4 border-amber-100 border-t-amber-500 rounded-full animate-spin mx-auto mb-3" />
          Loading reviews...
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-3xl border border-slate-100 dark:border-gray-700">
          <Star className="w-12 h-12 text-slate-200 dark:text-gray-600 mx-auto mb-3" />
          <p className="font-bold text-slate-500 dark:text-gray-400">No reviews yet</p>
          <p className="text-sm text-slate-400 mt-1">Be the first to review after your appointment!</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white dark:bg-gray-800 rounded-3xl border border-slate-100 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden">
                    {review.patient_id ? (
                      <img
                        src={`http://localhost:5000/api/users/profile-image/${review.patient_id}?t=${imgKey}`}
                        alt={review.patient_name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                    ) : null}
                    <span className={review.patient_id ? 'hidden' : 'block'}>
                      {review.patient_name ? review.patient_name.charAt(0).toUpperCase() : 'P'}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-white text-sm">{review.patient_name || 'Anonymous'}</p>
                    <p className="text-xs text-slate-400">{new Date(review.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} size={13} className={s <= review.rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200 dark:fill-gray-600 dark:text-gray-600'} />
                  ))}
                </div>
              </div>
              {review.comment && (
                <p className="text-sm text-slate-600 dark:text-gray-300 leading-relaxed">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientReviewsList;
