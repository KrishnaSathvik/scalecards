// components/CardGridSvg.tsx
"use client";

import { useState, useRef } from "react";
import type { GridSpec, GridCell } from "@/lib/grid";
import { formatNumber } from "@/lib/grid";

type Props = {
  spec: GridSpec;
  dotSize?: number;
  gap?: number;
  rounded?: number;
  interactive?: boolean;
};

type TooltipState = {
  visible: boolean;
  x: number;
  y: number;
  cell: GridCell | null;
  category: { label: string; value: number; dots: number; color: string } | null;
};

/**
 * Full SVG renderer for card pages and SVG export.
 * Now with interactive tooltips on hover.
 */
export default function CardGridSvg({
  spec,
  dotSize: dotSizeOverride,
  gap: gapOverride,
  rounded = 2,
  interactive = true,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    cell: null,
    category: null,
  });
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Auto-size dots based on grid dimensions
  const maxWidth = 800;
  const autoGap = spec.cols > 30 ? 1 : 2;
  const gap = gapOverride ?? autoGap;
  const autoDotSize = Math.max(
    2,
    Math.floor((maxWidth - spec.cols * gap) / spec.cols)
  );
  const dotSize = dotSizeOverride ?? Math.min(autoDotSize, 14);

  const cellSize = dotSize + gap;
  const svgWidth = spec.cols * cellSize;
  const svgHeight = spec.rows * cellSize;

  const handleMouseEnter = (cell: GridCell, event: React.MouseEvent<SVGRectElement>) => {
    if (!interactive || !cell.categoryKey) return;

    const category = spec.legend.find((l) => l.key === cell.categoryKey);
    if (!category) return;

    const svgEl = event.currentTarget.closest("svg");
    const container = containerRef.current;
    if (!svgEl || !container) return;

    const containerRect = container.getBoundingClientRect();
    const svgRect = svgEl.getBoundingClientRect();

    // Calculate the position of the cell in screen coordinates
    const scaleX = svgRect.width / svgWidth;
    const scaleY = svgRect.height / svgHeight;
    const cellScreenX = svgRect.left + cell.col * cellSize * scaleX + (dotSize * scaleX) / 2;
    const cellScreenY = svgRect.top + cell.row * cellSize * scaleY;

    setTooltip({
      visible: true,
      x: cellScreenX - containerRect.left,
      y: cellScreenY - containerRect.top - 8,
      cell,
      category: {
        label: category.label,
        value: category.value,
        dots: category.dots,
        color: category.color,
      },
    });
    setHoveredCategory(cell.categoryKey);
  };

  const handleMouseLeave = () => {
    if (!interactive) return;
    setTooltip({ visible: false, x: 0, y: 0, cell: null, category: null });
    setHoveredCategory(null);
  };

  return (
    <div className="overflow-x-auto relative" ref={containerRef}>
      <svg
        width="100%"
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="max-w-full"
        role="img"
        aria-label={`Grid visualization showing ${spec.legend
          .map((l) => `${l.label}: ${l.dots} dots`)
          .join(", ")}`}
      >
        {spec.cells.map((cell) => {
          const isHoveredCategory = hoveredCategory && cell.categoryKey === hoveredCategory;
          const isDimmed = hoveredCategory && cell.categoryKey !== hoveredCategory && cell.categoryKey !== null;

          return (
            <rect
              key={cell.idx}
              x={cell.col * cellSize}
              y={cell.row * cellSize}
              width={dotSize}
              height={dotSize}
              rx={rounded}
              fill={cell.color ?? (typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? "#1a1a2e" : "#f1f5f9")}
              opacity={
                cell.categoryKey
                  ? isDimmed
                    ? 0.3
                    : 1
                  : 0.2
              }
              className={interactive && cell.categoryKey ? "cursor-pointer" : ""}
              style={{
                transition: "opacity 0.2s ease, transform 0.15s ease",
                ...(isHoveredCategory
                  ? { filter: "brightness(1.2)" }
                  : {}),
              }}
              onMouseEnter={(e) => handleMouseEnter(cell, e)}
              onMouseLeave={handleMouseLeave}
            />
          );
        })}
      </svg>

      {/* Tooltip */}
      {interactive && tooltip.visible && tooltip.category && (
        <div
          className="dot-tooltip"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: tooltip.category.color }}
            />
            <span className="font-semibold text-sm text-foreground">
              {tooltip.category.label}
            </span>
          </div>
          <div className="text-xs text-muted-foreground font-mono">
            {formatNumber(tooltip.category.value)} {spec.meta.unitLabel}
          </div>
          <div className="text-xs text-muted-foreground font-mono opacity-70">
            {tooltip.category.dots} dots
          </div>
        </div>
      )}
    </div>
  );
}
