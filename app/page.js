import Hero from "@/components/Hero";
import FeatureGrid from "@/components/FeatureGrid";
import StatsStrip from "@/components/StatsStrip";
import SectionHeading from "@/components/SectionHeading";
import AboutHighlights from "@/components/AboutHighlights";
import CTASection from "@/components/CTASection";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <Hero />
      <div className="-mt-8 relative z-10">
        <StatsStrip />
      </div>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <SectionHeading
          eyebrow="The Experience"
          title="Built for"
          highlight="Immersion"
          description="Every system is handcrafted for serious roleplay — from whitelisted businesses to deep criminal and civilian economies."
        />
        <div className="mt-12">
          <AboutHighlights />
        </div>
      </section>

      <div className="section-divider mx-auto max-w-4xl" />

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <SectionHeading
          eyebrow="What Awaits You"
          title="Explore the"
          highlight="City"
        />
        <div className="mt-14">
          <FeatureGrid compact />
        </div>
        <div className="mt-14 text-center">
          <Link href="/features" className="btn-primary">
            View All Features
          </Link>
        </div>
      </section>

      <section className="pb-24">
        <CTASection
          primaryHref="/whitelist"
          primaryLabel="Start Whitelist"
        />
      </section>
    </>
  );
}
