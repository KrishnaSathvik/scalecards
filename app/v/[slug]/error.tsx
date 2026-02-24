// app/v/[slug]/error.tsx
"use client";

import Link from "next/link";

export default function CardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="min-h-screen bg-grid flex items-center justify-center">
            <div className="text-center max-w-md px-6">
                <p className="font-mono text-xs tracking-[0.3em] uppercase text-gradient mb-4">
                    ScaleCards
                </p>
                <h1 className="text-section text-gradient font-extrabold tracking-tight mb-4">
                    Something went wrong
                </h1>
                <p className="text-subtitle mb-8">
                    We couldn&apos;t load this card. The data source may be temporarily
                    unavailable.
                </p>
                <div className="flex items-center justify-center gap-4">
                    <button
                        onClick={reset}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500/20 via-pink-500/20 to-yellow-500/20 border border-border text-sm font-mono text-gradient font-semibold transition-colors hover:border-indigo-500/30"
                    >
                        Try again
                    </button>
                    <Link
                        href="/"
                        className="text-sm font-mono text-muted-foreground hover:text-foreground transition-colors"
                    >
                        ← All cards
                    </Link>
                </div>
            </div>
        </div>
    );
}
