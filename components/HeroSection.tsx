import HeroViewportLock from './HeroViewportLock';

export default function HeroSection({
  children,
  className,
  lockId = 'hero-section',
}: {
  children: React.ReactNode;
  className?: string;
  lockId?: string;
}) {
  const baseClassName = 'relative overflow-hidden flex w-full touch-pan-y min-h-screen';

  return (
    <section
      data-hero-lock-id={lockId}
      className={className ? `${baseClassName} ${className}` : baseClassName}
    >
      <HeroViewportLock lockId={lockId} />
      {children}
    </section>
  );
}