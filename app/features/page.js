import FeatureGrid from "@/components/FeatureGrid";
import PageHero from "@/components/PageHero";
import PageShell from "@/components/PageShell";
import CTASection from "@/components/CTASection";
import Icon from "@/components/Icon";
import Link from "next/link";
import { FEATURE_SECTIONS } from "@/lib/site";

export const metadata = {
  title: "Features",
};

export default function FeaturesPage() {
  return (
    <PageShell>
      <PageHero
        badge="Server Features"
        badgeIcon="sparkles"
        title="Everything"
        highlight="In-Game"
        description="Emergency services, whitelisted businesses, civilian jobs, phone and tablet apps, entertainment, and a full criminal economy."
      >
        <Link
          href="/whitelist"
          className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-mystic to-mystic-dark px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-mystic/25 transition hover:brightness-110"
        >
          <Icon name="badge-check" size="sm" duotone={false} />
          Apply for Whitelist
        </Link>
        <Link
          href="/connect"
          className="inline-flex items-center gap-2 rounded-xl border border-mystic/25 px-4 py-2.5 text-sm font-semibold text-mystic transition hover:bg-mystic/10"
        >
          <Icon name="gamepad" size="sm" />
          How to Connect
        </Link>
      </PageHero>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h2 className="text-heading font-display flex items-center gap-2 text-lg font-bold">
          <Icon name="gauge" size="sm" />
          All systems
        </h2>
        <span className="rounded-full bg-mystic/15 px-2.5 py-0.5 text-xs font-semibold tabular-nums text-mystic">
          {FEATURE_SECTIONS.length}
        </span>
      </div>

      <FeatureGrid />

      <div className="mt-10">
        <CTASection
          title="See it for yourself"
          description="Get whitelisted, connect to FiveM, and experience every feature in Los Santos."
          primaryHref="/connect"
          primaryLabel="Connect Now"
        />
      </div>
    </PageShell>
  );
}
