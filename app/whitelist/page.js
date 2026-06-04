import WhitelistSteps from "@/components/WhitelistSteps";
import PageHero from "@/components/PageHero";
import PageShell from "@/components/PageShell";
import CTASection from "@/components/CTASection";
import InfoNote from "@/components/InfoNote";
import DiscordButton from "@/components/DiscordButton";
import Icon from "@/components/Icon";
import Link from "next/link";
import { SITE } from "@/lib/site";

export const metadata = {
  title: "Whitelist",
};

export default function WhitelistPage() {
  return (
    <PageShell narrow>
      <PageHero
        badge="Join the City"
        badgeIcon="key"
        title="Whitelist"
        highlight="Guide"
        description={`${SITE.name} is Discord-whitelisted. Follow the steps below to earn the Citizen role and connect in FiveM.`}
      >
        <DiscordButton className="!px-4 !py-2.5 !text-sm" />
        <Link
          href="/connect"
          className="inline-flex items-center gap-2 rounded-xl border border-mystic/25 px-4 py-2.5 text-sm font-semibold text-mystic transition hover:bg-mystic/10"
        >
          <Icon name="route" size="sm" />
          Connect Guide
        </Link>
      </PageHero>

      <WhitelistSteps />

      <InfoNote title="Important" className="mt-6">
        Whitelist applications are reviewed in Discord. Our connection queue
        verifies your Discord membership and <strong>Citizen</strong> role before
        you join the server.
      </InfoNote>

      <div className="mt-8">
        <CTASection
          title="Your keys to the city"
          description="Join Discord, complete whitelist, and we'll see you in Los Santos."
          primaryHref="/connect"
          primaryLabel="Connect Guide"
        />
      </div>
    </PageShell>
  );
}
