import { WHITELIST_STEPS } from "@/lib/site";
import DiscordButton from "./DiscordButton";
import Icon from "./Icon";

export default function WhitelistSteps() {
  return (
    <div className="surface-card overflow-hidden rounded-3xl">
      {WHITELIST_STEPS.map((step, index) => (
        <div
          key={step.step}
          className={`flex gap-4 px-5 py-5 sm:gap-6 sm:px-7 sm:py-6 ${
            index !== WHITELIST_STEPS.length - 1 ? "border-b border-subtle" : ""
          }`}
        >
          <div className="flex shrink-0 flex-col items-center gap-1.5">
            <span className="icon-box icon-box-lg icon-on-gradient bg-linear-to-br from-mystic to-mystic-dark shadow-md shadow-mystic/25">
              <Icon
                name={step.icon}
                size="lg"
                duotone={step.icon !== "discord"}
              />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-mystic">
              {step.step}
            </span>
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <h3 className="text-heading font-display text-base font-bold sm:text-lg">
              {step.title}
            </h3>
            <p className="text-body mt-1.5 text-sm leading-relaxed">
              {step.description}
            </p>
          </div>
        </div>
      ))}
      <div className="flex justify-center border-t border-subtle surface-muted px-5 py-5">
        <DiscordButton>Join Discord to Apply</DiscordButton>
      </div>
    </div>
  );
}
