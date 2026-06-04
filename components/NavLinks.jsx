"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "./Icon";

const NAV = [
  { href: "/", label: "Home", icon: "house" },
  { href: "/features", label: "Features", icon: "sparkles" },
  { href: "/whitelist", label: "Whitelist", icon: "key" },
  { href: "/connect", label: "Connect", icon: "gamepad" },
  { href: "/dashboard", label: "Dashboard", icon: "gauge" },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-1 md:flex">
      {NAV.map((item) => {
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
