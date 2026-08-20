"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import ThemeToggle from "./ThemeToggle";
import { SITE } from "@/lib/site";

const NAV_PUBLIC = [
  { href: "/", label: "Home", icon: "fa-house" },
  { href: "/about", label: "About Us", icon: "fa-sparkles" },
  { href: "/wiki", label: "Wiki", icon: "fa-books" },
  { href: "/connect", label: "Get Started", icon: "fa-rocket-launch" },
  {
    href: SITE.showcaseUrl,
    label: "Showcase",
    icon: "fa-images",
    external: true,
  },
];

const NAV_AUTH = [{ href: "/city", label: "City Directory", icon: "fa-city" }];

export default function Sidebar({ isOpen = false, onClose = () => {} }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [permissions, setPermissions] = useState(null);
  const nav = session ? [...NAV_PUBLIC, ...NAV_AUTH] : NAV_PUBLIC;

  useEffect(() => {
    let active = true;
    if (!session) {
      setPermissions(null);
      return () => { active = false; };
    }
    fetch("/api/permissions")
      .then((res) => (res.ok ? res.json() : null))
      .then((body) => {
        if (active) setPermissions(body?.permissions || null);
      })
      .catch(() => {});
    return () => { active = false; };
  }, [session]);

  const isActive = (href, external) => {
    if (external) return false;
    if (href === "/") return pathname === "/";
    if (href === "/connect") {
      return pathname === "/connect" || pathname === "/whitelist";
    }
    return pathname.startsWith(href);
  };

  const navClass = (active) =>
    `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
      active
        ? "bg-purple-500/15 text-[var(--accent)]"
        : "text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]"
    }`;

  return (
    <aside
      className={`sidebar-desktop fixed left-3 top-3 bottom-3 z-50 flex w-64 flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] shadow-2xl shadow-purple-500/10
        lg:translate-x-0 lg:opacity-100 lg:pointer-events-auto
        ${
          isOpen
            ? "sidebar-mobile-open translate-x-0 opacity-100 pointer-events-auto"
            : "-translate-x-full opacity-0 pointer-events-none lg:translate-x-0 lg:opacity-100 lg:pointer-events-auto"
        }
        transition-transform duration-300 ease-in-out`}
    >
      <div className="absolute top-3 right-3 z-10 lg:hidden">
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]"
          aria-label="Close menu"
        >
          <i className="fa-regular fa-xmark text-lg" />
        </button>
      </div>

      <div className="relative border-b border-[var(--border)] bg-[var(--card-bg)] px-5 py-4">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent" />
        <div className="relative flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-purple-500/30 blur-md" />
            <Image
              src="/mystic_logo.png"
              alt={SITE.name}
              width={36}
              height={36}
              className="relative rounded-full ring-2 ring-purple-500/30"
            />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
              {SITE.name}
            </p>
            <p className="truncate text-[11px] text-[var(--text-muted)]">
              {SITE.tagline}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 overscroll-contain">
        <p className="mb-3 flex items-center gap-2 px-3 text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--text-muted)]">
          <span className="block h-1 w-1 rounded-full bg-purple-500/50" />
          Navigation
        </p>
        <div className="space-y-0.5">
          {nav.map((item) => {
            const active = isActive(item.href, item.external);
            const content = (
              <>
                <span
                  className={`text-sm transition-colors ${
                    active
                      ? "text-[var(--accent)]"
                      : "text-[var(--text-muted)] group-hover:text-[var(--accent)]"
                  }`}
                >
                  <i className={`fa-regular ${item.icon}`} />
                </span>
                {item.label}
                {item.external ? (
                  <i className="fa-regular fa-arrow-up-right-from-square ml-auto text-[10px] opacity-60" />
                ) : active ? (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-purple-400 shadow-sm shadow-purple-400/50" />
                ) : null}
              </>
            );

            if (item.external) {
              return (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onClose}
                  className={navClass(false)}
                >
                  {content}
                </a>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={navClass(active)}
              >
                {content}
              </Link>
            );
          })}
        </div>

        {session && (
          <>
            <p className="mb-3 mt-8 flex items-center gap-2 px-3 text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--text-muted)]">
              <span className="block h-1 w-1 rounded-full bg-purple-500/50" />
              Account
            </p>
            <div className="space-y-0.5">
              <Link
                href="/dashboard"
                onClick={onClose}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 hover:bg-[var(--surface-muted)]"
              >
                {session.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || ""}
                    width={28}
                    height={28}
                    className="h-7 w-7 rounded-full ring-1 ring-purple-500/30"
                  />
                ) : (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-xs font-bold text-[var(--accent)] ring-1 ring-purple-500/30">
                    {session.user?.name?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-[var(--text-primary)]">
                    {session.user?.name}
                  </p>
                  <p className="truncate text-[10px] text-[var(--text-muted)]">
                    View dashboard
                  </p>
                </div>
                <span className="ml-auto h-2 w-2 shrink-0 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
              </Link>
              {(permissions?.isStaff || permissions?.canEditWiki) && (
                <Link
                  href="/admin"
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--text-muted)] transition-all duration-200 hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]"
                >
                  <i className="fa-regular fa-shield-halved text-xs" />
                  Staff tools
                </Link>
              )}
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full rounded-xl px-3 py-2.5 text-left text-sm text-[var(--text-muted)] transition-all duration-200 hover:bg-rose-500/10 hover:text-rose-300"
              >
                <i className="fa-regular fa-right-from-bracket mr-2 text-xs" />
                Log out
              </button>
            </div>
          </>
        )}
      </nav>

      <div className="border-t border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
        <div className="flex items-center justify-between">
          <ThemeToggle />
          {!session && status !== "loading" && (
            <button
              type="button"
              onClick={() => signIn("discord", { callbackUrl: "/dashboard" })}
              className="flex items-center gap-2 rounded-xl border border-purple-500 bg-transparent px-4 py-2 text-xs font-semibold text-purple-400 transition-all duration-200 hover:bg-purple-500/10"
            >
              <i className="fa-brands fa-discord" />
              Login
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
