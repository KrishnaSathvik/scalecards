// app/sitemap.ts
import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://scalecards.dev";

    // Get all featured cards for the sitemap
    const cards = await prisma.card.findMany({
        where: { isFeatured: true },
        select: {
            slug: true,
            updatedAt: true,
        },
        orderBy: { createdAt: "asc" },
    });

    const cardEntries: MetadataRoute.Sitemap = cards.map((card) => ({
        url: `${baseUrl}/v/${card.slug}`,
        lastModified: card.updatedAt,
        changeFrequency: "daily" as const,
        priority: 0.8,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1,
        },
        ...cardEntries,
    ];
}
