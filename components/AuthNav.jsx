"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function AuthNav() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <span className="nav-pill nav-pill-idle opacity-50">···</span>
    );
  }

  if (session) {
    return (
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="nav-pill nav-pill-idle"
      >
        Log out
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => signIn("discord", { callbackUrl: "/dashboard" })}
      className="btn-primary !py-2 !text-sm"
    >
      Log in
    </button>
  );
}
