import DiscordButton from "./DiscordButton";
import Icon from "./Icon";
import Link from "next/link";
import { SITE } from "@/lib/site";

export default function CTASection({
  title = "Ready to start your story?",
  description = `Join ${SITE.name} on Discord, get whitelisted, and step into Los Santos.`,
  primaryHref,
  primaryLabel,
  showDiscord = true,
}) {
  return (
    <div className="surface-card overflow-hidden rounded-2xl border-mystic/25 bg-[var(--surface-muted)]">
      <div className="flex flex-col items-start justify-between gap-4 px-5 py-5 sm:flex-row sm:items-center sm:px-6 sm:py-5">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-mystic">
            <Icon name="gem" size="xs" className="icon-fancy" />
            {SITE.tagline}
          </p>
          <h2 className="text-heading font-display mt-1 text-lg font-bold sm:text-xl">
            {title}
          </h2>
          <p className="text-body mt-1 text-sm">{description}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {showDiscord && (
            <DiscordButton className="!px-4 !py-2.5 !text-sm" />
          )}
          {primaryHref && primaryLabel && (
            <Link
              href={primaryHref}
              className="btn-secondary !px-4 !py-2.5 !text-sm"
            >
              {primaryLabel}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
