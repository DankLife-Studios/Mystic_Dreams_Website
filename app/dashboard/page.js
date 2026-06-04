import DashboardClient from "@/components/DashboardClient";

export const metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden page-bg-gradient">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-0 size-96 rounded-full bg-mystic/10 blur-3xl dark:bg-mystic/20"
      />
      <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:py-16">
        <DashboardClient />
      </div>
    </div>
  );
}
