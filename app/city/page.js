import CityInfoClient from "@/components/CityInfoClient";
import PageShell from "@/components/PageShell";

export const metadata = {
  title: "City Directory",
  description:
    "Whitelisted businesses, departments, and shops in Los Santos — owners and locations.",
};

export default function CityPage() {
  return (
    <PageShell>
      <CityInfoClient />
    </PageShell>
  );
}
