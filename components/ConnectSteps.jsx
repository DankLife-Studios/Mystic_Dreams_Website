import { CONNECT_STEPS } from "@/lib/site";
import StepTimeline from "./StepTimeline";

const steps = CONNECT_STEPS.map((s) => ({
  id: s.number,
  icon: s.icon,
  label: s.number,
  title: s.title,
  description: s.description,
  link: s.link,
}));

export default function ConnectSteps() {
  return <StepTimeline steps={steps} />;
}
