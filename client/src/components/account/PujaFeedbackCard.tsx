"use client";

import { useState, useEffect } from "react";
import { Star, CheckCircle, Loader2, Heart, Edit3, PlusCircle, Trash2, X } from "lucide-react";

interface PujaFeedbackCardProps {
  order: any;
  onSubmitted?: (feedbackData: any) => void;
}

const RATING_DESCRIPTIONS: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very good",
  5: "Excellent",
};

export default function PujaFeedbackCard({ order, onSubmitted }: PujaFeedbackCardProps) {
  const existingFeedback = order?.feedback?.rating ? order.feedback : null;
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [editingFeedbackId, setEditingFeedbackId] = useState<string | null>(null);

  const [rating, setRating] = useState<number>(existingFeedback?.rating || 0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [review, setReview] = useState<string>(existingFeedback?.review || "");
  const [loading, setLoading] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(Boolean(existingFeedback?.rating));
  const [error, setError] = useState<string>("");

  // Styled modal confirmation state
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  const orderId = order?._id || order?.id;

  // Load all feedback entries for this order
  useEffect(() => {
    if (!orderId) return;
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";
    fetch(`${baseUrl}/api/orders/${orderId}/feedback`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.feedbacks) && data.feedbacks.length > 0) {
          setFeedbacks(data.feedbacks);
          setSubmitted(true);
        } else if (order?.feedbacks && Array.isArray(order.feedbacks) && order.feedbacks.length > 0) {
          setFeedbacks(order.feedbacks);
          setSubmitted(true);
        }
      })
      .catch(() => {
        if (order?.feedbacks && Array.isArray(order.feedbacks)) {
          setFeedbacks(order.feedbacks);
        }
      });
  }, [orderId, order?.feedbacks]);

  const activeRating = hoverRating || rating;
  const ratingText = activeRating ? RATING_DESCRIPTIONS[activeRating] : "Tap a star to rate";

  const executeDelete = async () => {
    if (!confirmDeleteId || !orderId) return;
    setDeleting(true);
    setError("");

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";
      const res = await fetch(`${baseUrl}/api/orders/${orderId}/feedback/${confirmDeleteId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const remaining = Array.isArray(data.feedbacks)
          ? data.feedbacks
          : feedbacks.filter((f) => (f._id || f.feedbackId) !== confirmDeleteId);
        setFeedbacks(remaining);
        setConfirmDeleteId(null);
        if (remaining.length === 0) {
          setSubmitted(false);
          setRating(0);
          setReview("");
          setEditingFeedbackId(null);
        }
      } else {
        setError(data.message || "Failed to delete review");
        setConfirmDeleteId(null);
      }
    } catch {
      setError("Something went wrong while deleting review");
      setConfirmDeleteId(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleStartEdit = (fb: any) => {
    setEditingFeedbackId(fb._id || fb.feedbackId || null);
    setRating(fb.rating || 5);
    setReview(fb.review || "");
    setSubmitted(false);
    setError("");
  };

  const handleStartNewReview = () => {
    setEditingFeedbackId(null);
    setRating(0);
    setHoverRating(0);
    setReview("");
    setSubmitted(false);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) {
      setError("Please select a star rating (1 to 5 stars)");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";
      const res = await fetch(`${baseUrl}/api/orders/${orderId}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating,
          review,
          feedbackId: editingFeedbackId,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitted(true);
        if (Array.isArray(data.feedbacks)) {
          setFeedbacks(data.feedbacks);
        } else if (data.data) {
          setFeedbacks((prev) => [data.data, ...prev.filter((f) => (f._id || f.feedbackId) !== data.data._id)]);
        }
        if (onSubmitted) onSubmitted(data.data);
      } else {
        setError(data.message || "Failed to submit review. Please try again.");
      }
    } catch {
      setError("Something went wrong while submitting your review.");
    } finally {
      setLoading(false);
    }
  };

  // ── Success State with All Reviews Display ──
  if (submitted && (feedbacks.length > 0 || rating > 0)) {
    const displayList =
      feedbacks.length > 0
        ? feedbacks
        : [{ rating, review, ratingLabel: RATING_DESCRIPTIONS[rating], createdAt: new Date() }];

    return (
      <div className="mt-4 sm:mt-5 p-3.5 sm:p-5 md:p-6 rounded-2xl bg-gradient-to-br from-[#FDFBF7] to-[#FAF5EC] border border-[#EFE5D3] shadow-xs animate-in fade-in zoom-in-95 duration-200">
        <div className="text-center mb-3 sm:mb-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2 shadow-2xs">
            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
          </div>
          <h4 className="text-sm sm:text-base font-bold text-gray-900 leading-snug">
            Your feedback is submitted successfully. Thank you!
          </h4>
          <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5">
            {displayList.length > 1
              ? `You have shared ${displayList.length} reviews for this sacred ritual`
              : "Thank you for sharing your divine experience"}
          </p>
        </div>

        {error && (
          <div className="mb-3 p-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError("")} className="text-red-500 hover:text-red-700">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* List of all reviews submitted by user */}
        <div className="space-y-2.5 sm:space-y-3 my-3 sm:my-4">
          {displayList.map((fb, idx) => {
            const fbRating = fb.rating || 5;
            const fbReview = fb.review || "";
            const fbId = fb._id || fb.feedbackId;
            const dateStr = fb.createdAt || fb.submittedAt
              ? new Date(fb.createdAt || fb.submittedAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
              : "";

            return (
              <div
                key={fbId || idx}
                className="p-3 sm:p-3.5 bg-white/95 rounded-xl border border-[#EDE0CC] text-left flex flex-col gap-2.5 shadow-2xs"
              >
                {/* Header row: Stars + Label on left, Date & Review # badge on right */}
                <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-stone-100/80 pb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${s <= fbRating ? "fill-amber-400 text-amber-400" : "text-gray-300"
                            }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-gray-800">
                      {RATING_DESCRIPTIONS[fbRating]}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-gray-400 shrink-0">
                    {dateStr && <span>{dateStr}</span>}
                    {displayList.length > 1 && (
                      <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                        Review #{displayList.length - idx}
                      </span>
                    )}
                  </div>
                </div>

                {/* Review Text */}
                {fbReview ? (
                  <p className="text-xs text-gray-700 italic break-words leading-relaxed">
                    &ldquo;{fbReview}&rdquo;
                  </p>
                ) : (
                  <p className="text-[11px] text-gray-400 italic">No written comment</p>
                )}

                {/* Actions row: Responsive on 320px screens */}
                <div className="flex items-center justify-end gap-2 pt-1 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(fb)}
                    className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(fbId)}
                    className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Blessings & Quote */}
        <div className="mt-3.5 pt-3 border-t border-[#EFE2CF] text-[11px] sm:text-xs text-stone-600 flex items-center justify-center gap-1.5 font-serif leading-relaxed text-center">
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 shrink-0" />
          <span>
            May the divine grace always shower upon you and your family. We look forward to serving you again! 🙏
          </span>
        </div>

        {/* Action to submit another review */}
        <div className="mt-3.5 pt-3 border-t border-dashed border-[#E5D7BF] flex items-center justify-center">
          <button
            type="button"
            onClick={handleStartNewReview}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-100/70 hover:bg-emerald-100 border border-emerald-300 transition shadow-2xs hover:shadow-xs cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-700" />
            <span>Write Another Review</span>
          </button>
        </div>

        {/* ── Custom Styled Delete Confirmation Modal ── */}
        {confirmDeleteId && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => {
              if (!deleting) setConfirmDeleteId(null);
            }}
          >
            <div
              className="relative w-full max-w-sm bg-white rounded-2xl p-5 sm:p-6 shadow-2xl border border-stone-200 text-center animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3 shadow-2xs">
                <Trash2 className="w-6 h-6" strokeWidth={2.2} />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                Delete Review?
              </h3>
              <p className="text-xs text-gray-500 mb-5 leading-relaxed">
                Are you sure you want to delete this review? This action cannot be undone.
              </p>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => setConfirmDeleteId(null)}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={executeDelete}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <span>Delete</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Feedback Entry / Edit Form ──
  return (
    <div className="mt-4 sm:mt-5 p-3.5 sm:p-5 md:p-6 rounded-2xl bg-white border border-gray-200 shadow-xs animate-in fade-in duration-200">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div>
          <h4 className="text-sm sm:text-base font-bold text-gray-900">
            {editingFeedbackId
              ? "Edit your review"
              : feedbacks.length > 0
                ? "Write another review"
                : "Rate & review this puja"}
          </h4>
          <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
            Your review helps other devotees choose the right puja
          </p>
        </div>
        {(feedbacks.length > 0 || submitted) && (
          <button
            type="button"
            onClick={() => {
              setSubmitted(true);
              setEditingFeedbackId(null);
            }}
            className="text-xs text-stone-500 hover:text-stone-800 font-semibold underline cursor-pointer"
          >
            Back to reviews
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star Rating Section */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            {[1, 2, 3, 4, 5].map((starValue) => {
              const isFilled = (hoverRating || rating) >= starValue;
              return (
                <button
                  key={starValue}
                  type="button"
                  onClick={() => setRating(starValue)}
                  onMouseEnter={() => setHoverRating(starValue)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 -m-1 focus:outline-none transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                  aria-label={`${starValue} star`}
                >
                  <Star
                    className={`w-6 h-6 sm:w-8 sm:h-8 transition-colors ${isFilled
                      ? "fill-amber-400 text-amber-400"
                      : "text-gray-300 stroke-[1.5]"
                      }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Rating Dynamic Label */}
          <p
            className={`text-xs font-semibold ${activeRating ? "text-stone-700" : "text-gray-400"
              }`}
          >
            {ratingText}
          </p>
        </div>

        {/* Optional Review Textarea */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">
            Write your review <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <textarea
            rows={3}
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="How was the puja, the sankalpam and the video?"
            className="w-full border border-gray-200 rounded-xl px-3 sm:px-3.5 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition resize-none font-medium"
          />
        </div>

        {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

        {/* Submit Review Button */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="submit"
            disabled={loading || !rating}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#00B05F] hover:bg-[#009651] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold py-2.5 px-6 rounded-xl transition shadow-xs hover:shadow-md cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>{editingFeedbackId ? "Update Review" : "Submit Review"}</span>
            )}
          </button>
          {(feedbacks.length > 0 || submitted) && (
            <button
              type="button"
              onClick={() => {
                setSubmitted(true);
                setEditingFeedbackId(null);
              }}
              className="text-xs text-stone-500 hover:text-stone-800 font-semibold px-3 py-2 rounded-lg hover:bg-stone-100 transition cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
