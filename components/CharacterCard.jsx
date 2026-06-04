"use client";

import GarageSection from "./GarageSection";
import { formatPhone } from "@/lib/format";

export default function CharacterCard({ character }) {
  const vehicles = character.vehicles || [];

  const formatMoney = (n) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);

  const formattedPhone = formatPhone(character.phone);

  const lastPlayed = character.lastLoggedOut
    ? new Date(character.lastLoggedOut).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "Never";

  const displayName = character.characterName || character.name;
  const initial = displayName.charAt(0)?.toUpperCase() || "?";

  return (
    <article className="dash-char-card">
      <div className="dash-char-header">
        <div className="dash-char-avatar" aria-hidden>
          {initial}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-mystic/12 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-mystic">
              Slot {character.cid}
            </span>
            {character.gangLabel && (
              <span className="text-caption rounded-md border border-subtle px-2 py-0.5 text-[10px] font-medium">
                {character.gangLabel}
              </span>
            )}
          </div>
          <h3 className="text-heading font-display mt-2 truncate text-xl font-semibold tracking-tight">
            {displayName}
          </h3>
          <p className="text-caption mt-0.5 font-mono text-xs">
            {character.citizenid}
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="dash-char-stat-label">Last played</p>
          <p className="dash-char-stat-value mt-1 text-xs font-medium">
            {lastPlayed}
          </p>
        </div>
      </div>

      <dl className="dash-char-stats">
        <div className="dash-char-stat">
          <dt className="dash-char-stat-label">Job</dt>
          <dd className="dash-char-stat-value truncate">{character.jobLabel}</dd>
          {character.jobGrade && (
            <dd className="text-caption mt-0.5 truncate text-xs">
              {character.jobGrade}
            </dd>
          )}
        </div>
        <div className="dash-char-stat">
          <dt className="dash-char-stat-label">Cash</dt>
          <dd className="dash-char-stat-value dash-char-stat-value-accent">
            {formatMoney(character.cash)}
          </dd>
        </div>
        <div className="dash-char-stat">
          <dt className="dash-char-stat-label">Bank</dt>
          <dd className="dash-char-stat-value dash-char-stat-value-accent">
            {formatMoney(character.bank)}
          </dd>
        </div>
        <div className="dash-char-stat">
          <dt className="dash-char-stat-label">Phone</dt>
          <dd className="dash-char-stat-value dash-char-stat-value-mono">
            {formattedPhone || "—"}
          </dd>
        </div>
      </dl>

      <GarageSection vehicles={vehicles} />
    </article>
  );
}
