"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";

export default function WikiIndexClient() {
    const { status } = useSession();
    const [pages, setPages] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [canCreate, setCanCreate] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [status]);

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
                            <button
                                key={category.name}
                                type="button"
                                onClick={() => setActiveCategory(category.name)}
                                className={`block w-full px-3 py-2 text-left text-sm transition border-l-2 ${activeCategory === category.name
                                        ? "font-semibold text-white border-violet-500"
                                        : "text-slate-400 hover:text-slate-200 border-transparent"
                                    }`}
                            >
                                {category.name} ({category.pages.length})
                            </button>
                        ))}
                    </nav>

                    {canCreate && (
                        <div className="border-t border-slate-800 pt-4">
                            <Link
                                href="/wiki/new"
                                className="block rounded-lg bg-violet-500 px-3 py-2 text-center text-sm font-medium text-white transition hover:bg-violet-400"
                            >
                                Create page
                            </Link>
                        </div>
                    )}
                </div>
            </aside>

            <main className="space-y-8">
                <div className="space-y-4 border-b border-slate-800 pb-8">
                    <h1 className="text-5xl font-serif font-bold tracking-tight text-white">Mystic Dreams Wiki</h1>
                    <p className="text-lg text-slate-300">A community knowledge base for city guides, jobs, and server systems.</p>
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
