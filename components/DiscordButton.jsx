import { SITE } from "@/lib/site";
import Icon from "./Icon";

export default function DiscordButton({
  className = "",
  children,
  variant = "primary",
}) {
  const base = variant === "primary" ? "btn-primary" : "btn-secondary";
  return (
    <a
      href={SITE.discordInvite}
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} ${className}`}
    >
      <Icon name="discord" size="sm" duotone={false} />
      {children || "Join Discord"}
    </a>
  );
}
