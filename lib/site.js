export const SITE = {
    name: "Mystic Dreams RP",
    tagline: "Built for Roleplay",
    description:
        "Mystic Dreams RP — a whitelisted FiveM community with 64 slots, 30+ handcrafted systems, custom MLO interiors, and hundreds of custom vehicles. Serious roleplay, real consequences, and a city that never sleeps.",
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
            "BCSO with custom liveries, DOJ, St. Fierce Medical & LSMC with advanced hospital MLOs, in-depth dispatch system, radar, badge system, and a full prison with working cells.",
        icon: "shield",
    },
    {
        title: "Whitelisted Businesses",
        description:
            "Burgershot, UwU Café, Bean Machine, Pearls, Koi, Bahama Mamas, Vanilla Unicorn, Pizza This, Up-N-Atoms, Noir, White Widow, and a gun range — all with custom MLO interiors and owner-operated.",
        icon: "store",
    },
    {
        title: "Civilian Economy",
        description:
            "Lumberjack, garbage collection, Gruppe Sechs, window cleaning, taxi, bus, trucking, mining, diving, vineyard, recycling, and newspaper routes. Every job feeds the economy.",
        icon: "briefcase",
    },
    {
        title: "Mechanics & Vehicle Culture",
        description:
            "Breakline Customs & Crusin Craftsmen with custom mechanic MLOs, Vice Car Dealer, rentals, housing, storage units, and hundreds of custom vehicles from classic muscle to modern imports.",
        icon: "car",
    },
    {
        title: "Phone & Tablet Apps",
        description:
            "Fully custom in-city phone and tablet with apps like Chowhub, stock market, vehicle rentals, banking, and more — all seamlessly woven into daily roleplay.",
        icon: "phone",
    },
    {
        title: "Entertainment & Activities",
        description:
            "Diamond Casino with custom interior, carnival, fishing, hunting, golf, frisbee golf, yoga, street racing, Vinewood Bowl, and in-city TV — boredom doesn't exist here.",
        icon: "sparkles",
    },
    {
        title: "Crime & Underworld",
        description:
            "Gang territories, meth labs, cocaine operations, contract heists, ATM & store robberies, meter theft, and a thriving black market — high risk, high reward.",
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
