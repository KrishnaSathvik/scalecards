// lib/datasets/data-context.ts
// Per-dataset context explaining why the data year is what it is,
// when new data is expected, and who publishes it.
// This helps users understand that "2024 data in 2026" is normal
// for global macro datasets.

export type DataContext = {
  dataYear: string;         // e.g. "2024" or "live" or "yesterday"
  whyThisYear: string;      // plain-English explanation
  publisher: string;        // who publishes the source data
  nextUpdate: string;       // when new data is expected
  lag: string;              // how far behind the data typically is
  iconKey: string;          // key to map to a React icon component
};

const dataContextMap: Record<string, DataContext> = {
  "us-national-debt": {
    dataYear: "Today",
    whyThisYear: "The US Treasury releases the exact national debt (to the penny) every business day.",
    publisher: "US Treasury",
    nextUpdate: "Tomorrow (Next business day)",
    lag: "None — previous day's closing balance",
    iconKey: "banknotes",
  },
  "ethereum-price": {
    dataYear: "Live",
    whyThisYear: "Ethereum price updates every few seconds on global exchanges.",
    publisher: "CoinGecko",
    nextUpdate: "Continuous",
    lag: "None — real-time market data",
    iconKey: "currency-dollar",
  },
  "global-flights": {
    dataYear: "Live",
    whyThisYear: "Aircraft transmit ADS-B location data constantly. The OpenSky Network aggregates these live.",
    publisher: "OpenSky Network",
    nextUpdate: "Continuous",
    lag: "None — real-time tracking",
    iconKey: "paper-airplane",
  },
  "global-earthquakes": {
    dataYear: "Last 24 Hours",
    whyThisYear: "The USGS monitors global seismic networks constantly and publishes events immediately.",
    publisher: "US Geological Survey (USGS)",
    nextUpdate: "Continuous",
    lag: "Minutes — after automated seismic analysis",
    iconKey: "globe-alt",
  },
  "near-earth-asteroids": {
    dataYear: "Today",
    whyThisYear: "NASA’s JPL tracks the orbits of near-Earth objects and predicts close approaches for each day.",
    publisher: "NASA / JPL",
    nextUpdate: "Tomorrow",
    lag: "None — predictive tracking",
    iconKey: "sparkles",
  },
  "live-population": {
    dataYear: "Live Estimate",
    whyThisYear: "While not every birth/death is tracked instantly, population clocks use UN baseline rates to estimate growth in real-time.",
    publisher: "UN Dept of Economic and Social Affairs (Estimates)",
    nextUpdate: "Continuous",
    lag: "None — modeled estimate",
    iconKey: "users",
  },
  "bitcoin-price": {
    dataYear: "Live",
    whyThisYear: "Bitcoin price updates every few seconds on exchanges worldwide.",
    publisher: "CoinGecko (aggregating global exchanges)",
    nextUpdate: "Continuous — refreshed every 30 minutes",
    lag: "None — real-time market data",
    iconKey: "bitcoin",
  },
  "wikipedia-pageviews": {
    dataYear: "Yesterday",
    whyThisYear:
      "Wikimedia processes pageview logs overnight. Today's count isn't finalized until tomorrow.",
    publisher: "Wikimedia Foundation",
    nextUpdate: "Tomorrow — new data available each morning (UTC)",
    lag: "~1 day — standard for web analytics pipelines",
    iconKey: "chart",
  },
  "co2-emissions": {
    dataYear: "2024",
    whyThisYear:
      "The Global Carbon Project collects CO₂ data from every country on Earth. This requires national-level reporting, satellite verification, and scientific peer review before publication.",
    publisher: "Global Carbon Project via Our World in Data",
    nextUpdate: "November 2026 (annual release)",
    lag: "~1–2 years — standard for global emissions accounting",
    iconKey: "globe",
  },
  "renewable-energy": {
    dataYear: "2024",
    whyThisYear:
      "Global energy statistics require collecting generation data from every power grid worldwide. Ember and the Energy Institute compile and verify these figures annually.",
    publisher: "Ember & Energy Institute via Our World in Data",
    nextUpdate: "Mid-2026 (annual release)",
    lag: "~1–2 years — standard for global energy statistics",
    iconKey: "bolt",
  },
  "ev-adoption": {
    dataYear: "2024",
    whyThisYear:
      "The IEA tracks EV sales and stock across all countries. Manufacturers, governments, and industry groups report data with varying delays.",
    publisher: "International Energy Agency (IEA) via Our World in Data",
    nextUpdate: "June 2026 (Global EV Outlook annual release)",
    lag: "~1–2 years — standard for global vehicle statistics",
    iconKey: "car",
  },
  "military-spending": {
    dataYear: "2024",
    whyThisYear:
      "SIPRI researchers verify military budgets from 170+ countries using government reports, NATO data, and independent estimates. This takes over a year to compile.",
    publisher: "SIPRI via World Bank API",
    nextUpdate: "April 2026 (SIPRI Yearbook annual release)",
    lag: "~1–2 years — standard for defense spending verification",
    iconKey: "shield",
  },
  "internet-access": {
    dataYear: "2024",
    whyThisYear:
      "The ITU collects internet usage data from national statistics offices in 190+ countries. Many developing nations report with significant delays.",
    publisher: "International Telecommunication Union (ITU) via World Bank API",
    nextUpdate: "Late 2026 (ITU annual report, typically November)",
    lag: "~1–2 years — standard for global telecom statistics",
    iconKey: "wifi",
  },
  "smartphone-access": {
    dataYear: "2024",
    whyThisYear:
      "Mobile subscription data comes from telecom regulators in every country. The World Bank compiles ITU figures; GSMA adds smartphone-specific estimates from operator surveys.",
    publisher: "World Bank (ITU data) + GSMA Intelligence",
    nextUpdate: "Mid-2026 (GSMA Mobile Economy annual report)",
    lag: "~1–2 years — standard for global mobile statistics",
    iconKey: "smartphone",
  },
  "ai-adoption": {
    dataYear: "2024–2025 estimates",
    whyThisYear:
      "No single organization tracks global AI usage in real time. These figures combine population data from the World Bank with survey estimates from Microsoft, DataReportal, and OpenAI.",
    publisher: "Multiple sources (survey-based estimates)",
    nextUpdate: "Updated when major new surveys are published",
    lag: "Varies — survey-based, not a continuous measurement",
    iconKey: "cpu",
  },
  "wealth-inequality": {
    dataYear: "2024",
    whyThisYear:
      "The World Inequality Database compiles wealth data from tax records, national accounts, and household surveys across 100+ countries. Oxfam adds analysis using Forbes billionaire data and Credit Suisse/UBS reports.",
    publisher: "World Inequality Database (WID) / Oxfam / UBS",
    nextUpdate: "January 2027 (Oxfam report at Davos) or late 2026 (WID update)",
    lag: "~1–2 years — standard for global wealth statistics",
    iconKey: "coins",
  },
  // NEW datasets
  "active-satellites": {
    dataYear: "2026 estimate",
    whyThisYear:
      "The UCS Satellite Database and CelesTrak are updated periodically. Satellite launches happen weekly, so counts can change rapidly. SpaceX alone launches 20-40 Starlink satellites per month.",
    publisher: "UCS / CelesTrak / Space-Track.org",
    nextUpdate: "Continuous (updated periodically)",
    lag: "Weeks — databases updated manually",
    iconKey: "sparkles",
  },
  "cyberattacks-today": {
    dataYear: "Estimated",
    whyThisYear:
      "No single organization tracks every cyberattack globally in real time. Numbers are estimated from threat intelligence platforms and annual reports by Kaspersky, CrowdStrike, and others.",
    publisher: "Multiple sources (industry estimates)",
    nextUpdate: "Updated when new threat reports are published",
    lag: "Varies — estimate-based",
    iconKey: "shield",
  },
  "temperature-anomaly": {
    dataYear: "2024",
    whyThisYear:
      "NOAA and NASA collect global temperature readings from thousands of land and ocean stations. Monthly averages are calculated and compared to the 1951-1980 baseline period.",
    publisher: "NOAA / NASA GISS",
    nextUpdate: "Monthly (global temperature updates)",
    lag: "~1 month — data processing time",
    iconKey: "globe",
  },
  "deforestation": {
    dataYear: "2025 estimate",
    whyThisYear:
      "The FAO conducts a Global Forest Resources Assessment every 5 years. Satellite imagery from Global Forest Watch provides annual updates. Deforestation rates are calculated from tree cover change analysis.",
    publisher: "FAO / Global Forest Watch",
    nextUpdate: "2025 (FAO FRA)",
    lag: "1–2 years — standard for satellite deforestation analysis",
    iconKey: "globe",
  },
  "ocean-plastic": {
    dataYear: "2024 estimate",
    whyThisYear:
      "No real-time ocean plastic monitoring network exists. Estimates come from waste management studies, beach surveys, and modeling by UNEP, The Ocean Cleanup, and academic researchers.",
    publisher: "UNEP / Ocean Conservancy",
    nextUpdate: "Updated when new research is published",
    lag: "Varies — model-based estimate",
    iconKey: "globe",
  },
  "trillion-dollar-club": {
    dataYear: "Live estimate",
    whyThisYear:
      "Stock market prices change every second during trading hours. Market caps are calculated from price × shares outstanding. These figures represent a snapshot that changes constantly.",
    publisher: "companiesmarketcap.com / Public exchanges",
    nextUpdate: "Continuous during market hours",
    lag: "End of day — uses closing prices",
    iconKey: "chart",
  },
  "sp500-mood": {
    dataYear: "Estimated",
    whyThisYear:
      "S&P 500 breadth data (how many stocks went up vs down) is calculated from closing prices of all 500 component companies. No free API provides this in real time.",
    publisher: "Estimated from market data",
    nextUpdate: "End of each trading day",
    lag: "Same day — after market close",
    iconKey: "chart",
  },
  "food-waste": {
    dataYear: "2024",
    whyThisYear:
      "The FAO and UNEP publish the Food Waste Index periodically. Tracking global food waste requires surveys across every stage of the supply chain in every country.",
    publisher: "FAO / UNEP Food Waste Index",
    nextUpdate: "Next major report expected 2026",
    lag: "2–3 years — complex global survey",
    iconKey: "globe",
  },
  "extreme-poverty": {
    dataYear: "2024",
    whyThisYear:
      "The World Bank collects household survey data from 150+ countries to estimate poverty. Surveys are conducted on different timelines in different countries, creating a significant data lag.",
    publisher: "World Bank PovcalNet",
    nextUpdate: "Updated when new surveys are processed",
    lag: "1–3 years — dependent on national survey timelines",
    iconKey: "globe",
  },
  "water-usage": {
    dataYear: "2024 estimate",
    whyThisYear:
      "FAO AQUASTAT collects water withdrawal data from national statistics offices worldwide. Agriculture's 70% share has been relatively stable for decades, though absolute volumes are rising.",
    publisher: "FAO AQUASTAT",
    nextUpdate: "Updated periodically (every few years)",
    lag: "3–5 years — standard for global water statistics",
    iconKey: "globe",
  },
};

export function getDataContext(slug: string): DataContext | null {
  return dataContextMap[slug] ?? null;
}
