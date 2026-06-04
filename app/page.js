import Hero from "@/components/Hero";
import FeatureGrid from "@/components/FeatureGrid";
import SectionBlock from "@/components/SectionBlock";
import AboutHighlights from "@/components/AboutHighlights";
import CTASection from "@/components/CTASection";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <Hero />

      <SectionBlock
        className="py-16 sm:py-20"
        eyebrow="The experience"
        title="Built for"
        highlight="immersion"
        description="Every system is handcrafted for serious roleplay — from whitelisted businesses to deep criminal and civilian economies."
      >
        <AboutHighlights />
      </SectionBlock>

      <SectionBlock
        className="border-t border-[var(--border)] py-16 sm:py-20"
        eyebrow="What awaits you"
        title="Explore the"
        highlight="city"
      >
        <FeatureGrid variant="grid" />
        <p className="mt-8 text-center">
          <Link href="/features" className="btn-primary">
            View all features
          </Link>
        </p>
      </SectionBlock>

      <section className="border-t border-[var(--border)] py-16 sm:py-20">
        <CTASection
          primaryHref="/connect"
          primaryLabel="Get started"
        />
      </section>
    </>
  );
}
