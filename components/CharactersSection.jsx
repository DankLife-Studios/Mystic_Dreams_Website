"use client";

import { useState } from "react";
import CharacterCard from "./CharacterCard";

export default function CharactersSection({ characters }) {
  const [activeCid, setActiveCid] = useState(
    () => characters[0]?.citizenid ?? null
  );

  if (!characters?.length) return null;

  const active =
    characters.find((c) => c.citizenid === activeCid) ?? characters[0];

  const vehicleCount = (active.vehicles || []).length;

  return (
    <section aria-labelledby="characters-heading">
      <div className="dashboard-overview">
        <div className="dashboard-overview-cell">
          <p className="text-caption text-[10px] uppercase tracking-wide">
            Characters
          </p>
          <p className="text-heading font-display mt-1 text-2xl font-semibold tabular-nums">
            {characters.length}
          </p>
        </div>
        <div className="dashboard-overview-cell">
          <p className="text-caption text-[10px] uppercase tracking-wide">
            Vehicles
          </p>
          <p className="text-heading font-display mt-1 text-2xl font-semibold tabular-nums">
            {vehicleCount}
          </p>
        </div>
        <div className="dashboard-overview-cell">
          <p className="text-caption text-[10px] uppercase tracking-wide">
            Active slot
          </p>
          <p className="text-heading font-display mt-1 text-2xl font-semibold tabular-nums">
            {active.cid}
          </p>
        </div>
      </div>

      {characters.length > 1 && (
        <div className="dash-slot-tabs" role="tablist" aria-label="Character slots">
          {characters.map((char) => (
            <button
              key={char.citizenid}
              type="button"
              role="tab"
              aria-selected={char.citizenid === active.citizenid}
              onClick={() => setActiveCid(char.citizenid)}
              className={`dash-slot-tab ${
                char.citizenid === active.citizenid ? "dash-slot-tab-active" : ""
              }`}
            >
              {char.characterName || char.name || `Slot ${char.cid}`}
            </button>
          ))}
        </div>
      )}

      <CharacterCard character={active} />
    </section>
  );
}
