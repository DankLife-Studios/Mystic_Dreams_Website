"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import WikiMarkdownEditor from "./WikiMarkdownEditor";

export default function WikiCreateClient() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [category, setCategory] = useState("General");
    const [content, setContent] = useState("");
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    useEffect(() => {
        async function loadCategories() {
            try {
                const res = await fetch("/api/wiki");
                if (res.ok) {
                    const data = await res.json();
                    setCategories(data.categories || []);
                }
            } catch {
                // Silently fail — user can still type a category
            } finally {
                setCategoriesLoading(false);
            }
        }
        loadCategories();
    }, []);

    async function handleSubmit(event) {
        event.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const res = await fetch("/api/wiki", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, slug, category, content }),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.error || "Failed to create page");
            }

            const page = await res.json();
            router.push(`/wiki/${page.slug}`);
        } catch (err) {
            setMessage(err.message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="space-y-4 border-b border-slate-800 pb-8">
                <h1 className="text-5xl font-serif font-bold tracking-tight text-white">Create wiki article</h1>
                <p className="text-lg text-slate-300">
                    Build a new entry for the Mystic Dreams wiki. Use a clear title and category to keep articles organized.
                </p>
                <Link href="/wiki" className="text-violet-400 hover:text-violet-300 transition text-sm">
                    ← Back to wiki
                </Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                        <label className="block text-sm font-semibold text-white mb-2">Title</label>
                        <input
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            required
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-white outline-none focus:border-violet-500 transition"
                            placeholder="Article title"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-white mb-2">Slug (optional)</label>
                        <input
                            value={slug}
                            onChange={(event) => setSlug(event.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-white outline-none focus:border-violet-500 transition"
                            placeholder="article-slug"
                        />
                        <p className="text-xs text-slate-500 mt-1">Leave blank to auto-generate from title</p>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-white mb-2">Category</label>
                    <div className="relative">
                        <input
                            value={category}
                            onChange={(event) => setCategory(event.target.value)}
                            list="wiki-categories"
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-white outline-none focus:border-violet-500 transition"
                            placeholder="General"
                        />
                        <datalist id="wiki-categories">
                            {categories.map((cat) => (
                                <option key={cat.name} value={cat.name} />
                            ))}
                        </datalist>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                        {categoriesLoading
                            ? "Loading categories…"
                            : `${categories.length} categories available — type a new one to create on the fly`}
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-white mb-2">Content</label>
                    <WikiMarkdownEditor value={content} onChange={setContent} />
                </div>

                <div className="flex items-center justify-between">
                    {message && <p className="text-sm text-rose-300">{message}</p>}
                    <button
                        type="submit"
                        disabled={saving}
                        className="ml-auto px-5 py-2.5 text-sm font-medium text-white bg-violet-500 rounded-lg hover:bg-violet-400 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {saving ? "Creating..." : "Create article"}
                    </button>
                </div>
            </form>
        </div>
    );
}
