// inngest/functions/refreshDatasets.ts
import { inngest } from "../client";
import { prisma } from "@/lib/db";
import { fetchDataset, hasFetcher } from "@/lib/datasets/registry";
import crypto from "crypto";

/**
 * Try to extract the data year from a snapshot payload's "notes" field.
 * Most fetchers include text like "Data from 2023" or "2024 data".
 */
function extractDataYear(payload: Record<string, unknown>): number | null {
  const notes = payload?.notes as string | undefined;
  if (!notes) return null;
  // Match years between 2015 and 2099
  const matches = notes.match(/20[1-9]\d/g);
  if (!matches) return null;
  // Return the highest year mentioned
  return Math.max(...matches.map(Number));
}

/**
 * Refresh all datasets that have automated fetchers.
 * Runs every 30 minutes on the cron schedule for better real-time data.
 *
 * - Hourly datasets (bitcoin): refresh every run (~30 min)
 * - Daily datasets (wikipedia): refresh every ~20 hours
 * - Weekly datasets (CO2, energy, military, etc.): refresh every ~5 days
 *
 * All datasets now have automated fetchers pulling from public APIs:
 *  - Bitcoin: CoinGecko → Coinlore → CoinDesk fallback chain (hourly)
 *  - Wikipedia: Wikimedia REST API (daily)
 *  - CO₂ Emissions: Our World in Data / Global Carbon Project (weekly, annual data)
 *  - Electricity Mix: OWID / Ember Energy data (weekly, annual data)
 *  - EV Adoption: OWID / IEA (weekly, annual data)
 *  - Military Spending: World Bank API indicator MS.MIL.XPND.CD (weekly, annual data)
 *  - Internet Access: World Bank API indicator IT.NET.USER.ZS (weekly, annual data)
 *  - Smartphone Access: World Bank API + GSMA estimates (weekly, annual data)
 *  - AI Adoption: World Bank population + survey estimates (weekly, estimate-based)
 *  - Wealth Inequality: World Inequality Database API (weekly, annual data)
 */
export const refreshDatasets = inngest.createFunction(
  {
    id: "refresh-datasets",
    name: "Refresh Datasets",
  },
  { cron: "*/30 * * * *" }, // Every 30 minutes (was hourly)
  async ({ step }) => {
    const datasets = await step.run("fetch-refreshable-datasets", async () => {
      return prisma.dataset.findMany({
        where: {
          refreshRate: { in: ["hourly", "daily", "weekly"] },
        },
      });
    });

    const results: Array<{ slug: string; status: string }> = [];

    for (const dataset of datasets) {
      if (!hasFetcher(dataset.slug)) {
        results.push({ slug: dataset.slug, status: "no_fetcher" });
        continue;
      }

      // Check if we should skip based on refresh rate
      if (dataset.lastRefreshedAt) {
        const lastRefreshed = new Date(dataset.lastRefreshedAt);
        const hoursSinceRefresh =
          (Date.now() - lastRefreshed.getTime()) / (1000 * 60 * 60);

        if (dataset.refreshRate === "daily" && hoursSinceRefresh < 20) {
          results.push({ slug: dataset.slug, status: "skipped_too_recent" });
          continue;
        }
        if (dataset.refreshRate === "weekly" && hoursSinceRefresh < 120) {
          // 120 hours = 5 days
          results.push({ slug: dataset.slug, status: "skipped_too_recent" });
          continue;
        }
      }

      await step.run(`refresh-${dataset.slug}`, async () => {
        try {
          const payload = await fetchDataset(dataset.slug);
          const sourceHash = crypto
            .createHash("md5")
            .update(JSON.stringify(payload))
            .digest("hex");

          // Check if data actually changed
          if (dataset.latestSnapshotId) {
            const latest = await prisma.snapshot.findUnique({
              where: { id: dataset.latestSnapshotId },
            });
            if (latest?.sourceHash === sourceHash) {
              results.push({
                slug: dataset.slug,
                status: "unchanged",
              });
              return;
            }
          }

          // Create new snapshot
          const snapshot = await prisma.snapshot.create({
            data: {
              datasetId: dataset.id,
              payload,
              sourceHash,
              collectedAt: new Date(),
            },
          });

          // Update dataset pointer + extract data year for watchdog tracking
          const dataYear = extractDataYear(payload as Record<string, unknown>);
          await prisma.dataset.update({
            where: { id: dataset.id },
            data: {
              latestSnapshotId: snapshot.id,
              lastRefreshedAt: new Date(),
              ...(dataYear ? { latestSourceYear: dataYear } : {}),
            } as Record<string, unknown>,
          });

          // Update any cards pointing to this dataset that use latest
          await prisma.card.updateMany({
            where: { datasetId: dataset.id },
            data: { snapshotId: snapshot.id },
          });

          results.push({ slug: dataset.slug, status: "refreshed" });
        } catch (error) {
          results.push({
            slug: dataset.slug,
            status: `error: ${error instanceof Error ? error.message : "unknown"}`,
          });
        }
      });
    }

    return { refreshed: results };
  }
);
