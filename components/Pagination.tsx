import React from "react";

type Props = {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
};

export default function Pagination({
    currentPage,
    totalPages,
    onPageChange,
}: Props) {
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-center gap-2 mt-8 animate-fade-in opacity-0 animate-delay-300">
            <button
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
                className="px-3 py-1.5 rounded bg-surface border border-border text-meta font-mono disabled:opacity-50 transition-colors hover:bg-zinc-800/50"
            >
                Prev
            </button>

            <span className="text-sm font-mono text-muted-foreground px-4">
                Page <span className="text-foreground">{currentPage}</span> of{" "}
                <span className="text-foreground">{totalPages}</span>
            </span>

            <button
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                className="px-3 py-1.5 rounded bg-surface border border-border text-meta font-mono disabled:opacity-50 transition-colors hover:bg-zinc-800/50"
            >
                Next
            </button>
        </div>
    );
}
