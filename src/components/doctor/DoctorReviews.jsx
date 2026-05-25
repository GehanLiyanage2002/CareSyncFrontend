import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, TrendingUp, Users, Award } from 'lucide-react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

const DoctorReviews = () => {
  const { user, token } = useSelector((state) => state.auth);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ average_rating: 0, total_reviews: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const fetchReviews = async () => {
    if (!user?.id) return;
    try {
      const res = await axios.get(
        `http://localhost:5000/api/reviews/${user.id}`,
        { headers: { Authorization: token } }
      );
      if (res.data.success) {
        setReviews(res.data.reviews);
        setStats({
          average_rating: res.data.average_rating,
          total_reviews: res.data.total_reviews,
        });
        // Auto-mark all as read when doctor opens the reviews page
        axios.put('http://localhost:5000/api/reviews/mark-read', {}, {
          headers: { Authorization: token }
        }).catch(() => {});
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [user?.id]);

  // Real-time: new review added
  useEffect(() => {
    const handleReviewAdded = ({ doctor_id, review }) => {
      if (doctor_id !== user?.id) return;
      setReviews((prev) => [review, ...prev]);
      setStats((prev) => {
        const newTotal = prev.total_reviews + 1;
        const newAvg = ((prev.average_rating * prev.total_reviews) + review.rating) / newTotal;
        return { total_reviews: newTotal, average_rating: Math.round(newAvg * 10) / 10 };
      });
    };
    socket.on('reviewAdded', handleReviewAdded);
    return () => socket.off('reviewAdded', handleReviewAdded);
  }, [user?.id]);

  const starCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct: reviews.length > 0 ? Math.round((reviews.filter((r) => r.rating === star).length / reviews.length) * 100) : 0,
  }));

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Average Rating Card */}
        <div className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-3xl p-6 text-white shadow-lg shadow-amber-200 dark:shadow-amber-900/20 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
            <Star size={32} className="fill-white text-white" />
          </div>
          <div>
            <p className="text-amber-100 text-xs font-bold uppercase tracking-widest">Average Rating</p>
            <p className="text-5xl font-extrabold leading-none mt-1">
              {stats.average_rating > 0 ? stats.average_rating : '—'}
            </p>
            <p className="text-amber-100 text-xs mt-1">out of 5</p>
          </div>
        </div>

        {/* Total Reviews */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-slate-100 dark:border-gray-700 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
            <MessageSquare size={24} className="text-blue-500" />
          </div>
          <div>
            <p className="text-slate-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest">Total Reviews</p>
            <p className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1">{stats.total_reviews}</p>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-slate-100 dark:border-gray-700 shadow-sm">
          <p className="text-slate-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">Rating Breakdown</p>
          <div className="space-y-1.5">
            {starCounts.map(({ star, count, pct }) => (
              <div key={star} className="flex items-center gap-2 text-xs">
                <span className="w-4 text-right font-bold text-slate-600 dark:text-gray-300">{star}</span>
                <Star size={10} className="fill-amber-400 text-amber-400 flex-shrink-0" />
                <div className="flex-1 h-2 bg-slate-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-5 text-slate-500 dark:text-gray-400 font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-slate-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-slate-800 dark:text-white">Patient Reviews</h3>
          <span className="text-xs text-slate-400 font-semibold">{stats.total_reviews} total</span>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <div className="w-8 h-8 border-4 border-amber-100 border-t-amber-500 rounded-full animate-spin mb-3" />
            <p className="text-sm font-semibold">Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Star className="w-14 h-14 text-slate-200 dark:text-gray-600 mb-4" />
            <p className="font-bold text-slate-500 dark:text-gray-400">No reviews yet</p>
            <p className="text-sm text-slate-400 mt-1">Reviews from patients will appear here after completed appointments.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50 dark:divide-gray-700/50">
            {reviews.map((review) => (
              <div key={review.id} className="p-6 hover:bg-slate-50/50 dark:hover:bg-gray-700/20 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Avatar */}
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 to-teal-500 flex items-center justify-center text-white font-bold text-base flex-shrink-0 shadow">
                      {review.patient_name ? review.patient_name.charAt(0).toUpperCase() : 'P'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 dark:text-white truncate">{review.patient_name || 'Anonymous'}</p>
                      <p className="text-xs text-slate-400">{formatDate(review.created_at)}</p>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex gap-0.5 flex-shrink-0">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={16}
                        className={s <= review.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-gray-200 text-gray-200 dark:fill-gray-600 dark:text-gray-600'}
                      />
                    ))}
                  </div>
                </div>

                {review.comment && (
                  <p className="mt-3 text-sm text-slate-600 dark:text-gray-300 leading-relaxed pl-14">
                    "{review.comment}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorReviews;
