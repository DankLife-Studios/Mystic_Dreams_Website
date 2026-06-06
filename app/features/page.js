import PageShell from "@/components/PageShell";
import CTASection from "@/components/CTASection";
import Icon from "@/components/Icon";
import Link from "next/link";
import { FEATURE_SECTIONS } from "@/lib/site";

const DIFFERENTIATORS = [
    {
        icon: "building",
        title: "Custom MLO Interiors",
        desc: "We don't use base GTA interiors. Every business, police station, hospital, mechanic shop, and casino has a hand-picked or custom-built MLO — the city feels unique the moment you step inside.",
    },
    {
        icon: "car",
        title: "Hundreds of Custom Vehicles",
        desc: "From classic muscle to JDM imports, LEO cruisers to civilian workhorses — our vehicle roster is curated and constantly growing. No vanilla traffic here.",
    },
    {
        icon: "gem",
        title: "Handcrafted, Not Copy-Pasted",
        desc: "Every script on our server has been configured from scratch. No leaked code, no generic configs — systems built specifically for our community's roleplay style.",
    },
    {
        icon: "users",
        title: "Staff That Actually Play",
        desc: "Our staff team is active in-city daily. Reports get handled, rules get enforced, and the community voice shapes where the server goes next.",
    },
];

export const metadata = {
    title: "About Us",
};

export default function AboutPage() {
    return (
        <PageShell>
            {/* Hero — bold pitch */}
            <div className="mb-14">
                <p className="eyebrow inline-flex items-center gap-2">
                    <Icon name="gem" size="xs" className="icon-fancy" />
                    About Mystic Dreams
                </p>
                <h1 className="mt-3 text-4xl font-bold tracking-tight text-[var(--text-primary)] sm:text-5xl" style={{ fontFamily: "var(--font-display)" }}>
                    We are not like{" "}
                    <span className="text-gradient">the other servers</span>
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--text-secondary)]">
                    Most FiveM servers drop you into vanilla Los Santos with copy-pasted scripts and call it a day.
                    We&apos;ve spent years building a custom city — unique interiors, curated vehicles, and systems that
                    actually make sense together. This isn&apos;t just another server. This is home.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                    <Link href="/connect" className="btn-primary shadow-lg shadow-purple-500/20">
                        <Icon name="gamepad" size="sm" />
                        Join the city
                    </Link>
                    <Link href="/dashboard" className="btn-secondary">
                        <Icon name="gauge" size="sm" />
                        Dashboard
                    </Link>
                </div>
            </div>

            {/* What sets us apart */}
            <section className="border-t border-[var(--divider)] pt-12 mb-14">
                <p className="eyebrow">What sets us apart</p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl" style={{ fontFamily: "var(--font-display)" }}>
                    Built different,{" "}
                    <span className="text-gradient">by design</span>
                </h2>

                <div className="mt-8 grid gap-6 sm:grid-cols-2">
                    {DIFFERENTIATORS.map((item) => (
                        <div key={item.title} className="relative overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 shadow-lg transition-all duration-300 hover:border-purple-500/30 hover:shadow-xl">
                            <div className="absolute top-0 right-0 h-24 w-24 rounded-bl-3xl bg-gradient-to-bl from-purple-500/[0.05] to-transparent" />
                            <span className="icon-box icon-box-md relative">
                                <Icon name={item.icon} size="sm" className="icon-fancy" />
                            </span>
                            <h3 className="relative mt-4 text-base font-semibold text-[var(--text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
                                {item.title}
                            </h3>
                            <p className="relative mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                                {item.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* In-depth systems breakdown */}
            <section className="border-t border-[var(--divider)] pt-12 mb-14">
                <p className="eyebrow">Everything you can do</p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl" style={{ fontFamily: "var(--font-display)" }}>
                    {FEATURE_SECTIONS.length} systems.{" "}
                    <span className="text-gradient">One city.</span>
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                    Every system is interconnected — your actions in one area ripple through the entire city economy.
                </p>

                <div className="mt-8 space-y-4">
                    {FEATURE_SECTIONS.map((feature, i) => (
                        <div key={feature.title} className="group relative overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5 shadow-md transition-all duration-300 hover:border-purple-500/30 hover:shadow-lg sm:p-6">
                            <div className="flex flex-col gap-4 sm:flex-row sm:gap-5">
                                <div className="flex items-start gap-4 sm:w-64 shrink-0">
                                    <span className="icon-box icon-box-md shrink-0">
                                        <Icon name={feature.icon} size="sm" className="icon-fancy" />
                                    </span>
                                    <div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                                            0{i + 1}
                                        </span>
                                        <h3 className="text-base font-semibold text-[var(--text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
                                            {feature.title}
                                        </h3>
                                    </div>
                                </div>
                                <p className="text-sm leading-relaxed text-[var(--text-secondary)] sm:pt-1">
                                    {feature.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <CTASection
                contained
                title="Ready to see it for yourself?"
                description="Get whitelisted, connect to FiveM, and step into a city that was built for players who take roleplay seriously."
                primaryHref="/connect"
                primaryLabel="Get whitelisted"
            />
        </PageShell>
    );
}
