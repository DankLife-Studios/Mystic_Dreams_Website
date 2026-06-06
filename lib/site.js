export const SITE = {
    name: "Mystic Dreams RP",
    tagline: "Welcome Home",
    description:
        "Mystic Dreams RP — Welcome Home. Discord whitelist, 64 player slots, and 30+ custom systems built for serious roleplay. Law and EMS, whitelisted businesses, a deep civilian economy, phone and tablet apps, entertainment, and a full criminal underworld — all in one living city.",
    about:
        "Law & EMS: BCSO, DOJ, advanced medical at St. Fierce and LSMC, dispatch, radar, badges, and prison. Whitelisted businesses include Burgershot, UwU Café, Bean Machine, Pearls, Koi, Bahama Mamas, Vanilla Unicorn, Pizza This, Up-N-Atoms, Noir, White Widow, and a gun range. Civilian work spans lumberjack, garbage, Gruppe Sechs, window cleaning, taxi, bus, trucking, mining, diving, vineyard, recycle, and newspaper routes. Breakline Customs and Crusin Craftsmen mechanics, Vice Car Dealer, car rentals, housing, storage units, and banking. Phone and tablet with custom apps such as Chowhub, stock check, and rentals. Diamond Casino, carnival, fishing, hunting, golf, frisbee golf, yoga, racing, Vinewood Bowl, and in-city TV. Crime includes gangs, meth, cocaine, contract heists, ATM, store, and meter robberies, plus a black market.",
    discordInvite:
        process.env.NEXT_PUBLIC_DISCORD_INVITE || "https://discord.gg/wtJNvB3bSK",
    logoUrl:
        "https://r2.fivemanage.com/WD5BOqY7YF5rF3HB1Ff2m/mystic_logo.png",
    accent: "#a855f7",
    maxSlots: 64,
};

export const ABOUT_HIGHLIGHTS = [
    {
        title: "Law & EMS",
        icon: "shield",
        text: "BCSO, DOJ, St. Fierce & LSMC medical, dispatch, radar, badges, and prison.",
    },
    {
        title: "Businesses & Jobs",
        icon: "store",
        text: "Whitelisted restaurants, clubs, shops, gun range, and a full civilian job loop.",
    },
    {
        title: "City Life",
        icon: "sparkles",
        text: "Phone & tablet apps, casino, activities, housing, banking, and vehicle culture.",
    },
    {
        title: "Underworld",
        icon: "mask",
        text: "Gangs, drugs, heists, robberies, and a living black market economy.",
    },
];

export const FEATURE_SECTIONS = [
    {
        title: "Law & Emergency Services",
        description:
            "BCSO, DOJ, advanced medical at St. Fierce and LSMC, dispatch, radar, badges, and a full prison system.",
        icon: "shield",
    },
    {
        title: "Whitelisted Businesses",
        description:
            "Burgershot, UwU Café, Bean Machine, Pearls, Koi, Bahama Mamas, Vanilla Unicorn, Pizza This, Up-N-Atoms, Noir, White Widow, and a gun range.",
        icon: "store",
    },
    {
        title: "Civilian Economy",
        description:
            "Lumberjack, garbage, Gruppe Sechs, window cleaning, taxi, bus, trucking, mining, diving, vineyard, recycle, and newspaper routes.",
        icon: "briefcase",
    },
    {
        title: "Mechanics & Vehicles",
        description:
            "Breakline Customs, Crusin Craftsmen, Vice Car Dealer, car rentals, housing, storage units, and banking.",
        icon: "car",
    },
    {
        title: "Phone & Tablet",
        description:
            "In-city phone and tablet with custom apps including Chowhub, stock check, rentals, and more — woven into everyday RP.",
        icon: "phone",
    },
    {
        title: "Entertainment & Activities",
        description:
            "Diamond Casino, carnival, fishing, hunting, golf, frisbee golf, yoga, racing, Vinewood Bowl, and in-city TV.",
        icon: "sparkles",
    },
    {
        title: "Crime & Underworld",
        description:
            "Gangs, meth, cocaine, contract heists, ATM, store, and meter robberies, plus a thriving black market.",
        icon: "mask",
    },
];

export const WHITELIST_STEPS = [
    {
        step: 1,
        icon: "discord",
        title: "Join Our Discord",
        description:
            "Click the invite link and become part of the Mystic Dreams community. You need Discord to play on our server.",
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
    { label: "48 Slots", icon: "users" },
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
