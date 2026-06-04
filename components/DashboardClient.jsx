"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import Image from "next/image";
import CharacterCard from "./CharacterCard";
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
        const data = await res.json();
        setProfile(data);
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
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="surface-card w-full max-w-sm rounded-3xl p-8 text-center">
          <div className="icon-box icon-box-xl icon-on-gradient mx-auto bg-linear-to-br from-mystic to-mystic-dark shadow-lg shadow-mystic/30">
            <Icon name="discord" size="xl" duotone={false} />
          </div>
          <button
            type="button"
            onClick={() => signIn("discord", { callbackUrl: "/dashboard" })}
            className="mt-6 w-full rounded-xl bg-linear-to-r from-mystic to-mystic-dark py-3.5 text-sm font-semibold text-white shadow-lg shadow-mystic/25 transition hover:brightness-110 active:scale-[0.98]"
          >
            Continue with Discord
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-500/30 bg-red-500/5 p-8 text-center backdrop-blur-sm">
        <p className="font-medium text-red-400">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="btn-secondary mt-4 !px-5 !py-2.5 !text-sm"
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

  const characterCount = game.characters?.length ?? 0;

  return (
    <div className="space-y-6">
      {/* Discord / account — primary panel */}
      <section className="surface-card overflow-hidden rounded-3xl">
        <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:gap-8 sm:p-8">
          <div className="relative shrink-0">
            {user.image ? (
              <Image
                src={user.image}
                alt=""
                width={96}
                height={96}
                className="size-20 rounded-2xl object-cover ring-2 ring-mystic/30 sm:size-24"
              />
            ) : (
              <div className="flex size-20 items-center justify-center rounded-2xl bg-linear-to-br from-mystic/30 to-mystic-dark/20 text-3xl font-bold text-mystic sm:size-24">
                {displayName?.charAt(0) || "?"}
              </div>
            )}
            <span
              className={`absolute -bottom-0.5 -right-0.5 size-4 rounded-full ring-2 ring-[var(--card-bg)] sm:size-5 ${
                discord.inGuild && discord.hasCitizenRole
                  ? "bg-emerald-500"
                  : "bg-amber-500"
              }`}
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-mystic">
              <Icon name="discord" size="xs" duotone={false} />
              Discord account
            </p>
            <h1 className="text-heading mt-1 truncate font-display text-2xl font-bold tracking-tight sm:text-4xl">
              {displayName}
            </h1>
            {user.username && (
              <p className="text-caption truncate text-base">
                @{user.username}
              </p>
            )}
            <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
              <StatusTile
                label="Discord"
                ok={discord.inGuild}
                okText="Joined"
                failText="Not joined"
              />
              <StatusTile
                label="Whitelist"
                ok={discord.hasCitizenRole}
                okText="Citizen"
                failText="Pending"
              />
              <StatusTile
                label="Game link"
                ok={game.linked}
                okText="Linked"
                failText="Unlinked"
              />
            </div>
          </div>
        </div>

        <AlertStack
          discord={discord}
          game={game}
          banned={game.banned}
          banReason={game.banReason}
        />
      </section>

      {characterCount > 0 && (
        <section>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <h2 className="text-heading font-display flex items-center gap-2 text-lg font-bold tracking-tight sm:text-xl">
              <Icon name="users" size="sm" />
              Characters
            </h2>
            <span className="rounded-full bg-mystic/15 px-2.5 py-0.5 text-xs font-semibold tabular-nums text-mystic">
              {characterCount}
            </span>
            <span className="text-caption text-[10px] font-medium uppercase tracking-widest">
              Live from database
            </span>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {game.characters.map((char) => (
              <CharacterCard key={char.citizenid} character={char} />
            ))}
          </div>
        </section>
      )}

      {game.linked && game.characters?.length === 0 && !game.banned && (
        <div className="rounded-3xl border border-dashed border-mystic/30 bg-mystic/5 px-6 py-14 text-center">
          <p className="text-heading font-display text-lg font-semibold">No characters yet</p>
          <p className="text-body mx-auto mt-2 max-w-md text-sm">
            Create one in-game through the character menu.
          </p>
          <Link
            href="/connect"
            className="mt-6 inline-flex rounded-xl border border-mystic/30 px-5 py-2.5 text-sm font-semibold text-mystic transition hover:bg-mystic/10"
          >
            Connect guide
          </Link>
        </div>
      )}
    </div>
  );
}

const STATUS_ICONS = {
  Discord: "discord",
  Whitelist: "badge-check",
  "Game link": "link",
};

function StatusTile({ label, ok, okText, failText }) {
  const iconName = STATUS_ICONS[label] || "circle-info";
  return (
    <div
      className={`rounded-xl border px-3 py-2.5 sm:px-4 sm:py-3 ${
        ok
          ? "border-emerald-500/25 bg-emerald-500/10"
          : "border-amber-500/25 bg-amber-500/10"
      }`}
    >
      <p className="text-caption flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
        <Icon
          name={iconName}
          size="xs"
          duotone={iconName !== "discord"}
        />
        {label}
      </p>
      <p
        className={`mt-0.5 text-sm font-semibold sm:text-base ${
          ok ? "text-emerald-600" : "text-amber-600"
        }`}
      >
        {ok ? okText : failText}
      </p>
    </div>
  );
}

function AlertStack({ discord, game, banned, banReason }) {
  const alerts = [];

  if (!discord.inGuild) {
    alerts.push({
      key: "discord",
      tone: "warn",
      body: `Join ${SITE.name} on Discord to play.`,
      action: <DiscordButton className="!px-4 !py-2 !text-xs" />,
    });
  } else if (!discord.hasCitizenRole) {
    alerts.push({
      key: "wl",
      tone: "warn",
      body: "Grab the Citizen role in Discord to get whitelisted.",
      action: (
        <Link
          href="/whitelist"
          className="inline-flex text-xs font-semibold text-mystic hover:underline"
        >
          Whitelist guide →
        </Link>
      ),
    });
  }

  if (banned) {
    alerts.push({
      key: "ban",
      tone: "error",
      body: banReason || "Your account is restricted.",
    });
  } else if (discord.inGuild && !game.linked) {
    alerts.push({
      key: "link",
      tone: "info",
      body: "Connect once in FiveM with Discord open to sync your characters.",
      action: (
        <Link
          href="/connect"
          className="inline-flex text-xs font-semibold text-mystic hover:underline"
        >
          How to connect →
        </Link>
      ),
    });
  }

  if (alerts.length === 0) {
    return (
      <div className="flex items-center gap-2 border-t border-emerald-500/15 bg-emerald-500/5 px-6 py-3">
        <Icon name="circle-check" size="sm" duotone={false} />
        <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
          All set — see you in the city.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0 border-t border-subtle">
      {alerts.map((a) => (
        <div
          key={a.key}
          className={`flex flex-wrap items-center justify-between gap-3 px-6 py-3 ${
            a.tone === "error"
              ? "bg-red-500/10"
              : a.tone === "info"
                ? "bg-mystic/5"
                : "bg-amber-500/10"
          }`}
        >
          <p className="text-body text-xs leading-relaxed">
            {a.body}
          </p>
          {a.action && <div className="shrink-0">{a.action}</div>}
        </div>
      ))}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="surface-muted h-40 rounded-3xl sm:h-44" />
      <div className="grid gap-5 md:grid-cols-2">
        <div className="surface-muted h-48 rounded-3xl" />
        <div className="surface-muted h-48 rounded-3xl" />
      </div>
    </div>
  );
}

