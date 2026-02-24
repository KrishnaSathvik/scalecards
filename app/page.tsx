// app/page.tsx
import { prisma } from "@/lib/db";
import { ThemeToggle } from "@/components/ThemeToggle";
import GalleryGrid from "@/components/GalleryGrid";

export const revalidate = 60; // ISR: revalidate every 60 seconds

export default async function GalleryPage() {
  const cards = await prisma.card.findMany({
    where: { isFeatured: true },
    include: {
      dataset: true,
      snapshot: true,
    },
    orderBy: { createdAt: "asc" },
  });

  // Serialize for client component (Dates → strings)
  const serializedCards = cards.map((card) => ({
    id: card.id,
    slug: card.slug,
    title: card.title,
    subtitle: card.subtitle,
    category: card.category,
    config: card.config,
    createdAt: card.createdAt.toISOString(),
    dataset: {
      refreshRate: card.dataset.refreshRate,
      lastRefreshedAt: card.dataset.lastRefreshedAt?.toISOString() ?? null,
    },
    snapshot: card.snapshot
      ? { payload: card.snapshot.payload }
      : null,
  }));

  return (
    <div className="min-h-screen bg-grid">
      {/* Header */}
      <header className="max-w-6xl mx-auto px-6 pt-16 pb-12">
        <div className="animate-fade-in opacity-0">
          <div className="flex justify-between items-center mb-4">
            <p className="font-mono text-xs tracking-[0.3em] uppercase text-gradient">
              ScaleCards
            </p>
            <ThemeToggle />
          </div>
          <h1 className="text-hero text-gradient font-extrabold tracking-tight leading-tight">
            See the numbers.<br />
            <span className="text-gradient text-section">Feel the scale.</span>
          </h1>
          <p className="mt-6 text-subtitle max-w-lg">
            Each dot tells a story. Unit-based visualizations that make big numbers tangible, shareable, and sourced.
          </p>
        </div>
      </header>

      {/* Card Grid with Filters */}
      <main className="max-w-6xl mx-auto px-6 pb-24">
        <GalleryGrid cards={serializedCards} />
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 pb-12 text-center">
        <div className="mt-8">
          <p className="text-xs text-gradient font-mono">
            ScaleCards — Data sourced, visualized, shareable.
          </p>
        </div>
      </footer>
    </div>
  );
}
