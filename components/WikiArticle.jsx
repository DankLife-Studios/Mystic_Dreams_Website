import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

export function slugifyHeading(value) {
  return String(value || "").toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}

export function getArticleHeadings(markdown) {
  const headings = [];
  for (const line of String(markdown || "").split("\n")) {
    const match = line.match(/^(##|###)\s+(.+)$/);
    if (!match) continue;
    const text = match[2].replace(/[*_`\[\]]/g, "").trim();
    headings.push({ level: match[1].length, text, id: slugifyHeading(text) });
  }
  return headings;
}

function plainText(children) {
  if (typeof children === "string" || typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(plainText).join("");
  if (children?.props?.children) return plainText(children.props.children);
  return "";
}

function YouTubeEmbed({ value }) {
  const raw = String(value || "").trim();
  const match = raw.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([A-Za-z0-9_-]{6,})/) || raw.match(/^([A-Za-z0-9_-]{6,})$/);
  if (!match) return <pre><code>{raw}</code></pre>;
  const id = match[1];
  return <div className="wiki-video"><iframe src={`https://www.youtube-nocookie.com/embed/${id}`} title="Wiki video" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div>;
}

function Gallery({ value }) {
  const urls = String(value || "").split("\n").map((line) => line.trim()).filter((line) => /^https?:\/\//i.test(line));
  if (!urls.length) return null;
  return <div className="wiki-gallery">{urls.map((url) => <img key={url} src={url} alt="Wiki gallery" loading="lazy" />)}</div>;
}

export default function WikiArticle({ content }) {
  return (
    <div className="wiki-prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          h1: ({ children }) => <h1 id={slugifyHeading(plainText(children))}>{children}</h1>,
          h2: ({ children }) => <h2 id={slugifyHeading(plainText(children))}>{children}</h2>,
          h3: ({ children }) => <h3 id={slugifyHeading(plainText(children))}>{children}</h3>,
          a: ({ href, title, children }) => {
            const external = /^https?:\/\//i.test(href || "");
            const isButton = title === "button";
            return <a href={href} className={isButton ? "wiki-inline-button" : undefined} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}>{children}{external && !isButton ? <span className="sr-only"> (opens in new tab)</span> : null}</a>;
          },
          blockquote: ({ children }) => <aside className="wiki-callout"><i className="fa-regular fa-circle-info" aria-hidden /><div>{children}</div></aside>,
          pre: ({ children }) => {
            const child = Array.isArray(children) ? children[0] : children;
            const className = child?.props?.className || "";
            const language = /language-([^\s]+)/.exec(className)?.[1];
            const value = plainText(child?.props?.children).replace(/\n$/, "");
            if (language === "gallery") return <Gallery value={value} />;
            if (language === "youtube") return <YouTubeEmbed value={value} />;
            return <pre>{children}</pre>;
          },
          code: ({ className, children }) => <code className={className}>{children}</code>,
          img: ({ src, alt }) => <img src={src} alt={alt || "Wiki image"} loading="lazy" />,
          table: ({ children }) => <div className="wiki-table-wrap"><table>{children}</table></div>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
