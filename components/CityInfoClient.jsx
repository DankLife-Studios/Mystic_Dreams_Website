"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import Icon from "./Icon";

const CATEGORY_ACCENTS = {
  restaurants: "city-dir-accent-restaurants",
  law: "city-dir-accent-law",
  mechanics: "city-dir-accent-mechanics",
  dealership: "city-dir-accent-dealership",
  other: "city-dir-accent-other",
};

const CATEGORY_ICONS = {
  restaurants: "store",
  law: "shield",
  mechanics: "briefcase",
  dealership: "car",
  other: "building",
};

export default function CityInfoClient() {
  const { status } = useSession();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (status !== "authenticated") {
      setLoading(false);
      return;
    }

    async function load() {
      try {
        const res = await fetch("/api/city");
        if (res.status === 401) {
          setError("unauthorized");
          return;
        }
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Failed to load city directory");
        }
        setData(await res.json());
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [status]);

  const businesses = data?.businesses || [];
  const categories = data?.categories || [];

  const stats = useMemo(() => {
    const staffed = businesses.filter((b) => b.owners?.length > 0).length;
    return {
      total: businesses.length,
      staffed,
      vacant: businesses.length - staffed,
    };
  }, [businesses]);

  const categoryCounts = useMemo(() => {
    const counts = { all: businesses.length };
    for (const cat of categories) {
      counts[cat.id] = cat.businesses.length;
    }
    return counts;
  }, [businesses, categories]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return businesses.filter((biz) => {
      if (activeCategory !== "all" && biz.category !== activeCategory) {
        return false;
      }
      if (!q) return true;
      return (
        biz.name.toLowerCase().includes(q) ||
        biz.location.toLowerCase().includes(q) ||
        biz.categoryLabel?.toLowerCase().includes(q) ||
        biz.owners?.some((o) =>
          o.characterName.toLowerCase().includes(q)
        )
      );
    });
  }, [businesses, activeCategory, query]);

  const sections = useMemo(() => {
    const q = query.trim();
    if (q) {
      return filtered.length > 0
        ? [{ id: "search", label: "Search results", businesses: filtered }]
        : [];
    }
    if (activeCategory !== "all") {
      const cat = categories.find((c) => c.id === activeCategory);
      return filtered.length > 0 && cat
        ? [{ ...cat, businesses: filtered }]
        : [];
    }
    return categories
      .map((cat) => ({
        ...cat,
        businesses: filtered.filter((b) => b.category === cat.id),
      }))
      .filter((cat) => cat.businesses.length > 0);
  }, [filtered, categories, activeCategory, query]);

  if (status === "loading" || (status === "authenticated" && loading)) {
    return <CitySkeleton />;
  }

  if (status === "unauthenticated") {
    return (
      <div className="city-dir-login">
        <span className="icon-box icon-box-xl mx-auto">
          <Icon name="city" size="lg" />
        </span>
        <h1 className="text-heading font-display mt-6 text-2xl font-semibold">
          City directory
        </h1>
        <p className="text-body mt-2 text-sm leading-relaxed">
          Sign in with Discord to see businesses, locations, and who runs them
          in Los Santos.
        </p>
        <button
          type="button"
          onClick={() => signIn("discord", { callbackUrl: "/city" })}
          className="btn-primary mt-8 w-full"
        >
          Continue with Discord
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="city-dir-alert city-dir-alert-error text-center">
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

  if (categories.length === 0) {
    return (
      <div className="city-dir-empty">
        <span className="icon-box icon-box-lg mx-auto">
          <Icon name="building" size="md" />
        </span>
        <p className="text-heading font-display mt-4 font-semibold">
          No businesses configured
        </p>
      </div>
    );
  }

  return (
    <div className="city-dir-layout">
      <aside className="city-dir-sidebar">
        <div className="city-dir-sidebar-head">
          <span className="icon-box icon-box-md">
            <Icon name="city" size="sm" />
          </span>
          <div>
            <p className="text-heading text-sm font-semibold">Overview</p>
            <p className="text-caption text-xs">Bosses from live DB</p>
          </div>
        </div>

        <div className="city-dir-stats">
          <div className="city-dir-stat">
            <p className="city-dir-stat-label">Total</p>
            <p className="city-dir-stat-value">{stats.total}</p>
          </div>
          <div className="city-dir-stat">
            <p className="city-dir-stat-label">Staffed</p>
            <p className="city-dir-stat-value city-dir-stat-value-ok">
              {stats.staffed}
            </p>
          </div>
          <div className="city-dir-stat">
            <p className="city-dir-stat-label">Vacant</p>
            <p className="city-dir-stat-value">{stats.vacant}</p>
          </div>
        </div>

        <nav className="city-dir-nav" aria-label="Categories">
          <CategoryNavItem
            id="all"
            label="All businesses"
            icon="building"
            count={categoryCounts.all}
            active={activeCategory === "all"}
            onSelect={() => setActiveCategory("all")}
          />
          {categories.map((cat) => (
            <CategoryNavItem
              key={cat.id}
              id={cat.id}
              label={cat.label}
              icon={CATEGORY_ICONS[cat.id] || "building"}
              count={categoryCounts[cat.id] ?? 0}
              active={activeCategory === cat.id}
              accent={CATEGORY_ACCENTS[cat.id]}
              onSelect={() => setActiveCategory(cat.id)}
            />
          ))}
        </nav>
      </aside>

      <div className="city-dir-main">
        <header className="city-dir-main-header">
          <p className="eyebrow">Live server data</p>
          <h1 className="text-heading font-display mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            City <span className="text-gradient">directory</span>
          </h1>
          <p className="text-body mt-2 text-sm">
            Whitelisted businesses and departments — who runs them and where to
            find them in Los Santos.
          </p>
        </header>

        <div className="city-dir-toolbar">
          <label className="city-dir-search">
            <span className="sr-only">Search businesses</span>
            <Icon
              name="building"
              size="xs"
              className="text-caption pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, location, owner…"
            />
          </label>
          <p className="city-dir-result-count text-caption text-xs tabular-nums">
            {filtered.length} {filtered.length === 1 ? "business" : "businesses"}
          </p>
        </div>

        {sections.length === 0 ? (
          <div className="city-dir-empty">
            <span className="icon-box icon-box-lg mx-auto">
              <Icon name="building" size="md" />
            </span>
            <p className="text-heading font-display mt-4 font-semibold">
              No matches
            </p>
            <p className="text-body mt-2 text-sm">
              Try another category or search term.
            </p>
          </div>
        ) : (
          sections.map((section) => (
            <section key={section.id} className="city-dir-section">
              {sections.length > 1 || section.id === "search" ? (
                <div className="city-dir-section-head">
                  <h2 className="text-heading font-display text-sm font-semibold">
                    {section.label}
                  </h2>
                  <span className="text-caption text-xs tabular-nums">
                    {section.businesses.length}
                  </span>
                </div>
              ) : null}
              <div className="city-dir-grid">
                {section.businesses.map((biz) => (
                  <BusinessCard key={biz.jobKey} business={biz} />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}

function CategoryNavItem({
  id,
  label,
  icon,
  count,
  active,
  accent,
  onSelect,
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`city-dir-nav-item ${active ? "city-dir-nav-item-active" : ""}`}
    >
      <span
        className={`city-dir-nav-accent ${accent || ""}`}
        aria-hidden={!accent}
      />
      <span className="city-dir-nav-icon">
        <Icon name={icon} size="xs" duotone={icon !== "building"} />
      </span>
      <span className="city-dir-nav-label">{label}</span>
      <span className="city-dir-nav-count tabular-nums">{count}</span>
    </button>
  );
}

function BusinessCard({ business }) {
  const hasOwners = business.owners?.length > 0;
  const accent =
    CATEGORY_ACCENTS[business.category] || "city-dir-accent-other";

  return (
    <article className={`city-dir-card ${accent}`}>
      <div className="city-dir-card-top">
        <span className="icon-box icon-box-md shrink-0">
          <Icon name={business.icon || "building"} size="xs" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-heading truncate font-semibold">
              {business.name}
            </h3>
            <span
              className={
                hasOwners ? "city-dir-pill-ok" : "city-dir-pill-vacant"
              }
            >
              {hasOwners ? "Staffed" : "Vacant"}
            </span>
          </div>
          <p className="text-caption mt-0.5 text-xs">
            {business.categoryLabel}
          </p>
        </div>
      </div>

      <div className="city-dir-card-location">
        <Icon name="route" size="xs" className="text-caption shrink-0" />
        <p className="text-body truncate text-sm">{business.location}</p>
      </div>

      <div className="city-dir-card-owner">
        <p className="city-dir-card-owner-label">Owner</p>
        {hasOwners ? (
          <ul className="city-dir-owner-list">
            {business.owners.map((owner) => (
              <li key={owner.citizenid}>
                <p className="text-heading truncate text-sm font-medium">
                  {owner.characterName}
                </p>
                {owner.gradeName && (
                  <p className="text-caption truncate text-xs">
                    {owner.gradeName}
                  </p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-caption text-sm italic">No owner on file</p>
        )}
      </div>
    </article>
  );
}

function CitySkeleton() {
  return (
    <div className="city-dir-layout animate-pulse">
      <aside className="city-dir-sidebar space-y-3">
        <div className="surface-muted h-12 rounded-lg" />
        <div className="city-dir-stats">
          {[1, 2, 3].map((i) => (
            <div key={i} className="city-dir-stat">
              <div className="surface-muted mx-auto h-3 w-12 rounded" />
              <div className="surface-muted mx-auto mt-2 h-7 w-8 rounded" />
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="surface-muted h-10 rounded-lg" />
          ))}
        </div>
      </aside>
      <div className="space-y-4">
        <div className="surface-muted h-20 w-64 rounded" />
        <div className="surface-muted h-11 rounded-lg" />
        <div className="city-dir-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="surface-muted h-40 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
