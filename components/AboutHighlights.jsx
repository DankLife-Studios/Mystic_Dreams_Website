import { ABOUT_HIGHLIGHTS } from "@/lib/site";
import Icon from "./Icon";

export default function AboutHighlights() {
  return (
    <div className="surface-card overflow-hidden">
      {ABOUT_HIGHLIGHTS.map((item, index) => (
        <div
          key={item.title}
          className={`feature-row items-start ${
            index < ABOUT_HIGHLIGHTS.length - 1 ? "" : ""
          }`}
        >
          <span className="step-timeline-number shrink-0">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="icon-box icon-box-md shrink-0">
            <Icon name={item.icon} size="sm" className="icon-fancy" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-heading font-display text-base font-semibold">
              {item.title}
            </h3>
            <p className="text-body mt-1 text-sm leading-relaxed">{item.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
