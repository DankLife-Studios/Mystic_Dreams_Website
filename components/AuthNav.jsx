"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";

export default function AuthNav() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <span className="btn-secondary !px-3 !py-2 text-sm opacity-60">
        ...
      </span>
    );
  }

  if (session) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/city" className="btn-secondary !px-3 !py-2 text-sm">
          City
        </Link>
        <Link href="/dashboard" className="btn-secondary !px-3 !py-2 text-sm">
          Dashboard
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="btn-secondary !px-3 !py-2 text-sm"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => signIn("discord", { callbackUrl: "/dashboard" })}
      className="btn-primary !px-4 !py-2 text-sm"
    >
      Login
    </button>
  );
}
