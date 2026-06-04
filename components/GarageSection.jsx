"use client";

import { useMemo } from "react";
import Icon from "./Icon";

function formatGarageName(garageId) {
  if (!garageId || garageId === "Unknown") return null;
  return String(garageId)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function GarageSection({ vehicles = [] }) {
  const sorted = useMemo(
    () =>
      [...vehicles].sort((a, b) => {
        const nameA = (a.modelLabel || a.model || "").toLowerCase();
        const nameB = (b.modelLabel || b.model || "").toLowerCase();
        return nameA.localeCompare(nameB);
      }),
    [vehicles]
  );

  return (
    <section className="dash-garage" aria-labelledby="garage-heading">
      <div className="dash-garage-header">
        <div className="dash-garage-title">
          <span className="icon-box icon-box-md">
            <Icon name="car" size="xs" />
          </span>
          <div>
            <h4 id="garage-heading" className="text-heading text-sm font-semibold">
              Garage
            </h4>
            <p className="text-caption text-xs">
              Personal vehicles · excludes job & gang
            </p>
          </div>
        </div>
        <span className="dash-garage-count tabular-nums" aria-label="Vehicle count">
          {vehicles.length}
        </span>
      </div>

      {vehicles.length === 0 ? (
        <div className="dash-garage-empty">
          <span className="icon-box icon-box-lg mx-auto">
            <Icon name="car" size="md" />
          </span>
          <p className="text-heading font-display mt-4 text-sm font-semibold">
            No personal vehicles
          </p>
          <p className="text-body mx-auto mt-1 max-w-xs text-xs">
            Job and gang vehicles are not listed here. Purchase a personal car
            in-game to see it on this page.
          </p>
        </div>
      ) : (
        <ul className="dash-vehicle-list">
          {sorted.map((v) => (
            <VehicleRow key={`${v.plate}-${v.model}`} vehicle={v} />
          ))}
        </ul>
      )}
    </section>
  );
}

function VehicleRow({ vehicle }) {
  const label = vehicle.modelLabel || vehicle.model;
  const showSpawn =
    vehicle.model &&
    label.toLowerCase() !== String(vehicle.model).toLowerCase();
  const garageName = formatGarageName(vehicle.garage);

  return (
    <li className="dash-vehicle-card">
      <div className="dash-vehicle-card-main">
        <span className="dash-vehicle-icon" aria-hidden>
          <Icon name="car" size="sm" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-heading truncate font-semibold">{label}</p>
          {showSpawn && (
            <p className="text-caption truncate font-mono text-xs">
              {vehicle.model}
            </p>
          )}
        </div>
        <div className="dash-vehicle-plate">
          <span className="dash-vehicle-plate-label">Plate</span>
          <span className="dash-vehicle-plate-value">{vehicle.plate}</span>
        </div>
      </div>
      {garageName && (
        <div className="dash-vehicle-garage">
          <Icon name="route" size="xs" className="text-caption shrink-0" />
          <span className="truncate text-xs">{garageName}</span>
        </div>
      )}
    </li>
  );
}
