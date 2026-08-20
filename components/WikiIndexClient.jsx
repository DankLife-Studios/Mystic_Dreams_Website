"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";


function Highlight({ text, query }) {
  const value = String(text || "");
  const term = String(query || "").trim();
  if (!term) return value;
  const index = value.toLowerCase().indexOf(term.toLowerCase());
  if (index < 0) return value;
  return <>{value.slice(0, index)}<mark>{value.slice(index, index + term.length)}</mark>{value.slice(index + term.length)}</>;
}

function CategoryCard({ category }) {
  const pageCount = (category.pages?.length || 0) + (category.children || []).reduce((sum, child) => sum + (child.pages?.length || 0), 0);
  return (
    <section className="wiki-category-card">
      <div className="wiki-category-card-head">
        <div>
          <h2>{category.name}</h2>
          {category.description && <p>{category.description}</p>}
        </div>
        <span>{pageCount} {pageCount === 1 ? "article" : "articles"}</span>
      </div>
      <div className="wiki-category-links">
        {(category.pages || []).map((page) => (
          <Link key={page.slug} href={`/wiki/${page.slug}`}>
            <strong>{page.title}</strong>
            {page.summary && <small>{page.summary}</small>}
          </Link>
        ))}
        {(category.children || []).map((child) => (
          <div key={child.name} className="wiki-subcategory">
            <p>{child.name}</p>
            {(child.pages || []).map((page) => (
              <Link key={page.slug} href={`/wiki/${page.slug}`}>{page.title}</Link>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function WikiIndexClient() {
  const [data, setData] = useState(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/wiki")
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed to load wiki");
        return response.json();
      })
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(`/api/wiki?q=${encodeURIComponent(term)}`, { signal: controller.signal })
        .then((response) => response.json())
        .then((body) => setResults(body.pages || []))
        .catch((err) => {
          if (err.name !== "AbortError") setResults([]);
        })
        .finally(() => setSearching(false));
    }, 180);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const totalArticles = useMemo(() => data?.pages?.length || 0, [data]);
  if (error) return <div className="wiki-state">{error}</div>;
  if (!data) return <WikiSkeleton />;

  const showSearch = query.trim().length >= 2;
  return (
    <main className="wiki-home">
      <section className="wiki-hero-panel">
        <div className="wiki-eyebrow"><i className="fa-regular fa-books" /> Mystic Dreams Knowledge Base</div>
        <h1>Find your way around the city.</h1>
        <p>Rules, systems, jobs, businesses, vehicles, medical information, and player guides — maintained as one searchable wiki.</p>
        <div className="wiki-search-wrap">
          <i className="fa-regular fa-magnifying-glass" aria-hidden />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search the wiki…"
            aria-label="Search the Mystic Dreams wiki"
          />
          {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search"><i className="fa-regular fa-xmark" /></button>}
        </div>
        <div className="wiki-home-stats">
          <span><strong>{totalArticles}</strong> published articles</span>
          <span><strong>{data.flatCategories?.length || 0}</strong> categories</span>
          <span>Public access</span>
        </div>
      </section>

      {showSearch ? (
        <section className="wiki-search-results" aria-live="polite">
          <div className="wiki-section-heading">
            <div><span>Search</span><h2>Results for “{query.trim()}”</h2></div>
            <small>{searching ? "Searching…" : `${results.length} result${results.length === 1 ? "" : "s"}`}</small>
          </div>
          <div className="wiki-result-list">
            {!searching && results.length === 0 && <div className="wiki-state">No matching articles. Try another phrase.</div>}
            {results.map((page) => (
              <Link key={page.slug} href={`/wiki/${page.slug}`} className="wiki-result-card">
                <div><span>{page.category}</span><h3><Highlight text={page.title} query={query} /></h3><p><Highlight text={page.summary || page.excerpt} query={query} /></p></div>
                <i className="fa-regular fa-arrow-right" />
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <>
          {data.homePage && (
            <section className="wiki-featured-article">
              <div><span>Start here</span><h2>{data.homePage.title}</h2><p>{data.homePage.summary || "Your starting point for the Mystic Dreams wiki."}</p></div>
              <Link href={`/wiki/${data.homePage.slug}`} className="btn-primary">Open guide <i className="fa-regular fa-arrow-right" /></Link>
            </section>
          )}
          <section>
            <div className="wiki-section-heading"><div><span>Browse</span><h2>Wiki categories</h2></div><small>Choose a topic to begin</small></div>
            <div className="wiki-category-grid">
              {(data.categories || []).map((category) => <CategoryCard key={category.name} category={category} />)}
            </div>
          </section>
        </>
      )}
    </main>
  );
}

function WikiSkeleton() {
  return <div className="wiki-home"><div className="wiki-hero-panel wiki-skeleton"><div /><div /><div /><div /></div></div>;
}
