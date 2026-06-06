import PageShell from "@/components/PageShell";
import WikiIndexClient from "@/components/WikiIndexClient";

export const metadata = {
    title: "Mystic Dreams Wiki",
    description: "A public wiki for Mystic Dreams RP with role-gated editing for approved Discord members.",
};

export default function WikiPage() {
    return (
        <PageShell>
            <WikiIndexClient />
        </PageShell>
    );
}
