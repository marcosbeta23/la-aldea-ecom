'use client';

import React, { useState, useEffect } from 'react';

interface Category {
  id: string;
  title: string;
  icon: string;
}

interface FAQNavProps {
  categories: Category[];
}

export default function FAQNav({ categories }: FAQNavProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Basic hash tracking for instant highlight
    if (window.location.hash) {
      setActiveId(window.location.hash.slice(1));
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-10% 0px -70% 0px', // Adjust to trigger when section is in top part of screen
        threshold: 0,
      }
    );

    categories.forEach((cat) => {
      const el = document.getElementById(cat.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [categories]);

  const handleClick = (id: string) => {
    setActiveId(id);
  };

  return (
    <nav className="flex gap-2 mb-8 overflow-x-auto pb-4 pt-2 scrollbar-hide sm:flex-wrap sm:overflow-x-visible sm:pb-0 sticky top-0 bg-white/50 backdrop-blur-md z-20 -mx-4 px-4 sm:relative sm:top-0 sm:bg-transparent sm:backdrop-blur-none sm:mx-0 sm:px-0">
      {categories.map((category) => {
        const isActive = activeId === category.id;
        return (
          <a
            key={category.id}
            href={`#${category.id}`}
            onClick={() => handleClick(category.id)}
            className={`
              shrink-0 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold 
              transition-all duration-300 border shadow-sm ring-1 ring-black/5 flex items-center gap-2
              ${isActive 
                ? 'bg-blue-600 text-white border-blue-600 shadow-blue-200/50 scale-105' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 hover:shadow-md'
              }
            `}
          >
            <span className="text-lg">{category.icon}</span> {category.title}
          </a>
        );
      })}
    </nav>
  );
}
