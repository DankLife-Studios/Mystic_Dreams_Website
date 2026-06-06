"use client";

import { useEffect, useState } from "react";

export default function WikiEditor({ initialContent, onSaved }) {
    const [content, setContent] = useState(initialContent || "");
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        setContent(initialContent || "");
    }, [initialContent]);

    async function handleSave() {
        setSaving(true);
        setMessage(null);

        try {
            const res = await fetch("/api/wiki", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ content }),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.error || "Failed to save wiki");
            }

            const updated = await res.json();
            setMessage("Wiki saved successfully.");
            onSaved(updated);
        } catch (err) {
            setMessage(err.message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950 p-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-semibold text-white">Edit wiki</h2>
                    <p className="mt-2 text-sm text-slate-400">
                        Only approved editors with the Discord role may save changes.
                    </p>
                </div>
            </div>

            <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                className="min-h-[360px] w-full rounded-3xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-100 outline-none ring-1 ring-slate-900 transition focus:ring-violet-500"
                rows={16}
            />

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="text-sm text-slate-400">Use plain text for now; line breaks are preserved.</div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="inline-flex items-center rounded-full border border-violet-500 text-violet-400 bg-transparent px-4 py-2 text-sm font-semibold transition hover:bg-violet-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {saving ? "Saving…" : "Save wiki"}
                    </button>
                </div>
            </div>

            {message && <p className="text-sm text-slate-300">{message}</p>}
        </div>
    );
}
