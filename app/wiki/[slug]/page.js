import Link from "next/link";
import PageShell from "@/components/PageShell";
import WikiSidebar from "@/components/WikiSidebar";
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
            <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
                <WikiSidebar currentCategory={page.category} currentSlug={page.slug} />

                <main className="space-y-8">
                    <article>
                        <div className="space-y-4 border-b border-slate-800 pb-6">
                            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
                                <Link href="/wiki" className="hover:text-slate-300 transition">Wiki</Link>
                                <span>/</span>
                                <Link href="/wiki" className="hover:text-slate-300 transition">{page.category}</Link>
                            </div>
                            <h1 className="text-5xl font-serif font-bold tracking-tight text-white">{page.title}</h1>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                                <span className="px-2 py-1 bg-slate-900 rounded text-slate-300">Category: {page.category}</span>
                                <span>Updated {new Date(page.updated_at).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <div className="prose prose-invert max-w-none py-8
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
                            <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{page.content}</ReactMarkdown>
                        </div>

                        <div className="border-t border-slate-800 pt-6 flex flex-wrap items-center gap-3">
                            <Link
                                href="/wiki"
                                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white border border-slate-600 rounded hover:border-slate-400 transition"
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
            </div>
        </PageShell>
    );
}
