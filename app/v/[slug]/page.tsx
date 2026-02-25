// app/v/[slug]/page.tsx
import { prisma } from "@/lib/db";
import {
  generateGridSpec,
  formatDotLabel,
  formatNumber,
  getDynamicSubtitle,
  type CardConfig,
  type SnapshotPayload,
} from "@/lib/grid";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import CardGridSvg from "@/components/CardGridSvg";
import CardLegend from "@/components/CardLegend";
import ShareBar from "@/components/ShareBar";
import CardKnowledgeComponent from "@/components/CardKnowledge";

import { getDatasetFreshness } from "@/lib/datasets/freshness";
import { datasetSourceMeta } from "@/lib/datasets/registry";
import { getDataContext } from "@/lib/datasets/data-context";
import { getCardKnowledge } from "@/lib/datasets/card-knowledge";
import {
  FaBitcoin,
  FaChartBar,
  FaGlobeAmericas,
  FaBolt,
  FaCar,
  FaShieldAlt,
  FaWifi,
  FaMobileAlt,
  FaMicrochip,
  FaCoins,
  FaExclamationTriangle,
  FaInfoCircle,
} from "react-icons/fa";

// ISR: revalidate every 60 seconds so live data (bitcoin) stays fresh
export const revalidate = 60;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const card = await prisma.card.findUnique({
    where: { slug },
    include: { dataset: true, snapshot: true },
  });

  if (!card || !card.snapshot) return { title: "Not Found" };

  const payload = card.snapshot.payload as unknown as SnapshotPayload;
  const dynSubtitle = getDynamicSubtitle(card, payload);
  const desc = dynSubtitle || card.dataset.description;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://scalecards.vercel.app";
  return {
    title: `${card.title} — ScaleCards`,
    description: desc,
    openGraph: {
      title: card.title,
      description: desc,
      images: [`${baseUrl}/api/og/${card.slug}`],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: card.title,
      description: desc,
      images: [`${baseUrl}/api/og/${card.slug}`],
    },
  };
}

export default async function CardPage({ params }: PageProps) {
  const { slug } = await params;

  const card = await prisma.card.findUnique({
    where: { slug },
    include: {
      dataset: true,
      snapshot: true,
    },
  });

  if (!card || !card.snapshot) notFound();

  const config = card.config as unknown as CardConfig;
  const payload = card.snapshot.payload as unknown as SnapshotPayload;
  const spec = generateGridSpec(payload, config, "page");
  const sourceUrls = card.dataset.sourceUrls as string[];

  // Fetch knowledge content + related cards
  const knowledge = getCardKnowledge(card.dataset.slug);
  let relatedCards: Array<{ slug: string; title: string }> = [];
  if (knowledge && knowledge.relatedSlugs.length > 0) {
    const relatedDatasets = await prisma.card.findMany({
      where: { dataset: { slug: { in: knowledge.relatedSlugs } } },
      select: { slug: true, title: true },
    });
    relatedCards = relatedDatasets;
  }


  return (
    <div className="min-h-screen bg-grid">
      {/* Back nav */}
      <nav className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 flex justify-between items-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-mono"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M10 12L6 8L10 4" />
          </svg>
          All cards
        </Link>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-20 sm:pb-24">
        {/* Title block */}
        <div className="mb-8 animate-fade-in opacity-0">
          <h1 className="text-hero text-gradient font-extrabold tracking-tight leading-tight mb-2">
            {card.title}
          </h1>
          {getDynamicSubtitle(card, payload) && (
            <p className="text-subtitle mt-2 mb-2">{getDynamicSubtitle(card, payload)}</p>
          )}
        </div>

        {/* Grid + Legend */}
        <div className="animate-fade-in opacity-0 animate-delay-100">
          <div className="rounded-2xl bg-card border border-border p-5 sm:p-8 md:p-12 shadow-lg">
            {/* Dot label */}
            <p className="font-mono text-meta mb-4">
              {formatDotLabel(payload.dotValue, payload.unitLabel)}
              {" · "}
              {spec.rows}×{spec.cols} grid ({spec.totalCells.toLocaleString()} cells)
            </p>

            {/* SVG Grid */}
            <CardGridSvg spec={spec} />

            {/* Legend */}
            <CardLegend spec={spec} />
          </div>
        </div>

        {/* About this card — knowledge section */}
        {knowledge && (
          <div className="mt-8 animate-fade-in opacity-0 animate-delay-150">
            <CardKnowledgeComponent knowledge={knowledge} relatedCards={relatedCards} />
          </div>
        )}


        {/* Share + Export bar */}
        <div className="mt-6 animate-fade-in opacity-0 animate-delay-200">
          <ShareBar
            slug={card.slug}
            title={card.title}
            description={getDynamicSubtitle(card, payload) || card.dataset.description}
          />
        </div>

        {/* Sources + Meta */}
        <div className="mt-8 animate-fade-in opacity-0 animate-delay-300">
          <div className="rounded-xl bg-surface border border-border p-6">
            <h3 className="font-mono text-xs tracking-wider uppercase text-muted-foreground mb-3">
              <span className="text-gradient">Sources & Notes</span>
            </h3>

            {payload.notes && (
              <p className="text-sm text-muted-foreground mb-3">{payload.notes}</p>
            )}

            {/* Data freshness badge */}
            {(() => {
              const freshness = getDatasetFreshness(
                card.dataset.slug,
                card.dataset.refreshRate,
                card.dataset.lastRefreshedAt
              );
              const sourceMeta = datasetSourceMeta[card.dataset.slug];

              return (
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-full ${freshness.bgColor} ${freshness.color}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${freshness.level === "live"
                        ? "bg-emerald-400 animate-pulse"
                        : freshness.level === "recent"
                          ? "bg-cyan-400"
                          : freshness.level === "stale"
                            ? "bg-orange-400"
                            : "bg-muted-foreground"
                        }`}
                    />
                    {freshness.label}
                  </span>
                  {sourceMeta && (
                    <span className="text-xs text-muted-foreground font-mono">
                      via {sourceMeta.apis.join(" → ")}
                    </span>
                  )}
                  {sourceMeta?.type === "estimated" && (
                    <span className="inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600">
                      <FaExclamationTriangle className="w-2.5 h-2.5" /> Estimate-based
                    </span>
                  )}
                </div>
              );
            })()}

            <div className="flex flex-wrap gap-3">
              {sourceUrls.map((url, i) => {
                const domain = new URL(url).hostname.replace("www.", "");
                return (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-500/5 border border-indigo-500/10 rounded-lg px-3 py-1.5"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M5 1H2C1.45 1 1 1.45 1 2V10C1 10.55 1.45 11 2 11H10C10.55 11 11 10.55 11 10V7" />
                      <path d="M7 1H11V5" />
                      <path d="M11 1L5 7" />
                    </svg>
                    {domain}
                  </a>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground font-mono">
              <span>
                Refresh: {card.dataset.refreshRate}
              </span>
              {/* Show actual data date extracted from notes (e.g. "2026-02-22") */}
              {(() => {
                const dateMatch = payload.notes?.match(/\d{4}-\d{2}-\d{2}/);
                if (dateMatch) {
                  return (
                    <span>
                      Data from: {dateMatch[0]}
                    </span>
                  );
                }
                return null;
              })()}
              {card.snapshot?.collectedAt && (
                <span>
                  Fetched:{" "}
                  {card.snapshot.collectedAt.toISOString().slice(0, 16)} UTC
                </span>
              )}
              <span>
                Total: {formatNumber(payload.total)} {payload.unitLabel}
              </span>
            </div>

            {/* Transparency note for estimate-based datasets */}
            {datasetSourceMeta[card.dataset.slug]?.type === "estimated" && (
              <p className="mt-3 text-xs text-amber-600/80 font-mono leading-relaxed flex items-start gap-1.5">
                <FaExclamationTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                <span>
                  This dataset uses published survey estimates, not a live data feed.
                  The underlying numbers are updated when new reports are published.
                  {" "}
                  {datasetSourceMeta[card.dataset.slug]?.note}
                </span>
              </p>
            )}
            {datasetSourceMeta[card.dataset.slug]?.type === "apiAnnual" && (
              <p className="mt-3 text-xs text-muted-foreground font-mono leading-relaxed flex items-start gap-1.5">
                <FaInfoCircle className="w-3 h-3 mt-0.5 shrink-0" />
                <span>
                  The API is live, but the source data updates annually.
                  {" "}
                  {datasetSourceMeta[card.dataset.slug]?.note}
                </span>
              </p>
            )}

            {/* Data context — explain why data year is what it is */}
            {(() => {
              const ctx = getDataContext(card.dataset.slug);
              if (!ctx) return null;

              const iconMap: Record<string, React.ReactNode> = {
                bitcoin: <FaBitcoin className="w-5 h-5 text-orange-400" />,
                chart: <FaChartBar className="w-5 h-5 text-cyan-400" />,
                globe: <FaGlobeAmericas className="w-5 h-5 text-emerald-400" />,
                bolt: <FaBolt className="w-5 h-5 text-yellow-400" />,
                car: <FaCar className="w-5 h-5 text-blue-400" />,
                shield: <FaShieldAlt className="w-5 h-5 text-red-400" />,
                wifi: <FaWifi className="w-5 h-5 text-indigo-400" />,
                smartphone: <FaMobileAlt className="w-5 h-5 text-violet-400" />,
                cpu: <FaMicrochip className="w-5 h-5 text-pink-400" />,
                coins: <FaCoins className="w-5 h-5 text-amber-400" />,
              };

              return (
                <div className="mt-4 rounded-lg bg-surface border border-border p-4">
                  <div className="flex items-start gap-3">
                    <span className="leading-none mt-0.5 shrink-0">
                      {iconMap[ctx.iconKey] ?? <FaInfoCircle className="w-5 h-5 text-muted-foreground" />}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-mono font-semibold text-foreground">
                          Why {ctx.dataYear} data?
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                        {ctx.whyThisYear}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                        <div className="rounded bg-background px-2.5 py-1.5">
                          <span className="text-muted-foreground block">Publisher</span>
                          <span className="text-foreground">{ctx.publisher}</span>
                        </div>
                        <div className="rounded bg-background px-2.5 py-1.5">
                          <span className="text-muted-foreground block">Next update</span>
                          <span className="text-foreground">{ctx.nextUpdate}</span>
                        </div>
                        <div className="rounded bg-background px-2.5 py-1.5">
                          <span className="text-muted-foreground block">Typical lag</span>
                          <span className="text-foreground">{ctx.lag}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </main>
    </div>
  );
}
