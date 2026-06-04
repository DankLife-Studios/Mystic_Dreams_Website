import { FEATURE_SECTIONS } from "@/lib/site";
import Icon from "./Icon";

export default function FeatureGrid({ variant = "grid" }) {
  if (variant === "list") {
    return (
      <div className="surface-card overflow-hidden">
        {FEATURE_SECTIONS.map((feature, index) => (
          <article
            key={feature.title}
            className={`feature-row items-start ${
              index < FEATURE_SECTIONS.length - 1 ? "" : ""
            }`}
          >
            <span className="icon-box icon-box-md shrink-0">
              <Icon name={feature.icon} size="sm" className="icon-fancy" />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="text-heading font-display text-base font-semibold">
                {feature.title}
              </h3>
              <p className="text-body mt-1 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {FEATURE_SECTIONS.map((feature) => (
        <article key={feature.title} className="surface-card p-5 sm:p-6">
          <span className="icon-box icon-box-md">
            <Icon name={feature.icon} size="sm" className="icon-fancy" />
          </span>
          <h3 className="text-heading font-display mt-4 text-base font-semibold">
            {feature.title}
          </h3>
          <p className="text-body mt-2 text-sm leading-relaxed">
            {feature.description}
          </p>
        </article>
      ))}
    </div>
  );
}
