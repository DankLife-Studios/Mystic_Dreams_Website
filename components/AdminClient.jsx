"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import CharacterCard from "./CharacterCard";

export default function AdminClient({ permissions }) {
  const tabs = [permissions.canEditWiki && "wiki", permissions.isStaff && "directory", permissions.isStaff && "characters"].filter(Boolean);
  const [tab, setTab] = useState(tabs[0] || "wiki");

  return (
    <main className="admin-shell">
      <header className="admin-header"><div><p className="eyebrow">Protected staff area</p><h1>Website administration</h1><p>Manage published knowledge, city directory presentation, and staff-only character lookup without writing to the game database.</p></div><span className="admin-lock"><i className="fa-regular fa-shield-halved" /> Role protected</span></header>
      <nav className="admin-tabs">
        {permissions.canEditWiki && <button className={tab === "wiki" ? "active" : ""} onClick={() => setTab("wiki")}>Wiki</button>}
        {permissions.isStaff && <button className={tab === "directory" ? "active" : ""} onClick={() => setTab("directory")}>City Directory</button>}
        {permissions.isStaff && <button className={tab === "characters" ? "active" : ""} onClick={() => setTab("characters")}>Character Search</button>}
      </nav>
      {tab === "wiki" && <WikiAdmin permissions={permissions} />}
      {tab === "directory" && permissions.isStaff && <DirectoryAdmin />}
      {tab === "characters" && permissions.isStaff && <CharacterSearch />}
    </main>
  );
}

function WikiAdmin({ permissions }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);

  const load = () => fetch("/api/wiki?admin=1").then((res) => res.json()).then((body) => { if (body.error) throw new Error(body.error); setData(body); }).catch((err) => setError(err.message));
  useEffect(load, []);

  const grouped = useMemo(() => {
    const result = { review: [], draft: [], published: [] };
    for (const page of data?.pages || []) (result[page.status] || result.draft).push(page);
    return result;
  }, [data]);

  async function setStatus(page, status) {
    setBusy(page.slug);
    try {
      const response = await fetch(`/api/wiki/${page.slug}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Status update failed");
      await load();
    } catch (err) { setError(err.message); } finally { setBusy(null); }
  }

  if (!data && !error) return <AdminLoading />;
  return (
    <section className="admin-panel">
      <div className="admin-panel-head"><div><span>Knowledge base</span><h2>Wiki workflow</h2></div><Link href="/wiki/new" className="btn-primary">New article</Link></div>
      {error && <p className="admin-error">{error}</p>}
      <div className="wiki-workflow-summary"><div><strong>{grouped.draft.length}</strong><span>Drafts</span></div><div><strong>{grouped.review.length}</strong><span>In review</span></div><div><strong>{grouped.published.length}</strong><span>Published</span></div></div>
      <div className="admin-wiki-list">
        {(["review", "draft", "published"]).map((status) => (
          <div key={status} className="admin-wiki-group"><h3>{status === "review" ? "Review queue" : status[0].toUpperCase() + status.slice(1)}</h3>
            {grouped[status].length === 0 ? <p className="admin-empty-row">Nothing here.</p> : grouped[status].map((page) => (
              <article key={page.slug} className="admin-wiki-row"><div><span>{page.category}</span><strong>{page.title}</strong><small>{page.summary || `/${page.slug}`}</small></div><div className="admin-row-actions"><Link href={`/wiki/${page.slug}/edit`}>Edit</Link>{status === "draft" && <button disabled={busy === page.slug} onClick={() => setStatus(page, "review")}>Submit for review</button>}{status === "review" && permissions.canReviewWiki && <button disabled={busy === page.slug} onClick={() => setStatus(page, "published")}>Publish</button>}{status === "published" && <button disabled={busy === page.slug} onClick={() => setStatus(page, "draft")}>Move to draft</button>}</div></article>
            ))}
          </div>
        ))}
      </div>
      <div className="admin-category-summary"><div><span>Wiki structure</span><h3>Categories</h3></div><div className="admin-category-chips">{(data.flatCategories || []).map((category) => <span key={category.name}>{category.name}</span>)}</div></div>
    </section>
  );
}

function DirectoryAdmin() {
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({});
  const [message, setMessage] = useState(null);

  useEffect(() => { fetch("/api/admin/city").then((res) => res.json()).then(setData); }, []);
  const metadataMap = useMemo(() => new Map((data?.metadata || []).map((entry) => [entry.job_key, entry])), [data]);

  function choose(business) {
    const extra = metadataMap.get(business.jobKey) || {};
    setSelected(business);
    setForm({
      jobKey: business.jobKey,
      displayName: extra.display_name || business.name,
      description: extra.description || "",
      logoUrl: extra.logo_url || "",
      phone: extra.phone || "",
      hours: extra.hours || "",
      location: extra.location_override || business.location,
      services: (extra.services || []).join(", "),
      hiringStatus: extra.hiring_status || "unknown",
      isFeatured: Boolean(extra.is_featured),
    });
    setMessage(null);
  }

  async function save(event) {
    event.preventDefault();
    const response = await fetch("/api/admin/city", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const body = await response.json();
    if (!response.ok) return setMessage(body.error || "Save failed");
    setMessage("Directory listing updated.");
    const refreshed = await fetch("/api/admin/city").then((res) => res.json());
    setData(refreshed);
  }

  if (!data) return <AdminLoading />;
  return <section className="admin-panel"><div className="admin-panel-head"><div><span>In-universe records</span><h2>City Directory</h2></div></div><div className="directory-admin-layout"><div className="directory-admin-list">{data.businesses?.map((business) => <button key={business.jobKey} className={selected?.jobKey === business.jobKey ? "active" : ""} onClick={() => choose(business)}><strong>{business.name}</strong><span>{business.location}</span></button>)}</div><div>{selected ? <form className="directory-admin-form" onSubmit={save}><h3>{selected.name}</h3><Field label="Display name" value={form.displayName} onChange={(value) => setForm({ ...form, displayName: value })} /><Field label="Description" value={form.description} multiline onChange={(value) => setForm({ ...form, description: value })} /><div className="admin-form-grid"><Field label="Phone" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} /><Field label="Hours" value={form.hours} onChange={(value) => setForm({ ...form, hours: value })} /></div><Field label="Location" value={form.location} onChange={(value) => setForm({ ...form, location: value })} /><Field label="Logo URL" value={form.logoUrl} onChange={(value) => setForm({ ...form, logoUrl: value })} /><Field label="Services" help="Comma-separated" value={form.services} onChange={(value) => setForm({ ...form, services: value })} /><label className="admin-field"><span>Hiring status</span><select value={form.hiringStatus} onChange={(event) => setForm({ ...form, hiringStatus: event.target.value })}><option value="unknown">Unknown</option><option value="hiring">Hiring</option><option value="not_hiring">Not hiring</option></select></label><label className="admin-check"><input type="checkbox" checked={form.isFeatured} onChange={(event) => setForm({ ...form, isFeatured: event.target.checked })} /> Feature this listing</label><button className="btn-primary" type="submit">Save listing</button>{message && <p className="admin-save-message">{message}</p>}</form> : <div className="admin-empty-card"><i className="fa-regular fa-building" /><p>Select a listing to edit its website information.</p></div>}</div></div></section>;
}

function Field({ label, value, onChange, multiline, help }) {
  const props = { value: value || "", onChange: (event) => onChange(event.target.value) };
  return <label className="admin-field"><span>{label}{help && <small>{help}</small>}</span>{multiline ? <textarea rows={4} {...props} /> : <input {...props} />}</label>;
}

function CharacterSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  async function search(event) {
    event.preventDefault();
    if (query.trim().length < 2) return;
    setLoading(true);
    const body = await fetch(`/api/admin/characters?q=${encodeURIComponent(query.trim())}`).then((res) => res.json());
    setResults(body.characters || []);
    setSelected(null);
    setLoading(false);
  }

  return <section className="admin-panel"><div className="admin-panel-head"><div><span>Read-only game database</span><h2>Character Search</h2></div></div><form className="admin-character-search" onSubmit={search}><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name, Citizen ID, or phone…" /><button className="btn-primary" type="submit">Search</button></form><div className="admin-character-results">{loading ? <p>Searching…</p> : results.map((character) => <button key={character.citizenid} onClick={() => setSelected(character)} className={selected?.citizenid === character.citizenid ? "active" : ""}><strong>{character.characterName}</strong><span>{character.citizenid} • {character.employment?.label}</span></button>)}</div>{selected && <div className="admin-character-preview"><CharacterCard character={selected} section="overview" /></div>}</section>;
}

function AdminLoading() { return <div className="admin-panel admin-loading"><div /><div /><div /></div>; }
