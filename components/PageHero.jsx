import Icon from "./Icon";

export default function PageHero({
  badge,
  badgeIcon = "gem",
  title,
  highlight,
  description,
  children,
}) {
  return (
    <header className="surface-card mb-8 overflow-hidden rounded-3xl sm:mb-10">
      <div className="border-b border-subtle bg-[var(--surface-muted)] px-6 py-6 sm:px-8 sm:py-7">
        {badge && (
          <p className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-mystic">
            <Icon name={badgeIcon} size="xs" className="icon-fancy" />
            {badge}
          </p>
        )}
        <h1 className="text-heading font-display mt-2 text-2xl font-bold tracking-tight sm:text-4xl">
          {title}{" "}
          {highlight && <span className="text-gradient">{highlight}</span>}
        </h1>
        {description && (
          <p className="text-body mt-3 max-w-2xl text-sm leading-relaxed sm:text-base">
            {description}
          </p>
        )}
        {children && (
          <div className="mt-5 flex flex-wrap gap-3">{children}</div>
        )}
      </div>
    </header>
  );
}
