// app/api/refresh/route.ts
// Trigger a refresh of ALL datasets with automated fetchers.
// GET /api/refresh → refreshes all datasets
// Optionally pass ?force=true to bypass time-based skip logic.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { fetchDataset, hasFetcher, datasetSourceMeta } from "@/lib/datasets/registry";
import crypto from "crypto";

export async function GET(req: Request) {
  const url = new URL(req.url);

  // Auth check — supports ?secret= (manual) and Authorization header (Vercel Cron)
  const secret =
    url.searchParams.get("secret") ||
    req.headers.get("authorization")?.replace("Bearer ", "");
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const force = url.searchParams.get("force") === "true";

  const datasets = await prisma.dataset.findMany({
    where: {
      refreshRate: { in: ["hourly", "daily", "weekly"] },
    },
  });

  const results: Array<{
    slug: string;
    status: string;
    sourceType?: string;
    error?: string;
  }> = [];

  for (const dataset of datasets) {
    if (!hasFetcher(dataset.slug)) {
      results.push({ slug: dataset.slug, status: "no_fetcher" });
      continue;
    }

    // Skip if recently refreshed (unless forced)
    if (!force && dataset.lastRefreshedAt) {
      const hoursSince =
        (Date.now() - dataset.lastRefreshedAt.getTime()) / (1000 * 60 * 60);

      if (dataset.refreshRate === "hourly" && hoursSince < 0.5) {
        results.push({ slug: dataset.slug, status: "skipped_too_recent" });
        continue;
      }
      if (dataset.refreshRate === "daily" && hoursSince < 12) {
        results.push({ slug: dataset.slug, status: "skipped_too_recent" });
        continue;
      }
      if (dataset.refreshRate === "weekly" && hoursSince < 72) {
        results.push({ slug: dataset.slug, status: "skipped_too_recent" });
        continue;
      }
    }

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
          await prisma.dataset.update({
            where: { id: dataset.id },
            data: { lastRefreshedAt: new Date() },
          });
          results.push({
            slug: dataset.slug,
            status: "unchanged",
            sourceType: datasetSourceMeta[dataset.slug]?.type,
          });
          continue;
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

      // Update dataset pointer
      await prisma.dataset.update({
        where: { id: dataset.id },
        data: {
          latestSnapshotId: snapshot.id,
          lastRefreshedAt: new Date(),
        },
      });

      // Update cards
      await prisma.card.updateMany({
        where: { datasetId: dataset.id },
        data: { snapshotId: snapshot.id },
      });

      results.push({
        slug: dataset.slug,
        status: "refreshed",
        sourceType: datasetSourceMeta[dataset.slug]?.type,
      });
    } catch (error) {
      results.push({
        slug: dataset.slug,
        status: "error",
        sourceType: datasetSourceMeta[dataset.slug]?.type,
        error: error instanceof Error ? error.message : "unknown",
      });
    }
  }

  const refreshed = results.filter((r) => r.status === "refreshed").length;
  const unchanged = results.filter((r) => r.status === "unchanged").length;
  const errors = results.filter((r) => r.status === "error").length;

  return NextResponse.json({
    summary: {
      total: results.length,
      refreshed,
      unchanged,
      errors,
      skipped: results.length - refreshed - unchanged - errors,
    },
    results,
    timestamp: new Date().toISOString(),
  });
}
