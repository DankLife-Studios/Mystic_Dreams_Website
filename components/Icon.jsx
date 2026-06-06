import { FA_ICONS } from "@/lib/icons";

const SIZES = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
    xl: "text-3xl",
    "2xl": "text-4xl",
};

/**
 * Font Awesome Pro icon (duotone by default, brands when needed e.g. Discord).
 *
 * FA 7.2.0 CDN: all.css + duotone.css loaded in root layout.
 * Duotone icons use fa-duotone; if that stylesheet fails to load
 * the browser falls back to a readable glyph via fa-solid.
 */
export default function Icon({
    name,
    size = "md",
    className = "",
    duotone = true,
}) {
    const def = FA_ICONS[name];
    if (!def) return null;

    const sizeClass = SIZES[size] || size;
    const isBrand = typeof def === "object" && def.brand;
    const iconName = isBrand ? def.name : def;

    const styleClass = isBrand
        ? "fa-brands"
        : duotone
            ? "fa-duotone"
            : "fa-solid";

    const duotoneClass = duotone && !isBrand ? "fa-icon-duotone" : "";

    return (
        <i
            className={`${styleClass} ${iconName} ${duotoneClass} ${sizeClass} ${className}`.trim()}
            aria-hidden="true"
        />
    );
}
