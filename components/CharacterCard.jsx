import Icon from "./Icon";

export default function CharacterCard({ character }) {
  const formatMoney = (n) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);

  const lastPlayed = character.lastLoggedOut
    ? new Date(character.lastLoggedOut).toLocaleString()
    : "Never";

  const displayName = character.characterName || character.name;
  const initial = displayName.charAt(0)?.toUpperCase() || "?";

  return (
    <article className="surface-card group relative overflow-hidden rounded-3xl transition duration-300 hover:border-mystic/40 hover:shadow-lg hover:shadow-mystic/10">
      <div className="relative p-6 sm:p-7">
        <div className="flex items-start gap-4">
          <div className="icon-box icon-on-gradient flex size-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-mystic to-mystic-dark shadow-md shadow-mystic/20">
            <Icon name="user" size="lg" />
            <span className="sr-only">{initial}</span>
          </div>
          <div className="min-w-0 flex-1">
            <span className="inline-flex rounded-full bg-mystic/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-mystic">
              Slot {character.cid}
            </span>
            <h3 className="text-heading font-display mt-2 truncate text-xl font-bold tracking-tight">
              {displayName}
            </h3>
            <p className="text-caption mt-0.5 truncate font-mono text-[11px]">
              {character.citizenid}
            </p>
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-3">
          <Stat label="Job" value={character.jobLabel} sub={character.jobGrade} />
          {character.gangLabel ? (
            <Stat label="Gang" value={character.gangLabel} />
          ) : (
            <div />
          )}
          <Stat label="Cash" value={formatMoney(character.cash)} accent />
          <Stat label="Bank" value={formatMoney(character.bank)} accent />
          {character.phone && (
            <Stat label="Phone" value={character.phone} className="col-span-2" />
          )}
          <Stat
            label="Last played"
            value={lastPlayed}
            className="col-span-2"
            compact
          />
        </dl>
      </div>
    </article>
  );
}

function Stat({ label, value, sub, accent, compact, className = "" }) {
  return (
    <div
      className={`rounded-xl border border-subtle surface-muted px-3 py-2.5 ${className}`}
    >
      <dt className="text-caption text-[10px] font-bold uppercase tracking-widest">
        {label}
      </dt>
      <dd
        className={`mt-0.5 font-semibold ${compact ? "text-xs" : "text-sm"} ${
          accent ? "text-mystic" : "text-heading"
        }`}
      >
        {value}
      </dd>
      {sub && <dd className="text-caption text-xs">{sub}</dd>}
    </div>
  );
}
