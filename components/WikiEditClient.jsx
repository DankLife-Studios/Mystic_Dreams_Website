"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import WikiMarkdownEditor from "./WikiMarkdownEditor";

export default function WikiEditClient({ slug }) {
    const router = useRouter();
    const { status } = useSession();
    const [page, setPage] = useState(null);
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        async function load() {
            setLoading(true);
            setError(null);

            try {
                const [pageRes, indexRes] = await Promise.all([
                    fetch(`/api/wiki/${slug}`),
                    fetch("/api/wiki"),
                ]);

                if (!pageRes.ok) {
                    const body = await pageRes.json().catch(() => ({}));
                    throw new Error(body.error || "Failed to load page");
                }

                const data = await pageRes.json();
                if (data.page) {
                    setPage(data.page);
                    setTitle(data.page.title);
                    setCategory(data.page.category || "General");
                    setContent(data.page.content);
                } else {
                    throw new Error("Page not found");
                }

                if (indexRes.ok) {
                    const indexData = await indexRes.json();
                    setCategories(indexData.categories || []);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [slug]);

    async function handleSave(event) {
        event.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const res = await fetch(`/api/wiki/${slug}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, category, content }),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.error || "Failed to save page");
            }

            const updated = await res.json();
            setMessage("Saved successfully.");
            router.push(`/wiki/${updated.slug}`);
        } catch (err) {
            setMessage(err.message);
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete() {
        setDeleting(true);
        setMessage(null);

        try {
            const res = await fetch(`/api/wiki/${slug}`, { method: "DELETE" });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.error || "Failed to delete page");
            }

            router.push("/wiki");
            router.refresh();
        } catch (err) {
            setMessage(err.message);
            setShowDeleteConfirm(false);
        } finally {
            setDeleting(false);
        }
    }

    if (loading) {
        return <div className="text-slate-400">Loading page…</div>;
    }

    if (error) {
        return (
            <div className="border border-rose-600 bg-rose-950/20 px-4 py-3 rounded text-rose-200 text-sm">
                <p>{error}</p>
                {status !== "authenticated" && (
                    <button
                        type="button"
                        onClick={() => signIn("discord", { callbackUrl: `/wiki/${slug}/edit` })}
                        className="mt-3 px-4 py-2 text-sm font-medium bg-violet-500 text-white rounded hover:bg-violet-400 transition"
                    >
                        Sign in with Discord
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="space-y-4 border-b border-slate-800 pb-8">
                <h1 className="text-5xl font-serif font-bold tracking-tight text-white">Edit {page.title}</h1>
                <p className="text-slate-400 text-sm">
                    Slug: <code className="bg-slate-900 px-2 py-1 rounded text-slate-300">{page.slug}</code>
                </p>
                <Link href={`/wiki/${page.slug}`} className="text-violet-400 hover:text-violet-300 transition text-sm">
                    ← Back to article
                </Link>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-white mb-2">Title</label>
                    <input
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        required
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-white outline-none focus:border-violet-500 transition"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-white mb-2">Category</label>
                    <input
                        value={category}
                        onChange={(event) => setCategory(event.target.value)}
                        list="wiki-categories-edit"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-white outline-none focus:border-violet-500 transition"
                    />
                    <datalist id="wiki-categories-edit">
                        {categories.map((cat) => (
                            <option key={cat.name} value={cat.name} />
                        ))}
                    </datalist>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-white mb-2">Content</label>
                    <WikiMarkdownEditor value={content} onChange={setContent} />
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        {message && <p className="text-sm text-slate-300">{message}</p>}
                        <button
                            type="submit"
                            disabled={saving}
                            className="ml-auto px-5 py-2.5 text-sm font-medium text-white bg-violet-500 rounded-lg hover:bg-violet-400 transition disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {saving ? "Saving..." : "Save changes"}
                        </button>
                    </div>

                    <div className="border-t border-slate-800 pt-4">
                        {!showDeleteConfirm ? (
                            <button
                                type="button"
                                onClick={() => setShowDeleteConfirm(true)}
                                className="px-4 py-2 text-sm font-medium text-rose-400 border border-rose-700 rounded-lg hover:bg-rose-950/30 transition"
                            >
                                Delete this page
                            </button>
                        ) : (
                            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-rose-700 bg-rose-950/20 px-4 py-3">
                                <p className="text-sm text-rose-200">Permanently delete &quot;{page.title}&quot;? This cannot be undone.</p>
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="px-3 py-1.5 text-sm font-medium text-white bg-rose-600 rounded-lg hover:bg-rose-500 transition disabled:opacity-60"
                                >
                                    {deleting ? "Deleting..." : "Confirm delete"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="px-3 py-1.5 text-sm font-medium text-slate-300 border border-slate-600 rounded-lg hover:bg-slate-800 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}
