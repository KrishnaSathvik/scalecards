// inngest/functions/watchForNewPublications.ts
//
// A daily watchdog that checks whether annual data sources have
// published a new year of data. If new data is detected, it
// triggers an immediate full refresh for that dataset.
//
// This is separate from the regular cron refresh — the regular cron
// just re-fetches at the configured rate. This watchdog specifically
// detects YEAR changes in annual datasets, so we catch new publications
// within ~24h instead of waiting for users to notice stale data.

import { inngest } from "../client";
import { prisma } from "@/lib/db";
import { runAllProbes, type WatchdogResult } from "@/lib/datasets/watchdog";
import { fetchDataset, hasFetcher } from "@/lib/datasets/registry";
import crypto from "crypto";

export const watchForNewPublications = inngest.createFunction(
  {
    id: "watch-for-new-publications",
    name: "Watch for New Data Publications",
  },
  // Run once daily at 06:00 UTC — most data orgs publish during
  // business hours, so a morning check catches overnight releases.
  { cron: "0 6 * * *" },
  async ({ step, logger }) => {
    // 1. Get all datasets and their current known years
    const datasets = await step.run("fetch-datasets", async () => {
      return prisma.dataset.findMany({
        where: {
          refreshRate: { in: ["daily", "weekly"] },
        },
      });
    });

    // Build a map: slug → latestSourceYear
    const knownYears: Record<string, number | null> = {};
    for (const ds of datasets) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      knownYears[ds.slug] = (ds as any).latestSourceYear ?? null;
    }

    // 2. Run all lightweight probes in parallel
    const results: WatchdogResult[] = await step.run(
      "run-watchdog-probes",
      async () => {
        return runAllProbes(knownYears);
      }
    );

    // 3. Update lastWatchdogAt for all probed datasets
    await step.run("update-watchdog-timestamps", async () => {
      const now = new Date();
      const slugsChecked = results.map((r) => r.slug);

      await prisma.dataset.updateMany({
        where: { slug: { in: slugsChecked } },
        data: { lastWatchdogAt: now } as Record<string, unknown>,
      });
    });

    // 4. For each dataset with new data, trigger an immediate full refresh
    const changed = results.filter((r) => r.changed && !r.error);
    const refreshResults: Array<{
      slug: string;
      status: string;
      newYear: number | null;
    }> = [];

    for (const probe of changed) {
      await step.run(`refresh-new-data-${probe.slug}`, async () => {
        const dataset = datasets.find((d) => d.slug === probe.slug);
        if (!dataset || !hasFetcher(dataset.slug)) {
          refreshResults.push({
            slug: probe.slug,
            status: "no_dataset_or_fetcher",
            newYear: probe.detectedYear,
          });
          return;
        }

        try {
          const payload = await fetchDataset(dataset.slug);
          const sourceHash = crypto
            .createHash("md5")
            .update(JSON.stringify(payload))
            .digest("hex");

          // Check if data actually changed (hash comparison)
          if (dataset.latestSnapshotId) {
            const latest = await prisma.snapshot.findUnique({
              where: { id: dataset.latestSnapshotId },
            });
            if (latest?.sourceHash === sourceHash) {
              // Probe detected a year change, but payload is identical.
              // Update the year tracker anyway.
              if (probe.detectedYear) {
                await prisma.dataset.update({
                  where: { id: dataset.id },
                  data: { latestSourceYear: probe.detectedYear } as Record<
                    string,
                    unknown
                  >,
                });
              }
              refreshResults.push({
                slug: probe.slug,
                status: "year_updated_data_unchanged",
                newYear: probe.detectedYear,
              });
              return;
            }
          }

          // Create new snapshot with the fresh data
          const snapshot = await prisma.snapshot.create({
            data: {
              datasetId: dataset.id,
              payload,
              sourceHash,
              collectedAt: new Date(),
            },
          });

          // Update dataset pointer + source year
          await prisma.dataset.update({
            where: { id: dataset.id },
            data: {
              latestSnapshotId: snapshot.id,
              lastRefreshedAt: new Date(),
              latestSourceYear: probe.detectedYear,
            } as Record<string, unknown>,
          });

          // Update any cards pointing to this dataset
          await prisma.card.updateMany({
            where: { datasetId: dataset.id },
            data: { snapshotId: snapshot.id },
          });

          refreshResults.push({
            slug: probe.slug,
            status: "refreshed_with_new_year",
            newYear: probe.detectedYear,
          });
        } catch (error) {
          refreshResults.push({
            slug: probe.slug,
            status: `error: ${error instanceof Error ? error.message : "unknown"}`,
            newYear: probe.detectedYear,
          });
        }
      });
    }

    return {
      probed: results.length,
      changed: changed.length,
      probeResults: results,
      refreshResults,
    };
  }
);
