"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

const NAV_PUBLIC = [
  { href: "/", label: "Home" },
  { href: "/features", label: "Features" },
  { href: "/wiki", label: "Wiki" },
  { href: "/connect", label: "Get Started" },
];

const NAV_AUTH = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/city", label: "City" },
];

export default function NavLinks() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const nav = session ? [...NAV_PUBLIC, ...NAV_AUTH] : NAV_PUBLIC;

  return (
    <nav className="hidden items-center gap-0.5 md:flex">
      {nav.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : item.href === "/connect"
              ? pathname === "/connect" || pathname === "/whitelist"
              : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-pill ${active ? "nav-pill-active" : "nav-pill-idle"}`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
