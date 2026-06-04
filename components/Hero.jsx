import Image from "next/image";
import Link from "next/link";
import DiscordButton from "./DiscordButton";
import MeshBackground from "./MeshBackground";
import Icon from "./Icon";
import { SITE, HERO_TAGS } from "@/lib/site";

export default function Hero() {
  return (
    <section className="relative min-h-[85vh] overflow-hidden">
      <MeshBackground variant="hero" />
      <div
        className="relative z-10 flex min-h-[85vh] flex-col items-center justify-center px-4 py-24 sm:px-6"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="relative animate-float">
          <div className="logo-glow-ring" />
          <Image
            src={SITE.logoUrl}
            alt={SITE.name}
            width={160}
            height={160}
            className="relative rounded-2xl shadow-2xl ring-2 ring-[var(--border)]"
            priority
          />
        </div>

        <span className="badge-pill animate-fade-up mt-10 inline-flex items-center gap-2">
          <Icon name="gem" size="xs" className="icon-fancy" />
          {SITE.tagline}
        </span>

        <h1 className="animate-fade-up animate-delay-1 font-display mt-6 max-w-4xl text-center text-5xl font-bold tracking-tight sm:text-7xl">
          <span className="text-gradient">{SITE.name}</span>
        </h1>

        <p className="text-body animate-fade-up animate-delay-2 mt-6 max-w-2xl text-center text-lg leading-relaxed sm:text-xl">
          {SITE.description}
        </p>

        <div className="animate-fade-up animate-delay-3 mt-10 flex flex-wrap items-center justify-center gap-4">
          <DiscordButton />
          <Link href="/whitelist" className="btn-secondary inline-flex items-center gap-2">
            <Icon name="badge-check" size="sm" />
            Apply for Whitelist
          </Link>
          <Link href="/features" className="btn-secondary inline-flex items-center gap-2">
            <Icon name="sparkles" size="sm" />
            Explore Features
          </Link>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
          {HERO_TAGS.map((tag) => (
            <span
              key={tag.label}
              className="surface-card inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium"
            >
              <Icon
                name={tag.icon}
                size="xs"
                duotone={tag.icon !== "discord"}
              />
              {tag.label}
            </span>
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
        <div className="flex h-10 w-6 items-center justify-center rounded-full border-2 border-[var(--border)] p-1">
          <Icon name="arrow-down" size="xs" className="animate-bounce" />
        </div>
      </div>
    </section>
  );
}
