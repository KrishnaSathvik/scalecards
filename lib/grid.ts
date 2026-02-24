// lib/grid.ts
// Core grid math — shared by SVG renderer + OG renderer

export type GridCategory = {
  key: string;
  label: string;
  value: number;
  dots: number;
  color: string;
};

export type GridCell = {
  idx: number;
  row: number;
  col: number;
  categoryKey: string | null;
  color: string | null;
};

export type GridSpec = {
  rows: number;
  cols: number;
  totalCells: number;
  cells: GridCell[];
  legend: GridCategory[];
  meta: {
    dotValue: number;
    total: number;
    unitLabel: string;
    notes?: string;
  };
};

export type RenderMode = "page" | "og";

export type SnapshotPayload = {
  unitLabel: string;
  dotValue: number;
  total: number;
  categories: Array<{
    key: string;
    label: string;
    value: number;
  }>;
  notes?: string;
};

export type CardConfig = {
  grid: { rows: number; cols: number };
  ogGrid?: { rows: number; cols: number };
  palette: Record<string, string>;
  showLegend: boolean;
  emptyColor?: string;
};

const DEFAULT_EMPTY_COLOR = "#1a1a2e";

/**
 * Generate a deterministic grid spec from snapshot data + card config.
 * Same inputs always produce the same visual.
 */
export function generateGridSpec(
  payload: SnapshotPayload,
  config: CardConfig,
  mode: RenderMode = "page"
): GridSpec {
  const gridSize =
    mode === "og" && config.ogGrid ? config.ogGrid : config.grid;
  const { rows, cols } = gridSize;
  const totalCells = rows * cols;
  const emptyColor = config.emptyColor ?? DEFAULT_EMPTY_COLOR;

  // Compute dots per category proportionally
  const rawDots = payload.categories.map((cat) => ({
    ...cat,
    rawDots: cat.value / payload.dotValue,
  }));

  // Use largest remainder method for fair rounding
  const floored = rawDots.map((d) => ({
    ...d,
    dots: Math.floor(d.rawDots),
    remainder: d.rawDots - Math.floor(d.rawDots),
  }));

  let allocated = floored.reduce((sum, d) => sum + d.dots, 0);
  const remaining = Math.min(totalCells, Math.round(payload.total / payload.dotValue)) - allocated;

  // Distribute remaining dots by largest remainder
  const sorted = [...floored].sort((a, b) => b.remainder - a.remainder);
  for (let i = 0; i < remaining && i < sorted.length; i++) {
    sorted[i].dots += 1;
  }

  // Build legend with colors
  const legend: GridCategory[] = floored.map((d) => ({
    key: d.key,
    label: d.label,
    value: d.value,
    dots: d.dots,
    color: config.palette[d.key] ?? "#888",
  }));

  // Fill cells row-major, deterministic
  const cells: GridCell[] = [];
  let cellIdx = 0;
  let catIdx = 0;
  let catDotsPlaced = 0;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Advance to next category if current is fully placed
      while (catIdx < legend.length && catDotsPlaced >= legend[catIdx].dots) {
        catIdx++;
        catDotsPlaced = 0;
      }

      if (catIdx < legend.length) {
        cells.push({
          idx: cellIdx,
          row,
          col,
          categoryKey: legend[catIdx].key,
          color: legend[catIdx].color,
        });
        catDotsPlaced++;
      } else {
        // Empty cell
        cells.push({
          idx: cellIdx,
          row,
          col,
          categoryKey: null,
          color: emptyColor,
        });
      }

      cellIdx++;
    }
  }

  return {
    rows,
    cols,
    totalCells,
    cells,
    legend,
    meta: {
      dotValue: payload.dotValue,
      total: payload.total,
      unitLabel: payload.unitLabel,
      notes: payload.notes,
    },
  };
}

/**
 * Format large numbers for display
 */
export function formatNumber(n: number): string {
  if (n >= 1_000_000_000_000) return `${(n / 1_000_000_000_000).toFixed(1)}T`;
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

/**
 * Format dot value for legend: "Each dot = 10M people"
 */
export function formatDotLabel(dotValue: number, unitLabel: string): string {
  return `Each dot ≈ ${formatNumber(dotValue)} ${unitLabel}`;
}

/**
 * Generate a dynamic subtitle based on the card slug and real-time snapshot payload.
 * Fallback to the database subtitle if no dynamic template exists.
 */
export function getDynamicSubtitle(
  card: { slug: string; subtitle: string | null },
  payload: SnapshotPayload
): string {
  const formatValue = (num: number) => {
    if (num >= 1_000_000_000_000) return `${(num / 1_000_000_000_000).toFixed(1)}T`;
    if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    return num.toLocaleString();
  };

  switch (card.slug) {
    case "us-national-debt-live":
      return `Over $${payload.total.toFixed(1)} Trillion. Exact to the penny. Updates daily.`;
    case "ethereum-live":
      return `Live price $${payload.total.toLocaleString()}. Auto-refreshes hourly.`;
    case "bitcoin-live":
      return `Live price $${payload.total.toLocaleString()}. Auto-refreshes hourly.`;
    case "flights-right-now":
      return `Every dot is 100 airplanes. ${payload.total.toLocaleString()} currently flying anywhere on Earth.`;
    case "earthquakes-today":
      return `${payload.total.toLocaleString()} earthquakes in the last 24h. Live seismic activity.`;
    case "asteroids-today":
      return `${payload.total.toLocaleString()} space rocks making a close approach right now.`;
    case "humanity-growth-today":
      return `Net growth of ${payload.total.toLocaleString()} human lives today. Each dot is 1,000.`;
    case "wikipedia-today":
      return `~${formatValue(payload.total)} daily pageviews on English Wikipedia alone.`;
    case "satellites-above":
      return `${payload.total.toLocaleString()} active satellites. Starlink alone: ${payload.categories.find(c => c.key === "starlink")?.value?.toLocaleString() ?? "6,400"}.`;
    case "cyber-threats":
      return `~${formatValue(payload.total * 1000)} cyberattacks detected today. Malware, phishing, and DDoS.`;
    case "warming-world":
      return `+${payload.total}°C above the pre-industrial baseline. 2024 was the hottest year on record.`;
    case "disappearing-forests":
      return `${payload.categories.find(c => c.key === "loss")?.value ?? 10}M hectares lost per year. Only ${payload.categories.find(c => c.key === "gain")?.value ?? 5}M regrown.`;
    case "plastic-ocean":
      return `${payload.total}M tonnes of plastic per year. Only ~1% is ever recovered.`;
    case "trillion-club":
      return `$${payload.total}T combined. These ${payload.categories.length} companies are worth more than most countries' GDP.`;
    case "market-mood":
      return `${payload.categories.find(c => c.key === "up")?.value ?? 280} up, ${payload.categories.find(c => c.key === "down")?.value ?? 200} down, ${payload.categories.find(c => c.key === "flat")?.value ?? 20} flat.`;
    case "wasted-food":
      return `${payload.total}B tonnes produced annually. ~1/3 is lost or wasted before it's eaten.`;
    case "poverty-line":
      return `${formatValue(payload.categories.find(c => c.key === "extreme")?.value ?? 700_000_000)} in extreme poverty. Down from 1.9B in 2000.`;
    case "water-world":
      return `Agriculture uses 70% of all freshwater. 2 billion people live in water-stressed areas.`;
    default:
      return card.subtitle ?? "";
  }
}

