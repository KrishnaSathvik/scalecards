// components/CategoryFilter.tsx
"use client";

export type FilterCategory = "all" | "live" | "finance" | "environment" | "humanity" | "technology";

type Props = {
    activeFilter: FilterCategory;
    onFilterChange: (filter: FilterCategory) => void;
    counts: Record<FilterCategory, number>;
};

const filterLabels: Record<FilterCategory, { label: string; emoji: string }> = {
    all: { label: "All", emoji: "🌐" },
    live: { label: "Live Data", emoji: "⚡" },
    finance: { label: "Finance", emoji: "💰" },
    environment: { label: "Environment", emoji: "🌱" },
    humanity: { label: "Humanity", emoji: "🧑‍🤝‍🧑" },
    technology: { label: "Technology", emoji: "💻" },
};

export default function CategoryFilter({
    activeFilter,
    onFilterChange,
    counts,
}: Props) {
    return (
        <div className="mb-8 animate-fade-in opacity-0" style={{ animationDelay: "50ms" }}>
            <div className="flex flex-wrap gap-2">
                {(Object.keys(filterLabels) as FilterCategory[]).map((key) => {
                    const { label, emoji } = filterLabels[key];
                    const isActive = activeFilter === key;
                    const count = counts[key];

                    return (
                        <button
                            key={key}
                            onClick={() => onFilterChange(key)}
                            className={`
                inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-mono transition-all duration-200
                ${isActive
                                    ? "bg-gradient-to-r from-indigo-500/30 via-pink-500/30 to-yellow-500/30 border border-indigo-500/30 text-foreground font-semibold shadow-sm"
                                    : "bg-surface border border-border text-muted-foreground hover:text-foreground hover:border-indigo-500/20"
                                }
              `}
                        >
                            <span>{emoji}</span>
                            <span>{label}</span>
                            <span
                                className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? "bg-indigo-500/20 text-indigo-300" : "bg-surface text-muted-foreground"
                                    }`}
                            >
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
