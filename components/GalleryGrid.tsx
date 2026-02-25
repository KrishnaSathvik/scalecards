// components/GalleryGrid.tsx
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import CategoryFilter, {
    type FilterCategory,
} from "@/components/CategoryFilter";
import Pagination from "@/components/Pagination";
import {
    generateGridSpec,
    getDynamicSubtitle,
    type CardConfig,
    type SnapshotPayload,
} from "@/lib/grid";

type CardData = {
    id: string;
    slug: string;
    title: string;
    subtitle: string | null;
    category: string | null;
    config: unknown;
    createdAt: string;
    dataset: {
        refreshRate: string;
        lastRefreshedAt: string | null;
    };
    snapshot: {
        payload: unknown;
    } | null;
};

type Props = {
    cards: CardData[];
};

function timeAgo(dateStr: string): string {
    const seconds = Math.floor(
        (Date.now() - new Date(dateStr).getTime()) / 1000
    );
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}

export default function GalleryGrid({ cards }: Props) {
    const [filter, setFilter] = useState<FilterCategory>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 12;

    // Calculate counts per category
    const counts = useMemo(() => {
        const c: Record<FilterCategory, number> = {
            all: cards.length,
            live: 0,
            finance: 0,
            environment: 0,
            humanity: 0,
            technology: 0,
        };
        for (const card of cards) {
            const cat = card.category as FilterCategory;
            if (cat && cat in c) {
                c[cat]++;
            }
        }
        return c;
    }, [cards]);

    // Filter cards
    const filteredCards = useMemo(() => {
        if (filter === "all") return cards;
        return cards.filter((card) => card.category === filter);
    }, [cards, filter]);

    // Reset page to 1 when filter changes
    const handleFilterChange = (newFilter: FilterCategory) => {
        setFilter(newFilter);
        setCurrentPage(1);
    };

    // Calculate pagination slices
    const totalPages = Math.ceil(filteredCards.length / pageSize);
    const paginatedCards = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return filteredCards.slice(startIndex, startIndex + pageSize);
    }, [filteredCards, currentPage, pageSize]);

    return (
        <>
            <CategoryFilter
                activeFilter={filter}
                onFilterChange={handleFilterChange}
                counts={counts}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {paginatedCards.map((card, i) => {
                    const config = card.config as unknown as CardConfig;
                    const payload = card.snapshot?.payload as unknown as SnapshotPayload;

                    if (!payload) return null;

                    const spec = generateGridSpec(payload, config, "page");

                    const dotSize = 6;
                    const gap = 2;
                    const cellSize = dotSize + gap;
                    const svgWidth = spec.cols * cellSize;
                    const svgHeight = spec.rows * cellSize;

                    const subtitle = getDynamicSubtitle(card, payload);

                    return (
                        <Link
                            key={card.id}
                            href={`/v/${card.slug}`}
                            className="card-glow block rounded-2xl bg-card border border-border p-6 sm:p-8 animate-fade-in opacity-0 shadow-lg hover:shadow-xl transition-shadow"
                            style={{ animationDelay: `${100 + i * 60}ms` }}
                        >
                            {/* Category badge */}
                            {card.category && (
                                <div className="mb-3">
                                    <span className="text-xs font-mono px-2 py-1 rounded-full bg-surface border border-border text-muted-foreground capitalize">
                                        {card.category}
                                    </span>
                                </div>
                            )}

                            {/* Mini grid preview */}
                            <div className="flex justify-center mb-6">
                                <div className="rounded-xl bg-surface border border-border/50 p-2 shadow-sm">
                                    <svg
                                        width={svgWidth}
                                        height={svgHeight}
                                        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                                        className="max-w-full"
                                        style={{ maxHeight: 160 }}
                                    >
                                        {spec.cells.map((cell) => (
                                            <rect
                                                key={cell.idx}
                                                x={cell.col * cellSize}
                                                y={cell.row * cellSize}
                                                width={dotSize}
                                                height={dotSize}
                                                rx={1.5}
                                                fill={cell.color ?? "#1a1a2e"}
                                                opacity={cell.categoryKey ? 1 : 0.3}
                                            />
                                        ))}
                                    </svg>
                                </div>
                            </div>

                            {/* Card info */}
                            <h2 className="text-section font-semibold leading-snug mb-2 text-gradient">
                                {card.title}
                            </h2>
                            {subtitle && (
                                <p className="text-meta leading-relaxed mb-2">{subtitle}</p>
                            )}

                            {/* Meta */}
                            <div className="mt-4 flex items-center gap-3 text-meta font-mono">
                                <span className="inline-flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                                    {card.dataset.refreshRate}
                                </span>
                                {card.dataset.lastRefreshedAt && (
                                    <span>Updated {timeAgo(card.dataset.lastRefreshedAt)}</span>
                                )}
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Empty state */}
            {filteredCards.length === 0 && (
                <div className="text-center py-16">
                    <p className="text-muted-foreground font-mono text-sm">
                        No cards in this category yet.
                    </p>
                </div>
            )}

            {/* Pagination Controls */}
            {filteredCards.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            )}
        </>
    );
}
