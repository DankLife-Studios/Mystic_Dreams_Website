"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

export default function WikiIndexClient() {
    const { status } = useSession();
    const [pages, setPages] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [canCreate, setCanCreate] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [homePage, setHomePage] = useState(null);

    // Category management state
    const [newCategoryName, setNewCategoryName] = useState("");
    const [addingCategory, setAddingCategory] = useState(false);
    const [categoryMsg, setCategoryMsg] = useState(null);

    useEffect(() => {
        async function load() {
            setLoading(true);
            setError(null);

            try {
                const res = await fetch("/api/wiki");
                if (!res.ok) {
                    const body = await res.json().catch(() => ({}));
                    throw new Error(body.error || "Failed to load wiki index");
                }

                const data = await res.json();
                setPages(data.pages || []);
                setCategories(data.categories || []);
                setCanCreate(!!data.canCreate);
                setHomePage(data.homePage || null);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [status]);

    async function handleAddCategory(event) {
        event.preventDefault();
        const name = newCategoryName.trim();
        if (!name) return;

        setAddingCategory(true);
        setCategoryMsg(null);

        try {
            const res = await fetch("/api/wiki/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, description: "" }),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.error || "Failed to add category");
            }

            const data = await res.json();
            setNewCategoryName("");

            // Optimistically add to the list
            setCategories((prev) => {
                const exists = prev.some((c) => c.name === data.category.name);
                if (exists) return prev;
                return [
                    ...prev,
                    { name: data.category.name, description: "", pages: [] },
                ].sort((a, b) => a.name.localeCompare(b.name));
            });
        } catch (err) {
            setCategoryMsg(err.message);
        } finally {
            setAddingCategory(false);
        }
    }

    async function handleDeleteCategory(name) {
        if (!confirm(`Delete the "${name}" category? Pages in this category will NOT be deleted.`)) return;

        setCategoryMsg(null);

        try {
            const res = await fetch(`/api/wiki/categories?name=${encodeURIComponent(name)}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.error || "Failed to delete category");
            }

            // Remove from the local list
            setCategories((prev) => prev.filter((c) => c.name !== name));
            if (activeCategory === name) setActiveCategory("all");
        } catch (err) {
            setCategoryMsg(err.message);
        }
    }

    const filteredCategories = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        return categories
            .map((category) => ({
                ...category,
                pages: category.pages.filter((page) => {
                    if (!query) return true;
                    return (
                        page.title.toLowerCase().includes(query) ||
                        page.slug.toLowerCase().includes(query)
                    );
                }),
            }))
            .filter((category) => category.pages.length > 0);
    }, [categories, searchQuery]);

    const visibleCategories = useMemo(() => {
        if (activeCategory === "all") {
            return filteredCategories;
        }
        return filteredCategories.filter((category) => category.name === activeCategory);
    }, [filteredCategories, activeCategory]);

    const totalPages = filteredCategories.reduce((sum, category) => sum + category.pages.length, 0);

    return (
        <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
            <aside className="hidden lg:block">
                <div className="sticky top-24 space-y-6">
                    <nav className="space-y-1">
                        <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Navigation</p>
                        <button
                            type="button"
                            onClick={() => setActiveCategory("all")}
                            className={`block w-full px-3 py-2 text-left text-sm transition border-l-2 ${activeCategory === "all"
                                ? "font-semibold text-white border-violet-500"
                                : "text-slate-400 hover:text-slate-200 border-transparent"
                                }`}
                        >
                            All pages ({totalPages})
                        </button>
                        {categories.map((category) => (
                            <div key={category.name} className="group flex items-center">
                                <button
                                    type="button"
                                    onClick={() => setActiveCategory(category.name)}
                                    className={`block flex-1 px-3 py-2 text-left text-sm transition border-l-2 ${activeCategory === category.name
                                        ? "font-semibold text-white border-violet-500"
                                        : "text-slate-400 hover:text-slate-200 border-transparent"
                                        }`}
                                >
                                    {category.name} ({category.pages.length})
                                </button>
                                {canCreate && (
                                    <button
                                        type="button"
                                        title={`Delete "${category.name}" category`}
                                        onClick={() => handleDeleteCategory(category.name)}
                                        className="mr-1 flex h-6 w-6 items-center justify-center rounded text-slate-600 opacity-0 group-hover:opacity-100 hover:bg-slate-800 hover:text-rose-400 transition-all text-xs"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                    </nav>

                    {canCreate && (
                        <div className="border-t border-slate-800 pt-4 space-y-3">
                            <form onSubmit={handleAddCategory} className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Add Category</p>
                                <div className="flex gap-1">
                                    <input
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        placeholder="Category name…"
                                        className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white outline-none focus:border-violet-500 transition placeholder-slate-500"
                                    />
                                    <button
                                        type="submit"
                                        disabled={addingCategory || !newCategoryName.trim()}
                                        className="px-2 py-1.5 text-xs font-medium bg-violet-500 text-white rounded hover:bg-violet-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {addingCategory ? "…" : "Add"}
                                    </button>
                                </div>
                            </form>
                            {categoryMsg && (
                                <p className="text-xs text-rose-400">{categoryMsg}</p>
                            )}
                        </div>
                    )}
                </div>
            </aside>

            <main className="space-y-10">
                {/* Home Page Content */}
                {homePage && (
                    <div
                        className="prose prose-invert max-w-none
                        prose-headings:text-white prose-headings:font-serif prose-headings:tracking-tight
                        prose-h1:text-4xl prose-h2:text-2xl prose-h2:mt-10 prose-h3:text-xl
                        prose-a:text-violet-400 prose-a:no-underline hover:prose-a:underline
                        prose-strong:text-white
                        prose-code:before:content-none prose-code:after:content-none
                        prose-pre:border prose-pre:border-slate-800 prose-pre:rounded-xl
                        prose-img:rounded-xl prose-img:shadow-lg
                        prose-hr:border-slate-800
                        prose-blockquote:border-violet-500 prose-blockquote:not-italic
                        prose-li:text-slate-200
                    "
                    >
                        <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                            {homePage.content}
                        </ReactMarkdown>
                        {homePage.updated_at && (
                            <p className="mt-6 text-sm text-slate-500">
                                Last updated: {new Date(homePage.updated_at).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                )}

                {/* Divider + Stats bar */}
                <div className="space-y-4 border-t border-slate-800 pt-8">
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                        <span>{totalPages} articles</span>
                        <span>·</span>
                        <span>{categories.length} categories</span>
                        {canCreate && (
                            <>
                                <span>·</span>
                                <Link href="/wiki/new" className="text-violet-400 hover:text-violet-300 transition">
                                    Write an article
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="border border-rose-600 bg-rose-950/20 px-4 py-3 rounded text-rose-200 text-sm">
                        Error loading wiki: {error}
                    </div>
                )}

                {loading && <div className="text-slate-400">Loading wiki index…</div>}

                {!loading && !error && (
                    <div className="space-y-8">
                        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
                            <input
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                className="w-full bg-transparent text-white outline-none placeholder-slate-500"
                                placeholder="Search articles…"
                            />
                        </div>

                        {visibleCategories.length === 0 ? (
                            <div className="text-slate-400 text-sm">No articles match that search.</div>
                        ) : (
                            visibleCategories.map((category) => (
                                <section key={category.name} className="space-y-4">
                                    <h2 className="text-2xl font-serif font-bold text-white border-b border-slate-800 pb-2">{category.name}</h2>
                                    <ul className="space-y-2">
                                        {category.pages.map((page) => (
                                            <li key={page.slug}>
                                                <Link
                                                    href={`/wiki/${page.slug}`}
                                                    className="text-violet-400 hover:text-violet-300 transition hover:underline"
                                                >
                                                    {page.title}
                                                </Link>
                                                <span className="text-xs text-slate-500 ml-2">
                                                    Updated {new Date(page.updated_at).toLocaleDateString()}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            ))
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
