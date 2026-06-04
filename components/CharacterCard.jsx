"use client";

import { useState } from "react";
import Icon from "./Icon";

export default function CharacterCard({ character }) {
  const [vehiclesOpen, setVehiclesOpen] = useState(false);
  const vehicles = character.vehicles || [];
  const formatMoney = (n) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);

  const lastPlayed = character.lastLoggedOut
    ? new Date(character.lastLoggedOut).toLocaleString()
    : "Never";

  const displayName = character.characterName || character.name;
  const initial = displayName.charAt(0)?.toUpperCase() || "?";

  return (
    <article className="surface-card group relative overflow-hidden rounded-3xl transition duration-300 hover:border-mystic/40 hover:shadow-lg hover:shadow-mystic/10">
      <div className="relative p-6 sm:p-7">
        <div className="flex items-start gap-4">
          <div className="icon-box icon-on-gradient flex size-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-mystic to-mystic-dark shadow-md shadow-mystic/20">
            <Icon name="user" size="lg" />
            <span className="sr-only">{initial}</span>
          </div>
          <div className="min-w-0 flex-1">
            <span className="inline-flex rounded-full bg-mystic/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-mystic">
              Slot {character.cid}
            </span>
            <h3 className="text-heading font-display mt-2 truncate text-xl font-bold tracking-tight">
              {displayName}
            </h3>
            <p className="text-caption mt-0.5 truncate font-mono text-[11px]">
              {character.citizenid}
            </p>
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-3">
          <Stat label="Job" value={character.jobLabel} sub={character.jobGrade} />
          {character.gangLabel ? (
            <Stat label="Gang" value={character.gangLabel} />
          ) : (
            <div />
          )}
          <Stat label="Cash" value={formatMoney(character.cash)} accent />
          <Stat label="Bank" value={formatMoney(character.bank)} accent />
          {character.phone && (
            <Stat label="Phone" value={character.phone} className="col-span-2" />
          )}
          <Stat
            label="Last played"
            value={lastPlayed}
            className="col-span-2"
            compact
          />
        </dl>

        <div className="mt-6 border-t border-subtle pt-5">
          <button
            type="button"
            onClick={() => setVehiclesOpen((o) => !o)}
            className="flex w-full items-center justify-between gap-2 text-left"
            aria-expanded={vehiclesOpen}
          >
            <span className="text-caption flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
              <Icon name="car" size="xs" />
              Vehicles
              <span className="rounded-full bg-mystic/15 px-2 py-0.5 tabular-nums text-mystic">
                {vehicles.length}
              </span>
            </span>
            <Icon
              name="arrow-down"
              size="xs"
              className={`shrink-0 transition-transform ${vehiclesOpen ? "rotate-180" : ""}`}
            />
          </button>

          {vehiclesOpen && (
            <div className="mt-3 space-y-2">
              {vehicles.length === 0 ? (
                <p className="text-body text-sm italic text-[var(--text-muted)]">
                  No owned vehicles
                </p>
              ) : (
                vehicles.map((v) => (
                  <div
                    key={`${v.plate}-${v.model}`}
                    className="rounded-xl border border-subtle surface-muted px-3 py-2.5"
                  >
                    <p className="text-heading text-sm font-semibold">
                      {v.modelLabel || v.model}
                    </p>
                    <dl className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                      <div>
                        <dt className="text-caption text-[10px] uppercase tracking-wider">
                          Plate
                        </dt>
                        <dd className="text-heading font-mono font-medium">
                          {v.plate}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-caption text-[10px] uppercase tracking-wider">
                          Status
                        </dt>
                        <dd className="text-heading font-medium">
                          {v.inGarage ? `Garage · ${v.garage}` : "Out"}
                        </dd>
                      </div>
                    </dl>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function Stat({ label, value, sub, accent, compact, className = "" }) {
  return (
    <div
      className={`rounded-xl border border-subtle surface-muted px-3 py-2.5 ${className}`}
    >
      <dt className="text-caption text-[10px] font-bold uppercase tracking-widest">
        {label}
      </dt>
      <dd
        className={`mt-0.5 font-semibold ${compact ? "text-xs" : "text-sm"} ${
          accent ? "text-mystic" : "text-heading"
        }`}
      >
        {value}
      </dd>
      {sub && <dd className="text-caption text-xs">{sub}</dd>}
    </div>
  );
}
