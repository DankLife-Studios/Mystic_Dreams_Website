"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import WikiMarkdownEditor from "./WikiMarkdownEditor";

export default function WikiCreateClient() {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", slug: "", category: "Getting Started", summary: "", tags: "", content: "", isHomepage: false });
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetch("/api/wiki/categories").then((res) => res.json()).then((body) => setCategories(body.categories || [])).catch(() => {});
  }, []);

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch("/api/wiki", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean) }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Failed to create article");
      router.push(`/wiki/${body.slug}/edit`);
      router.refresh();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="wiki-editor-shell">
      <header className="wiki-editor-header"><div><p className="eyebrow">Wiki staff</p><h1>Create article</h1><p>New articles are saved as drafts. Submit them for review from Website Administration when they are ready.</p></div><Link href="/admin">← Staff tools</Link></header>
      <form onSubmit={submit} className="wiki-editor-form">
        <div className="wiki-editor-grid"><Field label="Title" required value={form.title} onChange={(value) => set("title", value)} placeholder="Article title" /><Field label="Slug" value={form.slug} onChange={(value) => set("slug", value)} placeholder="auto-generated-from-title" /></div>
        <Field label="Summary" value={form.summary} onChange={(value) => set("summary", value)} placeholder="A short description shown in search results and related articles." />
        <div className="wiki-editor-grid">
          <label className="admin-field"><span>Category</span><input list="wiki-categories-create" value={form.category} onChange={(event) => set("category", event.target.value)} /><datalist id="wiki-categories-create">{categories.map((category) => <option key={category.name} value={category.name} />)}</datalist></label>
          <Field label="Tags" value={form.tags} onChange={(value) => set("tags", value)} placeholder="getting started, vehicles, jobs" />
        </div>
        <label className="admin-check"><input type="checkbox" checked={form.isHomepage} onChange={(event) => set("isHomepage", event.target.checked)} /> Set as wiki homepage</label>
        <div className="wiki-editor-content"><div className="wiki-editor-content-head"><div><span>Article content</span><small>Markdown + rich wiki blocks</small></div><details><summary>Rich content syntax</summary><p>Gallery: fenced code block with language <code>gallery</code> and one image URL per line. YouTube: fenced code block with language <code>youtube</code> and a video URL/ID. Button: normal Markdown link with title <code>"button"</code>.</p></details></div><WikiMarkdownEditor value={form.content} onChange={(value) => set("content", value)} /></div>
        <div className="wiki-editor-footer">{message && <p className="admin-error">{message}</p>}<button type="submit" disabled={saving} className="btn-primary">{saving ? "Saving draft…" : "Create draft"}</button></div>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, ...props }) { return <label className="admin-field"><span>{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} {...props} /></label>; }
