"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import WikiMarkdownEditor from "./WikiMarkdownEditor";

export default function WikiEditClient({ slug }) {
  const { status: authStatus } = useSession();
  const [page, setPage] = useState(null);
  const [form, setForm] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([fetch(`/api/wiki/${slug}?admin=1`), fetch("/api/wiki/categories")])
      .then(async ([pageResponse, categoryResponse]) => {
        const pageBody = await pageResponse.json();
        if (!pageResponse.ok) throw new Error(pageBody.error || "Failed to load article");
        const categoryBody = categoryResponse.ok ? await categoryResponse.json() : { categories: [] };
        const loaded = pageBody.page;
        setPage(loaded);
        setForm({
          title: loaded.title,
          category: loaded.category,
          summary: loaded.summary || "",
          tags: (loaded.tags || []).join(", "),
          content: loaded.content,
          isHomepage: Boolean(loaded.is_homepage),
        });
        setCategories(categoryBody.categories || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/wiki/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean) }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Failed to save article");
      setPage(body);
      setMessage("Changes saved.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!window.confirm(`Delete “${page.title}”? This cannot be undone.`)) return;
    const response = await fetch(`/api/wiki/${slug}`, { method: "DELETE" });
    if (response.ok) window.location.href = "/admin";
    else setMessage((await response.json().catch(() => ({}))).error || "Delete failed");
  }

  if (loading) return <div className="wiki-state">Loading article…</div>;
  if (error) return <div className="wiki-state"><p>{error}</p>{authStatus !== "authenticated" && <button className="btn-primary" onClick={() => signIn("discord", { callbackUrl: `/wiki/${slug}/edit` })}>Sign in</button>}</div>;
  if (!form) return null;

  return (
    <div className="wiki-editor-shell">
      <header className="wiki-editor-header"><div><p className="eyebrow">Wiki staff • {page.status}</p><h1>Edit {page.title}</h1><p>Slug: <code>/{page.slug}</code> • Last updated {new Date(page.updated_at).toLocaleString()}</p></div><div className="wiki-editor-header-actions">{page.status === "published" && <Link href={`/wiki/${page.slug}`}>View article</Link>}<Link href="/admin">Staff tools</Link></div></header>
      <form onSubmit={save} className="wiki-editor-form">
        <div className="wiki-editor-grid"><Field label="Title" required value={form.title} onChange={(value) => set("title", value)} /><label className="admin-field"><span>Category</span><input list="wiki-categories-edit" value={form.category} onChange={(event) => set("category", event.target.value)} /><datalist id="wiki-categories-edit">{categories.map((category) => <option key={category.name} value={category.name} />)}</datalist></label></div>
        <Field label="Summary" value={form.summary} onChange={(value) => set("summary", value)} />
        <Field label="Tags" value={form.tags} onChange={(value) => set("tags", value)} placeholder="comma, separated, tags" />
        <label className="admin-check"><input type="checkbox" checked={form.isHomepage} onChange={(event) => set("isHomepage", event.target.checked)} /> Set as wiki homepage</label>
        <div className="wiki-editor-content"><div className="wiki-editor-content-head"><div><span>Article content</span><small>Markdown + galleries, callouts, tables, buttons, and YouTube embeds</small></div></div><WikiMarkdownEditor value={form.content} onChange={(value) => set("content", value)} /></div>
        <div className="wiki-editor-footer"><button type="button" className="wiki-delete-button" onClick={remove}>Delete article</button><div>{message && <p>{message}</p>}<button type="submit" disabled={saving} className="btn-primary">{saving ? "Saving…" : "Save changes"}</button></div></div>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, ...props }) { return <label className="admin-field"><span>{label}</span><input value={value || ""} onChange={(event) => onChange(event.target.value)} {...props} /></label>; }
