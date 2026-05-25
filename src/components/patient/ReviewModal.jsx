import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

const ReviewModal = ({ appointment, onClose, onReviewSubmitted }) => {
  const { token } = useSelector((state) => state.auth);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a star rating');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(
        'http://localhost:5000/api/reviews',
        {
          appointment_id: appointment.id,
          doctor_id: appointment.doctor_id,
          rating,
          comment
        },
        { headers: { Authorization: token } }
      );
      toast.success('Review submitted successfully! ⭐');
      onReviewSubmitted(appointment.id);
      onClose();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to submit review';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const starLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 w-full max-w-md animate-in fade-in zoom-in-95 duration-300">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="mb-6 text-center">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
            <Star className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-800 dark:text-white">Rate Your Visit</h3>
          <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">
            with <span className="font-bold text-slate-700 dark:text-gray-200">{appointment.doctor_name}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Star Rating */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  className="transition-transform hover:scale-125 focus:outline-none"
                >
                  <Star
                    size={36}
                    className={`transition-colors duration-150 ${
                      star <= (hovered || rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-gray-200 text-gray-200 dark:fill-gray-600 dark:text-gray-600'
                    }`}
                  />
                </button>
              ))}
            </div>
            {(hovered || rating) > 0 && (
              <span className="text-sm font-bold text-amber-500">
                {starLabels[hovered || rating]}
              </span>
            )}
          </div>

          {/* Comment */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-gray-300 uppercase tracking-wider mb-2">
              Your Experience (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Share details of your own experience at this place..."
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 text-slate-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none text-sm transition-all"
              maxLength={500}
            />
            <p className="text-xs text-right text-gray-400 mt-1">{comment.length}/500</p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || rating === 0}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Star size={16} className="fill-white" />
                Submit Review
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
