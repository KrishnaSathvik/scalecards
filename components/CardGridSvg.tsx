// components/CardGridSvg.tsx
"use client";

import { useState, useRef, useEffect } from "react";
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

  // Close tooltip if tapping outside on mobile
  // Uses React useEffect (so must be imported if missing, let's assume it is or will add)

  useEffect(() => {
    function handleTouchOutside(e: TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setTooltip({ visible: false, x: 0, y: 0, cell: null, category: null });
        setHoveredCategory(null);
      }
    }
    document.addEventListener("touchstart", handleTouchOutside);
    return () => document.removeEventListener("touchstart", handleTouchOutside);
  }, []);

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
    // Disable tooltips for the first two rows (index 0 and 1) to prevent them 
    // from being cut off or obscured at the top of the card container.
    if (!interactive || !cell.categoryKey || cell.row < 2) return;

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

    let tooltipX = cellScreenX - containerRect.left;
    const tooltipY = cellScreenY - containerRect.top - 8;

    // Prevent tooltip from overflowing edges on mobile
    const estimatedTooltipWidth = 140;
    const minX = estimatedTooltipWidth / 2 + 10;
    const maxX = containerRect.width - estimatedTooltipWidth / 2 - 10;

    if (tooltipX < minX) tooltipX = minX;
    if (tooltipX > maxX) tooltipX = maxX;

    setTooltip({
      visible: true,
      x: tooltipX,
      y: tooltipY,
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
    <div
      className="overflow-x-auto relative"
      ref={containerRef}
      style={{
        // Prevent pan/zoom on mobile while touching the grid area
        touchAction: interactive ? "none" : "auto",
        WebkitUserSelect: "none",
        userSelect: "none"
      }}
    >
      <svg
        width="100%"
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="max-w-full"
        role="img"
        aria-label={`Grid visualization showing ${spec.legend
          .map((l) => `${l.label}: ${l.dots} dots`)
          .join(", ")}`}
        style={{
          // Prevent default touch behaviors on the SVG itself
          touchAction: "none"
        }}
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
                // Remove tap highlight on mobile
                WebkitTapHighlightColor: "transparent",
                ...(isHoveredCategory
                  ? { filter: "brightness(1.2)" }
                  : {}),
              }}
              // Handle both mouse hover and mobile tap
              onMouseEnter={(e) => handleMouseEnter(cell, e as unknown as React.MouseEvent<SVGRectElement>)}
              onTouchStart={(e) => {
                // Prevent default scrolling when touching a dot
                e.preventDefault();
                handleMouseEnter(cell, e as unknown as React.MouseEvent<SVGRectElement>);
              }}
              onMouseLeave={handleMouseLeave}
            // Don't clear on touch end, let them tap elsewhere to dismiss
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
          {/* Color + Label */}
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: tooltip.category.color }}
            />
            <span className="font-semibold text-sm text-foreground">
              {tooltip.category.label}
            </span>
          </div>

          {/* Unit Value + Percentage */}
          <div className="text-xs text-muted-foreground font-mono">
            {formatNumber(tooltip.category.value)} {spec.meta.unitLabel}
            <span className="opacity-70 ml-1">
              ({((tooltip.category.value / spec.meta.total) * 100).toFixed(1)}%)
            </span>
          </div>

          {/* Enhanced Dot Count */}
          <div className="text-xs text-muted-foreground font-mono opacity-70 mt-1 pt-1 border-t border-border/50">
            {tooltip.category.dots} of {spec.totalCells} dots
          </div>

          {/* Scale Reference */}
          <div className="text-[10px] text-muted-foreground/60 font-mono mt-0.5">
            1 dot ≈ {formatNumber(spec.meta.dotValue)} {spec.meta.unitLabel}
          </div>
        </div>
      )}
    </div>
  );
}
