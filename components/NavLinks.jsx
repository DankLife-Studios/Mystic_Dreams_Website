"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Icon from "./Icon";

const NAV_PUBLIC = [
  { href: "/", label: "Home", icon: "house" },
  { href: "/features", label: "Features", icon: "sparkles" },
  { href: "/whitelist", label: "Whitelist", icon: "key" },
  { href: "/connect", label: "Connect", icon: "gamepad" },
];

const NAV_AUTH = [
  { href: "/dashboard", label: "Dashboard", icon: "gauge" },
  { href: "/city", label: "City", icon: "city" },
];

export default function NavLinks() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const nav = session ? [...NAV_PUBLIC, ...NAV_AUTH] : NAV_PUBLIC;

  return (
    <nav className="hidden items-center gap-1 md:flex">
      {nav.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
              active
                ? "bg-[var(--accent)]/15 text-[var(--accent)]"
                : "text-[var(--text-secondary)] hover:bg-[var(--border)]/30 hover:text-[var(--accent)]"
            }`}
          >
            <Icon name={item.icon} size="xs" className={active ? "icon-fancy" : ""} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
