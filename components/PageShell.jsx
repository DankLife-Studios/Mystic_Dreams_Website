export default function PageShell({ children, narrow = false }) {
    return (
        <div className={`page-texture ${narrow ? "max-w-3xl" : ""}`}>
            <div className="relative z-[1] px-4 py-10 sm:px-6 sm:py-12">
                {children}
            </div>
        </div>
    );
}
