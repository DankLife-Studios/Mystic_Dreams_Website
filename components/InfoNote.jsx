import Icon from "./Icon";

export default function InfoNote({
    title,
    children,
    tone = "default",
    className = "",
}) {
    const tones = {
        default: "border-[var(--border)] bg-[var(--surface-muted)]",
        warn: "border-amber-500/25 bg-amber-500/5",
    };

    return (
        <div
            className={`card-layered flex gap-3 p-4 sm:p-5 ${tones[tone] || tones.default} ${className}`}
        >
            <span className="icon-box icon-box-md shrink-0">
                <Icon
                    name={tone === "warn" ? "circle-xmark" : "circle-info"}
                    size="sm"
                />
            </span>
            <div className="min-w-0 text-sm">
                {title && (
                    <p className="text-heading font-display font-semibold">{title}</p>
                )}
                <div className="text-body leading-relaxed [&_strong]:text-heading [&_strong]:font-semibold">
                    {children}
                </div>
            </div>
        </div>
    );
}
