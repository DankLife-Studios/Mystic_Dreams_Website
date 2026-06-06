"use client";

import { useState, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

const TOOLBAR_GROUPS = [
    {
        id: "headings",
        tools: [
            { label: "H1", title: "Heading 1", prefix: "# ", suffix: "", block: true },
            { label: "H2", title: "Heading 2", prefix: "## ", suffix: "", block: true },
            { label: "H3", title: "Heading 3", prefix: "### ", suffix: "", block: true },
        ],
    },
    {
        id: "inline",
        tools: [
            { label: "B", title: "Bold", prefix: "**", suffix: "**", wrap: "text" },
            { label: "I", title: "Italic", prefix: "_", suffix: "_", wrap: "text" },
            { label: "S", title: "Strikethrough", prefix: "~~", suffix: "~~", wrap: "text" },
            { label: "`", title: "Inline code", prefix: "`", suffix: "`", wrap: "text" },
        ],
    },
    {
        id: "block",
        tools: [
            { label: "•", title: "Unordered list", prefix: "- ", suffix: "", block: true },
            { label: "1.", title: "Ordered list", prefix: "1. ", suffix: "", block: true },
            { label: "❝", title: "Blockquote", prefix: "> ", suffix: "", block: true },
            { label: "—", title: "Horizontal rule", prefix: "\n---\n", suffix: "", block: true },
        ],
    },
    {
        id: "insert",
        tools: [
            { label: "🔗", title: "Link", prefix: "[", suffix: "](url)", wrap: "text" },
            { label: "🖼", title: "Image", prefix: "![", suffix: "](url)", wrap: "text" },
            { label: "```", title: "Code block", prefix: "```\n", suffix: "\n```", block: true },
        ],
    },
];

export default function WikiMarkdownEditor({
    value,
    onChange,
    placeholder = "Write markdown…",
    minRows = 16,
}) {
    const [viewMode, setViewMode] = useState("split"); // edit | split | preview
    const textareaRef = useRef(null);

    const insertFormatting = useCallback(
        ({ prefix, suffix, block, wrap }) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const selected = value.substring(start, end);

            let newText;
            let newCursor;

            if (block) {
                // Block-level: insert at start of current line
                const before = value.substring(0, start);
                const lastNewline = before.lastIndexOf("\n");
                const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
                const linePrefix = value.substring(lineStart, start);

                if (linePrefix === prefix.trimStart()) {
                    // Already has prefix, remove it
                    newText =
                        value.substring(0, lineStart) +
                        value.substring(lineStart + prefix.length);
                    newCursor = start - prefix.length;
                } else {
                    newText =
                        value.substring(0, lineStart) +
                        prefix +
                        value.substring(lineStart);
                    newCursor = start + prefix.length;
                }
            } else if (wrap === "text" && selected) {
                newText =
                    value.substring(0, start) +
                    prefix +
                    selected +
                    suffix +
                    value.substring(end);
                newCursor = start + prefix.length + selected.length + suffix.length;
            } else if (wrap === "text") {
                const placeholder = "text";
                newText =
                    value.substring(0, start) +
                    prefix +
                    placeholder +
                    suffix +
                    value.substring(end);
                newCursor = start + prefix.length + placeholder.length + suffix.length;
            } else {
                newText = value.substring(0, start) + prefix + value.substring(end);
                newCursor = start + prefix.length;
            }

            onChange(newText);

            // Restore focus and cursor after React re-render
            requestAnimationFrame(() => {
                textarea.focus();
                textarea.setSelectionRange(newCursor, newCursor);
            });
        },
        [value, onChange]
    );

    // Tab key inserts spaces in the textarea
    const handleKeyDown = useCallback(
        (event) => {
            if (event.key === "Tab") {
                event.preventDefault();
                const textarea = textareaRef.current;
                if (!textarea) return;
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const newText =
                    value.substring(0, start) + "    " + value.substring(end);
                onChange(newText);
                requestAnimationFrame(() => {
                    textarea.focus();
                    textarea.setSelectionRange(start + 4, start + 4);
                });
            }
        },
        [value, onChange]
    );

    const modes = [
        { key: "edit", label: "Edit" },
        { key: "split", label: "Split" },
        { key: "preview", label: "Preview" },
    ];

    return (
        <div className="space-y-3">
            {/* Toolbar + Mode Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1">
                    {TOOLBAR_GROUPS.map((group) => (
                        <div key={group.id} className="flex items-center gap-0.5">
                            {group.tools.map((tool) => (
                                <button
                                    key={tool.label}
                                    type="button"
                                    title={tool.title}
                                    onClick={() => insertFormatting(tool)}
                                    className="inline-flex h-8 w-8 items-center justify-center rounded text-sm font-medium
                    text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                                >
                                    {tool.label}
                                </button>
                            ))}
                            <span className="mx-1 h-5 w-px bg-slate-700 last:hidden" />
                        </div>
                    ))}
                </div>

                {/* View mode toggle */}
                <div className="flex items-center rounded-lg border border-slate-700 bg-slate-900 p-0.5">
                    {modes.map((mode) => (
                        <button
                            key={mode.key}
                            type="button"
                            onClick={() => setViewMode(mode.key)}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${viewMode === mode.key
                                ? "bg-violet-500 text-white"
                                : "text-slate-400 hover:text-slate-200"
                                }`}
                        >
                            {mode.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Editor + Preview */}
            <div
                className={`grid gap-0 ${viewMode === "split" ? "grid-cols-2" : "grid-cols-1"
                    }`}
            >
                {/* Textarea */}
                {(viewMode === "edit" || viewMode === "split") && (
                    <div className="min-h-0">
                        <textarea
                            ref={textareaRef}
                            value={value}
                            onChange={(event) => onChange(event.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder}
                            rows={minRows}
                            className="w-full h-full min-h-[400px] bg-slate-950 border border-slate-800 rounded-lg p-4
                text-sm text-slate-100 font-mono leading-relaxed outline-none
                focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-colors
                resize-y placeholder-slate-600"
                            style={{ tabSize: 2 }}
                        />
                    </div>
                )}

                {/* Preview */}
                {(viewMode === "preview" || viewMode === "split") && (
                    <div
                        className={`min-h-[400px] overflow-y-auto rounded-lg border border-slate-800 bg-slate-950/60 p-6
              ${viewMode === "split" ? "border-l-0 rounded-l-none" : ""}`}
                    >
                        {value.trim() ? (
                            <div className="prose prose-invert max-w-none
                                prose-headings:text-white prose-headings:font-serif prose-headings:tracking-tight
                                prose-h1:text-3xl prose-h2:text-xl prose-h3:text-lg
                                prose-a:text-violet-400 prose-a:no-underline hover:prose-a:underline
                                prose-strong:text-white
                                prose-code:before:content-none prose-code:after:content-none
                                prose-pre:border prose-pre:border-slate-700 prose-pre:rounded-lg
                                prose-img:rounded-lg
                                prose-hr:border-slate-700
                                prose-blockquote:border-violet-500 prose-blockquote:not-italic
                                prose-li:text-slate-200
                            ">
                                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                                    {value}
                                </ReactMarkdown>
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500 italic">
                                Preview will appear here as you type…
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Markdown hint */}
            <p className="text-xs text-slate-500">
                Markdown is supported. Use the toolbar buttons above or type directly.{" "}
                <span className="text-slate-600">
                    **bold** _italic_ # heading [link](url) - list
                </span>
            </p>
        </div>
    );
}
