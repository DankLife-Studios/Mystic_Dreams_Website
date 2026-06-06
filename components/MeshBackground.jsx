export default function MeshBackground({ variant = "default" }) {
    const opacity = variant === "hero" ? "opacity-30" : "opacity-40";

    return (
        <div className={`pointer-events-none absolute inset-0 overflow-hidden ${opacity}`}>
            <div
                className="mesh-blob left-1/2 top-0 h-[320px] w-[480px] -translate-x-1/2"
                style={{ background: "var(--mesh-color)" }}
            />
        </div>
    );
}
