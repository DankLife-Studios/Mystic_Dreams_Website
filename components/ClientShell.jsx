"use client";

import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { SITE } from "@/lib/site";
import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "./ThemeToggle";

export default function ClientShell({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Close sidebar on route change (via popstate / link clicks)
    useEffect(() => {
        const handleRouteChange = () => setSidebarOpen(false);
        window.addEventListener("popstate", handleRouteChange);
        return () => window.removeEventListener("popstate", handleRouteChange);
    }, []);

    // Close sidebar on larger screens
    useEffect(() => {
        const mq = window.matchMedia("(min-width: 1024px)");
        const handler = (e) => {
            if (e.matches) setSidebarOpen(false);
        };
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);

    // Prevent body scroll when sidebar is open on mobile
    useEffect(() => {
        if (sidebarOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [sidebarOpen]);

    return (
        <>
            {/* Mobile top bar */}
            <div className="mobile-topbar lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between h-14 px-4 border-b border-[var(--border)] bg-[var(--bg-glass)] backdrop-blur-xl">
                <button
                    type="button"
                    onClick={() => setSidebarOpen(true)}
                    className="flex items-center justify-center w-9 h-9 rounded-lg text-[var(--text-primary)] hover:bg-[var(--surface-muted)] transition-colors"
                    aria-label="Open menu"
                >
                    <i className="fa-regular fa-bars text-lg" />
                </button>

                <Link href="/" className="flex items-center gap-2.5">
                    <Image
                        src={SITE.logoUrl}
                        alt={SITE.name}
                        width={28}
                        height={28}
                        className="rounded-md"
                    />
                    <span className="font-display text-sm font-semibold text-[var(--text-primary)]">
                        {SITE.name}
                    </span>
                </Link>

                <ThemeToggle />
            </div>

            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="sidebar-backdrop lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main content area */}
            <div className="main-content ml-0 lg:ml-[280px] mr-0 lg:mr-3 mt-14 lg:mt-3 mb-0 flex min-h-[calc(100vh-3.5rem)] lg:min-h-[calc(100vh-0.75rem)] flex-col">
                <main className="page-shell flex-1 flex flex-col">{children}</main>
                <Footer />
            </div>
        </>
    );
}
