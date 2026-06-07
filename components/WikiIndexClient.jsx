"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

/* ─── Recursive sidebar category link ─── */
function SidebarCategory({ cat, activeCategory, onSelect, depth, canCreate, onDelete, onMove, onDrop, expanded, onToggle }) {
    const indent = depth * 12;
    const [dragOver, setDragOver] = useState(false);
    const isExpanded = expanded === cat.name;
    const hasPages = cat.pages?.length > 0;
    const hasChildren = cat.children?.length > 0;
    const hasContent = hasPages || hasChildren;
    const isActive = activeCategory === cat.name;

    function handleDragStart(e) {
        e.dataTransfer.setData("text/plain", cat.name);
        e.dataTransfer.effectAllowed = "move";
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setDragOver(true);
    }

    function handleDragLeave() {
        setDragOver(false);
    }

    function handleDrop(e) {
        e.preventDefault();
        setDragOver(false);
        const draggedName = e.dataTransfer.getData("text/plain");
        if (draggedName && draggedName !== cat.name) {
            onDrop(draggedName, cat.name);
        }
    }

    return (
        <>
            <div
                className={`group flex items-center transition-colors rounded-r-md ${dragOver ? "bg-violet-500/10" : ""} ${isExpanded ? "bg-slate-900/50" : ""}`}
                draggable={canCreate}
                onDragStart={canCreate ? handleDragStart : undefined}
                onDragOver={canCreate ? handleDragOver : undefined}
                onDragLeave={canCreate ? handleDragLeave : undefined}
                onDrop={canCreate ? handleDrop : undefined}
            >
                {canCreate && (
                    <span
                        className="ml-1 flex-shrink-0 cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-400 transition select-none text-xs leading-none opacity-0 group-hover:opacity-100"
                        title="Drag to reorder"
                    >
                        ⋮⋮
                    </span>
                )}
                {/* Expand chevron */}
                {hasContent && (
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onToggle(cat.name); }}
                        className={`flex-shrink-0 w-4 h-4 flex items-center justify-center transition text-[10px] leading-none ml-0.5 ${isExpanded ? "text-violet-400" : "text-slate-500 hover:text-slate-300"}`}
                    >
                        {isExpanded ? "▼" : "▶"}
                    </button>
                )}
                {!hasContent && <span className="w-4 flex-shrink-0" />}
                <button
                    type="button"
                    onClick={() => hasContent ? onToggle(cat.name) : onSelect(cat.name)}
                    style={{ paddingLeft: 4 }}
                    className={`block flex-1 py-2 pr-3 text-left text-sm transition border-l-2 ${isActive
                        ? "font-semibold text-white border-violet-500"
                        : "text-slate-400 hover:text-slate-200 border-transparent"
                        }`}
                >
                    {cat.name}
                    {hasPages && (
                        <span className="ml-1 text-xs text-slate-500">({cat.pages.length})</span>
                    )}
                </button>
                {canCreate && (
                    <span className="hidden group-hover:inline-flex items-center gap-0.5 mr-1">
                        <button
                            type="button"
                            title="Move up"
                            onClick={() => onMove(cat.name, "up")}
                            className="flex h-5 w-5 items-center justify-center rounded text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition text-[10px] leading-none"
                        >
                            ▲
                        </button>
                        <button
                            type="button"
                            title="Move down"
                            onClick={() => onMove(cat.name, "down")}
                            className="flex h-5 w-5 items-center justify-center rounded text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition text-[10px] leading-none"
                        >
                            ▼
                        </button>
                        <button
                            type="button"
                            title={`Delete "${cat.name}" category`}
                            onClick={() => onDelete(cat.name)}
                            className="flex h-5 w-5 items-center justify-center rounded text-slate-500 hover:bg-slate-800 hover:text-rose-400 transition text-xs"
                        >
                            ×
                        </button>
                    </span>
                )}
            </div>

            {/* Expanded: show page links */}
            {isExpanded && hasPages && cat.pages.map((page) => (
                <Link
                    key={page.slug}
                    href={`/wiki/${page.slug}`}
                    style={{ paddingLeft: 36 + indent }}
                    className="block py-1.5 pr-3 text-sm text-slate-400 hover:text-violet-300 hover:bg-slate-900/30 transition border-l-2 border-transparent hover:border-violet-500/30 truncate rounded-r-md"
                >
                    {page.title}
                </Link>
            ))}

            {/* Children — only visible when expanded */}
            {isExpanded && cat.children?.map((child) => (
                <SidebarCategory
                    key={child.name}
                    cat={child}
                    activeCategory={activeCategory}
                    onSelect={onSelect}
                    depth={depth + 1}
                    canCreate={canCreate}
                    onDelete={onDelete}
                    onMove={onMove}
                    onDrop={onDrop}
                    expanded={expanded}
                    onToggle={onToggle}
                />
            ))}
        </>
    );
}

/* ─── Recursive main-area category section ─── */
function CategorySection({ cat, searchQuery, depth }) {
    const headingTag = depth === 0 ? "h2" : "h3";
    const headingClass =
        depth === 0
            ? "text-2xl font-serif font-bold text-white border-b border-slate-800 pb-2"
            : "text-lg font-serif font-semibold text-white border-b border-slate-700/50 pb-1.5";
    const marginLeft = depth * 16;

    const query = searchQuery.trim().toLowerCase();
    const filteredPages = query
        ? cat.pages.filter(
            (p) =>
                p.title.toLowerCase().includes(query) ||
                p.slug.toLowerCase().includes(query)
        )
        : cat.pages;

    const hasContent = filteredPages.length > 0 || (cat.children && cat.children.length > 0);
    if (!hasContent) return null;

    return (
        <section className="space-y-3" style={{ marginLeft }}>
            {headingTag === "h2" ? (
                <h2 className={headingClass}>{cat.name}</h2>
            ) : (
                <h3 className={headingClass}>{cat.name}</h3>
            )}
            {filteredPages.length > 0 && (
                <ul className="space-y-1.5">
                    {filteredPages.map((page) => (
                        <li key={page.slug}>
                            <Link
                                href={`/wiki/${page.slug}`}
                                className="text-violet-400 hover:text-violet-300 transition hover:underline text-sm"
                            >
                                {page.title}
                            </Link>
                            <span className="text-xs text-slate-500 ml-2">
                                Updated {new Date(page.updated_at).toLocaleDateString()}
                            </span>
                            {page.is_homepage ? (
                                <span className="ml-1.5 text-[10px] px-1.5 py-0.5 bg-violet-500/20 text-violet-300 rounded-full">
                                    Home
                                </span>
                            ) : null}
                        </li>
                    ))}
                </ul>
            )}
            {cat.children?.map((child) => (
                <CategorySection
                    key={child.name}
                    cat={child}
                    searchQuery={searchQuery}
                    depth={depth + 1}
                />
            ))}
        </section>
    );
}

/* ─── Main component ─── */
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

    // Category management
    const [newCategoryName, setNewCategoryName] = useState("");
    const [newCategoryParent, setNewCategoryParent] = useState("");
    const [addingCategory, setAddingCategory] = useState(false);
    const [categoryMsg, setCategoryMsg] = useState(null);
    const [expandedCategory, setExpandedCategory] = useState(null);

    function toggleExpand(name) {
        setExpandedCategory((prev) => (prev === name ? null : name));
    }

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
                body: JSON.stringify({
                    name,
                    description: "",
                    parentName: newCategoryParent || null,
                }),
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.error || "Failed to add category");
            }
            setNewCategoryName("");
            setNewCategoryParent("");
            const idxRes = await fetch("/api/wiki");
            if (idxRes.ok) {
                const data = await idxRes.json();
                setCategories(data.categories || []);
            }
        } catch (err) {
            setCategoryMsg(err.message);
        } finally {
            setAddingCategory(false);
        }
    }

    async function handleDeleteCategory(name) {
        if (!confirm(`Delete the "${name}" category? Its sub-categories will become top-level.`)) return;
        setCategoryMsg(null);
        try {
            const res = await fetch(
                `/api/wiki/categories?name=${encodeURIComponent(name)}`,
                { method: "DELETE" }
            );
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.error || "Failed to delete category");
            }
            if (activeCategory === name) setActiveCategory("all");
            const idxRes = await fetch("/api/wiki");
            if (idxRes.ok) {
                const data = await idxRes.json();
                setCategories(data.categories || []);
            }
        } catch (err) {
            setCategoryMsg(err.message);
        }
    }

    async function handleMoveCategory(name, direction) {
        const info = findParentAndSiblings(categories, name);
        if (!info) return;

        const { list, index } = info;
        const newIndex = index + (direction === "up" ? -1 : 1);
        if (newIndex < 0 || newIndex >= list.length) return;

        await swapCategories(list, index, newIndex);
    }

    async function handleDropCategory(draggedName, targetName) {
        if (draggedName === targetName) return;

        const draggedInfo = findParentAndSiblings(categories, draggedName);
        const targetInfo = findParentAndSiblings(categories, targetName);
        if (!draggedInfo || !targetInfo) return;

        // If they're in the same sibling list, move within that list
        if (draggedInfo.list === targetInfo.list) {
            await swapCategories(draggedInfo.list, draggedInfo.index, targetInfo.index);
        }
    }

    function findParentAndSiblings(cats, target) {
        for (let i = 0; i < cats.length; i++) {
            if (cats[i].name === target) {
                return { list: cats, index: i };
            }
            if (cats[i].children?.length) {
                const result = findParentAndSiblings(cats[i].children, target);
                if (result) return result;
            }
        }
        return null;
    }

    async function swapCategories(list, fromIndex, toIndex) {
        // Rebuild display_order for the sibling list after the swap
        const items = [...list];
        const [moved] = items.splice(fromIndex, 1);
        items.splice(toIndex, 0, moved);

        const orders = items.map((item, i) => ({
            name: item.name,
            display_order: i,
        }));

        try {
            const res = await fetch("/api/wiki/categories", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orders }),
            });
            if (!res.ok) throw new Error("Failed to reorder");

            // Optimistically update local state
            setCategories((prev) => {
                function updateList(cats) {
                    const newCats = [...cats];
                    const idx = newCats.findIndex((c) => c.name === moved.name);
                    if (idx !== -1) {
                        const [item] = newCats.splice(idx, 1);
                        newCats.splice(toIndex, 0, { ...item, displayOrder: toIndex });
                        return newCats.map((c, i) => ({ ...c, displayOrder: i }));
                    }
                    return newCats.map((cat) => ({
                        ...cat,
                        children: cat.children ? updateList(cat.children) : cat.children,
                    }));
                }
                return updateList(prev);
            });
        } catch (err) {
            setCategoryMsg(err.message);
        }
    }

    function flattenCats(cats) {
        let result = [];
        for (const c of cats) {
            result.push(c);
            if (c.children) result = result.concat(flattenCats(c.children));
        }
        return result;
    }

    const allFlatCats = useMemo(() => flattenCats(categories), [categories]);
    const totalPages = useMemo(
        () => allFlatCats.reduce((sum, c) => sum + (c.pages?.length || 0), 0),
        [allFlatCats]
    );

    const topLevelCats = useMemo(
        () => categories.filter((c) => !c.parentName),
        [categories]
    );

    return (
        <main className="space-y-10 min-w-0">
            {/* Home Page */}
            {homePage && (
                <div className="prose prose-invert max-w-none
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
                    ">
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

            {/* Divider + Stats */}
            <div className="space-y-4 border-t border-slate-800 pt-8">
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                    <span>{totalPages} articles</span>
                    <span>·</span>
                    <span>{allFlatCats.length} categories</span>
                    {homePage && (
                        <>
                            <span>·</span>
                            <Link
                                href={`/wiki/${homePage.slug}/edit`}
                                className="text-violet-400 hover:text-violet-300 transition"
                            >
                                Edit homepage
                            </Link>
                        </>
                    )}
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
                    {allFlatCats.length === 0 && !searchQuery && (
                        <div className="text-slate-400 text-sm">
                            No categories yet. Editors can add categories using the sidebar.
                        </div>
                    )}

                    {categories.map((cat) => (
                        <CategorySection
                            key={cat.name}
                            cat={cat}
                            searchQuery={searchQuery}
                            depth={0}
                        />
                    ))}

                    {allFlatCats.length > 0 &&
                        categories.every((cat) => {
                            const q = searchQuery.trim().toLowerCase();
                            const hasPages = cat.pages.some(
                                (p) =>
                                    !q ||
                                    p.title.toLowerCase().includes(q) ||
                                    p.slug.toLowerCase().includes(q)
                            );
                            const hasKids = cat.children && cat.children.length > 0;
                            return !hasPages && !hasKids;
                        }) &&
                        searchQuery && (
                            <div className="text-slate-400 text-sm">
                                No articles match that search.
                            </div>
                        )}
                </div>
            )}
        </main>
    );
}
