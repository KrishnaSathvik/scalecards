// app/api/og/[slug]/route.tsx
import { ImageResponse } from "next/og";
import { prisma } from "@/lib/db";
import {
  generateGridSpec,
  formatDotLabel,
  formatNumber,
  getDynamicSubtitle,
  type CardConfig,
  type SnapshotPayload,
} from "@/lib/grid";

// Use Node.js runtime (default) since Prisma Client doesn't support edge without Accelerate

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const url = new URL(_request.url);
  const isDownload = url.searchParams.get("download") === "true";
  const theme = url.searchParams.get("theme") || "dark";
  const isDark = theme !== "light";

  // Note: In edge runtime, you'd typically use a lighter DB client
  // or fetch from an API endpoint. For MVP, this works with Prisma edge.
  // Alternative: use fetch() to hit your own API route.

  const card = await prisma.card.findUnique({
    where: { slug },
    include: {
      dataset: true,
      snapshot: true,
    },
  });

  if (!card || !card.snapshot) {
    return new Response("Card not found", { status: 404 });
  }

  const config = card.config as unknown as CardConfig;
  const payload = card.snapshot.payload as unknown as SnapshotPayload;

  // Use OG grid size (smaller, bigger dots)
  const ogConfig: CardConfig = {
    ...config,
    grid: config.ogGrid ?? { rows: 20, cols: 25 },
  };

  const spec = generateGridSpec(payload, ogConfig, "og");

  // OG images are 1200x630
  const dotSize = Math.min(
    Math.floor(700 / spec.cols),
    Math.floor(400 / spec.rows),
    18 // Max dot size
  );
  const gap = Math.max(2, Math.floor(dotSize * 0.2));
  const cellSize = dotSize + gap;
  const gridWidth = spec.cols * cellSize;
  const gridHeight = spec.rows * cellSize;

  const bgColor = isDark ? "#0a0a14" : "#ffffff";
  const titleColor = isDark ? "#f4f4f5" : "#18181b";
  const subtitleColor = isDark ? "#71717a" : "#52525b";
  const emptyCellColor = isDark ? "#1a1a2e" : "#f1f5f9";
  const legendTextColor = isDark ? "#a1a1aa" : "#52525b";
  const footerTextColor = isDark ? "#3f3f46" : "#a1a1aa";

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: bgColor,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 56px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Title area (Centered) */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
          <div
            style={{
              fontSize: 48,
              fontWeight: 800,
              color: titleColor,
              lineHeight: 1.2,
              textAlign: "center",
              letterSpacing: "-0.02em",
              maxWidth: 1000,
            }}
          >
            {card.title}
          </div>
          {getDynamicSubtitle(card, payload) && (
            <div
              style={{
                fontSize: 24,
                color: subtitleColor,
                textAlign: "center",
                marginTop: 12,
                maxWidth: 900,
              }}
            >
              {getDynamicSubtitle(card, payload)}
            </div>
          )}
        </div>

        {/* Grid area (Centered) */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            width: gridWidth + gap * spec.cols,
            gap: gap,
          }}
        >
          {spec.cells.map((cell) => (
            <div
              key={cell.idx}
              style={{
                width: dotSize,
                height: dotSize,
                borderRadius: Math.max(2, dotSize / 4),
                backgroundColor: cell.color ?? emptyCellColor,
                opacity: cell.categoryKey ? 1 : 0.2,
              }}
            />
          ))}
        </div>

        {/* Legend row (Centered) */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 24,
            marginTop: 32,
            flexWrap: "wrap",
            maxWidth: 1000,
          }}
        >
          {spec.legend.map((cat) => (
            <div
              key={cat.key}
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 3,
                  backgroundColor: cat.color,
                }}
              />
              <span style={{ fontSize: 16, color: legendTextColor }}>
                {cat.label} ({formatNumber(cat.value)})
              </span>
            </div>
          ))}
        </div>

        {/* Footer info (Spread apart) */}
        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginTop: "auto",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontSize: 16, color: footerTextColor, fontFamily: "monospace" }}>
              {`Each dot ~ ${formatNumber(payload.dotValue)} ${payload.unitLabel} · ${spec.rows}×${spec.cols} grid (${spec.totalCells.toLocaleString()} cells)`}
            </span>
            <span style={{ fontSize: 24, fontWeight: 700, color: titleColor }}>
              {`Total: ${formatNumber(payload.total)} ${payload.unitLabel}`}
            </span>
          </div>

          <div style={{ fontSize: 18, color: subtitleColor }}>
            {`scalecards.dev/v/${slug}`}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: isDownload
        ? {
          "Content-Disposition": `attachment; filename="${slug}-preview.png"`,
        }
        : undefined,
    }
  );
}
