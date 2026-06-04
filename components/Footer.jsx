import Link from "next/link";
import Image from "next/image";
import DiscordButton from "./DiscordButton";
import { SITE } from "@/lib/site";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/features", label: "Features" },
  { href: "/whitelist", label: "Whitelist" },
  { href: "/connect", label: "Connect" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/city", label: "City Info" },
];

export default function Footer() {
  return (
    <footer className="relative mt-auto border-t border-[var(--border)] bg-[var(--bg-secondary)]">
      <div className="section-divider" />
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src={SITE.logoUrl}
                alt={SITE.name}
                width={48}
                height={48}
                className="rounded-xl ring-1 ring-[var(--border)]"
              />
              <div>
                <p className="font-display font-bold">{SITE.name}</p>
                <p className="text-sm text-[var(--accent)]">{SITE.tagline}</p>
              </div>
            </Link>
            <p className="mt-4 text-sm text-[var(--text-muted)]">
              A premium FiveM roleplay experience built for immersion and
              community.
            </p>
          </div>

          <div className="text-center md:text-left">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Navigate
            </p>
            <ul className="mt-4 space-y-2">
              {LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--accent)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col items-center text-center md:items-end md:text-right">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Community
            </p>
            <p className="mt-4 text-sm text-[var(--text-secondary)]">
              Join Discord for whitelist, updates, and support.
            </p>
            <DiscordButton className="mt-4" variant="secondary" />
          </div>
        </div>

        <div className="section-divider mt-10" />
        <p className="mt-6 text-center text-xs text-[var(--text-muted)]">
          © {new Date().getFullYear()} {SITE.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
