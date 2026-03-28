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
    <section className={`relative overflow-visible bg-gradient-to-b from-white via-slate-50 to-slate-200/40 text-slate-900 border-b border-slate-200/50 pt-20 pb-8 lg:pt-24 lg:pb-12 ${className}`}>
      {/* Background glow effects - Wrap in hidden container to allow content overflow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-300/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-sky-300/20 blur-[100px] rounded-full" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl">
          {badge && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 mb-6 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
              <span className="text-[10px] md:text-xs font-dm-mono font-medium text-blue-700 tracking-[0.2em] uppercase">{badge}</span>
            </div>
          )}
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-normal md:tracking-wide mb-4 font-barlow text-slate-900">
            {title}
          </h1>
          
          {description && (
            <p className="text-[15px] md:text-[17px] font-light text-slate-600 leading-snug max-w-2xl">
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
