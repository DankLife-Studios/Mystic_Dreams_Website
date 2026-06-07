import WikiNavbar from "@/components/WikiNavbar";

export default function WikiLayout({ children }) {
    return (
        <div className="space-y-6">
            <WikiNavbar />
            {children}
        </div>
    );
}
