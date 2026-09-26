"use client";

import React, { useState, useEffect, useRef } from "react";

export type Review = {
  _id: string;
  name: string;
  location: string;
  content: string;
  type: 'text' | 'video';
  videoUrl?: string;
  avatarUrl?: string;
  rating?: number;
};

const ReviewCard = ({ review }: { review: Review }) => {
  const isVideo = review.type === 'video';
  const isDirectVideo = review.videoUrl && (
    review.videoUrl.includes('.mp4') ||
    review.videoUrl.includes('.webm') ||
    review.videoUrl.includes('.ogg') ||
    review.videoUrl.startsWith('/videos/') ||
    review.videoUrl.startsWith('/')
  );

  return (
    <div className="flex flex-col w-[320px] shrink-0">
      {isVideo ? (
        <div className="w-full h-[200px] rounded-2xl overflow-hidden shadow-sm mb-5 bg-black relative border border-gray-100">
          {isDirectVideo ? (
            <video
              src={review.videoUrl}
              controls
              className="w-full h-full object-cover"
            />
          ) : (
            <iframe
              src={review.videoUrl
                ? review.videoUrl.replace('watch?v=', 'embed/')
                : "https://player.vimeo.com/video/414764881?autoplay=0&title=0&byline=0&portrait=0"}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Video Review"
            />
          )}
        </div>
      ) : (
        <div className="w-full h-[200px] bg-white border border-gray-200 rounded-2xl p-8 shadow-md mb-5 flex items-center justify-center text-left overflow-hidden hover:shadow-lg transition-shadow">
          <div className="overflow-y-auto max-h-[136px] w-full custom-scrollbar">
            <p className="text-gray-900 italic text-[16px] font-semibold leading-[1.7]">
              {review.content}
            </p>
          </div>
        </div>
      )}

      <div className="px-2">
        <h4 className="font-extrabold text-black text-base leading-none">{review.name}</h4>
      </div>
    </div>
  );
};

export default function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetch("/api/reviews")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setReviews(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getCardWidth = () => {
    if (scrollRef.current) {
      const firstCard = scrollRef.current.children[0] as HTMLElement;
      if (firstCard) {
        const gap = 32;
        return firstCard.offsetWidth + gap;
      }
    }
    return 340 + 32;
  };

  useEffect(() => {
    if (reviews.length <= 1) return;

    const interval = setInterval(() => {
      if (scrollRef.current) {
        const container = scrollRef.current;
        const nextIndex = (currentIndex + 1) % reviews.length;
        const cardWidth = getCardWidth();

        container.scrollTo({
          left: nextIndex * cardWidth,
          behavior: 'smooth'
        });
        setCurrentIndex(nextIndex);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [reviews, currentIndex]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const cardWidth = getCardWidth();
      const newIndex = direction === 'left'
        ? Math.max(0, currentIndex - 1)
        : Math.min(reviews.length - 1, currentIndex + 1);

      container.scrollTo({
        left: newIndex * cardWidth,
        behavior: 'smooth'
      });
      setCurrentIndex(newIndex);
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Loading reviews...</div>;
  }

  if (!reviews.length) {
    return null;
  }

  return (
    <div className="relative max-w-full mx-auto px-10">
      <button
        onClick={() => handleScroll('left')}
        className="absolute left-0 top-[100px] -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.1)] flex items-center justify-center text-gray-600 hover:text-black z-10 hover:scale-110 transition-transform"
      >
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>

      <div
        ref={scrollRef}
        className="flex gap-8 overflow-x-hidden scroll-smooth pb-8 pt-4 px-2 -mx-2"
      >
        {reviews.map((review) => (
          <ReviewCard key={review._id} review={review} />
        ))}
      </div>

      <button
        onClick={() => handleScroll('right')}
        className="absolute right-0 top-[100px] -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.1)] flex items-center justify-center text-gray-600 hover:text-black z-10 hover:scale-110 transition-transform"
      >
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>

      <div className="flex justify-center gap-2 mt-4">
        {reviews.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setCurrentIndex(idx);
              if (scrollRef.current) {
                scrollRef.current.scrollTo({
                  left: idx * getCardWidth(),
                  behavior: 'smooth'
                });
              }
            }}
            className={`h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-6 bg-[#6869F9]' : 'w-2 bg-gray-300'}`}
          />
        ))}
      </div>
    </div>
  );
}
