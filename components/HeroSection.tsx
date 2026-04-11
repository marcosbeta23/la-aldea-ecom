export default function HeroSection({ children, className }: { children: React.ReactNode; className?: string }) {
  const baseClassName = 'relative overflow-hidden flex items-center touch-pan-y min-h-svh';

  return (
    <section
      className={className ? `${baseClassName} ${className}` : baseClassName}
    >
      {children}
    </section>
  );
}