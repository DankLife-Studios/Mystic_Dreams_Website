export default function SectionBlock({
    eyebrow,
    title,
    highlight,
    description,
    children,
    className = "",
}) {
    return (
        <section className={`px-4 sm:px-6 ${className}`}>
            <div className="max-w-2xl">
                {eyebrow && <p className="eyebrow">{eyebrow}</p>}
                <h2 className="text-heading font-display mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                    {title}{" "}
                    {highlight && <span className="text-gradient">{highlight}</span>}
                </h2>
                {description && (
                    <p className="text-body mt-3 text-sm leading-relaxed sm:text-base">
                        {description}
                    </p>
                )}
            </div>
            <div className="mt-8">{children}</div>
        </section>
    );
}
