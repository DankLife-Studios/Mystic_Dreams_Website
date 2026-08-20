import Link from "next/link";
import Image from "next/image";
import DiscordButton from "./DiscordButton";
import { SITE } from "@/lib/site";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/wiki", label: "Wiki" },
  { href: "/connect", label: "Get Started" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/city", label: "City Directory" },
];

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--border)]">
      <div className="px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <Image
                src={SITE.logoUrl}
                alt={SITE.name}
                width={36}
                height={36}
                className="rounded-md"
              />
              <div>
                <p className="font-display text-sm font-semibold">{SITE.name}</p>
                <p className="text-caption text-xs">{SITE.tagline}</p>
              </div>
            </Link>
            <p className="text-body mt-4 max-w-xs text-sm">
              A serious FiveM roleplay community built for immersive stories,
              connected systems, and long-term characters.
            </p>
          </div>

          <div>
            <p className="text-caption text-xs font-medium uppercase tracking-wider">
              Navigate
            </p>
            <ul className="mt-3 space-y-2">
              {LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--accent)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href={SITE.showcaseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--accent)]"
                >
                  Showcase
                  <i className="fa-regular fa-arrow-up-right-from-square text-[9px]" />
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-caption text-xs font-medium uppercase tracking-wider">
              Community
            </p>
            <p className="text-body mt-3 text-sm">
              Discord for whitelist, updates, support, and community news.
            </p>
            <DiscordButton className="mt-4" variant="secondary" />
          </div>
        </div>

        <p className="text-caption mt-10 border-t border-[var(--divider)] pt-6 text-center text-xs">
          © {new Date().getFullYear()} {SITE.name}
        </p>
      </div>
    </footer>
  );
}
