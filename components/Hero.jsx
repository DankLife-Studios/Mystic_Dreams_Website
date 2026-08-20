import Image from "next/image";
import Link from "next/link";
import DiscordButton from "./DiscordButton";
import MeshBackground from "./MeshBackground";
import Icon from "./Icon";
import { SITE, HERO_TAGS, STAT_ITEMS } from "@/lib/site";

export default function Hero() {
  return (
    <section className="hero-enhanced relative w-full overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)]">
      <MeshBackground variant="hero" />
      <div className="relative z-10 px-4 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-16">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <span className="badge-glow animate-fade-up">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            {SITE.maxSlots} Slots • Live Now
          </span>

          <div className="relative mt-7">
            <div className="absolute -inset-5 rounded-3xl bg-purple-500/12 blur-2xl" />
            <Image
              src={SITE.logoUrl}
              alt={SITE.name}
              width={144}
              height={144}
              className="relative h-28 w-28 rounded-2xl shadow-2xl shadow-purple-500/20 ring-1 ring-white/10 sm:h-36 sm:w-36"
              priority
            />
          </div>

          <h1
            className="animate-fade-up mt-7 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <span className="text-gradient">{SITE.name}</span>
          </h1>
          <p className="animate-fade-up animate-delay-2 mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
            {SITE.description}
          </p>

          <div className="hero-actions animate-fade-up animate-delay-3 mt-7 justify-center">
            <Link href="/connect" className="btn-primary text-sm shadow-lg shadow-purple-500/20 transition-shadow hover:shadow-purple-500/30 sm:text-base">
              <Icon name="gamepad" size="sm" />
              Get Started
            </Link>
            <Link href="/wiki" className="btn-secondary text-sm sm:text-base">
              <Icon name="books" size="sm" />
              Open Wiki
            </Link>
            <DiscordButton />
          </div>

          <ul className="hero-tags animate-fade-up animate-delay-3 mt-6 justify-center">
            {HERO_TAGS.map((tag) => (
              <li key={tag.label} className="hero-tag">
                {tag.label}
              </li>
            ))}
          </ul>

          <div className="hero-stat-bar mt-9 w-full max-w-3xl">
            {STAT_ITEMS.map((stat) => (
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
