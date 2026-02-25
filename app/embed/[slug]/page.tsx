import { prisma } from "@/lib/db";
import {
    generateGridSpec,
    formatDotLabel,
    getDynamicSubtitle,
    type CardConfig,
    type SnapshotPayload,
} from "@/lib/grid";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import CardGridSvg from "@/components/CardGridSvg";
import CardLegend from "@/components/CardLegend";

// ISR: revalidate every 60 seconds so live data stays fresh
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

    return { title: `${card.title} — ScaleCards Embed` };
}

export default async function EmbedPage({ params }: PageProps) {
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

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://scalecards.vercel.app";

    return (
        <div className="min-h-screen bg-grid p-4 sm:p-6 flex flex-col justify-center items-center">
            <div className="w-full max-w-3xl animate-fade-in opacity-0">
                <div className="mb-4 text-center">
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight text-gradient mb-1">
                        {card.title}
                    </h1>
                    {getDynamicSubtitle(card, payload) && (
                        <p className="text-sm font-mono text-muted-foreground">{getDynamicSubtitle(card, payload)}</p>
                    )}
                </div>

                <div className="rounded-2xl bg-card border border-border p-4 sm:p-6 shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <p className="font-mono text-xs sm:text-sm text-meta m-0">
                            {formatDotLabel(payload.dotValue, payload.unitLabel)}
                            {" · "}
                            {spec.totalCells.toLocaleString()} cells
                        </p>
                        <a
                            href={`${baseUrl}/v/${slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-mono text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                            scalecards.vercel.app ↗
                        </a>
                    </div>

                    <CardGridSvg spec={spec} />

                    <div className="mt-4">
                        <CardLegend spec={spec} />
                    </div>
                </div>
            </div>
        </div>
    );
}
