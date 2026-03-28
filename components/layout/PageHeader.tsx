import React from 'react';

interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  badge?: string;
  children?: React.ReactNode;
  className?: string;
}

export default function PageHeader({ title, description, badge, children, className = '' }: PageHeaderProps) {
  return (
    <section className={`relative overflow-hidden bg-[#050b14] text-white py-12 lg:py-16 ${className}`}>
      {/* Background glow effects */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-sky-400/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#050b14]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl">
          {badge && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
              <span className="text-[10px] md:text-xs font-dm-mono font-medium text-blue-200 tracking-[0.15em] uppercase">{badge}</span>
            </div>
          )}
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 font-barlow text-white">
            {title}
          </h1>
          
          {description && (
            <p className="text-[15px] md:text-[17px] font-light text-slate-300 leading-snug max-w-2xl">
              {description}
            </p>
          )}
          
          {children && (
            <div className="mt-8">
              {children}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
