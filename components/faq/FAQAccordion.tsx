'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';

export interface FAQ {
  question: string;
  answer: string;
  relatedGuide?: {
    slug: string;
    label: string;
  };
}

interface FAQAccordionProps {
  faqs: FAQ[];
}

export default function FAQAccordion({ faqs }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="divide-y divide-slate-200">
      {faqs.map((faq, index) => (
        <div key={index}>
          <button
            onClick={() => toggle(index)}
            className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 transition-colors"
            aria-expanded={openIndex === index}
          >
            <span className="font-medium text-slate-900 pr-4">{faq.question}</span>
            <ChevronDown
              className={`h-5 w-5 text-slate-400 flex-shrink-0 transition-transform duration-200 ${
                openIndex === index ? 'rotate-180' : ''
              }`}
            />
          </button>
          
          <div
            className={`overflow-hidden transition-all duration-200 ${
              openIndex === index ? 'max-h-96' : 'max-h-0'
            }`}
          >
            <div className="px-6 pb-4 text-slate-600">
              <div 
                className="prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: faq.answer }} 
              />
              {faq.relatedGuide && (
                <Link href={`/guias/${faq.relatedGuide.slug}`} className="inline-block mt-2 text-blue-600 hover:text-blue-700 hover:underline font-medium">
                  {faq.relatedGuide.label} →
                </Link>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
