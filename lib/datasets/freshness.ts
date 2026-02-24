// lib/datasets/freshness.ts
// Utility to assess how "real-time" each dataset actually is.
// This powers the freshness badge on card pages.

export type FreshnessLevel = "live" | "recent" | "stale" | "static";

export type FreshnessInfo = {
  level: FreshnessLevel;
  label: string;
  description: string;
  color: string; // Tailwind text color
  bgColor: string; // Tailwind bg color
  maxAge: string; // Human-readable max age (e.g., "1 hour")
};

/**
 * Determine how fresh a dataset is based on its slug, refresh rate,
 * and when it was last refreshed.
 */
export function getDatasetFreshness(
  slug: string,
  refreshRate: string,
  lastRefreshedAt: Date | null
): FreshnessInfo {
  const now = Date.now();
  const lastRefresh = lastRefreshedAt ? lastRefreshedAt.getTime() : 0;
  const hoursSinceRefresh = (now - lastRefresh) / (1000 * 60 * 60);

  // Datasets that pull from true real-time APIs
  const liveDatasets = ["bitcoin-price", "ethereum-price", "global-flights", "global-earthquakes", "live-population"];
  const dailyDatasets = ["wikipedia-pageviews", "us-national-debt", "near-earth-asteroids", "active-satellites"];
  const staticEstimates = ["cyberattacks-today", "sp500-mood"];

  if (liveDatasets.includes(slug)) {
    if (hoursSinceRefresh < 2) {
      return {
        level: "live",
        label: "Live",
        description: "Real-time data from CoinGecko API. Refreshes every hour.",
        color: "text-emerald-400",
        bgColor: "bg-emerald-500/10",
        maxAge: "1 hour",
      };
    }
    return {
      level: "recent",
      label: "Recent",
      description: `Last refreshed ${Math.round(hoursSinceRefresh)}h ago. Normally updates hourly.`,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
      maxAge: "1 hour",
    };
  }

  if (dailyDatasets.includes(slug)) {
    if (hoursSinceRefresh < 30) {
      return {
        level: "recent",
        label: "Yesterday's data",
        description: "Wikimedia REST API. Data is from the most recent complete day (yesterday). Refreshes daily.",
        color: "text-cyan-400",
        bgColor: "bg-cyan-500/10",
        maxAge: "1 day",
      };
    }
    return {
      level: "stale",
      label: "Stale",
      description: `Last refreshed ${Math.round(hoursSinceRefresh / 24)}d ago. Normally updates daily.`,
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
      maxAge: "1 day",
    };
  }

  // Static estimates — no live data source exists
  if (staticEstimates.includes(slug)) {
    return {
      level: "static",
      label: "Estimated",
      description: "Based on industry reports and statistical averages. No free real-time API exists for this data.",
      color: "text-zinc-400",
      bgColor: "bg-zinc-500/10",
      maxAge: "manual",
    };
  }

  // Weekly datasets that pull from real APIs (World Bank, OWID, etc.)
  const apiWeeklyDatasets = [
    "co2-emissions",
    "renewable-energy",
    "military-spending",
    "internet-access",
    "smartphone-access",
    "ev-adoption",
    "wealth-inequality",
    "ai-adoption",
    "temperature-anomaly",
    "deforestation",
    "ocean-plastic",
    "trillion-dollar-club",
    "food-waste",
    "extreme-poverty",
    "water-usage",
  ];

  if (apiWeeklyDatasets.includes(slug)) {
    // These pull from APIs, but the underlying source data updates annually
    const sourceInfo = getSourceUpdateFrequency(slug);

    if (hoursSinceRefresh < 168) {
      // < 7 days
      return {
        level: "recent",
        label: sourceInfo.label,
        description: sourceInfo.description,
        color: "text-blue-400",
        bgColor: "bg-blue-500/10",
        maxAge: "7 days",
      };
    }
    return {
      level: "stale",
      label: "Needs refresh",
      description: `Last refreshed ${Math.round(hoursSinceRefresh / 24)}d ago. ${sourceInfo.description}`,
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
      maxAge: "7 days",
    };
  }

  // Fallback for any unknown datasets
  return {
    level: "static",
    label: "Static",
    description: "No automated refresh. Data was manually curated at seed time.",
    color: "text-zinc-500",
    bgColor: "bg-zinc-500/10",
    maxAge: "manual",
  };
}

/**
 * Get information about how often the underlying SOURCE data actually updates.
 * Many APIs are "real-time" but the data they return is annual.
 */
function getSourceUpdateFrequency(slug: string): {
  label: string;
  description: string;
} {
  const map: Record<string, { label: string; description: string }> = {
    "co2-emissions": {
      label: "Annual data via API",
      description:
        "Our World in Data / Global Carbon Project. Source data updates annually (Nov). API checked weekly.",
    },
    "renewable-energy": {
      label: "Annual data via API",
      description:
        "OWID / Ember Energy. Source data updates annually. API checked weekly.",
    },
    "military-spending": {
      label: "Annual data via API",
      description:
        "World Bank API (indicator MS.MIL.XPND.CD). SIPRI releases annually (April). API checked weekly.",
    },
    "internet-access": {
      label: "Annual data via API",
      description:
        "World Bank API (IT.NET.USER.ZS). ITU updates annually (Nov). API checked weekly.",
    },
    "smartphone-access": {
      label: "Annual data via API",
      description:
        "World Bank mobile subscriptions + GSMA estimates. Source updates annually. API checked weekly.",
    },
    "ev-adoption": {
      label: "Annual data via API",
      description:
        "OWID / IEA Global EV Outlook. IEA updates annually. API checked weekly.",
    },
    "wealth-inequality": {
      label: "Annual data via API",
      description:
        "World Inequality Database (WID). Source updates annually/biannually. API checked weekly.",
    },
    "ai-adoption": {
      label: "Estimated (no live API)",
      description:
        "No single authoritative real-time source exists. Based on World Bank population + survey estimates from Microsoft/DataReportal. Updated weekly.",
    },
    "active-satellites": {
      label: "Live via CelesTrak",
      description:
        "CelesTrak GP API provides a live count of all tracked active satellites. No API key needed.",
    },
    "temperature-anomaly": {
      label: "Monthly via NOAA",
      description:
        "NOAA Climate At a Glance Global Time Series. Updated monthly. API checked weekly.",
    },
    "extreme-poverty": {
      label: "Annual data via API",
      description:
        "World Bank SI.POV.DDAY poverty headcount ratio + population. Updated annually.",
    },
    "trillion-dollar-club": {
      label: "Live via Finnhub",
      description:
        "Finnhub /stock/profile2 (free key). Falls back to estimates if no FINNHUB_API_KEY is set.",
    },
  };

  return (
    map[slug] ?? {
      label: "Periodic",
      description: "Data updates periodically from external source.",
    }
  );
}
