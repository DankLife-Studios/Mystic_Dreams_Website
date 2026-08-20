"use client";

import { useEffect, useMemo, useState } from "react";
import CharacterCard from "./CharacterCard";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "employment", label: "Employment" },
  { id: "licenses", label: "Licenses" },
  { id: "vehicles", label: "Vehicles" },
];

export default function CharactersSection({ characters }) {
  const [activeCid, setActiveCid] = useState(
    () => characters[0]?.citizenid ?? null
  );
  const [section, setSection] = useState("overview");

  const list = characters || [];
  const active =
    list.find((character) => character.citizenid === activeCid) ??
    list[0] ?? null;

  useEffect(() => {
    setSection("overview");
  }, [activeCid]);

  const totalVehicles = useMemo(
    () => list.reduce((sum, character) => sum + (character.vehicles?.length || 0), 0),
    [list]
  );

  if (!active) return null;

  return (
    <section aria-labelledby="characters-heading">
      <div className="dashboard-overview">
        <div className="dashboard-overview-cell">
          <p className="text-caption text-[10px] uppercase tracking-wide">Characters</p>
          <p className="text-heading font-display mt-1 text-2xl font-semibold tabular-nums">
            {list.length}
          </p>
        </div>
        <div className="dashboard-overview-cell">
          <p className="text-caption text-[10px] uppercase tracking-wide">Vehicles</p>
          <p className="text-heading font-display mt-1 text-2xl font-semibold tabular-nums">
            {totalVehicles}
          </p>
        </div>
        <div className="dashboard-overview-cell">
          <p className="text-caption text-[10px] uppercase tracking-wide">Active slot</p>
          <p className="text-heading font-display mt-1 text-2xl font-semibold tabular-nums">
            {active.cid}
          </p>
        </div>
      </div>

      {list.length > 1 && (
        <div className="dash-slot-tabs" role="tablist" aria-label="Character slots">
          {list.map((character) => (
            <button
              key={character.citizenid}
              type="button"
              role="tab"
              aria-selected={character.citizenid === active.citizenid}
              onClick={() => setActiveCid(character.citizenid)}
              className={`dash-slot-tab ${
                character.citizenid === active.citizenid ? "dash-slot-tab-active" : ""
              }`}
            >
              {character.characterName || character.name || `Slot ${character.cid}`}
            </button>
          ))}
        </div>
      )}

      <div className="dash-profile-tabs" role="tablist" aria-label="Character information">
        {SECTIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={section === item.id}
            onClick={() => setSection(item.id)}
            className={`dash-profile-tab ${section === item.id ? "dash-profile-tab-active" : ""}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <CharacterCard character={active} section={section} />
    </section>
  );
}
