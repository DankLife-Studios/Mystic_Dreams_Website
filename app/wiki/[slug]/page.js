import Link from "next/link";
import PageShell from "@/components/PageShell";
import { getWikiIndex, getWikiPageBySlug, getWikiCategories } from "@/lib/wiki";
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

    const allPages = await getWikiIndex();
    const standaloneCategories = await getWikiCategories();

    // Exclude homepage from category listings
    const pages = allPages.filter((p) => !p.is_homepage);

    // Build page-category mapping
    const pageCategoryMap = new Map();
    for (const item of pages) {
        const cat = item.category || "Uncategorized";
        const list = pageCategoryMap.get(cat) || [];
        list.push(item);
        pageCategoryMap.set(cat, list);
    }

    // Build tree from standalone categories
    const catMap = new Map();
    for (const cat of standaloneCategories) {
        catMap.set(cat.name, {
            name: cat.name,
            parentName: cat.parent_name || null,
            displayOrder: cat.display_order ?? 0,
            pages: pageCategoryMap.get(cat.name) || [],
            children: [],
        });
    }
    for (const [name, catPages] of pageCategoryMap) {
        if (!catMap.has(name)) {
            catMap.set(name, { name, parentName: null, displayOrder: 0, pages: catPages, children: [] });
        }
    }
    const roots = [];
    for (const node of catMap.values()) {
        if (node.parentName && catMap.has(node.parentName)) {
            catMap.get(node.parentName).children.push(node);
        } else {
            roots.push(node);
        }
    }
    const sortTree = (nodes) => {
        nodes.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0) || a.name.localeCompare(b.name));
        for (const node of nodes) sortTree(node.children);
    };
    sortTree(roots);

    const flattenTree = (nodes, depth = 0) => {
        const result = [];
        for (const node of nodes) {
            result.push({ name: node.name, pages: node.pages, depth });
            if (node.children) result.push(...flattenTree(node.children, depth + 1));
        }
        return result;
    };
    const categories = flattenTree(roots);

    const relatedPages = pages
        .filter((item) => item.category === page.category && item.slug !== page.slug)
        .slice(0, 4);

    return (
        <PageShell>
            <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
                <aside className="hidden lg:block">
                    <div className="sticky top-24 space-y-6">
                        <nav className="space-y-1">
                            <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Categories</p>
                            <Link
                                href="/wiki"
                                className="block px-3 py-2 text-sm text-slate-400 hover:text-slate-200 border-l-2 border-transparent transition"
                            >
                                All pages
                            </Link>
                            {categories.map((category) => (
                                <Link
                                    key={category.name}
                                    href="/wiki"
                                    style={{ paddingLeft: 12 + category.depth * 12 }}
                                    className={`block px-3 py-2 text-sm transition border-l-2 ${category.name === page.category
                                        ? "font-semibold text-white border-violet-500"
                                        : "text-slate-400 hover:text-slate-200 border-transparent"
                                        }`}
                                >
                                    {category.name}
                                    {category.pages.length > 0 && (
                                        <span className="ml-1 text-xs text-slate-500">({category.pages.length})</span>
                                    )}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </aside>

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

                    {relatedPages.length > 0 && (
                        <section className="space-y-4 border-t border-slate-800 pt-8">
                            <h2 className="text-2xl font-serif font-bold text-white">More in {page.category}</h2>
                            <ul className="space-y-2">
                                {relatedPages.map((related) => (
                                    <li key={related.slug}>
                                        <Link
                                            href={`/wiki/${related.slug}`}
                                            className="text-violet-400 hover:text-violet-300 transition hover:underline"
                                        >
                                            {related.title}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                </main>
            </div>
        </PageShell>
    );
}
