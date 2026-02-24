// app/api/refresh/[slug]/route.ts
// Manual trigger to refresh a single dataset on demand.
// GET /api/refresh/bitcoin-price → fetches live data and creates a new snapshot.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { fetchDataset, hasFetcher } from "@/lib/datasets/registry";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  // Auth check — supports ?secret= (manual) and Authorization header (Vercel Cron)
  const url = new URL(_req.url);
  const secret =
    url.searchParams.get("secret") ||
    _req.headers.get("authorization")?.replace("Bearer ", "");
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;

  if (!hasFetcher(slug)) {
    return NextResponse.json(
      { error: `No automated fetcher for dataset: ${slug}` },
      { status: 404 }
    );
  }

  const dataset = await prisma.dataset.findUnique({ where: { slug } });
  if (!dataset) {
    return NextResponse.json(
      { error: `Dataset not found: ${slug}` },
      { status: 404 }
    );
  }

  try {
    const payload = await fetchDataset(slug);
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
        return NextResponse.json({
          status: "unchanged",
          slug,
          payload,
          message: "Data hasn't changed since last refresh.",
        });
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

    return NextResponse.json({
      status: "refreshed",
      slug,
      snapshotId: snapshot.id,
      payload,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: `Failed to refresh ${slug}: ${error instanceof Error ? error.message : "unknown"}`,
      },
      { status: 500 }
    );
  }
}
