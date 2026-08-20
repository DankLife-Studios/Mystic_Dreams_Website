export const SITE = {
  name: "Mystic Dreams RP",
  tagline: "Welcome Home",
  description:
    "A whitelisted FiveM roleplay community built around immersive systems, meaningful character stories, and a city shaped by the people who call it home.",
  about:
    "Mystic Dreams is a serious roleplay community focused on connected systems, player-driven stories, a living economy, custom locations, and long-term character development across civilian, business, emergency service, and criminal roleplay.",
  discordInvite:
    process.env.NEXT_PUBLIC_DISCORD_INVITE || "https://discord.gg/dmQSNsCWx6",
  showcaseUrl: "https://showcases.mysticdreamsrp.online/",
  logoUrl:
    "https://r2.fivemanage.com/WD5BOqY7YF5rF3HB1Ff2m/mystic_logo.png",
  accent: "#a855f7",
  maxSlots: 64,
};

export const ABOUT_HIGHLIGHTS = [
  {
    title: "Character-first roleplay",
    icon: "users",
    text: "Build a story that can grow through careers, relationships, businesses, public service, and the choices you make in the city.",
  },
  {
    title: "Connected city systems",
    icon: "city",
    text: "Jobs, businesses, vehicles, housing, banking, phones, activities, and crime are designed to support one shared roleplay world.",
  },
  {
    title: "Community shaped",
    icon: "sparkles",
    text: "Mystic Dreams grows with its players. Feedback, roleplay, events, and community ideas help shape what comes next.",
  },
  {
    title: "Serious without being rigid",
    icon: "gem",
    text: "We value believable characters and consequences while leaving room for creativity, humor, and memorable moments.",
  },
];

export const FEATURE_SECTIONS = [
  {
    title: "Law & Emergency Services",
    description:
      "BCSO, DOJ, St. Fierce Medical and LSMC, dispatch, radar, badges, prison systems, and advanced medical roleplay.",
    icon: "shield",
  },
  {
    title: "Businesses & Ownership",
    description:
      "Player-run restaurants, nightlife, shops, mechanics, dealerships, and services create places for characters to work, meet, and build stories.",
    icon: "store",
  },
  {
    title: "Civilian Economy",
    description:
      "Lumber, sanitation, security, taxi, bus, trucking, mining, diving, vineyard, recycling, newspaper routes, and other work feed a shared economy.",
    icon: "briefcase",
  },
  {
    title: "Vehicles & Customs",
    description:
      "A curated vehicle roster, mechanic businesses, dealerships, rentals, garages, and storage support a deep vehicle culture.",
    icon: "car",
  },
  {
    title: "Phone & Tablet",
    description:
      "In-city phone and tablet experiences connect daily life with communication, banking, food delivery, rentals, logistics, and other custom apps.",
    icon: "phone",
  },
  {
    title: "Activities & Social Life",
    description:
      "Casino games, carnival activities, fishing, hunting, golf, frisbee golf, yoga, racing, bowling, in-city TV, and more give characters reasons to live beyond work.",
    icon: "sparkles",
  },
  {
    title: "Crime & Underworld",
    description:
      "Gangs, drugs, contract heists, robberies, and black-market systems create risk, consequence, and long-running criminal stories.",
    icon: "mask",
  },
];

export const WHITELIST_STEPS = [
  {
    step: 1,
    icon: "discord",
    title: "Join Our Discord",
    description:
      "Join the Mystic Dreams community on Discord. Discord is required to play and is where whitelist information, updates, and support live.",
  },
  {
    step: 2,
    icon: "badge-check",
    title: "Apply for Whitelist",
    description:
      "Follow the whitelist instructions in Discord and receive the Citizen role — your keys to the city.",
  },
  {
    step: 3,
    icon: "gamepad",
    title: "Connect to FiveM",
    description:
      "Launch FiveM with Discord running. Our connection queue verifies your membership and Citizen role before you join.",
  },
];

export const CONNECT_STEPS = [
  {
    number: 1,
    title: "Install FiveM",
    description:
      "Download and install FiveM from fivem.net. You need a legitimate copy of GTA V.",
    icon: "download",
  },
  {
    number: 2,
    title: "Discord Required",
    description:
      "Keep Discord installed and running. Our queue verifies Discord membership and your Citizen whitelist role.",
    icon: "discord",
  },
  {
    number: 3,
    title: "Get Whitelisted",
    description:
      "Join Discord, complete the whitelist process, and receive the Citizen role before connecting.",
    icon: "key",
    link: { href: "/connect#whitelist", label: "Whitelist steps" },
  },
  {
    number: 4,
    title: "Find the Server",
    description: `Search for "${SITE.name}" in the FiveM server list, or use your direct connect link.`,
    icon: "city",
    connect: "play.mysticdreamsrp.online",
  },
];

export const HERO_TAGS = [
  { label: "Dedicated Staff", icon: "users" },
  { label: "Discord WL", icon: "discord" },
  { label: "Serious RP", icon: "gem" },
  { label: "Custom Economy", icon: "briefcase" },
];

export const STAT_ITEMS = [
  { value: String(SITE.maxSlots), label: "Player Slots", icon: "users" },
  { value: "30+", label: "Custom Systems", icon: "sparkles" },
  { value: "Discord", label: "Whitelist", icon: "discord" },
  { value: "24/7", label: "Community", icon: "city" },
];
