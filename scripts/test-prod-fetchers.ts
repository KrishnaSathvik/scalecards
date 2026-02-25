import { PrismaClient } from "@prisma/client";
import { fetchDataset, hasFetcher } from "../lib/datasets/registry";

const prisma = new PrismaClient();

async function main() {
    console.log("Checking production datasets...");
    const datasets = await prisma.dataset.findMany({
        where: { refreshRate: { in: ["hourly", "daily", "weekly"] } },
    });

    console.log(`Found ${datasets.length} datasets to refresh.`);
    let success = 0;
    let skipped = 0;
    let errors = 0;

    for (const ds of datasets) {
        if (!hasFetcher(ds.slug)) {
            skipped++;
            continue;
        }
        try {
            console.log(`[${ds.slug}] Fetching...`);
            const data = await fetchDataset(ds.slug);
            console.log(`  -> Success. Total: ${data.total}`);
            success++;
        } catch (e) {
            console.error(`  -> ERROR for ${ds.slug}:`, e);
            errors++;
        }
        // Rate limiting pause
        await new Promise(r => setTimeout(r, 1000));
    }

    console.log(`\nResults: ${success} successful, ${errors} failed, ${skipped} skipped (no fetcher).`);
    process.exit(errors > 0 ? 1 : 0);
}

main().catch(console.error);
