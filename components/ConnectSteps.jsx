import Link from "next/link";
import { CONNECT_STEPS } from "@/lib/site";
import Icon from "./Icon";

export default function ConnectSteps() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {CONNECT_STEPS.map((step) => (
        <article
          key={step.number}
          className="surface-card group overflow-hidden rounded-2xl transition duration-300 hover:border-mystic/40 hover:shadow-lg hover:shadow-mystic/10"
        >
          <div className="flex items-center gap-3 border-b border-subtle bg-[var(--surface-muted)] px-5 py-3">
            <span className="icon-box icon-box-md">
              <Icon
                name={step.icon}
                size="md"
                duotone={step.icon !== "discord"}
              />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-mystic">
              Step {step.number}
            </span>
          </div>
          <div className="p-5">
            <h3 className="text-heading font-display text-base font-bold sm:text-lg">
              {step.title}
            </h3>
            <p className="text-body mt-2 text-sm leading-relaxed">
              {step.description}
            </p>
            {step.link && (
              <Link
                href={step.link.href}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-mystic transition hover:underline"
              >
                <Icon name="route" size="xs" />
                {step.link.label}
              </Link>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
