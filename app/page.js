"use client";

import { useEffect } from "react";
import Hero from "@/components/Hero";

export default function HomePage() {
    useEffect(() => {
        document.documentElement.style.overflow = "hidden";
        return () => {
            document.documentElement.style.overflow = "";
        };
    }, []);

    return (
        <div className="flex min-h-0 flex-1 flex-col justify-center">
            <Hero />
        </div>
    );
}
