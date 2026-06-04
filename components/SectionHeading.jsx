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
    <div className={`max-w-3xl ${alignClass}`}>
      {eyebrow && (
        <p className="badge-pill mb-4 inline-flex">{eyebrow}</p>
      )}
      <h2 className="text-heading font-display text-3xl font-bold tracking-tight sm:text-4xl">
        {title}{" "}
        {highlight && <span className="text-gradient">{highlight}</span>}
      </h2>
      {description && (
        <p className="text-body mt-4 text-lg leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
