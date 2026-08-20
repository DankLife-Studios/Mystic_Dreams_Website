import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getSitePermissions } from "@/lib/discord";
import PageShell from "@/components/PageShell";
import AdminClient from "@/components/AdminClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Website Administration | Mystic Dreams RP" };

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.discordId) redirect("/api/auth/signin?callbackUrl=/admin");
  const permissions = await getSitePermissions(session.user.discordId);
  if (!permissions.isStaff && !permissions.canEditWiki) redirect("/dashboard");
  return <PageShell><AdminClient permissions={{ isStaff: permissions.isStaff, canEditWiki: permissions.canEditWiki, canReviewWiki: permissions.canReviewWiki }} /></PageShell>;
}
