import { FEATURE_SECTIONS } from "@/lib/site";
import Icon from "./Icon";

export default function FeatureGrid({ variant = "grid" }) {
    if (variant === "list") {
        return (
            <div className="card-layered overflow-hidden">
                {FEATURE_SECTIONS.map((feature, index) => (
                    <article
                        key={feature.title}
                        className={`feature-row items-start ${index < FEATURE_SECTIONS.length - 1 ? "" : ""
                            }`}
                    >
                        <span className="icon-box icon-box-md icon-gradient shrink-0">
                            <Icon name={feature.icon} size="sm" className="icon-fancy" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-semibold text-[var(--text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
                                {feature.title}
                            </h3>
                            <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
                                {feature.description}
                            </p>
                        </div>
                        <span className="hidden shrink-0 self-center text-xs text-[var(--text-muted)] sm:inline">
                            {String(index + 1).padStart(2, "0")}
                        </span>
                    </article>
                ))}
            </div>
        );
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURE_SECTIONS.map((feature) => (
                <article key={feature.title} className="feature-card-deep group">
                    <span className="icon-box icon-box-md icon-gradient">
                        <Icon name={feature.icon} size="sm" className="icon-fancy" />
                    </span>
                    <h3 className="mt-4 text-sm font-semibold text-[var(--text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
                        {feature.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-[var(--text-secondary)]">
                        {feature.description}
                    </p>
                </article>
            ))}
        </div>
    );
}
