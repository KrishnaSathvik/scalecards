// components/CardLegend.tsx
"use client";

import type { GridSpec } from "@/lib/grid";
import { formatNumber } from "@/lib/grid";

type Props = {
  spec: GridSpec;
};

export default function CardLegend({ spec }: Props) {
  return (
    <div className="mt-8 flex flex-wrap gap-4">
      {spec.legend.map((cat) => (
        <div
          key={cat.key}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/10 via-pink-500/10 to-yellow-500/10 border border-zinc-700/30 shadow-sm"
        >
          <span
            className="w-3 h-3 rounded-full shrink-0 border border-zinc-600"
            style={{ backgroundColor: cat.color }}
          />
          <span className="text-sm text-gradient font-semibold">{cat.label}</span>
          <span className="text-xs text-meta font-mono">
            {formatNumber(cat.value)}
          </span>
          <span className="text-xs text-meta font-mono">
            ({cat.dots} dots)
          </span>
        </div>
      ))}
    </div>
  );
}
