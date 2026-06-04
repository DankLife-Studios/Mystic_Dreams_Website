import FeatureGrid from "@/components/FeatureGrid";
import PageHeader from "@/components/PageHeader";
import PageShell from "@/components/PageShell";
import CTASection from "@/components/CTASection";
import Link from "next/link";
import { FEATURE_SECTIONS } from "@/lib/site";

export const metadata = {
  title: "Features",
};

export default function FeaturesPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Server systems"
        eyebrowIcon="sparkles"
        title="Everything"
        highlight="in-game"
        description="Emergency services, whitelisted businesses, civilian jobs, phone and tablet apps, entertainment, and a full criminal economy."
      >
        <Link href="/connect" className="btn-primary">
          Get started
        </Link>
        <Link href="/dashboard" className="btn-secondary">
          Dashboard
        </Link>
      </PageHeader>

      <p className="text-caption -mt-4 mb-6 text-sm">
        {FEATURE_SECTIONS.length} systems on the server
      </p>

      <FeatureGrid variant="list" />

      <div className="mt-10">
        <CTASection
          contained
          title="See it for yourself"
          description="Get whitelisted, connect to FiveM, and experience every feature in Los Santos."
          primaryHref="/connect"
          primaryLabel="Get started"
        />
      </div>
    </PageShell>
  );
}
