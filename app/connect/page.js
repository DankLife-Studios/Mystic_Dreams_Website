import ConnectSteps from "@/components/ConnectSteps";
import PageHero from "@/components/PageHero";
import PageShell from "@/components/PageShell";
import CTASection from "@/components/CTASection";
import DiscordButton from "@/components/DiscordButton";
import Icon from "@/components/Icon";
import Link from "next/link";
import { CONNECT_STEPS, SITE } from "@/lib/site";

export const metadata = {
  title: "Connect",
};

export default function ConnectPage() {
  return (
    <PageShell>
      <PageHero
        badge="Get In-Game"
        badgeIcon="gamepad"
        title="Connect to"
        highlight={SITE.name}
        description="Four steps from install to standing on the streets of Los Santos."
      >
        <Link
          href="/whitelist"
          className="inline-flex rounded-xl border border-mystic/25 px-4 py-2.5 text-sm font-semibold text-mystic transition hover:bg-mystic/10"
        >
          Whitelist First
        </Link>
        <Link
          href="/dashboard"
          className="inline-flex rounded-xl bg-linear-to-r from-mystic to-mystic-dark px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-mystic/25 transition hover:brightness-110"
        >
          Dashboard
        </Link>
      </PageHero>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h2 className="text-heading font-display flex items-center gap-2 text-lg font-bold">
          <Icon name="route" size="sm" />
          Setup steps
        </h2>
        <span className="rounded-full bg-mystic/15 px-2.5 py-0.5 text-xs font-semibold tabular-nums text-mystic">
          {CONNECT_STEPS.length}
        </span>
      </div>

      <ConnectSteps />

      <div className="surface-card mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl px-5 py-4">
        <p className="text-body flex items-center gap-2 text-sm">
          <Icon name="circle-info" size="sm" />
          Need help? Our team is active on Discord.
        </p>
        <DiscordButton className="!px-4 !py-2 !text-sm" />
      </div>

      <div className="mt-8">
        <CTASection
          title="Already whitelisted?"
          description="Log in to view characters and whitelist status."
          primaryHref="/dashboard"
          primaryLabel="Open Dashboard"
          showDiscord={false}
        />
      </div>
    </PageShell>
  );
}
