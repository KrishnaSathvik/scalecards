// app/v/[slug]/loading.tsx
export default function CardLoading() {
    return (
        <div className="min-h-screen bg-grid">
            <nav className="max-w-5xl mx-auto px-6 pt-8 flex justify-between items-center">
                <div className="h-5 w-20 rounded bg-muted animate-pulse" />
                <div className="h-8 w-8 rounded bg-muted animate-pulse" />
            </nav>

            <main className="max-w-5xl mx-auto px-6 pt-8 pb-24">
                {/* Title skeleton */}
                <div className="mb-8">
                    <div className="h-12 w-3/4 rounded-lg bg-muted animate-pulse mb-3" />
                    <div className="h-6 w-1/2 rounded bg-muted animate-pulse" />
                </div>

                {/* Grid skeleton */}
                <div className="rounded-2xl bg-card border border-border p-8 md:p-12 shadow-lg">
                    <div className="h-4 w-48 rounded bg-muted animate-pulse mb-6" />
                    <div className="grid grid-cols-10 gap-1.5">
                        {Array.from({ length: 100 }).map((_, i) => (
                            <div
                                key={i}
                                className="aspect-square rounded-sm bg-muted animate-pulse"
                                style={{ animationDelay: `${i * 10}ms` }}
                            />
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
