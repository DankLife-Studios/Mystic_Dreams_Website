import CityInfoClient from "@/components/CityInfoClient";
import PageHero from "@/components/PageHero";
import PageShell from "@/components/PageShell";

export const metadata = {
  title: "City Info",
};

export default function CityPage() {
  return (
    <PageShell>
      <PageHero
        badge="In-game directory"
        badgeIcon="city"
        title="City"
        highlight="Info"
        description="Business locations and current owners from live server data. Log in with Discord to view."
      />
      <CityInfoClient />
    </PageShell>
  );
}
