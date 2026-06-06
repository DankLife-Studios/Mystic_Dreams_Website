"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { CONNECT_STEPS } from "@/lib/site";
import StepTimeline from "./StepTimeline";
import Icon from "./Icon";

export default function ConnectSteps() {
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

    const steps = CONNECT_STEPS.map((s) => ({
        id: s.number,
        icon: s.icon,
        label: s.number,
        title: s.title,
        description: s.description,
        connect: s.connect,
    }));

    const isLoggedOut = status === "unauthenticated";
    const canConnect = whitelisted && !checking;

    return (
        <StepTimeline
            steps={steps}
            footer={
                <div className="flex flex-col gap-3">
                    {checking ? (
                        <p className="text-sm text-slate-400">Checking whitelist status…</p>
                    ) : isLoggedOut ? (
                        <p className="text-sm text-slate-400">
                            Sign in to check your whitelist status.
                        </p>
                    ) : canConnect ? (
                        <>
                            <a
                                href={`fivem://connect/${CONNECT_STEPS[3]?.connect || "play.mysticdreamsrp.online"}`}
                                className="btn-primary flex items-center justify-center gap-2"
                            >
                                <Icon name="gamepad" size="sm" />
                                Connect to {CONNECT_STEPS[3]?.connect || "play.mysticdreamsrp.online"}
                            </a>
                            <p className="text-xs text-slate-500">
                                Opens FiveM. Make sure FiveM is installed and Discord is running.
                            </p>
                        </>
                    ) : (
                        <div className="space-y-2">
                            <button
                                disabled
                                className="btn-primary flex w-full cursor-not-allowed items-center justify-center gap-2 opacity-50"
                            >
                                <Icon name="gamepad" size="sm" />
                                Connect to {CONNECT_STEPS[3]?.connect || "play.mysticdreamsrp.online"}
                            </button>
                            <p className="text-center text-xs text-amber-400">
                                You must complete the whitelist and receive the Citizen role before connecting.
                            </p>
                        </div>
                    )}
                </div>
            }
        />
    );
}
