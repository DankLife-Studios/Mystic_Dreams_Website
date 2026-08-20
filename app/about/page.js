import Link from "next/link";
import PageShell from "@/components/PageShell";
import CTASection from "@/components/CTASection";
import Icon from "@/components/Icon";
import { ABOUT_HIGHLIGHTS, FEATURE_SECTIONS, SITE } from "@/lib/site";

export const metadata = {
  title: "About Us",
  description:
    "Learn what Mystic Dreams RP values, how the community approaches roleplay, and what kind of city we are building together.",
};

export default function AboutPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-6xl">
        <header className="about-hero">
          <p className="eyebrow inline-flex items-center gap-2">
            <Icon name="gem" size="xs" />
            About Mystic Dreams
          </p>
          <h1>
            A roleplay community built to feel like <span className="text-gradient">home</span>
          </h1>
          <p>{SITE.about}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/connect" className="btn-primary">
              <Icon name="gamepad" size="sm" />
              Join the city
            </Link>
            <Link href="/wiki" className="btn-secondary">
              <Icon name="books" size="sm" />
              Read the Wiki
            </Link>
            <a
              href={SITE.showcaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              <Icon name="sparkles" size="sm" />
              View Showcase
            </a>
          </div>
        </header>

        <section className="about-section">
          <div className="about-section-heading">
            <p className="eyebrow">Our approach</p>
            <h2>Roleplay comes first</h2>
            <p>
              The goal is not to rush through systems. It is to use those systems as
              tools for believable characters, consequences, relationships, and stories
              that continue from one session to the next.
            </p>
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

        <section className="about-section">
          <div className="about-section-heading">
            <p className="eyebrow">Gameplay pillars</p>
            <h2>One city, connected experiences</h2>
            <p>
              Mystic Dreams brings civilian work, player businesses, public service,
              social activities, vehicles, and criminal roleplay into the same economy and
              community.
            </p>
          </div>
          <div className="about-pillar-list">
            {FEATURE_SECTIONS.map((feature, index) => (
              <article key={feature.title} className="about-pillar-row">
                <span className="about-pillar-number">{String(index + 1).padStart(2, "0")}</span>
                <span className="icon-box icon-box-md">
                  <Icon name={feature.icon} size="sm" />
                </span>
                <div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="about-section about-why">
          <div>
            <p className="eyebrow">Why join?</p>
            <h2>Because your character should have somewhere to belong.</h2>
          </div>
          <p>
            Whether you want to run a business, serve the public, build a civilian career,
            chase a criminal story, or simply become part of everyday city life, Mystic
            Dreams is designed to give that character room to grow.
          </p>
        </section>

        <CTASection
          contained
          title="Ready to begin your story?"
          description="Join the community, complete whitelist, and use the Wiki whenever you need help learning the city."
          primaryHref="/connect"
          primaryLabel="Get Started"
        />
      </div>
    </PageShell>
  );
}
