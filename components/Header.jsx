import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "./ThemeToggle";
import AuthNav from "./AuthNav";
import NavLinks from "./NavLinks";
import { SITE } from "@/lib/site";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg-glass)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="group flex items-center gap-3 transition-opacity hover:opacity-90"
        >
          <div className="relative">
            <Image
              src={SITE.logoUrl}
              alt={SITE.name}
              width={40}
              height={40}
              className="rounded-lg ring-1 ring-[var(--border)] transition-transform group-hover:scale-105"
            />
          </div>
          <span className="font-display hidden font-bold sm:inline">
            {SITE.name}
          </span>
        </Link>

        <NavLinks />

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <AuthNav />
        </div>
      </div>
    </header>
  );
}
