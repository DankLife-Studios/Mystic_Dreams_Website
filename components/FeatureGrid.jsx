import { FEATURE_SECTIONS } from "@/lib/site";
import Icon from "./Icon";

export default function FeatureGrid({ compact = false }) {
  return (
    <div
      className={
        compact
          ? "grid gap-4 sm:grid-cols-2"
          : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      }
    >
      {FEATURE_SECTIONS.map((feature, index) => (
        <article
          key={feature.title}
          className={`surface-card group relative overflow-hidden rounded-2xl transition duration-300 hover:border-mystic/40 hover:shadow-lg hover:shadow-mystic/10 ${
            !compact && index === 0 ? "lg:col-span-2" : ""
          }`}
        >
          <div className="relative p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <span className="icon-box icon-box-md icon-fancy">
                <Icon name={feature.icon} size="md" className="icon-fancy" />
              </span>
              <span className="font-display text-lg font-bold text-[var(--divider)] transition group-hover:text-mystic/40">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
            <h3 className="text-heading font-display mt-4 text-lg font-bold tracking-tight">
              {feature.title}
            </h3>
            <p className="text-body mt-2 text-sm leading-relaxed">
              {feature.description}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}
