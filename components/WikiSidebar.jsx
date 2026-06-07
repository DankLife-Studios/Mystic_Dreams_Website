"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";

/* ─── Recursive sidebar category ─── */
function SidebarCategory({ cat, depth, canCreate, onDelete, onMove, onDrop, expanded, onToggle, currentCategory, currentSlug }) {
    const indent = depth * 12;
    const [dragOver, setDragOver] = useState(false);
    const isExpanded = expanded === cat.name;
    const hasPages = cat.pages?.length > 0;
    const hasChildren = cat.children?.length > 0;
    const hasContent = hasPages || hasChildren;
    const isActiveCategory = currentCategory === cat.name;

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
        if (draggedName && draggedName !== cat.name && onDrop) {
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
                    <span className="ml-1 flex-shrink-0 cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-400 transition select-none text-xs leading-none opacity-0 group-hover:opacity-100" title="Drag to reorder">
                        ⋮⋮
                    </span>
                )}
                {hasContent ? (
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onToggle(cat.name); }}
                        className={`flex-shrink-0 w-4 h-4 flex items-center justify-center transition text-[10px] leading-none ml-0.5 ${isExpanded ? "text-violet-400" : "text-slate-500 hover:text-slate-300"}`}
                    >
                        {isExpanded ? "▼" : "▶"}
                    </button>
                ) : (
                    <span className="w-4 flex-shrink-0" />
                )}
                <button
                    type="button"
                    onClick={() => hasContent ? onToggle(cat.name) : undefined}
                    style={{ paddingLeft: 4 }}
                    className={`block flex-1 py-2 pr-3 text-left text-sm transition border-l-2 ${isActiveCategory
                        ? "font-semibold text-white border-violet-500"
                        : "text-slate-400 hover:text-slate-200 border-transparent"
                        }`}
                >
                    {cat.name}
                    {hasPages && <span className="ml-1 text-xs text-slate-500">({cat.pages.length})</span>}
                </button>
                {canCreate && (
                    <span className="hidden group-hover:inline-flex items-center gap-0.5 mr-1">
                        <button type="button" title="Move up" onClick={() => onMove(cat.name, "up")} className="flex h-5 w-5 items-center justify-center rounded text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition text-[10px] leading-none">▲</button>
                        <button type="button" title="Move down" onClick={() => onMove(cat.name, "down")} className="flex h-5 w-5 items-center justify-center rounded text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition text-[10px] leading-none">▼</button>
                        <button type="button" title={`Delete "${cat.name}" category`} onClick={() => onDelete(cat.name)} className="flex h-5 w-5 items-center justify-center rounded text-slate-500 hover:bg-slate-800 hover:text-rose-400 transition text-xs">×</button>
                    </span>
                )}
            </div>

            {isExpanded && hasPages && cat.pages.map((page) => (
                <Link
                    key={page.slug}
                    href={`/wiki/${page.slug}`}
                    style={{ paddingLeft: 36 + indent }}
                    className={`block py-1.5 pr-3 text-sm transition border-l-2 truncate rounded-r-md ${currentSlug === page.slug
                        ? "text-violet-300 font-medium border-violet-500 bg-slate-900/30"
                        : "text-slate-400 hover:text-violet-300 hover:bg-slate-900/30 border-transparent hover:border-violet-500/30"
                        }`}
                >
                    {page.title}
                </Link>
            ))}

            {isExpanded && cat.children?.map((child) => (
                <SidebarCategory
                    key={child.name}
                    cat={child}
                    depth={depth + 1}
                    canCreate={canCreate}
                    onDelete={onDelete}
                    onMove={onMove}
                    onDrop={onDrop}
                    expanded={expanded}
                    onToggle={onToggle}
                    currentCategory={currentCategory}
                    currentSlug={currentSlug}
                />
            ))}
        </>
    );
}

/* ─── Main WikiSidebar ─── */
export default function WikiSidebar({ currentCategory, currentSlug }) {
    const { status } = useSession();
    const pathname = usePathname();
    const isHome = pathname === "/wiki";
    const [categories, setCategories] = useState([]);
    const [canCreate, setCanCreate] = useState(false);
    const [expandedCategory, setExpandedCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Category management
    const [newCategoryName, setNewCategoryName] = useState("");
    const [newCategoryParent, setNewCategoryParent] = useState("");
    const [addingCategory, setAddingCategory] = useState(false);
    const [categoryMsg, setCategoryMsg] = useState(null);

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

    // Auto-expand the category of the current page
    useEffect(() => {
        if (currentCategory) {
            setExpandedCategory(currentCategory);
        }
    }, [currentCategory]);

    function toggleExpand(name) {
        setExpandedCategory((prev) => (prev === name ? null : name));
    }

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
        setCategoryMsg(null);
        try {
            const res = await fetch(`/api/wiki/categories?name=${encodeURIComponent(name)}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete");
            if (expandedCategory === name) setExpandedCategory(null);
            await reloadCategories();
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
        if (draggedInfo.list === targetInfo.list) {
            await swapCategories(draggedInfo.list, draggedInfo.index, targetInfo.index);
        }
    }

    function findParentAndSiblings(cats, target) {
        for (let i = 0; i < cats.length; i++) {
            if (cats[i].name === target) return { list: cats, index: i };
            if (cats[i].children?.length) {
                const result = findParentAndSiblings(cats[i].children, target);
                if (result) return result;
            }
        }
        return null;
    }

    async function swapCategories(list, fromIndex, toIndex) {
        const items = [...list];
        const [moved] = items.splice(fromIndex, 1);
        items.splice(toIndex, 0, moved);
        const orders = items.map((item, i) => ({ name: item.name, display_order: i }));
        try {
            const res = await fetch("/api/wiki/categories", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orders }),
            });
            if (!res.ok) throw new Error("Failed to reorder");
            setCategories((prev) => {
                function updateList(cats) {
                    const newCats = [...cats];
                    const idx = newCats.findIndex((c) => c.name === moved.name);
                    if (idx !== -1) {
                        const [item] = newCats.splice(idx, 1);
                        newCats.splice(toIndex, 0, { ...item, displayOrder: toIndex });
                        return newCats.map((c, i) => ({ ...c, displayOrder: i }));
                    }
                    return newCats.map((cat) => ({ ...cat, children: cat.children ? updateList(cat.children) : cat.children }));
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

    const topLevelCats = categories.filter((c) => !c.parentName);

    return (
        <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
                <nav className="space-y-0.5">
                    <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Navigation</p>
                    <Link
                        href="/wiki"
                        className={`block w-full px-3 py-2 text-left text-sm transition border-l-2 ${isHome
                            ? "font-semibold text-white border-violet-500"
                            : "text-slate-400 hover:text-slate-200 border-transparent"
                            }`}
                    >
                        Home
                    </Link>
                    {categories.map((cat) => (
                        <SidebarCategory
                            key={cat.name}
                            cat={cat}
                            depth={0}
                            canCreate={canCreate}
                            onDelete={handleDeleteCategory}
                            onMove={handleMoveCategory}
                            onDrop={handleDropCategory}
                            expanded={expandedCategory}
                            onToggle={toggleExpand}
                            currentCategory={currentCategory}
                            currentSlug={currentSlug}
                        />
                    ))}
                </nav>

                {/* Search */}
                <div className="bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2">
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-transparent text-xs text-white outline-none placeholder-slate-500"
                        placeholder="Search articles…"
                    />
                </div>

                {canCreate && (
                    <div className="border-t border-slate-800 pt-4 space-y-3">
                        <form onSubmit={handleAddCategory} className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Add Category</p>
                            <input
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="Category name…"
                                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white outline-none focus:border-violet-500 transition placeholder-slate-500"
                            />
                            <select
                                value={newCategoryParent}
                                onChange={(e) => setNewCategoryParent(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white outline-none focus:border-violet-500 transition"
                            >
                                <option value="">Top level (no parent)</option>
                                {topLevelCats.map((cat) => (
                                    <option key={cat.name} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                            <button
                                type="submit"
                                disabled={addingCategory || !newCategoryName.trim()}
                                className="w-full px-2 py-1.5 text-xs font-medium border border-violet-500 text-violet-400 bg-transparent rounded hover:bg-violet-500/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {addingCategory ? "Adding…" : "Add Category"}
                            </button>
                        </form>
                        {categoryMsg && <p className="text-xs text-rose-400">{categoryMsg}</p>}
                        <Link
                            href="/wiki/new"
                            className="block rounded-lg border border-violet-500 text-violet-400 bg-transparent px-3 py-2 text-center text-xs font-medium transition hover:bg-violet-500/10"
                        >
                            + Create new article
                        </Link>
                    </div>
                )}
            </div>
        </aside>
    );
}
