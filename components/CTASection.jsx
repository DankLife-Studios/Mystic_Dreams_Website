import DiscordButton from "./DiscordButton";
import Link from "next/link";
import { SITE } from "@/lib/site";

export default function CTASection({
    title = "Ready to start your story?",
    description = `Join ${SITE.name} on Discord, get whitelisted, and step into Los Santos.`,
    primaryHref,
    primaryLabel,
    showDiscord = true,
    contained = false,
}) {
    const inner = (
        <div className="surface-card flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="min-w-0">
                <p className="eyebrow">{SITE.tagline}</p>
                <h2 className="text-heading font-display mt-2 text-xl font-semibold sm:text-2xl">
                    {title}
                </h2>
                <p className="text-body mt-2 max-w-lg text-sm leading-relaxed">
                    {description}
                </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
                {showDiscord && <DiscordButton />}
                {primaryHref && primaryLabel && (
                    <Link href={primaryHref} className="btn-secondary">
                        {primaryLabel}
                    </Link>
                )}
            </div>
        </div>
    );

    if (contained) return inner;

    return (
        <div className="px-4 sm:px-6">{inner}</div>
    );
}
