import WhitelistSteps from "@/components/WhitelistSteps";
import ConnectSteps from "@/components/ConnectSteps";
import PageHeader from "@/components/PageHeader";
import PageShell from "@/components/PageShell";
import CTASection from "@/components/CTASection";
import InfoNote from "@/components/InfoNote";
import DiscordButton from "@/components/DiscordButton";
import Link from "next/link";
import {
  CONNECT_STEPS,
  SITE,
  WHITELIST_STEPS,
} from "@/lib/site";

export const metadata = {
  title: "Get Started",
  description: `Whitelist and connect to ${SITE.name} on FiveM.`,
};

export default function GetStartedPage() {
  const totalSteps = WHITELIST_STEPS.length + CONNECT_STEPS.length;

  return (
    <PageShell narrow>
      <PageHeader
        eyebrow="Join the city"
        eyebrowIcon="key"
        title="Get"
        highlight="started"
        description={`${SITE.name} is Discord-whitelisted. Complete ${totalSteps} steps below — whitelist on Discord, then connect in FiveM.`}
      >
        <DiscordButton />
        <Link href="/dashboard" className="btn-secondary">
          Dashboard
        </Link>
      </PageHeader>

      <section id="whitelist" className="scroll-mt-24">
        <div className="mb-4">
          <p className="eyebrow">Step 1 · Discord</p>
          <h2 className="text-heading font-display mt-1 text-xl font-semibold">
            Whitelist
          </h2>
          <p className="text-body mt-1 text-sm">
            Join Discord and earn the Citizen role before you can connect in-game.
          </p>
        </div>
        <WhitelistSteps />
      </section>

      <InfoNote title="Important" className="mt-6">
        Whitelist applications are reviewed in Discord. Our connection queue
        verifies your Discord membership and <strong>Citizen</strong> role before
        you join the server.
      </InfoNote>

      <section id="fivem" className="mt-10 scroll-mt-24">
        <div className="mb-4">
          <p className="eyebrow">Step 2 · FiveM</p>
          <h2 className="text-heading font-display mt-1 text-xl font-semibold">
            Connect in-game
          </h2>
          <p className="text-body mt-1 text-sm">
            Install FiveM, keep Discord running, and join the server.
          </p>
        </div>
        <ConnectSteps />
      </section>

      <div className="surface-card mt-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <p className="text-body text-sm">
          Need help? Our team is active on Discord.
        </p>
        <DiscordButton />
      </div>

      <div className="mt-10">
        <CTASection
          contained
          title="You're ready for Los Santos"
          description="Log in to track whitelist status, characters, and vehicles."
          primaryHref="/dashboard"
          primaryLabel="Open dashboard"
          showDiscord={false}
        />
      </div>
    </PageShell>
  );
}
