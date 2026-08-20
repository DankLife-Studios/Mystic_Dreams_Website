/**
 * Business directory registry — edit enabled/location here, then redeploy.
 * jobKey must match qbx_core/shared/jobs.lua keys exactly.
 */

export const BUSINESS_CATEGORIES = [
    { id: "restaurants", label: "Dining & nightlife" },
    { id: "law", label: "Public safety" },
    { id: "mechanics", label: "Automotive & repair" },
    { id: "dealership", label: "Vehicle sales" },
    { id: "other", label: "City services" },
];

export const BUSINESSES = [
    {
        jobKey: "bahama",
        name: "Bahama Mamas",
        location: "Del Perro Beach",
        category: "restaurants",
        enabled: true,
        icon: "sparkles",
    },
    {
        jobKey: "beanmachine",
        name: "Bean Machine",
        location: "Legion Square",
        category: "restaurants",
        enabled: true,
        icon: "store",
    },
    {
        jobKey: "burgershot",
        name: "Burgershot",
        location: "Vespucci / Del Perro",
        category: "restaurants",
        enabled: true,
        icon: "store",
    },
    {
        jobKey: "cluckin",
        name: "Cluckin Bell",
        location: "Rockford Hills",
        category: "restaurants",
        enabled: true,
        icon: "store",
    },
    {
        jobKey: "hornys",
        name: "Horny's",
        location: "Little Seoul",
        category: "restaurants",
        enabled: true,
        icon: "store",
    },
    {
        jobKey: "koi",
        name: "Koi",
        location: "Little Seoul",
        category: "restaurants",
        enabled: true,
        icon: "store",
    },
    {
        jobKey: "noir",
        name: "Noir Cafe",
        location: "Rockford Hills",
        category: "restaurants",
        enabled: true,
        icon: "store",
    },
    {
        jobKey: "pearls",
        name: "Pearls",
        location: "Vespucci Canals",
        category: "restaurants",
        enabled: true,
        icon: "store",
    },
    {
        jobKey: "pizzathis",
        name: "Pizza This Pizzeria",
        location: "TBD",
        category: "restaurants",
        enabled: false,
        icon: "store",
    },
    {
        jobKey: "upnatoms",
        name: "Up N Atoms",
        location: "Sandy Shores",
        category: "restaurants",
        enabled: true,
        icon: "store",
    },
    {
        jobKey: "uwu",
        name: "Uwu Cafe",
        location: "West Vinewood",
        category: "restaurants",
        enabled: true,
        icon: "store",
    },
    {
        jobKey: "vanilla",
        name: "Vanilla Unicorn",
        location: "Strawberry",
        category: "restaurants",
        enabled: true,
        icon: "sparkles",
    },
    {
        jobKey: "police",
        name: "BCSO",
        location: "Blaine County Sheriff Office",
        category: "law",
        enabled: true,
        icon: "shield",
    },
    {
        jobKey: "ambulance",
        name: "EMS",
        location: "St. Fierce Hospital / LSMC",
        category: "law",
        enabled: true,
        icon: "ambulance",
    },
    {
        jobKey: "breakline",
        name: "Breakline Customs",
        location: "La Mesa",
        category: "mechanics",
        enabled: true,
        icon: "car",
    },
    {
        jobKey: "neptum",
        name: "Neptum Garage",
        location: "East Los Santos",
        category: "mechanics",
        enabled: true,
        icon: "car",
    },
    {
        jobKey: "vicecar",
        name: "Vice Car Dealer",
        location: "Pillbox Hill",
        category: "dealership",
        enabled: true,
        icon: "car",
    },
    {
        jobKey: "gunrange",
        name: "Shooting Range",
        location: "Cypress Flats",
        category: "other",
        enabled: true,
        icon: "shield",
    },
];

export function getEnabledBusinesses() {
    return BUSINESSES.filter((b) => b.enabled);
}

export function getEnabledJobKeys() {
    return getEnabledBusinesses().map((b) => b.jobKey);
}

export function getBusinessByJobKey(jobKey) {
    return BUSINESSES.find((b) => b.jobKey === jobKey) || null;
}

export function getCategoryLabel(categoryId) {
    return (
        BUSINESS_CATEGORIES.find((c) => c.id === categoryId)?.label || categoryId
    );
}
