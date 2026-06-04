import Image from "next/image";
import Link from "next/link";
import DiscordButton from "./DiscordButton";
import MeshBackground from "./MeshBackground";
import Icon from "./Icon";
import { SITE, HERO_TAGS, STAT_ITEMS } from "@/lib/site";

const PATHS = [
  {
    href: "/connect",
    label: "Get started",
    desc: "Whitelist & connect",
    icon: "gamepad",
  },
  {
    href: "/city",
    label: "City directory",
    desc: "Businesses & owners",
    icon: "city",
  },
  {
    href: "/dashboard",
    label: "Dashboard",
    desc: "Your characters",
    icon: "gauge",
  },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-[var(--border)]">
      <MeshBackground variant="hero" />
      <div
        className="relative z-10 mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="hero-grid">
          <div>
            <p className="eyebrow animate-fade-up">{SITE.tagline}</p>
            <h1 className="animate-fade-up animate-delay-1 font-display mt-3 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              <span className="text-gradient">{SITE.name}</span>
            </h1>
            <p className="text-body animate-fade-up animate-delay-2 mt-4 max-w-xl text-base leading-relaxed">
              {SITE.description}
            </p>
            <div className="hero-actions animate-fade-up animate-delay-3 mt-6">
              <DiscordButton />
              <Link href="/connect" className="btn-secondary">
                Get started
              </Link>
              <Link href="/features" className="btn-secondary">
                Features
              </Link>
            </div>
            <ul className="hero-tags animate-fade-up animate-delay-3 mt-6">
              {HERO_TAGS.map((tag) => (
                <li key={tag.label} className="hero-tag">
                  {tag.label}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-center lg:justify-end">
            <Image
              src={SITE.logoUrl}
              alt={SITE.name}
              width={140}
              height={140}
              className="rounded-xl shadow-[var(--shadow-card)]"
              priority
            />
          </div>
        </div>

        <div className="hero-stat-bar mt-10">
          {STAT_ITEMS.map((stat) => (
            <div key={stat.label} className="hero-stat-cell">
              <p className="hero-stat-label">{stat.label}</p>
              <p className="hero-stat-value">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="path-cards mt-8">
          {PATHS.map((path) => (
            <Link key={path.href} href={path.href} className="path-card group">
              <span className="icon-box icon-box-md w-fit">
                <Icon name={path.icon} size="sm" />
              </span>
              <span className="text-heading font-display mt-2 text-sm font-semibold group-hover:text-mystic">
                {path.label}
              </span>
              <span className="text-caption text-xs">{path.desc}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
