"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import Image from "next/image";
import CharactersSection from "./CharactersSection";
import DiscordButton from "./DiscordButton";
import Icon from "./Icon";
import Link from "next/link";
import { SITE } from "@/lib/site";

export default function DashboardClient() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status !== "authenticated") {
      setLoading(false);
      return;
    }

    async function load() {
      try {
        const res = await fetch("/api/me");
        if (!res.ok) throw new Error("Failed to load profile");
        setProfile(await res.json());
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [status]);

  if (status === "loading" || (status === "authenticated" && loading)) {
    return <DashboardSkeleton />;
  }

  if (status === "unauthenticated") {
    return (
      <div className="dashboard-login">
        <span className="icon-box icon-box-xl mx-auto">
          <Icon name="gauge" size="lg" />
        </span>
        <h1 className="text-heading font-display mt-6 text-2xl font-semibold">
          Player dashboard
        </h1>
        <p className="text-body mt-2 text-sm leading-relaxed">
          Sign in with Discord to view whitelist status, characters, vehicles,
          and live server data.
        </p>
        <button
          type="button"
          onClick={() => signIn("discord", { callbackUrl: "/dashboard" })}
          className="btn-primary mt-8 w-full"
        >
          Continue with Discord
        </button>
        <Link href="/connect" className="btn-secondary mt-3 inline-flex w-full justify-center">
          Get started guide
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-alert dashboard-alert-error text-center">
        <p className="font-medium text-red-400">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="btn-secondary mt-4"
        >
          Retry
        </button>
      </div>
    );
  }

  const user = session.user;
  const discord = profile?.discord || {};
  const game = profile?.game || {};
  const displayName = user.globalName || user.name || user.username;
  const alerts = buildAlerts(discord, game);

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="dashboard-profile">
          <div className="dashboard-profile-avatar">
            {user.image ? (
              <Image
                src={user.image}
                alt=""
                width={48}
                height={48}
                className="rounded-[0.625rem]"
              />
            ) : (
              <div className="dash-avatar-fallback">
                {displayName?.charAt(0) || "?"}
              </div>
            )}
            <span
              className={`dashboard-status-dot ${
                alerts.length === 0 ? "bg-emerald-500" : "bg-amber-500"
              }`}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-heading truncate font-semibold">{displayName}</p>
            {user.username && (
              <p className="text-caption truncate text-xs">@{user.username}</p>
            )}
          </div>
        </div>

        <div className="dashboard-status-list">
          <StatusRow
            icon="discord"
            label="Discord server"
            ok={discord.inGuild}
            okText="Joined"
            failText="Not joined"
          />
          <StatusRow
            icon="badge-check"
            label="Whitelist"
            ok={discord.hasCitizenRole}
            okText="Citizen"
            failText="Pending"
          />
          <StatusRow
            icon="link"
            label="Game account"
            ok={game.linked}
            okText="Linked"
            failText="Unlinked"
          />
        </div>

        {alerts.map((alert) => (
          <div
            key={alert.key}
            className={`dashboard-alert dashboard-alert-${alert.tone}`}
          >
            <p className="text-body">{alert.body}</p>
            {alert.action && <div className="mt-3">{alert.action}</div>}
          </div>
        ))}
      </aside>

      <div className="dashboard-main">
        <header className="dashboard-main-header">
          <p className="eyebrow">Live from database</p>
          <h1 className="text-heading font-display mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Your <span className="text-gradient">characters</span>
          </h1>
          <p className="text-body mt-2 text-sm">
            Finances, job, phone, and garage sync when you connect in FiveM.
          </p>
        </header>

        {game.banned ? (
          <div className="dashboard-alert dashboard-alert-error">
            <p className="font-medium">
              {game.banReason || "Your account is restricted."}
            </p>
          </div>
        ) : game.characters?.length > 0 ? (
          <CharactersSection characters={game.characters} />
        ) : game.linked ? (
          <div className="dash-char-card px-6 py-14 text-center">
            <span className="icon-box icon-box-lg mx-auto">
              <Icon name="users" size="md" />
            </span>
            <p className="text-heading font-display mt-4 text-lg font-semibold">
              No characters yet
            </p>
            <p className="text-body mx-auto mt-2 max-w-sm text-sm">
              Create a character in the FiveM menu, then refresh this page.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="btn-secondary mt-6"
            >
              Refresh
            </button>
          </div>
        ) : (
          <div className="dash-char-card px-6 py-14 text-center">
            <span className="icon-box icon-box-lg mx-auto">
              <Icon name="link" size="md" />
            </span>
            <p className="text-heading font-display mt-4 text-lg font-semibold">
              Connect in-game first
            </p>
            <p className="text-body mx-auto mt-2 max-w-sm text-sm">
              Join with Discord open so {SITE.name} can link your account.
            </p>
            <Link href="/connect" className="btn-primary mt-6">
              Get started
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusRow({ icon, label, ok, okText, failText }) {
  return (
    <div className="dashboard-status-row">
      <span className="dashboard-status-label">
        <Icon name={icon} size="xs" duotone={icon !== "discord"} />
        {label}
      </span>
      <span
        className={`dashboard-status-pill ${
          ok ? "dashboard-status-pill-ok" : "dashboard-status-pill-warn"
        }`}
      >
        {ok ? okText : failText}
      </span>
    </div>
  );
}

function buildAlerts(discord, game) {
  const alerts = [];

  if (game.banned) return alerts;

  if (!discord.inGuild) {
    alerts.push({
      key: "discord",
      tone: "warn",
      body: `Join ${SITE.name} on Discord before playing.`,
      action: <DiscordButton className="!text-xs !py-2" />,
    });
  } else if (!discord.hasCitizenRole) {
    alerts.push({
      key: "wl",
      tone: "warn",
      body: "Complete whitelist and get the Citizen role in Discord.",
      action: (
        <Link href="/connect#whitelist" className="btn-secondary !text-xs !py-2">
          Whitelist steps
        </Link>
      ),
    });
  } else if (!game.linked) {
    alerts.push({
      key: "link",
      tone: "info",
      body: "Connect once in FiveM with Discord running to sync characters.",
      action: (
        <Link href="/connect#fivem" className="btn-secondary !text-xs !py-2">
          Connect guide
        </Link>
      ),
    });
  }

  return alerts;
}

function DashboardSkeleton() {
  return (
    <div className="dashboard-layout animate-pulse">
      <div className="space-y-3">
        <div className="dashboard-profile">
          <div className="surface-muted size-12 rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="surface-muted h-4 w-28 rounded" />
            <div className="surface-muted h-3 w-20 rounded" />
          </div>
        </div>
        <div className="dashboard-status-list h-36" />
      </div>
      <div className="space-y-4">
        <div className="surface-muted h-8 w-48 rounded" />
        <div className="dashboard-overview h-20" />
        <div className="dash-char-card h-72" />
      </div>
    </div>
  );
}
