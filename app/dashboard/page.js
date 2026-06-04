import DashboardClient from "@/components/DashboardClient";
import PageShell from "@/components/PageShell";

export const metadata = {
  title: "Dashboard",
  description: "Your Mystic Dreams RP account, characters, and server status.",
};

export default function DashboardPage() {
  return (
    <PageShell>
      <DashboardClient />
    </PageShell>
  );
}
