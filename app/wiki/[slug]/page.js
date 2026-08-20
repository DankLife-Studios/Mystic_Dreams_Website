import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getSitePermissions } from "@/lib/discord";
import { getWikiArticleContext } from "@/lib/wiki";
import PageShell from "@/components/PageShell";
import WikiArticle, { getArticleHeadings } from "@/components/WikiArticle";

export const dynamic = "force-dynamic";

export default async function WikiArticlePage({ params }) {
  const { slug } = await params;
  const context = await getWikiArticleContext(slug);
  if (!context) notFound();

  const { page, previous, next, related } = context;
  const headings = getArticleHeadings(page.content);
  const session = await auth();
  const permissions = session?.user?.discordId ? await getSitePermissions(session.user.discordId) : null;

  return (
    <PageShell>
      <div className="wiki-article-shell">
        <article className="wiki-article-main">
          <nav className="wiki-breadcrumb" aria-label="Breadcrumb">
            <Link href="/wiki">Wiki</Link><i className="fa-regular fa-chevron-right" /><span>{page.category}</span><i className="fa-regular fa-chevron-right" /><span>{page.title}</span>
          </nav>
          <header className="wiki-article-header">
            <span className="wiki-article-category">{page.category}</span>
            <h1>{page.title}</h1>
            {page.summary && <p>{page.summary}</p>}
            <div className="wiki-article-meta"><span>Updated {new Date(page.updated_at).toLocaleDateString()}</span>{page.tags?.map((tag) => <span key={tag}>#{tag}</span>)}</div>
          </header>

          <WikiArticle content={page.content} />

          <div className="wiki-article-pagination">
            {previous ? <Link href={`/wiki/${previous.slug}`}><small>Previous</small><strong>← {previous.title}</strong></Link> : <span />}
            {next ? <Link href={`/wiki/${next.slug}`}><small>Next</small><strong>{next.title} →</strong></Link> : <span />}
          </div>

          {related.length > 0 && <section className="wiki-related"><div className="wiki-section-heading"><div><span>Keep reading</span><h2>Related articles</h2></div></div><div>{related.map((item) => <Link key={item.slug} href={`/wiki/${item.slug}`}><span>{item.category}</span><strong>{item.title}</strong></Link>)}</div></section>}
        </article>

        <aside className="wiki-article-aside">
          {headings.length > 0 && <div className="wiki-toc"><p>On this page</p>{headings.map((heading) => <a key={`${heading.id}-${heading.level}`} href={`#${heading.id}`} className={heading.level === 3 ? "wiki-toc-sub" : ""}>{heading.text}</a>)}</div>}
          {permissions?.canEditWiki && <div className="wiki-editor-actions"><span>Staff editor</span><Link href={`/wiki/${page.slug}/edit`}>Edit article</Link><Link href="/admin">Review queue</Link></div>}
        </aside>
      </div>
    </PageShell>
  );
}
