export default function SectionHeading({
  eyebrow,
  title,
  highlight,
  description,
  align = "center",
}) {
  const alignClass =
    align === "center" ? "text-center mx-auto" : "text-left";

  return (
    <div className={`max-w-2xl ${alignClass}`}>
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <h2 className="text-heading font-display text-2xl font-semibold tracking-tight sm:text-3xl">
        {title}{" "}
        {highlight && <span className="text-gradient">{highlight}</span>}
      </h2>
      {description && (
        <p className="text-body mt-3 text-base leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
