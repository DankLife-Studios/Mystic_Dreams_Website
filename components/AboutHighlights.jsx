import { ABOUT_HIGHLIGHTS } from "@/lib/site";
import Icon from "./Icon";

export default function AboutHighlights() {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {ABOUT_HIGHLIGHTS.map((item, i) => (
        <div
          key={item.title}
          className="surface-card glass-card-hover flex gap-4 rounded-2xl border-l-4 border-l-mystic p-6"
        >
          <span className="icon-box icon-box-md shrink-0">
            <Icon name={item.icon} size="md" className="icon-fancy" />
          </span>
          <div>
            <span className="font-display text-sm font-bold text-mystic">
              0{i + 1}
            </span>
            <h3 className="text-heading font-display mt-2 text-lg font-bold">
              {item.title}
            </h3>
            <p className="text-body mt-2 text-sm leading-relaxed">{item.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
