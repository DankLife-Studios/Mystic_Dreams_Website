import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "./ThemeToggle";
import AuthNav from "./AuthNav";
import NavLinks from "./NavLinks";
import { SITE } from "@/lib/site";

export default function Header() {
  return (
    <header className="nav-shell sticky top-0 z-50">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <Image
            src={SITE.logoUrl}
            alt={SITE.name}
            width={32}
            height={32}
            className="rounded-md"
          />
          <span className="font-display hidden text-sm font-semibold tracking-tight sm:inline">
            {SITE.name}
          </span>
        </Link>

        <NavLinks />

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <AuthNav />
        </div>
      </div>
    </header>
  );
}
