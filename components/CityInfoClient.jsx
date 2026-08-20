"use client";

import { useEffect, useMemo, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import Icon from "./Icon";

const CATEGORY_ICONS = { restaurants: "store", law: "shield", mechanics: "briefcase", dealership: "car", other: "building" };

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
    let active = true;
    fetch("/api/city")
      .then(async (response) => {
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body.error || "Failed to load the City Directory");
        }
        return response.json();
      })
      .then((body) => active && setData(body))
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [status]);

  const businesses = data?.businesses || [];
  const categories = data?.categories || [];
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return businesses.filter((business) => {
      if (activeCategory !== "all" && business.category !== activeCategory) return false;
      if (!term) return true;
      const haystack = [business.name, business.location, business.categoryLabel, business.description, business.phone, ...(business.services || []), ...(business.owners || []).map((owner) => owner.characterName)].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(term);
    });
  }, [businesses, activeCategory, query]);

  const stats = useMemo(() => ({
    total: businesses.length,
    operated: businesses.filter((business) => business.owners?.length).length,
    hiring: businesses.filter((business) => business.hiringStatus === "hiring").length,
  }), [businesses]);

  if (status === "loading" || (status === "authenticated" && loading)) return <CitySkeleton />;
  if (status === "unauthenticated") {
    return (
      <div className="city-directory-login">
        <span className="city-seal"><Icon name="city" size="lg" /></span>
        <p className="eyebrow">Los Santos public records</p>
        <h1>Mystic Dreams City Directory</h1>
        <p>Sign in with Discord to browse registered businesses, public departments, locations, ownership, services, and hiring information.</p>
        <button type="button" className="btn-primary" onClick={() => signIn("discord", { callbackUrl: "/city" })}>Continue with Discord</button>
      </div>
    );
  }
  if (error) return <div className="city-directory-login"><h1>Directory unavailable</h1><p>{error}</p><button type="button" className="btn-secondary" onClick={() => location.reload()}>Try again</button></div>;

  return (
    <div className="city-directory">
      <header className="city-directory-hero">
        <div>
          <p className="eyebrow">City of Los Santos • Registered organizations</p>
          <h1>City <span className="text-gradient">Directory</span></h1>
          <p>Find where to go, who operates each organization, what services they provide, and whether they are currently hiring.</p>
        </div>
        <div className="city-directory-stats">
          <div><strong>{stats.total}</strong><span>Listings</span></div>
          <div><strong>{stats.operated}</strong><span>Operated</span></div>
          <div><strong>{stats.hiring}</strong><span>Hiring</span></div>
        </div>
      </header>

      <div className="city-directory-toolbar">
        <div className="city-category-pills">
          <button className={activeCategory === "all" ? "active" : ""} onClick={() => setActiveCategory("all")}>All <span>{businesses.length}</span></button>
          {categories.map((category) => <button key={category.id} className={activeCategory === category.id ? "active" : ""} onClick={() => setActiveCategory(category.id)}>{category.label} <span>{category.businesses.length}</span></button>)}
        </div>
        <label className="city-directory-search">
          <i className="fa-regular fa-magnifying-glass" />
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search business, location, service, owner…" />
        </label>
      </div>

      <div className="city-directory-count">Showing {filtered.length} {filtered.length === 1 ? "listing" : "listings"}</div>
      {filtered.length ? (
        <div className="city-directory-grid">
          {filtered.map((business) => <BusinessCard key={business.jobKey} business={business} />)}
        </div>
      ) : <div className="city-empty"><i className="fa-regular fa-building" /><h2>No matching listings</h2><p>Try another search or category.</p></div>}
    </div>
  );
}

function BusinessCard({ business }) {
  const owner = business.owners?.[0];
  const hiringLabel = business.hiringStatus === "hiring" ? "Now hiring" : business.hiringStatus === "not_hiring" ? "Not hiring" : "Hiring status unknown";
  return (
    <article className={`city-business-card ${business.isFeatured ? "city-business-featured" : ""}`}>
      <div className="city-business-top">
        <div className="city-business-mark">
          {business.logoUrl ? <img src={business.logoUrl} alt="" loading="lazy" /> : <Icon name={business.icon || CATEGORY_ICONS[business.category] || "building"} size="sm" />}
        </div>
        <div className="min-w-0"><div className="city-business-title-line"><h2>{business.name}</h2>{business.isFeatured && <span>Featured</span>}</div><p>{business.categoryLabel}</p></div>
      </div>

      <p className="city-business-description">{business.description || `Registered ${business.categoryLabel?.toLowerCase() || "organization"} serving the Mystic Dreams community.`}</p>

      <dl className="city-business-details">
        <div><dt><i className="fa-regular fa-location-dot" /> Location</dt><dd>{business.location}</dd></div>
        <div><dt><i className="fa-regular fa-phone" /> Phone</dt><dd>{business.phone || "Not listed"}</dd></div>
        <div><dt><i className="fa-regular fa-clock" /> Hours</dt><dd>{business.hours || "Hours vary"}</dd></div>
        <div><dt><i className="fa-regular fa-user-tie" /> Management</dt><dd>{owner ? owner.characterName : "No owner on file"}</dd></div>
      </dl>

      {business.services?.length > 0 && <div className="city-business-services">{business.services.slice(0, 5).map((service) => <span key={service}>{service}</span>)}</div>}
      <div className="city-business-footer">
        <span className={`city-hiring city-hiring-${business.hiringStatus}`}>{hiringLabel}</span>
        {business.owners?.length > 1 && <span>{business.owners.length} managers on record</span>}
      </div>
    </article>
  );
}

function CitySkeleton() {
  return <div className="city-directory"><div className="city-directory-hero city-skeleton"><div /><div /></div><div className="city-directory-grid">{[1,2,3,4,5,6].map((item) => <div className="city-business-card city-skeleton-card" key={item} />)}</div></div>;
}
