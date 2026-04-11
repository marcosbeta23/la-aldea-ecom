export default function HeroSection({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <section
      className={className || "relative overflow-hidden flex items-center touch-pan-y min-h-svh"}
    >
      {children}
    </section>
  );
}