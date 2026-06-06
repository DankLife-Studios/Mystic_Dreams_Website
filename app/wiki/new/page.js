import PageShell from "@/components/PageShell";
import WikiCreateClient from "@/components/WikiCreateClient";

export const metadata = {
    title: "Create Wiki Page",
    description: "Create a new page in the Mystic Dreams wiki.",
};

export default function WikiNewPage() {
    return (
        <PageShell>
            <WikiCreateClient />
        </PageShell>
    );
}
