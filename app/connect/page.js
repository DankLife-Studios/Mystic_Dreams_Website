import WhitelistSteps from "@/components/WhitelistSteps";
import ConnectSteps from "@/components/ConnectSteps";
import PageShell from "@/components/PageShell";
import CTASection from "@/components/CTASection";
import InfoNote from "@/components/InfoNote";
import DiscordButton from "@/components/DiscordButton";
import Link from "next/link";
import {
    CONNECT_STEPS,
    SITE,
    WHITELIST_STEPS,
} from "@/lib/site";

export const metadata = {
    title: "Get Started",
    description: `Whitelist and connect to ${SITE.name} on FiveM.`,
};

const QUICK_INFO = [
    { icon: "users", label: "Player slots", value: `${SITE.maxSlots}` },
    { icon: "discord", label: "Whitelist", value: "Discord-gated" },
    { icon: "shield", label: "Citizen role", value: "Required" },
    { icon: "gamepad", label: "Platform", value: "FiveM" },
];

export default function GetStartedPage() {
    const totalSteps = WHITELIST_STEPS.length + CONNECT_STEPS.length;

    return (
        <PageShell>
            <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
                {/* Main content */}
                <div className="min-w-0">
                    <header className="mb-8 space-y-3">
                        <p className="text-sm font-medium uppercase tracking-[0.25em] text-purple-400">
                            Join the city
                        </p>
                        <h1 className="font-display text-4xl font-bold tracking-tight text-white">
                            Get <span className="text-gradient">started</span>
                        </h1>
                        <p className="max-w-xl text-base text-slate-300">
                            {SITE.name} is Discord-whitelisted. Complete {totalSteps} steps below — whitelist on Discord, then connect in FiveM.
                        </p>
                    </header>

                    <InfoNote title="Important" className="mb-6">
                        Whitelist applications are reviewed in Discord. Our connection queue
                        verifies your Discord membership and <strong>Citizen</strong> role before
                        you join the server.
                    </InfoNote>

                    <div className="grid gap-6 lg:grid-cols-2">
                        <section id="whitelist" className="scroll-mt-24">
                            <div className="mb-4 flex items-center gap-3">
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400">
                                    <i className="fa-brands fa-discord text-sm" />
                                </span>
                                <div>
                                    <p className="text-sm font-medium text-purple-300">Step 1 · Discord</p>
                                    <h2 className="font-display text-xl font-semibold text-white">Whitelist</h2>
                                </div>
                            </div>
                            <WhitelistSteps />
                        </section>

                        <section id="fivem" className="scroll-mt-24">
                            <div className="mb-4 flex items-center gap-3">
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400">
                                    <i className="fa-regular fa-gamepad text-sm" />
                                </span>
                                <div>
                                    <p className="text-sm font-medium text-purple-300">Step 2 · FiveM</p>
                                    <h2 className="font-display text-xl font-semibold text-white">Connect in-game</h2>
                                </div>
                            </div>
                            <ConnectSteps />
                        </section>
                    </div>

                    <div className="mt-10">
                        <CTASection
                            contained
                            title="You're ready for Los Santos"
                            description="Log in to track whitelist status, characters, and vehicles."
                            primaryHref="/dashboard"
                            primaryLabel="Open dashboard"
                            showDiscord={false}
                        />
                    </div>
                </div>

                {/* Sticky sidebar info */}
                <aside className="hidden lg:block">
                    <div className="sticky top-[5.5rem] space-y-4">
                        <div className="card-layered p-6 border-purple-500/20">
                            <div className="absolute top-0 right-0 h-24 w-24 rounded-bl-3xl bg-gradient-to-bl from-purple-500/8 to-transparent" />
                            <p className="relative text-xs font-semibold uppercase tracking-[0.2em] text-purple-400">
                                Quick info
                            </p>
                            <div className="relative mt-4 space-y-3">
                                {QUICK_INFO.map((item) => (
                                    <div key={item.label} className="flex items-center gap-3">
                                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                                            <i className={`fa-regular fa-${item.icon} text-sm`} />
                                        </span>
                                        <div>
                                            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{item.label}</p>
                                            <p className="text-sm font-semibold text-white">{item.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="card-layered p-6 border-purple-500/20">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-400">
                                Need help?
                            </p>
                            <p className="mt-3 text-sm text-slate-300">
                                Join our Discord to get whitelisted, ask questions, and connect with the community.
                            </p>
                            <div className="mt-4">
                                <DiscordButton className="w-full" />
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </PageShell>
    );
}
