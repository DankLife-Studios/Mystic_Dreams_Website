export default function PageShell({ children, narrow = false }) {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden page-bg-gradient">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 right-0 size-80 rounded-full bg-mystic/10 blur-3xl dark:bg-mystic/20"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 -left-24 size-64 rounded-full bg-mystic-dark/5 blur-3xl dark:bg-mystic-dark/15"
      />
      <div
        className={`relative mx-auto px-4 py-10 sm:px-6 sm:py-14 ${
          narrow ? "max-w-3xl" : "max-w-6xl"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
