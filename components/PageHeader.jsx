import Icon from "./Icon";

export default function PageHeader({
  eyebrow,
  eyebrowIcon,
  title,
  highlight,
  description,
  children,
  className = "",
}) {
  return (
    <header className={`mb-8 max-w-2xl ${className}`}>
      {eyebrow && (
        <p className="eyebrow inline-flex items-center gap-2">
          {eyebrowIcon && (
            <Icon name={eyebrowIcon} size="xs" className="icon-fancy" />
          )}
          {eyebrow}
        </p>
      )}
      <h1 className="text-heading font-display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}{" "}
        {highlight && <span className="text-gradient">{highlight}</span>}
      </h1>
      {description && (
        <p className="text-body mt-3 text-sm leading-relaxed sm:text-base">
          {description}
        </p>
      )}
      {children && (
        <div className="mt-6 flex flex-wrap gap-2">{children}</div>
      )}
    </header>
  );
}
