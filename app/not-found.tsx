// app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-grid flex items-center justify-center">
            <div className="text-center max-w-md px-6">
                <p className="font-mono text-xs tracking-[0.3em] uppercase text-gradient mb-4">
                    ScaleCards
                </p>
                <h1 className="text-hero text-gradient font-extrabold tracking-tight mb-4">
                    404
                </h1>
                <p className="text-subtitle mb-8">
                    This card doesn&apos;t exist — yet. Maybe there&apos;s a number worth
                    visualizing?
                </p>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500/20 via-pink-500/20 to-yellow-500/20 border border-border text-sm font-mono text-gradient font-semibold transition-colors hover:border-indigo-500/30"
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
                    Back to all cards
                </Link>
            </div>
        </div>
    );
}
