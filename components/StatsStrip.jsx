import { STAT_ITEMS } from "@/lib/site";
import Icon from "./Icon";

export default function StatsStrip() {
  return (
    <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 sm:grid-cols-4 sm:px-6 lg:gap-6">
      {STAT_ITEMS.map((stat) => (
        <div
          key={stat.label}
          className="stat-card flex flex-col items-center rounded-2xl px-4 py-5 text-center sm:px-6 sm:py-6"
        >
          <span className="icon-box icon-box-md mb-3">
            <Icon
              name={stat.icon}
              size="md"
              duotone={stat.icon !== "discord"}
              className="icon-fancy"
            />
          </span>
          <p className="font-display text-2xl font-bold text-gradient sm:text-3xl">
            {stat.value}
          </p>
          <p className="text-caption mt-1 text-xs font-semibold uppercase tracking-wider">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}
