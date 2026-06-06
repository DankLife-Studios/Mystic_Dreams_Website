"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import WikiEditor from "./WikiEditor";

export default function WikiClient() {
    const { status } = useSession();
    const [page, setPage] = useState(null);
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
                    throw new Error(body.error || "Unable to load wiki page");
                }
                setPage(await res.json());
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [status]);

    async function handleSave(savedPage) {
        setPage(savedPage);
    }

    return (
        <div className="space-y-8">
            <div className="space-y-3 rounded-3xl border border-slate-800 bg-slate-950 p-8 shadow-xl shadow-slate-950/20">
                <div className="max-w-3xl space-y-3">
                    <p className="eyebrow">Mystic Dreams Wiki</p>
                    <h1 className="text-4xl font-semibold tracking-tight text-white">City knowledge for everyone.</h1>
                    <p className="text-base text-slate-300">
                        View the public wiki below. Logged-in members with the editor role can update the page and keep it current.
                    </p>
                </div>
            </div>

            {loading && (
                <div className="rounded-3xl border border-slate-800 bg-slate-950 p-8 text-slate-300">Loading wiki...</div>
            )}

            {error && (
                <div className="rounded-3xl border border-rose-500 bg-rose-950/10 p-6 text-rose-200">
                    <p>Error loading wiki: {error}</p>
                </div>
            )}

            {page && (
                <div className="space-y-6">
                    <div className="rounded-3xl border border-slate-800 bg-slate-950 p-8">
                        <div className="prose prose-invert max-w-none whitespace-pre-wrap text-slate-100">
                            {page.content}
                        </div>
                        {page.updatedAt && (
                            <p className="mt-6 text-sm text-slate-400">
                                Last updated: {new Date(page.updatedAt).toLocaleString()}
                            </p>
                        )}
                    </div>

                    {page.canEdit ? (
                        <WikiEditor initialContent={page.content} onSaved={handleSave} />
                    ) : (
                        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 text-slate-300">
                            {status === "authenticated" ? (
                                <p>
                                    You are signed in, but you need the designated Discord editor role to update the wiki.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    <p>Sign in with Discord to request access and edit the wiki if you have the role.</p>
                                    <button
                                        type="button"
                                        onClick={() => signIn("discord", { callbackUrl: "/wiki" })}
                                        className="inline-flex items-center rounded-full border border-violet-500 text-violet-400 bg-transparent px-4 py-2 text-sm font-semibold transition hover:bg-violet-500/10"
                                    >
                                        Sign in with Discord
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
