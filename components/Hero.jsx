import Image from "next/image";
import Link from "next/link";
import DiscordButton from "./DiscordButton";
import MeshBackground from "./MeshBackground";
import Icon from "./Icon";
import { SITE, HERO_TAGS, STAT_ITEMS } from "@/lib/site";

export default function Hero() {
    return (
        <section className="hero-enhanced relative w-full">
            <MeshBackground variant="hero" />
            <div className="relative z-10 px-4 py-6 sm:px-6 sm:py-10 lg:py-12">
                <div className="mx-auto max-w-4xl">
                    {/* Badge */}
                    <div className="flex justify-center lg:justify-start">
                        <span className="badge-glow animate-fade-up">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                            </span>
                            {SITE.maxSlots} Slots • Live Now
                        </span>
                    </div>

                    <div className="hero-grid">
                        <div className="text-center lg:text-left">
                            <h1 className="animate-fade-up mt-2 text-3xl font-bold tracking-tight sm:text-5xl lg:text-6xl" style={{ fontFamily: "var(--font-display)" }}>
                                <span className="text-gradient">{SITE.name}</span>
                            </h1>
                            <p className="animate-fade-up animate-delay-2 mt-4 max-w-xl mx-auto lg:mx-0 text-sm sm:text-base leading-relaxed text-[var(--text-secondary)]">
                                {SITE.description}
                            </p>
                            <div className="hero-actions animate-fade-up animate-delay-3 mt-6 flex flex-wrap gap-2 sm:gap-3 justify-center lg:justify-start">
                                <Link href="/connect" className="btn-primary shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-shadow text-sm sm:text-base">
                                    <Icon name="gamepad" size="sm" />
                                    Get Started
                                </Link>
                                <DiscordButton />
                                <Link href="/features" className="btn-secondary text-sm sm:text-base">
                                    <Icon name="sparkles" size="sm" />
                                    About Us
                                </Link>
                            </div>
                            <ul className="hero-tags animate-fade-up animate-delay-3 mt-6 justify-center lg:justify-start">
                                {HERO_TAGS.map((tag) => (
                                    <li key={tag.label} className="hero-tag">
                                        {tag.label}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="flex justify-center lg:justify-end">
                            <div className="relative">
                                <div className="absolute -inset-4 rounded-2xl bg-purple-500/10 blur-2xl" />
                                <Image
                                    src={SITE.logoUrl}
                                    alt={SITE.name}
                                    width={150}
                                    height={150}
                                    className="relative w-28 h-28 sm:w-36 sm:h-36 lg:w-[150px] lg:h-[150px] rounded-2xl shadow-2xl shadow-purple-500/20 ring-1 ring-white/10"
                                    priority
                                />
                            </div>
                        </div>
                    </div>

                    {/* Stats bar */}
                    <div className="hero-stat-bar mt-8 max-w-3xl mx-auto">
                        {STAT_ITEMS.map((stat, i) => (
                            <div key={stat.label} className="hero-stat-cell">
                                <p className="hero-stat-label">{stat.label}</p>
                                <p className="hero-stat-value">{stat.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
