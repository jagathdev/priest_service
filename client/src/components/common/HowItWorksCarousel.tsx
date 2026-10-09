"use client";

import { useState } from "react";

export interface HowItWorksStep {
  title?: string;
  description?: string;
  imageSrc: string;
  imageAlt: string;
  tag?: string;
  cta?: string;
}

interface HowItWorksCarouselProps {
  title: string;
  steps: HowItWorksStep[];
}

export default function HowItWorksCarousel({ title, steps }: HowItWorksCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeStep = steps[activeIndex];
  const previousStep = steps[(activeIndex - 1 + steps.length) % steps.length];
  const nextStep = steps[(activeIndex + 1) % steps.length];

  const goToPrevious = () => {
    setActiveIndex((index) => (index === 0 ? steps.length - 1 : index - 1));
  };

  const goToNext = () => {
    setActiveIndex((index) => (index === steps.length - 1 ? 0 : index + 1));
  };

  return (
    <section id="how-it-works" className="mt-20">
      <h2 className="mb-10 text-2xl font-bold text-[#1f1f1f] md:text-3xl">
        {title}
      </h2>

      <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.95fr]">
        <div className="space-y-10">
          {steps.map((step, index) => {
            const isActive = index === activeIndex;

            return (
              <div
                key={`${step.title || index}-${index}`}
                className="flex w-full gap-4 text-left"
              >
                <span
                  className="mt-0.5 flex h-8 w-12 shrink-0 items-center pl-3 text-sm font-black text-white shadow-sm bg-[#5B5BF6]"
                  style={{ clipPath: "polygon(0 0, 78% 0, 100% 50%, 78% 100%, 0 100%)" }}
                >
                  {index + 1}
                </span>
                <span>
                  {step.title && (
                    <span className={`block text-xl font-black transition-colors ${isActive ? "text-[#101828]" : "text-[#1f1f1f]"}`}>
                      {step.title}
                    </span>
                  )}
                  {step.description && (
                    <span className="mt-2 block max-w-2xl text-base leading-7 text-gray-500">
                      {step.description}
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-6">
          <div className="relative h-[460px] w-full overflow-hidden rounded-[26px] bg-[#5B5BF6] px-8 py-10 shadow-[0_18px_48px_rgba(91,91,246,0.30)] flex items-center justify-center">
            <div className="pointer-events-none absolute left-0 top-1/2 hidden w-32 -translate-y-1/2 overflow-hidden rounded-xl bg-white opacity-40 blur-[2px] md:block transition-all duration-500" key={`prev-${activeIndex}`}>
              <img src={previousStep.imageSrc} alt="" className="h-48 w-full object-cover" />
            </div>
            <div className="pointer-events-none absolute right-0 top-1/2 hidden w-32 -translate-y-1/2 overflow-hidden rounded-xl bg-white opacity-40 blur-[2px] md:block transition-all duration-500" key={`next-${activeIndex}`}>
              <img src={nextStep.imageSrc} alt="" className="h-48 w-full object-cover" />
            </div>

            <div key={`main-${activeIndex}`} className="relative z-10 w-full max-w-[310px] h-[400px] rounded-xl shadow-[0_18px_44px_rgba(91,91,246,0.25)] overflow-hidden bg-transparent flex items-center justify-center animate-fadeIn">
              <img
                src={activeStep.imageSrc}
                alt={activeStep.imageAlt}
                className="w-full h-full object-contain rounded-xl"
              />
            </div>

            <button
              type="button"
              onClick={goToPrevious}
              aria-label="Previous how it works step"
              className="absolute left-6 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white shadow-lg transition hover:bg-black/65"
            >
              <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5 ml-[-2px]">
                <path d="m12.5 4.5-5 5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={goToNext}
              aria-label="Next how it works step"
              className="absolute right-6 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white shadow-lg transition hover:bg-black/65"
            >
              <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5 mr-[-2px]">
                <path d="m7.5 4.5 5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <div className="flex justify-center gap-3">
            {steps.map((step, index) => (
              <button
                key={`${step.title || 'step'}-${index}-dot`}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Go to how it works step ${index + 1}`}
                className={`h-2.5 rounded-full transition-all duration-200 ${
                  index === activeIndex ? "w-7 bg-[#6869F9]" : "w-2.5 bg-gray-200 hover:bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

