"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import ThemeToggle from "./ThemeToggle";
import { SITE } from "@/lib/site";

const NAV_PUBLIC = [
    { href: "/", label: "Home", icon: "fa-house" },
    { href: "/features", label: "Features", icon: "fa-sparkles" },
    { href: "/wiki", label: "Wiki", icon: "fa-books" },
    { href: "/connect", label: "Get Started", icon: "fa-rocket-launch" },
];

const NAV_AUTH = [
    { href: "/city", label: "City", icon: "fa-city" },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const nav = session ? [...NAV_PUBLIC, ...NAV_AUTH] : NAV_PUBLIC;

    const isActive = (href) => {
        if (href === "/") return pathname === "/";
        if (href === "/connect") return pathname === "/connect" || pathname === "/whitelist";
        return pathname.startsWith(href);
    };

    return (
        <aside className="fixed left-3 top-3 bottom-3 z-50 flex w-64 flex-col overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 shadow-2xl shadow-purple-500/10">
            {/* Server header */}
            <div className="relative border-b border-purple-500/20 bg-slate-950/80 px-5 py-4">
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
                        <p className="truncate text-sm font-semibold text-white">{SITE.name}</p>
                        <p className="truncate text-[11px] text-purple-300/70">{SITE.tagline}</p>
                    </div>
                </div>
            </div>

            {/* Nav channels */}
            <nav className="flex-1 overflow-y-auto px-3 py-4">
                <p className="mb-3 flex items-center gap-2 px-3 text-[10px] font-bold uppercase tracking-[0.25em] text-purple-400/60">
                    <span className="block h-1 w-1 rounded-full bg-purple-500/50" />
                    Navigation
                </p>
                <div className="space-y-0.5">
                    {nav.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${active
                                    ? "bg-purple-500/15 text-purple-200 shadow-inner shadow-purple-500/5"
                                    : "text-slate-400 hover:bg-slate-800/80 hover:text-white"
                                    }`}
                            >
                                <span
                                    className={`text-sm transition-colors ${active ? "text-purple-400" : "text-slate-500 group-hover:text-purple-300"
                                        }`}
                                >
                                    <i className={`fa-regular ${item.icon}`} />
                                </span>
                                {item.label}
                                {active && (
                                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-purple-400 shadow-sm shadow-purple-400/50" />
                                )}
                            </Link>
                        );
                    })}
                </div>

                {session && (
                    <>
                        <p className="mb-3 mt-8 flex items-center gap-2 px-3 text-[10px] font-bold uppercase tracking-[0.25em] text-purple-400/60">
                            <span className="block h-1 w-1 rounded-full bg-purple-500/50" />
                            Account
                        </p>
                        <div className="space-y-0.5">
                            <Link
                                href="/dashboard"
                                className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 hover:bg-slate-800/80"
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
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-xs font-bold text-purple-300 ring-1 ring-purple-500/30">
                                        {session.user?.name?.[0]?.toUpperCase() || "?"}
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <p className="truncate text-xs font-medium text-slate-200">{session.user?.name}</p>
                                    <p className="truncate text-[10px] text-slate-500">View dashboard</p>
                                </div>
                                <span className="ml-auto h-2 w-2 shrink-0 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                            </Link>
                            <button
                                type="button"
                                onClick={() => signOut({ callbackUrl: "/" })}
                                className="w-full rounded-xl px-3 py-2.5 text-left text-sm text-slate-500 transition-all duration-200 hover:bg-rose-500/10 hover:text-rose-300"
                            >
                                <i className="fa-regular fa-right-from-bracket mr-2 text-xs" />
                                Log out
                            </button>
                        </div>
                    </>
                )}
            </nav>

            {/* Bottom bar */}
            <div className="border-t border-purple-500/20 bg-slate-950/50 px-4 py-3">
                <div className="flex items-center justify-between">
                    <ThemeToggle />
                    {!session && status !== "loading" && (
                        <button
                            type="button"
                            onClick={() => signIn("discord", { callbackUrl: "/dashboard" })}
                            className="flex items-center gap-2 rounded-xl bg-purple-500 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-purple-500/20 transition-all duration-200 hover:bg-purple-400 hover:shadow-purple-400/30"
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
