import Icon from "./Icon";

export default function InfoNote({
  title,
  children,
  tone = "default",
  className = "",
}) {
  const tones = {
    default: "border-mystic/25 bg-mystic/5",
    warn: "border-amber-500/30 bg-amber-500/8",
  };

  return (
    <div
      className={`flex gap-3 rounded-2xl border px-5 py-4 ${tones[tone] || tones.default} ${className}`}
    >
      <span className="icon-box icon-box-md shrink-0">
        <Icon
          name={tone === "warn" ? "circle-xmark" : "circle-info"}
          size="md"
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
