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

  // Fork logic based on isDownload
  let spec;
  let imgWidth = 1200;
  let imgHeight = 630;
  let dotSize: number;
  let gap: number;

  if (isDownload) {
    // 1. DYNAMIC SVG-LIKE LAYOUT FOR DOWNLOAD
    spec = generateGridSpec(payload, config, "page");

    dotSize = spec.cols > 40 ? 10 : 18;
    gap = spec.cols > 40 ? 2 : 4;
    const cellSize = dotSize + gap;
    const padding = 60;
    const titleHeight = 100;

    const gridWidth = spec.cols * cellSize;

    // Estimate widths to ensure everything fits comfortably
    const dynSubtitle = getDynamicSubtitle(card, payload);
    const estimatedTitleWidth = card.title.length * 18;
    const estimatedSubtitleWidth = dynSubtitle ? dynSubtitle.length * 10 : 0;
    const contentWidth = Math.max(gridWidth, estimatedTitleWidth, estimatedSubtitleWidth, 800);

    imgWidth = contentWidth + padding * 2;

    // Calculate legend height (rough estimate based on wrapping)
    let legendRowsCount = 1;
    let currentRowWidth = 0;
    for (const cat of spec.legend) {
      const itemWidth = cat.label.length * 8 + formatNumber(cat.value).length * 9 + 45;
      if (currentRowWidth + itemWidth > contentWidth && currentRowWidth > 0) {
        legendRowsCount++;
        currentRowWidth = itemWidth;
      } else {
        currentRowWidth += itemWidth;
      }
    }

    const gridHeight = spec.rows * cellSize;
    // Padding Top + Title Area + Grid + Legend Area + Footer + Padding Bottom
    imgHeight = padding + titleHeight + gridHeight + 40 + (legendRowsCount * 32) + 50 + 60;
  } else {
    // 2. FIXED LAYOUT FOR SOCIAL MEDIA PREVIEWS (OG)
    const ogConfig: CardConfig = {
      ...config,
      grid: config.ogGrid ?? { rows: 20, cols: 25 },
    };
    spec = generateGridSpec(payload, ogConfig, "og");

    dotSize = Math.min(
      Math.floor(700 / spec.cols),
      Math.floor(400 / spec.rows),
      18
    );
    gap = Math.max(2, Math.floor(dotSize * 0.2));
  }

  const bgColor = "#ffffff";
  const titleColor = "#18181b";
  const subtitleColor = "#52525b";
  const emptyCellColor = "#f1f5f9";
  const legendTextColor = "#52525b";
  const footerTextColor = "#a1a1aa";

  return new ImageResponse(
    (
      <div
        style={{
          width: imgWidth,
          height: imgHeight,
          background: bgColor,
          borderRadius: isDownload ? 24 : 0, // Match SVG rounded corners
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: isDownload ? "flex-start" : "center",
          padding: isDownload ? "60px 0" : "48px 56px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Title area (Centered) */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: isDownload ? 60 : 32 }}>
          <div
            style={{
              fontSize: isDownload ? 34 : 48,
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
                fontSize: isDownload ? 18 : 24,
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
            justifyContent: "flex-start",
            width: spec.cols * (dotSize + gap),
            height: spec.rows * (dotSize + gap),
            alignContent: "flex-start",
          }}
        >
          {spec.cells.map((cell) => (
            <div
              key={cell.idx}
              style={{
                width: dotSize,
                height: dotSize,
                marginRight: gap,
                marginBottom: gap,
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
            marginTop: isDownload ? 40 : 32,
            marginBottom: isDownload ? 50 : 0,
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
              <span style={{ fontSize: isDownload ? 15 : 16, color: legendTextColor }}>
                {cat.label} ({formatNumber(cat.value)})
              </span>
            </div>
          ))}
        </div>

        {/* Footer info (Spread apart) */}
        <div
          style={{
            display: "flex",
            width: isDownload ? imgWidth - 120 : "100%", // Account for 60px padding
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginTop: "auto",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontSize: isDownload ? 14 : 16, color: footerTextColor, fontFamily: "monospace" }}>
              {isDownload
                ? `${formatDotLabel(payload.dotValue, payload.unitLabel)} · ${spec.rows}×${spec.cols} grid (${spec.totalCells.toLocaleString()} cells)`
                : `Each dot ~ ${formatNumber(payload.dotValue)} ${payload.unitLabel} · ${spec.rows}×${spec.cols} grid (${spec.totalCells.toLocaleString()} cells)`}
            </span>
            <span style={{ fontSize: isDownload ? 20 : 24, fontWeight: 700, color: titleColor }}>
              {`Total: ${formatNumber(payload.total)} ${payload.unitLabel}`}
            </span>
          </div>

          <div style={{ fontSize: isDownload ? 16 : 18, color: subtitleColor }}>
            {`scalecards.vercel.app/v/${slug}`}
          </div>
        </div>
      </div>
    ),
    {
      width: imgWidth,
      height: imgHeight,
      headers: isDownload
        ? {
          "Content-Disposition": `attachment; filename="${slug}-preview.png"`,
        }
        : undefined,
    }
  );
}
