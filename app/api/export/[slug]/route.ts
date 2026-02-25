// app/api/export/[slug]/route.ts
import { prisma } from "@/lib/db";
import {
  generateGridSpec,
  formatDotLabel,
  formatNumber,
  getDynamicSubtitle,
  type CardConfig,
  type SnapshotPayload,
} from "@/lib/grid";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const url = new URL(request.url);

  const card = await prisma.card.findUnique({
    where: { slug },
    include: {
      dataset: true,
      snapshot: true,
    },
  });

  if (!card || !card.snapshot) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  const config = card.config as unknown as CardConfig;
  const payload = card.snapshot.payload as unknown as SnapshotPayload;
  const spec = generateGridSpec(payload, config, "page");

  // SVG layout (Scaled up for "big" look)
  const dotSize = spec.cols > 40 ? 10 : 18;
  const gap = spec.cols > 40 ? 2 : 4;
  const cellSize = dotSize + gap;
  const padding = 60;
  const titleHeight = 100;

  const gridWidth = spec.cols * cellSize;
  const gridHeight = spec.rows * cellSize;

  const dynSubtitle = getDynamicSubtitle(card, payload);
  const estimatedTitleWidth = card.title.length * 18; // Approx width for font-size 34
  const estimatedSubtitleWidth = dynSubtitle ? dynSubtitle.length * 10 : 0; // Approx for font-size 18

  // Ensure the SVG is at least wide enough for the grid, title, and a minimum of 800px
  const contentWidth = Math.max(gridWidth, estimatedTitleWidth, estimatedSubtitleWidth, 800);
  const svgWidth = contentWidth + padding * 2;
  const centerX = svgWidth / 2;

  const gridY = padding + titleHeight;
  const gridX = centerX - (gridWidth / 2);

  const bgColor = "#ffffff";
  const titleColor = "#18181b";
  const subtitleColor = "#52525b";
  const emptyCellColor = "#f1f5f9";
  const legendTextColor = "#52525b";
  const footerTextColor = "#a1a1aa";

  // Pre-calculate legend layout to determine SVG height and center it
  const legendParts: string[] = [];
  const legendRows: { items: any[], width: number }[] = [];
  let currentRow = { items: [] as any[], width: 0 };

  for (const cat of spec.legend) {
    const itemWidth = cat.label.length * 8 + formatNumber(cat.value).length * 9 + 45;

    if (currentRow.width + itemWidth > contentWidth && currentRow.items.length > 0) {
      legendRows.push(currentRow);
      currentRow = { items: [], width: 0 };
    }

    currentRow.items.push({ ...cat, itemWidth });
    currentRow.width += itemWidth;
  }
  if (currentRow.items.length > 0) {
    legendRows.push(currentRow);
  }

  let legendY = gridY + gridHeight + 40;
  for (const row of legendRows) {
    let currentX = centerX - (row.width / 2);
    for (const item of row.items) {
      legendParts.push(
        `<rect x="${currentX}" y="${legendY}" width="14" height="14" rx="3" fill="${item.color}" />`
      );
      legendParts.push(
        `<text x="${currentX + 22}" y="${legendY + 12}" fill="${legendTextColor}" font-size="15" font-family="system-ui, sans-serif">${escapeXml(item.label)} (${formatNumber(item.value)})</text>`
      );
      currentX += item.itemWidth;
    }
    legendY += 32;
  }

  // Footer layout
  const footerY = legendY + 50;
  const svgHeight = footerY + 60; // 60px padding at the bottom

  // Build SVG string
  const svgParts: string[] = [];

  svgParts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">`
  );

  // Background
  svgParts.push(
    `<rect width="${svgWidth}" height="${svgHeight}" fill="${bgColor}" rx="24" />`
  );

  // Title (Centered)
  svgParts.push(
    `<text x="${centerX}" y="${padding + 34}" fill="${titleColor}" font-size="34" font-weight="800" font-family="system-ui, sans-serif" text-anchor="middle" letter-spacing="-0.02em">${escapeXml(card.title)}</text>`
  );

  // Subtitle (Centered)
  if (dynSubtitle) {
    svgParts.push(
      `<text x="${centerX}" y="${padding + 66}" fill="${subtitleColor}" font-size="18" font-family="system-ui, sans-serif" text-anchor="middle">${escapeXml(dynSubtitle)}</text>`
    );
  }

  // Grid cells (Centered horizontally)
  for (const cell of spec.cells) {
    const x = gridX + cell.col * cellSize;
    const y = gridY + cell.row * cellSize;
    svgParts.push(
      `<rect x="${x}" y="${y}" width="${dotSize}" height="${dotSize}" rx="${Math.max(2, dotSize / 4)}" fill="${cell.color ?? emptyCellColor}" opacity="${cell.categoryKey ? 1 : 0.2}" />`
    );
  }

  // Add the pre-calculated legend
  svgParts.push(...legendParts);

  // Dot label and grid size (Left-aligned to content width)
  const footerLeftX = centerX - (contentWidth / 2);
  const footerRightX = centerX + (contentWidth / 2);

  svgParts.push(
    `<text x="${footerLeftX}" y="${footerY}" fill="${footerTextColor}" font-size="14" font-family="monospace">${escapeXml(formatDotLabel(payload.dotValue, payload.unitLabel))} · ${spec.rows}×${spec.cols} grid (${spec.totalCells.toLocaleString()} cells)</text>`
  );

  // Total string (Left-aligned)
  svgParts.push(
    `<text x="${footerLeftX}" y="${footerY + 30}" fill="${titleColor}" font-size="20" font-weight="700" font-family="system-ui, sans-serif">Total: ${escapeXml(formatNumber(payload.total))} ${escapeXml(payload.unitLabel)}</text>`
  );

  // Source URL (Right-aligned)
  svgParts.push(
    `<text x="${footerRightX}" y="${footerY + 30}" fill="${subtitleColor}" font-size="16" font-family="system-ui, sans-serif" text-anchor="end">scalecards.dev/v/${slug}</text>`
  );

  svgParts.push("</svg>");

  const svg = svgParts.join("\n");

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Content-Disposition": `attachment; filename="${slug}.svg"`,
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
