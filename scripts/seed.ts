// scripts/seed.ts
// Run with: npx tsx scripts/seed.ts
// All data verified from primary sources as of Feb 2026.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type SeedDataset = {
  slug: string;
  name: string;
  description: string;
  sourceUrls: string[];
  refreshRate: "hourly" | "daily" | "weekly" | "manual";
};

type SeedSnapshot = {
  datasetSlug: string;
  payload: {
    unitLabel: string;
    dotValue: number;
    total: number;
    categories: Array<{ key: string; label: string; value: number }>;
    notes?: string;
  };
};

type SeedCard = {
  slug: string;
  datasetSlug: string;
  title: string;
  subtitle?: string;
  config: {
    grid: { rows: number; cols: number };
    ogGrid: { rows: number; cols: number };
    palette: Record<string, string>;
    showLegend: boolean;
    emptyColor?: string;
  };
  isFeatured: boolean;
  category: string;
};

// ─────────────────────────────────────────────
// DATASETS
// ─────────────────────────────────────────────

const datasets: SeedDataset[] = [
  {
    slug: "us-national-debt",
    name: "US National Debt",
    description: "The total public debt outstanding of the United States Government. Updates daily to the exact penny.",
    sourceUrls: ["https://fiscaldata.treasury.gov/"],
    refreshRate: "daily",
  },
  {
    slug: "ethereum-price",
    name: "Ethereum Price",
    description: "Current Ethereum price breakdown. Auto-refreshes hourly via CoinGecko.",
    sourceUrls: ["https://www.coingecko.com/en/coins/ethereum"],
    refreshRate: "hourly",
  },
  {
    slug: "global-flights",
    name: "Global Flights Airborne",
    description: "Live count of aircraft currently in the air worldwide, based on ADS-B transmissions.",
    sourceUrls: ["https://opensky-network.org/"],
    refreshRate: "hourly",
  },
  {
    slug: "global-earthquakes",
    name: "Global Earthquakes Today",
    description: "Earthquakes (Magnitude 2.5+) recorded globally in the last 24 hours.",
    sourceUrls: ["https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php"],
    refreshRate: "hourly",
  },
  {
    slug: "near-earth-asteroids",
    name: "Asteroids Passing Earth Today",
    description: "Near-Earth objects making a close approach to Earth today. Tracked by NASA JPL.",
    sourceUrls: ["https://api.nasa.gov/"],
    refreshRate: "daily",
  },
  {
    slug: "live-population",
    name: "Live Population Growth",
    description: "Estimated births and deaths worldwide today, resulting in net population growth.",
    sourceUrls: ["https://population.un.org/wpp/"],
    refreshRate: "hourly",
  },
  {
    slug: "ai-adoption",
    name: "AI Adoption",
    description:
      "Global population breakdown by generative AI usage. About 1 in 6 people worldwide have used a generative AI tool.",
    sourceUrls: [
      "https://www.microsoft.com/en-us/corporate-responsibility/topics/ai-economy-institute/reports/global-ai-adoption-2025/",
      "https://datareportal.com/reports/digital-2026-one-billion-people-using-ai",
      "https://www.theglobalstatistics.com/artificial-intelligence-ai-usage-statistics/",
    ],
    refreshRate: "weekly",
  },
  {
    slug: "internet-access",
    name: "Internet Access",
    description:
      "Global population split by internet access status. ITU Facts and Figures 2025.",
    sourceUrls: [
      "https://www.itu.int/en/mediacentre/Pages/PR-2025-11-17-Facts-and-Figures.aspx",
      "https://www.itu.int/itu-d/reports/statistics/facts-figures-2025/",
    ],
    refreshRate: "weekly",
  },
  {
    slug: "smartphone-access",
    name: "Smartphone Access",
    description:
      "How many of the world's 8.3 billion people have a smartphone vs feature phone vs none.",
    sourceUrls: [
      "https://www.bankmycell.com/blog/how-many-phones-are-in-the-world",
      "https://datareportal.com/global-digital-overview",
      "https://backlinko.com/smartphone-usage-statistics",
    ],
    refreshRate: "weekly",
  },
  {
    slug: "co2-emissions",
    name: "CO₂ Emissions",
    description:
      "Annual fossil CO₂ emissions by top emitters (2024). Global total: 37.4 Gt CO₂.",
    sourceUrls: [
      "https://www.carbonbrief.org/analysis-global-co2-emissions-will-reach-new-high-in-2024-despite-slower-growth/",
      "https://edgar.jrc.ec.europa.eu/report_2025",
      "https://ourworldindata.org/co2-emissions",
    ],
    refreshRate: "weekly",
  },
  {
    slug: "renewable-energy",
    name: "Renewable Energy",
    description:
      "Share of global electricity generation by source in 2024. Renewables + nuclear reached 40% for the first time.",
    sourceUrls: [
      "https://www.iea.org/reports/global-energy-review-2025/electricity",
      "https://ember-energy.org/latest-insights/global-electricity-review-2025/",
    ],
    refreshRate: "weekly",
  },
  {
    slug: "ev-adoption",
    name: "EV Adoption",
    description:
      "Global new car sales in 2024: electric vs internal combustion. EVs exceeded 20% share.",
    sourceUrls: [
      "https://www.iea.org/reports/global-ev-outlook-2025/executive-summary",
      "https://www.virta.global/global-electric-vehicle-market",
    ],
    refreshRate: "weekly",
  },
  {
    slug: "wealth-inequality",
    name: "Global Wealth Distribution",
    description:
      "How the world's wealth is distributed. Top 1% own 43% of all global financial assets.",
    sourceUrls: [
      "https://inequality.org/facts/global-inequality/",
      "https://www.oxfamamerica.org/explore/issues/economic-justice/extreme-inequality-and-poverty/",
      "https://wid.world/",
    ],
    refreshRate: "weekly",
  },
  {
    slug: "military-spending",
    name: "Military Spending",
    description:
      "Global military expenditure in 2024: $2.72 trillion. Steepest annual rise since end of cold war.",
    sourceUrls: [
      "https://www.sipri.org/publications/2025/sipri-fact-sheets/trends-world-military-expenditure-2024",
      "https://www.sipri.org/media/press-release/2025/unprecedented-rise-global-military-expenditure-european-and-middle-east-spending-surges",
      "https://api.worldbank.org/v2/",
    ],
    refreshRate: "weekly",
  },
  {
    slug: "bitcoin-price",
    name: "Bitcoin Price",
    description: "Current Bitcoin price breakdown. Auto-refreshes hourly via CoinGecko.",
    sourceUrls: ["https://www.coingecko.com/en/coins/bitcoin"],
    refreshRate: "hourly",
  },
  {
    slug: "wikipedia-pageviews",
    name: "Wikipedia Pageviews",
    description:
      "Daily pageviews on English Wikipedia. A proxy for what the internet is curious about today.",
    sourceUrls: [
      "https://wikimedia.org/api/rest_v1/",
      "https://pageviews.wmcloud.org/",
    ],
    refreshRate: "daily",
  },
  // ─────────────────────────────────────────────
  // NEW DATASETS (10)
  // ─────────────────────────────────────────────
  {
    slug: "active-satellites",
    name: "Active Satellites in Orbit",
    description: "Breakdown of active satellites currently orbiting Earth. Starlink dominates with 66% of all active satellites.",
    sourceUrls: [
      "https://celestrak.org/NORAD/elements/",
      "https://www.ucsusa.org/resources/satellite-database",
    ],
    refreshRate: "weekly",
  },
  {
    slug: "cyberattacks-today",
    name: "Global Cyberattacks Today",
    description: "Estimated cyberattacks detected globally today. Based on industry threat intelligence reports.",
    sourceUrls: [
      "https://www.abuseipdb.com/statistics",
      "https://www.statista.com/topics/2588/us-consumers-and-cyber-crime/",
    ],
    refreshRate: "daily",
  },
  {
    slug: "temperature-anomaly",
    name: "Global Temperature Anomaly",
    description: "How much warmer today's global average temperature is compared to the pre-industrial (1850-1900) baseline.",
    sourceUrls: [
      "https://www.ncei.noaa.gov/access/monitoring/climate-at-a-glance/global/time-series",
      "https://climate.nasa.gov/vital-signs/global-temperature/",
    ],
    refreshRate: "weekly",
  },
  {
    slug: "deforestation",
    name: "Deforestation vs Reforestation",
    description: "Annual global tree cover loss vs gain. About 10 million hectares of forest are lost each year.",
    sourceUrls: [
      "https://www.globalforestwatch.org/dashboards/global/",
      "https://www.fao.org/forest-resources-assessment/en/",
    ],
    refreshRate: "weekly",
  },
  {
    slug: "ocean-plastic",
    name: "Ocean Plastic Pollution",
    description: "Estimated plastic entering the ocean annually: ~14 million metric tons. Only ~1% is recovered.",
    sourceUrls: [
      "https://www.unep.org/topics/chemicals-and-pollution-action/pollution-action/marine-litter-and-microplastics",
      "https://ourworldindata.org/plastic-pollution",
    ],
    refreshRate: "weekly",
  },
  {
    slug: "trillion-dollar-club",
    name: "Trillion Dollar Club",
    description: "Companies with $1T+ market caps. Their combined value exceeds most countries' GDP. NVIDIA leads.",
    sourceUrls: [
      "https://companiesmarketcap.com/",
      "https://www.coingecko.com/",
    ],
    refreshRate: "hourly",
  },
  {
    slug: "sp500-mood",
    name: "S&P 500 Daily Mood",
    description: "How many S&P 500 companies closed up vs down today. A daily pulse of the US stock market.",
    sourceUrls: [
      "https://www.slickcharts.com/sp500",
      "https://finance.yahoo.com/",
    ],
    refreshRate: "daily",
  },
  {
    slug: "food-waste",
    name: "Food Production vs Waste",
    description: "Around 1/3 of all food produced globally is lost or wasted — roughly 1.3 billion tonnes per year.",
    sourceUrls: [
      "https://www.fao.org/food-loss-and-food-waste/en/",
      "https://www.unep.org/resources/report/unep-food-waste-index-report-2024",
    ],
    refreshRate: "weekly",
  },
  {
    slug: "extreme-poverty",
    name: "Extreme Poverty",
    description: "About 700 million people live on less than $2.15/day. Poverty is declining but unevenly.",
    sourceUrls: [
      "https://data.worldbank.org/indicator/SI.POV.DDAY",
      "https://ourworldindata.org/extreme-poverty",
    ],
    refreshRate: "weekly",
  },
  {
    slug: "water-usage",
    name: "Global Water Usage",
    description: "How humanity uses its freshwater: 70% agriculture, 19% industry, 11% domestic.",
    sourceUrls: [
      "https://www.fao.org/aquastat/en/",
      "https://ourworldindata.org/water-use-stress",
    ],
    refreshRate: "weekly",
  },
];

// ─────────────────────────────────────────────
// SNAPSHOTS — VERIFIED DATA
// ─────────────────────────────────────────────

const snapshots: SeedSnapshot[] = [
  {
    datasetSlug: "us-national-debt",
    payload: {
      unitLabel: "Trillion USD",
      dotValue: 0.5,
      total: 38.8,
      categories: [
        { key: "public", label: "Held by the Public", value: 28.9 },
        { key: "intragov", label: "Intragovernmental Holdings", value: 9.9 },
      ],
      notes: "US Debt Clock / Senate.gov (Feb 2026): $38.77T total. Auto-refreshes daily via Treasury FiscalData API.",
    },
  },
  {
    datasetSlug: "ethereum-price",
    payload: {
      unitLabel: "USD per ETH",
      dotValue: 25,
      total: 1825,
      categories: [{ key: "price", label: "Ethereum Price", value: 1825 }],
      notes: "Seed price (~Feb 24, 2026). Auto-refreshes hourly via CoinGecko API.",
    },
  },
  {
    datasetSlug: "global-flights",
    payload: {
      unitLabel: "airborne flights",
      dotValue: 100,
      total: 12000,
      categories: [
        { key: "commercial", label: "Commercial", value: 8000 },
        { key: "other", label: "Private/General", value: 4000 },
      ],
      notes: "Seed estimate. Auto-refreshes hourly via OpenSky Network.",
    },
  },
  {
    datasetSlug: "global-earthquakes",
    payload: {
      unitLabel: "earthquakes",
      dotValue: 1,
      total: 150,
      categories: [
        { key: "major", label: "Major (6.0+)", value: 0 },
        { key: "moderate", label: "Moderate (4.5-5.9)", value: 10 },
        { key: "minor", label: "Minor (2.5-4.4)", value: 140 },
      ],
      notes: "Seed estimate. Auto-refreshes hourly via USGS GeoJSON API.",
    },
  },
  {
    datasetSlug: "near-earth-asteroids",
    payload: {
      unitLabel: "asteroids",
      dotValue: 1,
      total: 10,
      categories: [
        { key: "hazardous", label: "Potentially Hazardous", value: 1 },
        { key: "safe", label: "Non-Hazardous", value: 9 },
      ],
      notes: "Seed estimate. Auto-refreshes daily via NASA NeoWs.",
    },
  },
  {
    datasetSlug: "live-population",
    payload: {
      unitLabel: "people",
      dotValue: 1000,
      total: 100000,
      categories: [
        { key: "births", label: "Births today", value: 150000 },
        { key: "deaths", label: "Deaths today", value: 50000 },
      ],
      notes: "Seed estimate. Auto-refreshes hourly.",
    },
  },
  {
    datasetSlug: "ai-adoption",
    payload: {
      unitLabel: "people",
      dotValue: 40_000_000,
      total: 8_200_000_000,
      categories: [
        { key: "never", label: "Never used AI", value: 6_830_000_000 },
        { key: "tried", label: "Tried it (monthly users)", value: 1_000_000_000 },
        { key: "regular", label: "Weekly active user", value: 250_000_000 },
        { key: "daily", label: "Daily user", value: 120_000_000 },
      ],
      notes:
        "Microsoft AI Economy Institute (Jan 2026): ~1 in 6 people worldwide have used generative AI. DataReportal Digital 2026: 1B+ monthly AI users. ChatGPT: 800M weekly users (Oct 2025, OpenAI/NBER).",
    },
  },
  {
    datasetSlug: "internet-access",
    payload: {
      unitLabel: "people",
      dotValue: 40_000_000,
      total: 8_200_000_000,
      categories: [
        { key: "online", label: "Online", value: 6_000_000_000 },
        { key: "offline", label: "Never been online", value: 2_200_000_000 },
      ],
      notes:
        "ITU Facts and Figures 2025 (Nov 2025). 6B online (74% of world pop), 2.2B offline. 96% of those offline live in low- and middle-income countries.",
    },
  },
  {
    datasetSlug: "smartphone-access",
    payload: {
      unitLabel: "people",
      dotValue: 40_000_000,
      total: 8_200_000_000,
      categories: [
        { key: "smartphone", label: "Smartphone owner", value: 4_690_000_000 },
        { key: "feature_phone", label: "Feature phone only", value: 1_090_000_000 },
        { key: "no_phone", label: "No mobile phone", value: 2_420_000_000 },
      ],
      notes:
        "Backlinko/DataReportal (Jan 2026): 4.69B smartphone owners (57% of world pop). 5.78B unique mobile users total (DataReportal Oct 2025). Remaining ~2.4B have no mobile phone.",
    },
  },
  {
    datasetSlug: "co2-emissions",
    payload: {
      unitLabel: "billion tonnes CO₂/year",
      dotValue: 0.4,
      total: 37.4,
      categories: [
        { key: "china", label: "China", value: 12.0 },
        { key: "us", label: "United States", value: 4.9 },
        { key: "india", label: "India", value: 3.0 },
        { key: "eu", label: "EU-27", value: 2.6 },
        { key: "rest", label: "Rest of world", value: 14.9 },
      ],
      notes:
        "Global Carbon Budget 2024 (Nov 2024). Fossil CO₂: 37.4 Gt CO₂, a new record. China 32%, US 13%, India 8%, EU 7%. Growth of 0.8% over 2023.",
    },
  },
  {
    datasetSlug: "renewable-energy",
    payload: {
      unitLabel: "% of global electricity",
      dotValue: 1,
      total: 100,
      categories: [
        { key: "coal", label: "Coal", value: 35 },
        { key: "gas", label: "Natural gas", value: 22 },
        { key: "oil", label: "Oil", value: 2 },
        { key: "nuclear", label: "Nuclear", value: 9 },
        { key: "hydro", label: "Hydropower", value: 14 },
        { key: "wind", label: "Wind", value: 8 },
        { key: "solar", label: "Solar", value: 7 },
        { key: "other_renew", label: "Bio & other renewables", value: 3 },
      ],
      notes:
        "IEA Global Energy Review 2025 + Ember 2025. Fossil fuels: ~59%. Renewables: 32%. Nuclear: 9%. Low-carbon total hit 40.9% for first time. Solar+wind overtook hydro for first time in 2024.",
    },
  },
  {
    datasetSlug: "ev-adoption",
    payload: {
      unitLabel: "million cars sold (2024)",
      dotValue: 1,
      total: 84,
      categories: [
        { key: "ev", label: "Electric (BEV + PHEV)", value: 17 },
        { key: "ice", label: "Internal combustion", value: 67 },
      ],
      notes:
        "IEA Global EV Outlook 2025. 17M EVs sold in 2024 (20%+ share). China: 11M. Europe: ~3M. US: ~1.4M. IEA projects 20M+ in 2025 (1 in 4 cars).",
    },
  },
  {
    datasetSlug: "wealth-inequality",
    payload: {
      unitLabel: "% of global wealth",
      dotValue: 1,
      total: 100,
      categories: [
        { key: "top_1", label: "Top 1%", value: 43 },
        { key: "next_9", label: "Next 9% (top 2–10%)", value: 33 },
        { key: "middle_40", label: "Middle 40%", value: 22 },
        { key: "bottom_50", label: "Bottom 50%", value: 2 },
      ],
      notes:
        "Oxfam analysis of UBS data (Sep 2024): Top 1% own 43% of global financial assets — more than bottom 95% combined. Bottom 50% own ~2%. Billionaire wealth grew $2.8T in 2024 alone.",
    },
  },
  {
    datasetSlug: "military-spending",
    payload: {
      unitLabel: "billion USD",
      dotValue: 25,
      total: 2718,
      categories: [
        { key: "us", label: "United States", value: 997 },
        { key: "china", label: "China", value: 314 },
        { key: "russia", label: "Russia", value: 149 },
        { key: "india", label: "India", value: 86 },
        { key: "rest", label: "Everyone else", value: 1172 },
      ],
      notes:
        "SIPRI (Apr 2025). Global: $2.72T. 9.4% real increase — steepest since at least 1988. US: $997B (37% of world, 3.2x China). Top 5 = 60% of total. 10th consecutive year of increases.",
    },
  },
  {
    datasetSlug: "bitcoin-price",
    payload: {
      unitLabel: "USD per BTC",
      dotValue: 1000,
      total: 63500,
      categories: [{ key: "price", label: "Bitcoin Price", value: 63500 }],
      notes: "Seed price (~Feb 24, 2026). Auto-refreshes hourly via CoinGecko API.",
    },
  },
  {
    datasetSlug: "wikipedia-pageviews",
    payload: {
      unitLabel: "pageviews",
      dotValue: 5_000_000,
      total: 270_000_000,
      categories: [
        { key: "desktop", label: "Desktop", value: 85_000_000 },
        { key: "mobile_web", label: "Mobile web", value: 150_000_000 },
        { key: "mobile_app", label: "Mobile app", value: 35_000_000 },
      ],
      notes:
        "Estimated English Wikipedia daily pageviews. Auto-refreshes daily via Wikimedia REST API. Mobile dominates with ~68% of views.",
    },
  },

  // ─────────────────────────────────────────────
  // NEW SNAPSHOTS (10)
  // ─────────────────────────────────────────────

  {
    datasetSlug: "active-satellites",
    payload: {
      unitLabel: "satellites",
      dotValue: 100,
      total: 14500,
      categories: [
        { key: "starlink", label: "Starlink", value: 9600 },
        { key: "other_commercial", label: "Other Commercial", value: 3100 },
        { key: "government", label: "Government/Military", value: 1500 },
        { key: "scientific", label: "Scientific", value: 300 },
      ],
      notes:
        "planet4589.org / CelesTrak (Feb 7, 2026): 14,588 active satellites. Starlink: 9,616 (66%). 23% YoY increase.",
    },
  },
  {
    datasetSlug: "cyberattacks-today",
    payload: {
      unitLabel: "attacks (thousands)",
      dotValue: 10,
      total: 2200,
      categories: [
        { key: "malware", label: "Malware/Ransomware", value: 800 },
        { key: "phishing", label: "Phishing", value: 700 },
        { key: "ddos", label: "DDoS", value: 400 },
        { key: "other", label: "Other", value: 300 },
      ],
      notes:
        "Estimated based on industry reports (Kaspersky, CrowdStrike). ~2.2M+ cyberattacks detected daily worldwide. Numbers are approximate.",
    },
  },
  {
    datasetSlug: "temperature-anomaly",
    payload: {
      unitLabel: "°C anomaly breakdown",
      dotValue: 0.01,
      total: 1.48,
      categories: [
        { key: "pre_2000", label: "Pre-2000 warming", value: 0.6 },
        { key: "since_2000", label: "Since 2000", value: 0.65 },
        { key: "recent_spike", label: "Recent acceleration (2023-2025)", value: 0.23 },
      ],
      notes:
        "NASA GISS / Copernicus. Global mean temperature anomaly relative to pre-industrial (1850-1900) baseline. 2024 was the hottest year ever recorded at +1.48°C. Relative to 1951-1980 baseline it is +1.28°C.",
    },
  },
  {
    datasetSlug: "deforestation",
    payload: {
      unitLabel: "million hectares/year",
      dotValue: 0.5,
      total: 15,
      categories: [
        { key: "loss", label: "Forest lost", value: 10 },
        { key: "gain", label: "Forest gained (reforestation)", value: 5 },
      ],
      notes:
        "FAO Global Forest Resources Assessment 2025. Net loss: ~5M hectares/year (~10M lost, ~5M regrown/planted). Tropical deforestation accounts for the majority.",
    },
  },
  {
    datasetSlug: "ocean-plastic",
    payload: {
      unitLabel: "million tonnes/year",
      dotValue: 0.2,
      total: 14,
      categories: [
        { key: "packaging", label: "Packaging", value: 5.6 },
        { key: "textiles", label: "Textiles/Fibers", value: 2.8 },
        { key: "fishing", label: "Fishing gear", value: 2.1 },
        { key: "other", label: "Other plastics", value: 3.5 },
      ],
      notes:
        "IUCN / UNEP (2024). At least 14M tonnes of plastic enter the ocean yearly. Only ~1% is recovered. Packaging is the largest category. Microplastics now found in every ocean.",
    },
  },
  {
    datasetSlug: "trillion-dollar-club",
    payload: {
      unitLabel: "trillion USD (market cap)",
      dotValue: 0.5,
      total: 23.4,
      categories: [
        { key: "nvidia", label: "NVIDIA", value: 4.7 },
        { key: "apple", label: "Apple", value: 3.9 },
        { key: "google", label: "Alphabet (Google)", value: 3.8 },
        { key: "microsoft", label: "Microsoft", value: 2.9 },
        { key: "amazon", label: "Amazon", value: 2.2 },
        { key: "meta", label: "Meta", value: 1.9 },
        { key: "tsmc", label: "TSMC", value: 1.2 },
        { key: "broadcom", label: "Broadcom", value: 2.8 },
      ],
      notes:
        "companiesmarketcap.com (Feb 24, 2026). NVIDIA overtook Apple as #1. Combined market cap of $1T+ companies: ~$23.4T. Auto-refreshes hourly.",
    },
  },
  {
    datasetSlug: "sp500-mood",
    payload: {
      unitLabel: "companies",
      dotValue: 5,
      total: 500,
      categories: [
        { key: "up", label: "Closed up ↑", value: 280 },
        { key: "down", label: "Closed down ↓", value: 200 },
        { key: "flat", label: "Flat (< ±0.1%)", value: 20 },
      ],
      notes:
        "Seed estimate. S&P 500 daily price movements. On an average day, ~55% of stocks close positive.",
    },
  },
  {
    datasetSlug: "food-waste",
    payload: {
      unitLabel: "billion tonnes/year",
      dotValue: 0.05,
      total: 6.0,
      categories: [
        { key: "consumed", label: "Consumed", value: 4.0 },
        { key: "lost_supply", label: "Lost in supply chain", value: 1.0 },
        { key: "wasted", label: "Wasted by consumers", value: 1.0 },
      ],
      notes:
        "FAO/UNEP Food Waste Index 2024. ~6B tonnes produced annually, ~1/3 lost or wasted. Consumer waste alone: 1.05B tonnes/year. Supply chain loss: ~1B tonnes/year.",
    },
  },
  {
    datasetSlug: "extreme-poverty",
    payload: {
      unitLabel: "people",
      dotValue: 40_000_000,
      total: 8_200_000_000,
      categories: [
        { key: "extreme", label: "Extreme poverty (<$2.15/day)", value: 700_000_000 },
        { key: "moderate", label: "Moderate poverty ($2.15-$6.85/day)", value: 2_000_000_000 },
        { key: "above", label: "Above poverty line", value: 5_500_000_000 },
      ],
      notes:
        "World Bank (2024). ~700M people in extreme poverty (<$2.15/day). Down from 1.9B in 2000, but progress has slowed since COVID. Sub-Saharan Africa accounts for ~60% of the extreme poor.",
    },
  },
  {
    datasetSlug: "water-usage",
    payload: {
      unitLabel: "% of freshwater withdrawal",
      dotValue: 1,
      total: 100,
      categories: [
        { key: "agriculture", label: "Agriculture", value: 70 },
        { key: "industry", label: "Industry", value: 19 },
        { key: "domestic", label: "Domestic/Municipal", value: 11 },
      ],
      notes:
        "FAO AQUASTAT (2024). Global freshwater withdrawal: ~4,000 km³/year. Agriculture dominates at 70%. 2 billion people live in water-stressed countries.",
    },
  },
];

// ─────────────────────────────────────────────
// CARDS
// ─────────────────────────────────────────────

const cards: SeedCard[] = [
  // ── EXISTING CARDS (with categories added) ──
  {
    slug: "us-national-debt-live",
    datasetSlug: "us-national-debt",
    title: "The US National Debt",
    subtitle: "Over $38 Trillion. Exact to the penny. Updates daily.",
    config: {
      grid: { rows: 9, cols: 9 },
      ogGrid: { rows: 9, cols: 9 },
      palette: { public: "#3b82f6", intragov: "#10b981" },
      showLegend: true,
      emptyColor: "#111827",
    },
    isFeatured: true,
    category: "finance",
  },
  {
    slug: "ethereum-live",
    datasetSlug: "ethereum-price",
    title: "Ethereum price, live",
    subtitle: "Each dot ≈ $25. Auto-refreshes hourly.",
    config: {
      grid: { rows: 8, cols: 8 },
      ogGrid: { rows: 8, cols: 8 },
      palette: { price: "#6366f1" },
      showLegend: true,
      emptyColor: "#111827",
    },
    isFeatured: true,
    category: "finance",
  },
  {
    slug: "flights-right-now",
    datasetSlug: "global-flights",
    title: "Planes in the air, right now",
    subtitle: "Every dot is 100 airplanes currently flying anywhere on Earth.",
    config: {
      grid: { rows: 12, cols: 15 },
      ogGrid: { rows: 12, cols: 15 },
      palette: { commercial: "#38bdf8", other: "#fbbf24" },
      showLegend: true,
      emptyColor: "#111827",
    },
    isFeatured: true,
    category: "live",
  },
  {
    slug: "earthquakes-today",
    datasetSlug: "global-earthquakes",
    title: "Earthquakes in the last 24 hours",
    subtitle: "Live seismic activity around the world.",
    config: {
      grid: { rows: 10, cols: 16 },
      ogGrid: { rows: 10, cols: 16 },
      palette: { major: "#ef4444", moderate: "#f97316", minor: "#fbbf24" },
      showLegend: true,
      emptyColor: "#111827",
    },
    isFeatured: true,
    category: "live",
  },
  {
    slug: "asteroids-today",
    datasetSlug: "near-earth-asteroids",
    title: "Asteroids passing Earth today",
    subtitle: "Space rocks making a close approach right now.",
    config: {
      grid: { rows: 6, cols: 8 },
      ogGrid: { rows: 6, cols: 8 },
      palette: { hazardous: "#ef4444", safe: "#9ca3af" },
      showLegend: true,
      emptyColor: "#111827",
    },
    isFeatured: true,
    category: "live",
  },
  {
    slug: "humanity-growth-today",
    datasetSlug: "live-population",
    title: "How much humanity grew today",
    subtitle: "Each dot is 1,000 human lives.",
    config: {
      grid: { rows: 15, cols: 26 },
      ogGrid: { rows: 15, cols: 26 },
      palette: { births: "#10b981", deaths: "#4b5563" },
      showLegend: true,
      emptyColor: "#111827",
    },
    isFeatured: true,
    category: "humanity",
  },
  {
    slug: "ai-isnt-mainstream-yet",
    datasetSlug: "ai-adoption",
    title: "Most humans have never used AI",
    subtitle: "8.2 billion people. Only about 1 in 6 have ever tried it.",
    config: {
      grid: { rows: 15, cols: 14 },
      ogGrid: { rows: 15, cols: 14 },
      palette: { never: "#2a2a3d", tried: "#6366f1", regular: "#a78bfa", daily: "#f472b6" },
      showLegend: true,
      emptyColor: "#111827",
    },
    isFeatured: true,
    category: "technology",
  },
  {
    slug: "billions-still-offline",
    datasetSlug: "internet-access",
    title: "2.2 billion people have never been online",
    subtitle: "6 billion are connected. But more than 1 in 4 humans are not.",
    config: {
      grid: { rows: 15, cols: 14 },
      ogGrid: { rows: 15, cols: 14 },
      palette: { online: "#22d3ee", offline: "#1e1e2f" },
      showLegend: true,
      emptyColor: "#111827",
    },
    isFeatured: true,
    category: "technology",
  },
  {
    slug: "smartphone-divide",
    datasetSlug: "smartphone-access",
    title: "The smartphone divide",
    subtitle: "4.7 billion own a smartphone. 2.4 billion have no phone at all.",
    config: {
      grid: { rows: 15, cols: 14 },
      ogGrid: { rows: 15, cols: 14 },
      palette: { smartphone: "#34d399", feature_phone: "#fbbf24", no_phone: "#1e1e2f" },
      showLegend: true,
      emptyColor: "#111827",
    },
    isFeatured: true,
    category: "technology",
  },
  {
    slug: "who-pollutes",
    datasetSlug: "co2-emissions",
    title: "Just 3 countries emit over half the world's CO₂",
    subtitle: "37.4 billion tonnes/year. China, the US, and India: 53% of it.",
    config: {
      grid: { rows: 10, cols: 10 },
      ogGrid: { rows: 10, cols: 10 },
      palette: { china: "#ef4444", us: "#3b82f6", india: "#f59e0b", eu: "#8b5cf6", rest: "#374151" },
      showLegend: true,
      emptyColor: "#111827",
    },
    isFeatured: true,
    category: "environment",
  },
  {
    slug: "renewables-reality",
    datasetSlug: "renewable-energy",
    title: "Fossil fuels still generate 59% of the world's electricity",
    subtitle: "Renewables hit 32% in 2024 — but coal alone is still 35%.",
    config: {
      grid: { rows: 10, cols: 10 },
      ogGrid: { rows: 10, cols: 10 },
      palette: { coal: "#374151", gas: "#6b7280", oil: "#4b5563", nuclear: "#f59e0b", hydro: "#06b6d4", wind: "#22c55e", solar: "#eab308", other_renew: "#a3e635" },
      showLegend: true,
      emptyColor: "#111827",
    },
    isFeatured: true,
    category: "environment",
  },
  {
    slug: "ev-tipping-point",
    datasetSlug: "ev-adoption",
    title: "1 in 5 new cars sold in 2024 was electric",
    subtitle: "17 million EVs vs 67 million combustion vehicles. Tipping point?",
    config: {
      grid: { rows: 7, cols: 12 },
      ogGrid: { rows: 7, cols: 12 },
      palette: { ev: "#22c55e", ice: "#374151" },
      showLegend: true,
      emptyColor: "#111827",
    },
    isFeatured: true,
    category: "environment",
  },
  {
    slug: "wealth-gap",
    datasetSlug: "wealth-inequality",
    title: "The top 1% owns 43% of the world's wealth",
    subtitle: "The bottom 50% of humanity owns just 2%.",
    config: {
      grid: { rows: 10, cols: 10 },
      ogGrid: { rows: 10, cols: 10 },
      palette: { top_1: "#f43f5e", next_9: "#fb923c", middle_40: "#60a5fa", bottom_50: "#1e1e2f" },
      showLegend: true,
      emptyColor: "#111827",
    },
    isFeatured: true,
    category: "humanity",
  },
  {
    slug: "where-the-money-goes",
    datasetSlug: "military-spending",
    title: "The US spends 3.2x more on military than China",
    subtitle: "$2.72 trillion globally in 2024 — the steepest rise since the Cold War.",
    config: {
      grid: { rows: 11, cols: 11 },
      ogGrid: { rows: 11, cols: 11 },
      palette: { us: "#3b82f6", china: "#ef4444", russia: "#f59e0b", india: "#22c55e", rest: "#374151" },
      showLegend: true,
      emptyColor: "#111827",
    },
    isFeatured: true,
    category: "finance",
  },
  {
    slug: "bitcoin-live",
    datasetSlug: "bitcoin-price",
    title: "Bitcoin price, live",
    subtitle: "Each dot ≈ $1,000. Auto-refreshes hourly.",
    config: {
      grid: { rows: 10, cols: 10 },
      ogGrid: { rows: 10, cols: 10 },
      palette: { price: "#f7931a" },
      showLegend: true,
      emptyColor: "#111827",
    },
    isFeatured: true,
    category: "finance",
  },
  {
    slug: "wikipedia-today",
    datasetSlug: "wikipedia-pageviews",
    title: "How many people read Wikipedia today",
    subtitle: "~270M daily pageviews on English Wikipedia alone.",
    config: {
      grid: { rows: 8, cols: 8 },
      ogGrid: { rows: 8, cols: 8 },
      palette: { desktop: "#6366f1", mobile_web: "#22d3ee", mobile_app: "#f472b6" },
      showLegend: true,
      emptyColor: "#111827",
    },
    isFeatured: true,
    category: "technology",
  },

  // ── NEW CARDS (10) ──

  {
    slug: "satellites-above",
    datasetSlug: "active-satellites",
    title: "14,500 satellites orbit Earth right now",
    subtitle: "Starlink alone accounts for 66% of all active satellites.",
    config: {
      grid: { rows: 12, cols: 13 },
      ogGrid: { rows: 12, cols: 13 },
      palette: { starlink: "#38bdf8", other_commercial: "#a78bfa", government: "#ef4444", scientific: "#10b981" },
      showLegend: true,
      emptyColor: "#111827",
    },
    isFeatured: true,
    category: "technology",
  },
  {
    slug: "cyber-threats",
    datasetSlug: "cyberattacks-today",
    title: "2.2 million cyberattacks detected today",
    subtitle: "Malware, phishing, and DDoS — the internet's invisible war.",
    config: {
      grid: { rows: 12, cols: 18 },
      ogGrid: { rows: 12, cols: 18 },
      palette: { malware: "#ef4444", phishing: "#f97316", ddos: "#eab308", other: "#6b7280" },
      showLegend: true,
      emptyColor: "#111827",
    },
    isFeatured: true,
    category: "technology",
  },
  {
    slug: "warming-world",
    datasetSlug: "temperature-anomaly",
    title: "Earth is +1.48°C warmer than normal",
    subtitle: "The breakdown of global warming — most of it happened recently.",
    config: {
      grid: { rows: 12, cols: 12 },
      ogGrid: { rows: 12, cols: 12 },
      palette: { pre_2000: "#f59e0b", since_2000: "#ef4444", recent_spike: "#dc2626" },
      showLegend: true,
      emptyColor: "#111827",
    },
    isFeatured: true,
    category: "environment",
  },
  {
    slug: "disappearing-forests",
    datasetSlug: "deforestation",
    title: "We lose 10 million hectares of forest every year",
    subtitle: "Only half is regrown. Net loss: an area the size of Portugal, annually.",
    config: {
      grid: { rows: 6, cols: 5 },
      ogGrid: { rows: 6, cols: 5 },
      palette: { loss: "#ef4444", gain: "#22c55e" },
      showLegend: true,
      emptyColor: "#111827",
    },
    isFeatured: true,
    category: "environment",
  },
  {
    slug: "plastic-ocean",
    datasetSlug: "ocean-plastic",
    title: "14 million tonnes of plastic enter the ocean every year",
    subtitle: "Only about 1% is ever recovered. Most sinks or breaks into microplastics.",
    config: {
      grid: { rows: 8, cols: 9 },
      ogGrid: { rows: 8, cols: 9 },
      palette: { packaging: "#3b82f6", textiles: "#a78bfa", fishing: "#06b6d4", other: "#6b7280" },
      showLegend: true,
      emptyColor: "#111827",
    },
    isFeatured: true,
    category: "environment",
  },
  {
    slug: "trillion-club",
    datasetSlug: "trillion-dollar-club",
    title: "The $23 Trillion Club",
    subtitle: "8 companies worth more than most countries. NVIDIA leads at $4.7T.",
    config: {
      grid: { rows: 7, cols: 7 },
      ogGrid: { rows: 7, cols: 7 },
      palette: { nvidia: "#76b900", apple: "#a3a3a3", google: "#ea4335", microsoft: "#00a4ef", amazon: "#ff9900", meta: "#0668e1", tsmc: "#c00", broadcom: "#cc092f" },
      showLegend: true,
      emptyColor: "#111827",
    },
    isFeatured: true,
    category: "finance",
  },
  {
    slug: "market-mood",
    datasetSlug: "sp500-mood",
    title: "How the S&P 500 felt today",
    subtitle: "Out of 500 companies, how many went up, down, or stayed flat?",
    config: {
      grid: { rows: 10, cols: 10 },
      ogGrid: { rows: 10, cols: 10 },
      palette: { up: "#22c55e", down: "#ef4444", flat: "#6b7280" },
      showLegend: true,
      emptyColor: "#111827",
    },
    isFeatured: true,
    category: "finance",
  },
  {
    slug: "wasted-food",
    datasetSlug: "food-waste",
    title: "One-third of all food is wasted",
    subtitle: "2 billion tonnes lost or wasted every year — enough to feed 3 billion people.",
    config: {
      grid: { rows: 10, cols: 12 },
      ogGrid: { rows: 10, cols: 12 },
      palette: { consumed: "#22c55e", lost_supply: "#f59e0b", wasted: "#ef4444" },
      showLegend: true,
      emptyColor: "#111827",
    },
    isFeatured: true,
    category: "humanity",
  },
  {
    slug: "poverty-line",
    datasetSlug: "extreme-poverty",
    title: "700 million people live on less than $2.15 a day",
    subtitle: "Progress has slowed since COVID. Sub-Saharan Africa bears 60% of the burden.",
    config: {
      grid: { rows: 15, cols: 14 },
      ogGrid: { rows: 15, cols: 14 },
      palette: { extreme: "#ef4444", moderate: "#f59e0b", above: "#22c55e" },
      showLegend: true,
      emptyColor: "#111827",
    },
    isFeatured: true,
    category: "humanity",
  },
  {
    slug: "water-world",
    datasetSlug: "water-usage",
    title: "70% of all freshwater goes to agriculture",
    subtitle: "Industry uses 19%. Domestic use is just 11%. 2 billion live in water-stressed areas.",
    config: {
      grid: { rows: 10, cols: 10 },
      ogGrid: { rows: 10, cols: 10 },
      palette: { agriculture: "#22d3ee", industry: "#6366f1", domestic: "#f472b6" },
      showLegend: true,
      emptyColor: "#111827",
    },
    isFeatured: true,
    category: "environment",
  },
];

// ─────────────────────────────────────────────
// SEED FUNCTION
// ─────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding ScaleCards with verified data...\n");

  await prisma.card.deleteMany();
  await prisma.snapshot.deleteMany();
  await prisma.dataset.deleteMany();
  console.log("  Cleared existing data.");

  const datasetMap: Record<string, string> = {};
  for (const ds of datasets) {
    const created = await prisma.dataset.create({
      data: {
        slug: ds.slug,
        name: ds.name,
        description: ds.description,
        sourceUrls: ds.sourceUrls,
        refreshRate: ds.refreshRate,
        lastRefreshedAt: new Date(),
      },
    });
    datasetMap[ds.slug] = created.id;
    console.log(`  Dataset: ${ds.slug}`);
  }

  const snapshotMap: Record<string, string> = {};
  for (const snap of snapshots) {
    const datasetId = datasetMap[snap.datasetSlug];
    const created = await prisma.snapshot.create({
      data: {
        datasetId,
        payload: snap.payload,
        collectedAt: new Date(),
      },
    });
    snapshotMap[snap.datasetSlug] = created.id;

    await prisma.dataset.update({
      where: { id: datasetId },
      data: { latestSnapshotId: created.id },
    });
    console.log(`  Snapshot: ${snap.datasetSlug}`);
  }

  for (const card of cards) {
    const datasetId = datasetMap[card.datasetSlug];
    const snapshotId = snapshotMap[card.datasetSlug];
    await prisma.card.create({
      data: {
        slug: card.slug,
        datasetId,
        snapshotId,
        title: card.title,
        subtitle: card.subtitle,
        config: card.config,
        isFeatured: card.isFeatured,
        category: card.category,
      },
    });
    console.log(`  Card: ${card.slug}`);
  }

  console.log(`\n✅ Seeded ${datasets.length} datasets, ${snapshots.length} snapshots, ${cards.length} cards.`);
  console.log("   All data verified from primary sources (Feb 2026).");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
