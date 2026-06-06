import DiscordButton from "./DiscordButton";
import Link from "next/link";
import { SITE } from "@/lib/site";

export default function CTASection({
    title = "Step into Los Santos",
    description = `Join ${SITE.name} on Discord, get whitelisted, and jump into the city.`,
    primaryHref,
    primaryLabel,
    showDiscord = true,
    contained = false,
}) {
    const inner = (
        <div className="card-layered p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <h2 className="mt-2 text-xl font-bold text-[var(--text-primary)] sm:text-2xl" style={{ fontFamily: "var(--font-display)" }}>
                        {title}
                    </h2>
                    <p className="mt-2 max-w-lg text-sm leading-relaxed text-[var(--text-secondary)]">
                        {description}
                    </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                    {showDiscord && <DiscordButton />}
                    {primaryHref && primaryLabel && (
                        <Link href={primaryHref} className="btn-primary shadow-lg shadow-purple-500/20">
                            {primaryLabel}
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );

    if (contained) return inner;

    return (
        <div className="px-4 sm:px-6">{inner}</div>
    );
}
