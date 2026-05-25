import React, { useState, useEffect } from 'react';
import { Star, Stethoscope, Calendar, CheckCheck, Clock, MessageSquare } from 'lucide-react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

const PatientReviews = () => {
  const { token } = useSelector((state) => state.auth);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const res = await axios.get(
        'http://localhost:5000/api/reviews/patient/my-reviews',
        { headers: { Authorization: token } }
      );
      if (res.data.success) {
        setReviews(res.data.reviews);
      }
    } catch (error) {
      console.error('Failed to load your reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [token]);

  // Real-time: when doctor reads reviews, update is_read flag
  useEffect(() => {
    const handleReviewsRead = ({ doctor_id }) => {
      setReviews((prev) =>
        prev.map((r) => r.doctor_id === doctor_id ? { ...r, is_read: true } : r)
      );
    };
    socket.on('reviewsRead', handleReviewsRead);
    return () => socket.off('reviewsRead', handleReviewsRead);
  }, []);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
    });

  const unreadCount = reviews.filter((r) => !r.is_read).length;
  const readCount = reviews.filter((r) => r.is_read).length;
  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="space-y-6" style={{ animation: 'fadeSlideUp 0.4s ease both' }}>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes starPop {
          0%   { transform: scale(0.5); opacity: 0; }
          70%  { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        .star-pop { animation: starPop 0.4s ease both; }
      `}</style>

      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 p-6 md:p-8 text-white shadow-xl shadow-amber-200/60 dark:shadow-amber-900/30">
        {/* decorative blobs */}
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-6">
          {/* Big star */}
          <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm flex flex-col items-center justify-center shadow-inner flex-shrink-0">
            <Star size={28} className="fill-white text-white mb-0.5" />
            <span className="text-2xl font-black leading-none">{avgRating ?? '—'}</span>
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-black tracking-tight mb-1">My Reviews</h2>
            <p className="text-white/80 text-sm font-medium mb-4">
              Reviews you've submitted after completed appointments
            </p>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3.5 py-1.5 text-sm font-bold">
                <MessageSquare size={13} />
                {reviews.length} Review{reviews.length !== 1 ? 's' : ''}
              </div>
              {readCount > 0 && (
                <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3.5 py-1.5 text-sm font-bold">
                  <CheckCheck size={13} />
                  {readCount} Read by doctor
                </div>
              )}
              {unreadCount > 0 && (
                <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3.5 py-1.5 text-sm font-bold">
                  <Clock size={13} />
                  {unreadCount} Pending read
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-gray-800 rounded-3xl border border-slate-100 dark:border-gray-700 shadow-sm">
          <div className="w-10 h-10 border-4 border-amber-100 border-t-amber-400 rounded-full animate-spin mb-4" />
          <p className="text-slate-400 dark:text-gray-500 font-semibold text-sm">Loading your reviews…</p>
        </div>

      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-amber-200 dark:border-gray-600 shadow-sm">
          <div className="w-20 h-20 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-5">
            <Star className="w-9 h-9 text-amber-300" />
          </div>
          <p className="font-bold text-slate-600 dark:text-gray-300 text-lg">No reviews yet</p>
          <p className="text-slate-400 dark:text-gray-500 text-sm mt-2 max-w-xs text-center">
            Complete an appointment and submit a review to see it here.
          </p>
        </div>

      ) : (
        <div className="space-y-4">
          {reviews.map((review, idx) => (
            <div
              key={review.id}
              className={`group relative bg-white dark:bg-gray-800 rounded-3xl border overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 ${
                review.is_read
                  ? 'border-slate-100 dark:border-gray-700'
                  : 'border-amber-200 dark:border-amber-700/50 ring-1 ring-amber-100 dark:ring-amber-900/30'
              }`}
              style={{ animation: `fadeSlideUp 0.35s ${idx * 0.07}s ease both` }}
            >
              {/* Left accent bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-3xl ${
                review.is_read ? 'bg-emerald-400' : 'bg-amber-400'
              }`} />

              <div className="pl-6 pr-5 py-5 flex gap-4 items-start">

                {/* Doctor Avatar */}
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-white font-black text-xl shadow-md shadow-blue-200 dark:shadow-blue-900/40 group-hover:scale-105 transition-transform duration-300">
                  {review.doctor_name ? review.doctor_name.charAt(0).toUpperCase() : 'D'}
                </div>

                {/* Body */}
                <div className="flex-1 min-w-0">

                  {/* Top row */}
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <h4 className="font-black text-slate-800 dark:text-white text-base leading-tight">
                      {review.doctor_name || 'Doctor'}
                    </h4>

                    {/* Read badge */}
                    {review.is_read ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800">
                        <CheckCheck size={11} />
                        Read by Doctor
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800 animate-pulse">
                        <Clock size={11} />
                        Pending read
                      </span>
                    )}
                  </div>

                  {/* Specialization */}
                  {review.doctor_specialization && (
                    <p className="text-xs text-blue-500 dark:text-blue-400 font-semibold flex items-center gap-1.5 mb-2.5">
                      <Stethoscope size={11} />
                      {review.doctor_specialization}
                    </p>
                  )}

                  {/* Stars */}
                  <div className="flex items-center gap-0.5 mb-2.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={15}
                        className={`star-pop ${s <= review.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-slate-100 text-slate-200 dark:fill-gray-700 dark:text-gray-700'}`}
                        style={{ animationDelay: `${s * 0.06}s` }}
                      />
                    ))}
                    <span className="ml-2 text-xs font-black text-slate-400 dark:text-gray-500">
                      {review.rating}/5
                    </span>
                  </div>

                  {/* Comment */}
                  {review.comment && (
                    <div className="bg-slate-50 dark:bg-gray-700/50 rounded-2xl px-4 py-3 mb-3 border border-slate-100 dark:border-gray-600">
                      <p className="text-sm text-slate-600 dark:text-gray-300 leading-relaxed italic">
                        "{review.comment}"
                      </p>
                    </div>
                  )}

                  {/* Dates row */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 dark:text-gray-500 font-semibold">
                    {review.appointment_date && (
                      <span className="flex items-center gap-1">
                        <Calendar size={11} className="text-slate-300 dark:text-gray-600" />
                        Appointment: {formatDate(review.appointment_date)}
                      </span>
                    )}
                    <span className="opacity-40">•</span>
                    <span>Reviewed: {formatDate(review.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientReviews;
