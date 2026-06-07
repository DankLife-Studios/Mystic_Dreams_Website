"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";

/* ─── WikiNavbar ─── */
export default function WikiNavbar() {
    const { status } = useSession();
    const pathname = usePathname();
    const isHome = pathname === "/wiki";
    const [categories, setCategories] = useState([]);
    const [canCreate, setCanCreate] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchOpen, setSearchOpen] = useState(false);
    const [editorOpen, setEditorOpen] = useState(false);
    const navbarRef = useRef(null);
    const searchRef = useRef(null);

    // Derive current slug and category from URL
    const pathParts = pathname.split("/").filter(Boolean);
    const currentSlug = pathParts[1] === "wiki" && pathParts.length > 2 ? pathParts[2] : null;

    // Find current category from loaded categories
    let currentCategory = null;
    for (const cat of categories) {
        if (cat.pages?.some((p) => p.slug === currentSlug)) { currentCategory = cat.name; break; }
        for (const child of (cat.children || [])) {
            if (child.pages?.some((p) => p.slug === currentSlug)) { currentCategory = child.name; break; }
        }
        if (currentCategory) break;
    }

    // Category management
    const [newCategoryName, setNewCategoryName] = useState("");
    const [newCategoryParent, setNewCategoryParent] = useState("");
    const [addingCategory, setAddingCategory] = useState(false);
    const [categoryMsg, setCategoryMsg] = useState(null);
    const [editingCategory, setEditingCategory] = useState(null);
    const [editCategoryParent, setEditCategoryParent] = useState("");
    const [editingCategoryMsg, setEditingCategoryMsg] = useState(null);

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch("/api/wiki");
                if (res.ok) {
                    const data = await res.json();
                    setCategories(data.categories || []);
                    setCanCreate(!!data.canCreate);
                }
            } catch { /* silent */ }
        }
        load();
    }, [status]);

    // Close dropdowns on outside click
    useEffect(() => {
        function handleClick(e) {
            if (navbarRef.current && !navbarRef.current.contains(e.target)) {
                setOpenDropdown(null);
                setSearchOpen(false);
                setEditorOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    // Focus search on open
    useEffect(() => {
        if (searchOpen && searchRef.current) searchRef.current.focus();
    }, [searchOpen]);

    async function reloadCategories() {
        const res = await fetch("/api/wiki");
        if (res.ok) {
            const data = await res.json();
            setCategories(data.categories || []);
        }
    }

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
                body: JSON.stringify({ name, description: "", parentName: newCategoryParent || null }),
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.error || "Failed to add category");
            }
            setNewCategoryName("");
            setNewCategoryParent("");
            await reloadCategories();
        } catch (err) {
            setCategoryMsg(err.message);
        } finally {
            setAddingCategory(false);
        }
    }

    async function handleDeleteCategory(name) {
        if (!confirm(`Delete the "${name}" category?`)) return;
        try {
            await fetch(`/api/wiki/categories?name=${encodeURIComponent(name)}`, { method: "DELETE" });
            await reloadCategories();
        } catch { /* silent */ }
    }

    function openEditCategory(cat) {
        setEditingCategory(cat.name);
        setEditCategoryParent(cat.parentName || "");
        setEditingCategoryMsg(null);
    }

    async function handleEditCategory(event) {
        event.preventDefault();
        if (!editingCategory) return;
        setEditingCategoryMsg(null);
        try {
            const res = await fetch("/api/wiki/categories", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: editingCategory,
                    parentName: editCategoryParent || null,
                }),
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.error || "Failed to update category");
            }
            setEditingCategory(null);
            await reloadCategories();
        } catch (err) {
            setEditingCategoryMsg(err.message);
        }
    }

    // Build a flat list for search filtering
    const allPages = categories.flatMap((cat) => {
        const pages = (cat.pages || []).map((p) => ({ ...p, categoryName: cat.name }));
        const childPages = (cat.children || []).flatMap((child) =>
            (child.pages || []).map((p) => ({ ...p, categoryName: child.name }))
        );
        return [...pages, ...childPages];
    });

    const filteredPages = searchQuery.trim()
        ? allPages.filter(
            (p) =>
                p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.slug.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 8)
        : [];

    const topLevelCats = categories.filter((c) => !c.parentName);

    return (
        <nav
            ref={navbarRef}
            className="relative flex items-center gap-1 px-4 py-2 mb-8 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] shadow-2xl shadow-purple-500/10 overflow-visible"
        >
            {/* Home */}
            <Link
                href="/wiki"
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${isHome
                    ? "bg-purple-500/15 text-[var(--accent)]"
                    : "text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]"
                    }`}
            >
                <i className="fa-regular fa-house text-sm" />
                Home
                {isHome && (
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-400 shadow-sm shadow-purple-400/50" />
                )}
            </Link>

            {/* Divider */}
            <span className="w-px h-6 bg-[var(--border)] mx-1" />

            {/* Category dropdowns */}
            {categories.map((cat) => {
                const isOpen = openDropdown === cat.name;
                const hasContent = (cat.pages?.length || 0) > 0 || (cat.children?.length || 0) > 0;
                const isActive = currentCategory === cat.name;

                return (
                    <div key={cat.name} className="relative">
                        <button
                            type="button"
                            onClick={() => setOpenDropdown(isOpen ? null : cat.name)}
                            className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${isActive || isOpen
                                ? "bg-purple-500/15 text-[var(--accent)]"
                                : "text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]"
                                }`}
                        >
                            <i className="fa-regular fa-folder text-sm" />
                            {cat.name}
                            <i className={`fa-regular fa-chevron-${isOpen ? "up" : "down"} text-[10px] transition-transform`} />
                            {isActive && (
                                <span className="h-1.5 w-1.5 rounded-full bg-purple-400 shadow-sm shadow-purple-400/50" />
                            )}
                        </button>

                        {isOpen && (
                            <div className="absolute top-full left-0 mt-1 w-56 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] shadow-2xl shadow-purple-500/10 py-1.5 z-50">
                                {/* Parent category pages */}
                                {cat.pages?.length > 0 && cat.pages.map((page) => (
                                    <Link
                                        key={page.slug}
                                        href={`/wiki/${page.slug}`}
                                        onClick={() => setOpenDropdown(null)}
                                        className={`flex items-center gap-2 px-3 py-2 text-sm transition-all duration-150 ${currentSlug === page.slug
                                            ? "bg-purple-500/15 text-[var(--accent)]"
                                            : "text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]"
                                            }`}
                                    >
                                        <i className="fa-regular fa-file-lines text-xs" />
                                        {page.title}
                                        {currentSlug === page.slug && (
                                            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-purple-400" />
                                        )}
                                    </Link>
                                ))}

                                {/* Sub-categories */}
                                {cat.children?.map((child) => (
                                    <div key={child.name}>
                                        <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] flex items-center gap-1.5">
                                            <span className="h-1 w-1 rounded-full bg-purple-500/50" />
                                            {child.name}
                                        </p>
                                        {child.pages?.map((page) => (
                                            <Link
                                                key={page.slug}
                                                href={`/wiki/${page.slug}`}
                                                onClick={() => setOpenDropdown(null)}
                                                className={`flex items-center gap-2 pl-6 pr-3 py-2 text-sm transition-all duration-150 ${currentSlug === page.slug
                                                    ? "bg-purple-500/15 text-[var(--accent)]"
                                                    : "text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]"
                                                    }`}
                                            >
                                                <i className="fa-regular fa-file-lines text-xs" />
                                                {page.title}
                                            </Link>
                                        ))}
                                    </div>
                                ))}

                                {/* Empty state */}
                                {!hasContent && (
                                    <p className="px-3 py-2 text-xs text-[var(--text-muted)] italic">
                                        No pages in this category yet.
                                    </p>
                                )}

                                {/* Editor tools */}
                                {canCreate && (
                                    <div className="border-t border-[var(--border)] mt-1 pt-1">
                                        {/* Edit mode */}
                                        {editingCategory === cat.name ? (
                                            <form onSubmit={handleEditCategory} className="px-3 py-2 space-y-2">
                                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                                                    Edit {cat.name}
                                                </p>
                                                <select
                                                    value={editCategoryParent}
                                                    onChange={(e) => setEditCategoryParent(e.target.value)}
                                                    className="w-full bg-[var(--surface-muted)] border border-[var(--border)] rounded-lg px-2 py-1.5 text-xs text-[var(--text-primary)] outline-none focus:border-purple-500/50 transition"
                                                >
                                                    <option value="">Top level (no parent)</option>
                                                    {categories
                                                        .filter((c) => !c.parentName && c.name !== cat.name)
                                                        .map((c) => (
                                                            <option key={c.name} value={c.name}>{c.name}</option>
                                                        ))}
                                                </select>
                                                <div className="flex gap-1">
                                                    <button
                                                        type="submit"
                                                        className="flex-1 px-2 py-1 text-xs font-medium border border-purple-500 text-purple-400 rounded hover:bg-purple-500/10 transition"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditingCategory(null)}
                                                        className="flex-1 px-2 py-1 text-xs text-[var(--text-muted)] border border-[var(--border)] rounded hover:bg-[var(--surface-muted)] transition"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                                {editingCategoryMsg && (
                                                    <p className="text-xs text-rose-400">{editingCategoryMsg}</p>
                                                )}
                                            </form>
                                        ) : (
                                            <div className="space-y-0.5">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditCategory(cat)}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)] transition-colors"
                                                >
                                                    <i className="fa-regular fa-pen-to-square text-[10px]" />
                                                    Edit category
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => { handleDeleteCategory(cat.name); setOpenDropdown(null); }}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                                                >
                                                    <i className="fa-regular fa-trash text-[10px]" />
                                                    Delete category
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Search button */}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => { setSearchOpen(!searchOpen); setEditorOpen(false); }}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${searchOpen
                        ? "bg-purple-500/15 text-[var(--accent)]"
                        : "text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]"
                        }`}
                >
                    <i className="fa-regular fa-magnifying-glass text-sm" />
                    Search
                </button>

                {searchOpen && (
                    <div className="absolute top-full right-0 mt-1 w-72 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] shadow-2xl shadow-purple-500/10 p-3 z-50">
                        <input
                            ref={searchRef}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search articles…"
                            className="w-full bg-[var(--surface-muted)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-purple-500/50 transition placeholder-[var(--text-muted)]"
                        />
                        {filteredPages.length > 0 && (
                            <div className="mt-2 space-y-0.5 max-h-64 overflow-y-auto">
                                {filteredPages.map((page) => (
                                    <Link
                                        key={page.slug}
                                        href={`/wiki/${page.slug}`}
                                        onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)] transition-colors"
                                    >
                                        <i className="fa-regular fa-file-lines text-xs" />
                                        <span className="truncate">{page.title}</span>
                                        <span className="ml-auto text-[10px] text-[var(--text-muted)] shrink-0">
                                            {page.categoryName}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        )}
                        {searchQuery && filteredPages.length === 0 && (
                            <p className="mt-2 text-xs text-[var(--text-muted)] px-1">No articles found.</p>
                        )}
                    </div>
                )}
            </div>

            {/* Editor tools */}
            {canCreate && (
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => { setEditorOpen(!editorOpen); setSearchOpen(false); }}
                        className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${editorOpen
                            ? "bg-purple-500/15 text-[var(--accent)]"
                            : "text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]"
                            }`}
                    >
                        <i className="fa-regular fa-pen-to-square text-sm" />
                        Editor
                    </button>

                    {editorOpen && (
                        <div className="absolute top-full right-0 mt-1 w-56 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] shadow-2xl shadow-purple-500/10 py-1.5 z-50">
                            <Link
                                href="/wiki/new"
                                onClick={() => setEditorOpen(false)}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)] transition-colors"
                            >
                                <i className="fa-regular fa-file-plus text-xs" />
                                Create new article
                            </Link>

                            <div className="border-t border-[var(--border)] my-1" />

                            <form onSubmit={handleAddCategory} className="px-3 py-2 space-y-2">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                                    Add Category
                                </p>
                                <input
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    placeholder="Category name…"
                                    className="w-full bg-[var(--surface-muted)] border border-[var(--border)] rounded-lg px-2 py-1.5 text-xs text-[var(--text-primary)] outline-none focus:border-purple-500/50 transition placeholder-[var(--text-muted)]"
                                />
                                <select
                                    value={newCategoryParent}
                                    onChange={(e) => setNewCategoryParent(e.target.value)}
                                    className="w-full bg-[var(--surface-muted)] border border-[var(--border)] rounded-lg px-2 py-1.5 text-xs text-[var(--text-primary)] outline-none focus:border-purple-500/50 transition"
                                >
                                    <option value="">Top level</option>
                                    {topLevelCats.map((cat) => (
                                        <option key={cat.name} value={cat.name}>{cat.name}</option>
                                    ))}
                                </select>
                                <button
                                    type="submit"
                                    disabled={addingCategory || !newCategoryName.trim()}
                                    className="w-full px-2 py-1.5 text-xs font-medium border border-purple-500 text-purple-400 bg-transparent rounded-lg hover:bg-purple-500/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {addingCategory ? "Adding…" : "Add Category"}
                                </button>
                            </form>
                            {categoryMsg && (
                                <p className="px-3 pt-1 text-xs text-rose-400">{categoryMsg}</p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
}
