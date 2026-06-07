import Link from "next/link";
import PageShell from "@/components/PageShell";
import { getWikiPageBySlug } from "@/lib/wiki";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

export const dynamic = "force-dynamic";

export default async function WikiSlugPage({ params }) {
    const { slug } = await params;
    const page = await getWikiPageBySlug(slug);
    if (!page) {
        return notFound();
    }

    return (
        <PageShell>
            <main className="space-y-8">
                <article>
                    <div className="space-y-4 border-b border-[var(--border)] pb-6">
                        <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--text-muted)]">
                            <Link href="/wiki" className="hover:text-[var(--text-primary)] transition">Wiki</Link>
                            <span>/</span>
                            <Link href="/wiki" className="hover:text-[var(--text-primary)] transition">{page.category}</Link>
                        </div>
                        <h1 className="text-5xl font-serif font-bold tracking-tight text-[var(--text-primary)]">{page.title}</h1>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--text-muted)]">
                            <span className="px-2 py-1 bg-[var(--surface-muted)] rounded text-[var(--text-secondary)]">Category: {page.category}</span>
                            <span>Updated {new Date(page.updated_at).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div className="prose max-w-none py-8
                            prose-headings:text-[var(--text-primary)] prose-headings:font-serif prose-headings:tracking-tight
                            prose-h1:text-4xl prose-h2:text-2xl prose-h2:mt-10 prose-h3:text-xl
                            prose-a:text-[var(--accent)] prose-a:no-underline hover:prose-a:underline
                            prose-strong:text-[var(--text-primary)]
                            prose-code:before:content-none prose-code:after:content-none
                            prose-pre:border prose-pre:border-[var(--border)] prose-pre:rounded-xl
                            prose-img:rounded-xl prose-img:shadow-lg
                            prose-hr:border-[var(--border)]
                            prose-blockquote:border-[var(--accent)] prose-blockquote:not-italic
                            prose-p:text-[var(--text-secondary)]
                            prose-li:text-[var(--text-secondary)]
                        ">
                        <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{page.content}</ReactMarkdown>
                    </div>

                    <div className="border-t border-[var(--border)] pt-6 flex flex-wrap items-center gap-3">
                        <Link
                            href="/wiki"
                            className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)] rounded hover:border-[var(--accent)] transition"
                        >
                            ← Back to wiki
                        </Link>
                        <Link
                            href={`/wiki/${page.slug}/edit`}
                            className="px-4 py-2 text-sm font-medium border border-violet-500 text-violet-400 bg-transparent rounded hover:bg-violet-500/10 transition"
                        >
                            Edit this page
                        </Link>
                    </div>
                </article>
            </main>
        </PageShell>
    );
}
