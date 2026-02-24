// lib/datasets/watchdog.ts
//
// Lightweight "watchdog" probes that detect when an annual data source
// has published new data — WITHOUT downloading the full dataset.
//
// How it works:
//   1. Each probe does a minimal check (HEAD request, tiny JSON endpoint,
//      or GitHub API commit date) to see if the source has been updated.
//   2. If new data is detected, we return { newYear, changed: true }.
//   3. The Inngest watchdog function then triggers a full refresh only
//      for datasets that actually have new data.
//
// This avoids downloading 100MB+ OWID files every week just to find out
// nothing changed, while still catching new publications within ~24 hours.

export type WatchdogResult = {
  slug: string;
  changed: boolean;
  previousYear: number | null;
  detectedYear: number | null;
  method: string; // how we detected it
  checkedAt: string;
  error?: string;
};

// ─────────────────────────────────────────────
// OWID CO₂ Data — check via GitHub API
// The OWID team pushes to github.com/owid/co2-data when GCP publishes.
// We check the latest commit date on the data file.
// ─────────────────────────────────────────────

async function probeCO2Emissions(
  currentYear: number | null
): Promise<WatchdogResult> {
  const slug = "co2-emissions";
  try {
    // GitHub API: get latest commit on the data file (free, no key, 60 req/hr)
    const res = await fetch(
      "https://api.github.com/repos/owid/co2-data/commits?path=owid-co2-data.json&per_page=1",
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "ScaleCards/1.0",
        },
        next: { revalidate: 0 },
      }
    );

    if (!res.ok) throw new Error(`GitHub API ${res.status}`);
    const commits = await res.json();

    if (!commits[0]) throw new Error("No commits found");

    const commitDate = new Date(commits[0].commit.committer.date);
    const commitMsg = (commits[0].commit.message as string).toLowerCase();

    // Heuristic: if the commit message mentions a new year or the commit is
    // more recent than our last data year's November, it's probably new data.
    // Global Carbon Budget typically publishes in November.
    const commitYear = commitDate.getFullYear();
    const commitMonth = commitDate.getMonth() + 1;

    // Try to extract a year from the commit message (e.g., "Update data through 2025")
    const yearMatch = commitMsg.match(/20\d{2}/);
    const mentionedYear = yearMatch ? parseInt(yearMatch[0], 10) : null;

    // Determine if this represents new data
    let detectedYear = currentYear;
    let changed = false;

    if (mentionedYear && currentYear && mentionedYear > currentYear) {
      detectedYear = mentionedYear;
      changed = true;
    } else if (
      currentYear &&
      commitYear >= currentYear &&
      commitMonth >= 10
    ) {
      // If there's a commit after October in the current data year or later,
      // there might be new data. Trigger a full check.
      detectedYear = commitYear;
      changed = commitYear > currentYear || commitMonth >= 11;
    }

    return {
      slug,
      changed,
      previousYear: currentYear,
      detectedYear,
      method: `GitHub commit: ${commitDate.toISOString().slice(0, 10)} — "${commits[0].commit.message.slice(0, 80)}"`,
      checkedAt: new Date().toISOString(),
    };
  } catch (error) {
    return {
      slug,
      changed: false,
      previousYear: currentYear,
      detectedYear: null,
      method: "GitHub API",
      checkedAt: new Date().toISOString(),
      error: error instanceof Error ? error.message : "unknown",
    };
  }
}

// ─────────────────────────────────────────────
// OWID Energy Data (renewable energy + EV) — check via GitHub API
// Repo: github.com/owid/energy-data
// ─────────────────────────────────────────────

async function probeOWIDEnergyData(
  slug: string,
  currentYear: number | null
): Promise<WatchdogResult> {
  try {
    const res = await fetch(
      "https://api.github.com/repos/owid/energy-data/commits?path=owid-energy-data.csv&per_page=1",
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "ScaleCards/1.0",
        },
        next: { revalidate: 0 },
      }
    );

    if (!res.ok) throw new Error(`GitHub API ${res.status}`);
    const commits = await res.json();
    if (!commits[0]) throw new Error("No commits found");

    const commitDate = new Date(commits[0].commit.committer.date);
    const commitMsg = (commits[0].commit.message as string).toLowerCase();

    const yearMatch = commitMsg.match(/20\d{2}/);
    const mentionedYear = yearMatch ? parseInt(yearMatch[0], 10) : null;

    let changed = false;
    let detectedYear = currentYear;

    if (mentionedYear && currentYear && mentionedYear > currentYear) {
      detectedYear = mentionedYear;
      changed = true;
    } else if (!currentYear && mentionedYear) {
      detectedYear = mentionedYear;
      changed = true;
    }

    return {
      slug,
      changed,
      previousYear: currentYear,
      detectedYear,
      method: `GitHub commit: ${commitDate.toISOString().slice(0, 10)} — "${commits[0].commit.message.slice(0, 80)}"`,
      checkedAt: new Date().toISOString(),
    };
  } catch (error) {
    return {
      slug,
      changed: false,
      previousYear: currentYear,
      detectedYear: null,
      method: "GitHub API",
      checkedAt: new Date().toISOString(),
      error: error instanceof Error ? error.message : "unknown",
    };
  }
}

// ─────────────────────────────────────────────
// World Bank API — lightweight year check
// Instead of downloading full indicator data, we just check what's the
// latest year with non-null data. This is a ~1KB response.
// ─────────────────────────────────────────────

async function probeWorldBankIndicator(
  slug: string,
  indicator: string,
  country: string,
  currentYear: number | null
): Promise<WatchdogResult> {
  try {
    const thisYear = new Date().getFullYear();
    const dateRange = `${thisYear - 5}:${thisYear}`;

    const res = await fetch(
      `https://api.worldbank.org/v2/country/${country}/indicator/${indicator}?format=json&date=${dateRange}&per_page=10`,
      { next: { revalidate: 0 } }
    );

    if (!res.ok) throw new Error(`World Bank API ${res.status}`);
    const json = await res.json();

    if (!json[1] || json[1].length === 0) {
      return {
        slug,
        changed: false,
        previousYear: currentYear,
        detectedYear: null,
        method: `World Bank ${indicator}: no data in range`,
        checkedAt: new Date().toISOString(),
      };
    }

    // Find the latest year with actual data
    let latestYear = 0;
    for (const entry of json[1]) {
      if (entry.value != null) {
        const y = parseInt(entry.date, 10);
        if (y > latestYear) latestYear = y;
      }
    }

    const changed = currentYear != null && latestYear > currentYear;

    return {
      slug,
      changed,
      previousYear: currentYear,
      detectedYear: latestYear || null,
      method: `World Bank ${indicator}: latest data year = ${latestYear || "none"}`,
      checkedAt: new Date().toISOString(),
    };
  } catch (error) {
    return {
      slug,
      changed: false,
      previousYear: currentYear,
      detectedYear: null,
      method: `World Bank ${indicator}`,
      checkedAt: new Date().toISOString(),
      error: error instanceof Error ? error.message : "unknown",
    };
  }
}

// ─────────────────────────────────────────────
// WID API — lightweight year check for wealth inequality
// ─────────────────────────────────────────────

async function probeWealthInequality(
  currentYear: number | null
): Promise<WatchdogResult> {
  const slug = "wealth-inequality";
  try {
    const params = new URLSearchParams({
      variable: "shweal",
      country: "WO",
      percentile: "p99p100",
      year: "all",
    });

    const res = await fetch(
      `https://wid.world/api/country-time-series?${params}`,
      { next: { revalidate: 0 } }
    );

    if (!res.ok) throw new Error(`WID API ${res.status}`);
    const data = await res.json();

    // Find the latest year in the response
    let latestYear = 0;
    if (data && typeof data === "object") {
      for (const values of Object.values(data)) {
        if (typeof values === "object" && values !== null) {
          for (const year of Object.keys(values as Record<string, unknown>)) {
            const y = parseInt(year, 10);
            if (y > latestYear) latestYear = y;
          }
        }
      }
    }

    const changed = currentYear != null && latestYear > currentYear;

    return {
      slug,
      changed,
      previousYear: currentYear,
      detectedYear: latestYear || null,
      method: `WID API shweal: latest year = ${latestYear || "none"}`,
      checkedAt: new Date().toISOString(),
    };
  } catch (error) {
    return {
      slug,
      changed: false,
      previousYear: currentYear,
      detectedYear: null,
      method: "WID API",
      checkedAt: new Date().toISOString(),
      error: error instanceof Error ? error.message : "unknown",
    };
  }
}

// ─────────────────────────────────────────────
// Master probe registry
// ─────────────────────────────────────────────

/**
 * Run all watchdog probes to detect new data publications.
 * Pass in the current known "latest year" per dataset (from DB).
 *
 * Returns results for all annual datasets showing whether they have new data.
 */
export async function runAllProbes(
  knownYears: Record<string, number | null>
): Promise<WatchdogResult[]> {
  const results = await Promise.allSettled([
    probeCO2Emissions(knownYears["co2-emissions"] ?? null),
    probeOWIDEnergyData(
      "renewable-energy",
      knownYears["renewable-energy"] ?? null
    ),
    probeOWIDEnergyData("ev-adoption", knownYears["ev-adoption"] ?? null),
    probeWorldBankIndicator(
      "military-spending",
      "MS.MIL.XPND.CD",
      "USA",
      knownYears["military-spending"] ?? null
    ),
    probeWorldBankIndicator(
      "internet-access",
      "IT.NET.USER.ZS",
      "WLD",
      knownYears["internet-access"] ?? null
    ),
    probeWorldBankIndicator(
      "smartphone-access",
      "IT.CEL.SETS",
      "WLD",
      knownYears["smartphone-access"] ?? null
    ),
    probeWealthInequality(knownYears["wealth-inequality"] ?? null),
  ]);

  return results.map((r) =>
    r.status === "fulfilled"
      ? r.value
      : {
          slug: "unknown",
          changed: false,
          previousYear: null,
          detectedYear: null,
          method: "probe failed",
          checkedAt: new Date().toISOString(),
          error: r.reason?.message ?? "unknown",
        }
  );
}

/**
 * Run a single probe by dataset slug.
 */
export async function runProbe(
  slug: string,
  currentYear: number | null
): Promise<WatchdogResult> {
  switch (slug) {
    case "co2-emissions":
      return probeCO2Emissions(currentYear);
    case "renewable-energy":
      return probeOWIDEnergyData("renewable-energy", currentYear);
    case "ev-adoption":
      return probeOWIDEnergyData("ev-adoption", currentYear);
    case "military-spending":
      return probeWorldBankIndicator(slug, "MS.MIL.XPND.CD", "USA", currentYear);
    case "internet-access":
      return probeWorldBankIndicator(slug, "IT.NET.USER.ZS", "WLD", currentYear);
    case "smartphone-access":
      return probeWorldBankIndicator(slug, "IT.CEL.SETS", "WLD", currentYear);
    case "wealth-inequality":
      return probeWealthInequality(currentYear);
    default:
      return {
        slug,
        changed: false,
        previousYear: currentYear,
        detectedYear: null,
        method: "no probe available",
        checkedAt: new Date().toISOString(),
      };
  }
}
