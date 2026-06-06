"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { WHITELIST_STEPS } from "@/lib/site";
import DiscordButton from "./DiscordButton";
import StepTimeline from "./StepTimeline";

const steps = WHITELIST_STEPS.map((s) => ({
    id: s.step,
    icon: s.icon,
    label: s.step,
    title: s.title,
    description: s.description,
}));

export default function WhitelistSteps() {
    const { status } = useSession();
    const [whitelisted, setWhitelisted] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        if (status !== "authenticated") {
            setChecking(false);
            return;
        }

        async function check() {
            try {
                const res = await fetch("/api/me");
                if (res.ok) {
                    const data = await res.json();
                    setWhitelisted(!!data.discord?.hasCitizenRole);
                }
            } catch {
                // ignore
            } finally {
                setChecking(false);
            }
        }

        check();
    }, [status]);

    const isLoggedOut = status === "unauthenticated";

    return (
        <StepTimeline
            steps={steps}
            footer={
                checking ? (
                    <p className="text-center text-sm text-slate-400">Checking whitelist status…</p>
                ) : whitelisted ? (
                    <div className="space-y-2">
                        <button
                            disabled
                            className="btn-primary flex w-full cursor-not-allowed items-center justify-center gap-2 opacity-50"
                        >
                            <i className="fa-solid fa-check" />
                            Whitelisted
                        </button>
                        <p className="text-center text-xs text-emerald-400">
                            You have the Citizen role and are whitelisted to play.
                        </p>
                    </div>
                ) : isLoggedOut ? (
                    <DiscordButton>Join Discord to apply</DiscordButton>
                ) : (
                    <div className="space-y-2">
                        <button
                            disabled
                            className="btn-primary flex w-full cursor-not-allowed items-center justify-center gap-2 opacity-50"
                        >
                            <i className="fa-brands fa-discord" />
                            Joined Discord
                        </button>
                        <p className="text-center text-xs text-amber-400">
                            You are in our Discord. Complete the whitelist process to receive the Citizen role.
                        </p>
                    </div>
                )
            }
        />
    );
}
