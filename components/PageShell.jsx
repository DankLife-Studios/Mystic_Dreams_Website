export default function PageShell({ children, narrow = false }) {
  return (
    <div className="relative min-h-[calc(100vh-3.5rem)]">
      <div
        className={`relative mx-auto px-4 py-10 sm:px-6 sm:py-12 ${
          narrow ? "max-w-3xl" : "max-w-6xl"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
