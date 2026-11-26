"use client";

import React, { useState } from "react";

const faqList = [
  {
    question: "What is an online puja and how does it work?",
    answer: "An online puja is performed on your behalf by our experienced pandits at sacred temples. You will receive a personalized video of your sankalpa via WhatsApp."
  },
  {
    question: "Do I need to be present during the puja?",
    answer: "No, your physical presence is not required. The pandits take your name, gotra, and sankalpa before performing the sacred rituals on your behalf."
  },
  {
    question: "What details do I need to provide when booking?",
    answer: "You will need to provide your full name, WhatsApp mobile number, date of birth, and optional gotra or zodiac details for the sankalpa."
  },
  {
    question: "Can I book a puja for my family members?",
    answer: "You may arrange a puja for a family member. The number of devotees covered and any additional charges depend on the selected booking package. Please review the package details or contact Devotee Care before booking."
  },
  {
    question: "Will the puja be live-streamed?",
    answer: "The current service includes a recorded puja video rather than guaranteed live streaming. Any additional viewing arrangements will be mentioned separately if available for the selected ritual."
  },
  {
    question: "What happens after I complete my booking?",
    answer: "Once booked, you will receive an instant confirmation on WhatsApp. On the puja date, our pandits perform your sankalpa and share video proof within 48 hours."
  },
  {
    question: "How do I know the ritual was performed on my behalf?",
    answer: "Your personal details are included in the Sankalpa as applicable to the selected ritual. A puja recording is shared after the ceremony so you can view the ritual performed."
  }
];

function AccordionItem({
  question,
  answer,
  isOpen,
  onToggle
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      onClick={onToggle}
      className={`border rounded-xl px-5 py-4 transition-all duration-300 cursor-pointer select-none ${
        isOpen ? 'border-accent shadow-sm bg-white' : 'border-gray-200 bg-[#faf9f6] hover:bg-white'
      }`}
    >
      <div className="flex justify-between items-center">
        <h4 className={`text-sm sm:text-base font-bold transition-colors ${isOpen ? 'text-accent' : 'text-gray-800'}`}>
          {question}
        </h4>
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ml-4 transition-all ${
            isOpen ? 'bg-accent text-white' : 'bg-gray-200 text-gray-600'
          }`}
        >
          {isOpen ? '−' : '+'}
        </div>
      </div>
      {isOpen && (
        <div className="mt-3 text-xs sm:text-sm text-gray-600 leading-relaxed pr-6 border-t border-gray-100 pt-3 animate-fade-in-up">
          {answer}
        </div>
      )}
    </div>
  );
}

export default function FaqSection() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  return (
    <section id="faq-section" className="py-16 bg-white">
      <div className="max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-10 flex flex-col md:flex-row gap-12">
        {/* Left: Doubts */}
        <div className="md:w-1/3">
          <h2 className="text-4xl md:text-5xl font-bold text-[#4a2e21] font-serif mb-4 leading-tight">
            Doubts?<br />We&apos;re Here.
          </h2>
          <p className="text-gray-600 mb-8 text-sm max-w-[250px]">
            Our devotee care team is available 24/7. Reach them on WhatsApp, phone, or email.
          </p>
          <a
            href="tel:+919677391108"
            className="inline-block bg-[#00B05F] text-white px-8 py-3 rounded-full font-bold shadow-md hover:bg-[#008F4C] transition-colors text-center"
          >
            Speak to Devotee Care
          </a>
        </div>

        {/* Right: Accordion */}
        <div className="md:w-2/3 flex flex-col gap-3">
          {faqList.map((faq, idx) => (
            <AccordionItem
              key={idx}
              question={faq.question}
              answer={faq.answer}
              isOpen={openFaqIndex === idx}
              onToggle={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
