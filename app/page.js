import Link from "next/link";
import Hero from "@/components/Hero";
import Icon from "@/components/Icon";
import { ABOUT_HIGHLIGHTS, FEATURE_SECTIONS, SITE } from "@/lib/site";

const PORTAL_LINKS = [
  {
    href: "/wiki",
    icon: "books",
    title: "Player Wiki",
    text: "Learn city systems, rules, jobs, roleplay mechanics, and player guides.",
  },
  {
    href: "/dashboard",
    icon: "gauge",
    title: "Character Dashboard",
    text: "View your linked characters, employment, finances, licenses, and vehicles.",
  },
  {
    href: "/city",
    icon: "city",
    title: "City Directory",
    text: "Find whitelisted businesses, departments, locations, and current ownership.",
  },
];

export const metadata = {
  title: "Home",
  description: SITE.description,
};

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <Hero />

      <section className="home-portal-section" aria-labelledby="portal-heading">
        <div className="home-section-heading">
          <p className="eyebrow">Your community portal</p>
          <h2 id="portal-heading" className="home-section-title">
            Everything you need, <span className="text-gradient">in one place</span>
          </h2>
          <p className="home-section-copy">
            Jump into the city, learn a system, check your characters, or see what
            the community has been building.
          </p>
        </div>

        <div className="home-portal-grid">
          {PORTAL_LINKS.map((item) => (
            <Link key={item.href} href={item.href} className="home-portal-card group">
              <span className="icon-box icon-box-md">
                <Icon name={item.icon} size="sm" />
              </span>
              <div className="min-w-0">
                <h3 className="home-portal-card-title">{item.title}</h3>
                <p className="home-portal-card-copy">{item.text}</p>
              </div>
              <span className="home-portal-arrow" aria-hidden>
                →
              </span>
            </Link>
          ))}

          <a
            href={SITE.showcaseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="home-portal-card group"
          >
            <span className="icon-box icon-box-md">
              <Icon name="sparkles" size="sm" />
            </span>
            <div className="min-w-0">
              <h3 className="home-portal-card-title">Server Showcase</h3>
              <p className="home-portal-card-copy">
                Explore Mystic Dreams systems, jobs, apps, and resource showcases.
              </p>
            </div>
            <span className="home-portal-arrow" aria-hidden>
              ↗
            </span>
          </a>
        </div>
      </section>

      <section className="home-portal-section border-t border-[var(--divider)]" aria-labelledby="community-heading">
        <div className="home-section-heading">
          <p className="eyebrow">Built around roleplay</p>
          <h2 id="community-heading" className="home-section-title">
            A city designed for <span className="text-gradient">character stories</span>
          </h2>
        </div>
        <div className="home-highlight-grid">
          {ABOUT_HIGHLIGHTS.map((item) => (
            <article key={item.title} className="home-highlight-card">
              <span className="icon-box icon-box-md">
                <Icon name={item.icon} size="sm" />
              </span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-portal-section border-t border-[var(--divider)]" aria-labelledby="city-heading">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="home-section-heading !mx-0 !text-left">
            <p className="eyebrow">Life in Mystic Dreams</p>
            <h2 id="city-heading" className="home-section-title">
              More than a place to <span className="text-gradient">log in</span>
            </h2>
            <p className="home-section-copy !mx-0">
              Systems are built to give characters reasons to meet, work, compete,
              cooperate, and create long-running stories.
            </p>
          </div>
          <Link href="/about" className="btn-secondary shrink-0">
            About the community
          </Link>
        </div>

        <div className="home-feature-strip">
          {FEATURE_SECTIONS.slice(0, 4).map((feature) => (
            <article key={feature.title} className="home-feature-item">
              <Icon name={feature.icon} size="xs" />
              <div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="home-join-panel">
        <div>
          <p className="eyebrow">New to Mystic Dreams?</p>
          <h2>Start with the whitelist, then make the city your own.</h2>
          <p>
            The Get Started guide covers Discord, whitelist, FiveM, and connecting
            for the first time.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/connect" className="btn-primary">
            Get Started
          </Link>
          <Link href="/wiki" className="btn-secondary">
            Read the Wiki
          </Link>
        </div>
      </section>
    </div>
  );
}
