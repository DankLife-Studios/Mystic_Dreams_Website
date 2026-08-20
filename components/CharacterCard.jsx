"use client";

import GarageSection from "./GarageSection";
import { formatPhone } from "@/lib/format";

function formatMoney(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function formatLabel(value) {
  return String(value || "")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function Detail({ label, value, mono = false, accent = false }) {
  return (
    <div className="dash-detail">
      <dt>{label}</dt>
      <dd className={`${mono ? "font-mono" : ""} ${accent ? "text-[var(--accent)]" : ""}`}>
        {value == null || value === "" ? "—" : value}
      </dd>
    </div>
  );
}

export default function CharacterCard({ character, section = "overview" }) {
  const vehicles = character.vehicles || [];
  const formattedPhone = formatPhone(character.phone);
  const displayName = character.characterName || character.name || "Unnamed Character";
  const initial = displayName.charAt(0)?.toUpperCase() || "?";
  const lastPlayed = character.lastLoggedOut
    ? new Date(character.lastLoggedOut).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "Never";

  const employment = character.employment || {
    label: character.jobLabel,
    grade: character.jobGrade,
  };
  const gang = character.gang ||
    (character.gangLabel ? { label: character.gangLabel } : null);
  const finances = character.finances || {
    cash: character.cash,
    bank: character.bank,
    crypto: character.crypto,
  };

  return (
    <article className="dash-char-card">
      <div className="dash-char-header">
        <div className="dash-char-avatar" aria-hidden>
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-mystic/12 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-mystic">
              Slot {character.cid}
            </span>
            {gang?.label && (
              <span className="text-caption rounded-md border border-subtle px-2 py-0.5 text-[10px] font-medium">
                {gang.label}
              </span>
            )}
          </div>
          <h3 className="text-heading font-display mt-2 truncate text-xl font-semibold tracking-tight">
            {displayName}
          </h3>
          <p className="text-caption mt-0.5 font-mono text-xs">{character.citizenid}</p>
        </div>
        <div className="text-left sm:text-right">
          <p className="dash-char-stat-label">Last played</p>
          <p className="dash-char-stat-value mt-1 text-xs font-medium">{lastPlayed}</p>
        </div>
      </div>

      {section === "overview" && (
        <div className="dash-profile-section">
          <div>
            <p className="dash-profile-section-title">Identity & contact</p>
            <dl className="dash-detail-grid">
              <Detail label="First name" value={character.firstname} />
              <Detail label="Last name" value={character.lastname} />
              <Detail label="Date of birth" value={character.birthdate} />
              <Detail label="Gender" value={character.gender} />
              <Detail label="Nationality" value={character.nationality} />
              <Detail label="Phone" value={formattedPhone} mono />
              <Detail label="Citizen ID" value={character.citizenid} mono />
              <Detail label="Character slot" value={character.cid} />
            </dl>
          </div>

          <div>
            <p className="dash-profile-section-title">Finances</p>
            <dl className="dash-detail-grid dash-detail-grid-money">
              <Detail label="Cash" value={formatMoney(finances.cash)} accent />
              <Detail label="Bank" value={formatMoney(finances.bank)} accent />
              {Number(finances.crypto) > 0 && (
                <Detail label="Crypto" value={formatMoney(finances.crypto)} accent />
              )}
            </dl>
          </div>

          <StatusSnapshot status={character.status} />
        </div>
      )}

      {section === "employment" && (
        <div className="dash-profile-section">
          <div>
            <p className="dash-profile-section-title">Employment</p>
            <dl className="dash-detail-grid">
              <Detail label="Job" value={employment.label} />
              <Detail label="Grade" value={employment.grade} />
              <Detail
                label="Duty status"
                value={employment.onDuty == null ? null : employment.onDuty ? "On duty" : "Off duty"}
              />
              <Detail
                label="Management"
                value={employment.isBoss == null ? null : employment.isBoss ? "Management" : "Employee"}
              />
            </dl>
          </div>

          <div>
            <p className="dash-profile-section-title">Organization</p>
            {gang?.label ? (
              <dl className="dash-detail-grid">
                <Detail label="Organization" value={gang.label} />
                <Detail label="Grade" value={gang.grade} />
                <Detail
                  label="Leadership"
                  value={gang.isBoss == null ? null : gang.isBoss ? "Leadership" : "Member"}
                />
              </dl>
            ) : (
              <p className="text-body text-sm">No organization information is linked to this character.</p>
            )}
          </div>
        </div>
      )}

      {section === "licenses" && (
        <div className="dash-profile-section">
          <div>
            <p className="dash-profile-section-title">Licenses</p>
            {character.licenses?.length ? (
              <ul className="dash-license-grid">
                {character.licenses.map((license) => (
                  <li key={license} className="dash-license-card">
                    <span className="dash-license-dot" />
                    <span>{formatLabel(license)}</span>
                    <small>Active</small>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-body text-sm">No active licenses were found in the character metadata.</p>
            )}
          </div>
        </div>
      )}

      {section === "vehicles" && <GarageSection vehicles={vehicles} />}
    </article>
  );
}

function StatusSnapshot({ status }) {
  if (!status) return null;
  const metrics = [
    ["Hunger", status.hunger],
    ["Thirst", status.thirst],
    ["Stress", status.stress],
    ["Armor", status.armor],
  ].filter(([, value]) => value != null);

  if (!metrics.length && !status.bloodType && !status.isDead && !status.inLastStand) {
    return null;
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <p className="dash-profile-section-title">Last synced status</p>
        <p className="text-caption text-[10px]">Snapshot from the game database</p>
      </div>
      <dl className="dash-detail-grid">
        {status.bloodType && <Detail label="Blood type" value={status.bloodType} />}
        {metrics.map(([label, value]) => (
          <Detail key={label} label={label} value={`${Math.round(value)}%`} />
        ))}
        {(status.isDead || status.inLastStand) && (
          <Detail label="Medical state" value={status.isDead ? "Unconscious" : "Critical"} />
        )}
      </dl>
    </div>
  );
}
