import PageShell from "@/components/PageShell";
import WikiEditClient from "@/components/WikiEditClient";

export const metadata = {
    title: "Edit Wiki Page",
    description: "Edit an existing page in the Mystic Dreams wiki.",
};

export default async function WikiSlugEditPage({ params }) {
    const { slug } = await params;
    return (
        <PageShell>
            <WikiEditClient slug={slug} />
        </PageShell>
    );
}
