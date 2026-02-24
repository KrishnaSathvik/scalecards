// app/api/watchdog/route.ts
//
// On-demand watchdog endpoint — run all probes manually to check if
// any annual data source has published new data.
//
// GET /api/watchdog            — run all probes
// GET /api/watchdog?slug=co2-emissions — run probe for one dataset
//
// This is useful for:
//   - Debugging: see what each probe returns
//   - Forcing a check: don't wait for the daily cron
//   - Monitoring: hook into an uptime service

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { runAllProbes, runProbe } from "@/lib/datasets/watchdog";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Auth check — require CRON_SECRET in production
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const slug = searchParams.get("slug");

    if (slug) {
      // Single probe
      const dataset = await prisma.dataset.findUnique({
        where: { slug },
      });

      if (!dataset) {
        return NextResponse.json(
          { error: `Dataset "${slug}" not found` },
          { status: 404 }
        );
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await runProbe(slug, (dataset as any).latestSourceYear ?? null);

      // Update watchdog timestamp
      await prisma.dataset.update({
        where: { id: dataset.id },
        data: { lastWatchdogAt: new Date() } as any,
      });

      return NextResponse.json({
        probe: result,
        dataset: {
          slug: dataset.slug,
          name: dataset.name,
          refreshRate: dataset.refreshRate,
          lastRefreshedAt: dataset.lastRefreshedAt,
        },
      });
    }

    // All probes
    const datasets = await prisma.dataset.findMany({
      where: {
        refreshRate: { in: ["daily", "weekly"] },
      },
    });

    const knownYears: Record<string, number | null> = {};
    for (const ds of datasets) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      knownYears[ds.slug] = (ds as any).latestSourceYear ?? null;
    }

    const results = await runAllProbes(knownYears);

    // Update watchdog timestamps
    const checkedSlugs = results.map((r) => r.slug);
    await prisma.dataset.updateMany({
      where: { slug: { in: checkedSlugs } },
      data: { lastWatchdogAt: new Date() } as any,
    });

    const changed = results.filter((r) => r.changed);
    const errors = results.filter((r) => r.error);

    return NextResponse.json({
      summary: {
        total: results.length,
        changed: changed.length,
        errors: errors.length,
        checkedAt: new Date().toISOString(),
      },
      probes: results,
      ...(changed.length > 0 && {
        newDataAvailable: changed.map((r) => ({
          slug: r.slug,
          previousYear: r.previousYear,
          detectedYear: r.detectedYear,
          method: r.method,
        })),
      }),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Watchdog check failed",
        details: error instanceof Error ? error.message : "unknown",
      },
      { status: 500 }
    );
  }
}
