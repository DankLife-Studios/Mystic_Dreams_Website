export default function MeshBackground({ variant = "default" }) {
  const intensity = variant === "hero" ? "opacity-100" : "opacity-70";

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${intensity}`}>
      <div
        className="mesh-blob -left-32 top-0 h-[420px] w-[420px]"
        style={{ background: "var(--mesh-color)" }}
      />
      <div
        className="mesh-blob -right-24 top-1/3 h-[360px] w-[360px]"
        style={{ background: "rgba(126, 34, 206, 0.12)" }}
      />
      <div
        className="mesh-blob bottom-0 left-1/3 h-[280px] w-[280px]"
        style={{ background: "rgba(232, 121, 249, 0.08)" }}
      />
    </div>
  );
}
