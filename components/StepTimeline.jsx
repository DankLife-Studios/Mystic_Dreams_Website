import Link from "next/link";
import Icon from "./Icon";

/**
 * Vertical step list — whitelist, connect, etc.
 * @param {{ id: string|number, icon: string, label: string, title: string, description: string, link?: { href: string, label: string } }[]} steps
 */
export default function StepTimeline({ steps, footer }) {
  return (
    <div className="surface-card overflow-hidden">
      <ol className="step-timeline">
        {steps.map((step, index) => (
          <li
            key={step.id}
            className={`step-timeline-item ${
              index !== steps.length - 1 ? "step-timeline-item-border" : ""
            }`}
          >
            <div className="step-timeline-marker" aria-hidden>
              <span className="step-timeline-number">{step.label}</span>
            </div>
            <div className="step-timeline-body min-w-0 flex-1">
              <div className="flex items-start gap-3">
                <span className="icon-box icon-box-md shrink-0">
                  <Icon
                    name={step.icon}
                    size="sm"
                    duotone={step.icon !== "discord"}
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-heading font-display text-base font-semibold">
                    {step.title}
                  </h3>
                  <p className="text-body mt-1.5 text-sm leading-relaxed">
                    {step.description}
                  </p>
                  {step.link && (
                    <Link
                      href={step.link.href}
                      className="mt-3 inline-flex text-sm font-medium text-mystic hover:underline"
                    >
                      {step.link.label} →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ol>
      {footer && (
        <div className="border-t border-subtle bg-[var(--surface-muted)] px-5 py-5 sm:px-6">
          {footer}
        </div>
      )}
    </div>
  );
}
