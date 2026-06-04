import { WHITELIST_STEPS } from "@/lib/site";
import DiscordButton from "./DiscordButton";
import StepTimeline from "./StepTimeline";

const steps = WHITELIST_STEPS.map((s) => ({
  id: s.step,
  icon: s.icon,
  label: s.step,
  title: s.title,
  description: s.description,
}));

export default function WhitelistSteps() {
  return (
    <StepTimeline
      steps={steps}
      footer={<DiscordButton>Join Discord to apply</DiscordButton>}
    />
  );
}
