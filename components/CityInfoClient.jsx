"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import Icon from "./Icon";

export default function CityInfoClient() {
  const { status } = useSession();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (status === "loading" || (status === "authenticated" && loading)) {
    return <CitySkeleton />;
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="surface-card w-full max-w-sm rounded-3xl p-8 text-center">
          <div className="icon-box icon-box-xl icon-on-gradient mx-auto bg-linear-to-br from-mystic to-mystic-dark shadow-lg shadow-mystic/30">
            <Icon name="city" size="xl" />
          </div>
          <h2 className="text-heading font-display mt-6 text-xl font-bold">
            Sign in required
          </h2>
          <p className="text-body mt-2 text-sm">
            Log in with Discord to view the city business directory and owners.
          </p>
          <button
            type="button"
            onClick={() => signIn("discord", { callbackUrl: "/city" })}
            className="mt-6 w-full rounded-xl bg-linear-to-r from-mystic to-mystic-dark py-3.5 text-sm font-semibold text-white shadow-lg shadow-mystic/25 transition hover:brightness-110"
          >
            Continue with Discord
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-500/30 bg-red-500/5 p-8 text-center">
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

  const categories = data?.categories || [];

  if (categories.length === 0) {
    return (
      <div className="surface-card rounded-3xl px-6 py-14 text-center">
        <p className="text-heading font-display text-lg font-semibold">
          No businesses configured
        </p>
        <p className="text-body mt-2 text-sm">
          Enable entries in lib/businesses.js to populate this directory.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {categories.map((category) => (
        <section key={category.id}>
          <h2 className="text-heading font-display mb-4 flex items-center gap-2 text-lg font-bold tracking-tight sm:text-xl">
            <Icon name={CATEGORY_ICONS[category.id] || "building"} size="sm" />
            {category.label}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {category.businesses.map((biz) => (
              <BusinessCard key={biz.jobKey} business={biz} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

const CATEGORY_ICONS = {
  restaurants: "store",
  law: "shield",
  mechanics: "car",
  dealership: "car",
  other: "building",
};

function BusinessCard({ business }) {
  const hasOwners = business.owners?.length > 0;

  return (
    <article className="surface-card overflow-hidden rounded-2xl transition duration-300 hover:border-mystic/40 hover:shadow-lg hover:shadow-mystic/10">
      <div className="flex items-start gap-3 border-b border-subtle bg-[var(--surface-muted)] px-5 py-4">
        <span className="icon-box icon-box-md shrink-0">
          <Icon name={business.icon || "building"} size="md" className="icon-fancy" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-heading font-display truncate text-base font-bold">
            {business.name}
          </h3>
          <p className="text-caption mt-0.5 flex items-start gap-1.5 text-xs">
            <Icon name="route" size="xs" className="mt-0.5 shrink-0" />
            <span>{business.location}</span>
          </p>
        </div>
      </div>
      <div className="px-5 py-4">
        <p className="text-caption text-[10px] font-bold uppercase tracking-widest">
          Business owner
        </p>
        {hasOwners ? (
          <ul className="mt-2 space-y-2">
            {business.owners.map((owner) => (
              <li
                key={owner.citizenid}
                className="rounded-xl border border-subtle surface-muted px-3 py-2"
              >
                <p className="text-heading text-sm font-semibold">
                  {owner.characterName}
                </p>
                {owner.gradeName && (
                  <p className="text-caption text-xs">{owner.gradeName}</p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-body mt-2 text-sm italic text-[var(--text-muted)]">
            Vacant
          </p>
        )}
      </div>
    </article>
  );
}

function CitySkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="surface-muted h-8 w-48 rounded-lg" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="surface-muted h-40 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
